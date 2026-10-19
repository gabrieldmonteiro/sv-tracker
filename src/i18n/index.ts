import type { Dictionary, Language } from './types'
import { trophies as enTrophies } from './locales/en/trophies'
import { ui as enUi } from './locales/en/ui'
import { trophies as esTrophies } from './locales/es/trophies'
import { ui as esUi } from './locales/es/ui'
import { trophies as ptTrophies } from './locales/pt-BR/trophies'
import { ui as ptUi } from './locales/pt-BR/ui'

export type { Dictionary, Language, TrophyText, UIStrings } from './types'

export const DEFAULT_LANGUAGE: Language = 'en'

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

export const DICTIONARIES: Record<Language, Dictionary> = {
  en: { ui: enUi, trophies: enTrophies },
  'pt-BR': { ui: ptUi, trophies: ptTrophies },
  es: { ui: esUi, trophies: esTrophies },
}

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && value in DICTIONARIES
}

/** Maps a browser locale such as "pt-PT" or "es-MX" to a supported language. */
export function matchLanguage(locale: string | undefined | null): Language {
  const lower = (locale ?? '').toLowerCase()
  if (lower.startsWith('pt')) return 'pt-BR'
  if (lower.startsWith('es')) return 'es'
  return DEFAULT_LANGUAGE
}

/** Replaces `{name}` placeholders with values. Unknown placeholders are left as-is. */
export function format(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  )
}
