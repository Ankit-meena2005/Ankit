import { useEffect, useState } from 'react'
import { Briefcase, MapPin, Clock, IndianRupee, TrendingUp } from 'lucide-react'
import { Section, Card, Badge } from '../components/ui'
import { fetchJobs, type JobListing } from '../lib/data'
import { useToast } from '../lib/toast'

const DEFAULT_JOBS: JobListing[] = [
  { id: 'j1', title: 'Farm Operations Manager', type: 'Full-time', location: 'Kota, RJ', salary: '₹35,000/mo', posted: '2d ago' },
  { id: 'j2', title: 'Harvest Labour (Rabi)', type: 'Seasonal', location: 'Baran, RJ', salary: '₹450/day', posted: '5d ago' },
  { id: 'j3', title: 'AgriTech Research Intern', type: 'Internship', location: 'Remote', salary: '₹15,000/mo', posted: '1d ago' },
  { id: 'j4', title: 'Co-founder — Drone spraying startup', type: 'Startup', location: 'Jaipur, RJ', salary: 'Equity', posted: '6d ago' }
]

const TYPE_COLORS = { 'Full-time': 'brand', 'Seasonal': 'amber', 'Internship': 'blue', 'Startup': 'red' } as const

export default function Jobs() {
  const [jobs, setJobs] = useState<JobListing[]>(DEFAULT_JOBS)
  const toast = useToast()
  useEffect(() => { fetchJobs().then((j) => { if (j.length) setJobs(j) }) }, [])

  return (
    <Section title="Agriculture Job Portal" subtitle="Farm jobs, seasonal work, internships and agri-startup opportunities — all in one place.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[
          { l: 'Active jobs', v: String(jobs.length * 32), i: Briefcase, c: 'text-brand-300' },
          { l: 'Seasonal roles', v: String(jobs.filter((j) => j.type === 'Seasonal').length * 11), i: Clock, c: 'text-amber-300' },
          { l: 'Internships', v: String(jobs.filter((j) => j.type === 'Internship').length * 4), i: TrendingUp, c: 'text-sky-300' },
          { l: 'Startups hiring', v: String(jobs.filter((j) => j.type === 'Startup').length * 3), i: TrendingUp, c: 'text-red-300' }
        ].map((s) => (
          <Card key={s.l} className="p-4 flex items-center gap-3">
            <s.i className={s.c} size={20} />
            <div><div className="font-display text-2xl font-bold">{s.v}</div><div className="text-xs text-night-400">{s.l}</div></div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4">
        {jobs.map((j) => (
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
              <button onClick={() => toast.push('Application submitted', 'success')} className="btn-primary">Apply now</button>
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
            <button onClick={() => toast.push('Pitch deck link sent on WhatsApp', 'success')} className="text-xs text-brand-300 mt-1">View pitch deck →</button>
          </div>
          <div className="rounded-xl bg-night-800/40 p-4">
            <div className="font-semibold">KrishiBazaar</div>
            <div className="text-sm text-night-300">Seed · Kota · farm-to-mandi marketplace</div>
            <button onClick={() => toast.push('Applied to KrishiBazaar', 'success')} className="text-xs text-brand-300 mt-1">Join team →</button>
          </div>
        </div>
      </Card>
    </Section>
  )
}
