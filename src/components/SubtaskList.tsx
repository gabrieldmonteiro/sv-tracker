import { Checkbox } from '@/components/ui/checkbox'
import type { TrophyDef } from '@/data/types'
import { useI18n } from '@/hooks/useLanguage'
import { subtaskKey, type ProgressState } from '@/lib/storage'
import { cn } from '@/lib/utils'

interface Props {
  trophy: TrophyDef
  state: ProgressState
  onToggle: (trophyId: string, subtaskId: string) => void
  /** Prefix keeps checkbox ids unique when the same list renders in a card and in the dialog. */
  idPrefix: string
}

export function SubtaskList({ trophy, state, onToggle, idPrefix }: Props) {
  const { dict } = useI18n()
  const labels = dict.trophies[trophy.id]?.subtasks ?? {}
  const ids = trophy.subtasks ?? []

  return (
    <ul className={cn('grid gap-1', ids.length > 10 && 'sm:grid-cols-2')}>
      {ids.map((subtaskId) => {
        const id = `${idPrefix}-${trophy.id}-${subtaskId}`
        const checked = state.subtasks[subtaskKey(trophy.id, subtaskId)] === true
        return (
          <li key={subtaskId} className="flex items-start gap-2.5 rounded-md px-1.5 py-1 hover:bg-secondary/70">
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={() => onToggle(trophy.id, subtaskId)}
              className="mt-0.5 size-[18px] border-2 bg-background"
            />
            <label
              htmlFor={id}
              className={cn('cursor-pointer text-sm leading-snug', checked && 'text-muted-foreground line-through')}
            >
              {labels[subtaskId] ?? subtaskId}
            </label>
          </li>
        )
      })}
    </ul>
  )
}
