import { Bug, Clock, Gem, TriangleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { TrophyDef } from '@/data/types'
import { useI18n } from '@/hooks/useLanguage'

export function TrophyBadges({ trophy }: { trophy: TrophyDef }) {
  const { t, dict } = useI18n()
  const { flags } = trophy

  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variant="outline" className="rounded-sm border-border bg-background text-muted-foreground">
        {t('stageLabel', { stage: trophy.stage })}
      </Badge>
      <Badge variant="outline" className="rounded-sm border-border bg-background text-muted-foreground">
        {dict.ui.categories[trophy.category]}
      </Badge>
      {flags.missable && (
        <Badge className="rounded-sm border border-destructive/40 bg-destructive/10 text-destructive">
          <TriangleAlert aria-hidden="true" />
          {t('missable')}
        </Badge>
      )}
      {flags.buggy && (
        <Badge className="rounded-sm border border-warning-foreground/30 bg-warning text-warning-foreground" title={t('buggyHint')}>
          <Bug aria-hidden="true" />
          {t('buggy')}
        </Badge>
      )}
      {flags.grind && (
        <Badge variant="secondary" className="rounded-sm">
          <Clock aria-hidden="true" />
          {t('grind')}
        </Badge>
      )}
      {flags.collectable && (
        <Badge variant="secondary" className="rounded-sm">
          <Gem aria-hidden="true" />
          {t('collectable')}
        </Badge>
      )}
    </div>
  )
}
