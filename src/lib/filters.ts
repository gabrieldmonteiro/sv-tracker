import type { CategoryId, TrophyDef } from '@/data/types'
import type { TrophyText } from '@/i18n'
import { isTrophyDone } from './progress'
import type { ProgressState } from './storage'

export type StatusFilter = 'all' | 'done' | 'pending' | 'missable'

export interface TrophyFilters {
  status: StatusFilter
  category: CategoryId | 'all'
  query: string
}

export const DEFAULT_FILTERS: TrophyFilters = { status: 'all', category: 'all', query: '' }

/** Lowercases and strips accents so "colecao" matches "Coleção" and "pecera" matches "Pecera". */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}

export function matchesQuery(text: TrophyText | undefined, query: string): boolean {
  const needle = normalize(query)
  if (!needle) return true
  if (!text) return false
  return normalize(text.name).includes(needle) || normalize(text.description).includes(needle)
}

export function filterTrophies(
  trophies: TrophyDef[],
  filters: TrophyFilters,
  state: ProgressState,
  texts: Record<string, TrophyText>,
): TrophyDef[] {
  return trophies.filter((trophy) => {
    const done = isTrophyDone(state, trophy.id)
    if (filters.status === 'done' && !done) return false
    if (filters.status === 'pending' && done) return false
    if (filters.status === 'missable' && !trophy.flags.missable) return false
    if (filters.category !== 'all' && trophy.category !== filters.category) return false
    return matchesQuery(texts[trophy.id], filters.query)
  })
}

export const hasActiveFilters = (filters: TrophyFilters) =>
  filters.status !== 'all' || filters.category !== 'all' || filters.query.trim() !== ''
