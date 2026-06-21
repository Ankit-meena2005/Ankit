import { useState } from 'react'
import { Upload, FlaskConical, Beaker, Leaf, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle2, Sprout, Loader as Loader2 } from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer
} from 'recharts'
import { Section, Card, Stat, Badge } from '../components/ui'
import { useToast } from '../lib/toast'
import { ai, type SoilAdvice } from '../lib/ai'

const EXAMPLE = {
  ph: 7.4, nitrogen: 210, phosphorus: 32, potassium: 158,
  organicCarbon: 0.58, ec: 0.4, sulphur: 18, zinc: 0.8, boron: 0.6
}

const RANGES: Record<string, { low: number; high: number; unit: string }> = {
  ph: { low: 6.2, high: 7.5, unit: '' },
  nitrogen: { low: 280, high: 560, unit: 'kg/ha' },
  phosphorus: { low: 28, high: 56, unit: 'kg/ha' },
  potassium: { low: 140, high: 336, unit: 'kg/ha' },
  organicCarbon: { low: 0.5, high: 0.75, unit: '%' },
  ec: { low: 0, high: 1, unit: 'dS/m' },
  sulphur: { low: 10, high: 20, unit: 'ppm' },
  zinc: { low: 0.6, high: 1.2, unit: 'ppm' },
  boron: { low: 0.5, high: 1.0, unit: 'ppm' }
}

function status(v: number, range: { low: number; high: number }) {
  if (v < range.low * 0.85) return 'Deficient'
  if (v > range.high * 1.15) return 'Excess'
  if (v < range.low) return 'Slightly low'
  if (v > range.high) return 'Slightly high'
  return 'Optimal'
}

