<script lang="ts">
  import { getFilmStats } from '$lib/films/db';

  let stats = $state(getFilmStats());

  let maxRatingCount = $derived(Math.max(...stats.ratingDistribution.map((r) => r.count), 1));
</script>

<div class="max-w-3xl">
  <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 24px;">Stats</h1>

  <!-- Inline summary -->
  <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 24px;">
    {stats.totalFilms} films · {stats.totalHours} hours · {stats.averageRating} avg
  </div>

  <!-- Rating distribution -->
  <section style="margin-bottom: 32px;">
    <h2 class="section-title">Ratings</h2>
    <div class="rating-bars">
      {#each stats.ratingDistribution as bucket}
        <div class="bar-col">
          <div
            class="bar"
            style="height: {bucket.count > 0 ? Math.max((bucket.count / maxRatingCount) * 12, 1) : 0}px;"
          ></div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Genres -->
  <section style="margin-bottom: 32px;">
    <h2 class="section-title">Genres</h2>
    <div style="font-size: 13px; color: var(--text-secondary);">
      {#each stats.genreCounts as genre, i}{#if i > 0} · {/if}{genre.genre} ({genre.count}){/each}
    </div>
  </section>

  <!-- Directors -->
  <section style="margin-bottom: 32px;">
    <h2 class="section-title">Directors</h2>
    <div class="director-list">
      {#each stats.topDirectors as dir, i}
        <div class="director-row">
          <span style="color: var(--text-tertiary);">{i + 1}.</span>
          <span style="color: var(--text-primary);">{dir.director}</span>
          <span style="color: var(--text-tertiary);">({dir.count})</span>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .rating-bars {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 12px;
  }

  .bar-col {
    flex: 1;
    display: flex;
    align-items: flex-end;
  }

  .bar {
    width: 100%;
    background: var(--accent);
    border-radius: 1px;
  }

  .director-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .director-row {
    display: flex;
    gap: 6px;
    font-size: 13px;
  }
</style>
