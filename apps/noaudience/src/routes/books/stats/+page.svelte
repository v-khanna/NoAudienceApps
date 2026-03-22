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

<div style="max-width: 640px;">
  <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px 0;">Reading Stats</h1>

  <!-- Inline summary -->
  <p style="font-size: 12px; color: var(--text-secondary); margin: 0 0 24px 0;">
    {readBooks.length} books read &middot; {totalPages.toLocaleString()} pages &middot; {averageRating.toFixed(1)} avg rating &middot; {authorCounts.length} authors
  </p>

  <!-- Books per year -->
  {#if booksPerYear.length > 0}
    <section style="margin-bottom: 24px;">
      <h2 style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0 0 10px 0;">By Year</h2>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        {#each booksPerYear as { year, count }}
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; color: var(--text-tertiary); width: 36px; text-align: right; flex-shrink: 0;">{year}</span>
            <div style="flex: 1; height: 6px; background: var(--border); border-radius: 2px; overflow: hidden;">
              <div style="height: 100%; width: {(count / maxYearCount) * 100}%; background: var(--accent); border-radius: 2px;"></div>
            </div>
            <span style="font-size: 11px; color: var(--text-secondary); width: 20px; flex-shrink: 0;">{count}</span>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Rating distribution -->
  <section style="margin-bottom: 24px;">
    <h2 style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0 0 10px 0;">Ratings</h2>
    <div style="display: flex; flex-direction: column; gap: 4px;">
      {#each [5, 4, 3, 2, 1] as star}
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 11px; color: var(--text-tertiary); width: 36px; text-align: right; flex-shrink: 0;">{star} star{star !== 1 ? 's' : ''}</span>
          <div style="flex: 1; height: 6px; background: var(--border); border-radius: 2px; overflow: hidden;">
            <div style="height: 100%; width: {maxRatingCount > 0 ? (ratingDist[star] / maxRatingCount) * 100 : 0}%; background: var(--accent); border-radius: 2px;"></div>
          </div>
          <span style="font-size: 11px; color: var(--text-secondary); width: 20px; flex-shrink: 0;">{ratingDist[star]}</span>
        </div>
      {/each}
    </div>
  </section>

  <!-- Top genres -->
  {#if genreCounts.length > 0}
    <section style="margin-bottom: 24px;">
      <h2 style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0 0 10px 0;">Top Genres</h2>
      <div style="display: flex; flex-direction: column; gap: 2px;">
        {#each genreCounts.slice(0, 8) as { genre, count }}
          <div class="list-row" style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 4px; transition: background 150ms ease-out;">
            <span style="font-size: 12px; color: var(--text-primary); text-transform: capitalize;">{genre}</span>
            <span style="font-size: 11px; color: var(--text-tertiary);">{count}</span>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Most-read authors -->
  {#if authorCounts.length > 0}
    <section style="margin-bottom: 24px;">
      <h2 style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0 0 10px 0;">Most-Read Authors</h2>
      <div style="display: flex; flex-direction: column; gap: 2px;">
        {#each authorCounts.slice(0, 8) as { author, count }}
          <div class="list-row" style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 4px; transition: background 150ms ease-out;">
            <span style="font-size: 12px; color: var(--text-primary);">{author}</span>
            <span style="font-size: 11px; color: var(--text-tertiary);">{count} book{count !== 1 ? 's' : ''}</span>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Longest / Shortest -->
  {#if longestBook || shortestBook}
    <section style="margin-bottom: 24px;">
      <h2 style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0 0 10px 0;">Extremes</h2>
      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px;">
        {#if longestBook}
          <div style="display: flex; align-items: center; gap: 8px; padding: 4px 8px;">
            <span style="color: var(--text-tertiary); width: 56px; flex-shrink: 0;">Longest</span>
            <a href="/books/{longestBook.book.id}" style="color: var(--text-primary); text-decoration: none;" class="title-link">{longestBook.book.title}</a>
            <span style="color: var(--text-tertiary); margin-left: auto; flex-shrink: 0;">{longestBook.book.pageCount}p</span>
          </div>
        {/if}
        {#if shortestBook}
          <div style="display: flex; align-items: center; gap: 8px; padding: 4px 8px;">
            <span style="color: var(--text-tertiary); width: 56px; flex-shrink: 0;">Shortest</span>
            <a href="/books/{shortestBook.book.id}" style="color: var(--text-primary); text-decoration: none;" class="title-link">{shortestBook.book.title}</a>
            <span style="color: var(--text-tertiary); margin-left: auto; flex-shrink: 0;">{shortestBook.book.pageCount}p</span>
          </div>
        {/if}
      </div>
    </section>
  {/if}
</div>

<style>
  .list-row:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .title-link:hover {
    color: var(--accent);
  }
</style>
