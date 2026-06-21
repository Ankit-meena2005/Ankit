import { useState } from 'react'
import { Brain, X, Send, Loader as Loader2, Mic } from 'lucide-react'
import { ai } from '../lib/ai'
import { useVoice } from '../lib/voice'

type Msg = { role: 'user' | 'ai'; text: string }

const SUGGESTIONS = [
  'Best crop for sandy soil with limited water?',
  'How to treat yellow rust in wheat?',
  'When to irrigate wheat in Rabi?',
  'What subsidies am I eligible for?'
]

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'ai', text: 'Namaste! I am your FarmSOS AI assistant. Ask me about crops, irrigation, soil, pests, prices or subsidies — in Hindi or English.' }
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const { speak } = useVoice()

  const ask = async (q: string) => {
    if (!q.trim() || busy) return
    setMsgs((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setBusy(true)
    try {
      const r = await ai.assistant(q)
      setMsgs((m) => [...m, { role: 'ai', text: r.reply }])
      speak(r.reply)
    } catch {
      setMsgs((m) => [...m, { role: 'ai', text: 'Sorry, I could not reach the AI service right now. Please try again.' }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow hover:scale-105 transition-transform"
        title="Ask AI assistant">
        <span className="absolute inset-0 rounded-full bg-brand-500 animate-pulseRing" />
        <Brain size={24} className="text-white relative" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative w-full sm:max-w-lg card flex flex-col max-h-[80vh] sm:h-[600px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-night-800">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700"><Brain size={18} /></span>
                <div><div className="font-display font-bold">FarmSOS AI</div><div className="text-xs text-brand-300">Powered by Gemini</div></div>
              </div>
              <button onClick={() => setOpen(false)} className="text-night-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-brand-500 text-white' : 'bg-night-800 text-night-100'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="bg-night-800 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-night-300">
                    <Loader2 size={14} className="animate-spin" /> thinking…
                  </div>
                </div>
              )}
            </div>

            {msgs.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="chip hover:border-brand-500/40 cursor-pointer">{s}</button>
                ))}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); ask(input) }} className="p-4 border-t border-night-800 flex gap-2">
              <input className="input flex-1" placeholder="Ask anything about farming…"
                value={input} onChange={(e) => setInput(e.target.value)} />
              <button type="submit" disabled={busy} className="btn-primary"><Send size={16} /></button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
