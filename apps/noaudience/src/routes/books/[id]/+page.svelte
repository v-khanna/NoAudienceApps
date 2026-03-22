<script lang="ts">
  import { page } from '$app/stores';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import {
    getBookById,
    getExclusiveShelfForBook,
    getAllShelvesForBook,
    getReviewForBook,
    getProgressForBook,
    getLatestProgress,
    getAllShelves,
  } from '$lib/books/db';
  import type { Book, BookShelf, BookReview, BookProgressEntry } from '$lib/books/mock';

  let bookId = $derived(Number($page.params.id));
  let book = $derived(getBookById(bookId));
  let exclusiveShelf = $derived(book ? getExclusiveShelfForBook(book.id) : undefined);
  let bookShelves = $derived(book ? getAllShelvesForBook(book.id) : []);
  let review = $derived(book ? getReviewForBook(book.id) : undefined);
  let progressEntries = $derived(book ? getProgressForBook(book.id) : []);
  let latestProgress = $derived(book ? getLatestProgress(book.id) : undefined);
  let allShelves = $derived(getAllShelves());

  let showFullDescription = $state(false);

  let rating = $derived(review?.rating ?? 0);
  let progressPercent = $derived(
    latestProgress && book?.pageCount
      ? Math.round((latestProgress.progressValue / book.pageCount) * 100)
      : 0
  );

  let descriptionTruncated = $derived(
    book?.description && book.description.length > 300 && !showFullDescription
      ? book.description.slice(0, 300) + '...'
      : book?.description ?? ''
  );

  function handleRatingChange(newValue: number) {
    // In a real app, this would persist the rating
  }
</script>

{#if book}
  <div style="display: flex; gap: 24px;">
    <!-- Left: cover -->
    <div style="flex-shrink: 0; width: 160px;">
      <img
        src={book.coverPath}
        alt={book.title}
        style="width: 100%; border-radius: 4px; border: 1px solid var(--border);"
        loading="lazy"
      />
    </div>

    <!-- Right: info -->
    <div style="flex: 1; min-width: 0;">
      <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0;">{book.title}</h1>
      <p style="font-size: 13px; color: var(--text-secondary); margin: 4px 0 0 0;">{book.author}</p>

      <!-- Shelf indicator -->
      {#if exclusiveShelf}
        <div style="display: flex; align-items: center; gap: 6px; margin-top: 12px;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0;"></span>
          <span style="font-size: 12px; color: var(--text-secondary);">{exclusiveShelf.name}</span>
        </div>
      {/if}

      <!-- Rating -->
      <div style="margin-top: 12px;">
        <StarRating value={rating} halfStars={false} onchange={handleRatingChange} size="sm" />
      </div>

      <!-- Progress bar if currently reading -->
      {#if exclusiveShelf?.name === 'Currently Reading' && latestProgress}
        <div style="margin-top: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="flex: 1; height: 4px; background: var(--border); border-radius: 2px; overflow: hidden;">
              <div style="height: 100%; width: {progressPercent}%; background: var(--accent); border-radius: 2px;"></div>
            </div>
            <span style="font-size: 11px; color: var(--text-secondary);">p.{latestProgress.progressValue}/{book.pageCount}</span>
          </div>
        </div>
      {/if}

      <!-- Description -->
      {#if book.description}
        <div style="margin-top: 16px;">
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0;">{descriptionTruncated}</p>
          {#if book.description.length > 300}
            <button
              onclick={() => (showFullDescription = !showFullDescription)}
              class="text-btn"
              style="font-size: 12px; color: var(--accent); background: none; border: none; padding: 0; margin-top: 4px; cursor: pointer;"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          {/if}
        </div>
      {/if}

      <!-- Metadata inline -->
      <p style="font-size: 12px; color: var(--text-tertiary); margin: 16px 0 0 0;">
        {book.pageCount} pages{#if book.publisher} &middot; {book.publisher}{/if}{#if book.publishDate} &middot; {book.publishDate}{/if}{#if book.isbn} &middot; {book.isbn}{/if}
      </p>

      <!-- Genres -->
      {#if book.genres && book.genres.length > 0}
        <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 12px;">
          {#each book.genres as genre}
            <span style="font-size: 11px; color: var(--text-secondary); padding: 2px 8px; border: 1px solid var(--border); border-radius: 4px;">{genre}</span>
          {/each}
        </div>
      {/if}

      <!-- Review -->
      {#if review}
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border);">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <StarRating value={review.rating} halfStars={false} readonly size="sm" />
            <span style="font-size: 11px; color: var(--text-tertiary);">{review.dateRead}</span>
          </div>
          {#if review.review}
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0;">"{review.review}"</p>
          {/if}
        </div>
      {:else}
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border);">
          <p style="font-size: 12px; color: var(--text-tertiary); margin: 0;">No review yet.</p>
          <button
            class="text-btn"
            style="font-size: 12px; color: var(--accent); background: none; border: none; padding: 0; margin-top: 4px; cursor: pointer;"
          >
            Write a review
          </button>
        </div>
      {/if}

      <!-- Progress notes -->
      {#if progressEntries.length > 0}
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border);">
          <h3 style="font-size: 11px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px 0;">Progress</h3>
          {#each progressEntries as entry, i}
            <div class="progress-row" style="display: flex; align-items: baseline; gap: 8px; padding: 4px 0; font-size: 12px; border-bottom: {i < progressEntries.length - 1 ? '1px solid var(--border)' : 'none'};">
              <span style="color: var(--text-primary);">p.{entry.progressValue}</span>
              <span style="color: var(--text-tertiary); font-size: 11px;">{new Date(entry.createdAt).toLocaleDateString()}</span>
              {#if entry.note}
                <span style="color: var(--text-secondary); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{entry.note}</span>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{:else}
  <p style="font-size: 12px; color: var(--text-tertiary);">Book not found.</p>
{/if}

<style>
  .text-btn:hover {
    opacity: 0.8;
  }
</style>
