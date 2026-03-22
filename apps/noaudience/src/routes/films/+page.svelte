<script lang="ts">
  import { onMount } from 'svelte';
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import LogModal from '$lib/films/LogModal.svelte';
  import { getRecentLogs, getWatchlist, getFilmStats, searchFilms, type FilmLogWithFilm, type WatchlistEntryWithFilm, type FilmStats, type Film } from '$lib/films/db';

  let searchQuery = $state('');
  let logModalOpen = $state(false);

  let recentLogs = $state<FilmLogWithFilm[]>([]);
  let watchlist = $state<WatchlistEntryWithFilm[]>([]);
  let stats = $state<FilmStats>({ totalFilms: 0, totalHours: 0, averageRating: 0, ratingDistribution: [], genreCounts: [], topDirectors: [] });
  let diaryEntries = $state<FilmLogWithFilm[]>([]);
  let searchResults = $state<Film[]>([]);
  let showSearchResults = $state(false);
  let debounceTimer: ReturnType<typeof setTimeout>;

  async function loadData() {
    try {
      [recentLogs, watchlist, stats, diaryEntries] = await Promise.all([
        getRecentLogs(8),
        getWatchlist().then((w) => w.slice(0, 8)),
        getFilmStats(),
        getRecentLogs(5),
      ]);
    } catch (e: any) {
      console.error('Failed to load films data:', e);
    }
  }

  onMount(() => { loadData(); });

  async function refreshData() {
    await loadData();
  }

  function handleSearch() {
    clearTimeout(debounceTimer);
    if (searchQuery.length < 2) {
      searchResults = [];
      showSearchResults = false;
      return;
    }
    showSearchResults = true;
    debounceTimer = setTimeout(async () => {
      searchResults = await searchFilms(searchQuery);
    }, 300);
  }
</script>

