<script lang="ts">
  import { page } from '$app/stores';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import { getFilmById, getFilmLogs, isOnWatchlist, addToWatchlist, removeFromWatchlist, type Film, type FilmLog } from '$lib/films/db';

  let filmId = $derived(Number($page.params.id));
  let film = $state<Film | undefined>(undefined);
  let logs = $state<FilmLog[]>([]);

  let latestLog = $derived(logs[0]);
  let userRating = $state(0);
  let watched = $state(false);
  let liked = $state(false);
  let onWatchlist = $state(false);

  async function loadFilm(id: number) {
    try {
      const [f, l, wl] = await Promise.all([
        getFilmById(id),
        getFilmLogs(id),
        isOnWatchlist(id),
      ]);
      film = f;
      logs = l;
      onWatchlist = wl;

      if (l.length > 0) {
        userRating = l[0].rating ?? 0;
        watched = true;
        liked = l[0].liked ?? false;
      }
    } catch (e: any) {
      console.error('Failed to load film:', e);
    }
  }

  // Load on mount and reload when filmId changes
  $effect(() => {
    loadFilm(filmId);
  });

  async function toggleWatchlist() {
    if (onWatchlist) {
      await removeFromWatchlist(filmId);
    } else {
      await addToWatchlist(filmId);
    }
    onWatchlist = !onWatchlist;
  }

  let genresList = $derived((film?.genres ?? []) as string[]);
  let castList = $derived((film?.cast ?? []) as Array<string | { name: string; character?: string }>);
  let crewList = $derived((film?.crew ?? []) as Array<string | { name: string; job?: string }>);

  function formatRuntime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }

  function ratingToStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '\u2605'.repeat(full) + (half ? '\u00BD' : '');
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
        <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary);">{film.title}</h1>
        <div style="margin-top: 4px; color: var(--text-secondary); font-size: 15px;">
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
            onclick={toggleWatchlist}
          >
            Watchlist
          </button>
          <div style="margin-left: 8px;">
            <StarRating value={userRating} halfStars={true} size="sm" onchange={(v) => userRating = v} />
          </div>
        </div>

        <!-- Synopsis -->
        {#if film.synopsis}
          <p style="margin-top: 24px; color: var(--text-secondary); font-size: 15px; line-height: 1.6;">{film.synopsis}</p>
        {/if}

        <!-- Genres -->
        {#if genresList.length > 0}
          <div class="flex flex-wrap gap-8" style="margin-top: 16px;">
            {#each genresList as genre}
              <span class="genre-pill">{genre}</span>
            {/each}
          </div>
        {/if}

        <!-- Cast -->
        {#if castList.length > 0}
          <div style="margin-top: 16px;">
            <div class="cast-list">
              {#each castList as member}
                <div class="cast-row">
                  <span style="color: var(--text-primary);">{typeof member === 'string' ? member : member.name}</span>
                  <span style="color: var(--text-tertiary); margin-left: 8px;">{typeof member === 'string' ? 'Cast' : member.character || 'Cast'}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Crew -->
        {#if crewList.length > 0}
          <div class="cast-list" style="margin-top: 4px;">
            {#each crewList as member}
              <div class="cast-row">
                <span style="color: var(--text-primary);">{typeof member === 'string' ? member : member.name}</span>
                <span style="color: var(--text-tertiary); margin-left: 8px;">{typeof member === 'string' ? 'Crew' : member.job || 'Crew'}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Diary entries for this film -->
    {#if logs.length > 0}
      <section style="margin-top: 48px;">
        <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin-bottom: 12px;">Your diary entries</h2>
        <div class="diary-entries">
          {#each logs as log, i}
            <div class="diary-row" class:border-bottom={i < logs.length - 1}>
              <span style="color: var(--text-secondary); width: 100px; flex-shrink: 0;">
                {new Date(log.watchedDate ?? '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span style="color: var(--accent); flex-shrink: 0;">{ratingToStars(log.rating ?? 0)}</span>
              {#if log.liked}
                <span style="color: var(--text-secondary); flex-shrink: 0;">{'\u2665'}</span>
              {/if}
              {#if log.rewatch}
                <span style="color: var(--text-tertiary); flex-shrink: 0;">{'\u21BB'}</span>
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
  <div style="padding: 48px 0; color: var(--text-secondary); font-size: 15px;">
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
    font-size: 15px;
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
    font-size: 15px;
    padding: 3px 0;
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
    height: 48px;
    padding: 0 12px;
    font-size: 15px;
    transition: background-color 150ms ease-out;
  }
  .diary-row:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }
  .diary-row.border-bottom {
    border-bottom: 1px solid var(--border-subtle);
  }
</style>
