import { type ReactNode } from 'react'
import { Star } from 'lucide-react'

export function Section({ id, title, subtitle, children, action }: {
  id?: string; title?: string; subtitle?: string; children: ReactNode; action?: ReactNode
}) {
  return (
    <section id={id} className="py-10 sm:py-14">
      <div className="container-app">
        {(title || action) && (
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              {title && (
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
                  {title}
                </h2>
              )}
              {subtitle && <p className="mt-1.5 text-night-300">{subtitle}</p>}
            </div>
            {action}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function Stat({ label, value, sub, accent = 'brand' }: {
  label: string; value: ReactNode; sub?: string; accent?: 'brand' | 'soil' | 'night'
}) {
  const colors = {
    brand: 'text-brand-300', soil: 'text-soil-300', night: 'text-night-200'
  }
  return (
    <Card className="p-5">
      <div className="label">{label}</div>
      <div className={`mt-2 font-display text-3xl font-bold ${colors[accent]}`}>{value}</div>
      {sub && <div className="mt-1 text-sm text-night-400">{sub}</div>}
    </Card>
  )
}

export function Stars({ value, count }: { value: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={14}
            className={i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-night-600'}
          />
        ))}
      </div>
      <span className="text-xs text-night-300">{value.toFixed(1)}{count ? ` (${count})` : ''}</span>
    </div>
  )
}

export function Badge({ children, color = 'brand' }: { children: ReactNode; color?: 'brand' | 'amber' | 'red' | 'blue' | 'gray' }) {
  const map = {
    brand: 'bg-brand-500/15 text-brand-300 border-brand-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    red: 'bg-red-500/15 text-red-300 border-red-500/30',
    blue: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    gray: 'bg-night-700/50 text-night-200 border-night-600'
  }
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[color]}`}>{children}</span>
}

export function Progress({ value, max = 100, accent = 'brand' }: { value: number; max?: number; accent?: 'brand' | 'soil' }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const c = accent === 'soil' ? 'bg-soil-400' : 'bg-brand-500'
  return (
    <div className="h-2 w-full rounded-full bg-night-800 overflow-hidden">
      <div className={`h-full ${c}`} style={{ width: `${pct}%` }} />
    </div>
  )
}
