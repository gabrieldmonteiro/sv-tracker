import { beforeEach, describe, expect, it } from 'vitest'
import {
  LANGUAGE_KEY,
  MISSABLE_ALERT_KEY,
  PROGRESS_KEY,
  emptyProgress,
  loadAlertState,
  loadLanguage,
  loadProgress,
  saveAlertState,
  saveLanguage,
  saveProgress,
  subtaskKey,
  type ProgressState,
} from '@/lib/storage'

describe('progress persistence', () => {
  beforeEach(() => localStorage.clear())

  it('starts empty when nothing is saved', () => {
    expect(loadProgress()).toEqual({ state: emptyProgress(), status: 'empty' })
  })

  it('saves and restores trophies and subtasks', () => {
    const state: ProgressState = {
      trophies: { greenhorn: true, 'local-legend': true },
      subtasks: { [subtaskKey('local-legend', 'pantry')]: true },
    }
    expect(saveProgress(state)).toBe(true)
    expect(JSON.parse(localStorage.getItem(PROGRESS_KEY)!)).toMatchObject({ version: 1 })
    expect(loadProgress()).toEqual({ state, status: 'ok' })
  })

  it('drops unknown trophy and subtask ids when restoring', () => {
    localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({
        version: 1,
        trophies: { greenhorn: true, 'removed-trophy': true, cowpoke: false },
        subtasks: { 'local-legend/pantry': true, 'local-legend/nope': true, 'ghost/x': true },
      }),
    )
    expect(loadProgress()).toEqual({
      state: { trophies: { greenhorn: true }, subtasks: { 'local-legend/pantry': true } },
      status: 'ok',
    })
  })

  it('reports corrupt data instead of throwing', () => {
    localStorage.setItem(PROGRESS_KEY, '{not json')
    expect(loadProgress()).toEqual({ state: emptyProgress(), status: 'corrupt' })
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ version: 99, trophies: {}, subtasks: {} }))
    expect(loadProgress().status).toBe('corrupt')
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(['greenhorn']))
    expect(loadProgress().status).toBe('corrupt')
  })

  it('handles unavailable or failing storage gracefully', () => {
    expect(loadProgress(null)).toEqual({ state: emptyProgress(), status: 'unavailable' })
    expect(saveProgress(emptyProgress(), null)).toBe(false)
    const failing = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    } as unknown as Storage
    expect(saveProgress(emptyProgress(), failing)).toBe(false)
  })

  it('persists the language separately from progress', () => {
    saveProgress({ trophies: { greenhorn: true }, subtasks: {} })
    expect(saveLanguage('es')).toBe(true)
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe('es')
    expect(loadLanguage()).toBe('es')
    expect(loadProgress().state.trophies).toEqual({ greenhorn: true })
    localStorage.setItem(LANGUAGE_KEY, 'klingon')
    expect(loadLanguage()).toBeNull()
  })
})

describe('missable alert preference', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to expanded and ignores unknown values', () => {
    expect(loadAlertState()).toBe('expanded')
    localStorage.setItem(MISSABLE_ALERT_KEY, 'weird')
    expect(loadAlertState()).toBe('expanded')
    expect(loadAlertState(null)).toBe('expanded')
  })

  it('round-trips under its own key without touching progress or language', () => {
    const progress: ProgressState = { trophies: { greenhorn: true }, subtasks: {} }
    saveProgress(progress)
    saveLanguage('es')
    const before = localStorage.getItem(PROGRESS_KEY)

    expect(saveAlertState('minimized')).toBe(true)
    expect(loadAlertState()).toBe('minimized')
    expect(localStorage.getItem(PROGRESS_KEY)).toBe(before)
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe('es')
    expect(loadProgress().state).toEqual(progress)

    saveAlertState('expanded')
    expect(loadAlertState()).toBe('expanded')
    expect(saveAlertState('minimized', null)).toBe(false)
  })
})
