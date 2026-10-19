/**
 * Trophy id → official PlayStation trophy icon (240×240 PNG) bundled under `public/trophies/`.
 * Source: the PSN trophy list as published on PSNProfiles (game 5673). See README › Image credits.
 */
export const TROPHY_ICON_FILES: Readonly<Record<string, string>> = {
  'iridium-seal': 'iridium-seal.png',
  greenhorn: 'greenhorn.png',
  cowpoke: 'cowpoke.png',
  homesteader: 'homesteader.png',
  millionaire: 'millionaire.png',
  legend: 'legend.png',
  'a-complete-collection': 'a-complete-collection.png',
  'a-new-friend': 'a-new-friend.png',
  'best-friends': 'best-friends.png',
  'the-beloved-farmer': 'the-beloved-farmer.png',
  cliques: 'cliques.png',
  networking: 'networking.png',
  popular: 'popular.png',
  cook: 'cook.png',
  'sous-chef': 'sous-chef.png',
  'gourmet-chef': 'gourmet-chef.png',
  'moving-up': 'moving-up.png',
  'living-large': 'living-large.png',
  diy: 'diy.png',
  artisan: 'artisan.png',
  'craft-master': 'craft-master.png',
  fisherman: 'fisherman.png',
  'ol-mariner': 'ol-mariner.png',
  'master-angler': 'master-angler.png',
  'mother-catch': 'mother-catch.png',
  'treasure-trove': 'treasure-trove.png',
  gofer: 'gofer.png',
  'a-big-help': 'a-big-help.png',
  polyculture: 'polyculture.png',
  monoculture: 'monoculture.png',
  'full-shipment': 'full-shipment.png',
  'prairie-king': 'prairie-king.png',
  'the-bottom': 'the-bottom.png',
  'local-legend': 'local-legend.png',
  'joja-member': 'joja-member.png',
  'mystery-of-the-stardrops': 'mystery-of-the-stardrops.png',
  'fectors-challenge': 'fectors-challenge.png',
  'full-house': 'full-house.png',
  'singular-talent': 'singular-talent.png',
  'master-of-the-five-ways': 'master-of-the-five-ways.png',
  'protector-of-the-valley': 'protector-of-the-valley.png',
}

export const TROPHY_ICON_DIR = 'trophies'

export function trophyIconUrl(id: string): string | undefined {
  const file = TROPHY_ICON_FILES[id]
  return file ? `${import.meta.env.BASE_URL}${TROPHY_ICON_DIR}/${file}` : undefined
}
