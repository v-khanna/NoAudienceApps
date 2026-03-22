<script lang="ts">
  import { getAllTags, getWritingsByTag } from '$lib/writing/db.svelte';

  let tags = $derived(getAllTags());
  let selectedTag = $state<string | null>(null);
  let tagWritings = $derived(selectedTag ? getWritingsByTag(selectedTag) : []);

  let maxCount = $derived(tags.length > 0 ? Math.max(...tags.map((t) => t.count)) : 1);

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
    <div>
      <h1 class="text-3xl font-bold text-white mb-1">Tags</h1>
      <p class="text-sm text-[#99AABB]">{tags.length} tags across your writings</p>
    </div>
  </div>

  <!-- Tag Cloud -->
  <div class="flex flex-wrap gap-2 mb-10">
    {#each tags as { tag, count } (tag)}
      <button
        class="px-3 py-1.5 rounded-[6px] text-sm cursor-pointer transition-all duration-150 {selectedTag === tag
          ? 'bg-[#40BCF4] text-[#14181C] font-medium'
          : 'bg-[#1B2028] text-[#99AABB] hover:bg-[#2C3440] hover:text-white border border-white/[0.06]'}"
        onclick={() => (selectedTag = selectedTag === tag ? null : tag)}
      >
        #{tag}
        <span class="ml-1 {selectedTag === tag ? 'text-[#14181C]/60' : 'text-[#667788]'}">{count}</span>
      </button>
    {/each}
  </div>

  <!-- Filtered Writings -->
  {#if selectedTag}
    <div class="border-t border-white/[0.06] pt-6">
      <h2 class="text-lg font-semibold text-white mb-4">
        Writings tagged "{selectedTag}"
        <span class="text-sm font-normal text-[#667788] ml-2">{tagWritings.length}</span>
      </h2>
      <div class="flex flex-col gap-1">
        {#each tagWritings as writing (writing.id)}
          <a
            href="/writing/{writing.id}"
            class="group flex items-center justify-between px-4 py-3 rounded-[8px] hover:bg-white/[0.04] transition-colors"
          >
            <div class="flex flex-col gap-1">
              <span class="text-[15px] text-white group-hover:text-[#40BCF4] transition-colors font-medium">
                {writing.title}
              </span>
              <span class="text-xs text-[#667788]">{writing.wordCount} words</span>
            </div>
            <span class="text-xs text-[#667788]">{formatDate(writing.updatedAt)}</span>
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
