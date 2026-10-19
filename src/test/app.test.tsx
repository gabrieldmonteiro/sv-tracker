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

  it('minimizes the missable alert, persists it and leaves progress and language alone', async () => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ version: 1, trophies: { greenhorn: true }, subtasks: {} }))
    const user = setup('en')
    const progressBefore = localStorage.getItem(PROGRESS_KEY)

    await user.click(screen.getByRole('button', { name: 'Minimize' }))
    const collapsed = screen.getByRole('complementary', { name: 'Missable trophies' })
    expect(collapsed).toHaveTextContent('Missable: Local Legend and Joja Co. Member Of The Year lock each other out')
    expect(screen.queryByRole('heading', { name: 'Missable trophies' })).not.toBeInTheDocument()
    expect(localStorage.getItem(MISSABLE_ALERT_KEY)).toBe('minimized')
    expect(localStorage.getItem(PROGRESS_KEY)).toBe(progressBefore)
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe('en')

    await user.selectOptions(screen.getByLabelText('Language'), 'pt-BR')
    expect(screen.getByRole('button', { name: 'Mostrar detalhes' })).toBeInTheDocument()
    expect(screen.getByText('Perdíveis: Lenda Local e Joja Co. Membro do Ano se excluem')).toBeInTheDocument()
    expect(localStorage.getItem(MISSABLE_ALERT_KEY)).toBe('minimized')

    cleanup()
    setup('es')
    expect(screen.getByRole('button', { name: 'Mostrar detalles' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Marcar «Principiante» como pendiente' })).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Mostrar detalles' }))
    expect(screen.getByRole('heading', { name: 'Trofeos perdibles' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Minimizar' })).toBeInTheDocument()
    expect(localStorage.getItem(MISSABLE_ALERT_KEY)).toBe('expanded')
    expect(localStorage.getItem(PROGRESS_KEY)).toBe(progressBefore)
  })

  it('reset keeps the minimized alert preference', async () => {
    localStorage.setItem(MISSABLE_ALERT_KEY, 'minimized')
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ version: 1, trophies: { greenhorn: true }, subtasks: {} }))
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Reset progress' }))
    await user.click(await screen.findByRole('button', { name: 'Yes, reset' }))
    expect(localStorage.getItem(MISSABLE_ALERT_KEY)).toBe('minimized')
    expect(screen.getByRole('button', { name: 'Show details' })).toBeInTheDocument()
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
