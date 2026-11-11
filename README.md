# Princeton Men's Soccer — 2026 Season in Review

An interactive look at Princeton men's soccer's 2026 season: every match, when the goals came, and the Ivy League race.

## Run it locally

```bash
npm install
npm run dev      # open the URL it prints
npm run build    # production build into dist/
```

## Data

All data is entered by hand from official box scores into `src/data/`:

| File | One row per | Fields |
| --- | --- | --- |
| `matches.json` | Princeton match | `id` (e.g. `2026-09-05-lafayette`), `date` (YYYY-MM-DD), `opponent`, `home` (true/false), `princeton_goals`, `opponent_goals`, `ivy` (true/false), `recap_url` (Princeton athletics recap links) |
| `goals.json` | goal | `match_id` (matches an `id` above), `minute`, `scorer`, `team` (`princeton` or `opponent`) |
| `ivy_results.json` | Ivy League match (all teams) | `matchday`, `date`, `home`, `away`, `home_goals`, `away_goals` |

Sources: 

https://goprincetontigers.com/sports/mens-soccer/schedule

https://ivyleague.com/calendar.aspx?path=msoc

## Structure

- `src/App.svelte` — page layout and intro
- `src/lib/data.js` — loads the JSON and computes results, goal windows, Ivy points
- `src/lib/Timeline.svelte` — match-by-match timeline (tap a match for details)
- `src/lib/GoalTiming.svelte` — goals scored/conceded by 15-minute window (TODO)
- `src/lib/IvyRace.svelte` — cumulative Ivy points by matchday (TODO)
