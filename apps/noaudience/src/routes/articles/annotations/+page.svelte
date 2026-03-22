<script lang="ts">
  import SearchBar from '@noaudience/core/components/SearchBar.svelte';
  import { getAllHighlights, getArticleById, searchHighlights, getHighlightsByColor } from '$lib/articles/db';
  import { HIGHLIGHT_COLORS } from '$lib/articles/mock';
  import type { Highlight } from '$lib/articles/mock';

  let searchQuery = $state('');
  let activeColorFilter = $state('');

  let allHighlights = $derived(getAllHighlights());

  let filteredHighlights = $derived.by(() => {
    let result: Highlight[];
    if (searchQuery) {
      result = searchHighlights(searchQuery);
    } else if (activeColorFilter) {
      result = getHighlightsByColor(activeColorFilter);
    } else {
      result = allHighlights;
    }
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  });

  // Group highlights by article
  let groupedHighlights = $derived.by(() => {
    const groups: Map<number, { article: ReturnType<typeof getArticleById>; highlights: typeof filteredHighlights }> = new Map();
    for (const h of filteredHighlights) {
      if (!groups.has(h.articleId)) {
        groups.set(h.articleId, {
          article: getArticleById(h.articleId),
          highlights: [],
        });
      }
      groups.get(h.articleId)!.highlights.push(h);
    }
    return Array.from(groups.values()).filter((g) => g.article);
  });

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function toggleColorFilter(color: string) {
    activeColorFilter = activeColorFilter === color ? '' : color;
  }

  const colorNames = Object.keys(HIGHLIGHT_COLORS);
</script>

<div class="mb-8">
  <a href="/articles" class="inline-flex items-center gap-1.5 text-sm text-[#99AABB] hover:text-white transition-colors mb-4">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
    Articles
  </a>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-white">Annotations</h1>
      <p class="text-[#99AABB] text-sm mt-1">{allHighlights.length} highlights across your articles</p>
    </div>
    <div class="w-64">
      <SearchBar bind:value={searchQuery} placeholder="Search highlights..." />
    </div>
  </div>
</div>

<!-- Color filter -->
<div class="flex items-center gap-2 mb-6">
  <span class="text-xs text-[#99AABB] mr-1">Filter:</span>
  {#each colorNames as color}
    <button
      class="w-6 h-6 rounded-full border-2 transition-all cursor-pointer hover:scale-110"
      class:border-white={activeColorFilter === color}
      class:border-transparent={activeColorFilter !== color}
      style="background-color: {HIGHLIGHT_COLORS[color]};"
      title="{color} highlights"
      onclick={() => toggleColorFilter(color)}
    ></button>
  {/each}
  {#if activeColorFilter}
    <button
      class="text-xs text-[#99AABB] hover:text-white transition-colors ml-2 cursor-pointer"
      onclick={() => (activeColorFilter = '')}
    >
      Clear
    </button>
  {/if}
</div>

{#if groupedHighlights.length === 0}
  <div class="flex items-center justify-center h-48">
    <p class="text-[#99AABB]">{searchQuery || activeColorFilter ? 'No matching highlights.' : 'No highlights yet.'}</p>
  </div>
{:else}
  <div class="space-y-8">
    {#each groupedHighlights as group}
      {#if group.article}
        <div>
          <!-- Article header -->
          <a href="/articles/{group.article.id}" class="flex items-center gap-3 mb-3 group">
            <div class="flex-1 min-w-0">
              <h3 class="text-white font-semibold text-base group-hover:text-[#40BCF4] transition-colors truncate">
                {group.article.title}
              </h3>
              <div class="flex items-center gap-2 text-xs text-[#99AABB]">
                <span>{group.article.author}</span>
                <span class="text-white/20">·</span>
                <span>{formatDate(group.article.datePublished)}</span>
              </div>
            </div>
            <span class="text-xs text-[#778899] bg-[#2C3440] px-2 py-1 rounded-[4px]">
              {group.highlights.length} {group.highlights.length === 1 ? 'highlight' : 'highlights'}
            </span>
          </a>

          <!-- Highlights -->
          <div class="space-y-3 ml-1">
            {#each group.highlights as highlight}
              <div class="pl-4 py-2 border-l-2 bg-[#1B2028] rounded-r-[8px] px-4" style="border-color: {HIGHLIGHT_COLORS[highlight.color]};">
                <p class="text-[#CCDDEE] text-sm leading-relaxed">"{highlight.textExact}"</p>
                {#if highlight.note}
                  <p class="text-[#99AABB] text-xs mt-1.5 italic">{highlight.note}</p>
                {/if}
                <p class="text-[#778899] text-xs mt-1">{formatDate(highlight.createdAt)}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  </div>
{/if}
