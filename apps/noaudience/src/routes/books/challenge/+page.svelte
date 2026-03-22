<script lang="ts">
  import { onMount } from 'svelte';
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import { getChallenge, getBooksReadInYear, setChallenge } from '$lib/books/db';
  import type { Book, ReadingChallenge } from '$lib/books/mock';

  const currentYear = 2026;
  let challenge = $state<ReadingChallenge | undefined>(undefined);
  let goalInput = $state(12);
  let booksRead = $state<Book[]>([]);
  let loaded = $state(false);

  let percent = $derived(
    challenge ? Math.round((booksRead.length / challenge.goal) * 100) : 0
  );

  let dayOfYear = $derived.by(() => {
    const now = new Date();
    const start = new Date(currentYear, 0, 1);
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  });

  let expectedBooks = $derived(
    challenge ? Math.round((dayOfYear / 365) * challenge.goal * 10) / 10 : 0
  );

  let paceAhead = $derived(booksRead.length - Math.floor(expectedBooks));

  onMount(async () => {
    try {
      const [ch, br] = await Promise.all([
        getChallenge(currentYear),
        getBooksReadInYear(currentYear),
      ]);
      challenge = ch;
      goalInput = ch?.goal ?? 12;
      booksRead = br;
    } catch (e: any) {
      console.error('Failed to load challenge:', e);
    } finally {
      loaded = true;
    }
  });

  async function updateGoal() {
    if (goalInput > 0) {
      challenge = await setChallenge(currentYear, goalInput);
    }
  }
</script>

{#if loaded}
<div style="max-width: 640px;">
  <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0 0 32px 0;">{currentYear} Reading Challenge</h1>

  <!-- Goal input + progress -->
  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
    <label for="goal-input" style="font-size: 15px; color: var(--text-secondary);">Goal:</label>
    <input
      id="goal-input"
      type="number"
      bind:value={goalInput}
      min="1"
      max="365"
      style="
        width: 64px;
        height: 40px;
        padding: 0 8px;
        font-size: 15px;
        background: var(--bg-inset);
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--text-primary);
        text-align: center;
        outline: none;
      "
    />
    <span style="font-size: 15px; color: var(--text-tertiary);">books</span>
    <button
      onclick={updateGoal}
      style="
        height: 40px;
        padding: 0 14px;
        font-size: 15px;
        color: var(--accent);
        background: transparent;
        border: 1px solid var(--border);
        border-radius: 4px;
        cursor: pointer;
      "
      class="update-btn"
    >Update</button>
  </div>

  {#if challenge}
    <!-- Progress bar -->
    <div style="margin-bottom: 12px;">
      <div style="display: flex; align-items: baseline; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 20px; font-weight: 600; color: var(--text-primary);">{booksRead.length}</span>
        <span style="font-size: 15px; color: var(--text-tertiary);">of {challenge.goal} books</span>
        <span style="margin-left: auto; font-size: 15px; color: var(--text-secondary);">{percent}%</span>
      </div>
      <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
        <div style="height: 100%; width: {Math.min(percent, 100)}%; background: var(--accent); border-radius: 4px;"></div>
      </div>
    </div>

    <!-- Pace text -->
    <p style="font-size: 15px; margin: 0 0 32px 0; color: var(--text-tertiary);">
      {#if paceAhead > 0}
        {paceAhead} book{paceAhead !== 1 ? 's' : ''} ahead of schedule
      {:else if paceAhead < 0}
        {Math.abs(paceAhead)} book{Math.abs(paceAhead) !== 1 ? 's' : ''} behind schedule
      {:else}
        Right on schedule
      {/if}
      (expected {expectedBooks.toFixed(1)} by now)
    </p>
  {/if}

  <!-- Books read this year -->
  {#if booksRead.length > 0}
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
      <h2 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0;">Books Read in {currentYear}</h2>
    </div>
    <div class="poster-grid">
      {#each booksRead as book}
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
  {:else}
    <p style="font-size: 15px; color: var(--text-tertiary);">No books read yet this year.</p>
  {/if}
</div>
{/if}

<style>
  .poster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .poster-item {
    display: block;
    text-decoration: none;
    border-radius: 4px;
    overflow: hidden;
  }

  .update-btn:hover {
    background: rgba(255, 255, 255, 0.03);
  }
</style>
