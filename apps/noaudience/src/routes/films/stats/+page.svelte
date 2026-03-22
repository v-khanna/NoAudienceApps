<script lang="ts">
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import { getFilmStats } from '$lib/films/db';

  let stats = $state(getFilmStats());

  let maxRatingCount = $derived(Math.max(...stats.ratingDistribution.map((r) => r.count), 1));
  let maxGenreCount = $derived(Math.max(...stats.genreCounts.map((g) => g.count), 1));

  function formatRating(r: number): string {
    return r % 1 === 0 ? r.toString() : r.toFixed(1);
  }
</script>

<div class="max-w-4xl">
  <h1 class="text-4xl font-bold text-white mb-10 tracking-tight">Stats</h1>

  <!-- Overview cards -->
  <div class="grid grid-cols-3 gap-5 mb-14">
    <div class="stat-card bg-gradient-to-br from-[#1B2028] to-[#161A20] rounded-xl ring-1 ring-white/[0.04] p-7 text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-[#00E054]/[0.07] to-transparent pointer-events-none"></div>
      <div class="relative text-5xl font-bold text-[#00E054] tracking-tight">{stats.totalFilms}</div>
      <div class="relative text-xs text-[#667788] mt-3 uppercase tracking-widest font-medium">Films Watched</div>
    </div>
    <div class="stat-card bg-gradient-to-br from-[#1B2028] to-[#161A20] rounded-xl ring-1 ring-white/[0.04] p-7 text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-[#40BCF4]/[0.07] to-transparent pointer-events-none"></div>
      <div class="relative text-5xl font-bold text-[#40BCF4] tracking-tight">{stats.totalHours}</div>
      <div class="relative text-xs text-[#667788] mt-3 uppercase tracking-widest font-medium">Hours Watched</div>
    </div>
    <div class="stat-card bg-gradient-to-br from-[#1B2028] to-[#161A20] rounded-xl ring-1 ring-white/[0.04] p-7 text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-[#FFD700]/[0.07] to-transparent pointer-events-none"></div>
      <div class="relative text-5xl font-bold text-[#FFD700] tracking-tight">{stats.averageRating}</div>
      <div class="relative text-xs text-[#667788] mt-3 uppercase tracking-widest font-medium">Average Rating</div>
    </div>
  </div>

  <!-- Rating Distribution -->
  <section class="mb-14">
    <h2 class="text-xl font-semibold text-white mb-5 tracking-tight">Rating Distribution</h2>
    <div class="bg-gradient-to-b from-[#1B2028] to-[#181C22] rounded-xl ring-1 ring-white/[0.04] p-7">
      <div class="flex items-end gap-2.5 h-44">
        {#each stats.ratingDistribution as bucket}
          <div class="flex-1 flex flex-col items-center gap-2">
            <div class="w-full flex flex-col justify-end" style="height: 130px;">
              {#if bucket.count > 0}
                <div class="text-[10px] text-[#99AABB] text-center mb-1 font-medium">{bucket.count}</div>
                <div
                  class="w-full bg-gradient-to-t from-[#00E054] to-[#00E054]/70 rounded-t-[4px] bar-animate min-h-[6px]"
                  style="height: {(bucket.count / maxRatingCount) * 100}%"
                ></div>
              {:else}
                <div class="w-full bg-white/[0.04] rounded-t-[4px] h-1.5"></div>
              {/if}
            </div>
            <span class="text-[10px] text-[#667788] font-medium">{formatRating(bucket.rating)}</span>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Films by Genre -->
  <section class="mb-14">
    <h2 class="text-xl font-semibold text-white mb-5 tracking-tight">Films by Genre</h2>
    <div class="bg-gradient-to-b from-[#1B2028] to-[#181C22] rounded-xl ring-1 ring-white/[0.04] p-7 space-y-4">
      {#each stats.genreCounts as genre}
        <div class="flex items-center gap-4">
          <span class="w-28 text-sm text-[#99AABB] text-right flex-shrink-0 font-medium">{genre.genre}</span>
          <div class="flex-1 h-7 bg-white/[0.04] rounded-md overflow-hidden">
            <div
              class="h-full bg-gradient-to-r from-[#00E054] to-[#00E054]/60 rounded-md bar-animate flex items-center justify-end pr-2.5"
              style="width: {(genre.count / maxGenreCount) * 100}%"
            >
              <span class="text-xs font-semibold text-[#14181C]">{genre.count}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Top Directors -->
  <section class="mb-14">
    <h2 class="text-xl font-semibold text-white mb-5 tracking-tight">Top Directors</h2>
    <div class="bg-gradient-to-b from-[#1B2028] to-[#181C22] rounded-xl ring-1 ring-white/[0.04] overflow-hidden">
      {#each stats.topDirectors as dir, i}
        <div class="director-row flex items-center gap-4 px-6 py-4 {i < stats.topDirectors.length - 1 ? 'border-b border-white/[0.04]' : ''}">
          <span class="w-7 text-center text-sm font-bold text-[#2C3440]">{i + 1}</span>
          <span class="flex-1 text-white text-sm font-medium">{dir.director}</span>
          <span class="text-[#00E054] text-sm font-semibold">
            {dir.count} {dir.count === 1 ? 'film' : 'films'}
          </span>
        </div>
      {/each}
    </div>
  </section>
</div>

<style>
  .stat-card {
    transition: transform 0.25s ease-out, box-shadow 0.25s ease-out;
  }
  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
  }

  .bar-animate {
    transition: height 0.5s ease-out, width 0.5s ease-out;
  }

  .director-row {
    transition: background-color 0.2s ease-out;
  }
  .director-row:hover {
    background-color: rgba(255, 255, 255, 0.02);
  }
</style>
