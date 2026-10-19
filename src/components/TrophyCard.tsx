import { useState } from 'react'
import { ChevronDown, Info, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { TrophyDef } from '@/data/types'
import { useI18n } from '@/hooks/useLanguage'
import { isTrophyDone, subtaskProgress } from '@/lib/progress'
import type { ProgressState } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { DependencyIndicator } from './DependencyIndicator'
import { GradeIcon } from './GradeIcon'
import { SubtaskList } from './SubtaskList'
import { TrophyBadges } from './TrophyBadges'

interface Props {
  trophy: TrophyDef
  state: ProgressState
  onToggle: (id: string) => void
  onToggleSubtask: (trophyId: string, subtaskId: string) => void
  onOpenDetails: (id: string) => void
}

export function TrophyCard({ trophy, state, onToggle, onToggleSubtask, onOpenDetails }: Props) {
  const { t, dict } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const text = dict.trophies[trophy.id]
  const done = isTrophyDone(state, trophy.id)
  const steps = subtaskProgress(trophy, state)
  const name = text?.name ?? trophy.id
  const checkboxId = `trophy-${trophy.id}`
  const stepsId = `steps-${trophy.id}`

  return (
    <article
      aria-labelledby={`${checkboxId}-name`}
      className={cn('pixel-panel p-4 transition-colors', done && 'border-primary/50 bg-accent/40')}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={checkboxId}
          checked={done}
          onCheckedChange={() => onToggle(trophy.id)}
          aria-label={done ? t('markPending', { name }) : t('markDone', { name })}
          className="mt-0.5 size-6 rounded-sm border-2 bg-background [&_svg]:size-4"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <GradeIcon grade={trophy.grade} className="mt-px" />
            <h3
              id={`${checkboxId}-name`}
              className={cn('text-base leading-snug font-semibold', done && 'text-muted-foreground line-through decoration-2')}
            >
              <label htmlFor={checkboxId} className="cursor-pointer">
                {name}
              </label>
            </h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{text?.description}</p>

          <div className="mt-3 flex flex-col gap-2.5">
            <TrophyBadges trophy={trophy} />
            {trophy.flags.missable && !done && (
              <p className="flex items-start gap-1.5 rounded-md bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                {t('conflictAlert')}
              </p>
            )}
            <DependencyIndicator trophy={trophy} state={state} onOpen={onOpenDetails} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {steps.total > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-expanded={expanded}
                aria-controls={stepsId}
                onClick={() => setExpanded((value) => !value)}
                className="border-2"
              >
                <ChevronDown className={cn('transition-transform', expanded && 'rotate-180')} aria-hidden="true" />
                {expanded ? t('hideSteps') : t('showSteps')}
                <span className="tabular-nums text-muted-foreground">
                  {t('stepsProgress', { done: steps.done, total: steps.total })}
                </span>
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={() => onOpenDetails(trophy.id)}>
              <Info aria-hidden="true" />
              {t('details')}
              <span className="sr-only">: {name}</span>
            </Button>
          </div>

          {steps.total > 0 && expanded && (
            <div id={stepsId} className="mt-2 border-t-2 border-dashed border-border pt-2">
              <SubtaskList trophy={trophy} state={state} onToggle={onToggleSubtask} idPrefix="card" />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
