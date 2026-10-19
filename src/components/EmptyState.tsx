import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/useLanguage'

export function EmptyState({ onClear }: { onClear: () => void }) {
  const { t } = useI18n()

  return (
    <div role="status" className="pixel-panel flex flex-col items-center gap-3 px-6 py-12 text-center">
      <SearchX className="size-10 text-wood" aria-hidden="true" />
      <h2 className="font-heading text-lg">{t('emptyTitle')}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{t('emptyBody')}</p>
      <Button type="button" onClick={onClear}>
        {t('clearFilters')}
      </Button>
    </div>
  )
}
