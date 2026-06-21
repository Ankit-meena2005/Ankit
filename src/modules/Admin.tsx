import { useState } from 'react'
import { Users, ShieldCheck, FlaskConical, Store, MessageSquare, Check, X, Search } from 'lucide-react'
import { Section, Card, Stat, Badge } from '../components/ui'
import { useToast } from '../lib/toast'

const FARMERS = [
  { id: 'f1', name: 'Ramesh P.', village: 'Bundi', acres: 3.2, status: 'Verified' },
  { id: 'f2', name: 'Sunita D.', village: 'Baran', acres: 2.1, status: 'Pending' },
  { id: 'f3', name: 'Akbar K.', village: 'Kota', acres: 5.0, status: 'Verified' },
  { id: 'f4', name: 'Priya M.', village: 'Jhalawar', acres: 1.4, status: 'Pending' },
  { id: 'f5', name: 'Vijay S.', village: 'Ramganj', acres: 6.8, status: 'Suspended' }
]

const REPORTS = [
  { id: 'r1', crop: 'Wheat', issue: 'Yellow rust', location: 'Bundi', date: '2025-03-18', status: 'Open' },
  { id: 'r2', crop: 'Mustard', issue: 'Aphid', location: 'Baran', date: '2025-03-16', status: 'Resolved' },
  { id: 'r3', crop: 'Soybean', issue: 'Armyworm', location: 'Kota', date: '2025-03-20', status: 'Open' }
]

const PRODUCTS = [
  { id: 'p1', name: 'HD-2967 Wheat Seed', vendor: 'IFFCO', status: 'Approved' },
  { id: 'p2', name: 'Spurious NPK mix', vendor: 'Local Co', status: 'Flagged' },
  { id: 'p3', name: 'Urea (Neem Coated)', vendor: 'Chambal', status: 'Approved' }
]

const POSTS = [
  { id: 'c1', title: 'Yellow rust outbreak near Bundi', author: 'Ramesh S.', reports: 2 },
  { id: 'c2', title: 'FCI pricing complaint', author: 'Akbar K.', reports: 5 },
  { id: 'c3', title: 'Drip subsidy paperwork', author: 'Sunita D.', reports: 0 }
]

export default function Admin() {
  const [farmers, setFarmers] = useState(FARMERS)
  const [q, setQ] = useState('')
  const toast = useToast()

  const verify = (id: string) => {
    setFarmers((f) => f.map((x) => x.id === id ? { ...x, status: 'Verified' } : x))
    toast.push('Farmer verified', 'success')
  }
  const suspend = (id: string) => {
    setFarmers((f) => f.map((x) => x.id === id ? { ...x, status: 'Suspended' } : x))
    toast.push('Farmer suspended', 'info')
  }

  const filtered = farmers.filter((f) => (f.name + f.village).toLowerCase().includes(q.toLowerCase()))

  return (
    <Section
      title="Admin Panel"
      subtitle="Manage users, verify farmers, review disease reports, oversee marketplace and moderate the community."
      action={<Badge color="red"><ShieldCheck size={12} /> Admin access</Badge>}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <Stat label="Total farmers" value="12,480" sub="+182 this week" />
        <Stat label="Pending verifications" value="34" accent="soil" />
        <Stat label="Disease reports (open)" value="6" accent="night" />
        <Stat label="Marketplace listings" value="1,204" sub="9 flagged" accent="soil" />
        <Stat label="Community reports" value="7" accent="night" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="font-display text-lg font-semibold flex items-center gap-2"><Users className="text-brand-300" size={18} /> Farmer verification</div>
          </div>
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-400" />
            <input className="input pl-8" placeholder="Search farmers…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="space-y-2">
            {filtered.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl border border-night-800 bg-night-800/40 p-3">
                <div>
                  <div className="text-sm font-semibold">{f.name} <span className="text-xs text-night-400">· {f.village} · {f.acres} ac</span></div>
                  <Badge color={f.status === 'Verified' ? 'brand' : f.status === 'Suspended' ? 'red' : 'amber'}>{f.status}</Badge>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => verify(f.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/15 text-brand-300 hover:bg-brand-500/25"><Check size={15} /></button>
                  <button onClick={() => suspend(f.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25"><X size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-display text-lg font-semibold mb-3 flex items-center gap-2"><FlaskConical className="text-amber-300" size={18} /> Disease reports</div>
          <div className="space-y-2">
            {REPORTS.map((r) => (
              <div key={r.id} className="rounded-xl border border-night-800 bg-night-800/40 p-3">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold">{r.crop} — {r.issue}</span>
                  <Badge color={r.status === 'Resolved' ? 'brand' : 'red'}>{r.status}</Badge>
                </div>
                <div className="text-xs text-night-400 mt-1">{r.location} · {r.date}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-display text-lg font-semibold mb-3 flex items-center gap-2"><Store className="text-sky-300" size={18} /> Marketplace management</div>
          <div className="space-y-2">
            {PRODUCTS.map((p) => (
              <div key={p.id} className="rounded-xl border border-night-800 bg-night-800/40 p-3 flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-night-400">{p.vendor}</div>
                </div>
                <Badge color={p.status === 'Approved' ? 'brand' : 'red'}>{p.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="font-display text-lg font-semibold mb-3 flex items-center gap-2"><MessageSquare className="text-brand-300" size={18} /> Community moderation</div>
          <div className="space-y-2">
            {POSTS.map((p) => (
              <div key={p.id} className="rounded-xl border border-night-800 bg-night-800/40 p-3 flex justify-between items-center">
                <div>
                  <div className="text-sm font-semibold line-clamp-1">{p.title}</div>
                  <div className="text-xs text-night-400">by {p.author}</div>
                </div>
                <div className="flex items-center gap-2">
                  {p.reports > 0 && <Badge color="red">{p.reports} reports</Badge>}
                  <button className="btn-ghost text-xs">Action</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  )
}
