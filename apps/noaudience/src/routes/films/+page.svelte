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

  function ratingAccentClass(rating: number): string {
    if (rating >= 4) return 'border-l-[#00E054]';
    if (rating >= 3) return 'border-l-[#FFD700]';
    if (rating >= 2) return 'border-l-[#FF8C00]';
    return 'border-l-[#99AABB]/30';
  }
</script>

<div class="max-w-6xl noise-overlay">
  <!-- Header -->
  <div class="flex items-center justify-between mb-10">
    <h1 class="text-4xl font-bold text-white tracking-tight">Films</h1>
    <div class="flex items-center gap-4">
      <div class="w-72">
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
  <section class="mb-14">
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-xl font-semibold text-white tracking-tight">Recently Watched</h2>
      <a href="/films/diary" class="text-sm text-[#40BCF4] hover:text-white transition-colors duration-200">View all</a>
    </div>
    <div class="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
      {#each recentLogs as entry}
        <div class="flex-shrink-0 w-[150px] group">
          <div class="poster-card-wrap transition-transform duration-300 ease-out group-hover:scale-[1.03]">
            <PosterCard
              src={entry.film.posterPath}
              alt={entry.film.title}
              title={entry.film.title}
              subtitle={entry.film.year?.toString()}
              rating={entry.rating}
              href="/films/{entry.film.id}"
              status="watched"
            />
          </div>
          <div class="mt-2">
            <StarRating value={entry.rating} size="sm" readonly={true} />
          </div>
        </div>
      {/each}
      {#if recentLogs.length === 0}
        <div class="flex flex-col items-center justify-center w-full py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2C3440" stroke-width="1.5" class="mb-3">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="2" y1="7" x2="7" y2="7" />
            <line x1="2" y1="17" x2="7" y2="17" />
            <line x1="17" y1="7" x2="22" y2="7" />
            <line x1="17" y1="17" x2="22" y2="17" />
          </svg>
          <p class="text-[#667788] text-sm">No films watched yet.</p>
        </div>
      {/if}
    </div>
  </section>

  <!-- Diary Preview -->
  <section class="mb-14">
    <div class="flex items-center justify-between mb-5">
      <h2 class="text-xl font-semibold text-white tracking-tight">Diary</h2>
      <a href="/films/diary" class="text-sm text-[#40BCF4] hover:text-white transition-colors duration-200">View all</a>
    </div>
    <div class="bg-gradient-to-b from-[#1B2028] to-[#181C22] rounded-xl ring-1 ring-white/[0.04] overflow-hidden">
      {#each diaryEntries as entry, i}
        <a
          href="/films/{entry.film.id}"
          class="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-all duration-200 ease-out border-l-2 {ratingAccentClass(entry.rating)} {i < diaryEntries.length - 1 ? 'border-b border-white/[0.04]' : ''}"
        >
          <!-- Date -->
          <div class="w-16 text-center flex-shrink-0">
            <div class="text-[10px] text-[#667788] uppercase tracking-wider">
              {new Date(entry.watchedDate).toLocaleDateString('en-US', { month: 'short' })}
            </div>
            <div class="text-xl font-bold text-white">
              {new Date(entry.watchedDate).getDate()}
            </div>
          </div>

          <!-- Poster thumbnail -->
          <img
            src={entry.film.posterPath}
            alt={entry.film.title}
            class="w-9 h-[54px] object-cover rounded-[3px] flex-shrink-0 ring-1 ring-white/[0.06]"
          />

          <!-- Title & year -->
          <div class="flex-1 min-w-0">
            <span class="text-white font-medium">{entry.film.title}</span>
            <span class="text-[#667788] ml-2 text-sm">{entry.film.year}</span>
          </div>

          <!-- Stars -->
          <div class="flex-shrink-0">
            <StarRating value={entry.rating} size="sm" readonly={true} />
          </div>

          <!-- Heart -->
          {#if entry.liked}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FF6B6B" stroke="#FF6B6B" stroke-width="2" class="flex-shrink-0">
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
      {#if diaryEntries.length === 0}
        <div class="flex flex-col items-center justify-center py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2C3440" stroke-width="1.5" class="mb-3">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p class="text-[#667788] text-sm">Your diary is waiting for its first entry.</p>
        </div>
      {/if}
    </div>
  </section>

  <!-- Stats Preview + Watchlist Preview -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
    <!-- Stats Preview -->
    <section>
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-xl font-semibold text-white tracking-tight">Stats</h2>
        <a href="/films/stats" class="text-sm text-[#40BCF4] hover:text-white transition-colors duration-200">View all</a>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <div class="stat-card bg-gradient-to-br from-[#1B2028] to-[#161A20] rounded-xl ring-1 ring-white/[0.04] p-5 text-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-[#00E054]/[0.06] to-transparent pointer-events-none"></div>
          <div class="relative text-3xl font-bold text-[#00E054] tracking-tight">{stats.totalFilms}</div>
          <div class="relative text-[10px] text-[#667788] mt-1.5 uppercase tracking-widest font-medium">Films</div>
        </div>
        <div class="stat-card bg-gradient-to-br from-[#1B2028] to-[#161A20] rounded-xl ring-1 ring-white/[0.04] p-5 text-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-[#40BCF4]/[0.06] to-transparent pointer-events-none"></div>
          <div class="relative text-3xl font-bold text-[#40BCF4] tracking-tight">{stats.totalHours}</div>
          <div class="relative text-[10px] text-[#667788] mt-1.5 uppercase tracking-widest font-medium">Hours</div>
        </div>
        <div class="stat-card bg-gradient-to-br from-[#1B2028] to-[#161A20] rounded-xl ring-1 ring-white/[0.04] p-5 text-center relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-[#FFD700]/[0.06] to-transparent pointer-events-none"></div>
          <div class="relative text-3xl font-bold text-[#FFD700] tracking-tight">{stats.averageRating}</div>
          <div class="relative text-[10px] text-[#667788] mt-1.5 uppercase tracking-widest font-medium">Avg Rating</div>
        </div>
      </div>
    </section>

    <!-- Watchlist Preview -->
    <section>
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-xl font-semibold text-white tracking-tight">Watchlist</h2>
        <a href="/films/watchlist" class="text-sm text-[#40BCF4] hover:text-white transition-colors duration-200">View all</a>
      </div>
      {#if watchlist.length > 0}
        <div class="grid grid-cols-4 gap-3">
          {#each watchlist as entry}
            <div class="group">
              <div class="poster-card-wrap transition-transform duration-300 ease-out group-hover:scale-[1.03]">
                <PosterCard
                  src={entry.film.posterPath}
                  alt={entry.film.title}
                  href="/films/{entry.film.id}"
                  status="watchlist"
                />
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center py-16 text-center bg-gradient-to-b from-[#1B2028] to-[#181C22] rounded-xl ring-1 ring-white/[0.04]">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2C3440" stroke-width="1.5" class="mb-3">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p class="text-[#667788] text-sm">Nothing on your watchlist yet.</p>
        </div>
      {/if}
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

  .stat-card {
    transition: transform 0.25s ease-out, box-shadow 0.25s ease-out;
  }
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .noise-overlay {
    position: relative;
  }
</style>
