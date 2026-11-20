[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ArulAdiSanjaya/leonida-legend-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ArulAdiSanjaya/leonida-legend-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Legend — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all **55 official Grand Theft Auto VI
PlayStation 5 trophies** (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden
on PSN), built for the make.fun competition `gta6-trophy-guide-01`.

## What it does

- **Checklist with the official data.** Every trophy is shown with its
  official name, description and grade, exactly as PlayStation publishes
  them.
- **A guide to every trophy, in our own words.** What to do, where and how,
  and when it can be missed — plus numbered steps. Each trophy's detail pane
  ends with a **Sources** note naming where its facts come from (official
  list: Exophase; PSN counts: PSNProfiles; guide text: our own, written from
  the official description). Where an official description is a riddle, the
  guide says so and labels its reading as ours instead of inventing steps.
- **Roadmap to the platinum.** Seven ordered stages built from the official
  descriptions: story first, missables before the point of no return, then
  strangers, activities, collectibles and the money game, ending at 100%
  completion and the platinum.
- **Missables flagged.** Five trophies are flagged MISSABLE both in the list
  and in a dedicated banner: *Catch Me If You Can* (VCIA departure),
  *In The Beginning…* (Ocean Beach cocktail), *Capital Offense* (showroom
  smash), *Actions Speak Louder* (500-choice counter) and
  *Bad Luck, I Guess* (fail first, succeed second).
- **Tracker.** Tick trophies off; progress is saved in `localStorage`,
  shown as a progress bar with a grade breakdown, and can be **exported**
  to a JSON file and **imported** back.
- **Filters.** By kind — story, missable, collectibles, activities, online —
  by grade, by free-text search, and earned-only. The official list contains
  no online trophies (the partner trophies are story-mode co-op), and the
  online filter says so honestly instead of inventing entries.
- **Spoiler-safe mode.** When on, unearned story trophies show a masked
  name and description — in the list, the detail pane and the roadmap —
  until they are marked earned.

## Running it

The app is static files under `app/` with no build step:

```sh
node serve.ts            # serves app/ at http://localhost:8080
```

Open `app/index.html` through any static server. Everything it loads is a
file under `app/`; it makes no network requests and works with the network
off. Deep links such as `?kind=missable&spoiler=1&open=The%20Shootist`
restore a particular view.

## Handing it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) first checks that
`app/data/trophies.json` holds all 55 trophies, each with a non-blank guide,
then copies `app/` and `screenshots/` to the output directory and writes
`dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`.

## Layout

- `app/index.html` — the page: header with progress, filter bar, checklist,
  detail pane, missable banner, roadmap, sources footer.
- `app/style.css` — the original Leonida-sunset look (CSS gradients only;
  no Rockstar logo, artwork or game screenshots anywhere).
- `app/js/main.js` — bootstrap, deep links and control wiring.
- `app/js/render.js` — checklist rows, detail pane (guide, steps, sources),
  roadmap stages and the missable banner; spoiler masking lives here.
- `app/js/store.js` — localStorage progress, export and import.
- `app/js/filters.js` — kind/grade/search/earned filtering and counts.
- `app/data/trophies.json` — the 55 trophies: official name, description and
  grade, PSN hidden flag, kind, missable flag, our guide, steps and sources.
- `screenshots/` — four real renders of this app in Chromium (see
  `shots.json` for what each one shows).
