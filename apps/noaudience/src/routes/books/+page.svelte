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

<div class="p-10 space-y-12 overflow-y-auto h-full">
  <!-- Header -->
  <div class="flex items-start justify-between gap-6">
    <div>
      <h1 class="text-3xl font-bold text-white tracking-tight">Books</h1>
      <p class="text-[#99AABB] mt-1.5 text-[15px]">Track your reading journey</p>
    </div>
    <div class="w-72">
      <SearchBar bind:value={searchQuery} placeholder="Search books..." />
    </div>
  </div>

  <!-- Reading Challenge Progress -->
  {#if challenge}
    {@const pct = Math.round((booksReadThisYear.length / challenge.goal) * 100)}
    <div class="bg-gradient-to-br from-[#1B2028] to-[#1E2330] border border-amber-500/[0.08] rounded-2xl p-7 relative overflow-hidden">
      <!-- Warm decorative glow -->
      <div class="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none"></div>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-white font-semibold text-lg">2026 Reading Challenge</h2>
        <a href="/books/challenge" class="text-amber-400 text-sm hover:text-amber-300 transition-colors duration-200">View details</a>
      </div>
      <div class="flex items-baseline gap-2 mb-4">
        <span class="text-4xl font-bold text-white">{booksReadThisYear.length}</span>
        <span class="text-[#99AABB]">of {challenge.goal} books</span>
        <span class="ml-auto text-lg font-semibold text-[#00E054]">{pct}%</span>
      </div>
      <div class="h-3 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          class="h-full rounded-full bg-gradient-to-r from-[#00E054] to-[#40BCF4] transition-all duration-700 ease-out"
          style="width: {Math.min(pct, 100)}%"
        ></div>
      </div>
    </div>
  {/if}

  <!-- Currently Reading -->
  {#if currentlyReading.length > 0}
    <section>
      <h2 class="text-white text-xl font-semibold mb-6 flex items-center gap-2.5">
        <span class="w-2.5 h-2.5 rounded-full bg-[#FF8000] animate-pulse"></span>
        Currently Reading
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        {#each currentlyReading as book}
          {@const progressPercent = book.latestProgress && book.pageCount
            ? Math.round((book.latestProgress.progressValue / book.pageCount) * 100)
            : 0}
          <a
            href="/books/{book.id}"
            class="group flex gap-5 bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-2xl p-5 hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-900/10 transition-all duration-300"
          >
            <img
              src={book.coverPath}
              alt={book.title}
              class="w-24 h-[140px] object-cover rounded-lg flex-shrink-0 shadow-[4px_4px_12px_rgba(0,0,0,0.5)] group-hover:shadow-[6px_6px_16px_rgba(0,0,0,0.6)] transition-shadow duration-300"
              loading="lazy"
            />
            <div class="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div>
                <h3 class="text-white font-semibold font-serif text-lg leading-snug truncate">{book.title}</h3>
                <p class="text-[#99AABB] text-sm mt-1">{book.author}</p>
              </div>
              <div class="space-y-2.5">
                <div class="flex justify-between text-xs text-[#99AABB]">
                  <span>
                    {#if book.latestProgress}
                      Page {book.latestProgress.progressValue} of {book.pageCount}
                    {:else}
                      Not started
                    {/if}
                  </span>
                  <span class="text-white font-semibold text-sm">{progressPercent}%</span>
                </div>
                <div class="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-[#00E054] to-[#40BCF4] transition-all duration-700 ease-out"
                    style="width: {progressPercent}%"
                  ></div>
                </div>
                {#if progressPercent > 0 && progressPercent < 100}
                  <p class="text-amber-400/70 text-xs">
                    {#if progressPercent > 75}
                      Almost there -- keep going!
                    {:else if progressPercent > 50}
                      Past the halfway mark
                    {:else if progressPercent > 25}
                      Making good progress
                    {:else}
                      Just getting started
                    {/if}
                  </p>
                {/if}
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
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-white text-xl font-semibold">Recently Read</h2>
        <a href="/books/library" class="text-amber-400 text-sm hover:text-amber-300 transition-colors duration-200">View all</a>
      </div>
      <PosterGrid>
        {#each recentlyRead as book}
          <div class="group">
            <div class="shadow-[4px_4px_12px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden transition-shadow duration-300 group-hover:shadow-[6px_6px_16px_rgba(0,0,0,0.6)]">
              <PosterCard
                src={book.coverPath}
                alt={book.title}
                title={book.title}
                subtitle={book.author}
                href="/books/{book.id}"
                status="watched"
              />
            </div>
            {#if book.review}
              <div class="mt-2">
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
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-white text-xl font-semibold flex items-center gap-2.5">
          <span class="w-2 h-2 rounded-full bg-[#40BCF4]"></span>
          Want to Read
        </h2>
        <a href="/books/shelves" class="text-amber-400 text-sm hover:text-amber-300 transition-colors duration-200">Manage shelves</a>
      </div>
      <PosterGrid>
        {#each wantToRead as book}
          <div class="shadow-[4px_4px_12px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden hover:shadow-[6px_6px_16px_rgba(0,0,0,0.6)] transition-shadow duration-300">
            <PosterCard
              src={book.coverPath}
              alt={book.title}
              title={book.title}
              subtitle={book.author}
              href="/books/{book.id}"
              status="watchlist"
            />
          </div>
        {/each}
      </PosterGrid>
    </section>
  {:else}
    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-white text-xl font-semibold flex items-center gap-2.5">
          <span class="w-2 h-2 rounded-full bg-[#40BCF4]"></span>
          Want to Read
        </h2>
        <a href="/books/shelves" class="text-amber-400 text-sm hover:text-amber-300 transition-colors duration-200">Manage shelves</a>
      </div>
      <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-2xl p-12 text-center">
        <div class="text-4xl mb-4 opacity-40">📚</div>
        <p class="text-white/80 font-serif text-lg">Your bookshelf is empty.</p>
        <p class="text-[#99AABB] text-sm mt-2">Search for books to add to your reading list.</p>
      </div>
    </section>
  {/if}
</div>
