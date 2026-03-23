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
<main style="padding-bottom: 64px;">

  <!-- Header -->
  <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 40px;">
    <h1 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.75rem; font-weight: 500; color: var(--text-primary); margin: 0;">Your Library</h1>
    <button
      onclick={() => addModalOpen = true}
      style="padding: 6px 16px; border-radius: 999px; background: var(--accent); color: #00390F; border: none; font-size: 13px; font-weight: 600; cursor: pointer;"
    >+ Add Book</button>
  </div>

  <!-- Stats bar -->
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 48px;">
    <div style="background: var(--surface-container-low); border-radius: 10px; padding: 20px;">
      <p style="font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin: 0 0 4px;">Total Books</p>
      <span style="font-family: 'Newsreader', Georgia, serif; font-size: 2rem; color: var(--accent);">{currentlyReading.length + recentlyRead.length + wantToRead.length}</span>
      <span style="font-size: 13px; color: var(--text-secondary); margin-left: 4px;">volumes</span>
    </div>
    <div style="background: var(--surface-container-low); border-radius: 10px; padding: 20px;">
      <p style="font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin: 0 0 4px;">Currently Reading</p>
      <span style="font-family: 'Newsreader', Georgia, serif; font-size: 2rem; color: var(--text-primary);">{currentlyReading.length}</span>
      <span style="font-size: 13px; color: var(--text-secondary); margin-left: 4px;">active sessions</span>
    </div>
    <div style="background: var(--surface-container-low); border-radius: 10px; padding: 20px;">
      <p style="font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin: 0 0 4px;">Finished {new Date().getFullYear()}</p>
      <span style="font-family: 'Newsreader', Georgia, serif; font-size: 2rem; color: var(--accent);">{booksReadThisYear.length}</span>
      <span style="font-size: 13px; color: var(--text-secondary); margin-left: 4px;">books read</span>
    </div>
  </div>

  <!-- Currently Reading -->
  {#if currentlyReading.length > 0}
    <section style="margin-bottom: 48px;">
      <h2 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.25rem; font-weight: 500; color: var(--text-primary); margin: 0 0 20px;">Currently Reading</h2>
      <div style="display: flex; flex-direction: column; gap: 2px; border-radius: 10px; overflow: hidden;">
        {#each currentlyReading as book}
          {@const progressPercent = book.latestProgress && book.pageCount
            ? Math.round((book.latestProgress.progressValue / book.pageCount) * 100)
            : 0}
          <a href="/books/{book.id}" class="reading-row" style="display: flex; align-items: center; gap: 16px; text-decoration: none; padding: 14px 16px; background: var(--surface-container-low); transition: background 150ms;">
            {#if book.coverPath}
              <img src={book.coverPath} alt={book.title} style="width: 48px; height: 72px; object-fit: cover; border-radius: 4px; flex-shrink: 0;" loading="lazy" />
            {/if}
            <div style="flex: 1; min-width: 0;">
              <div style="font-family: 'Newsreader', Georgia, serif; font-size: 1rem; color: var(--text-primary);">{book.title}</div>
              <div style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">{book.author}</div>
              <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
                <div style="flex: 1; height: 4px; background: var(--surface-container-high); border-radius: 999px; overflow: hidden;">
                  <div style="height: 100%; width: {progressPercent}%; background: var(--accent); border-radius: 999px;"></div>
                </div>
                <span style="font-size: 12px; color: var(--accent); font-weight: 600; flex-shrink: 0;">{progressPercent}%</span>
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
      <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 20px;">
        <h2 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.25rem; font-weight: 500; color: var(--text-primary); margin: 0;">Recently Read</h2>
        <a href="/books/library" style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); text-decoration: none;">View All →</a>
      </div>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 20px;">
        {#each recentlyRead as book}
          <a href="/books/{book.id}" style="text-decoration: none; display: block;">
            <div style="aspect-ratio: 2/3; border-radius: 6px; overflow: hidden; background: var(--surface-container); margin-bottom: 10px;">
              {#if book.coverPath}
                <img src={book.coverPath} alt={book.title} class="book-cover" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s;" />
              {/if}
            </div>
            <h4 style="font-family: 'Newsreader', Georgia, serif; font-size: 0.9375rem; color: var(--text-primary); margin: 0 0 2px;">{book.title}</h4>
            <p style="font-size: 0.6875rem; color: var(--text-muted); margin: 0;">{book.author}</p>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Want to Read -->
  <section style="margin-bottom: 48px;">
    <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 20px;">
      <h2 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.25rem; font-weight: 500; color: var(--text-primary); margin: 0;">Want to Read</h2>
      <a href="/books/shelves" style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--accent); text-decoration: none;">Shelves →</a>
    </div>
    {#if wantToRead.length > 0}
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 20px;">
        {#each wantToRead as book}
          <a href="/books/{book.id}" style="text-decoration: none; display: block;">
            <div style="aspect-ratio: 2/3; border-radius: 6px; overflow: hidden; background: var(--surface-container); margin-bottom: 10px;">
              {#if book.coverPath}
                <img src={book.coverPath} alt={book.title} class="book-cover" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s;" />
              {/if}
            </div>
            <h4 style="font-family: 'Newsreader', Georgia, serif; font-size: 0.9375rem; color: var(--text-primary); margin: 0 0 2px;">{book.title}</h4>
            <p style="font-size: 0.6875rem; color: var(--text-muted); margin: 0;">{book.author}</p>
          </a>
        {/each}
      </div>
    {:else}
      <div style="padding: 60px 0; text-align: center;">
        <p style="font-family: 'Newsreader', Georgia, serif; font-size: 1.125rem; color: var(--text-primary); margin: 0 0 8px;">Your reading list is empty</p>
        <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">Add books you want to read later.</p>
      </div>
    {/if}
  </section>
</main>
{/if}

<style>
  .reading-row:hover {
    background: var(--surface-container) !important;
  }

  .book-cover:hover {
    transform: scale(1.05);
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
