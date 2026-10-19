import { Trophy } from 'lucide-react'
import type { TrophyGrade } from '@/data/types'
import { useI18n } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils'

const GRADE_CLASS: Record<TrophyGrade, string> = {
  platinum: 'text-grade-platinum',
  gold: 'text-grade-gold',
  silver: 'text-grade-silver',
  bronze: 'text-grade-bronze',
}

const GRADE_KEY = {
  platinum: 'gradePlatinum',
  gold: 'gradeGold',
  silver: 'gradeSilver',
  bronze: 'gradeBronze',
} as const

export function GradeIcon({ grade, className }: { grade: TrophyGrade; className?: string }) {
  const { t } = useI18n()
  const label = t(GRADE_KEY[grade])
  return (
    <span title={label} className={cn('inline-flex shrink-0', GRADE_CLASS[grade], className)}>
      <Trophy className="size-5" strokeWidth={2.25} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}
