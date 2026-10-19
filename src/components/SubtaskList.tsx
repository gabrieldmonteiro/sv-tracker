import { Checkbox } from '@/components/ui/checkbox'
import { TROPHY_ITEMS } from '@/data/trophyItems'
import type { TrophyDef } from '@/data/types'
import { useI18n } from '@/hooks/useLanguage'
import { subtaskKey, type ProgressState } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { ItemChip, ItemInfo, ItemSprite } from './ItemChip'

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
  const stepItems = TROPHY_ITEMS[trophy.id]?.subtasks ?? {}

  return (
    <ul className={cn('grid gap-1', ids.length > 10 && 'sm:grid-cols-2')}>
      {ids.map((subtaskId) => {
        const id = `${idPrefix}-${trophy.id}-${subtaskId}`
        const checked = state.subtasks[subtaskKey(trophy.id, subtaskId)] === true
        const items = stepItems[subtaskId] ?? []
        const label = labels[subtaskId] ?? subtaskId
        const singleNamed = items.length === 1 && dict.items.items[items[0]]?.name === label
        return (
          <li key={subtaskId} className="flex items-start gap-2.5 rounded-md px-1.5 py-1 hover:bg-secondary/70">
            <Checkbox
              id={id}
              checked={checked}
              onCheckedChange={() => onToggle(trophy.id, subtaskId)}
              className="mt-0.5 size-[18px] border-2 bg-background"
            />
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
              <label
                htmlFor={id}
                className={cn(
                  'flex cursor-pointer items-center gap-1.5 text-sm leading-snug',
                  checked && 'text-muted-foreground line-through',
                )}
              >
                {singleNamed && <ItemSprite id={items[0]} />}
                {label}
              </label>
              {items.length > 0 &&
                (singleNamed ? (
                  <ItemInfo id={items[0]} />
                ) : (
                  items.map((item) => <ItemChip key={item} id={item} />)
                ))}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
