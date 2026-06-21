import { useEffect, useState } from 'react'
import {
  MapPin, Droplets, Sprout, Ruler, Calendar, Activity, Gauge, Plus, ShieldCheck
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis
} from 'recharts'
import { Section, Card, Stat, Badge, Progress } from '../components/ui'
import { fetchFarms, fetchSoilReport, createFarm, type Farm, type SoilReport } from '../lib/data'
import { useToast } from '../lib/toast'

export default function FarmTwin() {
  const [list, setList] = useState<Farm[]>([])
  const [active, setActive] = useState<Farm | null>(null)
  const [soil, setSoil] = useState<SoilReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const toast = useToast()

  useEffect(() => {
    fetchFarms().then((farms) => {
      setList(farms)
      setActive(farms[0] ?? null)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!active) return
    fetchSoilReport(active.id).then(setSoil)
  }, [active])

  const addFarm = async (data: Partial<Farm>) => {
    toast.push('Creating digital twin…', 'info')
    const f = await createFarm(data)
    if (f) {
      setList((l) => [f, ...l])
      setActive(f)
      setShowAdd(false)
      toast.push('Digital twin created — AI scores computed', 'success')
    } else {
      toast.push('Could not create farm', 'error')
    }
  }

  if (loading) return (
    <Section title="Digital Farm Twin"><div className="card p-10 text-center text-night-400">Loading farm profiles…</div></Section>
  )

  if (!active) return (
    <Section title="Digital Farm Twin" action={<button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={16} /> New Farm Profile</button>}>
      <div className="card p-10 text-center">
        <Sprout className="mx-auto mb-3 text-brand-300" size={32} />
        <div className="font-semibold">No farms yet</div>
        <button onClick={() => setShowAdd(true)} className="btn-primary mt-4">Create your first digital twin</button>
      </div>
      {showAdd && <AddFarmModal onClose={() => setShowAdd(false)} onAdd={addFarm} />}
    </Section>
  )

  const yieldData = active.historical_yield.map((h) => ({ name: `${h.crop.slice(0, 4)} ${h.year}`, value: h.yield_qty }))
  const scoreColor = (s: number) => (s >= 75 ? 'text-brand-300' : s >= 50 ? 'text-amber-300' : 'text-red-300')

  return (
    <Section
      title="Digital Farm Twin"
      subtitle="Every farmer gets a live AI-scored farm profile — soil, water, history and forecasts in one view."
      action={<button onClick={() => setShowAdd(true)} className="btn-primary"><Plus size={16} /> New Farm Profile</button>}
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {list.map((f) => (
          <button key={f.id} onClick={() => setActive(f)}
            className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
              f.id === active.id ? 'border-brand-500 bg-brand-500/10 text-brand-200' : 'border-night-700 bg-night-800/60 hover:border-brand-500/40'
            }`}>
            {f.farm_name}
          </button>
        ))}
      </div>

      <div className="card p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-bold">{active.farm_name}</h2>
              <Badge color="brand"><ShieldCheck size={12} /> Verified Farm</Badge>
            </div>
            <div className="mt-1 text-night-300 flex items-center gap-1.5"><MapPin size={14} /> {active.location}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-night-400">Owner</div><div className="font-semibold">{active.farmer_name}</div>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Meta icon={Ruler} label="Farm size" value={`${active.farm_size_acres} acres`} />
          <Meta icon={Sprout} label="Primary crop" value={active.primary_crop} />
          <Meta icon={Activity} label="Soil type" value={active.soil_type} />
          <Meta icon={Droplets} label="Water source" value={active.water_source} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="label">AI Farm Health Score</div>
            <Badge color={active.health_score >= 75 ? 'brand' : 'amber'}>{active.health_score >= 75 ? 'Healthy' : 'Needs care'}</Badge>
          </div>
          <div className="h-48 mt-3">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: active.health_score, fill: '#14b85f' }]} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={50} />
                <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className={`font-display font-bold text-4xl ${scoreColor(active.health_score)}`}>{active.health_score}</text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-sm text-night-300">Based on soil NPK, NDVI, irrigation history and pest risk</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="label">AI Productivity Score</div>
            <Badge color={active.productivity_score >= 75 ? 'brand' : 'amber'}>vs region</Badge>
          </div>
          <div className="h-48 mt-3">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: active.productivity_score, fill: '#3acc7a' }]} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={50} />
                <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className={`font-display font-bold text-4xl ${scoreColor(active.productivity_score)}`}>{active.productivity_score}</text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-sm text-night-300">Projected {active.productivity_score >= 70 ? '↑ 18%' : '↓ 6%'} yield vs district average</div>
        </Card>

        <Card className="p-6">
          <div className="label mb-3">Historical production</div>
          {yieldData.length ? (
            <div className="h-48">
              <ResponsiveContainer>
                <BarChart data={yieldData}>
                  <XAxis dataKey="name" stroke="#5a7b8a" fontSize={10} />
                  <YAxis stroke="#5a7b8a" fontSize={10} />
                  <Tooltip contentStyle={{ background: '#0f1e2b', border: '1px solid #24445d', borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#14b85f" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="grid h-48 place-items-center text-center text-night-400"><div><Calendar className="mx-auto mb-2" /> No history yet</div></div>
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-display text-lg font-semibold">Latest Soil Snapshot</div>
            {soil ? <Badge color={soil.status === 'Healthy' ? 'brand' : soil.status === 'Moderate' ? 'amber' : 'red'}>{soil.status}</Badge> : <Badge color="gray">No report</Badge>}
          </div>
          {soil ? (
            <div className="space-y-4">
              <Nutrient label="Nitrogen (N)" value={soil.nitrogen} max={280} unit="kg/ha" />
              <Nutrient label="Phosphorus (P)" value={soil.phosphorus} max={60} unit="kg/ha" />
              <Nutrient label="Potassium (K)" value={soil.potassium} max={280} unit="kg/ha" />
              <Nutrient label="Organic Carbon" value={soil.organic_carbon * 100} max={100} unit="%" />
              <div className="grid grid-cols-2 gap-4 pt-2">
                <Stat label="pH" value={soil.ph} accent="soil" />
                <Stat label="EC (dS/m)" value={soil.ec} sub="Salinity" accent="soil" />
              </div>
            </div>
          ) : (
            <div className="text-sm text-night-400 py-8 text-center">Upload a soil test in the Soil Analyzer module.</div>
          )}
        </Card>

        <Card className="p-6">
          <div className="font-display text-lg font-semibold mb-4">Digital Twin Insights</div>
          <div className="space-y-3">
            <InsightRow icon={Gauge} label="Water stress index" value="Low (12%)" color="text-brand-300" />
            <InsightRow icon={Activity} label="NDVI (vegetation)" value="0.78 — Healthy" color="text-brand-300" />
            <InsightRow icon={Sprout} label="Growth stage" value="Heading → Grain filling" color="text-sky-300" />
            <InsightRow icon={Droplets} label="Irrigation due" value="In 3 days" color="text-amber-300" />
            <InsightRow icon={ShieldCheck} label="Pest risk" value="Low — armyworm watch" color="text-brand-300" />
          </div>
          <div className="mt-6 rounded-xl bg-brand-500/10 p-4 border border-brand-500/20">
            <div className="text-sm font-semibold text-brand-200">AI Recommendation</div>
            <p className="text-sm text-night-200 mt-1">Apply one light irrigation in 3 days, top-dress 25kg urea per acre, and scout for stem borer in lower canopy.</p>
          </div>
        </Card>
      </div>

      {showAdd && <AddFarmModal onClose={() => setShowAdd(false)} onAdd={addFarm} />}
    </Section>
  )
}

function Meta({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-night-800/50 p-3">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-night-700 text-brand-300"><Icon size={16} /></span>
      <div><div className="text-xs text-night-400">{label}</div><div className="text-sm font-semibold">{value}</div></div>
    </div>
  )
}
function Nutrient({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm"><span className="text-night-200">{label}</span><span className="font-semibold">{value} {unit}</span></div>
      <Progress value={value} max={max} accent="soil" />
    </div>
  )
}
function InsightRow({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between border-b border-night-800 pb-2 last:border-0">
      <div className="flex items-center gap-2 text-sm text-night-300"><Icon size={15} /> {label}</div>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  )
}

function AddFarmModal({ onClose, onAdd }: { onClose: () => void; onAdd: (f: Partial<Farm>) => void }) {
  const [form, setForm] = useState({
    farm_name: '', farmer_name: '', location: 'Kota, Rajasthan', state: 'Rajasthan',
    farm_size_acres: 2, soil_type: 'Loamy (Alluvial)', water_source: 'Tube Well', primary_crop: 'Wheat'
  })
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-xl font-bold mb-4">Create Digital Farm Twin</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Farm name" value={form.farm_name} onChange={(v) => setForm({ ...form, farm_name: v })} />
          <Input label="Farmer name" value={form.farmer_name} onChange={(v) => setForm({ ...form, farmer_name: v })} />
          <Input label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <Input label="Size (acres)" type="number" value={String(form.farm_size_acres)} onChange={(v) => setForm({ ...form, farm_size_acres: +v })} />
          <Select label="Soil type" value={form.soil_type} options={['Loamy (Alluvial)', 'Sandy', 'Clay', 'Black (Regur)', 'Red']} onChange={(v) => setForm({ ...form, soil_type: v })} />
          <Select label="Water source" value={form.water_source} options={['Tube Well', 'Canal', 'Open Well', 'Rainfed', 'Drip']} onChange={(v) => setForm({ ...form, water_source: v })} />
          <Select label="Primary crop" value={form.primary_crop} options={['Wheat', 'Mustard', 'Bajra', 'Gram', 'Soybean', 'Maize', 'Cotton']} onChange={(v) => setForm({ ...form, primary_crop: v })} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={() => onAdd(form)} className="btn-primary">Generate AI Twin</button>
        </div>
      </div>
    </div>
  )
}
function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block"><span className="label">{label}</span>
      <input className="input mt-1" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}
function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block"><span className="label">{label}</span>
      <select className="input mt-1" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}
