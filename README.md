# Stardew Valley Tracker

A small web app for tracking the Stardew Valley platinum, in **Português (Brasil)**, **English** and **Español**. The trophy content follows the [PSNProfiles Stardew Valley Trophy Guide](https://psnprofiles.com/guide/7708-stardew-valley-trophy-guide) by Jelloycat & SquidGeneral10: the requirements, recommended order, missable warnings, time-consuming tasks and dependencies all come from that guide.

Everything runs in the browser. Progress is saved to `localStorage`, so there is no server and no account.

## Requirements

- [Node.js](https://nodejs.org/) 20.19+ or 22.12+ (includes npm)
- Git

Works on Windows, macOS and Linux. Every npm script is cross-platform; none of them need bash.

## Install and run

Windows (PowerShell or Command Prompt):

```powershell
git clone <repository-url> F:\DevProjects\sv-tracker
cd F:\DevProjects\sv-tracker
npm install
npm run dev
```

macOS / Linux:

```bash
git clone <repository-url> ~/sv-tracker
cd ~/sv-tracker
npm install
npm run dev
```

Then open **http://127.0.0.1:47321**. The dev server uses port `47321` on purpose to avoid clashing with other local apps; change `server.port` in `vite.config.ts` if you need another one.

## Scripts

| Command              | What it does                                         |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Start the dev server with hot reload (port 47321)    |
| `npm test`           | Run the Vitest suite once                            |
| `npm run test:watch` | Run Vitest in watch mode                             |
| `npm run typecheck`  | Type-check the project with TypeScript               |
| `npm run lint`       | Lint with oxlint                                     |
| `npm run build`      | Type-check and build a static site into `dist/`      |
| `npm run preview`    | Serve the production build locally (port 47322)      |

`dist/` is a static site; you can host it anywhere (GitHub Pages, Netlify, a USB stick).

## Features

- **Checklist** for all 41 base-game trophies in the guide (1 platinum + 40), in the guide's roadmap order, each with its official trophy icon (in the list and the detail view).
- **Progress**: overall percentage, done and remaining counts with a progress bar, plus a progress bar per category. Clicking a category filters the list.
- **Detail view** per trophy: official description, how it unlocks, requirements, guide notes, dependencies and steps.
- **Expandable steps** for complex trophies, such as the 28 Polyculture crops, 7 Stardrops, 12 Monster Slayer goals, Community Center rooms, Joja projects, Full House milestones, the 5 skills and the legendary fish. Each step is saved on its own.
- **Dependency indicators** ("Depends on: …" with done/pending state; click one to open it), conflict warnings (Local Legend and Joja on the same save) and a counter for the platinum.
- **Item mentions**: every in-game item named in a trophy (description, requirements, steps or notes) shows as a small chip with its official sprite. Tap a chip to see how to get it (summarized from the Stardew Valley Wiki) and a link to the wiki page in your language. The detail view lists all of a trophy's items with their obtain lines; collection trophies (Polyculture crops, Dwarf Scrolls, legendary fish…) show the sprite on each step.
- **Missable alerts**: a banner at the top with a close button (the choice is remembered separately from progress and language; a small warning button in the header brings it back), a badge and warning on each missable trophy, and a "Missable" filter. "Buggy", "Time-consuming" and "Collectible" badges follow the guide's tags.
- **Filters**: all / done / pending / missable, by category, and search by name or description in the current language (case- and accent-insensitive).
- **Auto-save** to `localStorage`, with a warning if storage is blocked, a save fails or the saved data is unreadable.
- **Reset** with a confirmation dialog. Your language choice is kept.
- **Languages**: PT-BR, EN and ES for all UI text and all trophy data. The app starts in Portuguese (Brasil) on a fresh visit; a language you pick is remembered and wins afterwards, and switching it never touches progress. The title, “Stardew Valley Tracker”, is the same in every language.
- **Responsive** layout for desktop (sidebar + list) and mobile (stacked), keyboard accessible, with empty and error states.

## Project structure

```
src/
  data/
    types.ts              Trophy model (ids, grade, category, stage, flags, dependencies, subtasks)
    trophies.ts           The 41 trophies — language-neutral data only, stable ids
    trophyIcons.ts        Trophy id → icon file in public/trophies/
    items.ts              In-game items: stable id, source wiki page, growing facts for crops
    trophyItems.ts        Trophy id (and step id) → items its text names
  i18n/
    types.ts              Shapes of the UI strings and trophy texts
    index.ts              Dictionaries, language list, browser-language matching, {placeholder} formatting
    locales/
      en/ ui.ts trophies.ts items.ts
      pt-BR/ ui.ts trophies.ts items.ts
      es/ ui.ts trophies.ts items.ts
  lib/
    storage.ts            localStorage load/save with validation and versioning
    progress.ts           Overall, per-category, subtask and dependency calculations
    filters.ts            Status/category filters and accent-insensitive search
  hooks/
    useProgress.ts        Progress state + auto-save
    useLanguage.tsx       i18n context, persisted language, t() helper
  components/             App UI (TrackerPage, TrophyCard, TrophyDetailDialog, FilterBar, …)
    ui/                   shadcn/ui primitives (Radix based)
  test/                   Vitest suites
public/
  trophies/               41 official trophy icons (240×240 PNG), one per trophy id
  items/                  88 item sprites from the Stardew Valley Wiki, one per item id
  chicken.png             White Chicken sprite (header and favicon)
```

Trophy data and translations are deliberately separate: `src/data/trophies.ts` only holds ids and structure, and every human-readable string lives in `src/i18n/locales/<language>/`. Trophy and subtask ids are stable, because they are the keys used for saved progress and translations. To add a language, copy one locale folder, translate it and register it in `src/i18n/index.ts`. The translation-completeness test will flag anything missing.

## Tests

`npm test` runs 196 tests covering:

- progress calculation (overall, per category, subtasks, dependencies, platinum) and data integrity
- persistence and restore, including corrupt data, unknown ids and blocked storage
- filters and search in each language
- language switching preserving progress (rendered app)
- translation completeness: every UI key, category, trophy, requirement, note and subtask exists and is non-empty in all three languages, with matching placeholders
- UI flows: check/uncheck, steps, detail view, empty state, reset confirmation, corrupt-data warning
- missable alert close/reopen: persisted under its own key, survives reloads, language switches and reset, never changes progress or language
- item mentions: every mentioned item exists, has a bundled PNG sprite, a name and wiki page in all three languages, and an obtain line (or growing facts); chips, step sprites and the detail-view list render it
- header and defaults: untranslated "Stardew Valley Tracker" title right after the chicken sprite, no subtitle, chicken favicon, and Portuguese on a fresh visit
- trophy icons: every trophy maps to a bundled, distinct 240×240 PNG that exists in `public/trophies/`, and every list row and the detail view render it

## Stack

Vite, React, TypeScript, Tailwind CSS v4 and shadcn/ui (Radix primitives), with lucide icons, the Geist font for body text and Pixelify Sans for headings. Tests use Vitest, Testing Library and jsdom.

## Limitations

- **Base game only.** The guide covers the 41 base-game trophies (it was last updated for v1.5). The 9 trophies added in update 1.6 have a separate PSNProfiles DLC guide and are not included.
- **Manual tracking.** The app cannot read your save file or PSN account, so you tick everything yourself.
- **Progress lives in one browser.** Clearing site data, private windows or switching browsers/devices starts fresh. There is no export/import or sync.
- **Localized names.** The PT-BR and ES names and descriptions of the 40 regular trophies use the game's official localization (as published on its Steam achievement list, which uses the same in-game text). The platinum (Iridium Seal) has no published localized name there, so its PT-BR/ES names are translations. In-game item, place and monster names inside the notes and steps are translated to match the game where known, but were not checked one by one against the localized game.
- **Item info is a summary.** Obtain lines are short summaries of the English wiki pages (current game version), translated without changing the facts; the wiki may list more sources. PT-BR/ES item names are the titles of the matching pages on the Portuguese and Spanish wikis. Journey of the Prairie King power-ups, monsters, places and villagers are not inventory items and stay as plain text.
- **Guide-dependent.** Notes and tips reflect the guide (v1.5 era); later game patches may change details.

## Image credits

The trophy icons in `public/trophies/` are the official PlayStation trophy images for Stardew Valley (PS4, trophy list 5673), © ConcernedApe. They were downloaded from the trophy list as published on [PSNProfiles](https://psnprofiles.com/trophies/5673-stardew-valley) (`img.psnprofiles.com/trophy/l/5673/…`), the same list the guide links to, and are bundled locally so the app does not hotlink. They are used here only to identify each trophy.

The item sprites in `public/items/` and the White Chicken in `public/chicken.png` come from the official [Stardew Valley Wiki](https://stardewvalleywiki.com/) (game art © ConcernedApe), downloaded through its MediaWiki API and bundled locally. Item obtain summaries are based on the wiki's item pages; wiki text is licensed [CC BY-NC-SA](https://creativecommons.org/licenses/by-nc-sa/3.0/). Localized item names come from [pt.stardewvalleywiki.com](https://pt.stardewvalleywiki.com/) and [es.stardewvalleywiki.com](https://es.stardewvalleywiki.com/).

Not affiliated with ConcernedApe, Sony or PSNProfiles.
