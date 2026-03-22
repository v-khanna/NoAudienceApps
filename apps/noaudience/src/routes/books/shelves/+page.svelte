<script lang="ts">
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import {
    getAllShelves,
    getShelfBookCount,
    getBooksOnShelf,
  } from '$lib/books/db';
  import type { BookShelf, Book } from '$lib/books/mock';

  let allShelves = $state(getAllShelves());
  let expandedShelfId = $state<number | null>(null);
  let newShelfName = $state('');

  function addShelf() {
    const name = newShelfName.trim();
    if (!name) return;
    const shelf: BookShelf = {
      id: allShelves.length + 1,
      name,
      exclusive: false,
      position: allShelves.length,
    };
    allShelves = [...allShelves, shelf];
    newShelfName = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') addShelf();
  }
</script>

<div>
  <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0 0 20px 0;">Shelves</h1>

  <div style="display: flex; flex-direction: column; gap: 2px;">
    {#each allShelves as shelf}
      {@const count = getShelfBookCount(shelf.id)}
      {@const isExpanded = expandedShelfId === shelf.id}
      <div>
        <button
          class="shelf-row"
          style="
            display: flex; align-items: center; justify-content: space-between; width: 100%;
            padding: 6px 8px; border: none; border-radius: 4px; cursor: pointer;
            font-size: 13px; background: {isExpanded ? 'rgba(255,255,255,0.06)' : 'transparent'};
            color: {isExpanded ? 'var(--text-primary)' : 'var(--text-secondary)'};
            transition: background 150ms ease-out;
          "
          onclick={() => (expandedShelfId = isExpanded ? null : shelf.id)}
        >
          <span style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0;"></span>
            {shelf.name}
          </span>
          <span style="font-size: 11px; color: var(--text-tertiary);">{count}</span>
        </button>

        {#if isExpanded}
          {@const books = getBooksOnShelf(shelf.id)}
          {#if books.length > 0}
            <div style="padding: 8px 0 12px 0;">
              <div class="poster-grid">
                {#each books as book}
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
            <p style="font-size: 12px; color: var(--text-tertiary); padding: 8px 8px 12px;">No books on this shelf.</p>
          {/if}
        {/if}
      </div>
    {/each}
  </div>

  <!-- Add shelf -->
  <div style="margin-top: 16px;">
    <input
      type="text"
      bind:value={newShelfName}
      onkeydown={handleKeydown}
      placeholder="Add shelf..."
      style="
        height: 28px;
        padding: 0 10px;
        font-size: 12px;
        background: var(--bg-inset);
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--text-primary);
        outline: none;
        width: 200px;
      "
    />
  </div>
</div>

<style>
  .poster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 100px);
    gap: 8px;
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
