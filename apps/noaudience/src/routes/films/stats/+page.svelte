<script lang="ts">
  import { onMount } from 'svelte';
  import { getFilmStats, type FilmStats } from '$lib/films/db';

  let stats = $state<FilmStats>({
    totalFilms: 0,
    totalHours: 0,
    averageRating: 0,
    ratingDistribution: [],
    genreCounts: [],
    topDirectors: [],
  });

  onMount(async () => {
    try {
      stats = await getFilmStats();
    } catch (e: any) {
      console.error('Failed to load film stats:', e);
    }
  });

  let maxRatingCount = $derived(Math.max(...stats.ratingDistribution.map((r) => r.count), 1));
</script>

<div class="max-w-3xl">
  <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 32px;">Stats</h1>

  <!-- Inline summary -->
  <div style="font-size: 15px; color: var(--text-secondary); margin-bottom: 32px;">
    {stats.totalFilms} films · {stats.totalHours} hours · {stats.averageRating} avg
  </div>

  <!-- Rating distribution -->
  {#if stats.ratingDistribution.length > 0}
    <section style="margin-bottom: 48px;">
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
  {/if}

  <!-- Genres -->
  {#if stats.genreCounts.length > 0}
    <section style="margin-bottom: 48px;">
      <h2 class="section-title">Genres</h2>
      <div style="font-size: 15px; color: var(--text-secondary);">
        {#each stats.genreCounts as genre, i}{#if i > 0} · {/if}{genre.genre} ({genre.count}){/each}
      </div>
    </section>
  {/if}

  <!-- Directors -->
  {#if stats.topDirectors.length > 0}
    <section style="margin-bottom: 48px;">
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
  {/if}
</div>

<style>
  .section-title {
    font-size: 20px;
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
    gap: 6px;
  }

  .director-row {
    display: flex;
    gap: 6px;
    font-size: 15px;
  }
</style>
