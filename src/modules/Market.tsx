import { useEffect, useMemo, useState } from 'react'
import { Search, ShoppingCart, GitCompare, Star, Package } from 'lucide-react'
import { Section, Card, Stars, Badge } from '../components/ui'
import { fetchMarketListings, type MarketListing } from '../lib/data'
import { useToast } from '../lib/toast'

// Defaults if DB has no rows
const DEFAULTS: MarketListing[] = [
  { id: 'm1', category: 'Seeds', name: 'HD-2967 Wheat Seed', brand: 'IFFCO', price: 2400, unit: 'bag 40kg', rating: 4.6, reviews: 312, image: 'wheat', description: 'High yielding dwarf variety, ideal for Rabi.' },
  { id: 'm2', category: 'Seeds', name: 'Pusa Mustard 28', brand: 'IARI', price: 380, unit: 'kg', rating: 4.4, reviews: 128, image: 'mustard', description: 'Early maturity variety with high oil content.' },
  { id: 'm3', category: 'Fertilizers', name: 'NPK 10-26-26', brand: 'Coromandel', price: 1400, unit: 'bag 50kg', rating: 4.5, reviews: 540, image: 'npk', description: 'Balanced complex fertilizer for root development.' },
  { id: 'm4', category: 'Fertilizers', name: 'Urea (Neem Coated)', brand: 'Chambal', price: 266, unit: 'bag 45kg', rating: 4.7, reviews: 980, image: 'urea', description: 'Subsidized nitrogen source, slow release.' },
  { id: 'm5', category: 'Pesticides', name: 'Chlorpyriphos 20 EC', brand: 'Dhanuka', price: 540, unit: 'litre', rating: 4.2, reviews: 210, image: 'chem', description: 'Broad-spectrum insecticide for stem borer.' },
  { id: 'm6', category: 'Pesticides', name: 'Mancozeb 75 WP', brand: 'Indofil', price: 360, unit: 'kg', rating: 4.3, reviews: 178, image: 'chem', description: 'Contact fungicide for blight control.' },
  { id: 'm7', category: 'Equipment', name: 'Seed Drill 9-Tine', brand: 'Ks Group', price: 32000, unit: 'unit', rating: 4.5, reviews: 64, image: 'drill', description: 'Tractor-mounted seed drill with fertilizer attachment.' },
  { id: 'm8', category: 'Equipment', name: 'Drip Irrigation Kit', brand: 'Netafim', price: 18500, unit: 'acre kit', rating: 4.8, reviews: 222, image: 'drip', description: 'Water-saving drip kit with venturi injector.' }
]

const CATS = ['All', 'Seeds', 'Fertilizers', 'Pesticides', 'Equipment'] as const

