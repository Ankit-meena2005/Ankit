import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic, MicOff, Languages } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { useVoice } from '../lib/voice'

const NAV = [
  { to: '/farm', label: 'nav.farm' as const },
  { to: '/satellite', label: 'nav.satellite' as const },
  { to: '/planner', label: 'nav.planner' as const },
  { to: '/irrigation', label: 'nav.irrigation' as const },
  { to: '/soil', label: 'nav.soil' as const },
  { to: '/market', label: 'nav.market' as const },
  { to: '/prices', label: 'nav.prices' as const },
  { to: '/jobs', label: 'nav.jobs' as const },
  { to: '/finance', label: 'nav.finance' as const },
  { to: '/image', label: 'nav.image' as const },
  { to: '/community', label: 'nav.community' as const },
  { to: '/alerts', label: 'nav.alerts' as const },
  { to: '/rajasthan', label: 'nav.rajasthan' as const },
  { to: '/services', label: 'nav.services' as const },
  { to: '/analytics', label: 'nav.analytics' as const },
  { to: '/admin', label: 'nav.admin' as const }
]

export default function Navbar() {
  const { t, lang, setLang } = useLang()
  const { listening, supported, start, stop } = useVoice()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const cycleLang = () => setLang(lang === 'en' ? 'hi' : lang === 'hi' ? 'rj' : 'en')

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass border-b border-night-800' : 'bg-transparent'
    }`}>
      <nav className="container-app flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg">
            🌾
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            Farm<span className="gradient-text">SOS</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {NAV.slice(0, 9).map((n) => (
            <Link key={n.to} to={n.to}
              className="rounded-lg px-3 py-1.5 text-sm text-night-200 transition-colors hover:bg-night-800 hover:text-white">
              {t(n.label)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {supported && (
            <button
              onClick={listening ? stop : start}
              className={`grid h-9 w-9 place-items-center rounded-xl border transition-colors ${
                listening ? 'border-red-500/50 bg-red-500/10 text-red-300' : 'border-night-700 bg-night-800/60 text-night-100 hover:text-white'
              }`}
              title={listening ? 'Stop voice' : 'Start voice navigation'}
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
              {listening && <span className="absolute mt-7 h-2 w-2 rounded-full bg-red-400 animate-pulseRing" />}
            </button>
          )}
          <button onClick={cycleLang}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-night-700 bg-night-800/60 px-3 text-sm text-night-100 hover:text-white">
            <Languages size={15} /> {lang.toUpperCase()}
          </button>
          <Link to="/farm" className="btn-primary hidden sm:inline-flex">{t('cta.start')}</Link>
          <button onClick={() => setOpen(!open)} className="lg:hidden grid h-9 w-9 place-items-center rounded-xl border border-night-700 bg-night-800/60">
            <div className="space-y-1">
              <span className="block h-0.5 w-4 bg-white" />
              <span className="block h-0.5 w-4 bg-white" />
              <span className="block h-0.5 w-4 bg-white" />
            </div>
          </button>
        </div>
      </nav>

      {open && (
        <div className="lg:hidden glass border-t border-night-800">
          <div className="container-app py-3 grid grid-cols-3 gap-2">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className="rounded-lg bg-night-800/60 px-2 py-2 text-center text-xs text-night-100 hover:text-white">
                {t(n.label)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
