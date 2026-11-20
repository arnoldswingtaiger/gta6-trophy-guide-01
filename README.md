# Leonida Legend — gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/arnoldswingtaiger/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/arnoldswingtaiger/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An unofficial fan-made trophy guide for Grand Theft Auto VI on PlayStation 5: all 55 official trophies (1 Platinum, 2 Gold, 6 Silver, 46 Bronze), an original guide for every one, a four-stage roadmap to the Platinum, and a tracker that saves your progress in the browser. Vanilla HTML/CSS/JS, no build step, no network at runtime — every file the app loads sits under `app/`. The look is entirely original (a Vice City neon-sunset design drawn in CSS); no Rockstar logo, official artwork, or game screenshots are used.

## What is in the guide

- **A tracker for all 55 trophies** — official name, description, and grade for each; tick trophies off as you earn them and your progress is saved in localStorage. A progress ring shows overall completion, with counts by grade and a "trophies toward the Platinum" line.
- **Export and import** — download your progress as JSON, or import a progress file back (it also accepts a plain list of trophy ids or names).
- **Filters** — by kind (Story, Missable, Collectibles, Activities, Combat, Exploration, Misc), by grade, by earned/unearned, and a text search. A "Missable" view shows the one missable trophy on the list, with its warning up front.
- **Spoiler setting** — turn on "Hide story spoilers" and the names, descriptions, and guides of the 18 story trophies show as neutral placeholders until you earn them.
- **A guide per trophy** — expanding a trophy shows the full original guide, step-by-step instructions, a missable warning where it applies, and cited sources with links. The five trophies with no confirmed unlock method yet say so honestly instead of guessing.
- **A four-stage roadmap to the Platinum** — Story Playthrough, Side Content and Strangers, Collectibles and Exploration Cleanup, then Grind and Final Mop-Up — each with its trophies, per-stage progress, and a jump back to the full guide for any trophy.
- **Linkable views** — the URL hash carries the current view and filters (for example `#view=roadmap` or `#grade=silver&expand=28`), so any state of the guide can be shared.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

That copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json` (via the vendored `vendor/makefun-frontend.ts`, which is left untouched).

## Data

`app/data/trophies.json` holds the official 55-trophy list as verified 2026-11-20, with the original guides, roadmap stages, and source citations. Trophy names, descriptions, and grades are Rockstar's; the guides and design are original work.
