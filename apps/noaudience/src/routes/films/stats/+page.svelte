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

<main style="padding-bottom: 64px;">
  <h1 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.75rem; font-weight: 500; color: var(--text-primary); margin: 0 0 40px;">Film Stats</h1>

  <!-- Summary cards -->
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 48px;">
    <div style="background: var(--surface-container-low); border-radius: 10px; padding: 24px;">
      <p style="font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin: 0 0 4px;">Films Logged</p>
      <span style="font-family: 'Newsreader', Georgia, serif; font-size: 2rem; color: var(--text-primary);">{stats.totalFilms}</span>
    </div>
    <div style="background: var(--surface-container-low); border-radius: 10px; padding: 24px;">
      <p style="font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin: 0 0 4px;">Hours Watched</p>
      <span style="font-family: 'Newsreader', Georgia, serif; font-size: 2rem; color: var(--text-primary);">{stats.totalHours}</span>
    </div>
    <div style="background: var(--surface-container-low); border-radius: 10px; padding: 24px;">
      <p style="font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin: 0 0 4px;">Average Rating</p>
      <span style="font-family: 'Newsreader', Georgia, serif; font-size: 2rem; color: var(--accent);">{stats.averageRating}</span>
    </div>
  </div>

  <!-- Rating distribution -->
  {#if stats.ratingDistribution.length > 0}
    <section style="margin-bottom: 48px;">
      <h2 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.25rem; font-weight: 500; color: var(--text-primary); margin: 0 0 20px;">Rating Distribution</h2>
      <div style="background: var(--surface-container-low); border-radius: 10px; padding: 24px;">
        <div class="rating-bars">
          {#each stats.ratingDistribution as bucket}
            <div class="bar-col">
              <div class="bar-value">{bucket.count}</div>
              <div
                class="bar"
                style="height: {bucket.count > 0 ? Math.max((bucket.count / maxRatingCount) * 80, 4) : 0}px;"
              ></div>
              <div class="bar-label">{bucket.rating}★</div>
            </div>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
    <!-- Genres -->
    {#if stats.genreCounts.length > 0}
      <section>
        <h2 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.25rem; font-weight: 500; color: var(--text-primary); margin: 0 0 16px;">Top Genres</h2>
        <div style="background: var(--surface-container-low); border-radius: 10px; padding: 20px; display: flex; flex-direction: column; gap: 10px;">
          {#each stats.genreCounts.slice(0, 8) as genre}
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 14px; color: var(--text-primary); flex: 1;">{genre.genre}</span>
              <div style="width: 120px; height: 4px; border-radius: 999px; background: var(--surface-container-high); overflow: hidden;">
                <div style="height: 100%; border-radius: 999px; background: var(--accent); width: {(genre.count / (stats.genreCounts[0]?.count || 1)) * 100}%;"></div>
              </div>
              <span style="font-size: 12px; color: var(--text-muted); width: 28px; text-align: right;">{genre.count}</span>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Directors -->
    {#if stats.topDirectors.length > 0}
      <section>
        <h2 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.25rem; font-weight: 500; color: var(--text-primary); margin: 0 0 16px;">Top Directors</h2>
        <div style="background: var(--surface-container-low); border-radius: 10px; padding: 20px; display: flex; flex-direction: column; gap: 10px;">
          {#each stats.topDirectors.slice(0, 8) as dir, i}
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 12px; color: var(--text-muted); width: 20px;">{i + 1}</span>
              <span style="font-size: 14px; color: var(--text-primary); flex: 1;">{dir.director}</span>
              <span style="font-size: 12px; color: var(--accent); font-weight: 600;">{dir.count}</span>
            </div>
          {/each}
        </div>
      </section>
    {/if}
  </div>
</main>

<style>
  .rating-bars {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 120px;
  }

  .bar-col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
    gap: 6px;
  }

  .bar {
    width: 100%;
    max-width: 40px;
    background: var(--accent);
    border-radius: 4px 4px 0 0;
    transition: height 500ms;
  }

  .bar-value {
    font-size: 11px;
    color: var(--text-muted);
  }

  .bar-label {
    font-size: 11px;
    color: var(--text-secondary);
  }
</style>
