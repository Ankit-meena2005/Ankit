import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { translations, type Lang, type TranslationKey } from './translations'

type Ctx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<Ctx | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem('farmsos_lang') as Lang) || 'en')

  useEffect(() => {
    localStorage.setItem('farmsos_lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo<Ctx>(() => ({
    lang,
    setLang: setLangState,
    t: (key) => translations[lang][key] ?? translations.en[key] ?? key
  }), [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
