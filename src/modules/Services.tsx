import { useState } from 'react'
import {
  Phone, MessageCircle, MapPin, Navigation, Bookmark, Search, Building2,
  FlaskConical, ShoppingBag, Sprout, Tractor, Snowflake, Warehouse, Landmark, BookmarkCheck
} from 'lucide-react'
import { Section, Card, Badge } from '../components/ui'
import { nearbyServices } from '../lib/data'
import { useToast } from '../lib/toast'
import { useLang } from '../i18n/LanguageContext'

const CAT_ICONS: Record<string, any> = {
  KVK: Sprout, University: Building2, 'Soil Lab': FlaskConical,
  'Fertilizer Shop': ShoppingBag, 'Seed Shop': Sprout, 'Tractor Rental': Tractor,
  'Cold Storage': Snowflake, Warehouse: Warehouse, 'Govt Office': Landmark
}

const CATS = ['All', 'KVK', 'University', 'Soil Lab', 'Fertilizer Shop', 'Seed Shop', 'Tractor Rental', 'Cold Storage', 'Warehouse', 'Govt Office']

export default function Services() {
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')
  const [saved, setSaved] = useState<string[]>([])
  const { t } = useLang()
  const toast = useToast()

  const list = nearbyServices.filter((s) =>
    (cat === 'All' || s.category === cat) && (!q || (s.name + s.address).toLowerCase().includes(q.toLowerCase()))
  ).sort((a, b) => a.distance_km - b.distance_km)

  const toggleSave = (id: string) => {
    setSaved((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])
    toast.push(saved.includes(id) ? 'Removed from saved' : 'Saved for offline access', 'success')
  }

  return (
    <Section
      title="Nearby Services"
      subtitle="Find the nearest Krishi Vigyan Kendra, soil lab, seed/fertilizer shop, rental center and more — with one-click call, WhatsApp, maps and save."
      action={<Badge color="brand">{list.length} nearby</Badge>}
    >
      <Card className="p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-400" />
          <input className="input pl-9" placeholder="Search services…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`rounded-full px-3 py-1.5 text-xs transition-colors ${c === cat ? 'bg-brand-500 text-white' : 'border border-night-700 text-night-200 hover:text-white'}`}>
              {c}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => {
          const Icon = CAT_ICONS[s.category] ?? MapPin
          const mapsUrl = `https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lng}#map=17/${s.lat}/${s.lng}`
          const dirUrl = `https://www.openstreetmap.org/directions?from=&to=${s.lat}%2C${s.lng}`
          const telUrl = `tel:${s.phone}`
          const waUrl = `https://wa.me/${s.whatsapp.replace(/[^0-9]/g, '')}`
          const isSaved = saved.includes(s.id)
          return (
            <Card key={s.id} className="p-5 card-hover">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300"><Icon size={20} /></span>
                <div className="flex-1">
                  <div className="font-semibold leading-tight">{s.name}</div>
                  <Badge color="gray">{s.category}</Badge>
                </div>
                <button onClick={() => toggleSave(s.id)} className="text-night-400 hover:text-brand-300" title={t('common.save')}>
                  {isSaved ? <BookmarkCheck size={18} className="text-brand-300" /> : <Bookmark size={18} />}
                </button>
              </div>
              <div className="mt-3 space-y-1 text-sm text-night-300">
                <div className="flex items-center gap-2"><MapPin size={13} /> {s.address}</div>
                <div className="flex items-center gap-2"><Navigation size={13} className="text-brand-300" /> {s.distance_km} km away</div>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2">
                <Action href={telUrl} icon={Phone} label={t('common.call')} color="text-brand-300" />
                <Action href={waUrl} icon={MessageCircle} label={t('common.whatsapp')} color="text-emerald-300" />
                <Action href={mapsUrl} icon={MapPin} label={t('common.maps')} color="text-sky-300" />
                <Action href={dirUrl} icon={Navigation} label={t('common.directions')} color="text-amber-300" />
              </div>
            </Card>
          )
        })}
      </div>

      {
        <iframe
          title="map"
          className="mt-6 w-full rounded-2xl border border-night-800 h-80"
          src="https://www.openstreetmap.org/export/embed.html?bbox=75.7%2C25.05%2C76.0%2C25.35&layer=mapnik&marker=25.2138%2C75.8648"
        />
      }

      {saved.length > 0 && (
        <Card className="p-6 mt-6 bg-gradient-to-br from-brand-500/10 to-transparent border-brand-500/30">
          <div className="font-display text-lg font-semibold">{saved.length} services saved offline</div>
          <p className="text-sm text-night-300 mt-1">These will be available without internet on your next visit.</p>
        </Card>
      )}
    </Section>
  )
}

function Action({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color: string }) {
  return (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
      className="grid place-items-center gap-1 rounded-xl border border-night-800 bg-night-800/40 py-2 text-xs text-night-200 hover:border-brand-500/40 transition-colors">
      <Icon size={16} className={color} />
      <span className="text-[10px]">{label}</span>
    </a>
  )
}
