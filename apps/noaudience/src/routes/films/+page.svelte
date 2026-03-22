<script lang="ts">
  import SearchBar from '@noaudience/core/components/SearchBar.svelte';
  import Button from '@noaudience/core/components/Button.svelte';
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import PosterGrid from '@noaudience/core/components/PosterGrid.svelte';
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

<div class="max-w-6xl">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-bold text-white">Films</h1>
    <div class="flex items-center gap-3">
      <div class="w-64">
        <SearchBar bind:value={searchQuery} placeholder="Search films..." />
      </div>
      <Button variant="primary" onclick={() => logModalOpen = true}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Log
      </Button>
    </div>
  </div>

  <!-- Recently Watched -->
  <section class="mb-10">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-white">Recently Watched</h2>
      <a href="/films/diary" class="text-sm text-[#40BCF4] hover:text-white transition-colors">View all</a>
    </div>
    <div class="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {#each recentLogs as entry}
        <div class="flex-shrink-0 w-[150px]">
          <PosterCard
            src={entry.film.posterPath}
            alt={entry.film.title}
            title={entry.film.title}
            subtitle={entry.film.year?.toString()}
            rating={entry.rating}
            href="/films/{entry.film.id}"
            status="watched"
          />
          <div class="mt-1.5">
            <StarRating value={entry.rating} size="sm" readonly={true} />
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Diary Preview -->
  <section class="mb-10">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-white">Diary</h2>
      <a href="/films/diary" class="text-sm text-[#40BCF4] hover:text-white transition-colors">View all</a>
    </div>
    <div class="bg-[#1B2028] rounded-[8px] border border-white/[0.06] overflow-hidden">
      {#each diaryEntries as entry, i}
        <a
          href="/films/{entry.film.id}"
          class="flex items-center gap-4 px-4 py-3 hover:bg-[#2C3440] transition-colors {i < diaryEntries.length - 1 ? 'border-b border-white/[0.04]' : ''}"
        >
          <!-- Date -->
          <div class="w-16 text-center flex-shrink-0">
            <div class="text-xs text-[#99AABB] uppercase">
              {new Date(entry.watchedDate).toLocaleDateString('en-US', { month: 'short' })}
            </div>
            <div class="text-lg font-bold text-white">
              {new Date(entry.watchedDate).getDate()}
            </div>
          </div>

          <!-- Poster thumbnail -->
          <img
            src={entry.film.posterPath}
            alt={entry.film.title}
            class="w-8 h-12 object-cover rounded-[2px] flex-shrink-0"
          />

          <!-- Title & year -->
          <div class="flex-1 min-w-0">
            <span class="text-white font-medium">{entry.film.title}</span>
            <span class="text-[#99AABB] ml-1.5 text-sm">{entry.film.year}</span>
          </div>

          <!-- Stars -->
          <div class="flex-shrink-0">
            <StarRating value={entry.rating} size="sm" readonly={true} />
          </div>

          <!-- Heart -->
          {#if entry.liked}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FF8000" stroke="#FF8000" stroke-width="2" class="flex-shrink-0">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          {/if}

          <!-- Rewatch -->
          {#if entry.rewatch}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#40BCF4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0">
              <polyline points="1 4 1 10 7 10" />
              <polyline points="23 20 23 14 17 14" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          {/if}
        </a>
      {/each}
    </div>
  </section>

  <!-- Stats Preview + Watchlist Preview -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <!-- Stats Preview -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white">Stats</h2>
        <a href="/films/stats" class="text-sm text-[#40BCF4] hover:text-white transition-colors">View all</a>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-[#1B2028] rounded-[8px] border border-white/[0.06] p-4 text-center">
          <div class="text-3xl font-bold text-[#00E054]">{stats.totalFilms}</div>
          <div class="text-xs text-[#99AABB] mt-1 uppercase tracking-wider">Films</div>
        </div>
        <div class="bg-[#1B2028] rounded-[8px] border border-white/[0.06] p-4 text-center">
          <div class="text-3xl font-bold text-[#40BCF4]">{stats.totalHours}</div>
          <div class="text-xs text-[#99AABB] mt-1 uppercase tracking-wider">Hours</div>
        </div>
        <div class="bg-[#1B2028] rounded-[8px] border border-white/[0.06] p-4 text-center">
          <div class="text-3xl font-bold text-[#FF8000]">{stats.averageRating}</div>
          <div class="text-xs text-[#99AABB] mt-1 uppercase tracking-wider">Avg Rating</div>
        </div>
      </div>
    </section>

    <!-- Watchlist Preview -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white">Watchlist</h2>
        <a href="/films/watchlist" class="text-sm text-[#40BCF4] hover:text-white transition-colors">View all</a>
      </div>
      <div class="grid grid-cols-4 gap-3">
        {#each watchlist as entry}
          <PosterCard
            src={entry.film.posterPath}
            alt={entry.film.title}
            href="/films/{entry.film.id}"
            status="watchlist"
          />
        {/each}
      </div>
    </section>
  </div>
</div>

<LogModal
  bind:open={logModalOpen}
  onclose={() => logModalOpen = false}
  onsave={refreshData}
/>

<style>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
