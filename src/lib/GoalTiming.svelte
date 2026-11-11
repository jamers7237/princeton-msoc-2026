<script>
  import { goalsByWindow } from './data.js'
  const windows = goalsByWindow()
  // TODO: draw a bar chart (plain SVG or D3) of goals scored vs. conceded per window.
  // Tip: build the SVG with Svelte's {#each} over `windows`; it's simpler than D3 for this.
</script>

<section>
  <h2>When the goals came</h2>
  {#if windows.length === 0}
    <p class="todo">Chart coming soon — implement goalsByWindow() in src/lib/data.js.</p>
  {/if}
</section>

<style>.todo { color: var(--muted); font-style: italic; }</style>
