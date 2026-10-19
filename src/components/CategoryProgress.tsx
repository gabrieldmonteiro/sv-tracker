import type { CategoryId } from '@/data/types'
import { useI18n } from '@/hooks/useLanguage'
import type { ProgressSummary } from '@/lib/progress'
import { cn } from '@/lib/utils'

interface Props {
  entries: { category: CategoryId; summary: ProgressSummary }[]
  active: CategoryId | 'all'
  onSelect: (category: CategoryId | 'all') => void
}

export function CategoryProgress({ entries, active, onSelect }: Props) {
  const { t, dict } = useI18n()

  return (
    <section aria-labelledby="category-progress-title" className="pixel-panel p-4 sm:p-5">
      <h2 id="category-progress-title" className="font-heading text-lg">
        {t('categoryProgress')}
      </h2>
      <ul className="mt-3 grid gap-1">
        {entries.map(({ category, summary }) => {
          const isActive = active === category
          return (
            <li key={category}>
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => onSelect(isActive ? 'all' : category)}
                className={cn(
                  'grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50',
                  isActive && 'bg-accent text-accent-foreground hover:bg-accent',
                )}
              >
                <span className="truncate font-medium">{dict.ui.categories[category]}</span>
                <span className="tabular-nums text-muted-foreground">
                  {summary.done}/{summary.total}
                </span>
                <span className="col-span-2 h-1.5 overflow-hidden rounded-sm bg-muted" aria-hidden="true">
                  <span
                    className={cn('block h-full bg-primary', summary.percent === 100 && 'bg-gold')}
                    style={{ width: `${summary.percent}%` }}
                  />
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
