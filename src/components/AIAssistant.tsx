import { useEffect, useMemo, useState } from 'react'
import { Brain, X, Send, Loader as Loader2, Volume2, Square, Globe } from 'lucide-react'
import { ai } from '../lib/ai'
import { useVoice } from '../lib/voice'
import { useLang } from '../i18n/LanguageContext'
import type { Lang } from '../i18n/translations'

type Msg = { role: 'user' | 'ai'; text: string; lang: Lang }

const COPY: Record<Lang, {
  title: string; subtitle: string; welcome: string;
  placeholder: string; thinking: string; error: string;
  speak: string; stop: string; suggestions: string[]
}> = {
  en: {
    title: 'FarmSOS AI',
    subtitle: 'Powered by Gemini',
    welcome: 'Namaste! I am your FarmSOS AI assistant. Ask me about crops, irrigation, soil, pests, prices or subsidies — in Hindi or English.',
    placeholder: 'Ask anything about farming…',
    thinking: 'thinking…',
    error: 'Sorry, I could not reach the AI service right now. Please try again.',
    speak: 'Speak reply',
    stop: 'Stop',
    suggestions: [
      'Best crop for sandy soil with limited water?',
      'How to treat yellow rust in wheat?',
      'When to irrigate wheat in Rabi?',
      'What subsidies am I eligible for?'
    ]
  },
  hi: {
    title: 'FarmSOS AI',
    subtitle: 'जेमिनी द्वारा संचालित',
    welcome: 'नमस्ते! मैं आपका FarmSOS AI सहायक हूँ। फसल, सिंचाई, मिट्टी, कीट, मंडी भाव या सब्सिडी के बारे में हिंदी या अंग्रेज़ी में पूछें।',
    placeholder: 'खेती के बारे में कुछ भी पूछें…',
    thinking: 'सोच रहा हूँ…',
    error: 'क्षमा करें, अभी AI सेवा उपलब्ध नहीं है। कृपया पुनः प्रयास करें।',
    speak: 'सुनाएँ',
    stop: 'रोकें',
    suggestions: [
      'रेतीली मिट्टी और कम पानी के लिए सबसे अच्छी फसल?',
      'गेहूँ में पीला रतुआ कैसे ठीक करें?',
      'रबी में गेहूँ को कब सिंचाई करें?',
      'मुझे कौन सी सब्सिडी मिल सकती है?'
    ]
  },
  rj: {
    title: 'FarmSOS AI',
    subtitle: 'जेमिनी सूं चालू',
    welcome: 'राम-राम! म्हारो FarmSOS AI सहायक है। फसल, सिंचाई, माटी, कीड़ा, मंडी भाव या सब्सिडी बारे में हिंदी या अंग्रेज़ी में पूछो।',
    placeholder: 'खेती बारे में काई भी पूछो…',
    thinking: 'सोचतो हूँ…',
    error: 'क्षमा करो, अभी AI सेवा उपलब्ध नई है। फेर सै पूछजो।',
    speak: 'सुणावो',
    stop: 'रोक दो',
    suggestions: [
      'बलुई माटी रा कम पानी वास्ते साऊं फसल?',
      'गेंहूं में पीलो रतुआ कण करजो?',
      'रबी में गेंहूं ने कदे सिंचाई करजो?',
      'म्हारै कण सारी सब्सिडी मिलस?'
    ]
  }
}

export default function AIAssistant() {
  const { lang, setLang } = useLang()
  const c = COPY[lang]
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'ai', text: c.welcome, lang }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const { speak, stop } = useVoice()

  // Refresh welcome message when language changes
  useEffect(() => {
    setMsgs((m) => m.length <= 1 ? [{ role: 'ai', text: c.welcome, lang }] : m)
  }, [lang])

  const toggleLang = () => {
    const next: Lang = lang === 'en' ? 'hi' : 'en'
    setLang(next)
  }

  const ask = async (q: string) => {
    if (!q.trim() || busy) return
    setMsgs((m) => [...m, { role: 'user', text: q, lang }])
    setInput('')
    setBusy(true)
    try {
      // Send current language to edge function so it replies in that language
      const r = await ai.assistant(q, lang)
      setMsgs((m) => [...m, { role: 'ai', text: r.reply, lang }])
      // Speak the reply in the matched language voice
      speak(r.reply, { lang: r.lang ?? lang })
    } catch {
      setMsgs((m) => [...m, { role: 'ai', text: c.error, lang }])
    } finally {
      setBusy(false)
    }
  }

  const speakReply = (text: string, replyLang: Lang) => {
    if (speaking) { stop(); setSpeaking(false); return }
    setSpeaking(true)
    // Stop the indicator when speech ends naturally
    const tick = () => {
      if (!window.speechSynthesis?.speaking) { setSpeaking(false); return }
      setTimeout(tick, 200)
    }
    speak(text, { lang: replyLang })
    setTimeout(tick, 300)
  }

  const uiLangLabel = lang === 'hi' ? 'हिं' : lang === 'rj' ? 'राज' : 'EN'

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow hover:scale-105 transition-transform"
        title={c.title}>
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
                <div>
                  <div className="font-display font-bold">{c.title}</div>
                  <div className="text-xs text-brand-300">{c.subtitle}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={toggleLang} title="EN / हिं" className="grid h-9 w-9 place-items-center rounded-lg text-night-300 hover:bg-night-800 hover:text-brand-300 transition-colors">
                  <span className="flex items-center gap-1 text-xs font-semibold"><Globe size={14} />{uiLangLabel}</span>
                </button>
                <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg text-night-400 hover:text-white hover:bg-night-800"><X size={20} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`group max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${m.role === 'user' ? 'bg-brand-500 text-white' : 'bg-night-800 text-night-100'}`}>
                    <div>{m.text}</div>
                    {m.role === 'ai' && (
                      <button onClick={() => speakReply(m.text, m.lang)}
                        className="mt-1.5 flex items-center gap-1 text-xs text-brand-300 hover:text-brand-200 transition-colors">
                        {speaking ? <Square size={11} /> : <Volume2 size={12} />}
                        {speaking ? c.stop : c.speak}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="bg-night-800 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-night-300">
                    <Loader2 size={14} className="animate-spin" /> {c.thinking}
                  </div>
                </div>
              )}
            </div>

            {msgs.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {c.suggestions.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="chip hover:border-brand-500/40 cursor-pointer">{s}</button>
                ))}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); ask(input) }} className="p-4 border-t border-night-800 flex gap-2">
              <input className="input flex-1" placeholder={c.placeholder}
                value={input} onChange={(e) => setInput(e.target.value)} />
              <button type="submit" disabled={busy} className="btn-primary"><Send size={16} /></button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
