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

<div class="p-8 overflow-y-auto h-full space-y-8 max-w-5xl">
  <h1 class="text-2xl font-bold text-white">Reading Stats</h1>

  <!-- Summary cards -->
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div class="bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-4">
      <p class="text-[#99AABB] text-xs uppercase tracking-wider">Books Read</p>
      <p class="text-3xl font-bold text-white mt-1">{readBooks.length}</p>
    </div>
    <div class="bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-4">
      <p class="text-[#99AABB] text-xs uppercase tracking-wider">Pages Read</p>
      <p class="text-3xl font-bold text-white mt-1">{totalPages.toLocaleString()}</p>
    </div>
    <div class="bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-4">
      <p class="text-[#99AABB] text-xs uppercase tracking-wider">Avg. Rating</p>
      <p class="text-3xl font-bold text-[#00E054] mt-1">{averageRating.toFixed(1)}</p>
    </div>
    <div class="bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-4">
      <p class="text-[#99AABB] text-xs uppercase tracking-wider">Authors</p>
      <p class="text-3xl font-bold text-white mt-1">{authorCounts.length}</p>
    </div>
  </div>

  <!-- Books per year (CSS bar chart) -->
  <section>
    <h2 class="text-white text-lg font-semibold mb-4">Books Read Per Year</h2>
    <div class="bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-6">
      <div class="flex items-end gap-4 h-40">
        {#each booksPerYear as { year, count }}
          <div class="flex-1 flex flex-col items-center gap-2">
            <span class="text-white text-sm font-semibold">{count}</span>
            <div
              class="w-full bg-[#00E054] rounded-t-[4px] transition-all duration-300"
              style="height: {(count / maxYearCount) * 100}%"
            ></div>
            <span class="text-[#99AABB] text-xs">{year}</span>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Rating distribution -->
  <section>
    <h2 class="text-white text-lg font-semibold mb-4">Rating Distribution</h2>
    <div class="bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-6">
      <div class="space-y-3">
        {#each [5, 4, 3, 2, 1] as star}
          <div class="flex items-center gap-3">
            <span class="text-[#99AABB] text-sm w-12 text-right">{star} star{star !== 1 ? 's' : ''}</span>
            <div class="flex-1 h-6 bg-white/[0.04] rounded-[4px] overflow-hidden">
              <div
                class="h-full bg-[#00E054] rounded-[4px] transition-all duration-300"
                style="width: {(ratingDist[star] / maxRatingCount) * 100}%"
              ></div>
            </div>
            <span class="text-white text-sm w-6 text-right">{ratingDist[star]}</span>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Top genres -->
    <section>
      <h2 class="text-white text-lg font-semibold mb-4">Top Genres</h2>
      <div class="bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-4">
        {#if genreCounts.length > 0}
          <div class="space-y-2">
            {#each genreCounts.slice(0, 8) as { genre, count }}
              <div class="flex items-center justify-between px-2 py-1.5">
                <span class="text-white text-sm capitalize">{genre}</span>
                <span class="text-[#99AABB] text-sm">{count}</span>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-[#99AABB] text-sm text-center py-4">No data yet.</p>
        {/if}
      </div>
    </section>

    <!-- Most-read authors -->
    <section>
      <h2 class="text-white text-lg font-semibold mb-4">Most-Read Authors</h2>
      <div class="bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-4">
        {#if authorCounts.length > 0}
          <div class="space-y-2">
            {#each authorCounts.slice(0, 8) as { author, count }}
              <div class="flex items-center justify-between px-2 py-1.5">
                <span class="text-white text-sm">{author}</span>
                <span class="text-[#99AABB] text-sm">{count} book{count !== 1 ? 's' : ''}</span>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-[#99AABB] text-sm text-center py-4">No data yet.</p>
        {/if}
      </div>
    </section>
  </div>

  <!-- Longest / Shortest -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    {#if longestBook}
      <div class="bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-4">
        <p class="text-[#99AABB] text-xs uppercase tracking-wider mb-2">Longest Book</p>
        <div class="flex items-center gap-3">
          <img
            src={longestBook.book.coverPath}
            alt={longestBook.book.title}
            class="w-10 h-[60px] object-cover rounded-[4px]"
            loading="lazy"
          />
          <div>
            <p class="text-white font-medium">{longestBook.book.title}</p>
            <p class="text-[#99AABB] text-sm">{longestBook.book.pageCount} pages</p>
          </div>
        </div>
      </div>
    {/if}
    {#if shortestBook}
      <div class="bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-4">
        <p class="text-[#99AABB] text-xs uppercase tracking-wider mb-2">Shortest Book</p>
        <div class="flex items-center gap-3">
          <img
            src={shortestBook.book.coverPath}
            alt={shortestBook.book.title}
            class="w-10 h-[60px] object-cover rounded-[4px]"
            loading="lazy"
          />
          <div>
            <p class="text-white font-medium">{shortestBook.book.title}</p>
            <p class="text-[#99AABB] text-sm">{shortestBook.book.pageCount} pages</p>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
