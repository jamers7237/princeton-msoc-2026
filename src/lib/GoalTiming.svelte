<script>
  import { goalsByWindow, matches } from './data.js'
  const windows = goalsByWindow()

  const totalScored = windows.reduce((n, w) => n + w.scored, 0)
  const totalConceded = windows.reduce((n, w) => n + w.conceded, 0)

  // layout (px); width follows the container so text stays full-size on phones
  let width = $state(600)
  const height = 220
  const m = { top: 20, right: 4, bottom: 40, left: 24 }
  const innerH = height - m.top - m.bottom
  let innerW = $derived(Math.max(width - m.left - m.right, 100))
  let band = $derived(innerW / windows.length)
  let barW = $derived(Math.min(24, (band * 0.7 - 2) / 2))

  const maxVal = Math.max(...windows.flatMap((w) => [w.scored, w.conceded]))
  const yMax = Math.max(2, Math.ceil(maxVal / 2) * 2)
  const ticks = Array.from({ length: yMax / 2 + 1 }, (_, i) => i * 2)
  const y = (v) => m.top + innerH - (v / yMax) * innerH

  /** column with a 4px rounded data-end, square at the baseline */
  function column(x, v) {
    if (v <= 0) return ''
    const top = y(v), base = y(0), r = Math.min(4, barW / 2, base - top)
    return `M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + barW - r}Q${x + barW},${top} ${x + barW},${top + r}V${base}Z`
  }
  // the pair is centred in its band with a 2px gap between the two columns
  let bandX = $derived((i) => m.left + i * band)
  let scoredX = $derived((i) => bandX(i) + band / 2 - barW - 1)
  let concededX = $derived((i) => bandX(i) + band / 2 + 1)

  let hover = $state(-1)
  // tooltip sits beside the hovered band (never over its own columns or labels)
  let tipOnLeft = $derived(hover >= 0 && bandX(hover) + band / 2 > width / 2)
  let tipLeft = $derived(hover < 0 ? 0 : tipOnLeft ? bandX(hover) - 4 : bandX(hover) + band + 4)
</script>

<section>
  <h2>When the goals came</h2>
  <div class="chart" bind:clientWidth={width}>
    <p class="sub">
      Goals in each 15-minute window across all {matches.length} matches —
      {totalScored} scored, {totalConceded} conceded.
    </p>
    <ul class="legend">
      <li><span class="swatch" style="background: var(--accent)"></span>Princeton goals</li>
      <li><span class="swatch" style="background: var(--conceded)"></span>Opponent goals</li>
    </ul>

    <div class="plot">
    <svg {width} {height} role="group" aria-label="Column chart of goals scored and conceded by 15-minute window">
      <g class="grid">
        {#each ticks as t}
          {#if t > 0}<line x1={m.left} x2={m.left + innerW} y1={y(t)} y2={y(t)} />{/if}
        {/each}
      </g>
      <g class="axis">
        {#each ticks as t}
          <text x={m.left - 6} y={y(t)} dy="0.32em" text-anchor="end">{t}</text>
        {/each}
        {#each windows as w, i}
          <text x={bandX(i) + band / 2} y={height - m.bottom + 16} text-anchor="middle">{w.label}</text>
        {/each}
        <text x={m.left + innerW / 2} y={height - 4} text-anchor="middle">Minute</text>
      </g>

      {#each windows as w, i}
        {#if hover === i}
          <rect class="wash" x={bandX(i) + 1} y={m.top} width={band - 2} height={innerH} rx="4" />
        {/if}
        <path d={column(scoredX(i), w.scored)} fill="var(--accent)" />
        <path d={column(concededX(i), w.conceded)} fill="var(--conceded)" />
        <!-- value on each cap: values are small counts, and the orange needs a
             text label beside it for contrast -->
        <text class="cap" x={scoredX(i) + barW / 2} y={y(w.scored) - 5} text-anchor="middle">{w.scored}</text>
        <text class="cap" x={concededX(i) + barW / 2} y={y(w.conceded) - 5} text-anchor="middle">{w.conceded}</text>
      {/each}
      <line class="baseline" x1={m.left} x2={m.left + innerW} y1={y(0)} y2={y(0)} />

      <!-- hit targets: the whole band, larger than the marks -->
      {#each windows as w, i}
        <rect
          class="hit"
          x={bandX(i)} y={m.top} width={band} height={innerH}
          tabindex="0"
          role="img"
          aria-label="Minutes {w.label}: {w.scored} scored, {w.conceded} conceded"
          onpointerenter={() => (hover = i)}
          onpointerleave={() => (hover = -1)}
          onfocus={() => (hover = i)}
          onblur={() => (hover = -1)}
        />
      {/each}
    </svg>

    {#if hover >= 0}
      {@const w = windows[hover]}
      <div
        class="tooltip"
        style="left: {tipLeft}px; top: {m.top + 20}px; transform: translateX({tipOnLeft ? '-100%' : '0'})"
      >
        <p class="tt-title">{w.label === '90+' ? 'Stoppage time / OT' : `Minutes ${w.label}`}</p>
        <div class="tt-row"><span class="linekey" style="background: var(--accent)"></span><strong>{w.scored}</strong> scored</div>
        <div class="tt-row"><span class="linekey" style="background: var(--conceded)"></span><strong>{w.conceded}</strong> conceded</div>
      </div>
    {/if}
    </div>

    <details class="table-view">
      <summary>View as table</summary>
      <table>
        <thead><tr><th>Minutes</th><th>Scored</th><th>Conceded</th></tr></thead>
        <tbody>
          {#each windows as w}
            <tr><td>{w.label}</td><td>{w.scored}</td><td>{w.conceded}</td></tr>
          {/each}
          <tr><td><strong>Total</strong></td><td><strong>{totalScored}</strong></td><td><strong>{totalConceded}</strong></td></tr>
        </tbody>
      </table>
    </details>
  </div>
</section>

<style>
  .cap { fill: var(--ink); font-size: 11px; font-variant-numeric: tabular-nums; }
  .wash { fill: #f3f3f3; }
  .hit { fill: transparent; cursor: default; outline: none; }
  .hit:focus-visible { stroke: var(--accent); stroke-width: 2; }
</style>
