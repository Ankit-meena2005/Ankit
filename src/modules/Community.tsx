import { useState } from 'react'
import { MessagesSquare, Plus, Reply, Users, HelpCircle, Send } from 'lucide-react'
import { Section, Card, Badge } from '../components/ui'
import { communityPosts, uuid, type CommunityPost } from '../lib/data'
import { useToast } from '../lib/toast'

const GROUPS = ['All', 'Wheat Farmers', 'Mustard Growers', 'Expert Q&A', 'Local — Hadoti']

export default function Community() {
  const [posts, setPosts] = useState<CommunityPost[]>(communityPosts)
  const [group, setGroup] = useState('All')
  const [showNew, setShowNew] = useState(false)
  const [draft, setDraft] = useState({ title: '', body: '', group: 'Wheat Farmers' })
  const toast = useToast()

  const visible = posts.filter((p) => group === 'All' || p.group === group)

  const post = () => {
    if (!draft.title.trim()) return toast.push('Add a title', 'error')
    setPosts((p) => [{
      id: uuid(), author: 'You', group: draft.group, title: draft.title, body: draft.body, replies: 0,
      created_at: new Date().toISOString().slice(0, 10)
    }, ...p])
    setDraft({ title: '', body: '', group: draft.group })
    setShowNew(false)
    toast.push('Posted to community', 'success')
  }

  return (
    <Section
      title="Farm Community"
      subtitle="Crop-specific groups, local farming circles and expert Q&A — ask, answer and share knowledge."
      action={<button onClick={() => setShowNew(true)} className="btn-primary"><Plus size={16} /> New post</button>}
    >
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {GROUPS.map((g) => (
            <button key={g} onClick={() => setGroup(g)}
              className={`rounded-full px-3 py-1.5 text-sm ${g === group ? 'bg-brand-500 text-white' : 'border border-night-700 text-night-200 hover:text-white'}`}>
              {g}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {visible.map((p) => (
            <Card key={p.id} className="p-5 card-hover">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-night-700 text-sm font-bold">{p.author[0]}</span>
                <div>
                  <div className="text-sm font-semibold">{p.author}</div>
                  <div className="text-xs text-night-400">{p.group} · {p.created_at}</div>
                </div>
                {p.group === 'Expert Q&A' && <Badge color="blue"><HelpCircle size={11} /> Expert</Badge>}
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold">{p.title}</h3>
              <p className="text-sm text-night-300 mt-1">{p.body}</p>
              <div className="mt-3 flex items-center gap-4 text-sm text-night-400">
                <button className="flex items-center gap-1 hover:text-brand-300"><Reply size={14} /> {p.replies} replies</button>
                <button className="flex items-center gap-1 hover:text-brand-300"><Users size={14} /> 42 views</button>
              </div>
            </Card>
          ))}
        </div>

        <div>
          <Card className="p-5 mb-4">
            <div className="flex items-center gap-2 mb-3"><MessagesSquare className="text-brand-300" /><div className="font-semibold">Trending topics</div></div>
            <ul className="space-y-2 text-sm">
              {['#YellowRustAlert', '#RabiSowing2025', '#SubsidyRenewal', '#MiniGrainStorage', '#DripInstallation'].map((t) => (
                <li key={t} className="text-brand-300 hover:underline cursor-pointer">{t}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <div className="font-semibold mb-2">Verified experts online</div>
            {[
              { n: 'Dr. Verma', r: 'Plant Pathologist' },
              { n: 'Anjali Rao', r: 'Agronomist' },
              { n: 'Er. Suresh', r: ' irrigation engineer' }
            ].map((e) => (
              <div key={e.n} className="flex items-center justify-between py-2 border-b border-night-800 last:border-0">
                <div><div className="text-sm font-medium">{e.n}</div><div className="text-xs text-night-400">{e.r}</div></div>
                <Badge color="brand">Online</Badge>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4" onClick={() => setShowNew(false)}>
          <div className="card w-full max-w-xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-xl font-bold mb-4">New community post</h3>
            <input className="input mb-3" placeholder="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            <textarea className="input mb-3 min-h-24" placeholder="Describe your question or insight…" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
            <select className="input mb-4" value={draft.group} onChange={(e) => setDraft({ ...draft, group: e.target.value })}>
              {GROUPS.slice(1).map((g) => <option key={g}>{g}</option>)}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNew(false)} className="btn-ghost">Cancel</button>
              <button onClick={post} className="btn-primary">Post <Send size={14} /></button>
            </div>
          </div>
        </div>
      )}
    </Section>
  )
}
