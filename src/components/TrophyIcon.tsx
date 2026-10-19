import { useState } from 'react'
import { trophyIconUrl } from '@/data/trophyIcons'
import type { TrophyDef } from '@/data/types'
import { cn } from '@/lib/utils'
import { GradeIcon } from './GradeIcon'

/** Decorative: the trophy name is always rendered next to it. Falls back to the grade cup if the file fails. */
export function TrophyIcon({ trophy, done, className }: { trophy: TrophyDef; done?: boolean; className?: string }) {
  const src = trophyIconUrl(trophy.id)
  const [failed, setFailed] = useState(false)

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm border-2 border-border bg-secondary',
        className,
      )}
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          data-trophy-icon={trophy.id}
          width={240}
          height={240}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className={cn('size-full [image-rendering:pixelated]', done && 'opacity-60 grayscale-[35%]')}
        />
      ) : (
        <GradeIcon grade={trophy.grade} />
      )}
    </span>
  )
}
