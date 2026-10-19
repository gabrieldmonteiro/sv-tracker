import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { LANGUAGE_KEY, MISSABLE_ALERT_KEY, PROGRESS_KEY } from '@/lib/storage'

function setup(language = 'en') {
  localStorage.setItem(LANGUAGE_KEY, language)
  const user = userEvent.setup()
  render(<App />)
  return user
}

const savedProgress = () => JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? 'null')

describe('App', () => {
  beforeEach(() => localStorage.clear())

  it('checks a trophy, updates progress and auto-saves', async () => {
    const user = setup()
    expect(screen.getByText('0 of 41 trophies')).toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: 'Mark “Greenhorn” as done' }))
    expect(screen.getByText('1 of 41 trophies')).toBeInTheDocument()
    expect(savedProgress()).toMatchObject({ trophies: { greenhorn: true } })
    await user.click(screen.getByRole('checkbox', { name: 'Mark “Greenhorn” as pending' }))
    expect(savedProgress().trophies).toEqual({})
  })

  it('restores saved progress on load', () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ version: 1, trophies: { cowpoke: true }, subtasks: {} }))
    setup()
    expect(screen.getByRole('checkbox', { name: 'Mark “Cowpoke” as pending' })).toBeChecked()
    expect(screen.getByText('1 of 41 trophies')).toBeInTheDocument()
  })

  it('switching language keeps progress untouched', async () => {
    const user = setup('en')
    await user.click(screen.getByRole('checkbox', { name: 'Mark “Greenhorn” as done' }))
    const before = localStorage.getItem(PROGRESS_KEY)

    await user.selectOptions(screen.getByLabelText('Language'), 'pt-BR')
    expect(screen.getByRole('checkbox', { name: 'Marcar “Dedo Verde” como pendente' })).toBeChecked()
    expect(screen.getByText('1 de 41 troféus')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Idioma'), 'es')
    expect(screen.getByRole('checkbox', { name: 'Marcar «Principiante» como pendiente' })).toBeChecked()
    expect(localStorage.getItem(PROGRESS_KEY)).toBe(before)
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe('es')
    expect(document.documentElement.lang).toBe('es')
  })

  it('filters, searches and shows an empty state', async () => {
    const user = setup()
    const statusFilters = screen.getByRole('group', { name: 'Filter trophies' })
    await user.click(within(statusFilters).getByRole('button', { name: /^Missable/ }))
    expect(screen.getByText('2 of 41 trophies shown')).toBeInTheDocument()

    await user.click(within(statusFilters).getByRole('button', { name: /^All/ }))
    await user.type(screen.getByLabelText('Search trophies'), 'stardrop')
    expect(screen.getByText('1 of 41 trophies shown')).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Search trophies'))
    await user.type(screen.getByLabelText('Search trophies'), 'no such trophy')
    expect(screen.getByText('No trophies match these filters')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByText('41 of 41 trophies shown')).toBeInTheDocument()
  })

  it('expands subtasks and saves them', async () => {
    const user = setup()
    const card = screen.getByRole('article', { name: 'Mystery Of The Stardrops' })
    await user.click(within(card).getByRole('button', { name: /Show steps/ }))
    await user.click(within(card).getByLabelText('Buy from Krobus for 20,000g'))
    expect(within(card).getByText('1/7 steps')).toBeInTheDocument()
    expect(savedProgress().subtasks).toEqual({ 'mystery-of-the-stardrops/krobus': true })
  })

  it('opens the detail view with requirements and notes', async () => {
    const user = setup()
    const card = screen.getByRole('article', { name: 'Protector Of The Valley' })
    await user.click(within(card).getByRole('button', { name: /Details/ }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('How it unlocks')).toBeInTheDocument()
    expect(within(dialog).getByText('Requirements')).toBeInTheDocument()
    expect(within(dialog).getByText(/Magma Sprite goal last/)).toBeInTheDocument()
  })

  it('resets progress only after confirmation', async () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ version: 1, trophies: { greenhorn: true }, subtasks: {} }))
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Reset progress' }))
    await user.click(await screen.findByRole('button', { name: 'Cancel' }))
    expect(screen.getByText('1 of 41 trophies')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset progress' }))
    await user.click(await screen.findByRole('button', { name: 'Yes, reset' }))
    expect(screen.getByText('0 of 41 trophies')).toBeInTheDocument()
    expect(savedProgress().trophies).toEqual({})
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe('en')
  })

  it('closes the missable alert, persists it and leaves progress and language alone', async () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ version: 1, trophies: { greenhorn: true }, subtasks: {} }))
    const user = setup('en')
    const progressBefore = localStorage.getItem(PROGRESS_KEY)
    expect(screen.queryByRole('button', { name: /Minimize/ })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close warning' }))
    expect(screen.queryByRole('heading', { name: 'Missable trophies' })).not.toBeInTheDocument()
    expect(localStorage.getItem(MISSABLE_ALERT_KEY)).toBe('closed')
    expect(localStorage.getItem(PROGRESS_KEY)).toBe(progressBefore)
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe('en')

    await user.selectOptions(screen.getByLabelText('Language'), 'pt-BR')
    expect(screen.getByRole('button', { name: 'Mostrar aviso de perdíveis' })).toBeInTheDocument()
    expect(localStorage.getItem(MISSABLE_ALERT_KEY)).toBe('closed')

    cleanup()
    setup('es')
    expect(screen.queryByRole('heading', { name: 'Trofeos perdibles' })).not.toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Marcar «Principiante» como pendiente' })).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Mostrar aviso de perdibles' }))
    expect(screen.getByRole('heading', { name: 'Trofeos perdibles' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar aviso' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Mostrar aviso de perdibles' })).not.toBeInTheDocument()
    expect(localStorage.getItem(MISSABLE_ALERT_KEY)).toBe('open')
    expect(localStorage.getItem(PROGRESS_KEY)).toBe(progressBefore)
  })

  it('reset keeps the closed alert preference', async () => {
    localStorage.setItem(MISSABLE_ALERT_KEY, 'closed')
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ version: 1, trophies: { greenhorn: true }, subtasks: {} }))
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Reset progress' }))
    await user.click(await screen.findByRole('button', { name: 'Yes, reset' }))
    expect(localStorage.getItem(MISSABLE_ALERT_KEY)).toBe('closed')
    expect(screen.getByRole('button', { name: 'Show missable warning' })).toBeInTheDocument()
  })

  it('starts in Portuguese on a fresh visit, but a saved choice wins', () => {
    render(<App />)
    expect(document.documentElement.lang).toBe('pt-BR')
    expect(screen.getByText('0 de 41 troféus')).toBeInTheDocument()
    expect(localStorage.getItem(PROGRESS_KEY)).toBeNull()
    cleanup()

    localStorage.setItem(LANGUAGE_KEY, 'es')
    render(<App />)
    expect(document.documentElement.lang).toBe('es')
    expect(screen.getByText('0 de 41 trofeos')).toBeInTheDocument()
  })

  it.each(['pt-BR', 'en', 'es'])('shows the untranslated title with the chicken first (%s)', (language) => {
    setup(language)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toBe('Stardew Valley Tracker')
    const first = heading.firstElementChild
    expect(first?.tagName).toBe('IMG')
    expect(first).toHaveAttribute('src', '/chicken.png')
    expect(heading.firstChild).toBe(first)
    expect(heading.nextElementSibling?.tagName).not.toBe('P')
    expect(heading.parentElement?.querySelector('p')).toBeNull()
    expect(document.title).toBe('Stardew Valley Tracker')
  })

  it('shows item chips with sprites and how to obtain them', async () => {
    const user = setup('en')
    const card = screen.getByRole('article', { name: 'Full House' })
    const chip = within(card).getByRole('button', { name: "Mermaid's Pendant" })
    expect(chip.querySelector('img[data-item-sprite="mermaids-pendant"]')).toHaveAttribute('src', '/items/mermaids-pendant.png')
    await user.click(chip)
    expect(await screen.findByText('Old Mariner on the beach for 5,000g, on rainy days (6am–7pm).')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Open on the Stardew Valley Wiki/ })).toHaveAttribute(
      'href',
      "https://stardewvalleywiki.com/Mermaid's_Pendant",
    )
  })

  it('shows crop sprites and growing facts in the Polyculture steps, in Portuguese', async () => {
    const user = setup('pt-BR')
    const card = screen.getByRole('article', { name: 'Policultura' })
    await user.click(within(card).getByRole('button', { name: /Mostrar etapas/ }))
    const steps = within(card).getAllByRole('checkbox').slice(1)
    expect(steps).toHaveLength(28)
    expect(card.querySelectorAll('img[data-item-sprite]').length).toBeGreaterThanOrEqual(28)
    await user.click(within(card).getByRole('button', { name: 'Chirívia' }))
    expect(await screen.findByText('Plante Sementes de chirívia — Primavera, 4 dias.')).toBeInTheDocument()
  })

  it('lists every trophy-level item with its obtain line in the detail view', async () => {
    const user = setup('es')
    const card = screen.getByRole('article', { name: 'Leyenda' })
    await user.click(within(card).getByRole('button', { name: /\+7 más/ }))
    const dialog = await screen.findByRole('dialog')
    const entries = dialog.querySelectorAll('[data-item-entry]')
    expect(entries).toHaveLength(13)
    for (const entry of entries) {
      expect(entry.querySelector('img[data-item-sprite]')).not.toBeNull()
      expect(entry.querySelectorAll('p').length).toBeGreaterThanOrEqual(2)
    }
    expect(within(dialog).getByText('Pon cualquier fruta en un barril (7 días).')).toBeInTheDocument()
  })

  it('shows the official icon on every trophy row and in the detail view', async () => {
    const user = setup()
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(41)
    for (const card of cards) {
      const img = card.querySelector('img[data-trophy-icon]')
      expect(img).not.toBeNull()
      expect(img?.getAttribute('src')).toBe(`/trophies/${img?.getAttribute('data-trophy-icon')}.png`)
    }

    const platinum = screen.getByRole('article', { name: 'Iridium Seal' })
    await user.click(within(platinum).getByRole('button', { name: /Details/ }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog.querySelector('img[data-trophy-icon="iridium-seal"]')).toHaveAttribute('src', '/trophies/iridium-seal.png')
  })

  it('warns when saved data is corrupt', () => {
    localStorage.setItem(PROGRESS_KEY, '{oops')
    setup()
    expect(screen.getByRole('alert')).toHaveTextContent('Saved progress could not be read')
  })
})
