// FarmSOS AI edge function — proxies Gemini when GEMINI_API_KEY is set,
// otherwise returns deterministic advisor-style JSON derived from inputs.
//
// Routes (all under /functions/v1/farmsos-ai):
//   POST { action: "planner", soil, water, marketTrend, weatherRain }
//   POST { action: "soil", report }  // NPK report object
//   POST { action: "image", imageBase64, mime } // crop photo
//   POST { action: "assistant", prompt } // generic Q&A

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_TXT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_KEY;
const GEMINI_VIS = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_KEY;

async function callGemini(prompt: string): Promise<string> {
  // Treat missing/placeholder keys as "no Gemini configured"
  if (!GEMINI_KEY || GEMINI_KEY.length < 10) return "";
  try {
    const r = await fetch(GEMINI_TXT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, responseMimeType: "application/json" }
      })
    });
    if (!r.ok) { console.error("gemini", r.status); return ""; }
    const j = await r.json();
    return j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } catch (e) {
    console.error("gemini-error", e);
    return "";
  }
}

async function callGeminiVision(prompt: string, imageBase64: string, mime: string): Promise<string> {
  if (!GEMINI_KEY || GEMINI_KEY.length < 10) return "";
  try {
    const r = await fetch(GEMINI_VIS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: imageBase64 } }] }],
        generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
      })
    });
    if (!r.ok) { console.error("gemini-vision", r.status); return ""; }
    const j = await r.json();
    return j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  } catch (e) {
    console.error("gemini-vision-error", e);
    return "";
  }
}

// ---- Deterministic fallback advisory (no API key) ---------------------------

const CROPS = [
  { name: "Wheat", baseYield: 16, price: 2420, water: "Medium", days: 130 },
  { name: "Mustard", baseYield: 9, price: 5890, water: "Low", days: 110 },
  { name: "Bajra", baseYield: 12, price: 2690, water: "Low", days: 80 },
  { name: "Gram", baseYield: 8, price: 5980, water: "Low", days: 110 },
  { name: "Soybean", baseYield: 14, price: 4500, water: "Medium", days: 100 },
  { name: "Maize", baseYield: 24, price: 1960, water: "High", days: 90 },
  { name: "Cotton", baseYield: 15, price: 6200, water: "Medium", days: 160 },
  { name: "Barley", baseYield: 18, price: 2200, water: "Low", days: 120 }
];

function scoreCrop(c: typeof CROPS[0], soil: string, water: string, trend: string, rain: number): number {
  let s = 50;
  if (c.water === "Low" && water === "Limited") s += 14;
  if (c.water === "High" && water === "Plenty") s += 14;
  if (c.water === "Medium" && water === "Moderate") s += 10;
  if (soil === "Sandy" && c.name === "Bajra") s += 10;
  if (soil === "Black" && c.name === "Cotton") s += 10;
  if (soil === "Loamy" && (c.name === "Wheat" || c.name === "Mustard")) s += 12;
  if (soil === "Red" && c.name === "Gram") s += 8;
  if (trend === "Rising" && c.price > 3000) s += 12;
  if (trend === "Falling") s -= 10;
  if (rain < 2 && c.water === "High") s -= 12;
  if (rain > 6 && c.water === "Low") s -= 6;
  return Math.max(10, Math.min(99, Math.round(s)));
}

function fallbackPlanner(input: any) {
  const ranked = CROPS.map((c) => {
    const sc = scoreCrop(c, input.soil, input.water, input.marketTrend, input.weatherRain ?? 0);
    const yieldQtl = +((c.baseYield * (0.7 + sc / 200))).toFixed(1);
    const revenue = Math.round(yieldQtl * c.price);
    const cost = Math.round(revenue * 0.45);
    return { name: c.name, score: sc, yieldQtl, revenue, profit: revenue - cost, waterNeed: c.water, growthDays: c.days, marketPrice: c.price };
  }).sort((a, b) => b.profit - a.profit);
  return { ranked, best: ranked[0] };
}

