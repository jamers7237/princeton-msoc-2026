<script>
  import { matchesWithGoals } from './data.js'

  const games = matchesWithGoals()
  let selected = $state(null)

  const fmtDate = (d) =>
    new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
</script>

<section>
  <h2>The season, match by match</h2>
  <ol class="timeline">
    {#each games as g (g.id)}
      <li>
        <button
          class="dot {g.result}"
          class:ivy={g.ivy}
          class:active={selected?.id === g.id}
          aria-label="{fmtDate(g.date)} vs {g.opponent}: {g.result} {g.princeton_goals}–{g.opponent_goals}"
          onclick={() => (selected = selected?.id === g.id ? null : g)}
        >{g.result}</button>
      </li>
    {/each}
  </ol>

  {#if selected}
    <div class="detail">
      <p class="score">
        {selected.home ? 'vs' : 'at'} {selected.opponent} ·
        <strong>{selected.princeton_goals}–{selected.opponent_goals}</strong>
        <span class="meta">{fmtDate(selected.date)}{selected.ivy ? ' · Ivy League' : ''}</span>
      </p>
      <ul>
        {#each selected.goals as goal}
          <li class={goal.team}>{goal.minute}' — {goal.scorer}{goal.team === 'opponent' ? ` (${selected.opponent})` : ''}</li>
        {/each}
      </ul>
      {#if selected.recap_url}
        <a href={selected.recap_url} target="_blank" rel="noopener">Read the recap →</a>
      {/if}
    </div>
  {:else}
    <p class="hint">Tap a match to see the goals.</p>
  {/if}
</section>

<style>
  .timeline { display: flex; flex-wrap: wrap; gap: 6px; list-style: none; padding: 0; }
  .dot {
    width: 36px; height: 36px; border-radius: 50%; border: 2px solid transparent;
    font-weight: 700; color: #fff; cursor: pointer;
  }
  .W { background: var(--win); }
  .D { background: var(--draw); }
  .L { background: var(--loss); }
  .ivy { border-color: var(--ink); }
  .active { outline: 3px solid var(--accent); outline-offset: 2px; }
  .detail { margin-top: 12px; padding: 12px; border: 1px solid var(--rule); border-radius: 6px; }
  .score { margin: 0 0 8px; }
  .meta { display: block; color: var(--muted); font-size: 0.85em; }
  .detail ul { margin: 0 0 8px; padding-left: 18px; }
  .opponent { color: var(--muted); }
  .hint { color: var(--muted); font-size: 0.9em; }
</style>
