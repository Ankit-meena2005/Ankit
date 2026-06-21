import { useMemo, useState } from 'react'
import { Brain, Sprout, TrendingUp, IndianRupee, Droplets, Gauge, Award } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Section, Card, Badge } from '../components/ui'
import { cropCatalog } from '../lib/data'
import { useWeather } from '../lib/weather'

type Input = {
  soil: string
  water: string
  marketTrend: 'Rising' | 'Stable' | 'Falling'
}

function score(crop: (typeof cropCatalog)[number], input: Input, weatherRain: number): number {
  let s = 50
  if (crop.waterNeed === 'Low' && input.water === 'Limited') s += 12
  if (crop.waterNeed === 'High' && input.water === 'Plenty') s += 12
  if (input.soil === 'Sandy' && crop.name === 'Bajra') s += 8
  if (input.soil === 'Black' && crop.name === 'Cotton') s += 8
  if (input.soil === 'Loamy' && (crop.name === 'Wheat' || crop.name === 'Mustard')) s += 10
  if (input.marketTrend === 'Rising' && crop.marketPrice > 3000) s += 10
  if (input.marketTrend === 'Falling') s -= 8
  if (weatherRain < 2 && crop.waterNeed === 'High') s -= 10
  if (weatherRain > 5 && crop.waterNeed === 'Low') s -= 4
  return Math.max(10, Math.min(99, Math.round(s + (Math.random() * 8 - 4))))
}

export default function Planner() {
  const { weather } = useWeather()
  const [input, setInput] = useState<Input>({ soil: 'Loamy', water: 'Plenty', marketTrend: 'Rising' })

  const ranked = useMemo(() => {
    return cropCatalog
      .map((c) => {
        const sc = score(c, input, weather.weekly.reduce((a, b) => a + b.rainMM, 0)) as number
        const yieldQtl = +(c.baseYieldQtlPerAcre * (0.7 + sc / 200)).toFixed(1)
        const revenue = Math.round(yieldQtl * c.marketPrice)
        const cost = Math.round(yieldQtl * c.marketPrice * 0.45)
        return { ...c, score: sc, yieldQtl, revenue, profit: revenue - cost, cost }
      })
      .sort((a, b) => b.profit - a.profit)
  }, [input, weather])

  const best = ranked[0]

  return (
    <Section
      title="AI Crop Planner"
      subtitle="Recommend the best crop for each field using soil, weather, water availability and live market demand."
      action={<Badge color="brand"><Brain size={12} /> Gemini Advisory</Badge>}
    >
      {/* Inputs */}
      <Card className="p-6 mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Soil type">
            {['Loamy', 'Sandy', 'Black', 'Clay', 'Red'].map((s) => (
              <Chip key={s} active={input.soil === s} onClick={() => setInput({ ...input, soil: s })}>{s}</Chip>
            ))}
          </Field>
          <Field label="Water availability">
            {['Plenty', 'Moderate', 'Limited'].map((s) => (
              <Chip key={s} active={input.water === s} onClick={() => setInput({ ...input, water: s })}>{s}</Chip>
            ))}
          </Field>
          <Field label="Market trend">
            {(['Rising', 'Stable', 'Falling'] as const).map((s) => (
              <Chip key={s} active={input.marketTrend === s} onClick={() => setInput({ ...input, marketTrend: s })}>{s}</Chip>
            ))}
          </Field>
        </div>
        <div className="mt-4 text-xs text-night-400">
          Weather signal: {weather.description} · {weather.tempC}°C · next rain in {weather.nextRainDays} day(s)
        </div>
      </Card>

      {/* Best recommendation */}
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

      {/* Ranked table */}
      <Card className="p-6">
        <div className="font-display text-lg font-semibold mb-4">All crops ranked by expected profit</div>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={ranked} layout="vertical">
              <XAxis type="number" stroke="#5a7b8a" fontSize={11} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" stroke="#5a7b8a" fontSize={11} width={80} />
              <Tooltip
                contentStyle={{ background: '#0f1e2b', border: '1px solid #24445d', borderRadius: 8 }}
                formatter={(v: any) => [`₹${v.toLocaleString()}`, 'Profit']}
              />
              <Bar dataKey="profit" radius={[0, 6, 6, 0]}>
                {ranked.map((r, i) => (
                  <Cell key={r.name} fill={i === 0 ? '#14b85f' : i === 1 ? '#3acc7a' : '#5a7b8a'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Reason icon={Droplets} title="Water fit" text={`${best.waterNeed} water need — matches your availability profile.`} />
        <Reason icon={Gauge} title="Yield potential" text={`${best.growthDays}-day cycle, ${best.baseYieldQtlPerAcre} qtl/acre baseline.`} />
        <Reason icon={TrendingUp} title="Market outlook" text={`Mandi price near ₹${best.marketPrice}/qtl — ${input.marketTrend.toLowerCase()} trend.`} />
      </div>
    </Section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        active ? 'border-brand-500 bg-brand-500/15 text-brand-200' : 'border-night-700 text-night-200 hover:border-brand-500/40'
      }`}>
      {children}
    </button>
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
