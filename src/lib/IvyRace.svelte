<script>
  import { ivyPointsByMatchday, ivyResults } from './data.js'
  const series = ivyPointsByMatchday()

  const HIGHLIGHT = 'Princeton'
  const nDays = series[0]?.points.length ?? 0
  // every line starts from 0 points before matchday 1
  const lines = series.map((s) => ({ ...s, path: [0, ...s.points] }))
  const leader = series[0]
  const princeton = series.find((s) => s.team === HIGHLIGHT)

  // date of each matchday (earliest game; Brown–Columbia MD1 was postponed)
  const fmtDate = (d) =>
    new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const mdDate = Array.from({ length: nDays }, (_, i) => {
    const dates = ivyResults.filter((r) => r.matchday === i + 1).map((r) => r.date).sort()
    return dates[0] ? fmtDate(dates[0]) : ''
  })

  let width = $state(600)
  const height = 260
  const m = { top: 12, right: 96, bottom: 36, left: 24 }
  const innerH = height - m.top - m.bottom
  let innerW = $derived(Math.max(width - m.left - m.right, 100))

  const maxPts = Math.max(0, ...series.map((s) => s.points[nDays - 1] ?? 0))
  const yMax = Math.max(5, Math.ceil(maxPts / 5) * 5)
  const ticks = Array.from({ length: yMax / 5 + 1 }, (_, i) => i * 5)
  const y = (v) => m.top + innerH - (v / yMax) * innerH
  let x = $derived((day) => m.left + (day / nDays) * innerW)
  let d = $derived((pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p)}`).join(''))

  // crosshair: snaps to the nearest matchday (1..nDays)
  let hover = $state(0)
  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const day = Math.round(((e.clientX - rect.left) / rect.width) * nDays)
    hover = Math.min(nDays, Math.max(1, day))
  }
  function onKey(e) {
    if (e.key === 'ArrowRight') hover = Math.min(nDays, (hover || 0) + 1)
    else if (e.key === 'ArrowLeft') hover = Math.max(1, (hover || nDays + 1) - 1)
    else return
    e.preventDefault()
  }
  let standings = $derived(
    hover
      ? series
          .map((s) => ({ team: s.team, pts: s.points[hover - 1] }))
          .sort((a, b) => b.pts - a.pts || a.team.localeCompare(b.team))
      : []
  )
  let tipLeft = $derived(hover ? x(hover) : 0)
</script>

<section>
  <h2>The Ivy League race</h2>
  {#if series.length > 0}
    <div class="chart" bind:clientWidth={width}>
      <p class="sub">Cumulative Ivy League points after each matchday (win 3, draw 1, loss 0).</p>
      <ul class="legend">
        <li><span class="linekey" style="background: var(--accent)"></span>Princeton</li>
        <li><span class="linekey" style="background: var(--other)"></span>Other Ivy teams</li>
      </ul>

      <div class="plot">
      <svg {width} {height} role="group" aria-label="Line chart of cumulative Ivy League points by matchday">
        <g class="grid">
          {#each ticks as t}
            {#if t > 0}<line x1={m.left} x2={m.left + innerW} y1={y(t)} y2={y(t)} />{/if}
          {/each}
        </g>
        <g class="axis">
          {#each ticks as t}
            <text x={m.left - 6} y={y(t)} dy="0.32em" text-anchor="end">{t}</text>
          {/each}
          {#each mdDate as _, i}
            <text x={x(i + 1)} y={height - m.bottom + 16} text-anchor="middle">{i + 1}</text>
          {/each}
          <text x={m.left + innerW / 2} y={height - 4} text-anchor="middle">Matchday</text>
        </g>
        <line class="baseline" x1={m.left} x2={m.left + innerW} y1={y(0)} y2={y(0)} />

        {#if hover}
          <line class="crosshair" x1={x(hover)} x2={x(hover)} y1={m.top} y2={y(0)} />
        {/if}

        <!-- other teams first, Princeton drawn on top -->
        {#each lines.filter((l) => l.team !== HIGHLIGHT) as l (l.team)}
          <path class="line" d={d(l.path)} stroke="var(--other)" />
        {/each}
        {#if princeton}
          <path class="line" d={d([0, ...princeton.points])} stroke="var(--accent)" />
        {/if}

        {#if hover}
          {#each lines as l (l.team)}
            <circle
              class="dot"
              cx={x(hover)} cy={y(l.path[hover])} r="4"
              fill={l.team === HIGHLIGHT ? 'var(--accent)' : '#9a9a9a'}
            />
          {/each}
        {/if}

        <!-- direct labels: the leader and Princeton only; the tooltip and table carry the rest -->
        {#each [leader, princeton].filter(Boolean) as s (s.team)}
          {@const last = s.points[nDays - 1]}
          <circle class="dot" cx={x(nDays)} cy={y(last)} r="4" fill={s.team === HIGHLIGHT ? 'var(--accent)' : '#9a9a9a'} />
          <text class="end" class:hl={s.team === HIGHLIGHT} x={x(nDays) + 10} y={y(last)} dy="0.32em">{s.team} · {last}</text>
        {/each}

        <rect
          class="hit"
          x={m.left} y={m.top} width={innerW + 8} height={innerH}
          tabindex="0"
          role="img"
          aria-label="Standings by matchday. Use the left and right arrow keys to step through matchdays."
          onpointermove={onMove}
          onpointerleave={() => (hover = 0)}
          onkeydown={onKey}
          onblur={() => (hover = 0)}
        />
      </svg>

      {#if hover}
        <div
          class="tooltip"
          style="left: {tipLeft}px; top: {m.top}px; transform: translateX({tipLeft > width / 2 ? 'calc(-100% - 12px)' : '12px'})"
        >
          <p class="tt-title">After matchday {hover} · {mdDate[hover - 1]}</p>
          {#each standings as s (s.team)}
            <div class="tt-row" class:hl={s.team === HIGHLIGHT}>
              <span class="linekey" style="background: {s.team === HIGHLIGHT ? 'var(--accent)' : 'var(--other)'}"></span>
              <strong>{s.pts}</strong>{s.team}
            </div>
          {/each}
        </div>
      {/if}
      </div>

      <details class="table-view">
        <summary>View as table</summary>
        <table>
          <thead>
            <tr><th>Team</th>{#each mdDate as _, i}<th>MD{i + 1}</th>{/each}</tr>
          </thead>
          <tbody>
            {#each series as s (s.team)}
              <tr class:hl={s.team === HIGHLIGHT}>
                <td>{s.team}</td>{#each s.points as p}<td>{p}</td>{/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </details>
    </div>
  {:else}
    <p class="todo">No Ivy League results yet.</p>
  {/if}
</section>

<style>
  .todo { color: var(--muted); font-style: italic; }
  .line { fill: none; stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
  .dot { stroke: var(--bg); stroke-width: 2; }
  .crosshair { stroke: #999; stroke-width: 1; }
  .end { fill: var(--muted); font-size: 12px; }
  .end.hl { fill: var(--ink); font-weight: 600; }
  .hit { fill: transparent; outline: none; }
  .hit:focus-visible { stroke: var(--accent); stroke-width: 2; }
  .hl { font-weight: 600; }
</style>
