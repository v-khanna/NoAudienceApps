<script lang="ts">
  import {
    getAllReadBooks,
    getTotalPagesRead,
    getAverageRating,
    getRatingDistribution,
    getGenreCounts,
    getAuthorCounts,
    getBooksReadPerYear,
  } from '$lib/books/db';

  let readBooks = $state(getAllReadBooks());
  let totalPages = $state(getTotalPagesRead());
  let averageRating = $state(getAverageRating());
  let ratingDist = $state(getRatingDistribution());
  let genreCounts = $state(getGenreCounts());
  let authorCounts = $state(getAuthorCounts());
  let booksPerYear = $state(getBooksReadPerYear());

  let maxRatingCount = $derived(Math.max(...Object.values(ratingDist), 1));
  let maxYearCount = $derived(Math.max(...booksPerYear.map((y) => y.count), 1));
  let maxGenreCount = $derived(genreCounts.length > 0 ? Math.max(...genreCounts.map((g) => g.count)) : 1);

  let longestBook = $derived.by(() => {
    if (readBooks.length === 0) return null;
    return readBooks.reduce((max, cur) =>
      cur.book.pageCount > max.book.pageCount ? cur : max
    );
  });

  let shortestBook = $derived.by(() => {
    if (readBooks.length === 0) return null;
    return readBooks.reduce((min, cur) =>
      cur.book.pageCount < min.book.pageCount ? cur : min
    );
  });
</script>

