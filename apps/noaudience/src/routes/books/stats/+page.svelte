<script lang="ts">
  import { onMount } from 'svelte';
  import {
    getAllReadBooks,
    getTotalPagesRead,
    getAverageRating,
    getRatingDistribution,
    getGenreCounts,
    getAuthorCounts,
    getBooksReadPerYear,
  } from '$lib/books/db';
  import type { Book, BookReview } from '$lib/books/mock';

  let readBooks = $state<Array<{ book: Book; review: BookReview | undefined; dateRead: string }>>([]);
  let totalPages = $state(0);
  let averageRating = $state(0);
  let ratingDist = $state<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  let genreCounts = $state<Array<{ genre: string; count: number }>>([]);
  let authorCounts = $state<Array<{ author: string; count: number }>>([]);
  let booksPerYear = $state<Array<{ year: number; count: number }>>([]);
  let loaded = $state(false);

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

  onMount(async () => {
    try {
      const [rb, tp, ar, rd, gc, ac, bpy] = await Promise.all([
        getAllReadBooks(),
        getTotalPagesRead(),
        getAverageRating(),
        getRatingDistribution(),
        getGenreCounts(),
        getAuthorCounts(),
        getBooksReadPerYear(),
      ]);
      readBooks = rb;
      totalPages = tp;
      averageRating = ar;
      ratingDist = rd;
      genreCounts = gc;
      authorCounts = ac;
      booksPerYear = bpy;
    } catch (e: any) {
      console.error('Failed to load book stats:', e);
    } finally {
      loaded = true;
    }
  });
</script>

{#if loaded}
<main style="padding-bottom: 64px;">
  <h1 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.75rem; font-weight: 500; color: var(--text-primary); margin: 0 0 8px;">Archival Analytics</h1>
  <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 40px;">{readBooks.length} books · {totalPages.toLocaleString()} pages · {averageRating.toFixed(1)} avg</p>

  <!-- Milestone card -->
  <div style="background: var(--surface-container-low); border-radius: 10px; padding: 32px; margin-bottom: 40px; position: relative; overflow: hidden;">
    <p style="font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin: 0 0 8px;">Total Pages Read</p>
    <span style="font-family: 'Newsreader', Georgia, serif; font-size: 3.5rem; color: var(--text-primary);">{totalPages.toLocaleString()}</span>
    <div style="position: absolute; right: -24px; bottom: -24px; width: 200px; height: 200px; background: rgba(0,224,84,0.04); border-radius: 50%; filter: blur(40px); pointer-events: none;"></div>
  </div>

  <!-- Stats grid -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px;">
    <!-- Rating distribution -->
    <div style="background: var(--surface-container-low); border-radius: 10px; padding: 24px;">
      <h2 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.125rem; font-weight: 500; color: var(--text-primary); margin: 0 0 16px;">Ratings</h2>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        {#each [5, 4, 3, 2, 1] as star}
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 12px; color: var(--text-muted); width: 44px; text-align: right; flex-shrink: 0;">{star}★</span>
            <div style="flex: 1; height: 4px; background: var(--surface-container-high); border-radius: 999px; overflow: hidden;">
              <div style="height: 100%; width: {maxRatingCount > 0 ? (ratingDist[star] / maxRatingCount) * 100 : 0}%; background: var(--accent); border-radius: 999px;"></div>
            </div>
            <span style="font-size: 12px; color: var(--text-muted); width: 20px; flex-shrink: 0;">{ratingDist[star]}</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Genres -->
    {#if genreCounts.length > 0}
      <div style="background: var(--surface-container-low); border-radius: 10px; padding: 24px;">
        <h2 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.125rem; font-weight: 500; color: var(--text-primary); margin: 0 0 16px;">Genre Distribution</h2>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          {#each genreCounts.slice(0, 6) as { genre, count }}
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 13px; color: var(--text-primary); flex: 1; text-transform: capitalize;">{genre}</span>
              <div style="width: 100px; height: 4px; background: var(--surface-container-high); border-radius: 999px; overflow: hidden;">
                <div style="height: 100%; width: {(count / maxGenreCount) * 100}%; background: var(--accent); border-radius: 999px;"></div>
              </div>
              <span style="font-size: 12px; color: var(--text-muted); width: 20px; text-align: right;">{count}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 40px;">
    <!-- Authors -->
    {#if authorCounts.length > 0}
      <div style="background: var(--surface-container-low); border-radius: 10px; padding: 24px;">
        <h2 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.125rem; font-weight: 500; color: var(--text-primary); margin: 0 0 16px;">Frequent Contributors</h2>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          {#each authorCounts.slice(0, 6) as { author, count }, i}
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 12px; color: var(--text-muted); width: 16px;">{i + 1}</span>
              <span style="font-size: 13px; color: var(--text-primary); flex: 1;">{author}</span>
              <span style="font-size: 12px; color: var(--accent); font-weight: 600;">{count}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Extremes + Per Year -->
    <div style="display: flex; flex-direction: column; gap: 24px;">
      {#if longestBook || shortestBook}
        <div style="background: var(--surface-container-low); border-radius: 10px; padding: 24px;">
          <h2 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.125rem; font-weight: 500; color: var(--text-primary); margin: 0 0 16px;">Extremes</h2>
          {#if longestBook}
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="font-size: 12px; color: var(--text-muted); width: 56px;">Longest</span>
              <a href="/books/{longestBook.book.id}" class="title-link" style="font-size: 13px; color: var(--text-primary); text-decoration: none; flex: 1;">{longestBook.book.title}</a>
              <span style="font-size: 12px; color: var(--accent);">{longestBook.book.pageCount}p</span>
            </div>
          {/if}
          {#if shortestBook}
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12px; color: var(--text-muted); width: 56px;">Shortest</span>
              <a href="/books/{shortestBook.book.id}" class="title-link" style="font-size: 13px; color: var(--text-primary); text-decoration: none; flex: 1;">{shortestBook.book.title}</a>
              <span style="font-size: 12px; color: var(--accent);">{shortestBook.book.pageCount}p</span>
            </div>
          {/if}
        </div>
      {/if}

      {#if booksPerYear.length > 0}
        <div style="background: var(--surface-container-low); border-radius: 10px; padding: 24px;">
          <h2 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.125rem; font-weight: 500; color: var(--text-primary); margin: 0 0 16px;">By Year</h2>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            {#each booksPerYear as { year, count }}
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 12px; color: var(--text-muted); width: 32px;">{year}</span>
                <div style="flex: 1; height: 4px; background: var(--surface-container-high); border-radius: 999px; overflow: hidden;">
                  <div style="height: 100%; width: {(count / maxYearCount) * 100}%; background: var(--accent); border-radius: 999px;"></div>
                </div>
                <span style="font-size: 12px; color: var(--text-muted); width: 20px; text-align: right;">{count}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</main>
{/if}

<style>
  .title-link:hover {
    color: var(--accent) !important;
  }
</style>