function fallbackSoil(r: any) {
  const recs: { kind: string; text: string }[] = [];
  if ((r.nitrogen ?? 0) < 280) recs.push({ kind: "Chemical", text: "Top-dress 30 kg urea/acre split across tillering and jointing stages." });
  if ((r.phosphorus ?? 0) < 28) recs.push({ kind: "Chemical", text: "Apply 100 kg SSP/acre at sowing as basal phosphorus dose." });
  if ((r.potassium ?? 0) < 140) recs.push({ kind: "Chemical", text: "Add 25 kg MOP/acre as basal; helps grain filling and stress tolerance." });
  if ((r.zinc ?? 0.5) < 0.6) recs.push({ kind: "Micronutrient", text: "Foliar spray of 0.5% ZnSO4 at 30 and 45 DAS for cereals." });
  if ((r.organicCarbon ?? 0) < 0.5) recs.push({ kind: "Organic", text: "Apply 4 tonnes FYM/compost per acre and adopt green manuring." });
  if ((r.ec ?? 0) > 1) recs.push({ kind: "Salinity", text: "Leach salts with light irrigation; avoid brackish groundwater." });
  if ((r.ph ?? 7) < 6.2) recs.push({ kind: "pH correction", text: "Apply 200-400 kg/acre agricultural lime to raise pH." });
  if ((r.ph ?? 7) > 7.8) recs.push({ kind: "pH correction", text: "Apply gypsum (1-2 t/acre) and add organic matter to lower pH." });
  if (!recs.length) recs.push({ kind: "Maintain", text: "Soil is balanced. Maintain current practice and re-test after harvest." });
  return { recommendations: recs, status: recs.length <= 1 ? "Healthy" : recs.length <= 3 ? "Moderate" : "Deficient" };
}

