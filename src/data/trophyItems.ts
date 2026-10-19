import { POLYCULTURE_CROPS } from './trophies'

export interface TrophyItemRefs {
  /** Items named in the trophy's description, requirements or notes. */
  items?: string[]
  /** Items named in a specific step, keyed by subtask id. */
  subtasks?: Record<string, string[]>
}

/** Trophy id → in-game items its text names. Ids refer to `ITEMS` in `./items`. */
export const TROPHY_ITEMS: Readonly<Record<string, TrophyItemRefs>> = {
  legend: {
    items: [
      'iridium-sprinkler',
      'starfruit',
      'wine',
      'keg',
      'cask',
      'potato',
      'strawberry',
      'green-bean',
      'sweet-gem-berry',
      'cranberries',
      'grape',
      'truffle',
      'truffle-oil',
    ],
  },
  'a-complete-collection': {
    items: ['geode', 'copper-pan', 'omni-geode', 'artifact-trove', 'burglars-ring', 'stardrop'],
    subtasks: {
      'dwarf-scrolls': ['dwarf-scroll-i', 'dwarf-scroll-ii', 'dwarf-scroll-iii', 'dwarf-scroll-iv'],
      'strange-dolls': ['secret-note', 'strange-doll-green', 'strange-doll-yellow'],
    },
  },
  'best-friends': { items: ['bouquet'] },
  'moving-up': { items: ['wood'] },
  'living-large': { items: ['hardwood', 'cask'] },
  'craft-master': { items: ['cask', 'wedding-ring'], subtasks: { cellar: ['cask'] } },
  'master-angler': {
    items: ['iridium-rod', 'bait', 'trap-bobber', 'trout-soup', 'seafoam-pudding', 'wild-bait', 'magic-bait', 'crab-pot', 'stardrop'],
    subtasks: {
      'iridium-rod': ['iridium-rod'],
      'crab-pot': ['crab-pot'],
      crimsonfish: ['crimsonfish'],
      angler: ['angler'],
      legend: ['legend-fish'],
      'mutant-carp': ['mutant-carp'],
      glacierfish: ['glacierfish'],
    },
  },
  polyculture: {
    items: [
      'garlic-seeds',
      'red-cabbage-seeds',
      'artichoke-seeds',
      'rhubarb-seeds',
      'starfruit-seeds',
      'beet-seeds',
      'strawberry-seeds',
      'coffee-bean',
    ],
    subtasks: Object.fromEntries(POLYCULTURE_CROPS.map((crop) => [crop, [crop]])),
  },
  monoculture: {
    items: ['ancient-fruit', 'blue-jazz', 'fairy-rose', 'summer-spangle', 'tulip', 'scarecrow', 'sprinkler', 'hops', 'corn', 'speed-gro'],
  },
  'full-shipment': { items: ['dinosaur-mayonnaise', 'dinosaur-egg', 'mayonnaise-machine'] },
  'the-bottom': { items: ['skull-key', 'staircase', 'stone'] },
  'mystery-of-the-stardrops': { items: ['stardrop', 'steel-axe'], subtasks: { cannoli: ['sweet-gem-berry'] } },
  'full-house': {
    items: ['bouquet', 'mermaids-pendant'],
    subtasks: { bouquet: ['bouquet'], pendant: ['mermaids-pendant'] },
  },
}

export function trophyItemIds(trophyId: string): string[] {
  const refs = TROPHY_ITEMS[trophyId]
  if (!refs) return []
  return [...new Set([...(refs.items ?? []), ...Object.values(refs.subtasks ?? {}).flat()])]
}
