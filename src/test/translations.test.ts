import { describe, expect, it } from 'vitest'
import { CATEGORY_IDS, POLYCULTURE_CROPS, TROPHIES } from '@/data/trophies'
import { ITEMS, SEED_IDS } from '@/data/items'
import { APP_TITLE, DEFAULT_LANGUAGE, DICTIONARIES, LANGUAGES, format, type Language } from '@/i18n'

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

    it('names every item, links its wiki page and says how to get it', () => {
      expect(Object.keys(dict.items.items).sort()).toEqual(ITEMS.map((item) => item.id).sort())
      for (const item of ITEMS) {
        const text = dict.items.items[item.id]
        expect(text.name.trim(), item.id).not.toBe('')
        expect(text.wiki.trim(), item.id).not.toBe('')
        expect(Boolean(text.obtain?.trim()) || Boolean(item.grow?.length), `${item.id} has no obtain line`).toBe(true)
        expect(Boolean(text.obtain), `${item.id}.obtain present in ${language} only`).toBe(
          Boolean(reference.items.items[item.id].obtain),
        )
      }
      for (const crop of POLYCULTURE_CROPS) {
        expect(dict.trophies.polyculture.subtasks?.[crop], crop).toBe(dict.items.items[crop].name)
      }
      expect(Object.keys(dict.items.seeds).sort()).toEqual([...SEED_IDS].sort())
      for (const name of Object.values(dict.items.seeds)) expect(name.trim()).not.toBe('')
    })
  })

  it('uses the official localized item names from the PT and ES wikis', () => {
    expect(DICTIONARIES['pt-BR'].items.items.parsnip.name).toBe('Chirívia')
    expect(DICTIONARIES.es.items.items.parsnip.name).toBe('Chirivía')
    expect(DICTIONARIES['pt-BR'].items.items.stardrop.name).toBe('Fruta-estrela')
    expect(DICTIONARIES.es.items.items['mermaids-pendant'].name).toBe('Colgante de sirena')
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

  it('defaults to Portuguese and keeps the brand title untranslated', () => {
    expect(DEFAULT_LANGUAGE).toBe('pt-BR')
    expect(APP_TITLE).toBe('Stardew Valley Tracker')
  })
})