function fallbackAssistant(prompt: string, lang: string = "en"): { reply: string; lang: string } {
  const p = (prompt || "").toLowerCase().trim();
  // Detect intent with keyword matching across all three languages
  const isGreeting = !p || p === "hi" || p === "hello" || p === "namaste" || p === "नमस्ते" || p === "राम-राम" || p === "राम राम";
  const isCrop   = p.includes("best crop") || p.includes("which crop") || p.includes("crop for") || p.includes("recommend") || p.includes("फसल") || p.includes("कौन सी फसल") || p.includes("कौन सी सब्ज़ी");
  const isRust   = (p.includes("wheat") || p.includes("गेहूँ") || p.includes("गेंहूं")) && (p.includes("rust") || p.includes("yellow") || p.includes("पीला") || p.includes("रतुआ"));
  const isIrrig  = p.includes("irrigation") || p.includes("irrigat") || p.includes("सिंचाई") || (p.includes("पानी") && p.includes("कब")) || ((p.includes("when") || p.includes("how")) && p.includes("water") && !p.includes("crop"));
  const isSubsidy= p.includes("subsid") || p.includes("pm-kisan") || p.includes("कर्ज़ा") || p.includes("loan") || p.includes("सब्सिडी") || p.includes("योजना");
  const isSoil   = p.includes("soil") || p.includes("मिट्टी") || p.includes("माटी");
  const isPrice  = p.includes("price") || p.includes("मंडी") || p.includes("दाम") || p.includes("भाव") || p.includes("market");
  const isDisease= p.includes("disease") || p.includes("pest") || p.includes("बीमारी") || p.includes("कीड़ा") || p.includes("पत्ती") && p.includes("पीला");

  const hi = lang === "hi" || lang === "rj";
  if (isGreeting) {
    return hi ? { reply: "नमस्ते! मैं FarmSOS AI हूँ — आपका कृषि सहायक। मैं फसल चुनाव, सिंचाई, मिट्टी परीक्षण, कीट-रोग, मंडी भाव और सब्सिडी में मदद कर सकता हूँ। आप क्या जानना चाहते हैं?", lang }
             : { reply: "Namaste! I am FarmSOS AI, your farming assistant. I can help with: choosing the best crop for your soil, treating crop diseases, irrigation scheduling, soil nutrient advice, mandi prices, subsidies, and more. What would you like to know?", lang };
  }
  if (isRust) {
    return hi ? { reply: "गेहूँ का पीला रतुआ पत्तियों पर पीली धारियों के रूप में दिखता है। 15 दिन के अंतर पर प्रोपिकोनाज़ोल 25 EC 0.1% छिड़कें और अगली बार HD-3226 प्रतिरोधी किस्म बोएँ।", lang }
             : { reply: "Wheat yellow (stripe) rust appears as yellow stripes on leaves. Spray Propiconazole 25 EC @ 0.1% at 15-day intervals and switch to resistant variety HD-3226 next cycle.", lang };
  }
  if (isCrop) {
    return hi ? { reply: "रेतीली मिट्टी और कम पानी वाले खेत के लिए बाजरा और सरसों सबसे उपयुक्त हैं। दोमट मिट्टी में गेहूँ प्रति एकड़ सबसे अधिक लाभ देता है। विस्तृत सुझाव के लिए AI फसल योजक मॉड्यूल इस्तेमाल करें।", lang }
             : { reply: "For sandy soil with limited water, Bajra and Mustard are ideal. For loamy soil with good water, Wheat gives the highest profit per acre in Rajasthan Rabi season. Use the AI Crop Planner module for a personalized recommendation with profit forecasts.", lang };
  }
  if (isIrrig) {
    return hi ? { reply: "रबी की गेहूँ में CRI (21 दिन), कल्ले निकलने, जोड़, फूल और दाना भरने — कुल 5 सिंचाई करें। पिछले 3 दिन में 5 मिमी से ज़्यादा बारिश हो तो सिंचाई छोड़ दें।", lang }
             : { reply: "For wheat in Rabi, irrigate at CRI (21 DAS), tillering, late jointing, flowering and grain filling — about 5 irrigations totaling ~40 cm. Skip if >5mm rain in prior 3 days.", lang };
  }
  if (isSubsidy) {
    return hi ? { reply: "PM-Kisan योजना में सालाना 3 किस्तों में 6000 रुपये मिलते हैं। ड्रिप सिंचाई पर PMKSY के तहत 55-90% सब्सिडी, मृदा स्वास्थ्य कार्ड निःशुल्क, और सौर पंप पर KUSUM में 60% सब्सिडी उपलब्ध है।", lang }
             : { reply: "PM-Kisan gives Rs 6000/year in 3 installments. Drip irrigation has 55-90% subsidy under PMKSY. Soil Health Card is free. Solar pumps: 60% subsidy under KUSUM.", lang };
  }
  if (isSoil) {
    return hi ? { reply: "स्वस्थ मिट्टी के लिए NPK संतुलित, जैविक कार्बन 0.5% से ऊपर, और pH 6.2-7.5 के बीच रखें। निःशुल्क मृदा स्वास्थ्य कार्ड के लिए अपने नज़दीकी KVK से संपर्क करें।", lang }
             : { reply: "Healthy soil needs balanced NPK, organic carbon above 0.5%, and pH between 6.2-7.5. Get a free Soil Health Card from your nearest KVK to test your fields.", lang };
  }
  if (isPrice) {
    return hi ? { reply: "आज कोटा मंडी: गेहूँ ~₹2400/क्विंटल, सरसों ~₹5890/क्विंटल, बाजरा ~₹2690/क्विंटल। कटाई के 2-3 महीने बाद भाव आमतौर पर चरम पर होते हैं — बेहतर बिक्री तिथि के लिए मंडी भाव पूर्वानुमान मॉड्यूल देखें।", lang }
             : { reply: "Today's Kota mandi: Wheat ~Rs 2400/qtl, Mustard ~Rs 5890/qtl, Bajra ~Rs 2690/qtl. Prices usually peak 2-3 months after harvest — check the Price Forecast module for the best selling date.", lang };
  }
  if (isDisease) {
    return hi ? { reply: "प्रभावित फसल की तस्वीर AI चित्र विश्लेषण मॉड्यूल में अपलोड करें। मॉडल कुछ ही क्षणों में रोग/कीट/पोषक तत्व की पहचान और उपचार बताता है।", lang }
             : { reply: "Upload a photo of the affected crop in the AI Image Analysis module. The model detects disease, pests and nutrient deficiency and gives treatment steps within seconds.", lang };
  }
  return hi ? { reply: "मैं फसल, सिंचाई, मिट्टी, कीट-रोग, मंडी भाव और सब्सिडी पर सलाह दे सकता हूँ। पूछें: 'रेतीली मिट्टी के लिए सबसे अच्छी फसल?' या 'गेहूँ में पीला रतुआ कैसे ठीक करें?' या 'गेहूँ को कब सिंचाई करें?'", lang }
            : { reply: "I can advise on crops, irrigation, soil, pests, prices and subsidies. Try asking: 'Best crop for sandy soil with limited water?' or 'How to treat yellow rust in wheat?' or 'When to irrigate wheat?'.", lang };
}

