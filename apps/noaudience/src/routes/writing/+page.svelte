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

<div class="max-w-3xl mx-auto">
  <!-- Header -->
  <div class="flex items-center justify-between mb-10">
    <h1 class="text-3xl font-bold text-white tracking-tight" style="font-family: Charter, Georgia, 'Times New Roman', serif;">Writing</h1>
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
  <div class="flex items-center justify-between mb-8">
    <div class="flex items-center gap-2">
      {#if filterTag}
        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-[#40BCF4]/10 border border-[#40BCF4]/20 rounded-full text-sm text-[#40BCF4]">
          #{filterTag}
          <button
            class="text-[#40BCF4]/60 hover:text-[#40BCF4] cursor-pointer transition-colors duration-200"
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
    <div class="flex items-center gap-2.5 text-sm text-[#667788]">
      <span class="text-[#556677]">Sort:</span>
      <button
        class="cursor-pointer transition-colors duration-200 {sortBy === 'updatedAt' ? 'text-white' : 'hover:text-white'}"
        onclick={() => (sortBy = 'updatedAt')}
      >Modified</button>
      <span class="text-white/10">|</span>
      <button
        class="cursor-pointer transition-colors duration-200 {sortBy === 'createdAt' ? 'text-white' : 'hover:text-white'}"
        onclick={() => (sortBy = 'createdAt')}
      >Created</button>
      <span class="text-white/10">|</span>
      <button
        class="cursor-pointer transition-colors duration-200 {sortBy === 'title' ? 'text-white' : 'hover:text-white'}"
        onclick={() => (sortBy = 'title')}
      >Title</button>
    </div>
  </div>

  <!-- Writings List -->
  <div class="flex flex-col gap-0.5">
    {#each filteredWritings as writing (writing.id)}
      <a
        href="/writing/{writing.id}"
        class="group flex flex-col gap-2 px-5 py-5 rounded-xl border-l-[3px] border-l-transparent hover:border-l-[#40BCF4] hover:bg-white/[0.02] transition-all duration-250"
      >
        <div class="flex items-start justify-between gap-4">
          <h2 class="text-[18px] font-bold text-white group-hover:text-[#40BCF4] transition-colors duration-200" style="font-family: Charter, Georgia, 'Times New Roman', serif;">
            {writing.title}
          </h2>
          <span class="text-xs text-[#556677] whitespace-nowrap mt-1.5">
            {formatDate(writing.updatedAt)}
          </span>
        </div>
        <p class="text-sm text-[#778899] line-clamp-1 leading-relaxed">
          {writing.excerpt}
        </p>
        <div class="flex items-center gap-3 mt-1">
          {#each writing.tags as tag}
            <button
              class="text-xs text-[#667788] hover:text-[#40BCF4] cursor-pointer transition-colors duration-200"
              onclick={(e) => { e.preventDefault(); e.stopPropagation(); filterTag = tag; }}
            >#{tag}</button>
          {/each}
          <span class="text-xs text-[#445566]">{writing.wordCount} words</span>
          {#if writing.status === 'published'}
            <span class="inline-flex items-center gap-1 text-xs text-[#00E054]">
              <span class="w-1.5 h-1.5 rounded-full bg-[#00E054]"></span>
              Published
            </span>
          {/if}
        </div>
      </a>
    {:else}
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#556677" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>
        {#if searchQuery || filterTag}
          <p class="text-[#778899] text-sm">No writings found</p>
          <p class="text-[#556677] text-xs mt-1">Try a different search or filter</p>
        {:else}
          <p class="text-[#778899] text-sm">No writings yet</p>
          <p class="text-[#556677] text-xs mt-1">Click "New" to start writing</p>
        {/if}
      </div>
    {/each}
  </div>
</div>
