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

  function shelfDotColor(name: string): string {
    if (name === 'Want to Read') return 'bg-[#40BCF4]';
    if (name === 'Currently Reading') return 'bg-[#FF8000]';
    return 'bg-[#00E054]';
  }

  function shelfBorderColor(name: string): string {
    if (name === 'Want to Read') return 'border-l-[#40BCF4]';
    if (name === 'Currently Reading') return 'border-l-[#FF8000]';
    return 'border-l-[#00E054]';
  }
</script>

<div class="p-10 overflow-y-auto h-full space-y-10">
  <h1 class="text-2xl font-bold text-white tracking-tight">Shelves</h1>

  <!-- Default shelves -->
  <section>
    <h2 class="text-[#99AABB] text-xs uppercase tracking-wider mb-4 px-1">Default Shelves</h2>
    <div class="space-y-1.5">
      {#each defaultShelves as shelf}
        {@const count = getShelfBookCount(shelf.id)}
        <button
          class="w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 cursor-pointer border-l-[3px] {
            selectedShelfId === shelf.id
              ? `bg-white/[0.07] text-white ${shelfBorderColor(shelf.name)}`
              : `text-[#99AABB] hover:text-white hover:bg-white/[0.04] border-l-transparent`
          }"
          onclick={() => (selectedShelfId = selectedShelfId === shelf.id ? null : shelf.id)}
        >
          <div class="flex items-center gap-3">
            <span class="w-2.5 h-2.5 rounded-full {shelfDotColor(shelf.name)}"></span>
            <span class="font-medium">{shelf.name}</span>
          </div>
          <span class="text-sm bg-white/[0.06] px-2.5 py-0.5 rounded-full">{count} book{count !== 1 ? 's' : ''}</span>
        </button>
      {/each}
    </div>
  </section>

  <!-- Custom shelves -->
  <section>
    <h2 class="text-[#99AABB] text-xs uppercase tracking-wider mb-4 px-1">Custom Shelves</h2>
    {#if customShelves.length > 0}
      <div class="space-y-1.5 mb-6">
        {#each customShelves as shelf}
          {@const count = getShelfBookCount(shelf.id)}
          <button
            class="w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all duration-200 cursor-pointer border-l-[3px] {
              selectedShelfId === shelf.id
                ? 'bg-white/[0.07] text-white border-l-amber-400'
                : 'text-[#99AABB] hover:text-white hover:bg-white/[0.04] border-l-transparent'
            }"
            onclick={() => (selectedShelfId = selectedShelfId === shelf.id ? null : shelf.id)}
          >
            <div class="flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400/60"></span>
              <span class="font-medium">{shelf.name}</span>
            </div>
            <span class="text-sm bg-white/[0.06] px-2.5 py-0.5 rounded-full">{count} book{count !== 1 ? 's' : ''}</span>
          </button>
        {/each}
      </div>
    {:else}
      <p class="text-[#99AABB] text-sm mb-6 px-1">No custom shelves yet.</p>
    {/if}

    <!-- Add shelf input -->
    <div class="flex gap-3">
      <input
        type="text"
        bind:value={newShelfName}
        onkeydown={handleKeydown}
        placeholder="New shelf name..."
        class="flex-1 px-4 h-11 bg-[#1B2028] border border-white/[0.06] rounded-lg text-white text-sm placeholder:text-[#99AABB]/60 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all duration-200"
      />
      <Button variant="primary" size="md" onclick={addShelf}>Add Shelf</Button>
    </div>
  </section>

  <!-- Selected shelf books -->
  {#if selectedShelf}
    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-white text-xl font-semibold font-serif">{selectedShelf.name}</h2>
        <span class="text-[#99AABB] text-sm">{selectedShelfBooks.length} book{selectedShelfBooks.length !== 1 ? 's' : ''}</span>
      </div>
      {#if selectedShelfBooks.length > 0}
        <PosterGrid>
          {#each selectedShelfBooks as book}
            <div class="shadow-[4px_4px_12px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden hover:shadow-[6px_6px_16px_rgba(0,0,0,0.6)] transition-shadow duration-300">
              <PosterCard
                src={book.coverPath}
                alt={book.title}
                title={book.title}
                subtitle={book.author}
                href="/books/{book.id}"
              />
            </div>
          {/each}
        </PosterGrid>
      {:else}
        <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-2xl p-12 text-center">
          <div class="text-4xl mb-4 opacity-40">📖</div>
          <p class="text-white/80 font-serif text-lg">This shelf is empty.</p>
          <p class="text-[#99AABB] text-sm mt-2">Add books from your library to this shelf.</p>
        </div>
      {/if}
    </section>
  {/if}
</div>