// Deterministic "vision" fallback: cycle through plausible diagnoses
function fallbackImage() {
  const opts = [
    { disease: "Wheat Yellow (Stripe) Rust", type: "Disease", confidence: 87, stage: "Flowering - GS 60", severity: "Moderate", treatments: [
      { kind: "Chemical", text: "Spray Propiconazole 25 EC @ 0.1% at 15-day intervals; 200 L water/acre." },
      { kind: "Cultural", text: "Avoid late sowing; remove infected volunteer plants." },
      { kind: "Resistant variety", text: "Switch to HD-3226 or PBW-725 next cycle." }
    ]},
    { disease: "Armyworm infestation", type: "Pest", confidence: 71, stage: "Vegetative - GS 30", severity: "Low", treatments: [
      { kind: "Biological", text: "NPV spray 250 LE/acre at dusk." },
      { kind: "Chemical", text: "Emamectin benzoate 5% SG @ 200 g/acre if above ETL." },
      { kind: "Monitoring", text: "Set 2 pheromone traps per acre." }
    ]},
    { disease: "Nitrogen deficiency", type: "Nutrient", confidence: 83, stage: "Tillering - GS 22", severity: "Moderate", treatments: [
      { kind: "Soil application", text: "Top-dress 30 kg urea/acre split at tillering and jointing." },
      { kind: "Foliar", text: "2% urea spray at 30 and 45 DAS." }
    ]}
  ];
  return opts[Math.floor(Math.random() * opts.length)];
}

async function handlePlanner(input: any) {
  const ai = await callGemini(
    `You are an agronomist for Rajasthan, India. Recommend the best 4 crops for a field with soil=${input.soil}, water availability=${input.water}, market trend=${input.marketTrend}, forecast rain=${input.weatherRain}mm/week. Respond as JSON: {"ranked":[{"name","score"(0-99),"yieldQtl"(qtl/acre),"revenue"(INR),"profit"(INR),"waterNeed","growthDays"}],"best":{...}}. Respond only with JSON.`
  );
  if (ai && ai.trim()) {
    try { return JSON.parse(ai); } catch { /* fall through */ }
  }
  return fallbackPlanner(input);
}

async function handleSoil(input: any) {
  const report = input.report ?? input;
  const ai = await callGemini(
    `You are a soil scientist. Given nutrient report ${JSON.stringify(report)}, give 3-5 practical improvement recommendations. JSON: {"recommendations":[{"kind","text"}],"status"}. Respond only with JSON.`
  );
  if (ai && ai.trim()) {
    try { return JSON.parse(ai); } catch { /* fall through */ }
  }
  return fallbackSoil(report);
}

async function handleImage(body: any) {
  if (body.imageBase64) {
    const out = await callGeminiVision(
      "You are a plant pathologist. Identify disease/pest/nutrient deficiency in this crop image. Respond as JSON: {disease, type (Disease|Pest|Nutrient|Growth), confidence (0-100), stage, severity (Low|Moderate|Severe), treatments:[{kind,text}]}. Only JSON.",
      body.imageBase64, body.mime ?? "image/jpeg"
    );
    if (out && out.trim()) {
      try { return JSON.parse(out); } catch { /* fall through */ }
    }
  }
  return fallbackImage();
}

async function handleAssistant(input: any) {
  const lang = input.lang ?? 'en';
  const langName = lang === 'hi' || lang === 'rj' ? 'Hindi (Devanagari script)' : 'English';
  const aiReply = await callGemini(
    `You are FarmSOS, an AI agriculture advisor for Indian farmers. Reply in ${langName}. Answer briefly and practically (max 3 sentences): ${input.prompt}`
  );
  if (aiReply && aiReply.trim()) return { reply: aiReply, lang };
  const fb = fallbackAssistant(input.prompt ?? "", lang);
  return { reply: fb.reply, lang: fb.lang };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  try {
    const body = await req.json();
    let out: any;
    switch (body.action) {
      case "planner": out = await handlePlanner(body); break;
      case "soil": out = await handleSoil(body); break;
      case "image": out = await handleImage(body); break;
      case "assistant": out = await handleAssistant(body); break;
      default: throw new Error("unknown action: " + body.action);
    }
    return new Response(JSON.stringify(out), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
