import type { Dictionary, Language } from './types'
import { items as enItems } from './locales/en/items'
import { trophies as enTrophies } from './locales/en/trophies'
import { ui as enUi } from './locales/en/ui'
import { items as esItems } from './locales/es/items'
import { trophies as esTrophies } from './locales/es/trophies'
import { ui as esUi } from './locales/es/ui'
import { items as ptItems } from './locales/pt-BR/items'
import { trophies as ptTrophies } from './locales/pt-BR/trophies'
import { ui as ptUi } from './locales/pt-BR/ui'

export type { Dictionary, ItemText, Language, TrophyText, UIStrings } from './types'

/** Brand name; shown untranslated in every language. */
export const APP_TITLE = 'Stardew Valley Tracker'

export const DEFAULT_LANGUAGE: Language = 'pt-BR'

export const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

export const DICTIONARIES: Record<Language, Dictionary> = {
  en: { ui: enUi, trophies: enTrophies, items: enItems },
  'pt-BR': { ui: ptUi, trophies: ptTrophies, items: ptItems },
  es: { ui: esUi, trophies: esTrophies, items: esItems },
}

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && Object.hasOwn(DICTIONARIES, value)
}

/** Replaces `{name}` placeholders with values. Unknown placeholders are left as-is. */
export function format(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  )
}
