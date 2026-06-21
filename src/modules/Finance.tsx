import { useState } from 'react'
import { Landmark, ShieldCheck, Gift, Wallet, Calculator, IndianRupee } from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis
} from 'recharts'
import { Section, Card, Stat, Badge, Progress } from '../components/ui'

export default function Finance() {
  const [income, setIncome] = useState(180000)
  const [acres, setAcres] = useState(4.5)
  const [loanAmt, setLoanAmt] = useState(50000)

  const eligible = loanAmt <= Math.min(200000, income * 1.5) && acres >= 1
  const cashflows = [
    { name: 'Income', value: income },
    { name: 'Inputs', value: Math.round(income * 0.35) },
    { name: 'Labour', value: Math.round(income * 0.22) },
    { name: 'Machinery', value: Math.round(income * 0.13) },
    { name: 'Surplus', value: Math.round(income * 0.30) }
  ]
  const PIE = ['#14b85f', '#ef4444', '#f59e0b', '#60a5fa', '#3acc7a']
  const yearlyProfit = [
    { year: '2021', profit: 24000 },
    { year: '2022', profit: 31000 },
    { year: '2023', profit: 28000 },
    { year: '2024', profit: 42000 },
    { year: '2025', profit: 47000 }
  ]

  return (
    <Section
      title="Farmer Finance Center"
      subtitle="Loan eligibility, crop insurance, subsidy discovery and a financial planning dashboard."
      action={<Badge color="brand"><Landmark size={12} /> PM-Kisan Linked</Badge>}
    >
      {/* Eligibility checker */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4"><Calculator className="text-brand-300" /><div className="font-display text-lg font-semibold">Loan eligibility checker</div></div>
        <div className="grid gap-4 sm:grid-cols-3">
          <label>
            <span className="label">Annual farm income (₹)</span>
            <input type="number" className="input mt-1" value={income} onChange={(e) => setIncome(+e.target.value)} />
          </label>
          <label>
            <span className="label">Land (acres)</span>
            <input type="number" className="input mt-1" value={acres} onChange={(e) => setAcres(+e.target.value)} />
          </label>
          <label>
            <span className="label">Desired loan (₹)</span>
            <input type="number" className="input mt-1" value={loanAmt} onChange={(e) => setLoanAmt(+e.target.value)} />
          </label>
        </div>
        <div className={`mt-4 rounded-xl p-4 ${eligible ? 'bg-brand-500/10 border border-brand-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
          <div className="flex items-center gap-2">
            {eligible ? <ShieldCheck className="text-brand-300" /> : <ShieldCheck className="text-red-300" />}
            <span className="font-semibold">{eligible ? 'Eligible' : 'Not eligible at this amount'}</span>
          </div>
          <p className="text-sm text-night-300 mt-1">
            {eligible
              ? `KCC crop loan up to ₹${Math.min(200000, income * 1.5).toLocaleString()} at 4% effective rate (incl. interest subvention).`
              : `Reduce loan amount below ₹${Math.min(200000, income * 1.5).toLocaleString()} or pledge more land.`}
          </p>
        </div>
      </Card>

      {/* Insurance + subsidy */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3"><ShieldCheck className="text-brand-300" /><div className="font-display text-lg font-semibold">Crop insurance (PMFBY)</div></div>
          <div className="space-y-3">
            <InsRow label="Premium share (farmer)" value="1.5% of sum insured" />
            <InsRow label="Sum insured" value={`₹${(acres * 40000).toLocaleString()}`} />
            <InsRow label="Premium payable" value={`₹${Math.round(acres * 40000 * 0.015).toLocaleString()}`} />
            <InsRow label="Coverage" value="Drought · flood · pest · hailstorm" />
          </div>
          <button className="btn-outline mt-4 w-full">Enroll crop insurance</button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3"><Gift className="text-amber-300" /><div className="font-display text-lg font-semibold">Subsidy recommendations</div></div>
          <div className="space-y-2">
            {[
              { n: 'PM-Kisan', a: '₹6,000/yr', e: 90 },
              { n: 'Drip irrigation', a: '55–90% subsidy', e: 70 },
              { n: 'Soil Health Card', a: 'Free soil test', e: 100 },
              { n: 'Solar pump', a: '60% subsidy', e: 45 }
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-night-800 bg-night-800/40 p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">{s.n}</span>
                  <span className="text-xs text-brand-300">{s.a}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={s.e} />
                  <span className="text-xs text-night-400">{s.e}% match</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Dashboard */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3"><Wallet className="text-brand-300" /><div className="font-display text-lg font-semibold">Cash flow breakdown</div></div>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={cashflows} dataKey="value" nameKey="name" outerRadius={90} label>
                  {cashflows.map((_, i) => <Cell key={i} fill={PIE[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f1e2b', border: '1px solid #24445d', borderRadius: 8 }} formatter={(v: any) => `₹${(+v).toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3"><IndianRupee className="text-brand-300" /><div className="font-display text-lg font-semibold">Profit trend (5 yr)</div></div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={yearlyProfit}>
                <XAxis dataKey="year" stroke="#5a7b8a" fontSize={11} />
                <YAxis stroke="#5a7b8a" fontSize={11} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip contentStyle={{ background: '#0f1e2b', border: '1px solid #24445d', borderRadius: 8 }} formatter={(v: any) => `₹${(+v).toLocaleString()}`} />
                <Bar dataKey="profit" fill="#14b85f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mt-6">
        <Stat label="Net profit" value={`₹${(income * 0.30 / 1000).toFixed(0)}k`} />
        <Stat label="Loan EMI (4%)" value={`₹${Math.round((loanAmt * 0.0093)).toLocaleString()}/mo`} accent="soil" sub="3 yr tenure" />
        <Stat label="Annual surplus" value={`₹${(income * 0.30 / 12).toFixed(0)}`} accent="night" />
      </div>
    </Section>
  )
}

function InsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-night-300">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
