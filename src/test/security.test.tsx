import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { ITEMS, WIKI_HOSTS, wikiUrl } from '@/data/items'
import { DICTIONARIES, LANGUAGES, isLanguage } from '@/i18n'
import { MAX_SAVE_FILE_BYTES, SAVE_FILE_FORMAT, parseSaveFile } from '@/lib/saveFile'
import { LANGUAGE_KEY, PROGRESS_KEY, loadLanguage, loadProgress } from '@/lib/storage'

declare global {
  interface Window {
    __pwned?: boolean
  }
}

const XSS = '<img src=x onerror="window.__pwned=true">'
const KEPT = JSON.stringify({ version: 1, trophies: { greenhorn: true }, subtasks: {} })

const save = (extra: Record<string, unknown>) => JSON.stringify({ format: SAVE_FILE_FORMAT, version: 1, trophies: {}, ...extra })

function setup(language = 'en') {
  localStorage.setItem(LANGUAGE_KEY, language)
  const user = userEvent.setup()
  render(<App />)
  return user
}

const upload = (user: ReturnType<typeof userEvent.setup>, text: string) =>
  user.upload(screen.getByTestId('import-file'), new File([text], 'save.json', { type: 'application/json' }))

beforeEach(() => localStorage.clear())

afterEach(() => {
  delete window.__pwned
  for (const target of [Object.prototype, Array.prototype] as Record<string, unknown>[]) {
    delete target.polluted
  }
})

describe('prototype pollution', () => {
  const malicious = JSON.stringify({
    format: SAVE_FILE_FORMAT,
    version: 1,
    trophies: {
      __proto__: { checked: true, polluted: true },
      constructor: { checked: true, subtasks: { prototype: true } },
      greenhorn: { checked: true, subtasks: { __proto__: true } },
      'local-legend': { checked: false, subtasks: { vault: true } },
    },
  })

  it('import ignores __proto__ / constructor keys and leaves Object.prototype clean', () => {
    const result = parseSaveFile(malicious)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    expect(Object.getPrototypeOf(result.state.trophies)).toBe(Object.prototype)
    expect(Object.keys(result.state.trophies)).toEqual(['greenhorn'])
    expect(Object.keys(result.state.subtasks)).toEqual(['local-legend/vault'])
  })

  it('stored progress with __proto__ keys does not pollute either', () => {
    localStorage.setItem(
      PROGRESS_KEY,
      '{"version":1,"trophies":{"__proto__":{"polluted":true},"greenhorn":true},"subtasks":{"__proto__/x":true,"constructor/prototype":true}}',
    )
    const { state, status } = loadProgress()
    expect(status).toBe('ok')
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
    expect(state).toEqual({ trophies: { greenhorn: true }, subtasks: {} })
  })

  it('stored language must be an own dictionary key, not an inherited property', () => {
    for (const value of ['__proto__', 'toString', 'constructor', 'hasOwnProperty']) {
      expect(isLanguage(value)).toBe(false)
      localStorage.setItem(LANGUAGE_KEY, value)
      expect(loadLanguage()).toBeNull()
    }
    for (const { code } of LANGUAGES) expect(isLanguage(code)).toBe(true)
  })

  it('a tampered stored language falls back to Portuguese instead of crashing', () => {
    setup('toString')
    expect(document.documentElement.lang).toBe('pt-BR')
    expect(screen.getByText('0 de 41 troféus')).toBeInTheDocument()
  })
})

