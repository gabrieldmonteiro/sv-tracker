import { CircleAlert, TriangleAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/useLanguage'
import type { LoadStatus } from '@/lib/storage'

export function StorageNotice({
  loadStatus,
  saveFailed,
  onDismiss,
}: {
  loadStatus: LoadStatus
  saveFailed: boolean
  onDismiss: () => void
}) {
  const { t } = useI18n()
  const message =
    loadStatus === 'unavailable'
      ? t('storageUnavailable')
      : loadStatus === 'corrupt'
        ? t('storageCorrupt')
        : saveFailed
          ? t('saveFailed')
          : null

  if (!message) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border-2 border-warning-foreground/30 bg-warning px-3 py-2 text-sm text-warning-foreground"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p className="flex-1">{message}</p>
      {loadStatus !== 'unavailable' && (
        <Button type="button" variant="ghost" size="icon-xs" onClick={onDismiss} aria-label={t('dismiss')}>
          <X aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}

export function MissableAlert({ onShow, onClose }: { onShow: () => void; onClose: () => void }) {
  const { t } = useI18n()

  return (
    <aside
      aria-labelledby="missable-title"
      className="relative flex flex-col gap-2 rounded-md border-2 border-destructive/40 bg-destructive/5 p-4 pr-11 text-sm sm:flex-row sm:items-start"
    >
      <TriangleAlert className="size-5 shrink-0 text-destructive" aria-hidden="true" />
      <div className="flex-1">
        <h2 id="missable-title" className="font-semibold text-destructive">
          {t('missableAlertTitle')}
        </h2>
        <p className="mt-0.5 text-foreground/80">{t('missableAlertBody')}</p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onShow} className="shrink-0 self-start border-2">
        {t('filterMissable')}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        aria-label={t('missableAlertClose')}
        title={t('missableAlertClose')}
        className="absolute top-2 right-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <X aria-hidden="true" />
      </Button>
    </aside>
  )
}
