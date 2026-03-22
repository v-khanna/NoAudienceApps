<script lang="ts">
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import LogModal from '$lib/films/LogModal.svelte';
  import { getRecentLogs, getWatchlist, getFilmStats } from '$lib/films/db';

  let searchQuery = $state('');
  let logModalOpen = $state(false);

  let recentLogs = $state(getRecentLogs(8));
  let watchlist = $state(getWatchlist().slice(0, 8));
  let stats = $state(getFilmStats());
  let diaryEntries = $state(getRecentLogs(5));

  function refreshData() {
    recentLogs = getRecentLogs(8);
    watchlist = getWatchlist().slice(0, 8);
    stats = getFilmStats();
    diaryEntries = getRecentLogs(5);
  }
</script>

<div>
  <!-- Header -->
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
    <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0;">Films</h1>
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search films..."
      style="
        height: 32px;
        padding: 0 12px;
        font-size: 12px;
        background: var(--bg-inset);
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--text-primary);
        outline: none;
        width: 200px;
      "
    />
    <button
      onclick={() => logModalOpen = true}
      style="
        height: 32px;
        padding: 0 12px;
        font-size: 12px;
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
    <span style="font-size: 12px; color: var(--text-secondary);">
      {stats.totalFilms} films · {stats.totalHours} hours · {stats.averageRating} avg
    </span>
  </div>

  <!-- Recently Watched -->
  {#if recentLogs.length > 0}
    <section style="margin-bottom: 32px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h2 style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0;">Recently Watched</h2>
        <a href="/films/diary" style="font-size: 11px; color: var(--text-tertiary); text-decoration: none;" class="section-link">View all</a>
      </div>
      <div class="poster-grid">
        {#each recentLogs as entry}
          <a href="/films/{entry.film.id}" class="poster-item" title={entry.film.title}>
            <PosterCard
              src={entry.film.posterPath}
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
  <section style="margin-bottom: 32px;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
      <h2 style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0;">Diary</h2>
      <a href="/films/diary" style="font-size: 11px; color: var(--text-tertiary); text-decoration: none;" class="section-link">View all</a>
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
              height: 32px;
              padding: 0 8px;
              text-decoration: none;
              border-bottom: {i < diaryEntries.length - 1 ? '1px solid var(--border-subtle)' : 'none'};
              transition: background 150ms ease-out;
            "
          >
            <span style="font-size: 11px; color: var(--text-tertiary); width: 48px; flex-shrink: 0;">
              {new Date(entry.watchedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <img
              src={entry.film.posterPath}
              alt={entry.film.title}
              style="width: 16px; height: 24px; object-fit: cover; border-radius: 2px; flex-shrink: 0;"
            />
            <span style="font-size: 12px; color: var(--text-primary); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{entry.film.title}</span>
            <span style="font-size: 11px; color: var(--text-tertiary); flex-shrink: 0;">{entry.film.year}</span>
            <div style="flex-shrink: 0;">
              <StarRating value={entry.rating} size="sm" readonly={true} />
            </div>
            {#if entry.liked}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#FF6B6B" stroke="none" style="flex-shrink: 0;">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            {/if}
          </a>
        {/each}
      </div>
    {:else}
      <p style="font-size: 12px; color: var(--text-tertiary);">No diary entries yet.</p>
    {/if}
  </section>

  <!-- Watchlist -->
  {#if watchlist.length > 0}
    <section style="margin-bottom: 32px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h2 style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0;">Watchlist</h2>
        <a href="/films/watchlist" style="font-size: 11px; color: var(--text-tertiary); text-decoration: none;" class="section-link">View all</a>
      </div>
      <div class="poster-grid">
        {#each watchlist as entry}
          <a href="/films/{entry.film.id}" class="poster-item" title={entry.film.title}>
            <PosterCard
              src={entry.film.posterPath}
              alt={entry.film.title}
              href="/films/{entry.film.id}"
              status="watchlist"
            />
          </a>
        {/each}
      </div>
    </section>
  {/if}
</div>

<LogModal
  bind:open={logModalOpen}
  onclose={() => logModalOpen = false}
  onsave={refreshData}
/>

<style>
  .poster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 120px);
    gap: 8px;
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
</style>