export default function Soil() {
  const [report, setReport] = useState<typeof EXAMPLE | null>(null)
  const [advice, setAdvice] = useState<SoilAdvice | null>(null)
  const [busy, setBusy] = useState(false)
  const [fileName, setFileName] = useState('')
  const toast = useToast()

  const analyze = async (data: typeof EXAMPLE) => {
    setReport(data)
    setBusy(true)
    setAdvice(null)
    toast.push('AI soil scientist analyzing…', 'info')
    try {
      const r = await ai.soil(data)
      setAdvice(r)
      toast.push('Soil analysis complete', 'success')
    } catch {
      toast.push('Could not reach AI — showing local analysis', 'error')
      setAdvice(localAdvice(data))
    } finally {
      setBusy(false)
    }
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileName(f.name)
    analyze(EXAMPLE)
  }

  const radarData = report ? [
    { nut: 'N', value: Math.min(100, (report.nitrogen / 560) * 100) },
    { nut: 'P', value: Math.min(100, (report.phosphorus / 56) * 100) },
    { nut: 'K', value: Math.min(100, (report.potassium / 336) * 100) },
    { nut: 'S', value: Math.min(100, (report.sulphur / 20) * 100) },
    { nut: 'Zn', value: Math.min(100, (report.zinc / 1.2) * 100) },
    { nut: 'B', value: Math.min(100, (report.boron / 1.0) * 100) },
    { nut: 'OC', value: Math.min(100, (report.organicCarbon / 0.75) * 100) }
  ] : []

  return (
    <Section
      title="Soil Health Analyzer"
      subtitle="Upload your soil test — Gemini AI extracts NPK and micronutrients, flags deficiencies and prescribes improvements."
      action={<Badge color="brand"><FlaskConical size={12} /> AI Soil Doc</Badge>}
    >
      {!report ? (
        <Card className="p-10">
          <label className="block cursor-pointer">
            <input type="file" accept=".pdf,.jpg,.png" className="hidden" onChange={handleUpload} />
            <div className="grid place-items-center text-center rounded-2xl border-2 border-dashed border-night-700 hover:border-brand-500/50 py-14 transition-colors">
              <Upload className="text-brand-300 mb-3" size={32} />
              <div className="font-display text-lg font-semibold">Upload soil test report</div>
              <div className="text-sm text-night-400 mt-1">PDF, JPG or PNG — or use our sample</div>
            </div>
          </label>
          <button onClick={() => { setFileName('sample.pdf'); analyze(EXAMPLE) }} className="btn-ghost mt-4 mx-auto flex">
            <Beaker size={16} /> Load sample report
          </button>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-4 text-sm text-night-400">
            <Upload size={14} /> Analyzed: {fileName || 'sample.pdf'}
            <button onClick={() => { setReport(null); setAdvice(null) }} className="ml-2 text-brand-300 hover:underline">Upload new</button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-6">
              <div className="font-display text-lg font-semibold mb-2">Nutrient radar</div>
              <div className="h-64">
                <ResponsiveContainer>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#24445d" />
                    <PolarAngleAxis dataKey="nut" stroke="#9ab8d2" fontSize={12} />
                    <PolarRadiusAxis stroke="#24445d" angle={90} domain={[0, 100]} tick={false} />
                    <Radar dataKey="value" stroke="#14b85f" fill="#14b85f" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Stat label="pH" value={report.ph} accent="soil" />
                <Stat label="EC" value={`${report.ec} dS/m`} accent="soil" />
              </div>
            </Card>

            <Card className="p-6 lg:col-span-2">
              <div className="font-display text-lg font-semibold mb-3">Nutrient breakdown</div>
              <div className="space-y-2">
                {(Object.keys(RANGES)).map((k) => {
                  const r = RANGES[k]
                  const st = status((report as any)[k], r)
                  const color = st === 'Optimal' ? 'text-brand-300' : st === 'Deficient' || st === 'Excess' ? 'text-red-300' : 'text-amber-300'
                  return (
                    <div key={k} className="flex items-center justify-between border-b border-night-800 pb-2 last:border-0">
                      <span className="text-sm text-night-200 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <div className="text-right">
                        <span className="text-sm font-semibold">{(report as any)[k]} {r.unit}</span>
                        <span className={`ml-3 text-xs ${color}`}>{st}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          <Card className="p-6 mt-6 bg-gradient-to-br from-brand-500/10 to-transparent border-brand-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Sprout className="text-brand-300" />
              <div className="font-display text-lg font-semibold">AI improvement recommendations</div>
              {advice && <Badge color={advice.status === 'Healthy' ? 'brand' : advice.status === 'Moderate' ? 'amber' : 'red'}>{advice.status}</Badge>}
            </div>
            {busy ? (
              <div className="flex items-center gap-2 text-night-300 py-6"><Loader2 className="animate-spin text-brand-300" /> AI analyzing your soil…</div>
            ) : advice ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {advice.recommendations.map((r, i) => (
                  <div key={i} className="rounded-xl border border-night-800 bg-night-800/40 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      {r.kind.toLowerCase().includes('chemical') ? <AlertTriangle size={15} className="text-amber-300" /> :
                       r.kind.toLowerCase().includes('organic') ? <Leaf size={15} className="text-brand-300" /> :
                       <CheckCircle2 size={15} className="text-sky-300" />}
                      <span className="text-sm font-semibold">{r.kind}</span>
                    </div>
                    <p className="text-sm text-night-300">{r.text}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        </>
      )}
    </Section>
  )
}

function localAdvice(r: typeof EXAMPLE): SoilAdvice {
  const recs: { kind: string; text: string }[] = []
  if (r.nitrogen < 280) recs.push({ kind: 'Chemical', text: 'Top-dress 30 kg urea/acre split across tillering & jointing stages.' })
  if (r.phosphorus < 28) recs.push({ kind: 'Chemical', text: 'Apply 100 kg SSP/acre at sowing as basal dose.' })
  if (r.potassium < 140) recs.push({ kind: 'Chemical', text: 'Add 25 kg MOP/acre as basal; improves grain filling.' })
  if (r.zinc < 0.6) recs.push({ kind: 'Micronutrient', text: 'Foliar spray of 0.5% ZnSO4 at 30 & 45 DAS for wheat.' })
  if (r.organicCarbon < 0.5) recs.push({ kind: 'Organic', text: 'Apply 4 t FYM/compost per acre + green manuring.' })
  if (r.ec > 1) recs.push({ kind: 'Salinity', text: 'Leach with light irrigation; avoid brackish groundwater.' })
  if (r.ph < 6.2) recs.push({ kind: 'pH correction', text: 'Apply 200-400 kg/acre agricultural lime to raise pH.' })
  if (r.ph > 7.8) recs.push({ kind: 'pH correction', text: 'Apply gypsum 1-2 t/acre and add organic matter.' })
  if (!recs.length) recs.push({ kind: 'Maintain', text: 'Soil is balanced; maintain practice, re-test after harvest.' })
  return { recommendations: recs, status: recs.length <= 1 ? 'Healthy' : recs.length <= 3 ? 'Moderate' : 'Deficient' }
}
