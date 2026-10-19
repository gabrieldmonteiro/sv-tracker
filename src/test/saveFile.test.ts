import { describe, expect, it } from 'vitest'
import { TROPHIES } from '@/data/trophies'
import { stamp } from '@/hooks/useProgress'
import {
  SAVE_FILE_FORMAT,
  SAVE_FILE_VERSION,
  buildSaveFile,
  parseSaveFile,
  saveFileName,
  serializeSaveFile,
} from '@/lib/saveFile'
import { emptyProgress, loadProgress, saveProgress, type ProgressState } from '@/lib/storage'

const CREATED = '2026-03-01T09:15:00.000Z'
const UPDATED = '2026-04-12T18:40:30.000Z'

const sample = (): ProgressState => ({
  trophies: { greenhorn: true, 'local-legend': true },
  subtasks: { 'gourmet-chef/kitchen': true, 'local-legend/vault': true },
  createdAt: CREATED,
  updatedAt: UPDATED,
})

describe('buildSaveFile', () => {
  it('includes both dates and every trophy and step with its checked state', () => {
    const file = buildSaveFile(sample())
    expect(file).toMatchObject({ format: SAVE_FILE_FORMAT, version: SAVE_FILE_VERSION, createdAt: CREATED, updatedAt: UPDATED })
    expect(Object.keys(file.trophies).sort()).toEqual(TROPHIES.map((t) => t.id).sort())
    for (const trophy of TROPHIES) {
      const entry = file.trophies[trophy.id]
      expect(typeof entry.checked).toBe('boolean')
      if (trophy.subtasks?.length) expect(Object.keys(entry.subtasks ?? {})).toEqual(trophy.subtasks)
      else expect(entry.subtasks).toBeUndefined()
    }
    expect(file.trophies.greenhorn.checked).toBe(true)
    expect(file.trophies.cowpoke.checked).toBe(false)
    expect(file.trophies['gourmet-chef'].subtasks).toMatchObject({ kitchen: true, gus: false })
    expect(file.trophies['local-legend'].subtasks).toMatchObject({ vault: true, pantry: false })
  })

  it('leaves language and UI preferences out of the file', () => {
    const text = serializeSaveFile(sample())
    expect(Object.keys(JSON.parse(text)).sort()).toEqual(['createdAt', 'format', 'trophies', 'updatedAt', 'version'])
    expect(text).not.toMatch(/language|missable-alert|pt-BR/)
  })

  it('writes null dates for progress that was never saved', () => {
    expect(buildSaveFile(emptyProgress())).toMatchObject({ createdAt: null, updatedAt: null })
  })

  it('names the file with the date', () => {
    expect(saveFileName(new Date(UPDATED))).toBe('stardew-valley-tracker-2026-04-12.json')
  })
})

describe('stamp', () => {
  it('sets createdAt once and moves updatedAt on every change', () => {
    const first = stamp(emptyProgress(), new Date(CREATED))
    expect(first).toMatchObject({ createdAt: CREATED, updatedAt: CREATED })
    const second = stamp(first, new Date(UPDATED))
    expect(second).toMatchObject({ createdAt: CREATED, updatedAt: UPDATED })
  })

  it('persists both dates through localStorage', () => {
    localStorage.clear()
    saveProgress(sample())
    expect(loadProgress()).toMatchObject({ status: 'ok', state: { createdAt: CREATED, updatedAt: UPDATED } })
  })
})

describe('parseSaveFile', () => {
  it('round-trips checks and keeps the file dates', () => {
    const result = parseSaveFile(serializeSaveFile(sample()))
    expect(result).toEqual({ ok: true, state: sample() })
  })

  it('ignores unknown trophies and steps', () => {
    const file = buildSaveFile(sample()) as unknown as { trophies: Record<string, unknown> }
    file.trophies['not-a-trophy'] = { checked: true }
    ;(file.trophies.greenhorn as { subtasks?: object }).subtasks = { ghost: true }
    const result = parseSaveFile(JSON.stringify(file))
    expect(result.ok && result.state).toEqual(sample())
  })

  it.each([
    ['not JSON', '{oops', 'invalid-json'],
    ['an unrelated JSON file', JSON.stringify({ name: 'package', version: '1.0.0' }), 'not-a-save'],
    ['a JSON array', '[1,2,3]', 'not-a-save'],
    ['a future version', JSON.stringify({ format: SAVE_FILE_FORMAT, version: 99, trophies: {} }), 'unsupported-version'],
    ['missing trophies', JSON.stringify({ format: SAVE_FILE_FORMAT, version: 1 }), 'invalid-data'],
    [
      'a non-boolean check',
      JSON.stringify({ format: SAVE_FILE_FORMAT, version: 1, trophies: { greenhorn: { checked: 'yes' } } }),
      'invalid-data',
    ],
    [
      'a bad date',
      JSON.stringify({ format: SAVE_FILE_FORMAT, version: 1, createdAt: 'yesterday', trophies: {} }),
      'invalid-data',
    ],
  ])('rejects %s', (_label, text, error) => {
    expect(parseSaveFile(text)).toEqual({ ok: false, error })
  })
})