describe('unexpected types and dates', () => {
  it.each([
    ['trophies as array', save({ trophies: [] })],
    ['checked as string', save({ trophies: { greenhorn: { checked: 'true' } } })],
    ['checked as number', save({ trophies: { greenhorn: { checked: 1 } } })],
    ['subtasks as array', save({ trophies: { greenhorn: { checked: true, subtasks: [true] } } })],
    ['subtask as object', save({ trophies: { 'local-legend': { checked: false, subtasks: { vault: {} } } } })],
    ['date with markup', save({ createdAt: `2026-03-01T09:15:00.000Z${XSS}` })],
    ['date as number', save({ updatedAt: 1772356500000 })],
    ['date with trailing text', save({ updatedAt: '2026-03-01T09:15 later' })],
    ['version as string', JSON.stringify({ format: SAVE_FILE_FORMAT, version: '1', trophies: {} })],
    ['null', 'null'],
  ])('rejects %s', (_label, text) => {
    expect(parseSaveFile(text).ok).toBe(false)
  })

  it('normalizes accepted dates to a canonical UTC ISO string', () => {
    const result = parseSaveFile(save({ createdAt: '2026-03-01T10:15:00+02:00', updatedAt: '2026-03-01T10:15Z' }))
    expect(result.ok && result.state).toMatchObject({
      createdAt: '2026-03-01T08:15:00.000Z',
      updatedAt: '2026-03-01T10:15:00.000Z',
    })
  })

  it('rejects oversized text before parsing', () => {
    expect(parseSaveFile(' '.repeat(MAX_SAVE_FILE_BYTES + 1))).toEqual({ ok: false, error: 'too-large' })
  })
})

describe('malicious import in the app', () => {
  it('never renders markup from the file and keeps progress', async () => {
    localStorage.setItem(PROGRESS_KEY, KEPT)
    const user = setup()
    await upload(
      user,
      save({
        createdAt: XSS,
        trophies: { [XSS]: { checked: true, subtasks: { [XSS]: true } }, greenhorn: { checked: true } },
      }),
    )
    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).toHaveTextContent('Could not import this file')
    expect(document.querySelector('img[src="x"]')).toBeNull()
    expect(window.__pwned).toBeUndefined()
    await user.click(within(dialog).getByRole('button', { name: 'OK' }))
    expect(localStorage.getItem(PROGRESS_KEY)).toBe(KEPT)
  })

  it('shows unknown markup ids nowhere after a valid import', async () => {
    const user = setup()
    await upload(user, save({ trophies: { [XSS]: { checked: true }, cowpoke: { checked: true } } }))
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Yes, import' }))
    expect(document.body.innerHTML).not.toContain('onerror')
    expect(document.querySelector('img[src="x"]')).toBeNull()
    expect(window.__pwned).toBeUndefined()
    expect(JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}').trophies).toEqual({ cowpoke: true })
  })

  it('refuses an oversized file with an error and keeps progress', async () => {
    localStorage.setItem(PROGRESS_KEY, KEPT)
    const user = setup('es')
    await upload(user, save({ padding: 'x'.repeat(MAX_SAVE_FILE_BYTES) }))
    const dialog = await screen.findByRole('alertdialog')
    expect(dialog).toHaveTextContent('El archivo es demasiado grande para ser una partida guardada.')
    expect(dialog).toHaveTextContent('Tu progreso actual no ha cambiado.')
    expect(localStorage.getItem(PROGRESS_KEY)).toBe(KEPT)
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe('es')
  })
})

describe('links', () => {
  const hostOf = (language: keyof typeof WIKI_HOSTS) => new URL(WIKI_HOSTS[language]).host

  it('every item wiki link is https on the wiki host for its language', () => {
    for (const { code: language } of LANGUAGES) {
      for (const item of ITEMS) {
        const url = new URL(wikiUrl(WIKI_HOSTS[language], DICTIONARIES[language].items.items[item.id].wiki))
        expect(url.protocol).toBe('https:')
        expect(url.host).toBe(hostOf(language))
      }
    }
  })

  it.each(['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', '//evil.example/x', '../../evil', 'https://evil.example'])(
    'a hostile title (%s) still stays on the wiki',
    (title) => {
      const url = new URL(wikiUrl(WIKI_HOSTS.en, title))
      expect(url.protocol).toBe('https:')
      expect(url.host).toBe('stardewvalleywiki.com')
    },
  )

  it('rendered external links are http(s) only and open without an opener', () => {
    setup()
    const links = [...document.querySelectorAll('a[href]')] as HTMLAnchorElement[]
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(['http:', 'https:']).toContain(new URL(link.href).protocol)
      if (link.target === '_blank') expect(link.rel).toMatch(/noreferrer|noopener/)
    }
  })
})
