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
  <!-- Backdrop -->
  <div class="relative -mx-8 -mt-8 mb-0">
    <div class="w-full h-[360px] overflow-hidden">
      <img
        src={film.backdropPath}
        alt=""
        class="w-full h-full object-cover"
      />
    </div>
    <div class="absolute inset-0 bg-gradient-to-t from-[#14181C] via-[#14181C]/60 to-transparent"></div>
  </div>

  <div class="max-w-5xl relative -mt-32 z-10">
    <div class="flex gap-8">
      <!-- Poster -->
      <div class="flex-shrink-0">
        <img
          src={film.posterPath}
          alt={film.title}
          class="w-[230px] rounded-[6px] shadow-2xl ring-1 ring-white/[0.08]"
        />
      </div>

      <!-- Film info -->
      <div class="flex-1 pt-4">
        <h1 class="text-4xl font-bold text-white">{film.title}</h1>
        <div class="flex items-center gap-3 mt-2 text-[#99AABB] text-sm">
          <span class="text-white font-medium">{film.year}</span>
          <span class="w-1 h-1 rounded-full bg-[#99AABB]"></span>
          <span>Directed by <span class="text-[#40BCF4]">{film.director}</span></span>
          {#if film.runtime}
            <span class="w-1 h-1 rounded-full bg-[#99AABB]"></span>
            <span>{formatRuntime(film.runtime)}</span>
          {/if}
        </div>

        {#if film.tagline}
          <p class="text-[#99AABB] italic mt-4 text-sm">"{film.tagline}"</p>
        {/if}

        <!-- Action buttons -->
        <div class="flex items-center gap-4 mt-6">
          <!-- Watched -->
          <button
            class="flex flex-col items-center gap-1 transition-colors cursor-pointer {watched ? 'text-[#00E054]' : 'text-[#99AABB] hover:text-white'}"
            onclick={() => watched = !watched}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={watched ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span class="text-xs">Watched</span>
          </button>

          <!-- Liked -->
          <button
            class="flex flex-col items-center gap-1 transition-colors cursor-pointer {liked ? 'text-[#FF8000]' : 'text-[#99AABB] hover:text-white'}"
            onclick={() => liked = !liked}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span class="text-xs">Like</span>
          </button>

          <!-- Watchlist -->
          <button
            class="flex flex-col items-center gap-1 transition-colors cursor-pointer {onWatchlist ? 'text-[#40BCF4]' : 'text-[#99AABB] hover:text-white'}"
            onclick={() => onWatchlist = !onWatchlist}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span class="text-xs">Watchlist</span>
          </button>

          <!-- Star rating -->
          <div class="ml-4">
            <StarRating value={userRating} halfStars={true} size="lg" onchange={(v) => userRating = v} />
          </div>
        </div>

        <!-- Synopsis -->
        {#if film.synopsis}
          <div class="mt-8">
            <h3 class="text-xs text-[#99AABB] font-medium uppercase tracking-wider mb-2">Synopsis</h3>
            <p class="text-[#CCDDE8] text-sm leading-relaxed">{film.synopsis}</p>
          </div>
        {/if}

        <!-- Genres -->
        {#if film.genres && film.genres.length > 0}
          <div class="mt-6">
            <h3 class="text-xs text-[#99AABB] font-medium uppercase tracking-wider mb-2">Genres</h3>
            <div class="flex flex-wrap gap-2">
              {#each film.genres as genre}
                <span class="px-3 py-1 bg-[#2C3440] rounded-full text-xs text-white border border-white/[0.06]">{genre}</span>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Cast -->
        {#if film.cast && film.cast.length > 0}
          <div class="mt-6">
            <h3 class="text-xs text-[#99AABB] font-medium uppercase tracking-wider mb-2">Cast</h3>
            <p class="text-[#CCDDE8] text-sm">{film.cast.join(', ')}</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Your Activity -->
    {#if logs.length > 0}
      <section class="mt-12">
        <h2 class="text-lg font-semibold text-white mb-4">Your Activity</h2>
        <div class="bg-[#1B2028] rounded-[8px] border border-white/[0.06] overflow-hidden">
          {#each logs as log, i}
            <div class="px-5 py-4 {i < logs.length - 1 ? 'border-b border-white/[0.04]' : ''}">
              <div class="flex items-center gap-4">
                <div class="text-sm text-[#99AABB]">
                  {new Date(log.watchedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                <StarRating value={log.rating} size="sm" readonly={true} />
                {#if log.liked}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#FF8000" stroke="#FF8000" stroke-width="2">
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
                <p class="text-[#CCDDE8] text-sm mt-2 leading-relaxed">{log.review}</p>
              {/if}
              {#if log.tags && log.tags.length > 0}
                <div class="flex gap-2 mt-2">
                  {#each log.tags as tag}
                    <span class="px-2 py-0.5 bg-[#2C3440] rounded-[4px] text-xs text-[#99AABB]">{tag}</span>
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
  <div class="flex items-center justify-center min-h-[400px]">
    <p class="text-[#99AABB] text-lg">Film not found.</p>
  </div>
{/if}
