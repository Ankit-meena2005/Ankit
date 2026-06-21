import { useMemo, useState } from 'react'
import { Droplets, CloudRain, CalendarClock, Sparkles, Gauge } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Section, Card, Stat, Badge } from '../components/ui'
import { irrigationNeeds } from '../lib/data'
import { useWeather } from '../lib/weather'

const CROPS = Object.keys(irrigationNeeds)

export default function Irrigation() {
  const { weather } = useWeather()
  const [crop, setCrop] = useState('Wheat')
  const [acres, setAcres] = useState(4.5)

  const schedule = useMemo(() => {
    const def = irrigationNeeds[crop as keyof typeof irrigationNeeds]
    const weekRain = weather.weekly.reduce((a, b) => a + b.rainMM, 0)
    return def.stages.map((stage, i) => {
      const baseEt = def.baseEt[i]
      // Adjusted by recent rainfall (1mm ≈ 1 L/m²)
      const adjusted = Math.max(0.2, baseEt - weekRain / 7)
      const litersPerM2 = +adjusted.toFixed(1)
      const litersPerAcre = Math.round(litersPerM2 * 4047) // 1 acre = 4047 m²
      return {
        stage: stage.trim(),
        litersPerAcre,
        totalLitres: litersPerAcre * acres,
        minutes: Math.round((litersPerAcre * acres) / 50) // assume 50 L/min pump
      }
    })
  }, [crop, acres, weather])

  const totalLitres = schedule.reduce((a, b) => a + b.totalLitres, 0)
  const rainSaving = Math.round(weekRain(acres))

  return (
    <Section
      title="Smart Irrigation System"
      subtitle="Water requirement by growth stage, integrated rain prediction and water-saving recommendations."
      action={<Badge color="blue"><CloudRain size={12} /> Rain in {weather.nextRainDays}d</Badge>}
    >
      <Card className="p-6 mb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            <span className="label">Crop</span>
            <select className="input mt-1" value={crop} onChange={(e) => setCrop(e.target.value)}>
              {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Area (acres)</span>
            <input type="number" min="0.1" step="0.1" className="input mt-1" value={acres} onChange={(e) => setAcres(+e.target.value)} />
          </label>
          <Stat label="Weekly rain forecast" value={`${weekRainLitres()} mm`} sub="across next 7 days" />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Stat label="Total water need" value={`${(totalLitres / 1000).toFixed(1)}k L`} sub={`per ${crop} cycle`} />
        <Stat label="Rain contribution" value={`${rainSaving}k L`} sub="water saved" accent="soil" />
        <Stat label="Pump hours" value={`${Math.round(totalLitres / 3000)} h`} sub="at 3000 L/hr" />
        <Stat label="Cost saving" value={`₹${(rainSaving * 0.5).toFixed(0)}`} sub="electricity @ ₹0.5/L" accent="night" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="font-display text-lg font-semibold">Irrigation schedule by growth stage</div>
            <Gauge className="text-brand-300" />
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={schedule}>
                <XAxis dataKey="stage" stroke="#5a7b8a" fontSize={11} />
                <YAxis stroke="#5a7b8a" fontSize={11} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#0f1e2b', border: '1px solid #24445d', borderRadius: 8 }}
                  formatter={(v: any) => [`${(v / 1000).toFixed(1)}k L`, 'Water']}
                />
                <Bar dataKey="totalLitres" fill="#14b85f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock className="text-brand-300" size={18} />
            <div className="font-display text-lg font-semibold">Next irrigation</div>
          </div>
          <div className="space-y-2">
            {schedule.slice(0, 4).map((s, i) => (
              <div key={s.stage} className="rounded-xl border border-night-800 bg-night-800/40 p-3">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">{s.stage}</span>
                  <span className="text-xs text-night-400">Day {i * 14 + 7}</span>
                </div>
                <div className="text-xs text-night-300 mt-1">{(s.totalLitres / 1000).toFixed(1)}k L · {s.minutes} min pump run</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 mt-6 bg-gradient-to-br from-brand-500/10 to-transparent border-brand-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-brand-300" />
          <div className="font-display text-lg font-semibold">Water-saving recommendations</div>
        </div>
        <ul className="space-y-2 text-sm text-night-200">
          <li className="flex gap-2"><Droplets size={15} className="text-brand-300 mt-0.5" /> Switch to drip for {crop} at flowering — saves up to 40% water.</li>
          <li className="flex gap-2"><CloudRain size={15} className="text-sky-300 mt-0.5" /> Skip irrigation on day {weather.nextRainDays + 1} — {weather.weekly[weather.nextRainDays]?.rainMM ?? 4} mm rain expected.</li>
          <li className="flex gap-2"><Gauge size={15} className="text-amber-300 mt-0.5" /> Apply mulch to reduce evaporation losses (estimated 12% saving).</li>
          <li className="flex gap-2"><CalendarClock size={15} className="text-brand-300 mt-0.5" /> Irrigate early morning or late evening to cut evaporation by 18%.</li>
        </ul>
      </Card>
    </Section>
  )

  function weekRainLitres() {
    return weather.weekly.reduce((a, b) => a + b.rainMM, 0)
  }
  function weekRain(a: number) {
    // 1mm over 1 acre = ~4047 L
    return (weekRainLitres() * a * 4.047)
  }
}
