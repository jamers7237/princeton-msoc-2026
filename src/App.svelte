<script>
  import Timeline from './lib/Timeline.svelte'
  import GoalTiming from './lib/GoalTiming.svelte'
  import IvyRace from './lib/IvyRace.svelte'
</script>

<main>
  <header>
    <p class="kicker">Princeton Men's Soccer</p>
    <h1>2026 Season in Review</h1>
    <p class="byline">By James Li</p>
    <p class="dek">The defending Ivy League champions saw a disappointing end to the season, after a loss against Penn 
    that eliminated them from Ivy play. However, the season was not without its positives, including a strong start in which
    the Tigers were near the top of national rankings and had wins over strong teams such as #3 Portland.</p>
  </header>

  <Timeline />
  <GoalTiming />
  <IvyRace />

  <footer>
    <p>Data: official Princeton and Ivy League box scores. <!-- TODO: link sources --></p>
  </footer>
</main>
