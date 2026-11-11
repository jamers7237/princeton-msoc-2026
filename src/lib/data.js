import matches from '../data/matches.json'
import goals from '../data/goals.json'
import ivyResults from '../data/ivy_results.json'

export { matches, goals, ivyResults }

/** 'W' | 'D' | 'L' from Princeton's point of view */
export function result(match) {
  if (match.princeton_goals > match.opponent_goals) return 'W'
  if (match.princeton_goals < match.opponent_goals) return 'L'
  return 'D'
}

/** Matches sorted by date, each with its result and goals attached */
export function matchesWithGoals() {
  return [...matches]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({
      ...m,
      result: result(m),
      goals: goals
        .filter((g) => g.match_id === m.id)
        .sort((a, b) => a.minute - b.minute),
    }))
}

/**
 * Goals grouped into 15-minute windows (1–15, 16–30, ..., 76–90, 90+ for
 * stoppage/OT), split into Princeton goals (scored) and opponent goals (conceded).
 * Returns [{ label: '1–15', start: 1, end: 15, scored, conceded }, ...]
 */
export function goalsByWindow() {
  const windows = []
  for (let start = 1; start <= 76; start += 15) {
    windows.push({ label: `${start}–${start + 14}`, start, end: start + 14, scored: 0, conceded: 0 })
  }
  windows.push({ label: '90+', start: 91, end: Infinity, scored: 0, conceded: 0 })

  for (const g of goals) {
    // minute 0 (if it ever appears) counts in the first window; > 90 goes to 90+
    const index = Math.min(Math.floor((Math.max(g.minute, 1) - 1) / 15), windows.length - 1)
    if (g.team === 'princeton') windows[index].scored++
    else windows[index].conceded++
  }
  return windows
}

/**
 * Each team's cumulative Ivy points after each matchday (win = 3, draw = 1, loss = 0).
 * points[i] is the total after matchday i + 1. Sorted by final points, highest first.
 * Returns [{ team: 'Princeton', points: [0, 3, 4, ...] }, ...]
 */
export function ivyPointsByMatchday() {
  const matchdays = [...new Set(ivyResults.map((r) => r.matchday))].sort((a, b) => a - b)

  // points earned by each team on each matchday
  /** @type {Map<string, Map<number, number>>} team -> (matchday -> points) */
  const earned = new Map()
  /** @param {string} team @param {number} matchday @param {number} pts */
  const add = (team, matchday, pts) => {
    let byDay = earned.get(team)
    if (!byDay) earned.set(team, (byDay = new Map()))
    byDay.set(matchday, (byDay.get(matchday) ?? 0) + pts)
  }
  for (const r of ivyResults) {
    const homePts = r.home_goals > r.away_goals ? 3 : r.home_goals === r.away_goals ? 1 : 0
    const awayPts = r.away_goals > r.home_goals ? 3 : r.home_goals === r.away_goals ? 1 : 0
    add(r.home, r.matchday, homePts)
    add(r.away, r.matchday, awayPts)
  }

  /** @param {{ points: number[] }} s */
  const final = (s) => s.points[s.points.length - 1] ?? 0

  // running totals; a team with no game on a matchday carries its total forward
  return [...earned]
    .map(([team, byDay]) => {
      let total = 0
      const points = matchdays.map((md) => (total += byDay.get(md) ?? 0))
      return { team, points }
    })
    .sort((a, b) => final(b) - final(a) || a.team.localeCompare(b.team))
}
