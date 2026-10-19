import { TROPHY_BY_ID } from '@/data/trophies'
import { isLanguage, type Language } from '@/i18n'

export const PROGRESS_KEY = 'sv-tracker:progress'
export const LANGUAGE_KEY = 'sv-tracker:language'
export const MISSABLE_ALERT_KEY = 'sv-tracker:missable-alert'
const PROGRESS_VERSION = 1

export interface ProgressState {
  /** Trophy id → done. Only `true` entries are stored. */
  trophies: Record<string, true>
  /** `${trophyId}/${subtaskId}` → done. */
  subtasks: Record<string, true>
}

export type LoadStatus = 'ok' | 'empty' | 'corrupt' | 'unavailable'

export const emptyProgress = (): ProgressState => ({ trophies: {}, subtasks: {} })

export const subtaskKey = (trophyId: string, subtaskId: string) => `${trophyId}/${subtaskId}`

export function getStorage(): Storage | null {
  try {
    const storage = window.localStorage
    const probe = '__sv-tracker-probe__'
    storage.setItem(probe, probe)
    storage.removeItem(probe)
    return storage
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Keeps only ids that still exist in the data, so renamed or removed entries never break the UI. */
export function sanitizeProgress(raw: unknown): ProgressState | null {
  if (!isRecord(raw) || !isRecord(raw.trophies) || !isRecord(raw.subtasks)) return null
  const state = emptyProgress()
  for (const [id, value] of Object.entries(raw.trophies)) {
    if (value === true && TROPHY_BY_ID.has(id)) state.trophies[id] = true
  }
  for (const [key, value] of Object.entries(raw.subtasks)) {
    if (value !== true) continue
    const [trophyId, subtaskId] = key.split('/')
    if (TROPHY_BY_ID.get(trophyId)?.subtasks?.includes(subtaskId)) state.subtasks[key] = true
  }
  return state
}

export function loadProgress(storage: Storage | null = getStorage()): {
  state: ProgressState
  status: LoadStatus
} {
  if (!storage) return { state: emptyProgress(), status: 'unavailable' }
  const raw = storage.getItem(PROGRESS_KEY)
  if (raw === null) return { state: emptyProgress(), status: 'empty' }
  try {
    const parsed: unknown = JSON.parse(raw)
    const state = isRecord(parsed) && parsed.version === PROGRESS_VERSION ? sanitizeProgress(parsed) : null
    if (!state) return { state: emptyProgress(), status: 'corrupt' }
    return { state, status: 'ok' }
  } catch {
    return { state: emptyProgress(), status: 'corrupt' }
  }
}

/** Returns false when the write fails (storage blocked or quota exceeded). */
export function saveProgress(state: ProgressState, storage: Storage | null = getStorage()): boolean {
  if (!storage) return false
  try {
    storage.setItem(PROGRESS_KEY, JSON.stringify({ version: PROGRESS_VERSION, ...state }))
    return true
  } catch {
    return false
  }
}

export function clearProgress(storage: Storage | null = getStorage()): boolean {
  if (!storage) return false
  try {
    storage.removeItem(PROGRESS_KEY)
    return true
  } catch {
    return false
  }
}

export function loadLanguage(storage: Storage | null = getStorage()): Language | null {
  try {
    const value = storage?.getItem(LANGUAGE_KEY)
    return isLanguage(value) ? value : null
  } catch {
    return null
  }
}

export function saveLanguage(language: Language, storage: Storage | null = getStorage()): boolean {
  if (!storage) return false
  try {
    storage.setItem(LANGUAGE_KEY, language)
    return true
  } catch {
    return false
  }
}

export type AlertState = 'open' | 'closed'

export function loadAlertState(storage: Storage | null = getStorage()): AlertState {
  try {
    return storage?.getItem(MISSABLE_ALERT_KEY) === 'closed' ? 'closed' : 'open'
  } catch {
    return 'open'
  }
}

export function saveAlertState(value: AlertState, storage: Storage | null = getStorage()): boolean {
  if (!storage) return false
  try {
    storage.setItem(MISSABLE_ALERT_KEY, value)
    return true
  } catch {
    return false
  }
}
