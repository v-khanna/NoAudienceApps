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
    createReview,
    updateReview,
    assignBookToShelf,
  } from '$lib/books/db';
  import type { Book, BookShelf, BookReview, BookProgressEntry } from '$lib/books/mock';

  let book = $state<Book | undefined>(undefined);
  let exclusiveShelf = $state<BookShelf | undefined>(undefined);
  let bookShelvesData = $state<BookShelf[]>([]);
  let review = $state<BookReview | undefined>(undefined);
  let progressEntries = $state<BookProgressEntry[]>([]);
  let latestProgressEntry = $state<BookProgressEntry | undefined>(undefined);
  let allShelvesData = $state<BookShelf[]>([]);
  let loaded = $state(false);
  let showFullDescription = $state(false);

  // Review form state
  let showReviewForm = $state(false);
  let formRating = $state(0);
  let formReviewText = $state('');
  let formDateStarted = $state('');
  let formDateRead = $state('');
  let showMoreOptions = $state(false);
  let saving = $state(false);

  let progressPercent = $derived(
    latestProgressEntry && book?.pageCount
      ? Math.round((latestProgressEntry.progressValue / book.pageCount) * 100)
      : 0
  );

  let descriptionTruncated = $derived(
    book?.description && book.description.length > 300 && !showFullDescription
      ? book.description.slice(0, 300) + '...'
      : book?.description ?? ''
  );

  async function loadBook(id: number) {
    loaded = false;
    try {
      const b = await getBookById(id);
      book = b;
      if (b) {
        const [es, bs, rv, pe, lp, as_] = await Promise.all([
          getExclusiveShelfForBook(b.id),
          getAllShelvesForBook(b.id),
          getReviewForBook(b.id),
          getProgressForBook(b.id),
          getLatestProgress(b.id),
          getAllShelves(),
        ]);
        exclusiveShelf = es;
        bookShelvesData = bs;
        review = rv;
        progressEntries = pe;
        latestProgressEntry = lp;
        allShelvesData = as_;
      }
    } catch (e: any) {
      console.error('Failed to load book:', e);
    } finally {
      loaded = true;
    }
  }

  $effect(() => {
    const bookId = Number($page.params.id);
    if (bookId) {
      loadBook(bookId);
    }
  });

  function openReviewForm() {
    if (review) {
      formRating = review.rating;
      formReviewText = review.review;
      formDateStarted = review.dateStarted || '';
      formDateRead = review.dateRead || '';
      showMoreOptions = !!(review.dateStarted || review.dateRead);
    } else {
      formRating = 0;
      formReviewText = '';
      formDateStarted = '';
      formDateRead = '';
      showMoreOptions = false;
    }
    showReviewForm = true;
  }

  async function saveReview() {
    if (!book) return;
    saving = true;
    try {
      if (review) {
        review = await updateReview(book.id, {
          rating: formRating,
          review: formReviewText,
          dateStarted: formDateStarted,
          dateRead: formDateRead,
        });
      } else {
        review = await createReview({
          bookId: book.id,
          rating: formRating,
          review: formReviewText,
          dateStarted: formDateStarted,
          dateRead: formDateRead,
        });
      }
      showReviewForm = false;

      // If rating or review was added and book is on "Want to Read", move to "Read"
      if (formRating > 0 && exclusiveShelf?.name === 'Want to Read') {
        const readShelf = allShelvesData.find(s => s.name === 'Read');
        if (readShelf) {
          await assignBookToShelf(book.id, readShelf.id);
          exclusiveShelf = readShelf;
        }
      }
    } catch (e: any) {
      console.error('Failed to save review:', e);
    } finally {
      saving = false;
    }
  }

  async function handleRatingChange(newValue: number) {
    if (!book) return;
    if (review) {
      review = await updateReview(book.id, { rating: newValue });
    } else {
      review = await createReview({
        bookId: book.id,
        rating: newValue,
        review: '',
        dateStarted: '',
        dateRead: '',
      });
    }
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }
</script>

