export type TrophyGrade = 'platinum' | 'gold' | 'silver' | 'bronze'

export type CategoryId =
  | 'platinum'
  | 'money'
  | 'friendship'
  | 'family'
  | 'cooking'
  | 'crafting'
  | 'fishing'
  | 'collections'
  | 'farming'
  | 'community'
  | 'adventure'
  | 'arcade'

/** Roadmap stage from the guide: 1 = Community Center & collectibles, 2 = Joja, 3 = Prairie King. */
export type Stage = 1 | 2 | 3

export interface TrophyFlags {
  missable?: boolean
  /** The guide reports the trophy may fail to unlock. */
  buggy?: boolean
  /** Marked "Grind" (time-consuming) in the guide. */
  grind?: boolean
  /** Marked "Collectable" in the guide. */
  collectable?: boolean
}

export interface TrophyDef {
  /** Stable identifier; never rename — it is the key used for saved progress and translations. */
  id: string
  grade: TrophyGrade
  category: CategoryId
  stage: Stage
  /** Position in the guide's recommended order (lower first). */
  order: number
  flags: TrophyFlags
  /** Trophies that are prerequisites or naturally come before this one. */
  dependsOn?: string[]
  /** Trophies that cannot be earned on the same save file. */
  conflictsWith?: string[]
  /** Requires every other trophy (platinum). */
  requiresAll?: boolean
  /** Stable subtask identifiers; labels live in the translation files. */
  subtasks?: string[]
}

export type Season = 'spring' | 'summer' | 'fall' | 'winter'

export interface CropGrowth {
  /** Seed id; its name is translated in the locale item files. */
  seed: string
  seasons: Season[]
  days: number
}

export interface ItemDef {
  /** Stable identifier; also the sprite file name in `public/items/`. */
  id: string
  /** English Stardew Valley Wiki page the facts come from. */
  wiki: string
  /** Growing facts from the wiki infobox, for crops. */
  grow?: CropGrowth[]
}
