import { describe, expect, it } from 'vitest'
import { CATEGORY_IDS, TROPHIES } from '@/data/trophies'
import { DICTIONARIES, LANGUAGES, format, matchLanguage, type Language } from '@/i18n'

const languages = LANGUAGES.map((l) => l.code)
const reference = DICTIONARIES.en

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
}

describe('translation completeness', () => {
  it('ships exactly PT-BR, EN and ES', () => {
    expect([...languages].sort()).toEqual(['en', 'es', 'pt-BR'])
  })

  describe.each(languages)('%s', (language: Language) => {
    const dict = DICTIONARIES[language]

    it('has every UI key with non-empty text and matching placeholders', () => {
      const keys = Object.keys(reference.ui).filter((k) => k !== 'categories')
      expect(Object.keys(dict.ui).sort()).toEqual(Object.keys(reference.ui).sort())
      for (const key of keys) {
        const value = dict.ui[key as keyof typeof dict.ui] as string
        expect(typeof value, key).toBe('string')
        expect(value.trim(), key).not.toBe('')
        expect(placeholders(value), key).toEqual(placeholders(reference.ui[key as keyof typeof reference.ui] as string))
      }
    })

    it('names every category', () => {
      for (const category of CATEGORY_IDS) expect(dict.ui.categories[category]?.trim(), category).toBeTruthy()
    })

    it('has complete text for every trophy and subtask', () => {
      expect(Object.keys(dict.trophies).sort()).toEqual(TROPHIES.map((t) => t.id).sort())
      for (const trophy of TROPHIES) {
        const text = dict.trophies[trophy.id]
        const ref = reference.trophies[trophy.id]
        expect(text, trophy.id).toBeDefined()
        for (const field of ['name', 'description', 'unlock'] as const) {
          expect(text[field].trim(), `${trophy.id}.${field}`).not.toBe('')
        }
        expect(text.requirements.length, `${trophy.id}.requirements`).toBe(ref.requirements.length)
        expect(text.notes.length, `${trophy.id}.notes`).toBe(ref.notes.length)
        for (const line of [...text.requirements, ...text.notes]) expect(line.trim(), trophy.id).not.toBe('')
        expect(Object.keys(text.subtasks ?? {}).sort(), `${trophy.id}.subtasks`).toEqual([...(trophy.subtasks ?? [])].sort())
        for (const label of Object.values(text.subtasks ?? {})) expect(label.trim(), trophy.id).not.toBe('')
      }
    })
  })

  it('actually translates trophy names (not copies of English) where official names differ', () => {
    expect(DICTIONARIES['pt-BR'].trophies.greenhorn.name).toBe('Dedo Verde')
    expect(DICTIONARIES.es.trophies.greenhorn.name).toBe('Principiante')
    expect(DICTIONARIES['pt-BR'].trophies['local-legend'].name).toBe('Lenda Local')
    expect(DICTIONARIES.es.trophies['local-legend'].name).toBe('Leyenda local')
  })
})

describe('i18n helpers', () => {
  it('formats placeholders', () => {
    expect(format('{done} of {total}', { done: 3, total: 41 })).toBe('3 of 41')
    expect(format('{missing}', {})).toBe('{missing}')
  })

  it('maps browser locales to supported languages', () => {
    expect(matchLanguage('pt-PT')).toBe('pt-BR')
    expect(matchLanguage('es-MX')).toBe('es')
    expect(matchLanguage('fr-FR')).toBe('en')
    expect(matchLanguage(undefined)).toBe('en')
  })
})
