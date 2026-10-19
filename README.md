# Stardew Valley Trophy Tracker

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

- **Checklist** for all 41 base-game trophies in the guide (1 platinum + 40), in the guide's roadmap order.
- **Progress**: overall percentage, done and remaining counts with a progress bar, plus a progress bar per category. Clicking a category filters the list.
- **Detail view** per trophy: official description, how it unlocks, requirements, guide notes, dependencies and steps.
- **Expandable steps** for complex trophies, such as the 28 Polyculture crops, 7 Stardrops, 12 Monster Slayer goals, Community Center rooms, Joja projects, Full House milestones, the 5 skills and the legendary fish. Each step is saved on its own.
- **Dependency indicators** ("Depends on: …" with done/pending state; click one to open it), conflict warnings (Local Legend and Joja on the same save) and a counter for the platinum.
- **Missable alerts**: a banner at the top, a badge and warning on each missable trophy, and a "Missable" filter. "Buggy", "Time-consuming" and "Collectible" badges follow the guide's tags.
- **Filters**: all / done / pending / missable, by category, and search by name or description in the current language (case- and accent-insensitive).
- **Auto-save** to `localStorage`, with a warning if storage is blocked, a save fails or the saved data is unreadable.
- **Reset** with a confirmation dialog. Your language choice is kept.
- **Languages**: PT-BR, EN and ES for all UI text and all trophy data. The language is detected from the browser on first visit, persisted afterwards, and switching it never touches progress.
- **Responsive** layout for desktop (sidebar + list) and mobile (stacked), keyboard accessible, with empty and error states.

## Project structure

```
src/
  data/
    types.ts              Trophy model (ids, grade, category, stage, flags, dependencies, subtasks)
    trophies.ts           The 41 trophies — language-neutral data only, stable ids
  i18n/
    types.ts              Shapes of the UI strings and trophy texts
    index.ts              Dictionaries, language list, browser-language matching, {placeholder} formatting
    locales/
      en/ ui.ts trophies.ts
      pt-BR/ ui.ts trophies.ts
      es/ ui.ts trophies.ts
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
```

Trophy data and translations are deliberately separate: `src/data/trophies.ts` only holds ids and structure, and every human-readable string lives in `src/i18n/locales/<language>/`. Trophy and subtask ids are stable, because they are the keys used for saved progress and translations. To add a language, copy one locale folder, translate it and register it in `src/i18n/index.ts`. The translation-completeness test will flag anything missing.

## Tests

`npm test` runs 44 tests covering:

- progress calculation (overall, per category, subtasks, dependencies, platinum) and data integrity
- persistence and restore, including corrupt data, unknown ids and blocked storage
- filters and search in each language
- language switching preserving progress (rendered app)
- translation completeness: every UI key, category, trophy, requirement, note and subtask exists and is non-empty in all three languages, with matching placeholders
- UI flows: check/uncheck, steps, detail view, empty state, reset confirmation, corrupt-data warning

## Stack

Vite, React, TypeScript, Tailwind CSS v4 and shadcn/ui (Radix primitives), with lucide icons, the Geist font for body text and Pixelify Sans for headings. Tests use Vitest, Testing Library and jsdom.

## Limitations

- **Base game only.** The guide covers the 41 base-game trophies (it was last updated for v1.5). The 9 trophies added in update 1.6 have a separate PSNProfiles DLC guide and are not included.
- **Manual tracking.** The app cannot read your save file or PSN account, so you tick everything yourself.
- **Progress lives in one browser.** Clearing site data, private windows or switching browsers/devices starts fresh. There is no export/import or sync.
- **Localized names.** The PT-BR and ES names and descriptions of the 40 regular trophies use the game's official localization (as published on its Steam achievement list, which uses the same in-game text). The platinum (Iridium Seal) has no published localized name there, so its PT-BR/ES names are translations. In-game item, place and monster names inside the notes and steps are translated to match the game where known, but were not checked one by one against the localized game.
- **Guide-dependent.** Notes and tips reflect the guide (v1.5 era); later game patches may change details.

Not affiliated with ConcernedApe, Sony or PSNProfiles.
