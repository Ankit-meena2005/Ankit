import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'

type VoiceCtx = {
  listening: boolean
  supported: boolean
  start: () => void
  stop: () => void
  speak: (text: string, opts?: { lang?: 'hi' | 'en' | 'rj' }) => void
}

const VoiceContext = createContext<VoiceCtx | null>(null)

// Map common Hindi/English voice phrases to routes
const COMMANDS: { match: RegExp; route: string }[] = [
  { match: /\b(home|मुख्य|घर)\b/i, route: '/' },
  { match: /\b(farm|खेत)\b/i, route: '/farm' },
  { match: /\b(satellite|सैटलाइट|उपग्रह)\b/i, route: '/satellite' },
  { match: /\b(planner|crop plan|फसल|योजना)\b/i, route: '/planner' },
  { match: /\b(irrigation|सिंचाई|पानी)\b/i, route: '/irrigation' },
  { match: /\b(soil|मृदा|माटी|मिट्टी)\b/i, route: '/soil' },
  { match: /\b(market|बाज़ार|मंडी)\b/i, route: '/market' },
  { match: /\b(price|भाव|मूल्य|दाम)\b/i, route: '/prices' },
  { match: /\b(job|नौकरी|रोज़गार)\b/i, route: '/jobs' },
  { match: /\b(finance|loan|वित्त|कर्ज़ा|रकम)\b/i, route: '/finance' },
  { match: /\b(image|disease|photo|तस्वीर|बीमारी)\b/i, route: '/image' },
  { match: /\b(community|समुदाय|भाईबंद)\b/i, route: '/community' },
  { match: /\b(alert|अलर्ट|सुनाव)\b/i, route: '/alerts' },
  { match: /\b(rajasthan|राजस्थान)\b/i, route: '/rajasthan' },
  { match: /\b(service|nearby|नज़दीक|नेरै)\b/i, route: '/services' },
  { match: /\b(analytics|विश्लेषण)\b/i, route: '/analytics' },
  { match: /\b(admin|एडमिन|अधिकारी)\b/i, route: '/admin' }
]

export function VoiceNavProvider({ children }: { children: ReactNode }) {
  const [listening, setListening] = useState(false)
  const navigate = useNavigate()
  const { lang } = useLang()
  const recRef = useRef<any>(null)

  const supported = typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)

  const handleResult = (transcript: string) => {
    const lower = transcript.toLowerCase()
    for (const c of COMMANDS) {
      if (c.match.test(lower)) {
        navigate(c.route)
        speak(lang === 'hi'
          ? 'ठीक है, मैं ले जा रहा हूँ'
          : lang === 'rj' ? 'ठीक, ले जाऊं'

            : 'Sure, navigating')
        return
      }
    }
    speak(lang === 'hi' ? 'माफ़ करें, समझ नहीं आया' : lang === 'rj' ? 'माफ कर, समझ नई आयो' : 'Sorry, I did not get that')
  }

  const start = useCallback(() => {
    if (!supported) return
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const rec = new SR()
    rec.lang = lang === 'hi' ? 'hi-IN' : lang === 'rj' ? 'hi-IN' : 'en-IN'
    rec.interimResults = false
    rec.continuous = false
    rec.onresult = (e: any) => handleResult(e.results[0][0].transcript)
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    rec.start()
    recRef.current = rec
    setListening(true)
  }, [lang, supported])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
  }, [])

  // Pick the best available voice for the target language.
  // Browsers expose a mix of hi-IN, en-IN, en-US voices; we prefer hi-IN when
  // the app language is Hindi/Rajasthani, else en-IN (Indian English accent).
  const pickVoice = (targetLang: string): SpeechSynthesisVoice | null => {
    try {
      const voices = window.speechSynthesis?.getVoices?.() ?? []
      if (!voices.length) return null
      const want = targetLang.startsWith('hi') ? 'hi' : 'en'
      // Prefer exact locale match, then language prefix, then Indian English as fallback
      const exact = voices.find((v) => v.lang?.toLowerCase() === (targetLang === 'hi-IN' ? 'hi-in' : 'en-in'))
      if (exact) return exact
      const prefix = voices.find((v) => v.lang?.toLowerCase().startsWith(want) && /female|google|microsoft/i.test(v.name))
      if (prefix) return prefix
      const anyPrefix = voices.find((v) => v.lang?.toLowerCase().startsWith(want))
      if (anyPrefix) return anyPrefix
      // Fallback to any en voice so we always get audio
      return voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ?? voices[0]
    } catch {
      return null
    }
  }

  const speak = useCallback((text: string, opts?: { lang?: 'hi' | 'en' | 'rj' }) => {
    try {
      const targetLang = opts?.lang ?? lang
      const locale = targetLang === 'hi' || targetLang === 'rj' ? 'hi-IN' : 'en-IN'
      const u = new SpeechSynthesisUtterance(text)
      u.lang = locale
      const v = pickVoice(locale)
      if (v) u.voice = v
      u.rate = 0.95
      u.pitch = 1
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    } catch { /* noop */ }
  }, [lang])

  // Warm up the voice list — some browsers (Chrome) load it asynchronously
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const load = () => { try { window.speechSynthesis.getVoices() } catch { /* noop */ } }
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => { try { window.speechSynthesis.onvoiceschanged = null } catch { /* noop */ } }
  }, [])

  return (
    <VoiceContext.Provider value={{ listening, supported, start, stop, speak }}>
      {children}
    </VoiceContext.Provider>
  )
}

export function useVoice() {
  const ctx = useContext(VoiceContext)
  if (!ctx) throw new Error('useVoice must be used within VoiceNavProvider')
  return ctx
}
