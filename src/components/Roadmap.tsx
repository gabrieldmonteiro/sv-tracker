import { ChevronDown, MapIcon } from 'lucide-react'
import { useI18n } from '@/hooks/useLanguage'

const STAGES = [
  { title: 'stage1Title', body: 'stage1Body' },
  { title: 'stage2Title', body: 'stage2Body' },
  { title: 'stage3Title', body: 'stage3Body' },
] as const

export function Roadmap() {
  const { t } = useI18n()

  return (
    <details className="group pixel-panel p-4 sm:p-5">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
        <MapIcon className="size-5 text-wood" aria-hidden="true" />
        <h2 className="flex-1 font-heading text-lg">{t('roadmap')}</h2>
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
        <div className="rounded-md bg-secondary px-2 py-1.5">
          <dt className="text-xs text-muted-foreground">{t('difficulty')}</dt>
          <dd className="font-semibold">6/10</dd>
        </div>
        <div className="rounded-md bg-secondary px-2 py-1.5">
          <dt className="text-xs text-muted-foreground">{t('playthroughs')}</dt>
          <dd className="font-semibold">2</dd>
        </div>
        <div className="rounded-md bg-secondary px-2 py-1.5">
          <dt className="text-xs text-muted-foreground">{t('hours')}</dt>
          <dd className="font-semibold">110</dd>
        </div>
      </dl>
      <p className="mt-1 text-center text-xs text-muted-foreground">{t('guideStats')}</p>
      <ol className="mt-3 grid gap-3 text-sm">
        {STAGES.map((stage) => (
          <li key={stage.title} className="border-l-4 border-primary/50 pl-3">
            <h3 className="font-semibold">{t(stage.title)}</h3>
            <p className="mt-0.5 text-muted-foreground">{t(stage.body)}</p>
          </li>
        ))}
      </ol>
    </details>
  )
}
