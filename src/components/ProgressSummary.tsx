import { Progress } from '@/components/ui/progress'
import { useI18n } from '@/hooks/useLanguage'
import type { ProgressSummary as Summary } from '@/lib/progress'

export function OverallProgress({ summary }: { summary: Summary }) {
  const { t } = useI18n()

  return (
    <section aria-labelledby="overall-progress-title" className="pixel-panel p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="overall-progress-title" className="font-heading text-lg">
            {t('overallProgress')}
          </h2>
          <p className="text-sm text-muted-foreground">{t('trophiesCount', { done: summary.done, total: summary.total })}</p>
        </div>
        <p className="font-heading text-4xl leading-none text-primary" aria-hidden="true">
          {summary.percent}%
        </p>
      </div>
      <Progress
        value={summary.percent}
        aria-label={`${t('overallProgress')}: ${summary.percent}% ${t('complete')}`}
        className="mt-4 h-3 rounded-sm border border-border bg-muted [&>[data-slot=progress-indicator]]:bg-primary"
      />
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label={t('done')} value={summary.done} />
        <Stat label={t('remaining')} value={summary.remaining} />
        <Stat label="%" value={`${summary.percent}%`} />
      </dl>
      {summary.total > 0 && summary.remaining === 0 && (
        <p role="status" className="mt-4 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground">
          {t('platinumEarned')}
        </p>
      )}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-secondary px-2 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
