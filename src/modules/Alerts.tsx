import { CloudRain, ThermometerSun, Bug, Megaphone, AlertTriangle } from 'lucide-react'
import { Section, Card, Badge } from '../components/ui'
import { alerts } from '../lib/data'

const ICONS = { Flood: CloudRain, Heatwave: ThermometerSun, Pest: Bug, Advisory: Megaphone }
const SEV_COLORS = { Low: 'blue', Moderate: 'amber', High: 'amber', Severe: 'red' } as const

export default function Alerts() {
  const sorted = [...alerts].sort((a, b) => b.severity.length - a.severity.length)
  return (
    <Section
      title="Emergency Alert Center"
      subtitle="Real-time flood, heatwave, pest and government advisory alerts for your region."
      action={<Badge color="red"><AlertTriangle size={12} /> 4 active alerts</Badge>}
    >
      {/* Top callout */}
      <Card className="p-5 mb-6 bg-gradient-to-br from-amber-500/15 to-transparent border-amber-500/30">
        <div className="flex items-start gap-3">
          <ThermometerSun className="text-amber-300 mt-1 flex-shrink-0" size={24} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-semibold">Heatwave Warning — Kota & Baran</span>
              <Badge color="red">Severe</Badge>
            </div>
            <p className="text-sm text-night-200 mt-1">Temperatures expected above 42°C from Mar 24–26. Irrigate fields early morning, provide shade for livestock, avoid pesticide spray during peak heat.</p>
            <div className="text-xs text-night-400 mt-2">Source: IMD Rajasthan · Issued 06:30 IST · Active 72 hours</div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {sorted.map((a) => {
          const Icon = (ICONS as any)[a.type]
          return (
            <Card key={a.id} className="p-5 card-hover">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-night-800 text-brand-300"><Icon size={18} /></span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{a.title}</span>
                      <Badge color={SEV_COLORS[a.severity]}>{a.severity}</Badge>
                    </div>
                    <div className="text-xs text-night-400 mt-1">
                      {a.type} · {a.region} · {a.published_at}
                    </div>
                  </div>
                </div>
                <button className="btn-ghost text-xs">View</button>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-6 mt-6">
        <div className="font-display text-lg font-semibold mb-3">Government advisories</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { t: 'ICAR Rabi advisory: optimize irrigation for grain filling', d: 'Mar 20', src: 'ICAR-IIPR' },
            { t: 'Rajasthan govt: PM-Kisan 17th installment disbursed', d: 'Mar 18', src: 'Dept of Agri RJ' },
            { t: 'Soil Health Card renewal drive open till Apr 15', d: 'Mar 15', src: 'Soil Health Mission' },
            { t: 'Subsidy on micro-irrigation enhanced to 90% for SC/ST', d: 'Mar 12', src: 'PMKSY' }
          ].map((a) => (
            <div key={a.t} className="rounded-xl border border-night-800 bg-night-800/40 p-4">
              <div className="text-sm font-semibold">{a.t}</div>
              <div className="text-xs text-night-400 mt-1">{a.src} · {a.d}</div>
            </div>
          ))}
        </div>
      </Card>
    </Section>
  )
}
