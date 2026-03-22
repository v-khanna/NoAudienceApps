<script lang="ts">
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import { getRecentLogs } from '$lib/films/db';
  import type { Film } from '$lib/films/mock';

  interface LogWithFilm {
    id: number;
    filmId: number;
    watchedDate: string;
    rating: number;
    liked: boolean;
    rewatch: boolean;
    review: string;
    tags: string[];
    createdAt: string;
    film: Film;
  }

  let logs = $state(getRecentLogs(50));

  // Group logs by month
  let groupedLogs = $derived(() => {
    const groups: { label: string; entries: LogWithFilm[] }[] = [];
    const monthMap = new Map<string, LogWithFilm[]>();

    for (const log of logs) {
      const date = new Date(log.watchedDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (!monthMap.has(key)) {
        monthMap.set(key, []);
        groups.push({ label, entries: monthMap.get(key)! });
      }
      monthMap.get(key)!.push(log as LogWithFilm);
    }

    return groups;
  });

  function ratingAccentClass(rating: number): string {
    if (rating >= 4) return 'border-l-[#00E054]';
    if (rating >= 3) return 'border-l-[#FFD700]';
    if (rating >= 2) return 'border-l-[#FF8C00]';
    return 'border-l-[#99AABB]/20';
  }
</script>

<div class="max-w-4xl">
  <h1 class="text-4xl font-bold text-white mb-10 tracking-tight">Diary</h1>

  {#each groupedLogs() as group}
    <section class="mb-10">
      <h2 class="text-xs font-semibold text-[#667788] uppercase tracking-widest mb-4">{group.label}</h2>
      <div class="bg-gradient-to-b from-[#1B2028] to-[#181C22] rounded-xl ring-1 ring-white/[0.04] overflow-hidden">
        {#each group.entries as entry, i}
          <a
            href="/films/{entry.film.id}"
            class="diary-row flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-all duration-200 ease-out border-l-2 {ratingAccentClass(entry.rating)} {i < group.entries.length - 1 ? 'border-b border-white/[0.04]' : ''}"
          >
            <!-- Date -->
            <div class="w-12 text-center flex-shrink-0">
              <div class="text-xl font-bold text-white">
                {new Date(entry.watchedDate).getDate()}
              </div>
              <div class="text-[10px] text-[#667788] uppercase tracking-wider">
                {new Date(entry.watchedDate).toLocaleDateString('en-US', { weekday: 'short' })}
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
      </div>
    </section>
  {/each}

  {#if logs.length === 0}
    <div class="flex flex-col items-center justify-center py-24 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#2C3440" stroke-width="1" class="mb-5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <p class="text-[#99AABB] text-lg font-medium">No diary entries yet</p>
      <p class="text-[#667788] text-sm mt-2 max-w-xs">Start logging films to build your personal viewing history.</p>
    </div>
  {/if}
</div>

<style>
  .diary-row {
    transition: background-color 0.2s ease-out, transform 0.2s ease-out;
  }
  .diary-row:hover {
    transform: translateX(2px);
  }
</style>
