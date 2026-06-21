import { Link } from 'react-router-dom'
import { ArrowRight, Satellite, Sprout, Droplets, LineChart, Mic, Users, Shield, Store, Brain, MapPin, TrendingUp } from 'lucide-react'
import { LineChart as RChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { useLang } from '../i18n/LanguageContext'
import { Stat } from '../components/ui'
import { mandiPrices } from '../lib/data'

const MODULES = [
  { to: '/farm', icon: Sprout, title: 'Digital Farm Twin', desc: 'Live health & productivity score for every field.', color: 'from-brand-500/20' },
  { to: '/satellite', icon: Satellite, title: 'Satellite Monitoring', desc: 'NDVI vegetation, drought & water stress.', color: 'from-sky-500/20' },
  { to: '/planner', icon: Brain, title: 'AI Crop Planner', desc: 'Best crop by soil, weather & market demand.', color: 'from-brand-400/20' },
  { to: '/irrigation', icon: Droplets, title: 'Smart Irrigation', desc: 'Water calculator + rain prediction.', color: 'from-blue-500/20' },
  { to: '/soil', icon: Shield, title: 'Soil Health Analyzer', desc: 'NPK reports and improvement plans.', color: 'from-soil-400/20' },
  { to: '/market', icon: Store, title: 'Agri Marketplace', desc: 'Seeds, inputs & equipment with reviews.', color: 'from-amber-500/20' },
  { to: '/prices', icon: TrendingUp, title: 'AI Price Forecast', desc: 'Best selling date for maximum profit.', color: 'from-emerald-500/20' },
  { to: '/services', icon: MapPin, title: 'Nearby Services', desc: 'KVK, labs, rentals — one-click actions.', color: 'from-teal-500/20' },
  { to: '/community', icon: Users, title: 'Farm Community', desc: 'Crop-specific groups & expert Q&A.', color: 'from-indigo-500/20' },
  { to: '/alerts', icon: Shield, title: 'Emergency Alerts', desc: 'Flood, heatwave, pest & advisories.', color: 'from-red-500/20' }
]

const TREND = mandiPrices.Wheat.map((v, i) => ({ m: `M${i + 1}`, v }))

export default function Home() {
  const { t } = useLang()

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden hero-grad grid-bg">
        <div className="container-app relative py-16 sm:py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <div className="chip mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" />
                {t('hero.badge')}
              </div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] text-balance">
                {t('hero.title').split('—')[0]}—
                <span className="gradient-text"> {t('hero.title').split('—')[1]}</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-night-300 text-balance">{t('hero.subtitle')}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/farm" className="btn-primary text-base">
                  {t('cta.start')} <ArrowRight size={18} />
                </Link>
                <Link to="/satellite" className="btn-ghost text-base">{t('cta.explore')}</Link>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                <Stat label="Farmers" value="12k+" sub="onboarded" />
                <Stat label="Villages" value="340" sub="Rajasthan" accent="soil" />
                <Stat label="Avg yield ↑" value="23%" sub="vs baseline" accent="night" />
              </div>
            </div>

            {/* Floating visual: live NDVI mock + voice orb */}
            <div className="relative">
              <div className="absolute -inset-10 rounded-full bg-brand-500/10 blur-3xl" />
              <div className="relative card p-6 animate-floaty">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600"><Satellite size={16} /></span>
                    <span className="font-semibold">NDVI — Field A1</span>
                  </div>
                  <span className="chip">Live</span>
                </div>
                <div className="mt-4 h-44">
                  <ResponsiveContainer>
                    <AreaChart data={TREND}>
                      <defs>
                        <linearGradient id="ndvi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14b85f" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#14b85f" stopOpacity={0} />
                      </linearGradient>
                      </defs>
                      <Area dataKey="v" stroke="#14b85f" strokeWidth={2} fill="url(#ndvi)" />
                      <XAxis dataKey="m" hide />
                      <YAxis hide domain={[2000, 2500]} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex justify-between text-xs text-night-400">
                  <span>Vegetation health 0.78</span>
                  <span className="text-brand-300">▲ 4.2%</span>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 card p-3 flex items-center gap-3">
                <div className="relative grid h-10 w-10 place-items-center rounded-full bg-brand-600">
                  <Mic size={16} />
                  <span className="absolute inset-0 rounded-full bg-brand-500 animate-pulseRing" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Voice-first farming</div>
                  <div className="text-xs text-night-400">"Go to satellite monitoring"</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-night-800 bg-night-900/50">
        <div className="container-app grid grid-cols-2 lg:grid-cols-4 gap-6 py-10">
          <div className="flex items-center gap-3"><Satellite className="text-brand-300" /><div><div className="font-bold text-xl">18</div><div className="text-xs text-night-400">Data layers per farm</div></div></div>
          <div className="flex items-center gap-3"><Brain className="text-brand-300" /><div><div className="font-bold text-xl">Gemini AI</div><div className="text-xs text-night-400">Crop advisory engine</div></div></div>
          <div className="flex items-center gap-3"><LineChart className="text-brand-300" /><div><div className="font-bold text-xl">92%</div><div className="text-xs text-night-400">Forecast accuracy</div></div></div>
          <div className="flex items-center gap-3"><Mic className="text-brand-300" /><div><div className="font-bold text-xl">3 lang</div><div className="text-xs text-night-400">Hindi · English · Rajasthani</div></div></div>
        </div>
      </section>

      {/* MODULES */}
      <section className="py-16">
        <div className="container-app">
          <div className="mb-8 text-center">
            <span className="chip">Every feature in one app</span>
            <h2 className="section-title mt-4">One platform for the full farming lifecycle</h2>
            <p className="section-sub mx-auto">From soil testing to mandi sale — 16 connected modules working as a single intelligence layer.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((m) => (
              <Link key={m.to} to={m.to}
                className={`card card-hover group overflow-hidden p-6 bg-gradient-to-br ${m.color} to-transparent`}>
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-night-800/70 text-brand-300">
                    <m.icon size={18} />
                  </span>
                  <ArrowRight size={16} className="text-night-500 group-hover:text-brand-300 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{m.title}</h3>
                <p className="mt-1 text-sm text-night-300">{m.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PRICE FORECAST TEASER */}
      <section className="py-16">
        <div className="container-app grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <span className="chip">AI Price Forecasting</span>
            <h2 className="section-title mt-3">Sell at the right mandi, on the right date</h2>
            <p className="section-sub">Time-series model trained on 5-year Rajasthan mandi data, weather signals and demand. Know tomorrow's wheat price — today.</p>
            <Link to="/prices" className="btn-primary mt-6 inline-flex">See forecast <ArrowRight size={16} /></Link>
          </div>
          <div className="card p-6">
            <div className="text-sm text-night-300">Wheat price trend — Kota mandi (₹/qtl)</div>
            <div className="h-60 mt-3">
              <ResponsiveContainer>
                <RChart data={TREND}>
                  <Line dataKey="v" stroke="#3acc7a" strokeWidth={2.5} dot={false} />
                  <XAxis dataKey="m" stroke="#5a7b8a" fontSize={11} />
                  <YAxis stroke="#5a7b8a" fontSize={11} domain={[2000, 2500]} />
                  <Tooltip contentStyle={{ background: '#0f1e2b', border: '1px solid #24445d', borderRadius: 8 }} />
                </RChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 hero-grad" />
        <div className="container-app relative text-center">
          <h2 className="font-display text-3xl sm:text-5xl font-bold text-balance max-w-3xl mx-auto">
            Built for the <span className="gradient-text">6 billion people</span> whose livelihoods depend on the monsoon.
          </h2>
          <p className="mt-4 text-night-300 max-w-xl mx-auto">Free for smallholder farmers. Voice-first. Works in Hindi, English and Rajasthani, even on 2G.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/farm" className="btn-primary text-base">{t('cta.start')} <ArrowRight size={18} /></Link>
            <Link to="/community" className="btn-ghost text-base">Join the community</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
