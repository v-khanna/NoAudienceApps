<script lang="ts">
  import { page } from '$app/stores';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import Button from '@noaudience/core/components/Button.svelte';
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
</script>

{#if film}
  <!-- Cinematic Backdrop Hero -->
  <div class="relative -mx-8 -mt-8 mb-0">
    <div class="w-full h-[420px] overflow-hidden">
      <img
        src={film.backdropPath}
        alt=""
        class="w-full h-full object-cover scale-[1.02]"
      />
    </div>
    <!-- Multi-layer gradient overlay for cinematic feel -->
    <div class="absolute inset-0 bg-gradient-to-t from-[#14181C] via-[#14181C]/70 to-transparent"></div>
    <div class="absolute inset-0 bg-gradient-to-r from-[#14181C]/50 to-transparent"></div>
    <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#14181C] to-transparent"></div>
  </div>

  <div class="max-w-5xl relative -mt-44 z-10">
    <div class="flex gap-10">
      <!-- Poster -->
      <div class="flex-shrink-0">
        <div class="poster-frame">
          <img
            src={film.posterPath}
            alt={film.title}
            class="w-[240px] rounded-lg shadow-2xl ring-1 ring-white/[0.08]"
          />
        </div>
      </div>

      <!-- Film info -->
      <div class="flex-1 pt-6">
        <h1 class="text-5xl font-bold text-white tracking-tight leading-tight">{film.title}</h1>
        <div class="flex items-center gap-3 mt-3 text-[#99AABB] text-sm">
          <span class="text-white font-semibold text-base">{film.year}</span>
          <span class="w-1 h-1 rounded-full bg-[#99AABB]/50"></span>
          <span>Directed by <span class="text-[#40BCF4] hover:text-[#60D0FF] transition-colors duration-200">{film.director}</span></span>
          {#if film.runtime}
            <span class="w-1 h-1 rounded-full bg-[#99AABB]/50"></span>
            <span>{formatRuntime(film.runtime)}</span>
          {/if}
        </div>

        {#if film.tagline}
          <p class="text-[#99AABB]/80 italic mt-5 text-sm tracking-wide">"{film.tagline}"</p>
        {/if}

        <!-- Action buttons -->
        <div class="flex items-center gap-6 mt-8">
          <!-- Watched -->
          <button
            class="action-btn flex flex-col items-center gap-1.5 transition-all duration-200 ease-out cursor-pointer {watched ? 'text-[#00E054]' : 'text-[#99AABB] hover:text-white'}"
            onclick={() => watched = !watched}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill={watched ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span class="text-[10px] uppercase tracking-wider font-medium">Watched</span>
          </button>

          <!-- Liked -->
          <button
            class="action-btn flex flex-col items-center gap-1.5 transition-all duration-200 ease-out cursor-pointer {liked ? 'text-[#FF6B6B]' : 'text-[#99AABB] hover:text-white'}"
            onclick={() => liked = !liked}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span class="text-[10px] uppercase tracking-wider font-medium">Like</span>
          </button>

          <!-- Watchlist -->
          <button
            class="action-btn flex flex-col items-center gap-1.5 transition-all duration-200 ease-out cursor-pointer {onWatchlist ? 'text-[#40BCF4]' : 'text-[#99AABB] hover:text-white'}"
            onclick={() => onWatchlist = !onWatchlist}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span class="text-[10px] uppercase tracking-wider font-medium">Watchlist</span>
          </button>

          <!-- Star rating -->
          <div class="ml-6 pl-6 border-l border-white/[0.06]">
            <StarRating value={userRating} halfStars={true} size="lg" onchange={(v) => userRating = v} />
          </div>
        </div>

        <!-- Synopsis -->
        {#if film.synopsis}
          <div class="mt-10">
            <h3 class="text-[10px] text-[#667788] font-medium uppercase tracking-widest mb-3">Synopsis</h3>
            <p class="text-[#CCDDE8] text-sm leading-[1.8]">{film.synopsis}</p>
          </div>
        {/if}

        <!-- Genres -->
        {#if film.genres && film.genres.length > 0}
          <div class="mt-8">
            <h3 class="text-[10px] text-[#667788] font-medium uppercase tracking-widest mb-3">Genres</h3>
            <div class="flex flex-wrap gap-2">
              {#each film.genres as genre}
                <span class="genre-tag px-3.5 py-1.5 bg-white/[0.04] rounded-full text-xs text-[#CCDDE8] ring-1 ring-white/[0.06] transition-all duration-200">{genre}</span>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Cast -->
        {#if film.cast && film.cast.length > 0}
          <div class="mt-8">
            <h3 class="text-[10px] text-[#667788] font-medium uppercase tracking-widest mb-3">Cast</h3>
            <p class="text-[#CCDDE8] text-sm leading-relaxed">{film.cast.join(', ')}</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Your Activity -->
    {#if logs.length > 0}
      <section class="mt-16">
        <h2 class="text-xl font-semibold text-white mb-5 tracking-tight">Your Activity</h2>
        <div class="bg-gradient-to-b from-[#1B2028] to-[#181C22] rounded-xl ring-1 ring-white/[0.04] overflow-hidden">
          {#each logs as log, i}
            <div class="activity-row px-6 py-5 {i < logs.length - 1 ? 'border-b border-white/[0.04]' : ''}">
              <div class="flex items-center gap-5">
                <div class="text-sm text-[#99AABB] font-medium">
                  {new Date(log.watchedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <StarRating value={log.rating} size="sm" readonly={true} />
                {#if log.liked}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#FF6B6B" stroke="#FF6B6B" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                {/if}
                {#if log.rewatch}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#40BCF4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <polyline points="23 20 23 14 17 14" />
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                  </svg>
                {/if}
              </div>
              {#if log.review}
                <p class="text-[#CCDDE8] text-sm mt-3 leading-relaxed">{log.review}</p>
              {/if}
              {#if log.tags && log.tags.length > 0}
                <div class="flex gap-2 mt-3">
                  {#each log.tags as tag}
                    <span class="px-2.5 py-0.5 bg-white/[0.04] rounded-full text-xs text-[#99AABB] ring-1 ring-white/[0.06]">{tag}</span>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </section>
    {/if}
  </div>
{:else}
  <div class="flex flex-col items-center justify-center min-h-[400px] text-center">
    <div class="w-20 h-20 rounded-full bg-gradient-to-br from-[#1E2530] to-[#14181C] ring-1 ring-white/[0.04] flex items-center justify-center mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2C3440" stroke-width="1.5">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </div>
    <p class="text-[#99AABB] text-lg font-medium">Film not found</p>
    <p class="text-[#667788] text-sm mt-2">This film may have been removed or the link is incorrect.</p>
  </div>
{/if}

<style>
  .poster-frame {
    position: relative;
    transition: transform 0.3s ease-out;
  }
  .poster-frame:hover {
    transform: translateY(-4px);
  }
  .poster-frame::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 0.5rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    pointer-events: none;
  }

  .action-btn {
    position: relative;
  }
  .action-btn:hover {
    transform: translateY(-2px);
  }
  .action-btn:active {
    transform: scale(0.95);
  }

  .genre-tag:hover {
    background-color: rgba(255, 255, 255, 0.07);
    ring-color: rgba(255, 255, 255, 0.1);
  }

  .activity-row {
    transition: background-color 0.2s ease-out;
  }
  .activity-row:hover {
    background-color: rgba(255, 255, 255, 0.02);
  }
</style>
