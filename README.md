[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/ArulAdiSanjaya/leonida-legend-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/ArulAdiSanjaya/leonida-legend-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Legend — GTA VI Trophy Guide

**Leonida Legend** is a complete, offline trophy guide and tracker for all **55 official Grand Theft Auto VI PlayStation 5 trophies**. It is a plain static web app — no build step, no accounts, no network calls — that helps you plan the road to the platinum and tick trophies off as you earn them.

## What it does

- **Checklist** — every trophy with its official name, description and grade (platinum / gold / silver / bronze), a search box, and filters by kind (Story, Missable, Collectibles, Activities, Completion, Online) and grade. Click any trophy to open its detail pane: kind, missable flag, roadmap stage, a full guide, and its Sources.
- **A guide for every trophy** — each of the 55 trophies has an original 40–70 word guide in `app/data/trophies.json`, written from the official description: what it asks, the efficient way to approach it, and — where the description itself is vague — a plain admission of what is not yet pinned down, instead of invented locations or steps.
- **Roadmap** — a seven-stage route to the platinum: (1) Touchdown in Leonida, (2) The Story: Chapters 2–4, (3) Strangers of Leonida, (4) Before the Finale, (5) See All of Leonida, (6) Master the Grind, (7) 100% and the Platinum — with per-stage progress bars driven by your checklist.
- **Missables** — exactly four trophies meet this guide's strict standard (the official description itself implies a one-chance moment): *Catch Me If You Can*, *Capital Offense*, *Actions Speak Louder* and *Bad Luck, I Guess*. The Missables tab explains why each one can be missed. Story guides still advise first-pass play, because mission replay for trophies is not confirmed.
- **Spoiler protection** — on by default: story trophies you have not earned yet are masked ("Hidden story trophy — earn it to reveal"), with no name, description or guide shown until you earn them.
- **Progress that stays yours** — tick trophies off and progress is saved in your browser's `localStorage`. Export it to a JSON file and import it back on another device or browser.
- **Honest about online** — the launch list of 55 contains **no online trophies**. The Online filter says so openly and returns an explained empty result rather than pretending otherwise.

## Data sources

Trophy names, descriptions and grades are the official PS5 trophy list, as published — see the Sources in each trophy's detail pane (the official list via Exophase, and the PSNProfiles trophy page for grades and PSN targets). All guide advice is original to Leonida Legend, reasoned from the official descriptions. No Rockstar artwork, logos or game screenshots are used anywhere in the app.

## Run it

Serve the app locally (Node 22, standard library only):

```sh
node serve.ts
```

Then open http://localhost:8080 in your browser. The app also works straight from the `app/` folder with any static file server — it loads nothing over the network.

To produce the make.fun hand-in (copies `app/` and `screenshots/` to the output directory and writes `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Screenshots

`screenshots/` holds four real renders of the app (1280×800): the checklist cover with spoiler protection on and 14 trophies earned, the roadmap, the missables view, and the checklist filtered to Collectibles — described in `shots.json`.

## License

MIT — see `LICENSE`.

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
