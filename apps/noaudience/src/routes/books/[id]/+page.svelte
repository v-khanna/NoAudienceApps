<script lang="ts">
  import { page } from '$app/stores';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import Button from '@noaudience/core/components/Button.svelte';
  import ProgressBar from '@noaudience/core/components/ProgressBar.svelte';
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
  let shelfDropdownOpen = $state(false);

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
  <div class="flex gap-8 p-8 overflow-y-auto h-full">
    <!-- Left column: cover (sticky) -->
    <div class="flex-shrink-0 w-64 sticky top-8 self-start">
      <img
        src={book.coverPath}
        alt={book.title}
        class="w-full rounded-[8px] shadow-lg"
        loading="lazy"
      />

      <!-- Shelf button -->
      <div class="mt-4 relative">
        <button
          class="w-full flex items-center justify-between px-4 h-10 rounded-[6px] text-sm font-semibold cursor-pointer transition-colors {
            exclusiveShelf?.name === 'Currently Reading'
              ? 'bg-[#40BCF4] text-[#14181C]'
              : exclusiveShelf?.name === 'Read'
                ? 'bg-[#00E054] text-[#14181C]'
                : exclusiveShelf?.name === 'Want to Read'
                  ? 'bg-[#FF8000] text-[#14181C]'
                  : 'bg-[#2C3440] text-white'
          }"
          onclick={() => (shelfDropdownOpen = !shelfDropdownOpen)}
        >
          <span>{exclusiveShelf?.name ?? 'Add to Shelf'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {#if shelfDropdownOpen}
          <div class="absolute top-full left-0 right-0 mt-1 bg-[#2C3440] border border-white/[0.08] rounded-[8px] shadow-xl z-10 overflow-hidden">
            {#each allShelves as shelf}
              {@const isActive = bookShelves.some((s) => s.id === shelf.id)}
              <button
                class="w-full px-4 py-2.5 text-left text-sm hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center justify-between {isActive ? 'text-[#00E054]' : 'text-white'}"
                onclick={() => (shelfDropdownOpen = false)}
              >
                <span>{shelf.name}</span>
                {#if isActive}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Progress bar for currently reading -->
      {#if exclusiveShelf?.name === 'Currently Reading' && latestProgress}
        <div class="mt-4 space-y-2">
          <div class="flex justify-between text-xs text-[#99AABB]">
            <span>Page {latestProgress.progressValue} of {book.pageCount}</span>
            <span>{progressPercent}%</span>
          </div>
          <ProgressBar value={progressPercent} max={100} color="blue" height="sm" />
          <Button variant="secondary" size="sm" onclick={() => {}}>
            Update Progress
          </Button>
        </div>
      {/if}
    </div>

    <!-- Right column: details -->
    <div class="flex-1 min-w-0 space-y-6">
      <!-- Title & author -->
      <div>
        <h1 class="text-3xl font-bold text-white">{book.title}</h1>
        <p class="text-[#99AABB] text-lg mt-1">{book.author}</p>
      </div>

      <!-- Your rating -->
      <div>
        <h3 class="text-[#99AABB] text-xs uppercase tracking-wider mb-2">Your Rating</h3>
        <StarRating value={rating} halfStars={false} onchange={handleRatingChange} size="lg" />
      </div>

      <!-- Description -->
      {#if book.description}
        <div>
          <h3 class="text-[#99AABB] text-xs uppercase tracking-wider mb-2">Description</h3>
          <p class="text-white/[0.85] text-sm leading-relaxed">{descriptionTruncated}</p>
          {#if book.description.length > 300}
            <button
              class="text-[#40BCF4] text-sm mt-1 hover:underline cursor-pointer"
              onclick={() => (showFullDescription = !showFullDescription)}
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          {/if}
        </div>
      {/if}

      <!-- Genre tags -->
      {#if book.genres && book.genres.length > 0}
        <div>
          <h3 class="text-[#99AABB] text-xs uppercase tracking-wider mb-2">Genres</h3>
          <div class="flex flex-wrap gap-2">
            {#each book.genres as genre}
              <span class="px-3 py-1 bg-[#2C3440] text-[#99AABB] text-xs rounded-full capitalize">
                {genre}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Metadata -->
      <div>
        <h3 class="text-[#99AABB] text-xs uppercase tracking-wider mb-2">Details</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-[#99AABB]">Pages</span>
            <p class="text-white">{book.pageCount}</p>
          </div>
          <div>
            <span class="text-[#99AABB]">Publisher</span>
            <p class="text-white">{book.publisher}</p>
          </div>
          <div>
            <span class="text-[#99AABB]">Published</span>
            <p class="text-white">{book.publishDate}</p>
          </div>
          <div>
            <span class="text-[#99AABB]">ISBN</span>
            <p class="text-white font-mono text-xs">{book.isbn}</p>
          </div>
        </div>
      </div>

      <!-- Your review -->
      <div>
        <h3 class="text-[#99AABB] text-xs uppercase tracking-wider mb-2">Your Review</h3>
        {#if review}
          <div class="bg-[#1B2028] border border-white/[0.06] rounded-[8px] p-4">
            <div class="flex items-center gap-3 mb-2">
              <StarRating value={review.rating} halfStars={false} readonly size="sm" />
              <span class="text-[#99AABB] text-xs">{review.dateRead}</span>
            </div>
            <p class="text-white/[0.85] text-sm leading-relaxed">{review.review}</p>
          </div>
        {:else}
          <div class="bg-[#1B2028] border border-white/[0.06] rounded-[8px] p-4 text-center">
            <p class="text-[#99AABB] text-sm">No review yet.</p>
            <button class="text-[#40BCF4] text-sm mt-1 hover:underline cursor-pointer">
              Write a review
            </button>
          </div>
        {/if}
      </div>

      <!-- Progress notes -->
      {#if progressEntries.length > 0}
        <div>
          <h3 class="text-[#99AABB] text-xs uppercase tracking-wider mb-2">Progress Notes</h3>
          <div class="space-y-3">
            {#each progressEntries as entry}
              <div class="flex gap-3 text-sm">
                <div class="flex-shrink-0 w-1 bg-[#40BCF4] rounded-full"></div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-white font-medium">
                      Page {entry.progressValue}
                    </span>
                    <span class="text-[#99AABB] text-xs">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {#if entry.note}
                    <p class="text-[#99AABB] mt-0.5">{entry.note}</p>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
{:else}
  <div class="flex items-center justify-center h-full">
    <p class="text-[#99AABB]">Book not found.</p>
  </div>
{/if}
