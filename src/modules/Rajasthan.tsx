import { Map, CalendarDays, CloudSun, Store, Building2 } from 'lucide-react'
import { Section, Card, Stat, Badge } from '../components/ui'
import { useWeather } from '../lib/weather'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

const CROP_CALENDAR = [
  { month: 'Oct', action: 'Land prep + basal fertilizer (Wheat/Mustard sowing)' },
  { month: 'Nov', action: 'Sowing window closes · Wheat seed treatment' },
  { month: 'Dec', action: 'First irrigation (Crown root initiation)' },
  { month: 'Jan', action: 'Weeding · top-dress urea · mustard rosette' },
  { month: 'Feb', action: 'Pest scouting · mustard flowering · 2nd irrigation' },
  { month: 'Mar', action: 'Grain filling · heatwave watch · harvest mustard' },
  { month: 'Apr', action: 'Wheat harvest · threshing · storage prep' },
  { month: 'May', action: 'Summer ploughing · land prep for Kharif' },
  { month: 'Jun', action: 'Bajra / guar / moong sowing with monsoon onset' },
  { month: 'Jul', action: 'Thinning · weed control · Kharif top-dress' },
  { month: 'Aug', action: 'Pest watch (armyworm) · kharif irrigation' },
  { month: 'Sep', action: 'Kharif harvest · rabi planning' }
]

const MANDIS = [
  { name: 'Kota Grain Mandi', crops: 'Wheat, Soybean, Mustard', distance: '4 km' },
  { name: 'Baran Mandi', crops: 'Wheat, Gram', distance: '38 km' },
  { name: 'Bundi Mandi', crops: 'Mustard, Bajra', distance: '42 km' },
  { name: 'Ramganj Mandi', crops: 'Soybean, Maize', distance: '22 km' },
  { name: 'Jhalawar Mandi', crops: 'Orange, Wheat', distance: '85 km' }
]

const RESOURCES = [
  { name: 'Rajasthan Dept. of Agriculture', url: 'https://agriculture.rajasthan.gov.in' },
  { name: 'Krishi Vigyan Kendra — Kota', url: 'https://kvk.icar.gov.in' },
  { name: 'Rajasthan State Seed Corp.', url: 'https://rssc.rajasthan.gov.in' },
  { name: 'Rajasthan Mandi Board (RSAMB)', url: 'https://rsamb.rajasthan.gov.in' }
]

export default function Rajasthan() {
  const { weather } = useWeather()
  const tempTrend = weather.weekly.map((w) => ({ d: w.day, t: w.tempC }))

  return (
    <Section
      title="Rajasthan Special Module"
      subtitle="Kota farming dashboard, the state crop calendar, weather intelligence and the Rajasthan mandi network."
      action={<Badge color="amber"><Map size={12} /> Hadoti</Badge>}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Stat label="District" value="Kota" sub="Hadoti region" />
        <Stat label="Avg farm size" value="2.4 ha" sub="smallholder" accent="soil" />
        <Stat label="Primary crops" value="Wheat" sub="Mustard, Soybean" accent="night" />
        <Stat label="Active mandis" value="14" sub="within 100 km" accent="soil" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="font-display text-lg font-semibold">Rajasthan crop calendar</div>
            <CalendarDays className="text-brand-300" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {CROP_CALENDAR.map((m) => (
              <div key={m.month} className="rounded-xl border border-night-800 bg-night-800/40 p-3 flex gap-3">
                <div className="font-display font-bold text-brand-300 w-9">{m.month}</div>
                <div className="text-sm text-night-200">{m.action}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3"><CloudSun className="text-brand-300" /><div className="font-display text-lg font-semibold">Weather intelligence</div></div>
          <div className="text-sm text-night-300 mb-3">{weather.description} · {weather.tempC}°C · Humidity {weather.humidity}%</div>
          <div className="h-40">
            <ResponsiveContainer>
              <LineChart data={tempTrend}>
                <XAxis dataKey="d" stroke="#5a7b8a" fontSize={10} />
                <YAxis stroke="#5a7b8a" fontSize={10} />
                <Tooltip contentStyle={{ background: '#0f1e2b', border: '1px solid #24445d', borderRadius: 8 }} />
                <Line dataKey="t" stroke="#3acc7a" strokeWidth={2.5} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-xs text-night-400">Next rain expected in {weather.nextRainDays} day(s) — {weather.weekly.reduce((a, b) => a + b.rainMM, 0)} mm total.</div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3"><Store className="text-amber-300" /><div className="font-display text-lg font-semibold">Rajasthan mandi network</div></div>
          <div className="space-y-2">
            {MANDIS.map((m) => (
              <div key={m.name} className="flex items-center justify-between rounded-xl border border-night-800 bg-night-800/40 p-3">
                <div>
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className="text-xs text-night-400">{m.crops}</div>
                </div>
                <Badge color="gray">{m.distance}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3"><Building2 className="text-sky-300" /><div className="font-display text-lg font-semibold">Govt. resources</div></div>
          <div className="space-y-2">
            {RESOURCES.map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noreferrer"
                className="block rounded-xl border border-night-800 bg-night-800/40 p-3 text-sm hover:border-brand-500/40 transition-colors">
                <div className="font-semibold text-brand-300">{r.name}</div>
                <div className="text-xs text-night-400">{r.url.replace('https://', '')}</div>
              </a>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  )
}
