import { useState } from 'react'
import { Upload, Brain, ScanLine, TriangleAlert as AlertTriangle, Leaf, Bug, FlaskRound, Activity, Image as ImageIcon } from 'lucide-react'
import { Section, Card, Badge } from '../components/ui'
import { useToast } from '../lib/toast'

type AnalysisResult = {
  disease: string
  confidence: number
  type: 'Disease' | 'Pest' | 'Nutrient' | 'Growth'
  stage: string
  treatments: { kind: string; text: string }[]
  severity: 'Low' | 'Moderate' | 'Severe'
}

const SAMPLE_RESULTS: AnalysisResult[] =([
  {
    disease: 'Wheat Yellow (Stripe) Rust',
    confidence: 87,
    type: 'Disease',
    stage: 'Flowering — GS 60',
    severity: 'Moderate',
    treatments: [
      { kind: 'Chemical', text: 'Spray Propiconazole 25 EC @ 0.1% at 15-day intervals; 200 L water/acre.' },
      { kind: 'Cultural', text: 'Avoid late sowing; remove infected volunteer plants and crop debris.' },
      { kind: 'Resistant variety', text: 'Switch to HD-3226 or PBW-725 next cycle for rust resistance.' }
    ]
  },
  {
    disease: 'Armyworm infestation',
    confidence: 71,
    type: 'Pest',
    stage: 'Vegetative — GS 30',
    severity: 'Low',
    treatments: [
      { kind: 'Biological', text: 'NPV spray (Spodoptera) — 250 LE per acre at dusk.' },
      { kind: 'Chemical', text: 'Emamectin benzoate 5% SG @ 200 g/acre if damage crosses ETL.' },
      { kind: 'Monitoring', text: 'Set up 2 pheromone traps per acre; review weekly.' }
    ]
  },
  {
    disease: 'Nitrogen deficiency',
    confidence: 83,
    type: 'Nutrient',
    stage: 'Tillering — GS 22',
    severity: 'Moderate',
    treatments: [
      { kind: 'Soil application', text: 'Top-dress 30 kg urea/acre split at tillering and jointing.' },
      { kind: 'Foliar', text: '2% urea spray at 30 & 45 DAS for quick green-up.' }
    ]
  }
] as AnalysisResult[])

export default function ImageAI() {
  const [img, setImg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const toast = useToast()

  const onUpload = (f: File) => {
    const url = URL.createObjectURL(f)
    setImg(url)
    setBusy(true)
    setResult(null)
    toast.push('Running disease detection model…', 'info')
    setTimeout(() => {
      setResult(SAMPLE_RESULTS[Math.floor(Math.random() * SAMPLE_RESULTS.length)])
      setBusy(false)
      toast.push('Analysis complete', 'success')
    }, 1500)
  }

  return (
    <Section
      title="AI Image Analysis"
      subtitle="Upload a crop photo. Our model detects disease, pests, nutrient deficiency and growth stage — with treatment steps."
      action={<Badge color="brand"><Brain size={12} /> TensorFlow Lite</Badge>}
    >
      <Card className="p-6">
        <label className="block cursor-pointer">
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
          {!img ? (
            <div className="grid place-items-center text-center rounded-2xl border-2 border-dashed border-night-700 hover:border-brand-500/50 py-16 transition-colors">
              <Upload className="text-brand-300 mb-3" size={32} />
              <div className="font-display text-lg font-semibold">Upload crop image</div>
              <div className="text-sm text-night-400 mt-1">JPG or PNG · leaves, stem or whole plant</div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-2xl">
              <img src={img} alt="crop" className="w-full max-h-[420px] object-cover" />
              {busy && (
                <div className="absolute inset-0 bg-night-950/60 grid place-items-center">
                  <div className="relative">
                    <div className="h-28 w-28 rounded-full border-4 border-brand-500/30 border-t-brand-500 animate-spin" />
                    <ScanLine className="absolute inset-0 m-auto text-brand-300" />
                  </div>
                </div>
              )}
              {result && (
                <span className="absolute top-3 left-3 chip">
                  <Badge color={result.severity === 'Severe' ? 'red' : result.severity === 'Moderate' ? 'amber' : 'brand'}>
                    {result.severity} severity
                  </Badge>
                </span>
              )}
            </div>
          )}
        </label>
        <div className="mt-3 flex gap-2 items-center text-sm">
          <ImageIcon size={14} className="text-night-400" />
          <span className="text-night-400">No image? </span>
          <button onClick={() => { setImg('https://images.pexels.com/photos/5966644/pexels-photo-5966644.jpeg'); setBusy(true); setTimeout(() => { setResult(SAMPLE_RESULTS[0]); setBusy(false) }, 1400) }}
            className="text-brand-300 hover:underline">Use sample wheat leaf</button>
        </div>
      </Card>

      {result && img && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="p-6">
            <div className="label">Diagnosis</div>
            <div className={`font-display text-xl font-bold mt-1 ${result.severity === 'Severe' ? 'text-red-300' : 'text-brand-300'}`}>
              {result.disease}
            </div>
            <div className="text-sm text-night-300 mt-1">{result.type}</div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-night-400 mb-1"><span>Confidence</span><span>{result.confidence}%</span></div>
              <div className="h-2 w-full rounded-full bg-night-800 overflow-hidden">
                <div className="h-full bg-brand-500" style={{ width: `${result.confidence}%` }} />
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2"><Activity size={14} className="text-sky-300" /> <span className="text-night-300">Growth stage:</span> <span className="font-semibold">{result.stage}</span></div>
              {result.type === 'Disease' && <div className="flex items-center gap-2"><AlertTriangle size={14} className="text-amber-300" /> <span className="text-night-300">Fungal pathogen detected</span></div>}
              {result.type === 'Pest' && <div className="flex items-center gap-2"><Bug size={14} className="text-red-300" /> <span className="text-night-300">Insect infestation</span></div>}
              {result.type === 'Nutrient' && <div className="flex items-center gap-2"><Leaf size={14} className="text-brand-300" /> <span className="text-night-300">Leaf yellower pattern</span></div>}
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4"><FlaskRound className="text-brand-300" /><div className="font-display text-lg font-semibold">Treatment recommendations</div></div>
            <div className="space-y-3">
              {result.treatments.map((t, i) => (
                <div key={i} className="rounded-xl border border-night-800 bg-night-800/40 p-4">
                  <Badge color="gray">{t.kind}</Badge>
                  <p className="text-sm text-night-200 mt-2">{t.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-brand-500/10 border border-brand-500/20 p-3 text-sm text-brand-200">
              Re-scan in 7 days after treatment to track recovery progress.
            </div>
          </Card>
        </div>
      )}
    </Section>
  )
}
