<script lang="ts">
  import ProgressBar from '@noaudience/core/components/ProgressBar.svelte';
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import PosterGrid from '@noaudience/core/components/PosterGrid.svelte';
  import Button from '@noaudience/core/components/Button.svelte';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import { getChallenge, getBooksReadInYear, getReviewForBook } from '$lib/books/db';

  const currentYear = 2026;
  let challenge = $state(getChallenge(currentYear));
  let goalInput = $state(challenge?.goal ?? 12);
  let booksRead = $state(getBooksReadInYear(currentYear));

  let percent = $derived(
    challenge ? Math.round((booksRead.length / challenge.goal) * 100) : 0
  );

  // Pace calculation: expected books by this date
  let dayOfYear = $derived(() => {
    const now = new Date(currentYear, 2, 22); // March 22
    const start = new Date(currentYear, 0, 1);
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  });

  let expectedBooks = $derived(
    challenge ? Math.round((dayOfYear() / 365) * challenge.goal * 10) / 10 : 0
  );

  let paceAhead = $derived(booksRead.length - Math.floor(expectedBooks));

  function updateGoal() {
    if (goalInput > 0 && challenge) {
      challenge = { ...challenge, goal: goalInput };
    }
  }
</script>

<div class="p-8 overflow-y-auto h-full space-y-8 max-w-4xl">
  <h1 class="text-2xl font-bold text-white">{currentYear} Reading Challenge</h1>

  <!-- Goal setting -->
  <div class="bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-6">
    <div class="flex items-end gap-4 mb-6">
      <div>
        <label for="goal-input" class="text-[#99AABB] text-xs uppercase tracking-wider block mb-2">
          Reading Goal
        </label>
        <div class="flex items-center gap-2">
          <input
            id="goal-input"
            type="number"
            bind:value={goalInput}
            min="1"
            max="365"
            class="w-20 px-3 h-10 bg-[#14181C] border border-white/[0.06] rounded-[6px] text-white text-center text-lg font-semibold focus:outline-none focus:border-[#40BCF4] transition-colors"
          />
          <span class="text-[#99AABB] text-sm">books</span>
        </div>
      </div>
      <Button variant="secondary" size="md" onclick={updateGoal}>Update Goal</Button>
    </div>

    {#if challenge}
      <!-- Progress display -->
      <div class="space-y-3">
        <p class="text-white text-lg">
          You've read <span class="text-[#00E054] font-bold">{booksRead.length}</span> of
          <span class="font-bold">{challenge.goal}</span> books
          <span class="text-[#99AABB]">({percent}%)</span>
        </p>
        <ProgressBar value={booksRead.length} max={challenge.goal} color="green" />

        <!-- Pace indicator -->
        <div class="flex items-center gap-2 mt-3">
          {#if paceAhead > 0}
            <span class="text-[#00E054] text-sm font-medium">
              {paceAhead} book{paceAhead !== 1 ? 's' : ''} ahead of schedule
            </span>
          {:else if paceAhead < 0}
            <span class="text-[#FF8000] text-sm font-medium">
              {Math.abs(paceAhead)} book{Math.abs(paceAhead) !== 1 ? 's' : ''} behind schedule
            </span>
          {:else}
            <span class="text-[#40BCF4] text-sm font-medium">Right on schedule</span>
          {/if}
          <span class="text-[#99AABB] text-xs">
            (expected {expectedBooks.toFixed(1)} by now)
          </span>
        </div>
      </div>
    {/if}
  </div>

  <!-- Books read this year -->
  <section>
    <h2 class="text-white text-xl font-semibold mb-4">
      Books Read in {currentYear}
    </h2>
    {#if booksRead.length > 0}
      <PosterGrid>
        {#each booksRead as book}
          {@const review = getReviewForBook(book.id)}
          <div>
            <PosterCard
              src={book.coverPath}
              alt={book.title}
              title={book.title}
              subtitle={book.author}
              href="/books/{book.id}"
              status="watched"
            />
            {#if review}
              <div class="mt-1">
                <StarRating value={review.rating} halfStars={false} readonly size="sm" />
              </div>
            {/if}
          </div>
        {/each}
      </PosterGrid>
    {:else}
      <div class="bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-8 text-center">
        <p class="text-[#99AABB]">No books read yet this year. Time to get started!</p>
      </div>
    {/if}
  </section>
</div>
