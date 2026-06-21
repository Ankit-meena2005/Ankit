import { useEffect, useState } from 'react'
import { Phone, MessageCircle, MapPin, Navigation, Bookmark, Search, Building2, FlaskConical, ShoppingBag, Sprout, Tractor, Snowflake, Warehouse, Landmark, BookmarkCheck, Locate, Loader as Loader2 } from 'lucide-react'
import { Section, Card, Badge } from '../components/ui'
import { fetchServices, type NearbyService } from '../lib/data'
import { distanceKm } from '../lib/weather'
import { useToast } from '../lib/toast'
import { useLang } from '../i18n/LanguageContext'

const DEFAULTS: NearbyService[] = [
  { id: 'n1', name: 'Krishi Vigyan Kendra Kota', category: 'KVK', distance_km: 6.2, address: 'Borawand, Kota', phone: '+919000000001', whatsapp: '+919000000001', lat: 25.2138, lng: 75.8648 },
  { id: 'n2', name: 'Agriculture University Kota', category: 'University', distance_km: 9.4, address: 'Rawatbhata Rd, Kota', phone: '+919000000002', whatsapp: '+919000000002', lat: 25.18, lng: 75.82 },
  { id: 'n3', name: 'Soil Testing Lab — Dept. of Agri', category: 'Soil Lab', distance_km: 4.1, address: 'Pologround, Kota', phone: '+919000000003', whatsapp: '+919000000003', lat: 25.19, lng: 75.86 },
  { id: 'n4', name: 'Shree Fertilizer & Seed Center', category: 'Fertilizer Shop', distance_km: 2.0, address: 'Main Market, Kota', phone: '+919000000004', whatsapp: '+919000000004', lat: 25.22, lng: 75.87 },
  { id: 'n5', name: 'Beej Nigam Seed Store', category: 'Seed Shop', distance_km: 3.3, address: 'Indra Vihar, Kota', phone: '+919000000005', whatsapp: '+919000000005', lat: 25.21, lng: 75.85 },
  { id: 'n6', name: 'Meena Tractor Rental', category: 'Tractor Rental', distance_km: 5.5, address: 'Village Rathola', phone: '+919000000006', whatsapp: '+919000000006', lat: 25.27, lng: 75.91 },
  { id: 'n7', name: 'Hadoti Cold Storage', category: 'Cold Storage', distance_km: 12.0, address: 'Choumuhan, Kota', phone: '+919000000007', whatsapp: '+919000000007', lat: 25.16, lng: 75.79 },
  { id: 'n8', name: 'Central Warehouse — FCI', category: 'Warehouse', distance_km: 14.2, address: 'Dadabari, Kota', phone: '+919000000008', whatsapp: '+919000000008', lat: 25.15, lng: 75.78 },
  { id: 'n9', name: 'Joint Director Agriculture Office', category: 'Govt Office', distance_km: 7.0, address: 'Zonal Office, Kota', phone: '+919000000009', whatsapp: '+919000000009', lat: 25.2, lng: 75.84 }
]

const CAT_ICONS: Record<string, any> = {
  KVK: Sprout, University: Building2, 'Soil Lab': FlaskConical,
  'Fertilizer Shop': ShoppingBag, 'Seed Shop': Sprout, 'Tractor Rental': Tractor,
  'Cold Storage': Snowflake, Warehouse: Warehouse, 'Govt Office': Landmark
}

const CATS = ['All', 'KVK', 'University', 'Soil Lab', 'Fertilizer Shop', 'Seed Shop', 'Tractor Rental', 'Cold Storage', 'Warehouse', 'Govt Office']

export default function Services() {
  const [list, setList] = useState<NearbyService[]>(DEFAULTS)
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')
  const [saved, setSaved] = useState<string[]>([])
  const [locating, setLocating] = useState(false)
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null)
  const { t } = useLang()
  const toast = useToast()

  useEffect(() => { fetchServices().then((d) => { if (d.length) setList(d) }) }, [])

  const locate = () => {
    if (!navigator.geolocation) { toast.push('Geolocation unavailable', 'error'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserLoc(loc)
        setList((items) => items.map((s) => ({
          ...s,
          distance_km: +distanceKm(loc, { lat: s.lat, lng: s.lng }).toFixed(1)
        })).sort((a, b) => a.distance_km - b.distance_km))
        setLocating(false)
        toast.push('Sorted by real distance from your location', 'success')
      },
      () => { setLocating(false); toast.push('Could not get location', 'error') },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const filtered = list.filter((s) =>
    (cat === 'All' || s.category === cat) && (!q || (s.name + s.address).toLowerCase().includes(q.toLowerCase()))
  ).sort((a, b) => a.distance_km - b.distance_km)

  const toggleSave = (id: string) => {
    setSaved((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])
    toast.push(saved.includes(id) ? 'Removed from saved' : 'Saved for offline access', 'success')
  }

  // Build OSM bbox around all listed services
  const lats = filtered.map((s) => s.lat), lngs = filtered.map((s) => s.lng)
  if (userLoc) { lats.push(userLoc.lat); lngs.push(userLoc.lng) }
  const minLat = Math.min(...lats) - 0.02, maxLat = Math.max(...lats) + 0.02
  const minLng = Math.min(...lngs) - 0.02, maxLng = Math.max(...lngs) + 0.02
  const markers = filtered.map((s) => `${s.lat},${s.lng}`).join('/')
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${markers}`

  return (
    <Section
      title="Nearby Services"
      subtitle="Find the nearest Krishi Vigyan Kendra, soil lab, seed/fertilizer shop, rental center and more — with one-click Call, WhatsApp, Maps and Save."
      action={
        <button onClick={locate} disabled={locating} className="btn-primary">
          {locating ? <Loader2 size={16} className="animate-spin" /> : <Locate size={16} />} Use my location
        </button>
      }
    >
      <Card className="p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-400" />
          <input className="input pl-9" placeholder="Search services…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3 py-1.5 text-xs transition-colors ${c === cat ? 'bg-brand-500 text-white' : 'border border-night-700 text-night-200 hover:text-white'}`}>{c}</button>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => {
          const Icon = CAT_ICONS[s.category] ?? MapPin
          const mapsUrl = `https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lng}#map=17/${s.lat}/${s.lng}`
          const dirUrl = `https://www.openstreetmap.org/directions?from=${userLoc ? userLoc.lat + '%2C' + userLoc.lng : ''}&to=${s.lat}%2C${s.lng}`
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

      <iframe title="nearby-map" className="mt-6 w-full rounded-2xl border border-night-800 h-80" src={mapSrc} />

      {saved.length > 0 && (
        <Card className="p-6 mt-6 bg-gradient-to-br from-brand-500/10 to-transparent border-brand-500/30">
          <div className="font-display text-lg font-semibold">{saved.length} services saved offline</div>
          <p className="text-sm text-night-300 mt-1">Available without internet on your next visit.</p>
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