<div class="p-10 overflow-y-auto h-full space-y-10 max-w-5xl">
  <h1 class="text-2xl font-bold text-white tracking-tight">Reading Stats</h1>

  <!-- Summary cards -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
    <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-colors duration-200">
      <p class="text-[#99AABB] text-xs uppercase tracking-wider">Books Read</p>
      <p class="text-4xl font-bold text-white mt-2">{readBooks.length}</p>
    </div>
    <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-colors duration-200">
      <p class="text-[#99AABB] text-xs uppercase tracking-wider">Pages Read</p>
      <p class="text-4xl font-bold text-white mt-2">{totalPages.toLocaleString()}</p>
    </div>
    <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-amber-500/[0.08] rounded-2xl p-5 hover:border-amber-500/[0.15] transition-colors duration-200">
      <p class="text-[#99AABB] text-xs uppercase tracking-wider">Avg. Rating</p>
      <p class="text-4xl font-bold text-amber-400 mt-2">{averageRating.toFixed(1)}</p>
    </div>
    <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-colors duration-200">
      <p class="text-[#99AABB] text-xs uppercase tracking-wider">Authors</p>
      <p class="text-4xl font-bold text-white mt-2">{authorCounts.length}</p>
    </div>
  </div>

  <!-- Books per year (CSS bar chart) -->
  <section>
    <h2 class="text-white text-lg font-semibold mb-5">Books Read Per Year</h2>
    <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-2xl p-7">
      <div class="flex items-end gap-5 h-44">
        {#each booksPerYear as { year, count }}
          <div class="flex-1 flex flex-col items-center gap-2">
            <span class="text-white text-sm font-bold">{count}</span>
            <div class="w-full relative overflow-hidden rounded-t-lg" style="height: {(count / maxYearCount) * 100}%">
              <div class="absolute inset-0 bg-gradient-to-t from-[#00E054] to-[#40BCF4] rounded-t-lg"></div>
              <div class="absolute inset-0 bg-gradient-to-r from-white/[0.1] to-transparent rounded-t-lg"></div>
            </div>
            <span class="text-[#99AABB] text-xs font-medium">{year}</span>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Rating distribution -->
  <section>
    <h2 class="text-white text-lg font-semibold mb-5">Rating Distribution</h2>
    <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-2xl p-7">
      <div class="space-y-4">
        {#each [5, 4, 3, 2, 1] as star}
          <div class="flex items-center gap-4">
            <span class="text-amber-300/80 text-sm w-14 text-right font-medium">{star} star{star !== 1 ? 's' : ''}</span>
            <div class="flex-1 h-7 bg-white/[0.04] rounded-lg overflow-hidden">
              <div
                class="h-full rounded-lg bg-gradient-to-r from-amber-500/80 to-amber-400/60 transition-all duration-500 ease-out relative"
                style="width: {maxRatingCount > 0 ? (ratingDist[star] / maxRatingCount) * 100 : 0}%"
              >
                <div class="absolute inset-0 bg-gradient-to-t from-white/0 to-white/[0.15] rounded-lg"></div>
              </div>
            </div>
            <span class="text-white text-sm w-8 text-right font-semibold">{ratingDist[star]}</span>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Top genres -->
    <section>
      <h2 class="text-white text-lg font-semibold mb-5">Top Genres</h2>
      <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-2xl p-5">
        {#if genreCounts.length > 0}
          <div class="space-y-2.5">
            {#each genreCounts.slice(0, 8) as { genre, count }, i}
              <div class="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors duration-200 {i % 2 === 1 ? 'bg-white/[0.02]' : ''}">
                <div class="flex-1 flex items-center gap-3">
                  <span class="text-white text-sm capitalize font-medium">{genre}</span>
                </div>
                <div class="w-24 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-[#00E054] to-[#40BCF4] transition-all duration-500"
                    style="width: {(count / maxGenreCount) * 100}%"
                  ></div>
                </div>
                <span class="text-[#99AABB] text-sm w-6 text-right">{count}</span>
              </div>
            {/each}
          </div>
        {:else}
          <div class="py-8 text-center">
            <p class="text-[#99AABB] text-sm">No data yet.</p>
          </div>
        {/if}
      </div>
    </section>

    <!-- Most-read authors -->
    <section>
      <h2 class="text-white text-lg font-semibold mb-5">Most-Read Authors</h2>
      <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-2xl p-5">
        {#if authorCounts.length > 0}
          <div class="space-y-2.5">
            {#each authorCounts.slice(0, 8) as { author, count }, i}
              <div class="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/[0.03] transition-colors duration-200 {i % 2 === 1 ? 'bg-white/[0.02]' : ''}">
                <span class="text-white text-sm font-medium">{author}</span>
                <span class="text-[#99AABB] text-sm bg-white/[0.06] px-2.5 py-0.5 rounded-full">{count} book{count !== 1 ? 's' : ''}</span>
              </div>
            {/each}
          </div>
        {:else}
          <div class="py-8 text-center">
            <p class="text-[#99AABB] text-sm">No data yet.</p>
          </div>
        {/if}
      </div>
    </section>
  </div>

  <!-- Longest / Shortest -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    {#if longestBook}
      <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-colors duration-200">
        <p class="text-[#99AABB] text-xs uppercase tracking-wider mb-3">Longest Book</p>
        <div class="flex items-center gap-4">
          <img
            src={longestBook.book.coverPath}
            alt={longestBook.book.title}
            class="w-12 h-[72px] object-cover rounded-lg shadow-[4px_4px_12px_rgba(0,0,0,0.5)]"
            loading="lazy"
          />
          <div>
            <p class="text-white font-semibold font-serif">{longestBook.book.title}</p>
            <p class="text-amber-400/70 text-sm mt-0.5">{longestBook.book.pageCount} pages</p>
          </div>
        </div>
      </div>
    {/if}
    {#if shortestBook}
      <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-colors duration-200">
        <p class="text-[#99AABB] text-xs uppercase tracking-wider mb-3">Shortest Book</p>
        <div class="flex items-center gap-4">
          <img
            src={shortestBook.book.coverPath}
            alt={shortestBook.book.title}
            class="w-12 h-[72px] object-cover rounded-lg shadow-[4px_4px_12px_rgba(0,0,0,0.5)]"
            loading="lazy"
          />
          <div>
            <p class="text-white font-semibold font-serif">{shortestBook.book.title}</p>
            <p class="text-amber-400/70 text-sm mt-0.5">{shortestBook.book.pageCount} pages</p>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
