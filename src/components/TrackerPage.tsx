import { useMemo, useState } from 'react'
import { TROPHIES } from '@/data/trophies'
import { useI18n } from '@/hooks/useLanguage'
import { useProgress } from '@/hooks/useProgress'
import { DEFAULT_FILTERS, filterTrophies, hasActiveFilters, type StatusFilter, type TrophyFilters } from '@/lib/filters'
import { categoryProgress, isTrophyDone, overallProgress } from '@/lib/progress'
import { CategoryProgress } from './CategoryProgress'
import { EmptyState } from './EmptyState'
import { FilterBar } from './FilterBar'
import { LanguageSelector } from './LanguageSelector'
import { MissableAlert, StorageNotice } from './Notices'
import { OverallProgress } from './ProgressSummary'
import { ResetDialog } from './ResetDialog'
import { Roadmap } from './Roadmap'
import { TrophyCard } from './TrophyCard'
import { TrophyDetailDialog } from './TrophyDetailDialog'

const SORTED_TROPHIES = [...TROPHIES].sort((a, b) => a.order - b.order)

export function TrackerPage() {
  const { t, dict } = useI18n()
  const { state, loadStatus, saveFailed, toggleTrophy, toggleSubtask, reset, dismissNotice } = useProgress()
  const [filters, setFilters] = useState<TrophyFilters>(DEFAULT_FILTERS)
  const [openId, setOpenId] = useState<string | null>(null)

  const overall = useMemo(() => overallProgress(TROPHIES, state), [state])
  const byCategory = useMemo(() => categoryProgress(TROPHIES, state), [state])

  const visible = useMemo(
    () => filterTrophies(SORTED_TROPHIES, filters, state, dict.trophies),
    [filters, state, dict.trophies],
  )

  const counts = useMemo<Record<StatusFilter, number>>(() => {
    const base = filterTrophies(SORTED_TROPHIES, { ...filters, status: 'all' }, state, dict.trophies)
    return {
      all: base.length,
      done: base.filter((trophy) => isTrophyDone(state, trophy.id)).length,
      pending: base.filter((trophy) => !isTrophyDone(state, trophy.id)).length,
      missable: base.filter((trophy) => trophy.flags.missable).length,
    }
  }, [filters, state, dict.trophies])

  const hasProgress = Object.keys(state.trophies).length + Object.keys(state.subtasks).length > 0

  return (
    <div className="min-h-dvh">
      <header className="border-b-4 border-wood/60 bg-card/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h1 className="font-heading text-2xl leading-tight sm:text-3xl">{t('appTitle')}</h1>
            <p className="text-sm text-muted-foreground">{t('appSubtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSelector />
            <ResetDialog onConfirm={reset} disabled={!hasProgress} />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[20rem_1fr]">
        <div className="flex flex-col gap-4 lg:sticky lg:top-5 lg:self-start">
          <StorageNotice loadStatus={loadStatus} saveFailed={saveFailed} onDismiss={dismissNotice} />
          <OverallProgress summary={overall} />
          <CategoryProgress
            entries={byCategory}
            active={filters.category}
            onSelect={(category) => setFilters((prev) => ({ ...prev, category }))}
          />
          <Roadmap />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <MissableAlert onShow={() => setFilters({ ...DEFAULT_FILTERS, status: 'missable' })} />
          <FilterBar filters={filters} counts={counts} onChange={setFilters} />
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {t('resultsCount', { count: visible.length, total: TROPHIES.length })}
          </p>
          {visible.length === 0 ? (
            <EmptyState onClear={() => setFilters(DEFAULT_FILTERS)} />
          ) : (
            <ul className="grid gap-3">
              {visible.map((trophy) => (
                <li key={trophy.id}>
                  <TrophyCard
                    trophy={trophy}
                    state={state}
                    onToggle={toggleTrophy}
                    onToggleSubtask={toggleSubtask}
                    onOpenDetails={setOpenId}
                  />
                </li>
              ))}
            </ul>
          )}
          {hasActiveFilters(filters) && visible.length > 0 && (
            <button
              type="button"
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="self-center text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              {t('clearFilters')}
            </button>
          )}
        </div>
      </main>

      <footer className="border-t-2 border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-xs text-muted-foreground sm:px-6">
          <p>{t('footerStorage')}</p>
          <p>
            {t('footerSource')}{' '}
            <a
              href="https://psnprofiles.com/guide/7708-stardew-valley-trophy-guide"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              PSNProfiles
            </a>
          </p>
          <p>{t('footerScope')}</p>
        </div>
      </footer>

      <TrophyDetailDialog
        trophyId={openId}
        state={state}
        onClose={() => setOpenId(null)}
        onOpen={setOpenId}
        onToggle={toggleTrophy}
        onToggleSubtask={toggleSubtask}
      />
    </div>
  )
}
