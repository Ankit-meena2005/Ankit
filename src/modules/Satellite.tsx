import { useMemo, useState } from 'react'
import { Satellite as SatelliteIcon, Activity, Droplets, ThermometerSun, TrendingUp, CalendarDays } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { Section, Card, Stat, Badge } from '../components/ui'

// A simulated 16-week NDVI / stress time series for a wheat field.
const WEEKS = 16
function buildSeries() {
  return Array.from({ length: WEEKS }, (_, i) => {
    const phase = i < 4 ? 0.32 + i * 0.06 : i < 8 ? 0.62 + (i - 4) * 0.04 : i < 12 ? 0.78 - (i - 8) * 0.02 : 0.62 - (i - 12) * 0.05
    const ndvi = +Math.min(0.9, Math.max(0.15, phase + (Math.random() - 0.5) * 0.04)).toFixed(3)
    return {
      week: `W${i + 1}`,
      ndvi,
      waterStress: +Math.max(0, (0.45 - ndvi) + (Math.random() - 0.5) * 0.06).toFixed(2),
      temp: +(28 + Math.sin(i / 2) * 4 + Math.random() * 2).toFixed(1)
    }
  })
}

const ZONES = [
  { name: 'Field A1 (Wheat)', ndvi: 0.78, area: 1.8, color: 'bg-brand-500', stress: 'Low' },
  { name: 'Field B2 (Mustard)', ndvi: 0.64, area: 1.2, color: 'bg-amber-400', stress: 'Medium' },
  { name: 'Field C3 (Bajra)', ndvi: 0.41, area: 1.5, color: 'bg-red-500', stress: 'High' }
]

export default function Satellite() {
  const data = useMemo(buildSeries, [])
  const [activeZone, setActiveZone] = useState(ZONES[0])

  const growthStage = ({ ndvi }: typeof ZONES[0]) =>
    ndvi >= 0.7 ? 'Grain filling' : ndvi >= 0.55 ? 'Flowering' : ndvi >= 0.35 ? 'Vegetative' : 'Emergence'

  return (
    <Section
      title="Satellite Crop Monitoring"
      subtitle="Field-level NDVI vegetation health, growth stage, drought and water stress — refreshed from Sentinel-2 imagery."
      action={<Badge color="brand"><SatelliteIcon size={12} /> Sentinel-2 · 10m</Badge>}
    >
      {/* Stat strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Stat label="Mean NDVI" value="0.61" sub="3 zones" />
        <Stat label="Drought risk" value="Low" sub="SPI +0.4" accent="soil" />
        <Stat label="Water stress" value="22%" sub="Field C3" accent="night" />
        <Stat label="Growth stage" value="Flowering" sub="Wheat Rabi" accent="soil" />
      </div>

      {/* NDVI field mosaic */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-display text-lg font-semibold">NDVI Field Map — Kota Farm</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-500" /> 0.2</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-400" /> 0.5</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-brand-500" /> 0.8</span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {ZONES.map((z) => (
            <button key={z.name} onClick={() => setActiveZone(z)}
              className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                activeZone.name === z.name ? 'border-brand-500 bg-brand-500/5' : 'border-night-700 hover:border-brand-500/40'
              }`}>
              {/* Synthetic NDVI gradient visual */}
              <div className={`absolute inset-0 opacity-30 ${z.color}`} />
              <div className="relative">
                <div className="text-sm font-semibold">{z.name}</div>
                <div className="text-2xl font-display font-bold mt-2">{z.ndvi}</div>
                <div className="text-xs text-night-300">{z.area} acres · stress {z.stress}</div>
                <div className="mt-2"><Badge color="gray">{growthStage(z)}</Badge></div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Time series */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-lg font-semibold">NDVI time series</div>
              <div className="text-xs text-night-400">{activeZone.name} — last 16 weeks</div>
            </div>
            <Activity className="text-brand-300" />
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer>
              <LineChart data={data}>
                <XAxis dataKey="week" stroke="#5a7b8a" fontSize={11} />
                <YAxis stroke="#5a7b8a" fontSize={11} domain={[0, 1]} />
                <Tooltip contentStyle={{ background: '#0f1e2b', border: '1px solid #24445d', borderRadius: 8 }} />
                <ReferenceLine y={0.7} stroke="#14b85f" strokeDasharray="4 4" label={{ value: 'Healthy', fill: '#14b85f', fontSize: 10 }} />
                <ReferenceLine y={0.35} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Stress', fill: '#ef4444', fontSize: 10 }} />
                <Line dataKey="ndvi" stroke="#3acc7a" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-display text-lg font-semibold mb-3">Water stress index</div>
          <div className="h-48">
            <ResponsiveContainer>
              <LineChart data={data}>
                <XAxis dataKey="week" stroke="#5a7b8a" fontSize={10} />
                <YAxis stroke="#5a7b8a" fontSize={10} domain={[0, 0.5]} />
                <Tooltip contentStyle={{ background: '#0f1e2b', border: '1px solid #24445d', borderRadius: 8 }} />
                <Line dataKey="waterStress" stroke="#60a5fa" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            <Insight icon={Droplets} label="Soil moisture" value="28% (field capacity)" color="text-sky-300" />
            <Insight icon={ThermometerSun} label="Surface temp" value="29.4°C (normal)" color="text-amber-300" />
            <Insight icon={CalendarDays} label="Days since rain" value="11 days" color="text-night-200" />
            <Insight icon={TrendingUp} label="Growth tracking" value="+6.2% vs last cycle" color="text-brand-300" />
          </div>
        </Card>
      </div>

      {/* Drought / risk panel */}
      <Card className="p-6 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <ThermometerSun className="text-amber-300" />
          <div className="font-display text-lg font-semibold">Drought & Climate Risk</div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
            <div className="text-xs text-amber-200">SPI (3-month)</div>
            <div className="text-2xl font-bold">+0.4</div>
            <div className="text-xs text-night-300">Near normal</div>
          </div>
          <div className="rounded-xl bg-brand-500/10 border border-brand-500/20 p-4">
            <div className="text-xs text-brand-200">Forecast (7-day)</div>
            <div className="text-2xl font-bold">2 light showers</div>
            <div className="text-xs text-night-300">9–14 mm expected</div>
          </div>
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
            <div className="text-xs text-red-200">Heatwave watch</div>
            <div className="text-2xl font-bold">Mar 24–26</div>
            <div className="text-xs text-night-300">{'> '}40°C likely</div>
          </div>
        </div>
      </Card>
    </Section>
  )
}

function Insight({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-night-300"><Icon size={14} /> {label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  )
}
