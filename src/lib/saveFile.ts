import { TROPHIES, TROPHY_BY_ID } from '@/data/trophies'
import { emptyProgress, isIsoDate, isRecord, normalizeDate, subtaskKey, type ProgressState } from './storage'

/** Identifies our files so unrelated JSON is rejected. */
export const SAVE_FILE_FORMAT = 'stardew-valley-tracker-save'
export const SAVE_FILE_VERSION = 1
/** A full save is a few KB; anything far larger is not ours and is refused before it is read. */
export const MAX_SAVE_FILE_BYTES = 256 * 1024

export interface SaveFileTrophy {
  checked: boolean
  /** Present only for trophies that have steps. */
  subtasks?: Record<string, boolean>
}

/** Checklist progress only: language and UI preferences are deliberately not included. */
export interface SaveFile {
  format: typeof SAVE_FILE_FORMAT
  version: typeof SAVE_FILE_VERSION
  createdAt: string | null
  updatedAt: string | null
  trophies: Record<string, SaveFileTrophy>
}

export type SaveFileError = 'too-large' | 'invalid-json' | 'not-a-save' | 'unsupported-version' | 'invalid-data'

export type ParseResult = { ok: true; state: ProgressState } | { ok: false; error: SaveFileError }

export function buildSaveFile(state: ProgressState): SaveFile {
  const trophies: Record<string, SaveFileTrophy> = {}
  for (const trophy of TROPHIES) {
    const entry: SaveFileTrophy = { checked: state.trophies[trophy.id] === true }
    if (trophy.subtasks?.length) {
      entry.subtasks = Object.fromEntries(
        trophy.subtasks.map((subtaskId) => [subtaskId, state.subtasks[subtaskKey(trophy.id, subtaskId)] === true]),
      )
    }
    trophies[trophy.id] = entry
  }
  return {
    format: SAVE_FILE_FORMAT,
    version: SAVE_FILE_VERSION,
    createdAt: state.createdAt ?? null,
    updatedAt: state.updatedAt ?? null,
    trophies,
  }
}

export function serializeSaveFile(state: ProgressState): string {
  return `${JSON.stringify(buildSaveFile(state), null, 2)}\n`
}

export function saveFileName(now = new Date()): string {
  return `stardew-valley-tracker-${now.toISOString().slice(0, 10)}.json`
}

const isDateField = (value: unknown) => value === null || value === undefined || isIsoDate(value)

/** Validates a file's text. Unknown trophy or step ids are ignored; anything malformed is rejected whole. */
export function parseSaveFile(text: string): ParseResult {
  if (text.length > MAX_SAVE_FILE_BYTES) return { ok: false, error: 'too-large' }
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'invalid-json' }
  }
  if (!isRecord(raw) || raw.format !== SAVE_FILE_FORMAT) return { ok: false, error: 'not-a-save' }
  if (raw.version !== SAVE_FILE_VERSION) return { ok: false, error: 'unsupported-version' }
  if (!isRecord(raw.trophies) || !isDateField(raw.createdAt) || !isDateField(raw.updatedAt)) {
    return { ok: false, error: 'invalid-data' }
  }

  const state = emptyProgress()
  for (const [trophyId, entry] of Object.entries(raw.trophies)) {
    if (!isRecord(entry) || typeof entry.checked !== 'boolean') return { ok: false, error: 'invalid-data' }
    if (entry.subtasks !== undefined && !isRecord(entry.subtasks)) return { ok: false, error: 'invalid-data' }
    const trophy = TROPHY_BY_ID.get(trophyId)
    if (!trophy) continue
    if (entry.checked) state.trophies[trophyId] = true
    for (const [subtaskId, checked] of Object.entries(entry.subtasks ?? {})) {
      if (typeof checked !== 'boolean') return { ok: false, error: 'invalid-data' }
      if (checked && trophy.subtasks?.includes(subtaskId)) state.subtasks[subtaskKey(trophyId, subtaskId)] = true
    }
  }
  if (isIsoDate(raw.createdAt)) state.createdAt = normalizeDate(raw.createdAt)
  if (isIsoDate(raw.updatedAt)) state.updatedAt = normalizeDate(raw.updatedAt)
  return { ok: true, state }
}
