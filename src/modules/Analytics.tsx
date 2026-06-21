import { TrendingUp, IndianRupee, PiggyBank, TriangleAlert as AlertTriangle, ChartLine as LI } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, PolarAngleAxis, BarChart, Bar, Legend
} from 'recharts'
import { Section, Card, Stat, Badge } from '../components/ui'

const YIELD = Array.from({ length: 12 }, (_, i) => ({
  m: `M${i + 1}`, actual: 14 + i * 0.6 + (Math.random() - 0.5) * 2,
  predicted: 14 + i * 0.6 + 1
}))

const REVENUE = Array.from({ length: 6 }, (_, i) => ({
  y: `Y${i + 1}`, rev: 180 + i * 24 + Math.random() * 8, cost: 130 + i * 12
}))

const RISK = [
  { name: 'Weather', value: 35, fill: '#60a5fa' },
  { name: 'Pest', value: 22, fill: '#ef4444' },
  { name: 'Market', value: 48, fill: '#f59e0b' },
  { name: 'Water', value: 30, fill: '#3acc7a' }
]

export default function Analytics() {
  return (
    <Section
      title="Analytics Center"
      subtitle="Yield prediction, revenue and cost forecasting, profit projection and risk forecasting — in one dashboard."
      action={<Badge color="brand"><LI size={12} /> ML Forecast Engine</Badge>}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <Stat label="Predicted yield" value="19.8 qtl/ac" sub="▲ 6.2% vs avg" />
        <Stat label="Revenue forecast" value="₹248k" sub="next 12 mo" accent="soil" />
        <Stat label="Cost forecast" value="₹112k" sub="inputs + labour" accent="night" />
        <Stat label="Net profit" value="₹136k" sub="margin 55%" />
        <Stat label="Risk index" value="34/100" sub="Moderate" accent="night" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3"><TrendingUp className="text-brand-300" /><div className="font-display text-lg font-semibold">Yield prediction (qtl/acre)</div></div>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={YIELD}>
                <defs>
                  <linearGradient id="yp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b85f" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#14b85f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" stroke="#5a7b8a" fontSize={10} />
                <YAxis stroke="#5a7b8a" fontSize={10} />
                <Tooltip contentStyle={{ background: '#0f1e2b', border: '1px solid #24445d', borderRadius: 8 }} />
                <Area dataKey="actual" stroke="#3acc7a" strokeWidth={2} fill="url(#yp)" />
                <Area dataKey="predicted" stroke="#fbbf24" strokeWidth={2} strokeDasharray="4 4" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-3"><IndianRupee className="text-brand-300" /><div className="font-display text-lg font-semibold">Revenue vs cost (6 yr)</div></div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={REVENUE}>
                <XAxis dataKey="y" stroke="#5a7b8a" fontSize={11} />
                <YAxis stroke="#5a7b8a" fontSize={11} tickFormatter={(v) => `₹${v}k`} />
                <Tooltip contentStyle={{ background: '#0f1e2b', border: '1px solid #24445d', borderRadius: 8 }} formatter={(v: any) => `₹${v}k`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="rev" name="Revenue" fill="#14b85f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mt-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="text-amber-300" /><div className="font-display text-lg font-semibold">Risk breakdown</div></div>
          <div className="h-56">
            <ResponsiveContainer>
              <RadialBarChart innerRadius="20%" outerRadius="100%" data={RISK} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={8} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3"><PiggyBank className="text-brand-300" /><div className="font-display text-lg font-semibold">Profit forecast scenarios</div></div>
          <div className="space-y-3">
            {[
              { s: 'Optimistic', r: '₹186k', p: 85, c: 'text-brand-300' },
              { s: 'Base case', r: '₹136k', p: 62, c: 'text-sky-300' },
              { s: 'Pessimistic', r: '₹72k', p: 38, c: 'text-amber-300' },
              { s: 'Drought stress', r: '-₹18k', p: 12, c: 'text-red-300' }
            ].map((sc) => (
              <div key={sc.s} className="flex items-center gap-3">
                <span className="text-sm w-28 text-night-200">{sc.s}</span>
                <div className="flex-1 h-2.5 rounded-full bg-night-800 overflow-hidden">
                  <div className={`h-full ${sc.c.replace('text-', 'bg-')}`} style={{ width: `${sc.p}%` }} />
                </div>
                <span className={`text-sm font-semibold w-16 text-right ${sc.c}`}>{sc.r}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-night-400">Models use IMD weather, market price series and 5-year farm records.</div>
        </Card>
      </div>
    </Section>
  )
}