<div>
  <!-- Header -->
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
    <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0;">Films</h1>
    <div style="position: relative;">
      <input
        type="text"
        bind:value={searchQuery}
        oninput={handleSearch}
        onfocus={() => { if (searchResults.length) showSearchResults = true; }}
        onblur={() => setTimeout(() => showSearchResults = false, 200)}
        placeholder="Search films..."
        style="
          height: 40px;
          padding: 0 12px;
          font-size: 15px;
          background: var(--bg-inset);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--text-primary);
          outline: none;
          width: 320px;
        "
      />
      {#if showSearchResults && searchResults.length > 0}
        <div class="search-dropdown">
          {#each searchResults as film}
            <a href="/films/{film.id}" class="search-result">
              {#if film.posterPath}
                <img src={film.posterPath} alt="" style="width: 28px; height: 42px; object-fit: cover; border-radius: 2px; border: 1px solid var(--border); flex-shrink: 0;" />
              {/if}
              <span style="font-size: 15px; color: var(--text-primary);">{film.title}</span>
              <span style="font-size: 13px; color: var(--text-tertiary);">{film.year}</span>
            </a>
          {/each}
        </div>
      {/if}
    </div>
    <button
      onclick={() => logModalOpen = true}
      style="
        height: 40px;
        padding: 0 16px;
        font-size: 15px;
        font-weight: 500;
        color: var(--accent);
        background: transparent;
        border: 1px solid var(--border);
        border-radius: 4px;
        cursor: pointer;
        transition: background 150ms ease-out;
      "
      class="log-btn"
    >
      Log
    </button>
    <div style="flex: 1;"></div>
    <span style="font-size: 13px; color: var(--text-secondary);">
      {stats.totalFilms} films · {stats.totalHours} hours · {stats.averageRating} avg
    </span>
  </div>

  <!-- Empty state when no data at all -->
  {#if recentLogs.length === 0 && watchlist.length === 0 && diaryEntries.length === 0 && stats.totalFilms === 0}
    <div style="padding: 48px 0; text-align: center; color: var(--text-tertiary); font-size: 15px;">
      Use the Log button to add films.
    </div>
  {:else}
    <!-- Recently Watched -->
    {#if recentLogs.length > 0}
      <section style="margin-bottom: 48px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0;">Recently Watched</h2>
          <a href="/films/diary" style="font-size: 13px; color: var(--text-tertiary); text-decoration: none;" class="section-link">View all</a>
        </div>
        <div class="poster-grid">
          {#each recentLogs as entry}
            <a href="/films/{entry.film.id}" class="poster-item" title={entry.film.title}>
              <PosterCard
                src={entry.film.posterPath ?? ''}
                alt={entry.film.title}
                href="/films/{entry.film.id}"
                status="watched"
              />
            </a>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Diary Preview -->
    <section style="margin-bottom: 48px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0;">Diary</h2>
        <a href="/films/diary" style="font-size: 13px; color: var(--text-tertiary); text-decoration: none;" class="section-link">View all</a>
      </div>
      {#if diaryEntries.length > 0}
        <div>
          {#each diaryEntries as entry, i}
            <a
              href="/films/{entry.film.id}"
              class="diary-row"
              style="
                display: flex;
                align-items: center;
                gap: 12px;
                height: 48px;
                padding: 0 8px;
                text-decoration: none;
                border-bottom: {i < diaryEntries.length - 1 ? '1px solid var(--border-subtle)' : 'none'};
                transition: background 150ms ease-out;
              "
            >
              <span style="font-size: 13px; color: var(--text-tertiary); width: 56px; flex-shrink: 0;">
                {new Date(entry.watchedDate ?? '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <img
                src={entry.film.posterPath}
                alt={entry.film.title}
                style="width: 28px; height: 42px; object-fit: cover; border-radius: 2px; flex-shrink: 0;"
              />
              <span style="font-size: 15px; color: var(--text-primary); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{entry.film.title}</span>
              <span style="font-size: 13px; color: var(--text-tertiary); flex-shrink: 0;">{entry.film.year}</span>
              <div style="flex-shrink: 0;">
                <StarRating value={entry.rating ?? 0} size="sm" readonly={true} />
              </div>
              {#if entry.liked}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#FF6B6B" stroke="none" style="flex-shrink: 0;">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              {/if}
            </a>
          {/each}
        </div>
      {:else}
        <p style="font-size: 15px; color: var(--text-tertiary);">No diary entries yet.</p>
      {/if}
    </section>

    <!-- Watchlist -->
    {#if watchlist.length > 0}
      <section style="margin-bottom: 48px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0;">Watchlist</h2>
          <a href="/films/watchlist" style="font-size: 13px; color: var(--text-tertiary); text-decoration: none;" class="section-link">View all</a>
        </div>
        <div class="poster-grid">
          {#each watchlist as entry}
            <a href="/films/{entry.film.id}" class="poster-item" title={entry.film.title}>
              <PosterCard
                src={entry.film.posterPath ?? ''}
                alt={entry.film.title}
                href="/films/{entry.film.id}"
                status="watchlist"
              />
            </a>
          {/each}
        </div>
      </section>
    {/if}
  {/if}
</div>

<LogModal
  open={logModalOpen}
  onclose={() => logModalOpen = false}
  onsave={refreshData}
/>

<style>
  .poster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .poster-item {
    display: block;
    text-decoration: none;
    border-radius: 4px;
    overflow: hidden;
  }

  .diary-row:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .log-btn:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .section-link:hover {
    color: var(--text-secondary);
  }

  .search-dropdown {
    position: absolute;
    z-index: 10;
    width: 360px;
    margin-top: 4px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 4px;
    max-height: 300px;
    overflow-y: auto;
  }

  .search-result {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    text-decoration: none;
    border-bottom: 1px solid var(--border-subtle);
    transition: background-color 150ms ease-out;
  }
  .search-result:last-child {
    border-bottom: none;
  }
  .search-result:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }
</style>
