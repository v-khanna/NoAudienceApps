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

<div class="mb-10">
  <a href="/articles" class="inline-flex items-center gap-1.5 text-sm text-[#778899] hover:text-white transition-colors duration-200 mb-5">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
    Articles
  </a>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-white tracking-tight" style="font-family: Georgia, 'Times New Roman', serif;">Annotations</h1>
      <p class="text-[#778899] text-sm mt-2">{allHighlights.length} highlight{allHighlights.length !== 1 ? 's' : ''} across your articles</p>
    </div>
    <div class="w-64">
      <SearchBar bind:value={searchQuery} placeholder="Search highlights..." />
    </div>
  </div>
</div>

<!-- Color filter -->
<div class="flex items-center gap-2.5 mb-8">
  <span class="text-xs text-[#667788] mr-1">Filter:</span>
  {#each colorNames as color}
    <button
      class="w-7 h-7 rounded-full border-2 transition-all duration-200 cursor-pointer hover:scale-110"
      class:border-white={activeColorFilter === color}
      class:border-transparent={activeColorFilter !== color}
      class:shadow-lg={activeColorFilter === color}
      style="background-color: {HIGHLIGHT_COLORS[color]};"
      title="{color} highlights"
      onclick={() => toggleColorFilter(color)}
    ></button>
  {/each}
  {#if activeColorFilter}
    <button
      class="text-xs text-[#778899] hover:text-white transition-colors duration-200 ml-2 cursor-pointer"
      onclick={() => (activeColorFilter = '')}
    >
      Clear
    </button>
  {/if}
</div>

{#if groupedHighlights.length === 0}
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <div class="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#556677" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </div>
    <p class="text-[#778899] text-sm">{searchQuery || activeColorFilter ? 'No matching highlights' : 'No highlights yet'}</p>
    <p class="text-[#556677] text-xs mt-1">Select text while reading to create highlights</p>
  </div>
{:else}
  <div class="space-y-10">
    {#each groupedHighlights as group}
      {#if group.article}
        <div>
          <!-- Article header -->
          <a href="/articles/{group.article.id}" class="flex items-center gap-4 mb-5 group">
            <div class="flex-1 min-w-0">
              <h3 class="text-white font-semibold text-[17px] group-hover:text-[#40BCF4] transition-colors duration-200 truncate" style="font-family: Georgia, 'Times New Roman', serif;">
                {group.article.title}
              </h3>
              <div class="flex items-center gap-2 text-xs text-[#778899] mt-1">
                <span class="text-[#99AABB]">{group.article.author}</span>
                <span class="text-white/15">·</span>
                <span>{formatDate(group.article.datePublished)}</span>
              </div>
            </div>
            <span class="text-xs text-[#667788] bg-white/[0.04] px-2.5 py-1 rounded-full flex-shrink-0">
              {group.highlights.length} {group.highlights.length === 1 ? 'highlight' : 'highlights'}
            </span>
          </a>

          <!-- Highlights -->
          <div class="space-y-4 ml-1">
            {#each group.highlights as highlight}
              <div class="pl-5 py-4 border-l-[3px] rounded-r-lg bg-white/[0.02] px-5 transition-colors duration-200 hover:bg-white/[0.04]" style="border-color: {HIGHLIGHT_COLORS[highlight.color]};">
                <p class="text-[#CCDDEE] text-[15px] leading-[1.7] italic" style="font-family: Charter, Georgia, 'Times New Roman', serif;">"{highlight.textExact}"</p>
                {#if highlight.note}
                  <p class="text-[#99AABB] text-sm mt-2.5 leading-relaxed">{highlight.note}</p>
                {/if}
                <p class="text-[#556677] text-xs mt-2">{formatDate(highlight.createdAt)}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  </div>
{/if}
