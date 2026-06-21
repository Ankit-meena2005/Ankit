import { useMemo, useState } from 'react'
import { Brain, Sprout, TrendingUp, IndianRupee, Droplets, Gauge, Award, Loader as Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Section, Card, Badge } from '../components/ui'
import { useWeather } from '../lib/weather'
import { ai, type PlannerResult } from '../lib/ai'
import { useToast } from '../lib/toast'

type Input = { soil: string; water: string; marketTrend: 'Rising' | 'Stable' | 'Falling' }

export default function Planner() {
  const { weather } = useWeather()
  const weatherRain = weather.weekly.reduce((a, b) => a + b.rainMM, 0)
  const [input, setInput] = useState<Input>({ soil: 'Loamy', water: 'Plenty', marketTrend: 'Rising' })
  const [result, setResult] = useState<PlannerResult | null>(null)
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  const run = async () => {
    setBusy(true)
    toast.push('Asking AI agronomist…', 'info')
    try {
      const r = await ai.planner({
        soil: input.soil, water: input.water, marketTrend: input.marketTrend, weatherRain
      })
      setResult(r)
      toast.push('AI recommendation ready', 'success')
    } catch (e) {
      toast.push('Using local scoring model', 'info')
      setResult(localFallback(input, weatherRain))
    } finally {
      setBusy(false)
    }
  }

  // Run once on mount with defaults so the screen is populated
  useMemo(() => { run() /* eslint-disable-next-line */ }, [])

  const ranked = result?.ranked ?? []
  const best = result?.best ?? ranked[0]

  return (
    <Section
      title="AI Crop Planner"
      subtitle="Live Gemini-powered recommendation by soil, weather, water availability and market demand — with expected yield & profit."
      action={<Badge color="brand"><Brain size={12} /> Gemini AI</Badge>}
    >
      <Card className="p-6 mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Soil type">
            {['Loamy', 'Sandy', 'Black', 'Clay', 'Red'].map((s) => (
              <Chip key={s} active={input.soil === s} onClick={() => setInput({ ...input, soil: s })}>{s}</Chip>
            ))}
          </Field>
          <Field label="Water availability">
            {(['Plenty', 'Moderate', 'Limited'] as const).map((s) => (
              <Chip key={s} active={input.water === s} onClick={() => setInput({ ...input, water: s })}>{s}</Chip>
            ))}
          </Field>
          <Field label="Market trend">
            {(['Rising', 'Stable', 'Falling'] as const).map((s) => (
              <Chip key={s} active={input.marketTrend === s} onClick={() => setInput({ ...input, marketTrend: s })}>{s}</Chip>
            ))}
          </Field>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-night-400">
            Weather: {weather.description} · {weather.tempC}°C · next rain in {weather.nextRainDays}d · {weatherRain.toFixed(0)}mm this week
          </div>
          <button onClick={run} disabled={busy} className="btn-primary">
            {busy ? <><Loader2 size={16} className="animate-spin" /> Analyzing</> : <><Brain size={16} /> Recommend Crops</>}
          </button>
        </div>
      </Card>

      {best && (
        <Card className="p-6 mb-6 bg-gradient-to-br from-brand-500/10 to-transparent border-brand-500/30">
          <div className="flex items-center gap-2 mb-4">
            <Award className="text-brand-300" />
            <span className="font-display text-lg font-semibold">Recommended Crop</span>
          </div>
          <div className="grid gap-6 lg:grid-cols-4 items-center">
            <div className="text-center">
              <div className="text-5xl mb-1">🌱</div>
              <div className="font-display text-3xl font-bold gradient-text">{best.name}</div>
              <div className="text-sm text-night-300">Confidence {best.score}%</div>
            </div>
            <KPI icon={Sprout} label="Expected yield" value={`${best.yieldQtl} qtl/acre`} />
            <KPI icon={IndianRupee} label="Expected revenue" value={`₹${(best.revenue / 1000).toFixed(0)}k`} />
            <KPI icon={TrendingUp} label="Expected profit" value={`₹${(best.profit / 1000).toFixed(0)}k`} accent="text-brand-300" />
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="font-display text-lg font-semibold mb-4">All crops ranked by expected profit</div>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={ranked} layout="vertical">
              <XAxis type="number" stroke="#5a7b8a" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" stroke="#5a7b8a" fontSize={11} width={80} />
              <Tooltip contentStyle={{ background: '#0f1e2b', border: '1px solid #24445d', borderRadius: 8 }} formatter={(v: any) => [`₹${v.toLocaleString()}`, 'Profit']} />
              <Bar dataKey="profit" radius={[0, 6, 6, 0]}>
                {ranked.map((r, i) => (
                  <Cell key={r.name} fill={i === 0 ? '#14b85f' : i === 1 ? '#3acc7a' : '#5a7b8a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {best && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Reason icon={Droplets} title="Water fit" text={`${best.waterNeed} water need — matches your availability profile.`} />
          <Reason icon={Gauge} title="Yield potential" text={`${best.growthDays}-day cycle, ${best.yieldQtl} qtl/acre expected.`} />
          <Reason icon={TrendingUp} title="Market outlook" text={`Mandi price near ₹${best.marketPrice ?? 2400}/qtl — ${input.marketTrend.toLowerCase()} trend.`} />
        </div>
      )}
    </Section>
  )
}

function localFallback(input: Input, rain: number): PlannerResult {
  const CROPS = [
    { name: 'Wheat', base: 16, price: 2420, water: 'Medium', days: 130 },
    { name: 'Mustard', base: 9, price: 5890, water: 'Low', days: 110 },
    { name: 'Bajra', base: 12, price: 2690, water: 'Low', days: 80 },
    { name: 'Gram', base: 8, price: 5980, water: 'Low', days: 110 },
    { name: 'Soybean', base: 14, price: 4500, water: 'Medium', days: 100 },
    { name: 'Maize', base: 24, price: 1960, water: 'High', days: 90 },
    { name: 'Cotton', base: 15, price: 6200, water: 'Medium', days: 160 },
    { name: 'Barley', base: 18, price: 2200, water: 'Low', days: 120 }
  ]
  const ranked = CROPS.map((c) => {
    let s = 50
    if (c.water === 'Low' && input.water === 'Limited') s += 14
    if (c.water === 'High' && input.water === 'Plenty') s += 14
    if (input.soil === 'Sandy' && c.name === 'Bajra') s += 10
    if (input.soil === 'Black' && c.name === 'Cotton') s += 10
    if (input.soil === 'Loamy' && (c.name === 'Wheat' || c.name === 'Mustard')) s += 12
    if (input.marketTrend === 'Rising' && c.price > 3000) s += 12
    if (input.marketTrend === 'Falling') s -= 10
    if (rain < 2 && c.water === 'High') s -= 12
    s = Math.max(10, Math.min(99, Math.round(s)))
    const yieldQtl = +((c.base * (0.7 + s / 200))).toFixed(1)
    const revenue = Math.round(yieldQtl * c.price)
    return { name: c.name, score: s, yieldQtl, revenue, profit: revenue - Math.round(revenue * 0.45), waterNeed: c.water, growthDays: c.days, marketPrice: c.price }
  }).sort((a, b) => b.profit - a.profit)
  return { ranked, best: ranked[0] }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (<div><div className="label mb-2">{label}</div><div className="flex flex-wrap gap-2">{children}</div></div>)
}
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${active ? 'border-brand-500 bg-brand-500/15 text-brand-200' : 'border-night-700 text-night-200 hover:border-brand-500/40'}`}>{children}</button>
  )
}
function KPI({ icon: Icon, label, value, accent = 'text-white' }: { icon: any; label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-xl bg-night-800/50 p-4 text-center">
      <Icon className="mx-auto mb-1 text-brand-300" size={18} />
      <div className="text-xs text-night-400">{label}</div>
      <div className={`font-display text-xl font-bold ${accent}`}>{value}</div>
    </div>
  )
}
function Reason({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <Card className="p-5">
      <Icon className="text-brand-300 mb-2" size={18} />
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-night-300 mt-1">{text}</div>
    </Card>
  )
}
