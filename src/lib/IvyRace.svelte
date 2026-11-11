<script>
  import { ivyPointsByMatchday } from './data.js'
  const series = ivyPointsByMatchday()
  // TODO: draw a line chart of cumulative points by matchday, one line per team.
  // Highlight Princeton in --accent and grey out the rest.
</script>

<section>
  <h2>The Ivy League race</h2>
  {#if series.length === 0}
    <p class="todo">Chart coming soon — implement ivyPointsByMatchday() in src/lib/data.js.</p>
  {/if}
</section>

<style>.todo { color: var(--muted); font-style: italic; }</style>
