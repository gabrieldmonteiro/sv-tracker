import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ITEMS, ITEM_BY_ID, ITEM_SPRITE_DIR, itemSpriteUrl } from '@/data/items'
import { TROPHIES, TROPHY_BY_ID } from '@/data/trophies'
import { TROPHY_ITEMS, trophyItemIds } from '@/data/trophyItems'

const publicDir = join(process.cwd(), 'public')
const spriteDir = join(publicDir, ITEM_SPRITE_DIR)
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

function readPng(path: string) {
  const bytes = readFileSync(path)
  expect([...bytes.subarray(0, 8)], path).toEqual(PNG_SIGNATURE)
  return { bytes, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
}

const mentioned = [...new Set(TROPHIES.flatMap((trophy) => trophyItemIds(trophy.id)))]

describe('item mentions', () => {
  it('only reference known trophies, subtasks and items', () => {
    for (const [trophyId, refs] of Object.entries(TROPHY_ITEMS)) {
      const trophy = TROPHY_BY_ID.get(trophyId)
      expect(trophy, trophyId).toBeDefined()
      for (const subtaskId of Object.keys(refs.subtasks ?? {})) {
        expect(trophy?.subtasks, `${trophyId}/${subtaskId}`).toContain(subtaskId)
      }
    }
    for (const id of mentioned) expect(ITEM_BY_ID.has(id), id).toBe(true)
  })

  it('every defined item is mentioned by some trophy and ids are unique', () => {
    expect(new Set(ITEMS.map((item) => item.id)).size).toBe(ITEMS.length)
    expect(ITEMS.map((item) => item.id).filter((id) => !mentioned.includes(id))).toEqual([])
  })

  it.each(mentioned)('%s has a bundled sprite', (id) => {
    const { width, height } = readPng(join(spriteDir, `${id}.png`))
    expect(width).toBeGreaterThanOrEqual(16)
    expect(height).toBeGreaterThanOrEqual(16)
    expect(itemSpriteUrl(id)).toBe(`/${ITEM_SPRITE_DIR}/${id}.png`)
  })

  it('ships no stray sprite files', () => {
    expect(readdirSync(spriteDir).sort()).toEqual(ITEMS.map((item) => `${item.id}.png`).sort())
  })

  it('collection trophies cover every item their steps name', () => {
    expect(TROPHY_ITEMS.polyculture.subtasks).toEqual(
      Object.fromEntries((TROPHY_BY_ID.get('polyculture')?.subtasks ?? []).map((crop) => [crop, [crop]])),
    )
    expect(TROPHY_ITEMS['a-complete-collection'].subtasks?.['dwarf-scrolls']).toHaveLength(4)
    expect(TROPHY_ITEMS['master-angler'].subtasks).toMatchObject({
      crimsonfish: ['crimsonfish'],
      angler: ['angler'],
      legend: ['legend-fish'],
      'mutant-carp': ['mutant-carp'],
      glacierfish: ['glacierfish'],
    })
  })
})

describe('chicken title sprite and favicon', () => {
  it('uses the same bundled chicken PNG for the favicon', () => {
    const { width } = readPng(join(publicDir, 'chicken.png'))
    expect(width).toBe(48)
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8')
    expect(html).toContain('<link rel="icon" type="image/png" href="/chicken.png" />')
    expect(html).toContain('<title>Stardew Valley Tracker</title>')
    expect(html).toContain('<html lang="pt-BR">')
  })
})
