<script lang="ts">
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import PosterGrid from '@noaudience/core/components/PosterGrid.svelte';
  import Button from '@noaudience/core/components/Button.svelte';
  import {
    getAllShelves,
    getShelfBookCount,
    getBooksOnShelf,
  } from '$lib/books/db';
  import type { BookShelf, Book } from '$lib/books/mock';

  let allShelves = $state(getAllShelves());
  let selectedShelfId = $state<number | null>(null);
  let newShelfName = $state('');

  let defaultShelves = $derived(allShelves.filter((s) => s.exclusive));
  let customShelves = $derived(allShelves.filter((s) => !s.exclusive));

  let selectedShelf = $derived(
    selectedShelfId !== null ? allShelves.find((s) => s.id === selectedShelfId) : null
  );
  let selectedShelfBooks = $derived(
    selectedShelfId !== null ? getBooksOnShelf(selectedShelfId) : []
  );

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

<div class="p-8 overflow-y-auto h-full space-y-8">
  <h1 class="text-2xl font-bold text-white">Shelves</h1>

  <!-- Default shelves -->
  <section>
    <h2 class="text-[#99AABB] text-xs uppercase tracking-wider mb-3">Default Shelves</h2>
    <div class="space-y-1">
      {#each defaultShelves as shelf}
        {@const count = getShelfBookCount(shelf.id)}
        <button
          class="w-full flex items-center justify-between px-4 py-3 rounded-[8px] transition-colors cursor-pointer {
            selectedShelfId === shelf.id
              ? 'bg-white/[0.07] text-white'
              : 'text-[#99AABB] hover:text-white hover:bg-white/[0.04]'
          }"
          onclick={() => (selectedShelfId = selectedShelfId === shelf.id ? null : shelf.id)}
        >
          <div class="flex items-center gap-3">
            <span class="w-2 h-2 rounded-full {
              shelf.name === 'Want to Read' ? 'bg-[#FF8000]' :
              shelf.name === 'Currently Reading' ? 'bg-[#40BCF4]' :
              'bg-[#00E054]'
            }"></span>
            <span class="font-medium">{shelf.name}</span>
          </div>
          <span class="text-sm">{count} book{count !== 1 ? 's' : ''}</span>
        </button>
      {/each}
    </div>
  </section>

  <!-- Custom shelves -->
  <section>
    <h2 class="text-[#99AABB] text-xs uppercase tracking-wider mb-3">Custom Shelves</h2>
    {#if customShelves.length > 0}
      <div class="space-y-1 mb-4">
        {#each customShelves as shelf}
          {@const count = getShelfBookCount(shelf.id)}
          <button
            class="w-full flex items-center justify-between px-4 py-3 rounded-[8px] transition-colors cursor-pointer {
              selectedShelfId === shelf.id
                ? 'bg-white/[0.07] text-white'
                : 'text-[#99AABB] hover:text-white hover:bg-white/[0.04]'
            }"
            onclick={() => (selectedShelfId = selectedShelfId === shelf.id ? null : shelf.id)}
          >
            <span class="font-medium">{shelf.name}</span>
            <span class="text-sm">{count} book{count !== 1 ? 's' : ''}</span>
          </button>
        {/each}
      </div>
    {:else}
      <p class="text-[#99AABB] text-sm mb-4">No custom shelves yet.</p>
    {/if}

    <!-- Add shelf input -->
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={newShelfName}
        onkeydown={handleKeydown}
        placeholder="New shelf name..."
        class="flex-1 px-4 h-10 bg-[#1B2028] border border-white/[0.06] rounded-[6px] text-white text-sm placeholder:text-[#99AABB] focus:outline-none focus:border-[#40BCF4] transition-colors"
      />
      <Button variant="primary" size="md" onclick={addShelf}>Add Shelf</Button>
    </div>
  </section>

  <!-- Selected shelf books -->
  {#if selectedShelf}
    <section>
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-white text-xl font-semibold">{selectedShelf.name}</h2>
        <span class="text-[#99AABB] text-sm">{selectedShelfBooks.length} book{selectedShelfBooks.length !== 1 ? 's' : ''}</span>
      </div>
      {#if selectedShelfBooks.length > 0}
        <PosterGrid>
          {#each selectedShelfBooks as book}
            <PosterCard
              src={book.coverPath}
              alt={book.title}
              title={book.title}
              subtitle={book.author}
              href="/books/{book.id}"
            />
          {/each}
        </PosterGrid>
      {:else}
        <div class="bg-[#1B2028] border border-white/[0.06] rounded-[12px] p-8 text-center">
          <p class="text-[#99AABB]">No books on this shelf yet.</p>
        </div>
      {/if}
    </section>
  {/if}
</div>
