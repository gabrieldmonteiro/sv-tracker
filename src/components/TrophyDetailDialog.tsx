import type { ReactNode } from 'react'
import { Bug, CheckCircle2, Circle, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TROPHY_BY_ID } from '@/data/trophies'
import { useI18n } from '@/hooks/useLanguage'
import { isTrophyDone, subtaskProgress } from '@/lib/progress'
import type { ProgressState } from '@/lib/storage'
import { DependencyIndicator } from './DependencyIndicator'
import { GradeIcon } from './GradeIcon'
import { SubtaskList } from './SubtaskList'
import { TrophyBadges } from './TrophyBadges'
import { TrophyIcon } from './TrophyIcon'

interface Props {
  trophyId: string | null
  state: ProgressState
  onClose: () => void
  onOpen: (id: string) => void
  onToggle: (id: string) => void
  onToggleSubtask: (trophyId: string, subtaskId: string) => void
}

export function TrophyDetailDialog({ trophyId, state, onClose, onOpen, onToggle, onToggleSubtask }: Props) {
  const { t, dict } = useI18n()
  const trophy = trophyId ? TROPHY_BY_ID.get(trophyId) : undefined
  const text = trophy ? dict.trophies[trophy.id] : undefined
  const steps = trophy ? subtaskProgress(trophy, state) : null

  return (
    <Dialog open={Boolean(trophy && text)} onOpenChange={(open) => !open && onClose()}>
      {trophy && text && (
        <DialogContent
          closeLabel={t('close')}
          className="flex max-h-[min(90dvh,48rem)] flex-col gap-0 overflow-hidden rounded-md border-2 border-border bg-card p-0 sm:max-w-2xl"
        >
          <DialogHeader className="border-b-2 border-border p-5 pr-12">
            <div className="flex items-start gap-3">
              <TrophyIcon trophy={trophy} className="size-16" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2">
                  <GradeIcon grade={trophy.grade} className="mt-1" />
                  <DialogTitle className="font-heading text-xl leading-tight">{text.name}</DialogTitle>
                </div>
                <DialogDescription className="mt-1 text-sm text-muted-foreground">{text.description}</DialogDescription>
              </div>
            </div>
            <div className="pt-2">
              <TrophyBadges trophy={trophy} />
            </div>
          </DialogHeader>

          <div className="flex flex-col gap-5 overflow-y-auto p-5 text-sm">
            {trophy.flags.missable && (
              <Callout tone="danger" icon={<TriangleAlert className="size-4" aria-hidden="true" />}>
                {t('missableAlertBody')}
              </Callout>
            )}
            {trophy.flags.buggy && (
              <Callout tone="warning" icon={<Bug className="size-4" aria-hidden="true" />}>
                {t('buggyHint')}
              </Callout>
            )}

            <Section title={t('unlockConditions')}>
              <p>{text.unlock}</p>
            </Section>

            <Section title={t('requirements')}>
              <BulletList items={text.requirements} />
            </Section>

            {steps && steps.total > 0 && (
              <Section title={`${t('steps')} · ${t('stepsProgress', { done: steps.done, total: steps.total })}`}>
                <SubtaskList trophy={trophy} state={state} onToggle={onToggleSubtask} idPrefix="dialog" />
              </Section>
            )}

            <DependencyIndicator trophy={trophy} state={state} onOpen={onOpen} />

            {text.notes.length > 0 && (
              <Section title={t('notes')}>
                <BulletList items={text.notes} />
              </Section>
            )}
          </div>

          <DialogFooter className="m-0 flex-row justify-end gap-2 rounded-none border-t-2 border-border bg-secondary/60 p-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-2">
              {t('close')}
            </Button>
            <Button type="button" onClick={() => onToggle(trophy.id)}>
              {isTrophyDone(state, trophy.id) ? (
                <>
                  <Circle aria-hidden="true" />
                  {t('markPending', { name: text.name })}
                </>
              ) : (
                <>
                  <CheckCircle2 aria-hidden="true" />
                  {t('markDone', { name: text.name })}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      )}
    </Dialog>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 text-xs font-semibold tracking-wide text-wood uppercase">{title}</h3>
      {children}
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid list-disc gap-1 pl-5 marker:text-primary">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function Callout({ tone, icon, children }: { tone: 'danger' | 'warning'; icon: ReactNode; children: ReactNode }) {
  const toneClass =
    tone === 'danger'
      ? 'border-destructive/40 bg-destructive/10 text-destructive'
      : 'border-warning-foreground/30 bg-warning text-warning-foreground'
  return (
    <div role="note" className={`flex items-start gap-2 rounded-md border-2 px-3 py-2 ${toneClass}`}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p>{children}</p>
    </div>
  )
}
