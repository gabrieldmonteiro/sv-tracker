import { describe, expect, it } from 'vitest'
import { TROPHIES } from '@/data/trophies'
import { DICTIONARIES } from '@/i18n'
import { DEFAULT_FILTERS, filterTrophies, hasActiveFilters, normalize, type TrophyFilters } from '@/lib/filters'
import type { ProgressState } from '@/lib/storage'

const state: ProgressState = { trophies: { greenhorn: true, 'local-legend': true, fisherman: true }, subtasks: {} }
const ids = (filters: Partial<TrophyFilters>, language: keyof typeof DICTIONARIES = 'en') =>
  filterTrophies(TROPHIES, { ...DEFAULT_FILTERS, ...filters }, state, DICTIONARIES[language].trophies).map((t) => t.id)

describe('filters', () => {
  it('returns everything by default', () => {
    expect(ids({})).toHaveLength(41)
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false)
  })

  it('filters by status', () => {
    expect(ids({ status: 'done' }).sort()).toEqual(['fisherman', 'greenhorn', 'local-legend'])
    expect(ids({ status: 'pending' })).toHaveLength(38)
    expect(ids({ status: 'missable' }).sort()).toEqual(['joja-member', 'local-legend'])
  })

  it('filters by category and combines with status', () => {
    expect(ids({ category: 'money' })).toEqual(['greenhorn', 'cowpoke', 'homesteader', 'millionaire', 'legend'])
    expect(ids({ category: 'money', status: 'pending' })).not.toContain('greenhorn')
    expect(ids({ category: 'arcade', status: 'missable' })).toEqual([])
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, category: 'money' })).toBe(true)
  })
})

describe('search', () => {
  it('matches names and descriptions, case-insensitively', () => {
    expect(ids({ query: 'gourmet' })).toEqual(['gourmet-chef'])
    expect(ids({ query: 'PRAIRIE king' }).sort()).toEqual(['fectors-challenge', 'prairie-king'])
    expect(ids({ query: 'museum' }).sort()).toEqual(['a-complete-collection', 'treasure-trove'])
  })

  it('searches in the active language and ignores accents', () => {
    expect(ids({ query: 'colecao' }, 'pt-BR')).toContain('a-complete-collection')
    expect(ids({ query: 'Frutas-estrela' }, 'pt-BR')).toEqual(['mystery-of-the-stardrops'])
    expect(ids({ query: 'pescador' }, 'es')).toEqual(expect.arrayContaining(['fisherman', 'master-angler']))
    expect(ids({ query: 'pescador' }, 'en')).toEqual([])
  })

  it('treats whitespace-only queries as empty and returns nothing for no match', () => {
    expect(ids({ query: '   ' })).toHaveLength(41)
    expect(ids({ query: 'zzz-no-such-trophy' })).toEqual([])
    expect(normalize('  Coleção ')).toBe('colecao')
  })
})
