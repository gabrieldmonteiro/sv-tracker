import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CATEGORY_IDS } from '@/data/trophies'
import type { CategoryId } from '@/data/types'
import { useI18n } from '@/hooks/useLanguage'
import type { StatusFilter, TrophyFilters } from '@/lib/filters'
import { cn } from '@/lib/utils'

interface Props {
  filters: TrophyFilters
  counts: Record<StatusFilter, number>
  onChange: (filters: TrophyFilters) => void
}

const STATUS_KEYS = {
  all: 'filterAll',
  done: 'filterDone',
  pending: 'filterPending',
  missable: 'filterMissable',
} as const

export function FilterBar({ filters, counts, onChange }: Props) {
  const { t, dict } = useI18n()

  return (
    <div className="pixel-panel flex flex-col gap-3 p-3 sm:p-4">
      <div className="relative">
        <label htmlFor="trophy-search" className="sr-only">
          {t('searchLabel')}
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="trophy-search"
          type="search"
          value={filters.query}
          placeholder={t('searchPlaceholder')}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          className="h-10 border-2 bg-background pr-10 pl-9 text-base sm:text-sm [&::-webkit-search-cancel-button]:hidden"
        />
        {filters.query && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t('clearSearch')}
            onClick={() => onChange({ ...filters, query: '' })}
            className="absolute top-1/2 right-1.5 -translate-y-1/2"
          >
            <X aria-hidden="true" />
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label={t('filtersLabel')} className="flex flex-wrap gap-1.5">
          {(Object.keys(STATUS_KEYS) as StatusFilter[]).map((status) => {
            const active = filters.status === status
            return (
              <button
                key={status}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ ...filters, status })}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-md border-2 px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background hover:bg-secondary',
                )}
              >
                {t(STATUS_KEYS[status])}
                <span
                  className={cn(
                    'rounded-sm px-1 text-xs tabular-nums',
                    active ? 'bg-primary-foreground/20' : 'bg-secondary text-muted-foreground',
                  )}
                >
                  {counts[status]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="category-select" className="text-sm font-medium whitespace-nowrap">
            {t('categoryLabel')}
          </label>
          <select
            id="category-select"
            value={filters.category}
            onChange={(event) => onChange({ ...filters, category: event.target.value as CategoryId | 'all' })}
            className="h-9 w-full min-w-0 rounded-md border-2 border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-auto"
          >
            <option value="all">{t('allCategories')}</option>
            {CATEGORY_IDS.map((category) => (
              <option key={category} value={category}>
                {dict.ui.categories[category]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
