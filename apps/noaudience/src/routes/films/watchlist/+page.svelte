<script lang="ts">
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import PosterGrid from '@noaudience/core/components/PosterGrid.svelte';
  import { getWatchlist } from '$lib/films/db';

  let sortBy = $state<'added' | 'title' | 'year'>('added');
  let watchlist = $derived(getWatchlist(sortBy));
</script>

<div class="max-w-6xl">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-bold text-white">Watchlist</h1>
    <div class="flex items-center gap-2">
      <span class="text-sm text-[#99AABB]">Sort by</span>
      <select
        bind:value={sortBy}
        class="bg-[#1B2028] border border-white/[0.06] rounded-[6px] px-3 h-9 text-white text-sm focus:outline-none focus:border-[#40BCF4] transition-colors cursor-pointer"
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
        <PosterCard
          src={entry.film.posterPath}
          alt={entry.film.title}
          title={entry.film.title}
          subtitle={entry.film.year?.toString()}
          href="/films/{entry.film.id}"
          status="watchlist"
        />
      {/each}
    </PosterGrid>
  {:else}
    <div class="flex flex-col items-center justify-center py-20 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2C3440" stroke-width="1.5" class="mb-4">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <p class="text-[#99AABB]">Your watchlist is empty.</p>
      <p class="text-[#667788] text-sm mt-1">Add films you want to watch later.</p>
    </div>
  {/if}
</div>
