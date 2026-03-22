<script lang="ts">
  import { getWatchlist, type WatchlistEntryWithFilm } from '$lib/films/db';

  let sortBy = $state<'added' | 'title' | 'year'>('added');
  let watchlist = $state<WatchlistEntryWithFilm[]>([]);

  async function loadWatchlist() {
    try {
      watchlist = await getWatchlist(sortBy);
    } catch (e: any) {
      console.error('Failed to load watchlist:', e);
    }
  }

  // Load on mount and reload when sort changes
  $effect(() => {
    // Access sortBy to create the dependency
    const _sort = sortBy;
    loadWatchlist();
  });
</script>

<div class="max-w-4xl">
  <div class="flex items-center gap-12" style="margin-bottom: 32px;">
    <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary);">Watchlist</h1>
    <select
      bind:value={sortBy}
      class="sort-select"
    >
      <option value="added">Date Added</option>
      <option value="title">Title</option>
      <option value="year">Year</option>
    </select>
  </div>

  {#if watchlist.length > 0}
    <div class="poster-grid">
      {#each watchlist as entry}
        <a href="/films/{entry.film.id}" class="poster-item">
          <img
            src={entry.film.posterPath}
            alt={entry.film.title}
            class="poster-img"
            loading="lazy"
          />
          <span class="poster-tooltip">{entry.film.title}</span>
        </a>
      {/each}
    </div>
  {:else}
    <div style="padding: 48px 0; color: var(--text-secondary); text-align: center; font-size: 15px;">
      Your watchlist is empty. Add films you want to watch later.
    </div>
  {/if}
</div>

<style>
  .sort-select {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0 8px;
    height: 40px;
    color: var(--text-secondary);
    font-size: 15px;
    cursor: pointer;
    appearance: none;
    outline: none;
  }
  .sort-select:focus {
    border-color: var(--accent);
  }

  .poster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .poster-item {
    position: relative;
    display: block;
  }

  .poster-img {
    width: 100%;
    aspect-ratio: 2/3;
    object-fit: cover;
    border-radius: 4px;
    border: 1px solid var(--border);
    transition: border-color 150ms ease-out;
  }
  .poster-item:hover .poster-img {
    border-color: var(--border-strong);
  }

  .poster-tooltip {
    display: none;
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 13px;
    color: var(--text-primary);
    white-space: nowrap;
    margin-bottom: 4px;
    pointer-events: none;
    z-index: 10;
  }
  .poster-item:hover .poster-tooltip {
    display: block;
  }
</style>
