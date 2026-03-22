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

  // Milestone badges
  let milestones = $derived.by(() => {
    if (!challenge) return [];
    const goal = challenge.goal;
    const targets = [
      { label: 'First Book', count: 1, icon: '📖' },
      { label: '25%', count: Math.ceil(goal * 0.25), icon: '🌱' },
      { label: 'Halfway', count: Math.ceil(goal * 0.5), icon: '⭐' },
      { label: '75%', count: Math.ceil(goal * 0.75), icon: '🔥' },
      { label: 'Goal!', count: goal, icon: '🏆' },
    ];
    return targets.map((t) => ({ ...t, reached: booksRead.length >= t.count }));
  });

  function updateGoal() {
    if (goalInput > 0 && challenge) {
      challenge = { ...challenge, goal: goalInput };
    }
  }
</script>

<div class="p-10 overflow-y-auto h-full space-y-10 max-w-4xl">
  <h1 class="text-2xl font-bold text-white tracking-tight">{currentYear} Reading Challenge</h1>

  <!-- Goal setting & progress -->
  <div class="bg-gradient-to-br from-[#1B2028] to-[#1E2330] border border-amber-500/[0.08] rounded-2xl p-8 relative overflow-hidden">
    <!-- Decorative warm glow -->
    <div class="absolute -top-20 -right-20 w-56 h-56 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-12 -left-12 w-40 h-40 bg-[#00E054]/[0.03] rounded-full blur-3xl pointer-events-none"></div>

    <div class="flex items-end gap-4 mb-8 relative">
      <div>
        <label for="goal-input" class="text-[#99AABB] text-xs uppercase tracking-wider block mb-2.5">
          Reading Goal
        </label>
        <div class="flex items-center gap-2">
          <input
            id="goal-input"
            type="number"
            bind:value={goalInput}
            min="1"
            max="365"
            class="w-20 px-3 h-11 bg-[#14181C] border border-white/[0.06] rounded-lg text-white text-center text-lg font-semibold focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all duration-200"
          />
          <span class="text-[#99AABB] text-sm">books</span>
        </div>
      </div>
      <Button variant="secondary" size="md" onclick={updateGoal}>Update Goal</Button>
    </div>

    {#if challenge}
      <!-- Large progress display -->
      <div class="space-y-4 relative">
        <div class="flex items-baseline gap-3">
          <span class="text-5xl font-bold text-white">{booksRead.length}</span>
          <span class="text-[#99AABB] text-lg">of {challenge.goal} books</span>
          <span class="ml-auto text-2xl font-bold text-[#00E054]">{percent}%</span>
        </div>
        <div class="h-4 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            class="h-full rounded-full bg-gradient-to-r from-[#00E054] to-[#40BCF4] transition-all duration-700 ease-out"
            style="width: {Math.min(percent, 100)}%"
          ></div>
        </div>

        <!-- Pace indicator -->
        <div class="flex items-center gap-2 mt-4">
          {#if paceAhead > 0}
            <span class="text-[#00E054] text-sm font-semibold flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
              {paceAhead} book{paceAhead !== 1 ? 's' : ''} ahead of schedule
            </span>
          {:else if paceAhead < 0}
            <span class="text-[#FF8000] text-sm font-semibold flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              {Math.abs(paceAhead)} book{Math.abs(paceAhead) !== 1 ? 's' : ''} behind schedule
            </span>
          {:else}
            <span class="text-[#40BCF4] text-sm font-semibold">Right on schedule</span>
          {/if}
          <span class="text-[#99AABB] text-xs">
            (expected {expectedBooks.toFixed(1)} by now)
          </span>
        </div>
      </div>

      <!-- Milestone badges -->
      <div class="mt-8 pt-6 border-t border-white/[0.06]">
        <h3 class="text-[#99AABB] text-xs uppercase tracking-wider mb-4">Milestones</h3>
        <div class="flex gap-3 flex-wrap">
          {#each milestones as milestone}
            <div class="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-all duration-300 {
              milestone.reached
                ? 'bg-amber-500/[0.1] border border-amber-500/20'
                : 'bg-white/[0.02] border border-white/[0.04] opacity-50'
            }">
              <span class="text-2xl {milestone.reached ? '' : 'grayscale'}">{milestone.icon}</span>
              <span class="text-xs font-medium {milestone.reached ? 'text-amber-200' : 'text-[#99AABB]'}">{milestone.label}</span>
              <span class="text-[10px] text-[#99AABB]">{milestone.count} book{milestone.count !== 1 ? 's' : ''}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>

  <!-- Books read this year -->
  <section>
    <h2 class="text-white text-xl font-semibold mb-6">
      Books Read in {currentYear}
    </h2>
    {#if booksRead.length > 0}
      <PosterGrid>
        {#each booksRead as book}
          {@const review = getReviewForBook(book.id)}
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
            {#if review}
              <div class="mt-2">
                <StarRating value={review.rating} halfStars={false} readonly size="sm" />
              </div>
            {/if}
          </div>
        {/each}
      </PosterGrid>
    {:else}
      <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-2xl p-12 text-center">
        <div class="text-4xl mb-4 opacity-40">📚</div>
        <p class="text-white/80 font-serif text-lg">No books read yet this year.</p>
        <p class="text-[#99AABB] text-sm mt-2">Your reading journey starts with a single page.</p>
      </div>
    {/if}
  </section>
</div>
