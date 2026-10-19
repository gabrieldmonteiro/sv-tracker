import { useRef, useState, type ChangeEvent } from 'react'
import { Download, Upload } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { TROPHIES } from '@/data/trophies'
import { useI18n } from '@/hooks/useLanguage'
import {
  MAX_SAVE_FILE_BYTES,
  parseSaveFile,
  saveFileName,
  serializeSaveFile,
  type SaveFileError,
} from '@/lib/saveFile'
import type { ProgressState } from '@/lib/storage'

const ERROR_KEY = {
  'too-large': 'importErrorTooLarge',
  'invalid-json': 'importErrorInvalidJson',
  'not-a-save': 'importErrorNotSave',
  'unsupported-version': 'importErrorVersion',
  'invalid-data': 'importErrorData',
  unreadable: 'importErrorRead',
} as const satisfies Record<SaveFileError | 'unreadable', string>

function downloadText(text: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

interface Props {
  state: ProgressState
  onImport: (state: ProgressState) => void
}

export function SaveFileControls({ state, onImport }: Props) {
  const { t, language } = useI18n()
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<ProgressState | null>(null)
  const [error, setError] = useState<keyof typeof ERROR_KEY | null>(null)
  const [status, setStatus] = useState('')

  const formatDate = (iso?: string) =>
    iso
      ? new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
      : t('dateUnknown')

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setStatus('')
    if (file.size > MAX_SAVE_FILE_BYTES) {
      setError('too-large')
      return
    }
    let text: string
    try {
      text = await file.text()
    } catch {
      setError('unreadable')
      return
    }
    const result = parseSaveFile(text)
    if (result.ok) setPending(result.state)
    else setError(result.error)
  }

  const confirmImport = () => {
    if (pending) onImport(pending)
    setPending(null)
    setStatus(t('importDone'))
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-2"
        onClick={() => downloadText(serializeSaveFile(state), saveFileName())}
      >
        <Download aria-hidden="true" />
        {t('exportSave')}
      </Button>
      <Button type="button" variant="outline" size="sm" className="border-2" onClick={() => inputRef.current?.click()}>
        <Upload aria-hidden="true" />
        {t('importSave')}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        data-testid="import-file"
        aria-label={t('importSave')}
        onChange={handleFile}
      />
      <span className="sr-only" role="status">
        {status}
      </span>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent className="rounded-md border-2 border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">{t('importTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {pending &&
                t('importBody', {
                  done: Object.keys(pending.trophies).length,
                  total: TROPHIES.length,
                  steps: Object.keys(pending.subtasks).length,
                })}
            </AlertDialogDescription>
            {pending && (
              <p className="text-xs text-muted-foreground">
                {t('importDates', { created: formatDate(pending.createdAt), updated: formatDate(pending.updatedAt) })}
              </p>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>{t('confirmImport')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={error !== null} onOpenChange={(open) => !open && setError(null)}>
        <AlertDialogContent className="rounded-md border-2 border-destructive/40 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-destructive">{t('importErrorTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {error && t(ERROR_KEY[error])} {t('importErrorKept')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setError(null)}>{t('ok')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
