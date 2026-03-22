<script lang="ts">
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import PosterGrid from '@noaudience/core/components/PosterGrid.svelte';
  import { getWatchlist } from '$lib/films/db';

  let sortBy = $state<'added' | 'title' | 'year'>('added');
  let watchlist = $derived(getWatchlist(sortBy));
</script>

<div class="max-w-6xl">
  <div class="flex items-center justify-between mb-10">
    <h1 class="text-4xl font-bold text-white tracking-tight">Watchlist</h1>
    <div class="flex items-center gap-3">
      <span class="text-xs text-[#667788] uppercase tracking-wider font-medium">Sort by</span>
      <select
        bind:value={sortBy}
        class="bg-gradient-to-b from-[#1E2530] to-[#1B2028] ring-1 ring-white/[0.06] rounded-lg px-3 h-9 text-white text-sm focus:outline-none focus:ring-[#40BCF4]/50 transition-all duration-200 cursor-pointer appearance-none pr-8 backdrop-blur-sm"
      >
        <option value="added">Date Added</option>
        <option value="title">Title</option>
        <option value="year">Year</option>
      </select>
    </div>
  </div>

  {#if watchlist.length > 0}
    <PosterGrid>
      {#each watchlist as entry}
        <div class="group">
          <div class="poster-card-wrap transition-transform duration-300 ease-out group-hover:scale-[1.03]">
            <PosterCard
              src={entry.film.posterPath}
              alt={entry.film.title}
              title={entry.film.title}
              subtitle={entry.film.year?.toString()}
              href="/films/{entry.film.id}"
              status="watchlist"
            />
          </div>
        </div>
      {/each}
    </PosterGrid>
  {:else}
    <div class="flex flex-col items-center justify-center py-28 text-center">
      <div class="w-20 h-20 rounded-full bg-gradient-to-br from-[#1E2530] to-[#14181C] ring-1 ring-white/[0.04] flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2C3440" stroke-width="1.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <p class="text-[#99AABB] text-lg font-medium">Your watchlist is empty</p>
      <p class="text-[#667788] text-sm mt-2 max-w-xs">Add films you want to watch later and they will appear here.</p>
    </div>
  {/if}
</div>

<style>
  .poster-card-wrap {
    position: relative;
  }
  .poster-card-wrap::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 40%;
    background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
    border-radius: 0 0 6px 6px;
    pointer-events: none;
    z-index: 1;
  }

  .group:hover .poster-card-wrap {
    box-shadow: 0 0 20px rgba(0, 224, 84, 0.08);
  }
</style>
