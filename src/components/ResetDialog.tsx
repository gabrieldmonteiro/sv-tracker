import { RotateCcw } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/useLanguage'

export function ResetDialog({ onConfirm, disabled }: { onConfirm: () => void; disabled?: boolean }) {
  const { t } = useI18n()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive" size="sm" disabled={disabled}>
          <RotateCcw aria-hidden="true" />
          {t('reset')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-md border-2 border-border bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading">{t('resetTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('resetBody')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {t('confirmReset')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
