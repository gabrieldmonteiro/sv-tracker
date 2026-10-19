import type { CategoryId } from '@/data/types'

export type Language = 'pt-BR' | 'en' | 'es'

export interface TrophyText {
  name: string
  description: string
  unlock: string
  requirements: string[]
  notes: string[]
  subtasks?: Record<string, string>
}

export type TrophyTexts = Record<string, TrophyText>

export interface UIStrings {
  appTitle: string
  appSubtitle: string
  languageLabel: string
  overallProgress: string
  done: string
  remaining: string
  complete: string
  trophiesCount: string
  categoryProgress: string
  filtersLabel: string
  filterAll: string
  filterDone: string
  filterPending: string
  filterMissable: string
  categoryLabel: string
  allCategories: string
  searchLabel: string
  searchPlaceholder: string
  clearSearch: string
  resultsCount: string
  emptyTitle: string
  emptyBody: string
  clearFilters: string
  markDone: string
  markPending: string
  details: string
  steps: string
  showSteps: string
  hideSteps: string
  stepsProgress: string
  requirements: string
  unlockConditions: string
  notes: string
  dependsOn: string
  conflictsWith: string
  prerequisitesPending: string
  prerequisitesMet: string
  requiresAll: string
  missable: string
  missableAlertTitle: string
  missableAlertBody: string
  conflictAlert: string
  buggy: string
  buggyHint: string
  grind: string
  collectable: string
  gradePlatinum: string
  gradeGold: string
  gradeSilver: string
  gradeBronze: string
  stageLabel: string
  roadmap: string
  stage1Title: string
  stage1Body: string
  stage2Title: string
  stage2Body: string
  stage3Title: string
  stage3Body: string
  guideStats: string
  difficulty: string
  playthroughs: string
  hours: string
  reset: string
  resetTitle: string
  resetBody: string
  cancel: string
  confirmReset: string
  close: string
  storageUnavailable: string
  storageCorrupt: string
  saveFailed: string
  dismiss: string
  errorTitle: string
  errorBody: string
  reload: string
  platinumEarned: string
  footerStorage: string
  footerSource: string
  footerScope: string
  categories: Record<CategoryId, string>
}

export interface Dictionary {
  ui: UIStrings
  trophies: TrophyTexts
}
