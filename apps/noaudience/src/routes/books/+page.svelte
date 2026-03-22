<script lang="ts">
  import { onMount } from 'svelte';
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import {
    getCurrentlyReading,
    getRecentlyRead,
    getWantToRead,
    getChallenge,
    getBooksReadInYear,
  } from '$lib/books/db';
  import AddBookModal from '$lib/books/AddBookModal.svelte';
  import type { Book, BookProgressEntry, BookReview, ReadingChallenge } from '$lib/books/mock';

  let addModalOpen = $state(false);

  let searchQuery = $state('');
  let currentlyReading = $state<Array<Book & { latestProgress: BookProgressEntry | undefined }>>([]);
  let recentlyRead = $state<Array<Book & { review: BookReview | undefined }>>([]);
  let wantToRead = $state<Book[]>([]);
  let challenge = $state<ReadingChallenge | undefined>(undefined);
  let booksReadThisYear = $state<Book[]>([]);
  let loaded = $state(false);

  let challengePct = $derived(
    challenge ? Math.round((booksReadThisYear.length / challenge.goal) * 100) : 0
  );

  onMount(async () => {
    try {
      const [cr, rr, wtr, ch, bry] = await Promise.all([
        getCurrentlyReading(),
        getRecentlyRead(8),
        getWantToRead(),
        getChallenge(2026),
        getBooksReadInYear(2026),
      ]);
      currentlyReading = cr;
      recentlyRead = rr;
      wantToRead = wtr;
      challenge = ch;
      booksReadThisYear = bry;
    } catch (e: any) {
      console.error('Failed to load books data:', e);
    } finally {
      loaded = true;
    }
  });
</script>

{#if loaded}
<div>
  <!-- Header -->
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
    <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0;">Books</h1>
    <button
      onclick={() => addModalOpen = true}
      style="
        height: 40px;
        padding: 0 16px;
        font-size: 15px;
        font-weight: 500;
        color: #000;
        background: var(--accent);
        border: none;
        border-radius: 6px;
        cursor: pointer;
      "
    >
      + Add Book
    </button>
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search books..."
      style="
        height: 40px;
        padding: 0 12px;
        font-size: 15px;
        background: var(--bg-inset);
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--text-primary);
        outline: none;
        width: 200px;
      "
    />
    <div style="flex: 1;"></div>
    {#if challenge}
      <span style="font-size: 15px; color: var(--text-secondary); display: flex; align-items: center; gap: 8px;">
        {booksReadThisYear.length} of {challenge.goal} books
        <span style="display: inline-block; width: 60px; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
          <span style="display: block; height: 100%; width: {Math.min(challengePct, 100)}%; background: var(--accent); border-radius: 4px;"></span>
        </span>
        <a href="/books/challenge" style="font-size: 13px; color: var(--text-tertiary); text-decoration: none;" class="section-link">Challenge</a>
      </span>
    {/if}
  </div>

  <!-- Currently Reading -->
  {#if currentlyReading.length > 0}
    <section style="margin-bottom: 48px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0;">Currently Reading</h2>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        {#each currentlyReading as book}
          {@const progressPercent = book.latestProgress && book.pageCount
            ? Math.round((book.latestProgress.progressValue / book.pageCount) * 100)
            : 0}
          <a href="/books/{book.id}" class="reading-row" style="display: flex; align-items: center; gap: 16px; text-decoration: none; padding: 12px; border: 1px solid var(--border); border-radius: 6px; transition: background 150ms ease-out;">
            <img
              src={book.coverPath}
              alt={book.title}
              style="width: 80px; height: auto; object-fit: cover; border-radius: 4px; flex-shrink: 0;"
              loading="lazy"
            />
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 15px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{book.title}</div>
              <div style="font-size: 15px; color: var(--text-secondary); margin-top: 4px;">{book.author}</div>
              <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
                <div style="flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
                  <div style="height: 100%; width: {progressPercent}%; background: var(--accent); border-radius: 4px;"></div>
                </div>
                <span style="font-size: 13px; color: var(--text-secondary); flex-shrink: 0;">{progressPercent}%</span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Recently Read -->
  {#if recentlyRead.length > 0}
    <section style="margin-bottom: 48px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
        <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0;">Recently Read</h2>
        <a href="/books/library" style="font-size: 13px; color: var(--text-tertiary); text-decoration: none;" class="section-link">View all</a>
      </div>
      <div class="poster-grid">
        {#each recentlyRead as book}
          <a href="/books/{book.id}" class="poster-item" title={book.title}>
            <PosterCard
              src={book.coverPath}
              alt={book.title}
              href="/books/{book.id}"
              status="watched"
            />
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Want to Read -->
  <section style="margin-bottom: 48px;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
      <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0;">Want to Read</h2>
      <a href="/books/shelves" style="font-size: 13px; color: var(--text-tertiary); text-decoration: none;" class="section-link">Shelves</a>
    </div>
    {#if wantToRead.length > 0}
      <div class="poster-grid">
        {#each wantToRead as book}
          <a href="/books/{book.id}" class="poster-item" title={book.title}>
            <PosterCard
              src={book.coverPath}
              alt={book.title}
              href="/books/{book.id}"
              status="watchlist"
            />
          </a>
        {/each}
      </div>
    {:else}
      <p style="font-size: 15px; color: var(--text-tertiary);">No books on your want-to-read list yet.</p>
    {/if}
  </section>
</div>
{/if}

<style>
  .poster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .poster-item {
    display: block;
    text-decoration: none;
    border-radius: 4px;
    overflow: hidden;
  }

  .reading-row:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .section-link:hover {
    color: var(--text-secondary);
  }
</style>

<AddBookModal
  open={addModalOpen}
  onclose={() => addModalOpen = false}
  onadd={async () => {
    const [cr, rr, wtr] = await Promise.all([
      getCurrentlyReading(),
      getRecentlyRead(8),
      getWantToRead(),
    ]);
    currentlyReading = cr;
    recentlyRead = rr;
    wantToRead = wtr;
  }}
/>
