<script lang="ts">
  import { goto } from '$app/navigation';
  import SearchBar from '@noaudience/core/components/SearchBar.svelte';
  import Button from '@noaudience/core/components/Button.svelte';
  import { getAllWritings, getAllTags, createWriting, getWritingsByTag } from '$lib/writing/db.svelte';

  let searchQuery = $state('');
  let sortBy = $state<'updatedAt' | 'createdAt' | 'title'>('updatedAt');
  let filterTag = $state<string | null>(null);

  let allWritings = $derived(getAllWritings());
  let allTags = $derived(getAllTags());

  let filteredWritings = $derived.by(() => {
    let result = filterTag
      ? allWritings.filter((w) => w.tags.includes(filterTag!))
      : allWritings;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.excerpt.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  });

  function handleNew() {
    const writing = createWriting();
    goto(`/writing/${writing.id}`);
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
</script>

<div class="max-w-4xl">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-bold text-white">Writing</h1>
    <div class="flex items-center gap-3">
      <div class="w-64">
        <SearchBar bind:value={searchQuery} placeholder="Search writings..." />
      </div>
      <Button variant="primary" size="md" onclick={handleNew}>
        New
      </Button>
    </div>
  </div>

  <!-- Sort & Filter Bar -->
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-2">
      {#if filterTag}
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#2C3440] rounded-[4px] text-sm text-white">
          {filterTag}
          <button
            class="text-[#99AABB] hover:text-white cursor-pointer"
            onclick={() => (filterTag = null)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </span>
      {/if}
    </div>
    <div class="flex items-center gap-2 text-sm text-[#99AABB]">
      <span>Sort:</span>
      <button
        class="cursor-pointer transition-colors {sortBy === 'updatedAt' ? 'text-white' : 'hover:text-white'}"
        onclick={() => (sortBy = 'updatedAt')}
      >Modified</button>
      <span class="text-white/20">|</span>
      <button
        class="cursor-pointer transition-colors {sortBy === 'createdAt' ? 'text-white' : 'hover:text-white'}"
        onclick={() => (sortBy = 'createdAt')}
      >Created</button>
      <span class="text-white/20">|</span>
      <button
        class="cursor-pointer transition-colors {sortBy === 'title' ? 'text-white' : 'hover:text-white'}"
        onclick={() => (sortBy = 'title')}
      >Title</button>
    </div>
  </div>

  <!-- Writings List -->
  <div class="flex flex-col gap-1">
    {#each filteredWritings as writing (writing.id)}
      <a
        href="/writing/{writing.id}"
        class="group flex flex-col gap-2 px-5 py-4 rounded-[8px] hover:bg-white/[0.04] transition-colors duration-150"
      >
        <div class="flex items-start justify-between gap-4">
          <h2 class="text-[17px] font-semibold text-white group-hover:text-[#40BCF4] transition-colors">
            {writing.title}
          </h2>
          <span class="text-xs text-[#667788] whitespace-nowrap mt-1">
            {formatDate(writing.updatedAt)}
          </span>
        </div>
        <p class="text-sm text-[#99AABB] line-clamp-2 leading-relaxed">
          {writing.excerpt}
        </p>
        <div class="flex items-center gap-3 mt-0.5">
          {#each writing.tags as tag}
            <button
              class="text-xs text-[#667788] hover:text-[#40BCF4] cursor-pointer transition-colors"
              onclick={(e) => { e.preventDefault(); e.stopPropagation(); filterTag = tag; }}
            >#{tag}</button>
          {/each}
          <span class="text-xs text-[#556677]">{writing.wordCount} words</span>
          {#if writing.status === 'published'}
            <span class="text-xs text-[#00E054]">Published</span>
          {/if}
        </div>
      </a>
    {:else}
      <div class="text-center py-16 text-[#667788]">
        {#if searchQuery || filterTag}
          <p class="text-lg mb-2">No writings found</p>
          <p class="text-sm">Try a different search or filter</p>
        {:else}
          <p class="text-lg mb-2">No writings yet</p>
          <p class="text-sm">Click "New" to start writing</p>
        {/if}
      </div>
    {/each}
  </div>
</div>
