<script lang="ts">
  import { page } from '$app/stores';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import { getFilmById, getFilmLogs } from '$lib/films/db';

  let filmId = $derived(Number($page.params.id));
  let film = $derived(getFilmById(filmId));
  let logs = $derived(getFilmLogs(filmId));

  let latestLog = $derived(logs[0]);
  let userRating = $state(0);
  let watched = $state(false);
  let liked = $state(false);
  let onWatchlist = $state(false);

  $effect(() => {
    if (latestLog) {
      userRating = latestLog.rating ?? 0;
      watched = true;
      liked = latestLog.liked ?? false;
    }
  });

  function formatRuntime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }

  function ratingToStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '');
  }
</script>

{#if film}
  <div class="max-w-3xl">
    <!-- Poster + Info layout -->
    <div class="flex gap-24">
      <!-- Poster -->
      <div class="flex-shrink-0" style="width: 200px;">
        <img
          src={film.posterPath}
          alt={film.title}
          class="w-full rounded-[6px] border border-[var(--border)]"
          style="aspect-ratio: 2/3; object-fit: cover;"
        />
      </div>

      <!-- Film info -->
      <div class="flex-1 min-w-0">
        <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary);">{film.title}</h1>
        <div style="margin-top: 4px; color: var(--text-secondary); font-size: 13px;">
          {film.year} · {film.director}{#if film.runtime} · {formatRuntime(film.runtime)}{/if}
        </div>

        <!-- Action row -->
        <div class="flex items-center gap-16" style="margin-top: 16px;">
          <button
            class="action-btn"
            class:active={watched}
            onclick={() => watched = !watched}
          >
            Watched
          </button>
          <button
            class="action-btn"
            class:active={liked}
            onclick={() => liked = !liked}
          >
            Liked
          </button>
          <button
            class="action-btn"
            class:active={onWatchlist}
            onclick={() => onWatchlist = !onWatchlist}
          >
            Watchlist
          </button>
          <div style="margin-left: 8px;">
            <StarRating value={userRating} halfStars={true} size="sm" onchange={(v) => userRating = v} />
          </div>
        </div>

        <!-- Synopsis -->
        {#if film.synopsis}
          <p style="margin-top: 24px; color: var(--text-secondary); line-height: 1.6;">{film.synopsis}</p>
        {/if}

        <!-- Genres -->
        {#if film.genres && film.genres.length > 0}
          <div class="flex flex-wrap gap-8" style="margin-top: 16px;">
            {#each film.genres as genre}
              <span class="genre-pill">{genre}</span>
            {/each}
          </div>
        {/if}

        <!-- Cast -->
        {#if film.cast && film.cast.length > 0}
          <div style="margin-top: 16px;">
            <div class="cast-list">
              {#each film.cast as member}
                <div class="cast-row">
                  <span style="color: var(--text-primary);">{member}</span>
                  <span style="color: var(--text-tertiary); margin-left: 8px;">Cast</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Crew -->
        {#if film.crew && film.crew.length > 0}
          <div class="cast-list" style="margin-top: 4px;">
            {#each film.crew as member}
              <div class="cast-row">
                <span style="color: var(--text-primary);">{member}</span>
                <span style="color: var(--text-tertiary); margin-left: 8px;">Crew</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Diary entries for this film -->
    {#if logs.length > 0}
      <section style="margin-top: 32px;">
        <h2 style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">Your diary entries</h2>
        <div class="diary-entries">
          {#each logs as log, i}
            <div class="diary-row" class:border-bottom={i < logs.length - 1}>
              <span style="color: var(--text-secondary); width: 100px; flex-shrink: 0;">
                {new Date(log.watchedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span style="color: var(--accent); flex-shrink: 0;">{ratingToStars(log.rating)}</span>
              {#if log.liked}
                <span style="color: var(--text-secondary); flex-shrink: 0;">♥</span>
              {/if}
              {#if log.rewatch}
                <span style="color: var(--text-tertiary); flex-shrink: 0;">↻</span>
              {/if}
              {#if log.review}
                <span style="color: var(--text-secondary); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{log.review}</span>
              {/if}
            </div>
          {/each}
        </div>
      </section>
    {/if}
  </div>
{:else}
  <div style="padding: 32px 0; color: var(--text-secondary);">
    Film not found.
  </div>
{/if}

<style>
  .action-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 4px 0;
    font-size: 13px;
    transition: color 150ms ease-out;
  }
  .action-btn:hover {
    color: var(--text-primary);
  }
  .action-btn.active {
    color: var(--accent);
  }

  .genre-pill {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .cast-list {
    display: flex;
    flex-direction: column;
  }

  .cast-row {
    font-size: 13px;
    padding: 2px 0;
  }

  .diary-entries {
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
  }

  .diary-row {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 32px;
    padding: 0 12px;
    font-size: 13px;
    transition: background-color 150ms ease-out;
  }
  .diary-row:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }
  .diary-row.border-bottom {
    border-bottom: 1px solid var(--border-subtle);
  }
</style>
