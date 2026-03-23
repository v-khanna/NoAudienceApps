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

<main style="padding-bottom: 64px;">

  <!-- Hero: Featured + Stats bento -->
  <section style="margin-bottom: 64px; display: grid; grid-template-columns: 8fr 4fr; gap: 24px; align-items: stretch;">
    <!-- Featured review (latest diary entry with backdrop) -->
    {#if diaryEntries.length > 0}
      {@const featured = diaryEntries[0]}
      <div style="position: relative; overflow: hidden; border-radius: 12px; background: var(--surface-container-low); min-height: 360px;">
        {#if featured.film.backdropPath}
          <div style="position: absolute; inset: 0; z-index: 0;">
            <img src={featured.film.backdropPath} alt="" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.4;" />
          </div>
          <div style="position: absolute; inset: 0; background: linear-gradient(to top, var(--surface-base) 10%, transparent 70%); z-index: 1;"></div>
        {/if}
        <div style="position: absolute; bottom: 0; left: 0; padding: 32px; z-index: 2;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 999px; background: rgba(0,224,84,0.15); color: var(--accent); font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 12px;">Featured Review</span>
          <h2 style="font-family: 'Newsreader', Georgia, serif; font-size: 2.5rem; font-weight: 700; color: #fff; margin: 0 0 12px; line-height: 1.15;">{featured.film.title}</h2>
          {#if featured.review}
            <p style="font-family: 'Newsreader', Georgia, serif; font-size: 1.125rem; color: #cbd5e1; max-width: 500px; font-style: italic; line-height: 1.6; margin: 0;">"{featured.review.length > 180 ? featured.review.slice(0, 180) + '...' : featured.review}"</p>
          {/if}
        </div>
      </div>
    {:else}
      <div style="border-radius: 12px; background: var(--surface-container-low); min-height: 360px; display: flex; align-items: center; justify-content: center;">
        <p style="color: var(--text-muted); font-size: 14px;">Log a film to see your featured review here.</p>
      </div>
    {/if}

    <!-- Private Library stats card -->
    <div style="background: var(--surface-container-low); padding: 32px; border-radius: 12px; display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <h3 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0 0 8px;">Private Library</h3>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 16px;">
          You have cataloged {stats.totalFilms.toLocaleString()} films across {stats.totalHours.toLocaleString()} hours.
        </p>
        <button
          onclick={() => logModalOpen = true}
          style="padding: 8px 20px; border-radius: 999px; background: linear-gradient(135deg, var(--accent), #005d1e); color: #fff; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 150ms;"
          onmouseenter={(e) => e.currentTarget.style.opacity = '0.85'}
          onmouseleave={(e) => e.currentTarget.style.opacity = '1'}
        >
          + Log Film
        </button>
      </div>
      <div style="margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; margin-bottom: 6px;">
          <span style="color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em;">Average Rating</span>
          <span style="color: var(--accent); font-weight: 700;">{stats.averageRating.toFixed(1)} / 5</span>
        </div>
        <div style="width: 100%; height: 4px; background: var(--surface-container); border-radius: 999px; overflow: hidden;">
          <div style="height: 100%; background: var(--accent); border-radius: 999px; width: {(stats.averageRating / 5) * 100}%;"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- Latest in Diary -->
  <section style="margin-bottom: 64px;">
    <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 32px;">
      <h2 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0;">Latest in Diary</h2>
      <a href="/films/diary" style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); text-decoration: none; display: flex; align-items: center; gap: 4px;">
        View Journal →
      </a>
    </div>
    {#if diaryEntries.length > 0}
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px;">
        {#each diaryEntries as entry, i}
          <a href="/films/{entry.film.id}" class="diary-card" style="background: {i % 2 === 0 ? 'var(--surface-container-low)' : 'var(--surface-container)'}; border-radius: 12px; padding: 20px; text-decoration: none; transition: background 200ms;">
            <div style="display: flex; gap: 14px; margin-bottom: 12px;">
              {#if entry.film.posterPath}
                <img src={entry.film.posterPath} alt={entry.film.title} style="width: 56px; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px; flex-shrink: 0;" />
              {/if}
              <div>
                <p style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 4px;">
                  {new Date(entry.watchedDate ?? '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <h4 style="font-family: 'Newsreader', Georgia, serif; font-size: 1rem; font-weight: 700; color: #fff; margin: 0 0 6px;">{entry.film.title} ({entry.film.year})</h4>
                <div style="flex-shrink: 0;">
                  <StarRating value={entry.rating ?? 0} size="sm" readonly={true} />
                </div>
              </div>
            </div>
            {#if entry.review}
              <p style="font-family: 'Newsreader', Georgia, serif; font-size: 13px; color: var(--text-secondary); font-style: italic; line-height: 1.5; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">"{entry.review}"</p>
            {/if}
          </a>
        {/each}
      </div>
    {:else}
      <p style="font-size: 14px; color: var(--text-muted);">No diary entries yet. Log a film to get started.</p>
    {/if}
  </section>

  <!-- Watchlist Poster Grid -->
  <section>
    <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 32px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <h2 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0;">Watchlist</h2>
        {#if watchlist.length > 0}
          <span style="padding: 2px 8px; border-radius: 4px; background: var(--surface-container); color: var(--text-muted); font-size: 10px; font-weight: 700;">{watchlist.length} PENDING</span>
        {/if}
      </div>
      <a href="/films/watchlist" style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); text-decoration: none;">View All →</a>
    </div>
    {#if watchlist.length > 0}
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 20px;">
        {#each watchlist as entry}
          <a href="/films/{entry.film.id}" class="poster-card" style="text-decoration: none; cursor: pointer;">
            <div style="aspect-ratio: 2/3; border-radius: 6px; overflow: hidden; background: var(--surface-container); margin-bottom: 10px; position: relative;">
              {#if entry.film.posterPath}
                <img src={entry.film.posterPath} alt={entry.film.title} class="poster-img" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85; transition: opacity 0.5s, transform 0.5s;" />
              {/if}
            </div>
            <h5 style="font-size: 14px; font-weight: 600; color: #fff; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{entry.film.title}</h5>
            <p style="font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; margin: 4px 0 0;">
              {entry.film.year ?? ''}{#if entry.film.genres?.length} • {(entry.film.genres as string[])[0]}{/if}
            </p>
          </a>
        {/each}
      </div>
    {:else}
      <p style="font-size: 14px; color: var(--text-muted);">Your watchlist is empty.</p>
    {/if}
  </section>

  <!-- Search dropdown (hidden until active) -->
  {#if showSearchResults && searchResults.length > 0}
    <div class="search-dropdown">
      {#each searchResults as film}
        <a href="/films/{film.id}" class="search-result">
          {#if film.posterPath}
            <img src={film.posterPath} alt="" style="width: 28px; height: 42px; object-fit: cover; border-radius: 2px; flex-shrink: 0;" />
          {/if}
          <span style="font-size: 14px; color: var(--text-primary);">{film.title}</span>
          <span style="font-size: 12px; color: var(--text-muted);">{film.year}</span>
        </a>
      {/each}
    </div>
  {/if}
</main>

<LogModal
  open={logModalOpen}
  onclose={() => logModalOpen = false}
  onsave={refreshData}
/>

<style>
  .diary-card:hover {
    background: var(--surface-container-high) !important;
  }

  .poster-card:hover .poster-img {
    opacity: 1 !important;
    transform: scale(1.08);
  }

  .search-dropdown {
    position: fixed;
    z-index: 100;
    top: 80px;
    right: 48px;
    width: 360px;
    background: var(--surface-container-highest, #31353A);
    border: 1px solid var(--ghost-border);
    border-radius: 8px;
    max-height: 300px;
    overflow-y: auto;
    box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.5);
  }

  .search-result {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    text-decoration: none;
    transition: background-color 150ms ease-out;
  }
  .search-result:hover {
    background-color: var(--surface-container-low);
  }
</style>
