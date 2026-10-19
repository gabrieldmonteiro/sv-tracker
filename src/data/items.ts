import type { ItemDef } from './types'

/**
 * In-game items named in the trophy texts. Facts (sprite, how to grow or obtain) come from the official
 * Stardew Valley Wiki page in `wiki`; sprites are bundled as `public/items/<id>.png`.
 * Localized names and obtain summaries live in `src/i18n/locales/<language>/items.ts`.
 */
export const ITEMS: ItemDef[] = [
  // Crops (Polyculture)
  { id: 'parsnip', wiki: 'Parsnip', grow: [{ seed: 'parsnip-seeds', seasons: ['spring'], days: 4 }] },
  { id: 'green-bean', wiki: 'Green Bean', grow: [{ seed: 'bean-starter', seasons: ['spring'], days: 10 }] },
  { id: 'cauliflower', wiki: 'Cauliflower', grow: [{ seed: 'cauliflower-seeds', seasons: ['spring'], days: 12 }] },
  { id: 'potato', wiki: 'Potato', grow: [{ seed: 'potato-seeds', seasons: ['spring'], days: 6 }] },
  { id: 'kale', wiki: 'Kale', grow: [{ seed: 'kale-seeds', seasons: ['spring'], days: 6 }] },
  { id: 'garlic', wiki: 'Garlic', grow: [{ seed: 'garlic-seeds', seasons: ['spring'], days: 4 }] },
  { id: 'rhubarb', wiki: 'Rhubarb', grow: [{ seed: 'rhubarb-seeds', seasons: ['spring'], days: 13 }] },
  { id: 'coffee-bean', wiki: 'Coffee Bean', grow: [{ seed: 'coffee-bean', seasons: ['spring', 'summer'], days: 10 }] },
  { id: 'strawberry', wiki: 'Strawberry', grow: [{ seed: 'strawberry-seeds', seasons: ['spring'], days: 8 }] },
  { id: 'melon', wiki: 'Melon', grow: [{ seed: 'melon-seeds', seasons: ['summer'], days: 12 }] },
  { id: 'tomato', wiki: 'Tomato', grow: [{ seed: 'tomato-seeds', seasons: ['summer'], days: 11 }] },
  { id: 'blueberry', wiki: 'Blueberry', grow: [{ seed: 'blueberry-seeds', seasons: ['summer'], days: 13 }] },
  { id: 'hot-pepper', wiki: 'Hot Pepper', grow: [{ seed: 'pepper-seeds', seasons: ['summer'], days: 5 }] },
  { id: 'wheat', wiki: 'Wheat', grow: [{ seed: 'wheat-seeds', seasons: ['summer', 'fall'], days: 4 }] },
  { id: 'radish', wiki: 'Radish', grow: [{ seed: 'radish-seeds', seasons: ['summer'], days: 6 }] },
  { id: 'hops', wiki: 'Hops', grow: [{ seed: 'hops-starter', seasons: ['summer'], days: 11 }] },
  { id: 'corn', wiki: 'Corn', grow: [{ seed: 'corn-seeds', seasons: ['summer', 'fall'], days: 14 }] },
  { id: 'red-cabbage', wiki: 'Red Cabbage', grow: [{ seed: 'red-cabbage-seeds', seasons: ['summer'], days: 9 }] },
  { id: 'starfruit', wiki: 'Starfruit', grow: [{ seed: 'starfruit-seeds', seasons: ['summer'], days: 13 }] },
  { id: 'eggplant', wiki: 'Eggplant', grow: [{ seed: 'eggplant-seeds', seasons: ['fall'], days: 5 }] },
  { id: 'pumpkin', wiki: 'Pumpkin', grow: [{ seed: 'pumpkin-seeds', seasons: ['fall'], days: 13 }] },
  { id: 'bok-choy', wiki: 'Bok Choy', grow: [{ seed: 'bok-choy-seeds', seasons: ['fall'], days: 4 }] },
  { id: 'yam', wiki: 'Yam', grow: [{ seed: 'yam-seeds', seasons: ['fall'], days: 10 }] },
  { id: 'cranberries', wiki: 'Cranberries', grow: [{ seed: 'cranberry-seeds', seasons: ['fall'], days: 7 }] },
  { id: 'amaranth', wiki: 'Amaranth', grow: [{ seed: 'amaranth-seeds', seasons: ['fall'], days: 7 }] },
  {
    id: 'grape',
    wiki: 'Grape',
    grow: [
      { seed: 'summer-seeds', seasons: ['summer'], days: 7 },
      { seed: 'grape-starter', seasons: ['fall'], days: 10 },
    ],
  },
  { id: 'artichoke', wiki: 'Artichoke', grow: [{ seed: 'artichoke-seeds', seasons: ['fall'], days: 8 }] },
  { id: 'beet', wiki: 'Beet', grow: [{ seed: 'beet-seeds', seasons: ['fall'], days: 6 }] },

  // Other crops named for Monoculture and the Stardrops
  {
    id: 'ancient-fruit',
    wiki: 'Ancient Fruit',
    grow: [{ seed: 'ancient-seeds', seasons: ['spring', 'summer', 'fall'], days: 28 }],
  },
  { id: 'blue-jazz', wiki: 'Blue Jazz', grow: [{ seed: 'jazz-seeds', seasons: ['spring'], days: 7 }] },
  { id: 'fairy-rose', wiki: 'Fairy Rose', grow: [{ seed: 'fairy-seeds', seasons: ['fall'], days: 12 }] },
  { id: 'summer-spangle', wiki: 'Summer Spangle', grow: [{ seed: 'spangle-seeds', seasons: ['summer'], days: 8 }] },
  { id: 'tulip', wiki: 'Tulip', grow: [{ seed: 'tulip-bulb', seasons: ['spring'], days: 6 }] },
  { id: 'sweet-gem-berry', wiki: 'Sweet Gem Berry', grow: [{ seed: 'rare-seed', seasons: ['fall'], days: 24 }] },

  // Seeds
  { id: 'garlic-seeds', wiki: 'Garlic Seeds' },
  { id: 'red-cabbage-seeds', wiki: 'Red Cabbage Seeds' },
  { id: 'artichoke-seeds', wiki: 'Artichoke Seeds' },
  { id: 'rhubarb-seeds', wiki: 'Rhubarb Seeds' },
  { id: 'starfruit-seeds', wiki: 'Starfruit Seeds' },
  { id: 'beet-seeds', wiki: 'Beet Seeds' },
  { id: 'strawberry-seeds', wiki: 'Strawberry Seeds' },

  // Farming equipment and artisan goods
  { id: 'iridium-sprinkler', wiki: 'Iridium Sprinkler' },
  { id: 'sprinkler', wiki: 'Sprinkler' },
  { id: 'scarecrow', wiki: 'Scarecrow' },
  { id: 'speed-gro', wiki: 'Speed-Gro' },
  { id: 'keg', wiki: 'Keg' },
  { id: 'cask', wiki: 'Cask' },
  { id: 'wine', wiki: 'Wine' },
  { id: 'truffle', wiki: 'Truffle' },
  { id: 'truffle-oil', wiki: 'Truffle Oil' },
  { id: 'mayonnaise-machine', wiki: 'Mayonnaise Machine' },
  { id: 'dinosaur-egg', wiki: 'Dinosaur Egg' },
  { id: 'dinosaur-mayonnaise', wiki: 'Dinosaur Mayonnaise' },

  // Museum
  { id: 'geode', wiki: 'Geode' },
  { id: 'omni-geode', wiki: 'Omni Geode' },
  { id: 'artifact-trove', wiki: 'Artifact Trove' },
  { id: 'dwarf-scroll-i', wiki: 'Dwarf Scroll I' },
  { id: 'dwarf-scroll-ii', wiki: 'Dwarf Scroll II' },
  { id: 'dwarf-scroll-iii', wiki: 'Dwarf Scroll III' },
  { id: 'dwarf-scroll-iv', wiki: 'Dwarf Scroll IV' },
  { id: 'secret-note', wiki: 'Secret Notes' },
  { id: 'strange-doll-green', wiki: 'Strange Doll (green)' },
  { id: 'strange-doll-yellow', wiki: 'Strange Doll (yellow)' },

  // Fishing
  { id: 'iridium-rod', wiki: 'Iridium Rod' },
  { id: 'bait', wiki: 'Bait (item)' },
  { id: 'wild-bait', wiki: 'Wild Bait' },
  { id: 'magic-bait', wiki: 'Magic Bait' },
  { id: 'trap-bobber', wiki: 'Trap Bobber' },
  { id: 'crab-pot', wiki: 'Crab Pot' },
  { id: 'trout-soup', wiki: 'Trout Soup' },
  { id: 'seafoam-pudding', wiki: 'Seafoam Pudding' },
  { id: 'crimsonfish', wiki: 'Crimsonfish' },
  { id: 'angler', wiki: 'Angler' },
  { id: 'legend-fish', wiki: 'Legend' },
  { id: 'mutant-carp', wiki: 'Mutant Carp' },
  { id: 'glacierfish', wiki: 'Glacierfish' },

  // Tools, resources and special items
  { id: 'copper-pan', wiki: 'Pans' },
  { id: 'steel-axe', wiki: 'Axes' },
  { id: 'wood', wiki: 'Wood' },
  { id: 'hardwood', wiki: 'Hardwood' },
  { id: 'stone', wiki: 'Stone' },
  { id: 'staircase', wiki: 'Staircase' },
  { id: 'skull-key', wiki: 'Skull Key' },
  { id: 'burglars-ring', wiki: "Burglar's Ring" },
  { id: 'stardrop', wiki: 'Stardrop' },
  { id: 'bouquet', wiki: 'Bouquet' },
  { id: 'mermaids-pendant', wiki: "Mermaid's Pendant" },
  { id: 'wedding-ring', wiki: 'Wedding Ring' },
]

export const ITEM_BY_ID: ReadonlyMap<string, ItemDef> = new Map(ITEMS.map((item) => [item.id, item]))

/** Seeds referenced by `grow`; names are translated in the locale item files. */
export const SEED_IDS = [
  ...new Set(ITEMS.flatMap((item) => item.grow?.map((growth) => growth.seed) ?? [])),
] as readonly string[]

export const ITEM_SPRITE_DIR = 'items'

export function itemSpriteUrl(id: string): string {
  return `${import.meta.env.BASE_URL}${ITEM_SPRITE_DIR}/${id}.png`
}

export const WIKI_HOSTS = {
  en: 'https://stardewvalleywiki.com/',
  'pt-BR': 'https://pt.stardewvalleywiki.com/',
  es: 'https://es.stardewvalleywiki.com/',
} as const

export function wikiUrl(host: string, title: string): string {
  return host + encodeURIComponent(title.replace(/ /g, '_')).replace(/%2F/g, '/')
}
