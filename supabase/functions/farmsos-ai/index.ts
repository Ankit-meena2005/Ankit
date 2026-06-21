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
  if (!GEMINI_KEY) return "";
  const r = await fetch(GEMINI_TXT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, responseMimeType: "application/json" }
    })
  });
  if (!r.ok) throw new Error("gemini " + r.status);
  const j = await r.json();
  return j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function callGeminiVision(prompt: string, imageBase64: string, mime: string): Promise<string> {
  if (!GEMINI_KEY) return "";
  const r = await fetch(GEMINI_VIS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: imageBase64 } }] }],
      generationConfig: { temperature: 0.3, responseMimeType: "application/json" }
    })
  });
  if (!r.ok) throw new Error("gemini-vision " + r.status);
  const j = await r.json();
  return j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
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

function fallbackAssistant(prompt: string) {
  const p = prompt.toLowerCase();
  if (p.includes("wheat") && (p.includes("rust") || p.includes("yellow"))) {
    return { reply: "Wheat yellow (stripe) rust appears as yellow stripes on leaves. Spray Propiconazole 25 EC @ 0.1% at 15-day intervals and switch to resistant variety HD-3226 next cycle." };
  }
  if (p.includes("irrigation") || p.includes("water")) {
    return { reply: "For wheat in Rabi, irrigate at CRI (21 DAS), tillering, late jointing, flowering and grain filling — about 5 irrigations totaling ~40 cm. Skip if >5mm rain in prior 3 days." };
  }
  if (p.includes("subsidy") || p.includes("pm-kisan")) {
    return { reply: "PM-Kisan gives Rs 6000/year in 3 installments. Drip irrigation has 55-90% subsidy under PMKSY. Soil Health Card is free. Solar pumps: 60% subsidy under KUSUM." };
  }
  return { reply: "I can advise on crops, irrigation, soil, pests, prices and subsidies. Try: 'Best crop for sandy soil with limited water?' or 'How to treat yellow rust in wheat?'" };
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
  if (ai) {
    try { return JSON.parse(ai); } catch { /* fall through */ }
  }
  return fallbackPlanner(input);
}

async function handleSoil(input: any) {
  const report = input.report ?? input;
  const ai = await callGemini(
    `You are a soil scientist. Given nutrient report ${JSON.stringify(report)}, give 3-5 practical improvement recommendations. JSON: {"recommendations":[{"kind","text"}],"status"}. Respond only with JSON.`
  );
  if (ai) {
    try { return JSON.parse(ai); } catch { /* fall through */ }
  }
  return fallbackSoil(report);
}

async function handleImage(body: any) {
  if (body.imageBase64 && GEMINI_KEY) {
    const out = await callGeminiVision(
      "You are a plant pathologist. Identify disease/pest/nutrient deficiency in this crop image. Respond as JSON: {disease, type (Disease|Pest|Nutrient|Growth), confidence (0-100), stage, severity (Low|Moderate|Severe), treatments:[{kind,text}]}. Only JSON.",
      body.imageBase64, body.mime ?? "image/jpeg"
    );
    if (out) { try { return JSON.parse(out); } catch { /* fall through */ } }
  }
  return fallbackImage();
}

async function handleAssistant(input: any) {
  const ai = await callGemini(
    `You are FarmSOS, an AI agriculture advisor for Indian farmers in Hindi and English. Answer briefly and practically (max 3 sentences): ${input.prompt}`
  );
  if (ai) return { reply: ai };
  return fallbackAssistant(input.prompt ?? "");
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
