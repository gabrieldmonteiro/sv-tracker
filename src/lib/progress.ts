import { CATEGORY_IDS } from '@/data/trophies'
import type { CategoryId, TrophyDef } from '@/data/types'
import { subtaskKey, type ProgressState } from './storage'

export interface ProgressSummary {
  total: number
  done: number
  remaining: number
  /** Whole-number percentage, 0–100. */
  percent: number
}

export function summarize(done: number, total: number): ProgressSummary {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)
  return { total, done, remaining: total - done, percent }
}

export const isTrophyDone = (state: ProgressState, id: string) => state.trophies[id] === true

export function overallProgress(trophies: TrophyDef[], state: ProgressState): ProgressSummary {
  return summarize(trophies.filter((t) => isTrophyDone(state, t.id)).length, trophies.length)
}

export function categoryProgress(
  trophies: TrophyDef[],
  state: ProgressState,
): { category: CategoryId; summary: ProgressSummary }[] {
  return CATEGORY_IDS.map((category) => {
    const inCategory = trophies.filter((t) => t.category === category)
    return {
      category,
      summary: summarize(inCategory.filter((t) => isTrophyDone(state, t.id)).length, inCategory.length),
    }
  }).filter((entry) => entry.summary.total > 0)
}

export function subtaskProgress(trophy: TrophyDef, state: ProgressState): ProgressSummary {
  const ids = trophy.subtasks ?? []
  return summarize(ids.filter((id) => state.subtasks[subtaskKey(trophy.id, id)]).length, ids.length)
}

/** Prerequisite ids for a trophy; the platinum depends on every other trophy. */
export function prerequisitesOf(trophy: TrophyDef, all: TrophyDef[]): string[] {
  if (trophy.requiresAll) return all.filter((t) => t.id !== trophy.id).map((t) => t.id)
  return trophy.dependsOn ?? []
}

export function dependencyStatus(trophy: TrophyDef, all: TrophyDef[], state: ProgressState) {
  const ids = prerequisitesOf(trophy, all)
  return {
    met: ids.filter((id) => isTrophyDone(state, id)),
    pending: ids.filter((id) => !isTrophyDone(state, id)),
  }
}
