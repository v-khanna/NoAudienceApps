<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { getArticleById, getHighlightsByArticle, addHighlight } from '$lib/articles/db';
  import { HIGHLIGHT_COLORS } from '$lib/articles/mock';
  import HighlightToolbar from '$lib/articles/HighlightToolbar.svelte';
  import type { Article, Highlight } from '$lib/articles/db';

  let articleId = $derived(Number($page.params.id));
  let article = $state<Article | undefined>(undefined);
  let articleHighlights = $state<Highlight[]>([]);
  let loading = $state(true);

  let toolbarVisible = $state(false);
  let toolbarX = $state(0);
  let toolbarY = $state(0);
  let selectedText = $state('');

  async function loadData() {
    loading = true;
    try {
      const [a, h] = await Promise.all([
        getArticleById(articleId),
        getHighlightsByArticle(articleId),
      ]);
      article = a;
      articleHighlights = h;
    } catch (e) {
      console.error('Failed to load article:', e);
    } finally {
      loading = false;
    }
  }

  // Reload when articleId changes
  $effect(() => {
    const _id = articleId;
    loadData();
  });

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function handleMouseUp() {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      toolbarX = rect.left + rect.width / 2;
      toolbarY = rect.top;
      selectedText = selection.toString().trim();
      toolbarVisible = true;
    } else {
      toolbarVisible = false;
    }
  }

  async function handleHighlightSelect(color: string) {
    if (selectedText) {
      const newHighlight = await addHighlight({
        articleId,
        color: color as 'yellow' | 'blue' | 'green' | 'pink',
        note: '',
        textExact: selectedText,
        textPrefix: '',
        textSuffix: '',
        positionStart: 0,
        positionEnd: selectedText.length,
      });
      articleHighlights = [...articleHighlights, newHighlight];
      toolbarVisible = false;
      window.getSelection()?.removeAllRanges();
    }
  }

  function applyHighlights(html: string, hls: Highlight[]): string {
    let result = html;
    for (const h of hls) {
      const colorHex = HIGHLIGHT_COLORS[h.color ?? 'yellow'] || HIGHLIGHT_COLORS.yellow;
      const escapedText = (h.textExact ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!escapedText) continue;
      const regex = new RegExp(`(${escapedText})`, 'g');
      result = result.replace(
        regex,
        `<mark style="background-color: ${colorHex}33; padding: 1px 0; border-radius: 2px;">$1</mark>`
      );
    }
    return result;
  }

  let processedHtml = $derived(
    article?.contentHtml ? applyHighlights(article.contentHtml, articleHighlights) : ''
  );
</script>

<svelte:window onmouseup={handleMouseUp} />

<HighlightToolbar x={toolbarX} y={toolbarY} visible={toolbarVisible} onselect={handleHighlightSelect} />

{#if loading}
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px;">
    <p style="font-size: 15px; color: var(--text-tertiary);">Loading...</p>
  </div>
{:else if article}
  <div style="max-width: 720px; margin: 0 auto; padding: 40px 24px;">
    <!-- Back link -->
    <a href="/articles" class="back-link" style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-tertiary); text-decoration: none; margin-bottom: 40px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Articles
    </a>

    <!-- Article Header -->
    <header style="margin-bottom: 40px;">
      <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0 0 16px 0; line-height: 1.4; font-family: Georgia, Charter, 'Times New Roman', serif;">
        {article.title}
      </h1>
      <div style="font-size: 14px; color: var(--text-tertiary);">
        {article.author} · {formatDate(article.datePublished)} · {article.readingTimeMinutes} min
      </div>
      <div style="margin-top: 20px; border-top: 1px solid var(--border);"></div>
    </header>

    <!-- Article Content -->
    <article class="article-content">
      {@html processedHtml}
    </article>

    <!-- Highlights section -->
    {#if articleHighlights.length > 0}
      <div style="margin-top: 56px; padding-top: 32px; border-top: 1px solid var(--border);">
        <h3 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin: 0 0 20px 0;">Highlights ({articleHighlights.length})</h3>
        <div style="display: flex; flex-direction: column; gap: 18px;">
          {#each articleHighlights as highlight}
            <div style="padding-left: 20px; border-left: 2px solid {HIGHLIGHT_COLORS[highlight.color ?? 'yellow']};">
              <p style="font-size: 16px; color: var(--text-secondary); line-height: 1.6; margin: 0; font-family: Georgia, Charter, 'Times New Roman', serif; font-style: italic;">"{highlight.textExact}"</p>
              {#if highlight.note}
                <p style="font-size: 14px; color: var(--text-tertiary); margin: 8px 0 0 0;">{highlight.note}</p>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px;">
    <p style="font-size: 15px; color: var(--text-tertiary);">Article not found</p>
    <a href="/articles" style="font-size: 13px; color: var(--accent); text-decoration: none; margin-top: 12px;">Back to Articles</a>
  </div>
{/if}

<style>
  .back-link:hover {
    color: var(--text-primary);
  }

  :global(.article-content) {
    font-size: 18px;
    line-height: 1.7;
    color: var(--text-primary);
    font-family: Georgia, Charter, 'Times New Roman', serif;
  }

  :global(.article-content h2) {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 40px;
    margin-bottom: 16px;
    line-height: 1.3;
    font-family: 'Inter', system-ui, sans-serif;
  }

  :global(.article-content h3) {
    font-size: 17px;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 32px;
    margin-bottom: 12px;
    line-height: 1.3;
    font-family: 'Inter', system-ui, sans-serif;
  }

  :global(.article-content p) {
    margin-bottom: 24px;
  }

  :global(.article-content blockquote) {
    border-left: 2px solid var(--accent);
    padding-left: 20px;
    margin: 28px 0;
    font-style: italic;
    color: var(--text-secondary);
  }

  :global(.article-content blockquote p) {
    margin-bottom: 10px;
  }

  :global(.article-content a) {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-color: rgba(64, 188, 244, 0.3);
  }

  :global(.article-content a:hover) {
    text-decoration-color: var(--accent);
  }

  :global(.article-content img) {
    max-width: 100%;
    border-radius: 4px;
    margin: 24px 0;
  }

  :global(.article-content ul),
  :global(.article-content ol) {
    padding-left: 24px;
    margin-bottom: 24px;
  }

  :global(.article-content li) {
    margin-bottom: 10px;
  }

  :global(.article-content code) {
    background: var(--bg-elevated);
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.875em;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  }

  :global(.article-content pre) {
    background: var(--bg-inset);
    padding: 20px;
    border-radius: 4px;
    overflow-x: auto;
    margin-bottom: 24px;
    border: 1px solid var(--border);
  }

  :global(.article-content pre code) {
    background: none;
    padding: 0;
  }

  :global(.article-content hr) {
    border: none;
    border-top: 1px solid var(--border);
    margin: 40px 0;
  }

  :global(.article-content strong) {
    color: var(--text-primary);
    font-weight: 600;
  }
</style>