export default function Market() {
  const [list, setList] = useState<MarketListing[]>(DEFAULTS)
  const [cat, setCat] = useState<(typeof CATS)[number]>('All')
  const [q, setQ] = useState('')
  const [compare, setCompare] = useState<MarketListing[]>([])
  const toast = useToast()

  useEffect(() => { fetchMarketListings().then((d) => { if (d.length) setList(d) }) }, [])

  const filtered = useMemo(() => list.filter((m) =>
    (cat === 'All' || m.category === cat) && (!q || (m.name + m.brand + m.description).toLowerCase().includes(q.toLowerCase()))
  ), [list, cat, q])

  const toggleCompare = (m: MarketListing) => {
    setCompare((c) => {
      if (c.find((x) => x.id === m.id)) return c.filter((x) => x.id !== m.id)
      if (c.length >= 3) { toast.push('Compare max 3 items', 'error'); return c }
      return [...c, m]
    })
  }

  return (
    <Section
      title="Agri Marketplace"
      subtitle="Buy seeds, fertilizers, pesticides and equipment. Compare products, read verified farmer reviews."
      action={<Badge color="amber"><ShoppingCart size={12} /> {compare.length} to compare</Badge>}
    >
      <Card className="p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-night-400" />
          <input className="input pl-9" placeholder="Search seeds, urea, drills…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3 py-1.5 text-sm transition-colors ${cat === c ? 'bg-brand-500 text-white' : 'border border-night-700 text-night-200 hover:text-white'}`}>{c}</button>
          ))}
        </div>
      </Card>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <Card key={m.id} className="overflow-hidden card-hover">
            <div className="h-32 grid-bg bg-gradient-to-br from-brand-500/10 to-night-900 grid place-items-center">
              <Package size={40} className="text-brand-300/60" />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div><div className="font-semibold">{m.name}</div><div className="text-xs text-night-400">{m.brand} · {m.category}</div></div>
                <Stars value={m.rating} count={m.reviews} />
              </div>
              <p className="text-sm text-night-300 mt-2 line-clamp-2">{m.description}</p>
              <div className="flex items-end justify-between mt-4">
                <div><span className="font-display text-xl font-bold">₹{m.price.toLocaleString()}</span><span className="text-xs text-night-400"> / {m.unit}</span></div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => toast.push(`${m.name} added to cart`, 'success')} className="btn-primary flex-1 text-xs"><ShoppingCart size={14} /> Add to Cart</button>
                <button onClick={() => toggleCompare(m)} className={`btn flex-shrink-0 px-3 ${compare.find((x) => x.id === m.id) ? 'btn-outline' : 'btn-ghost'}`}><GitCompare size={14} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {compare.length > 0 && (
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="font-display text-lg font-semibold flex items-center gap-2"><GitCompare className="text-brand-300" size={18} /> Side-by-side comparison</div>
            <button onClick={() => setCompare([])} className="text-xs text-night-400 hover:text-white">Clear</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-night-400 border-b border-night-800">
                  <th className="py-2 pr-4">Attribute</th>
                  {compare.map((m) => <th key={m.id} className="py-2 px-4 font-semibold text-white">{m.name}</th>)}
                </tr>
              </thead>
              <tbody className="text-night-200">
                <Row label="Brand" cells={compare.map((m) => m.brand)} />
                <Row label="Category" cells={compare.map((m) => m.category)} />
                <Row label="Price" cells={compare.map((m) => `₹${m.price.toLocaleString()} / ${m.unit}`)} />
                <Row label="Rating" cells={compare.map((m) => `★ ${m.rating} (${m.reviews})`)} />
                <Row label="Best for" cells={compare.map((m) => m.category === 'Seeds' ? 'New sowing' : m.category === 'Fertilizers' ? 'Nutrient boost' : m.category === 'Pesticides' ? 'Pest control' : 'Long-term investment')} />
              </tbody>
            </table>
          </div>
          <button onClick={() => toast.push('Compare list sent to WhatsApp dealer', 'success')} className="btn-primary mt-4">Send inquiry</button>
        </Card>
      )}

      {/* Reviews */}
      <Card className="p-6 mt-6">
        <div className="font-display text-lg font-semibold mb-3 flex items-center gap-2"><Star className="text-amber-400" size={18} /> Farmer reviews — HD-2967 Wheat Seed</div>
        <div className="space-y-3">
          {[
            { n: 'Ramesh P.', r: 5, t: 'Excellent germination, harvested 22 qtl/acre in Bundi district.' },
            { n: 'Sunita D.', r: 4, t: 'Good yield but watch for rust in humid weeks.' },
            { n: 'Akbar K.', r: 5, t: 'Drought-tolerant, perfect for my sandy soil.' }
          ].map((r, i) => (
            <div key={i} className="rounded-xl border border-night-800 bg-night-800/40 p-3">
              <div className="flex items-center justify-between"><span className="text-sm font-semibold">{r.n}</span><Stars value={r.r} /></div>
              <p className="text-sm text-night-300 mt-1">{r.t}</p>
            </div>
          ))}
        </div>
        <button onClick={() => toast.push('Review form opened', 'info')} className="btn-ghost mt-3">Write a review</button>
      </Card>
    </Section>
  )
}

function Row({ label, cells }: { label: string; cells: string[] }) {
  return (
    <tr className="border-b border-night-800/50">
      <td className="py-2 pr-4 text-night-400">{label}</td>
      {cells.map((c, i) => <td key={i} className="py-2 px-4">{c}</td>)}
    </tr>
  )
}
