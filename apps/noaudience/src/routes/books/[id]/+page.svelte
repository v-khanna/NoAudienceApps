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
  <div class="flex gap-10 p-10 overflow-y-auto h-full">
    <!-- Left column: cover (sticky) -->
    <div class="flex-shrink-0 w-64 sticky top-8 self-start">
      <div class="shadow-[6px_8px_20px_rgba(0,0,0,0.6)] rounded-lg overflow-hidden">
        <img
          src={book.coverPath}
          alt={book.title}
          class="w-full rounded-lg"
          loading="lazy"
        />
      </div>

      <!-- Shelf button -->
      <div class="mt-5 relative">
        <button
          class="w-full flex items-center justify-between px-4 h-11 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 {
            exclusiveShelf?.name === 'Currently Reading'
              ? 'bg-[#FF8000] text-[#14181C] hover:bg-[#FF9020]'
              : exclusiveShelf?.name === 'Read'
                ? 'bg-[#00E054] text-[#14181C] hover:bg-[#20E874]'
                : exclusiveShelf?.name === 'Want to Read'
                  ? 'bg-[#40BCF4] text-[#14181C] hover:bg-[#60CCF8]'
                  : 'bg-[#2C3440] text-white hover:bg-[#343E4C]'
          }"
          onclick={() => (shelfDropdownOpen = !shelfDropdownOpen)}
        >
          <span>{exclusiveShelf?.name ?? 'Add to Shelf'}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-200 {shelfDropdownOpen ? 'rotate-180' : ''}">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {#if shelfDropdownOpen}
          <div class="absolute top-full left-0 right-0 mt-1.5 bg-[#2C3440] border border-white/[0.08] rounded-xl shadow-2xl z-10 overflow-hidden">
            {#each allShelves as shelf}
              {@const isActive = bookShelves.some((s) => s.id === shelf.id)}
              <button
                class="w-full px-4 py-3 text-left text-sm hover:bg-white/[0.06] transition-colors duration-200 cursor-pointer flex items-center justify-between {isActive ? 'text-[#00E054]' : 'text-white'}"
                onclick={() => (shelfDropdownOpen = false)}
              >
                <span class="flex items-center gap-2.5">
                  <span class="w-2 h-2 rounded-full {
                    shelf.name === 'Read' ? 'bg-[#00E054]' :
                    shelf.name === 'Currently Reading' ? 'bg-[#FF8000]' :
                    shelf.name === 'Want to Read' ? 'bg-[#40BCF4]' :
                    'bg-[#99AABB]'
                  }"></span>
                  {shelf.name}
                </span>
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
        <div class="mt-5 space-y-3 bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-xl p-4">
          <div class="flex justify-between items-baseline">
            <span class="text-[#99AABB] text-xs">Page {latestProgress.progressValue} of {book.pageCount}</span>
            <span class="text-white font-bold text-lg">{progressPercent}%</span>
          </div>
          <div class="h-3 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-[#00E054] to-[#40BCF4] transition-all duration-700 ease-out"
              style="width: {progressPercent}%"
            ></div>
          </div>
          <Button variant="secondary" size="sm" onclick={() => {}}>
            Update Progress
          </Button>
        </div>
      {/if}
    </div>

    <!-- Right column: details -->
    <div class="flex-1 min-w-0 space-y-8">
      <!-- Title & author -->
      <div>
        <h1 class="text-3xl font-bold text-white font-serif tracking-tight leading-tight">{book.title}</h1>
        <p class="text-[#C8B8A0] text-lg mt-2">{book.author}</p>
      </div>

      <!-- Your rating -->
      <div>
        <h3 class="text-[#99AABB] text-xs uppercase tracking-wider mb-2.5">Your Rating</h3>
        <StarRating value={rating} halfStars={false} onchange={handleRatingChange} size="lg" />
      </div>

      <!-- Description -->
      {#if book.description}
        <div>
          <h3 class="text-[#99AABB] text-xs uppercase tracking-wider mb-2.5">Description</h3>
          <p class="text-white/[0.8] text-[15px] leading-[1.75]">{descriptionTruncated}</p>
          {#if book.description.length > 300}
            <button
              class="text-amber-400 text-sm mt-2 hover:text-amber-300 transition-colors duration-200 cursor-pointer"
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
          <h3 class="text-[#99AABB] text-xs uppercase tracking-wider mb-3">Genres</h3>
          <div class="flex flex-wrap gap-2">
            {#each book.genres as genre}
              <span class="px-3.5 py-1.5 bg-amber-500/[0.08] border border-amber-500/[0.12] text-amber-200/80 text-xs rounded-full capitalize transition-colors duration-200 hover:bg-amber-500/[0.14]">
                {genre}
              </span>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Metadata -->
      <div>
        <h3 class="text-[#99AABB] text-xs uppercase tracking-wider mb-3">Details</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="bg-white/[0.02] rounded-lg p-3">
            <span class="text-[#99AABB] text-xs">Pages</span>
            <p class="text-white font-medium mt-0.5">{book.pageCount}</p>
          </div>
          <div class="bg-white/[0.02] rounded-lg p-3">
            <span class="text-[#99AABB] text-xs">Publisher</span>
            <p class="text-white font-medium mt-0.5">{book.publisher}</p>
          </div>
          <div class="bg-white/[0.02] rounded-lg p-3">
            <span class="text-[#99AABB] text-xs">Published</span>
            <p class="text-white font-medium mt-0.5">{book.publishDate}</p>
          </div>
          <div class="bg-white/[0.02] rounded-lg p-3">
            <span class="text-[#99AABB] text-xs">ISBN</span>
            <p class="text-white font-mono text-xs mt-0.5">{book.isbn}</p>
          </div>
        </div>
      </div>

      <!-- Your review -->
      <div>
        <h3 class="text-[#99AABB] text-xs uppercase tracking-wider mb-3">Your Review</h3>
        {#if review}
          <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-xl p-5">
            <div class="flex items-center gap-3 mb-3">
              <StarRating value={review.rating} halfStars={false} readonly size="sm" />
              <span class="text-[#99AABB] text-xs">{review.dateRead}</span>
            </div>
            <p class="text-white/[0.8] text-[15px] leading-[1.75] font-serif italic">"{review.review}"</p>
          </div>
        {:else}
          <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-dashed border-white/[0.08] rounded-xl p-8 text-center">
            <p class="text-[#99AABB] text-sm">No review yet.</p>
            <button class="text-amber-400 text-sm mt-2 hover:text-amber-300 transition-colors duration-200 cursor-pointer">
              Write a review
            </button>
          </div>
        {/if}
      </div>

      <!-- Progress notes -->
      {#if progressEntries.length > 0}
        <div>
          <h3 class="text-[#99AABB] text-xs uppercase tracking-wider mb-3">Progress Notes</h3>
          <div class="space-y-0 border-l-2 border-amber-500/20 ml-1">
            {#each progressEntries as entry}
              <div class="flex gap-4 text-sm pl-5 py-3 relative">
                <div class="absolute left-[-5px] top-4 w-2 h-2 rounded-full bg-amber-400/60"></div>
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
                    <p class="text-[#99AABB] mt-1">{entry.note}</p>
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
    <div class="text-center">
      <div class="text-4xl mb-3 opacity-40">📖</div>
      <p class="text-[#99AABB]">Book not found.</p>
    </div>
  </div>
{/if}
