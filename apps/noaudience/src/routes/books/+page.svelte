<script lang="ts">
  import SearchBar from '@noaudience/core/components/SearchBar.svelte';
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import {
    getCurrentlyReading,
    getRecentlyRead,
    getWantToRead,
    getChallenge,
    getBooksReadInYear,
  } from '$lib/books/db';

  let searchQuery = $state('');
  let currentlyReading = $state(getCurrentlyReading());
  let recentlyRead = $state(getRecentlyRead(8));
  let wantToRead = $state(getWantToRead());
  let challenge = $state(getChallenge(2026));
  let booksReadThisYear = $state(getBooksReadInYear(2026));

  let challengePct = $derived(
    challenge ? Math.round((booksReadThisYear.length / challenge.goal) * 100) : 0
  );
</script>

<div>
  <!-- Header -->
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
    <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0;">Books</h1>
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search books..."
      style="
        height: 32px;
        padding: 0 12px;
        font-size: 12px;
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
      <span style="font-size: 12px; color: var(--text-secondary); display: flex; align-items: center; gap: 8px;">
        {booksReadThisYear.length} of {challenge.goal} books
        <span style="display: inline-block; width: 60px; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden;">
          <span style="display: block; height: 100%; width: {Math.min(challengePct, 100)}%; background: var(--accent); border-radius: 2px;"></span>
        </span>
        <a href="/books/challenge" style="font-size: 11px; color: var(--text-tertiary); text-decoration: none;" class="section-link">Challenge</a>
      </span>
    {/if}
  </div>

  <!-- Currently Reading -->
  {#if currentlyReading.length > 0}
    <section style="margin-bottom: 32px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h2 style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0;">Currently Reading</h2>
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        {#each currentlyReading as book}
          {@const progressPercent = book.latestProgress && book.pageCount
            ? Math.round((book.latestProgress.progressValue / book.pageCount) * 100)
            : 0}
          <a href="/books/{book.id}" class="reading-row" style="display: flex; align-items: center; gap: 12px; text-decoration: none; padding: 8px; border: 1px solid var(--border); border-radius: 6px; transition: background 150ms ease-out;">
            <img
              src={book.coverPath}
              alt={book.title}
              style="width: 80px; height: auto; object-fit: cover; border-radius: 4px; flex-shrink: 0;"
              loading="lazy"
            />
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 13px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{book.title}</div>
              <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">{book.author}</div>
              <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
                <div style="flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden;">
                  <div style="height: 100%; width: {progressPercent}%; background: var(--accent); border-radius: 2px;"></div>
                </div>
                <span style="font-size: 11px; color: var(--text-secondary); flex-shrink: 0;">{progressPercent}%</span>
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Recently Read -->
  {#if recentlyRead.length > 0}
    <section style="margin-bottom: 32px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h2 style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0;">Recently Read</h2>
        <a href="/books/library" style="font-size: 11px; color: var(--text-tertiary); text-decoration: none;" class="section-link">View all</a>
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
  <section style="margin-bottom: 32px;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
      <h2 style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0;">Want to Read</h2>
      <a href="/books/shelves" style="font-size: 11px; color: var(--text-tertiary); text-decoration: none;" class="section-link">Shelves</a>
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
      <p style="font-size: 12px; color: var(--text-tertiary);">No books on your want-to-read list yet.</p>
    {/if}
  </section>
</div>

<style>
  .poster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 100px);
    gap: 8px;
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
