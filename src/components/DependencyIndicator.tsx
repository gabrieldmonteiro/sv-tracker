import { CircleCheck, CircleDashed, Link2, Ban } from 'lucide-react'
import { TROPHIES } from '@/data/trophies'
import type { TrophyDef } from '@/data/types'
import { useI18n } from '@/hooks/useLanguage'
import { dependencyStatus, isTrophyDone } from '@/lib/progress'
import type { ProgressState } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface Props {
  trophy: TrophyDef
  state: ProgressState
  onOpen: (id: string) => void
}

export function DependencyIndicator({ trophy, state, onOpen }: Props) {
  const { t, dict } = useI18n()
  const { met, pending } = dependencyStatus(trophy, TROPHIES, state)
  const conflicts = trophy.conflictsWith ?? []

  if (met.length + pending.length === 0 && conflicts.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5 text-xs">
      {trophy.requiresAll ? (
        <p className="flex items-center gap-1.5 text-muted-foreground">
          <Link2 className="size-3.5 shrink-0" aria-hidden="true" />
          {t('requiresAll', { done: met.length, total: met.length + pending.length })}
        </p>
      ) : (
        (met.length > 0 || pending.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 font-medium text-muted-foreground">
              <Link2 className="size-3.5" aria-hidden="true" />
              {t('dependsOn')}:
            </span>
            {[...(trophy.dependsOn ?? [])].map((id) => {
              const done = isTrophyDone(state, id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onOpen(id)}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50',
                    done ? 'border-primary/40 text-primary' : 'border-border text-foreground',
                  )}
                >
                  {done ? (
                    <CircleCheck className="size-3" aria-hidden="true" />
                  ) : (
                    <CircleDashed className="size-3" aria-hidden="true" />
                  )}
                  {dict.trophies[id]?.name ?? id}
                  <span className="sr-only">({done ? t('filterDone') : t('filterPending')})</span>
                </button>
              )
            })}
          </div>
        )
      )}
      {conflicts.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="flex items-center gap-1 font-medium text-destructive">
            <Ban className="size-3.5" aria-hidden="true" />
            {t('conflictsWith')}:
          </span>
          {conflicts.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onOpen(id)}
              className="rounded-sm border border-destructive/40 px-1.5 py-0.5 text-destructive outline-none hover:bg-destructive/10 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {dict.trophies[id]?.name ?? id}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
