import { ExternalLink, Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ITEM_BY_ID, WIKI_HOSTS, itemSpriteUrl, wikiUrl } from '@/data/items'
import type { Season } from '@/data/types'
import { useI18n } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

const SEASON_KEY = {
  spring: 'seasonSpring',
  summer: 'seasonSummer',
  fall: 'seasonFall',
  winter: 'seasonWinter',
} as const satisfies Record<Season, string>

/** Localized "how to obtain" lines: growing facts first, then the wiki summary. */
export function useItemObtain(id: string): string[] {
  const { t, dict } = useI18n()
  const def = ITEM_BY_ID.get(id)
  const lines =
    def?.grow?.map((growth) => {
      const seasons = growth.seasons.map((season) => t(SEASON_KEY[season]))
      const joined =
        seasons.length > 1 ? `${seasons.slice(0, -1).join(', ')} ${t('listAnd')} ${seasons.at(-1)}` : seasons[0]
      return t('itemGrow', { seed: dict.items.seeds[growth.seed] ?? growth.seed, seasons: joined, days: growth.days })
    }) ?? []
  const obtain = dict.items.items[id]?.obtain
  return obtain ? [...lines, obtain] : lines
}

export function ItemSprite({ id, className }: { id: string; className?: string }) {
  return (
    <img
      src={itemSpriteUrl(id)}
      alt=""
      aria-hidden="true"
      data-item-sprite={id}
      loading="lazy"
      decoding="async"
      className={cn('size-5 shrink-0 object-contain [image-rendering:pixelated]', className)}
    />
  )
}

function ItemDetails({ id }: { id: string }) {
  const { t, dict, language } = useI18n()
  const text = dict.items.items[id]
  const lines = useItemObtain(id)
  return (
    <div className="flex items-start gap-3">
      <ItemSprite id={id} className="size-10" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-snug">{text?.name ?? id}</p>
        {lines.length > 0 ? (
          lines.map((line) => (
            <p key={line} className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {line}
            </p>
          ))
        ) : (
          <p className="mt-1 text-xs text-muted-foreground italic">{t('itemNoObtain')}</p>
        )}
        {text && (
          <a
            href={wikiUrl(WIKI_HOSTS[language], text.wiki)}
            target="_blank"
            rel="noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            {t('itemWiki')}
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  )
}

/** Compact sprite + name chip; tap or click opens how to obtain the item. */
export function ItemChip({ id }: { id: string }) {
  const { dict } = useI18n()
  const name = dict.items.items[id]?.name ?? id
  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex max-w-full items-center gap-1 rounded-sm border border-border bg-background/70 py-0.5 pr-1.5 pl-0.5 text-xs font-medium text-foreground/90 transition-colors hover:border-primary/50 hover:bg-accent/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[state=open]:border-primary/60 data-[state=open]:bg-accent"
        data-item-chip={id}
      >
        <ItemSprite id={id} />
        <span className="truncate">{name}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)] rounded-md border-2 border-border bg-card ring-0">
        <ItemDetails id={id} />
      </PopoverContent>
    </Popover>
  )
}

/** Icon-only trigger for steps whose label already is the item name (e.g. Polyculture crops). */
export function ItemInfo({ id }: { id: string }) {
  const { dict } = useI18n()
  const name = dict.items.items[id]?.name ?? id
  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[state=open]:bg-accent"
        data-item-chip={id}
        aria-label={name}
        title={name}
      >
        <Info className="size-3.5" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)] rounded-md border-2 border-border bg-card ring-0">
        <ItemDetails id={id} />
      </PopoverContent>
    </Popover>
  )
}

export function ItemChips({
  ids,
  limit,
  onMore,
  className,
}: {
  ids: string[]
  limit?: number
  onMore?: () => void
  className?: string
}) {
  const { t } = useI18n()
  if (ids.length === 0) return null
  const shown = limit && ids.length > limit ? ids.slice(0, limit) : ids
  const hidden = ids.length - shown.length
  return (
    <ul className={cn('flex flex-wrap items-center gap-1', className)} aria-label={t('itemsHeading')}>
      {shown.map((id) => (
        <li key={id} className="min-w-0">
          <ItemChip id={id} />
        </li>
      ))}
      {hidden > 0 && onMore && (
        <li>
          <button
            type="button"
            onClick={onMore}
            className="rounded-sm px-1 text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            {t('itemsMore', { count: hidden })}
          </button>
        </li>
      )}
    </ul>
  )
}

/** Full list for the detail view: every item with its obtain lines visible. */
export function ItemList({ ids }: { ids: string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {ids.map((id) => (
        <li key={id} className="rounded-md border-2 border-border bg-background/60 p-2.5" data-item-entry={id}>
          <ItemDetails id={id} />
        </li>
      ))}
    </ul>
  )
}
