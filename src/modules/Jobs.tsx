import { Briefcase, MapPin, Clock, IndianRupee, TrendingUp } from 'lucide-react'
import { Section, Card, Badge } from '../components/ui'
import { jobListings } from '../lib/data'
import { useToast } from '../lib/toast'

const TYPE_COLORS = { 'Full-time': 'brand', 'Seasonal': 'amber', 'Internship': 'blue', 'Startup': 'red' } as const

export default function Jobs() {
  const toast = useToast()
  return (
    <Section
      title="Agriculture Job Portal"
      subtitle="Farm jobs, seasonal work, internships and agri-startup opportunities — all in one place."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { l: 'Active jobs', v: '128', i: Briefcase, c: 'text-brand-300' },
          { l: 'Seasonal roles', v: '42', i: Clock, c: 'text-amber-300' },
          { l: 'Internships', v: '16', i: TrendingUp, c: 'text-sky-300' },
          { l: 'Startups hiring', v: '9', i: TrendingUp, c: 'text-red-300' }
        ].map((s) => (
          <Card key={s.l} className="p-4 flex items-center gap-3">
            <s.i className={s.c} size={20} />
            <div><div className="font-display text-2xl font-bold">{s.v}</div><div className="text-xs text-night-400">{s.l}</div></div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4">
        {jobListings.map((j) => (
          <Card key={j.id} className="p-5 card-hover">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-lg font-semibold">{j.title}</h3>
                  <Badge color={TYPE_COLORS[j.type]}>{j.type}</Badge>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-night-300">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {j.location}</span>
                  <span className="flex items-center gap-1"><IndianRupee size={14} /> {j.salary}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {j.posted}</span>
                </div>
              </div>
              <button onClick={() => toast.push('Application submitted', 'success')} className="btn-primary">Apply</button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 mt-6 bg-gradient-to-br from-brand-500/10 to-transparent border-brand-500/30">
        <div className="flex items-center gap-2"><TrendingUp className="text-brand-300" /><div className="font-display text-lg font-semibold">Agri-startup spotlight</div></div>
        <div className="grid gap-3 sm:grid-cols-2 mt-3">
          <div className="rounded-xl bg-night-800/40 p-4">
            <div className="font-semibold">AgriDrone Robotics</div>
            <div className="text-sm text-night-300">Pre-seed · Jaipur · drone spraying SAAS</div>
            <div className="text-xs text-brand-300 mt-1">Looking for 2 co-founders</div>
          </div>
          <div className="rounded-xl bg-night-800/40 p-4">
            <div className="font-semibold">KrishiBazaar</div>
            <div className="text-sm text-night-300">Seed · Kota · farm-to-mandi marketplace</div>
            <div className="text-xs text-brand-300 mt-1">Hiring field sales lead</div>
          </div>
        </div>
      </Card>
    </Section>
  )
}
