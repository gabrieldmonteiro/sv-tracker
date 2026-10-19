import { describe, expect, it } from 'vitest'
import { CATEGORY_IDS, TROPHIES, TROPHY_BY_ID } from '@/data/trophies'
import {
  categoryProgress,
  dependencyStatus,
  overallProgress,
  subtaskProgress,
  summarize,
} from '@/lib/progress'
import { emptyProgress, subtaskKey, type ProgressState } from '@/lib/storage'

const withDone = (...ids: string[]): ProgressState => ({
  trophies: Object.fromEntries(ids.map((id) => [id, true as const])),
  subtasks: {},
})

describe('trophy data', () => {
  it('covers the 41 base-game trophies with exactly one platinum', () => {
    expect(TROPHIES).toHaveLength(41)
    expect(TROPHIES.filter((t) => t.grade === 'platinum').map((t) => t.id)).toEqual(['iridium-seal'])
  })

  it('has unique trophy ids, unique subtask ids and unique order values', () => {
    expect(new Set(TROPHIES.map((t) => t.id)).size).toBe(TROPHIES.length)
    expect(new Set(TROPHIES.map((t) => t.order)).size).toBe(TROPHIES.length)
    for (const trophy of TROPHIES) {
      const subtasks = trophy.subtasks ?? []
      expect(new Set(subtasks).size, trophy.id).toBe(subtasks.length)
    }
  })

  it('only references existing trophies in dependencies and conflicts', () => {
    for (const trophy of TROPHIES) {
      for (const id of [...(trophy.dependsOn ?? []), ...(trophy.conflictsWith ?? [])]) {
        expect(TROPHY_BY_ID.has(id), `${trophy.id} → ${id}`).toBe(true)
      }
    }
  })

  it('marks exactly the two missable trophies from the guide and links them as conflicts', () => {
    const missable = TROPHIES.filter((t) => t.flags.missable).map((t) => t.id).sort()
    expect(missable).toEqual(['joja-member', 'local-legend'])
    expect(TROPHY_BY_ID.get('local-legend')?.conflictsWith).toContain('joja-member')
    expect(TROPHY_BY_ID.get('joja-member')?.conflictsWith).toContain('local-legend')
  })

  it('uses only known categories', () => {
    for (const trophy of TROPHIES) expect(CATEGORY_IDS).toContain(trophy.category)
  })
})

describe('progress calculation', () => {
  it('summarizes counts and rounds percentages', () => {
    expect(summarize(0, 0)).toEqual({ total: 0, done: 0, remaining: 0, percent: 0 })
    expect(summarize(1, 3)).toEqual({ total: 3, done: 1, remaining: 2, percent: 33 })
    expect(summarize(2, 3).percent).toBe(67)
    expect(summarize(41, 41).percent).toBe(100)
  })

  it('computes overall progress across all trophies', () => {
    expect(overallProgress(TROPHIES, emptyProgress())).toEqual({ total: 41, done: 0, remaining: 41, percent: 0 })
    const progress = overallProgress(TROPHIES, withDone('greenhorn', 'cowpoke', 'moving-up', 'cook'))
    expect(progress).toMatchObject({ total: 41, done: 4, remaining: 37, percent: 10 })
    const all = withDone(...TROPHIES.map((t) => t.id))
    expect(overallProgress(TROPHIES, all)).toMatchObject({ done: 41, remaining: 0, percent: 100 })
  })

  it('computes per-category progress that adds up to the total', () => {
    const state = withDone('greenhorn', 'cowpoke', 'fisherman')
    const entries = categoryProgress(TROPHIES, state)
    const money = entries.find((e) => e.category === 'money')?.summary
    const fishing = entries.find((e) => e.category === 'fishing')?.summary
    expect(money).toMatchObject({ total: 5, done: 2, percent: 40 })
    expect(fishing).toMatchObject({ total: 4, done: 1, percent: 25 })
    expect(entries.reduce((sum, e) => sum + e.summary.total, 0)).toBe(41)
    expect(entries.reduce((sum, e) => sum + e.summary.done, 0)).toBe(3)
  })

  it('ignores ids that are not part of the trophy list', () => {
    expect(overallProgress(TROPHIES, withDone('not-a-trophy')).done).toBe(0)
  })

  it('counts subtasks per trophy', () => {
    const trophy = TROPHY_BY_ID.get('mystery-of-the-stardrops')!
    const state: ProgressState = {
      trophies: {},
      subtasks: { [subtaskKey(trophy.id, 'krobus')]: true, [subtaskKey(trophy.id, 'fair')]: true },
    }
    expect(subtaskProgress(trophy, state)).toMatchObject({ total: 7, done: 2, remaining: 5 })
    expect(subtaskProgress(TROPHY_BY_ID.get('greenhorn')!, state).total).toBe(0)
  })

  it('reports met and pending prerequisites, with the platinum requiring everything else', () => {
    const stardrops = TROPHY_BY_ID.get('mystery-of-the-stardrops')!
    expect(dependencyStatus(stardrops, TROPHIES, withDone('master-angler'))).toEqual({
      met: ['master-angler'],
      pending: ['a-complete-collection'],
    })
    const platinum = TROPHY_BY_ID.get('iridium-seal')!
    const status = dependencyStatus(platinum, TROPHIES, withDone('greenhorn'))
    expect(status.met).toEqual(['greenhorn'])
    expect(status.pending).toHaveLength(39)
  })
})
