import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext'

type VoiceCtx = {
  listening: boolean
  supported: boolean
  start: () => void
  stop: () => void
  speak: (text: string) => void
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

  const speak = useCallback((text: string) => {
    try {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(u)
    } catch { /* noop */ }
  }, [lang])

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
