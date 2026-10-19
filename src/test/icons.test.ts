import { readFileSync, readdirSync } from 'node:fs'
import { join, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import { TROPHIES } from '@/data/trophies'
import { TROPHY_ICON_DIR, TROPHY_ICON_FILES, trophyIconUrl } from '@/data/trophyIcons'

const iconDir = join(process.cwd(), 'public', TROPHY_ICON_DIR) + sep
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

describe('trophy icons', () => {
  it.each(TROPHIES.map((trophy) => trophy.id))('%s has a bundled PNG icon', (id) => {
    const file = TROPHY_ICON_FILES[id]
    expect(file, id).toBeTruthy()
    const bytes = readFileSync(iconDir + file)
    expect([...bytes.subarray(0, 8)]).toEqual(PNG_SIGNATURE)
    expect(bytes.readUInt32BE(16)).toBe(240)
    expect(bytes.readUInt32BE(20)).toBe(240)
    expect(trophyIconUrl(id)).toBe(`/${TROPHY_ICON_DIR}/${file}`)
  })

  it('maps only known trophies, with one distinct file each', () => {
    const ids = new Set(TROPHIES.map((trophy) => trophy.id))
    expect(Object.keys(TROPHY_ICON_FILES).filter((id) => !ids.has(id))).toEqual([])
    const files = Object.values(TROPHY_ICON_FILES)
    expect(new Set(files).size).toBe(files.length)
    expect(readdirSync(iconDir).sort()).toEqual([...files].sort())
  })

  it('icon files are distinct images', () => {
    const contents = Object.values(TROPHY_ICON_FILES).map((file) => readFileSync(iconDir + file).toString('base64'))
    expect(new Set(contents).size).toBe(contents.length)
  })
})
