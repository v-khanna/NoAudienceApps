<script lang="ts">
  import { onMount } from 'svelte';
  import SearchBar from '@noaudience/core/components/SearchBar.svelte';
  import { getAllHighlights, getArticleById } from '$lib/articles/db';
  import { HIGHLIGHT_COLORS } from '$lib/articles/mock';
  import type { Article, Highlight } from '$lib/articles/db';

  let searchQuery = $state('');
  let activeColorFilter = $state('');
  let allHighlights = $state<Highlight[]>([]);
  let loading = $state(true);

  interface HighlightGroup {
    article: Article;
    highlights: Highlight[];
  }

  let groupedHighlights = $state<HighlightGroup[]>([]);

  async function loadHighlights() {
    try {
      allHighlights = await getAllHighlights();
      await buildGroups();
    } catch (e) {
      console.error('Failed to load highlights:', e);
    } finally {
      loading = false;
    }
  }

  async function buildGroups() {
    let filtered = allHighlights;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          (h.textExact ?? '').toLowerCase().includes(q) ||
          (h.note ?? '').toLowerCase().includes(q)
      );
    } else if (activeColorFilter) {
      filtered = filtered.filter((h) => h.color === activeColorFilter);
    }

    filtered = [...filtered].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));

    // Group by article
    const groupMap = new Map<number, { article: Article | undefined; highlights: Highlight[] }>();
    for (const h of filtered) {
      if (h.articleId == null) continue;
      if (!groupMap.has(h.articleId)) {
        const article = await getArticleById(h.articleId);
        groupMap.set(h.articleId, { article, highlights: [] });
      }
      groupMap.get(h.articleId)!.highlights.push(h);
    }

    groupedHighlights = Array.from(groupMap.values()).filter(
      (g): g is HighlightGroup => g.article != null
    );
  }

  $effect(() => {
    const _q = searchQuery;
    const _c = activeColorFilter;
    if (!loading) {
      buildGroups();
    }
  });

  onMount(() => {
    loadHighlights();
  });

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
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
<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 36px;">
  <a href="/articles" class="back-link" style="font-size: 13px; color: var(--text-tertiary); text-decoration: none;">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  </a>
  <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0;">Annotations</h1>
  <div style="width: 260px;">
    <SearchBar bind:value={searchQuery} placeholder="Search highlights..." />
  </div>
  <div style="flex: 1;"></div>
  <span style="font-size: 13px; color: var(--text-tertiary);">{allHighlights.length} highlights</span>
</div>

<!-- Color filter -->
<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 28px;">
  <span style="font-size: 13px; color: var(--text-tertiary);">Filter:</span>
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

{#if loading}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 15px; color: var(--text-tertiary);">Loading...</p>
  </div>
{:else if groupedHighlights.length === 0}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 15px; color: var(--text-tertiary);">{searchQuery || activeColorFilter ? 'No matching highlights' : 'No highlights yet'}</p>
  </div>
{:else}
  <div style="display: flex; flex-direction: column; gap: 40px;">
    {#each groupedHighlights as group}
      <div>
        <!-- Article header -->
        <a href="/articles/{group.article.id}" class="article-link" style="display: block; font-size: 17px; font-weight: 600; color: var(--text-primary); text-decoration: none; margin-bottom: 16px;">
          {group.article.title}
          <span style="font-size: 13px; font-weight: 400; color: var(--text-tertiary); margin-left: 10px;">{group.article.author} · {formatDate(group.article.datePublished)}</span>
        </a>

        <!-- Highlights -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          {#each group.highlights as highlight}
            <div style="padding-left: 20px; border-left: 2px solid {HIGHLIGHT_COLORS[highlight.color ?? 'yellow']};">
              <p style="font-size: 15px; color: var(--text-secondary); line-height: 1.6; margin: 0; font-style: italic;">"{highlight.textExact}"</p>
              {#if highlight.note}
                <p style="font-size: 14px; color: var(--text-tertiary); margin: 6px 0 0 0;">{highlight.note}</p>
              {/if}
            </div>
          {/each}
        </div>
      </div>
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
    width: 20px;
    height: 20px;
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
    font-size: 13px;
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
