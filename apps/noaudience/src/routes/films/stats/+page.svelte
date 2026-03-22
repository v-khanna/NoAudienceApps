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
  <h1 class="text-3xl font-bold text-white mb-8">Stats</h1>

  <!-- Overview cards -->
  <div class="grid grid-cols-3 gap-4 mb-10">
    <div class="bg-[#1B2028] rounded-[8px] border border-white/[0.06] p-6 text-center">
      <div class="text-4xl font-bold text-[#00E054]">{stats.totalFilms}</div>
      <div class="text-sm text-[#99AABB] mt-2 uppercase tracking-wider">Films Watched</div>
    </div>
    <div class="bg-[#1B2028] rounded-[8px] border border-white/[0.06] p-6 text-center">
      <div class="text-4xl font-bold text-[#40BCF4]">{stats.totalHours}</div>
      <div class="text-sm text-[#99AABB] mt-2 uppercase tracking-wider">Hours Watched</div>
    </div>
    <div class="bg-[#1B2028] rounded-[8px] border border-white/[0.06] p-6 text-center">
      <div class="text-4xl font-bold text-[#FF8000]">{stats.averageRating}</div>
      <div class="text-sm text-[#99AABB] mt-2 uppercase tracking-wider">Average Rating</div>
    </div>
  </div>

  <!-- Rating Distribution -->
  <section class="mb-10">
    <h2 class="text-lg font-semibold text-white mb-4">Rating Distribution</h2>
    <div class="bg-[#1B2028] rounded-[8px] border border-white/[0.06] p-6">
      <div class="flex items-end gap-2 h-40">
        {#each stats.ratingDistribution as bucket}
          <div class="flex-1 flex flex-col items-center gap-2">
            <div class="w-full flex flex-col justify-end" style="height: 120px;">
              {#if bucket.count > 0}
                <div
                  class="w-full bg-[#00E054] rounded-t-[3px] transition-all duration-300 min-h-[4px]"
                  style="height: {(bucket.count / maxRatingCount) * 100}%"
                ></div>
              {:else}
                <div class="w-full bg-white/[0.04] rounded-t-[3px] h-1"></div>
              {/if}
            </div>
            <span class="text-[10px] text-[#99AABB]">{formatRating(bucket.rating)}</span>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Films by Genre -->
  <section class="mb-10">
    <h2 class="text-lg font-semibold text-white mb-4">Films by Genre</h2>
    <div class="bg-[#1B2028] rounded-[8px] border border-white/[0.06] p-6 space-y-3">
      {#each stats.genreCounts as genre}
        <div class="flex items-center gap-4">
          <span class="w-28 text-sm text-[#99AABB] text-right flex-shrink-0">{genre.genre}</span>
          <div class="flex-1 h-6 bg-white/[0.04] rounded-[3px] overflow-hidden">
            <div
              class="h-full bg-[#00E054] rounded-[3px] transition-all duration-300 flex items-center justify-end pr-2"
              style="width: {(genre.count / maxGenreCount) * 100}%"
            >
              <span class="text-xs font-medium text-[#14181C]">{genre.count}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Top Directors -->
  <section class="mb-10">
    <h2 class="text-lg font-semibold text-white mb-4">Top Directors</h2>
    <div class="bg-[#1B2028] rounded-[8px] border border-white/[0.06] overflow-hidden">
      {#each stats.topDirectors as dir, i}
        <div class="flex items-center gap-4 px-5 py-3 {i < stats.topDirectors.length - 1 ? 'border-b border-white/[0.04]' : ''}">
          <span class="w-6 text-center text-sm font-bold text-[#2C3440]">{i + 1}</span>
          <span class="flex-1 text-white text-sm">{dir.director}</span>
          <span class="text-[#00E054] text-sm font-medium">
            {dir.count} {dir.count === 1 ? 'film' : 'films'}
          </span>
        </div>
      {/each}
    </div>
  </section>
</div>