{#if loaded}
{#if book}
  <div style="display: flex; gap: 32px;">
    <!-- Left: cover -->
    <div style="flex-shrink: 0; width: 200px;">
      <img
        src={book.coverPath}
        alt={book.title}
        style="width: 100%; border-radius: 4px; border: 1px solid var(--border);"
        loading="lazy"
      />
    </div>

    <!-- Right: info -->
    <div style="flex: 1; min-width: 0;">
      <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0;">{book.title}</h1>
      <p style="font-size: 15px; color: var(--text-secondary); margin: 6px 0 0 0;">{book.author}</p>

      <!-- Shelf indicator -->
      {#if exclusiveShelf}
        <div style="display: flex; align-items: center; gap: 8px; margin-top: 16px;">
          <span style="width: 8px; height: 8px; border-radius: 50%; background: {exclusiveShelf.name === 'Read' ? 'var(--accent)' : exclusiveShelf.name === 'Currently Reading' ? '#40BCF4' : '#FF8000'}; flex-shrink: 0;"></span>
          <span style="font-size: 15px; color: var(--text-secondary);">{exclusiveShelf.name}</span>
        </div>
      {/if}

      <!-- Rating -->
      <div style="margin-top: 16px;">
        <StarRating value={review?.rating ?? 0} halfStars={false} onchange={handleRatingChange} size="sm" />
      </div>

      <!-- Progress bar if currently reading -->
      {#if exclusiveShelf?.name === 'Currently Reading' && latestProgressEntry}
        <div style="margin-top: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
              <div style="height: 100%; width: {progressPercent}%; background: var(--accent); border-radius: 4px;"></div>
            </div>
            <span style="font-size: 13px; color: var(--text-secondary);">p.{latestProgressEntry.progressValue}/{book.pageCount}</span>
          </div>
        </div>
      {/if}

      <!-- Description -->
      {#if book.description}
        <div style="margin-top: 20px;">
          <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin: 0;">{descriptionTruncated}</p>
          {#if book.description.length > 300}
            <button
              onclick={() => (showFullDescription = !showFullDescription)}
              class="text-btn"
              style="font-size: 15px; color: var(--accent); background: none; border: none; padding: 0; margin-top: 4px; cursor: pointer;"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          {/if}
        </div>
      {/if}

      <!-- Metadata inline -->
      <p style="font-size: 13px; color: var(--text-tertiary); margin: 20px 0 0 0;">
        {book.pageCount} pages{#if book.publisher} &middot; {book.publisher}{/if}{#if book.publishDate} &middot; {book.publishDate}{/if}{#if book.isbn} &middot; {book.isbn}{/if}
      </p>

      <!-- Genres -->
      {#if book.genres && book.genres.length > 0}
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px;">
          {#each book.genres as genre}
            <span style="font-size: 13px; color: var(--text-secondary); padding: 4px 10px; border: 1px solid var(--border); border-radius: 4px;">{genre}</span>
          {/each}
        </div>
      {/if}

      <!-- Review section -->
      <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border);">
        {#if showReviewForm}
          <!-- Review form -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="font-size: 13px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Rating</label>
              <StarRating value={formRating} halfStars={false} onchange={(v) => formRating = v} size="sm" />
            </div>

            <div>
              <label style="font-size: 13px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Review</label>
              <textarea
                bind:value={formReviewText}
                placeholder="What did you think?"
                rows="4"
                style="
                  width: 100%;
                  padding: 10px 12px;
                  font-size: 15px;
                  line-height: 1.6;
                  background: var(--bg-inset);
                  border: 1px solid var(--border);
                  border-radius: 6px;
                  color: var(--text-primary);
                  outline: none;
                  resize: vertical;
                  font-family: inherit;
                "
                class="review-textarea"
              ></textarea>
            </div>

            {#if !showMoreOptions}
              <button
                onclick={() => showMoreOptions = true}
                class="text-btn"
                style="font-size: 13px; color: var(--text-tertiary); background: none; border: none; padding: 0; cursor: pointer; text-align: left;"
              >
                + Log reading dates
              </button>
            {:else}
              <div style="display: flex; gap: 12px;">
                <div style="flex: 1;">
                  <label style="font-size: 13px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Started</label>
                  <input
                    type="date"
                    bind:value={formDateStarted}
                    style="
                      width: 100%;
                      height: 40px;
                      padding: 0 10px;
                      font-size: 14px;
                      background: var(--bg-inset);
                      border: 1px solid var(--border);
                      border-radius: 6px;
                      color: var(--text-primary);
                      outline: none;
                    "
                    class="date-input"
                  />
                </div>
                <div style="flex: 1;">
                  <label style="font-size: 13px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px;">Finished</label>
                  <input
                    type="date"
                    bind:value={formDateRead}
                    style="
                      width: 100%;
                      height: 40px;
                      padding: 0 10px;
                      font-size: 14px;
                      background: var(--bg-inset);
                      border: 1px solid var(--border);
                      border-radius: 6px;
                      color: var(--text-primary);
                      outline: none;
                    "
                    class="date-input"
                  />
                </div>
              </div>
            {/if}

            <div style="display: flex; gap: 8px;">
              <button
                onclick={saveReview}
                disabled={saving}
                style="
                  height: 36px;
                  padding: 0 20px;
                  font-size: 14px;
                  font-weight: 500;
                  color: #000;
                  background: var(--accent);
                  border: none;
                  border-radius: 6px;
                  cursor: pointer;
                  opacity: {saving ? 0.6 : 1};
                "
              >
                {saving ? 'Saving...' : review ? 'Update' : 'Save'}
              </button>
              <button
                onclick={() => showReviewForm = false}
                style="
                  height: 36px;
                  padding: 0 16px;
                  font-size: 14px;
                  color: var(--text-secondary);
                  background: none;
                  border: 1px solid var(--border);
                  border-radius: 6px;
                  cursor: pointer;
                "
                class="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        {:else if review}
          <!-- Existing review display -->
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <StarRating value={review.rating} halfStars={false} readonly size="sm" />
            {#if review.dateStarted || review.dateRead}
              <span style="font-size: 13px; color: var(--text-tertiary);">
                {#if review.dateStarted && review.dateRead}
                  {formatDate(review.dateStarted)} — {formatDate(review.dateRead)}
                {:else if review.dateRead}
                  Finished {formatDate(review.dateRead)}
                {:else if review.dateStarted}
                  Started {formatDate(review.dateStarted)}
                {/if}
              </span>
            {/if}
          </div>
          {#if review.review}
            <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin: 0 0 12px 0;">"{review.review}"</p>
          {/if}
          <button
            onclick={openReviewForm}
            class="text-btn"
            style="font-size: 14px; color: var(--accent); background: none; border: none; padding: 0; cursor: pointer;"
          >
            Edit review
          </button>
        {:else}
          <!-- No review yet -->
          <p style="font-size: 15px; color: var(--text-tertiary); margin: 0 0 8px 0;">No review yet.</p>
          <button
            onclick={openReviewForm}
            class="text-btn"
            style="font-size: 15px; color: var(--accent); background: none; border: none; padding: 0; cursor: pointer;"
          >
            Write a review
          </button>
        {/if}
      </div>

      <!-- Progress notes -->
      {#if progressEntries.length > 0}
        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border);">
          <h3 style="font-size: 13px; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 12px 0;">Progress</h3>
          {#each progressEntries as entry, i}
            <div class="progress-row" style="display: flex; align-items: baseline; gap: 8px; padding: 8px 0; font-size: 15px; border-bottom: {i < progressEntries.length - 1 ? '1px solid var(--border)' : 'none'};">
              <span style="color: var(--text-primary);">p.{entry.progressValue}</span>
              <span style="color: var(--text-tertiary); font-size: 13px;">{new Date(entry.createdAt).toLocaleDateString()}</span>
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
  <p style="font-size: 15px; color: var(--text-tertiary);">Book not found.</p>
{/if}
{/if}

<style>
  .text-btn:hover {
    opacity: 0.8;
  }

  .cancel-btn:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .review-textarea:focus,
  .date-input:focus {
    border-color: var(--accent);
  }
</style>
