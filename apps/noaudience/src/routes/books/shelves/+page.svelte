<script lang="ts">
  import { onMount } from 'svelte';
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import {
    getAllShelves,
    getShelfBookCount,
    getBooksOnShelf,
    createShelf,
  } from '$lib/books/db';
  import type { BookShelf, Book } from '$lib/books/mock';

  let allShelvesData = $state<BookShelf[]>([]);
  let shelfCounts = $state<Record<number, number>>({});
  let expandedShelfId = $state<number | null>(null);
  let expandedBooks = $state<Book[]>([]);
  let newShelfName = $state('');
  let loaded = $state(false);

  onMount(async () => {
    try {
      await loadShelves();
    } catch (e: any) {
      console.error('Failed to load shelves:', e);
    } finally {
      loaded = true;
    }
  });

  async function loadShelves() {
    const shelves = await getAllShelves();
    allShelvesData = shelves;
    const counts: Record<number, number> = {};
    await Promise.all(
      shelves.map(async (s) => {
        counts[s.id] = await getShelfBookCount(s.id);
      })
    );
    shelfCounts = counts;
  }

  async function toggleShelf(shelfId: number) {
    if (expandedShelfId === shelfId) {
      expandedShelfId = null;
      expandedBooks = [];
    } else {
      expandedShelfId = shelfId;
      expandedBooks = await getBooksOnShelf(shelfId);
    }
  }

  async function addShelf() {
    const name = newShelfName.trim();
    if (!name) return;
    await createShelf(name, false);
    newShelfName = '';
    await loadShelves();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') addShelf();
  }
</script>

{#if loaded}
<div>
  <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0 0 32px 0;">Shelves</h1>

  <div style="display: flex; flex-direction: column; gap: 4px;">
    {#each allShelvesData as shelf}
      {@const cnt = shelfCounts[shelf.id] ?? 0}
      {@const isExpanded = expandedShelfId === shelf.id}
      <div>
        <button
          class="shelf-row"
          style="
            display: flex; align-items: center; justify-content: space-between; width: 100%;
            padding: 10px 12px; border: none; border-radius: 4px; cursor: pointer;
            font-size: 15px; background: {isExpanded ? 'rgba(255,255,255,0.06)' : 'transparent'};
            color: {isExpanded ? 'var(--text-primary)' : 'var(--text-secondary)'};
            transition: background 150ms ease-out;
          "
          onclick={() => toggleShelf(shelf.id)}
        >
          <span style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent); flex-shrink: 0;"></span>
            {shelf.name}
          </span>
          <span style="font-size: 13px; color: var(--text-tertiary);">{cnt}</span>
        </button>

        {#if isExpanded}
          {#if expandedBooks.length > 0}
            <div style="padding: 12px 0 16px 0;">
              <div class="poster-grid">
                {#each expandedBooks as book}
                  <a href="/books/{book.id}" class="poster-item" title={book.title}>
                    <PosterCard
                      src={book.coverPath}
                      alt={book.title}
                      href="/books/{book.id}"
                    />
                  </a>
                {/each}
              </div>
            </div>
          {:else}
            <p style="font-size: 15px; color: var(--text-tertiary); padding: 12px 12px 16px;">No books on this shelf.</p>
          {/if}
        {/if}
      </div>
    {/each}
  </div>

  <!-- Add shelf -->
  <div style="margin-top: 24px;">
    <input
      type="text"
      bind:value={newShelfName}
      onkeydown={handleKeydown}
      placeholder="Add shelf..."
      style="
        height: 40px;
        padding: 0 12px;
        font-size: 15px;
        background: var(--bg-inset);
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--text-primary);
        outline: none;
        width: 240px;
      "
    />
  </div>
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

  .shelf-row:hover {
    background: rgba(255, 255, 255, 0.04);
  }
</style>
