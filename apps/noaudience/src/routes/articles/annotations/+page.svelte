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
    });
  }

  function toggleColorFilter(color: string) {
    activeColorFilter = activeColorFilter === color ? '' : color;
  }

  const colorNames = Object.keys(HIGHLIGHT_COLORS);
</script>

<!-- Header -->
<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
  <a href="/articles" class="back-link" style="font-size: 11px; color: var(--text-tertiary); text-decoration: none;">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  </a>
  <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0;">Annotations</h1>
  <div style="width: 200px;">
    <SearchBar bind:value={searchQuery} placeholder="Search highlights..." />
  </div>
  <div style="flex: 1;"></div>
  <span style="font-size: 11px; color: var(--text-tertiary);">{allHighlights.length} highlights</span>
</div>

<!-- Color filter -->
<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
  <span style="font-size: 11px; color: var(--text-tertiary);">Filter:</span>
  {#each colorNames as color}
    <button
      class="color-dot"
      class:active={activeColorFilter === color}
      style="background-color: {HIGHLIGHT_COLORS[color]};"
      title="{color}"
      onclick={() => toggleColorFilter(color)}
    ></button>
  {/each}
  {#if activeColorFilter}
    <button
      class="clear-btn"
      onclick={() => (activeColorFilter = '')}
    >Clear</button>
  {/if}
</div>

{#if groupedHighlights.length === 0}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 12px; color: var(--text-tertiary);">{searchQuery || activeColorFilter ? 'No matching highlights' : 'No highlights yet'}</p>
  </div>
{:else}
  <div style="display: flex; flex-direction: column; gap: 28px;">
    {#each groupedHighlights as group}
      {#if group.article}
        <div>
          <!-- Article header -->
          <a href="/articles/{group.article.id}" class="article-link" style="display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); text-decoration: none; margin-bottom: 12px;">
            {group.article.title}
            <span style="font-size: 11px; font-weight: 400; color: var(--text-tertiary); margin-left: 8px;">{group.article.author} · {formatDate(group.article.datePublished)}</span>
          </a>

          <!-- Highlights -->
          <div style="display: flex; flex-direction: column; gap: 10px;">
            {#each group.highlights as highlight}
              <div style="padding-left: 16px; border-left: 2px solid {HIGHLIGHT_COLORS[highlight.color]};">
                <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin: 0; font-style: italic;">"{highlight.textExact}"</p>
                {#if highlight.note}
                  <p style="font-size: 12px; color: var(--text-tertiary); margin: 4px 0 0 0;">{highlight.note}</p>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  </div>
{/if}

<style>
  .back-link:hover {
    color: var(--text-secondary);
  }

  .article-link:hover {
    color: var(--accent);
  }

  .color-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    transition: border-color 150ms ease-out;
    padding: 0;
  }

  .color-dot:hover {
    border-color: rgba(255, 255, 255, 0.3);
  }

  .color-dot.active {
    border-color: var(--text-primary);
  }

  .clear-btn {
    font-size: 11px;
    color: var(--text-tertiary);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-left: 4px;
  }

  .clear-btn:hover {
    color: var(--text-secondary);
  }
</style>
