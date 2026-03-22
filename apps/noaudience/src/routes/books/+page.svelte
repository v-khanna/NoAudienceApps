<script lang="ts">
  import SearchBar from '@noaudience/core/components/SearchBar.svelte';
  import ProgressBar from '@noaudience/core/components/ProgressBar.svelte';
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import PosterGrid from '@noaudience/core/components/PosterGrid.svelte';
  import Button from '@noaudience/core/components/Button.svelte';
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
</script>

<div class="p-8 space-y-10 overflow-y-auto h-full">
  <!-- Header -->
  <div class="flex items-start justify-between gap-6">
    <div>
      <h1 class="text-3xl font-bold text-white">Books</h1>
      <p class="text-[#99AABB] mt-1">Track your reading journey</p>
    </div>
    <div class="w-72">
      <SearchBar bind:value={searchQuery} placeholder="Search books..." />
    </div>
  </div>

  <!-- Reading Challenge Progress -->
  {#if challenge}
    <div class="bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-6">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-white font-semibold">2026 Reading Challenge</h2>
        <a href="/books/challenge" class="text-[#40BCF4] text-sm hover:underline">View details</a>
      </div>
      <p class="text-[#99AABB] text-sm mb-3">
        You've read <span class="text-white font-medium">{booksReadThisYear.length}</span> of
        <span class="text-white font-medium">{challenge.goal}</span> books
        ({Math.round((booksReadThisYear.length / challenge.goal) * 100)}%)
      </p>
      <ProgressBar value={booksReadThisYear.length} max={challenge.goal} color="green" />
    </div>
  {/if}

  <!-- Currently Reading -->
  {#if currentlyReading.length > 0}
    <section>
      <h2 class="text-white text-xl font-semibold mb-4">Currently Reading</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each currentlyReading as book}
          {@const progressPercent = book.latestProgress && book.pageCount
            ? Math.round((book.latestProgress.progressValue / book.pageCount) * 100)
            : 0}
          <a
            href="/books/{book.id}"
            class="flex gap-4 bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-4 hover:border-white/[0.12] transition-colors"
          >
            <img
              src={book.coverPath}
              alt={book.title}
              class="w-20 h-[120px] object-cover rounded-[6px] flex-shrink-0"
              loading="lazy"
            />
            <div class="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 class="text-white font-medium truncate">{book.title}</h3>
                <p class="text-[#99AABB] text-sm">{book.author}</p>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between text-xs text-[#99AABB]">
                  <span>
                    {#if book.latestProgress}
                      Page {book.latestProgress.progressValue} of {book.pageCount}
                    {:else}
                      Not started
                    {/if}
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <ProgressBar value={progressPercent} max={100} color="blue" height="sm" />
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Recently Read -->
  {#if recentlyRead.length > 0}
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-white text-xl font-semibold">Recently Read</h2>
        <a href="/books/library" class="text-[#40BCF4] text-sm hover:underline">View all</a>
      </div>
      <PosterGrid>
        {#each recentlyRead as book}
          <div>
            <PosterCard
              src={book.coverPath}
              alt={book.title}
              title={book.title}
              subtitle={book.author}
              href="/books/{book.id}"
              status="watched"
            />
            {#if book.review}
              <div class="mt-1">
                <StarRating value={book.review.rating} halfStars={false} readonly size="sm" />
              </div>
            {/if}
          </div>
        {/each}
      </PosterGrid>
    </section>
  {/if}

  <!-- Want to Read -->
  {#if wantToRead.length > 0}
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-white text-xl font-semibold">Want to Read</h2>
        <a href="/books/shelves" class="text-[#40BCF4] text-sm hover:underline">Manage shelves</a>
      </div>
      <PosterGrid>
        {#each wantToRead as book}
          <PosterCard
            src={book.coverPath}
            alt={book.title}
            title={book.title}
            subtitle={book.author}
            href="/books/{book.id}"
            status="watchlist"
          />
        {/each}
      </PosterGrid>
    </section>
  {:else}
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-white text-xl font-semibold">Want to Read</h2>
        <a href="/books/shelves" class="text-[#40BCF4] text-sm hover:underline">Manage shelves</a>
      </div>
      <div class="bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-8 text-center">
        <p class="text-[#99AABB]">No books on your Want to Read shelf yet.</p>
        <p class="text-[#99AABB] text-sm mt-1">Search for books to add to your list.</p>
      </div>
    </section>
  {/if}
</div>
