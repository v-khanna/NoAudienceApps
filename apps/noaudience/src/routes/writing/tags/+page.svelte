<script lang="ts">
  import { getAllTags, getWritingsByTag } from '$lib/writing/db.svelte';

  let tags = $derived(getAllTags());
  let selectedTag = $state<string | null>(null);
  let tagWritings = $derived(selectedTag ? getWritingsByTag(selectedTag) : []);

  let maxCount = $derived(tags.length > 0 ? Math.max(...tags.map((t) => t.count)) : 1);

  function getTagSize(count: number): string {
    const ratio = count / maxCount;
    if (ratio > 0.75) return 'text-lg px-4 py-2';
    if (ratio > 0.5) return 'text-base px-3.5 py-1.5';
    if (ratio > 0.25) return 'text-sm px-3 py-1.5';
    return 'text-xs px-2.5 py-1';
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
    <div>
      <h1 class="text-3xl font-bold text-white mb-1.5 tracking-tight" style="font-family: Charter, Georgia, 'Times New Roman', serif;">Tags</h1>
      <p class="text-sm text-[#778899]">{tags.length} tag{tags.length !== 1 ? 's' : ''} across your writings</p>
    </div>
  </div>

  <!-- Tag Cloud -->
  {#if tags.length === 0}
    <div class="flex flex-col items-center justify-center py-20 text-center">
      <div class="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#556677" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      </div>
      <p class="text-[#778899] text-sm">No tags yet</p>
      <p class="text-[#556677] text-xs mt-1">Add tags to your writings to organize them</p>
    </div>
  {:else}
    <div class="flex flex-wrap gap-2.5 mb-12">
      {#each tags as { tag, count } (tag)}
        <button
          class="{getTagSize(count)} rounded-full cursor-pointer transition-all duration-250 font-medium {selectedTag === tag
            ? 'bg-[#40BCF4] text-[#0A0E12] shadow-lg shadow-[#40BCF4]/20'
            : 'bg-white/[0.04] text-[#99AABB] hover:bg-white/[0.08] hover:text-white border border-white/[0.06]'}"
          onclick={() => (selectedTag = selectedTag === tag ? null : tag)}
        >
          #{tag}
          <span class="ml-1.5 {selectedTag === tag ? 'text-[#0A0E12]/50' : 'text-[#556677]'}">{count}</span>
        </button>
      {/each}
    </div>
  {/if}

  <!-- Filtered Writings -->
  {#if selectedTag}
    <div class="border-t border-white/[0.06] pt-8">
      <h2 class="text-lg font-semibold text-white mb-5 tracking-tight" style="font-family: Charter, Georgia, 'Times New Roman', serif;">
        Writings tagged "{selectedTag}"
        <span class="text-sm font-normal text-[#556677] ml-2">{tagWritings.length}</span>
      </h2>
      <div class="flex flex-col gap-0.5">
        {#each tagWritings as writing (writing.id)}
          <a
            href="/writing/{writing.id}"
            class="group flex items-center justify-between px-5 py-4 rounded-xl border-l-[3px] border-l-transparent hover:border-l-[#40BCF4] hover:bg-white/[0.02] transition-all duration-250"
          >
            <div class="flex flex-col gap-1.5">
              <span class="text-[16px] text-white group-hover:text-[#40BCF4] transition-colors duration-200 font-bold" style="font-family: Charter, Georgia, 'Times New Roman', serif;">
                {writing.title}
              </span>
              <span class="text-xs text-[#556677]">{writing.wordCount} words</span>
            </div>
            <span class="text-xs text-[#556677]">{formatDate(writing.updatedAt)}</span>
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
