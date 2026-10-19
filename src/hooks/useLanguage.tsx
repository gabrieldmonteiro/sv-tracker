import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DICTIONARIES, format, matchLanguage, type Dictionary, type Language, type UIStrings } from '@/i18n'
import { loadLanguage, saveLanguage } from '@/lib/storage'

interface I18nValue {
  language: Language
  setLanguage: (language: Language) => void
  dict: Dictionary
  t: (key: Exclude<keyof UIStrings, 'categories'>, vars?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nValue | null>(null)

function initialLanguage(): Language {
  return loadLanguage() ?? matchLanguage(typeof navigator === 'undefined' ? null : navigator.language)
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  useEffect(() => {
    document.documentElement.lang = language
    document.title = DICTIONARIES[language].ui.appTitle
  }, [language])

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    saveLanguage(next)
  }, [])

  const value = useMemo<I18nValue>(() => {
    const dict = DICTIONARIES[language]
    return {
      language,
      setLanguage,
      dict,
      t: (key, vars) => format(dict.ui[key], vars),
    }
  }, [language, setLanguage])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>')
  return value
}
