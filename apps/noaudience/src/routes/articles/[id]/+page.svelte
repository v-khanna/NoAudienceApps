<script lang="ts">
  import { page } from '$app/stores';
  import { getArticleById, getHighlightsByArticle, addHighlight } from '$lib/articles/db';
  import { HIGHLIGHT_COLORS } from '$lib/articles/mock';
  import HighlightToolbar from '$lib/articles/HighlightToolbar.svelte';

  let articleId = $derived(Number($page.params.id));
  let article = $derived(getArticleById(articleId));
  let articleHighlights = $derived(getHighlightsByArticle(articleId));

  let toolbarVisible = $state(false);
  let toolbarX = $state(0);
  let toolbarY = $state(0);
  let selectedText = $state('');

  function formatDate(dateStr: string): string {
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

  function handleHighlightSelect(color: string) {
    if (selectedText) {
      addHighlight({
        articleId,
        color: color as 'yellow' | 'blue' | 'green' | 'pink',
        note: '',
        textExact: selectedText,
        textPrefix: '',
        textSuffix: '',
        positionStart: 0,
        positionEnd: selectedText.length,
      });
      toolbarVisible = false;
      window.getSelection()?.removeAllRanges();
    }
  }

  function applyHighlights(html: string, highlights: typeof articleHighlights): string {
    let result = html;
    for (const h of highlights) {
      const colorHex = HIGHLIGHT_COLORS[h.color] || HIGHLIGHT_COLORS.yellow;
      const escapedText = h.textExact.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedText})`, 'g');
      result = result.replace(
        regex,
        `<mark style="background-color: ${colorHex}33; padding: 1px 0; border-radius: 2px;">$1</mark>`
      );
    }
    return result;
  }

  let processedHtml = $derived(
    article ? applyHighlights(article.contentHtml, articleHighlights) : ''
  );
</script>

<svelte:window onmouseup={handleMouseUp} />

<HighlightToolbar x={toolbarX} y={toolbarY} visible={toolbarVisible} onselect={handleHighlightSelect} />

{#if article}
  <div style="max-width: 600px; margin: 0 auto; padding: 32px 16px;">
    <!-- Back link -->
    <a href="/articles" class="back-link" style="display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--text-tertiary); text-decoration: none; margin-bottom: 32px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Articles
    </a>

    <!-- Article Header -->
    <header style="margin-bottom: 32px;">
      <h1 style="font-size: 18px; font-weight: 600; color: var(--text-primary); margin: 0 0 12px 0; line-height: 1.4; font-family: Georgia, Charter, 'Times New Roman', serif;">
        {article.title}
      </h1>
      <div style="font-size: 11px; color: var(--text-tertiary);">
        {article.author} · {formatDate(article.datePublished)} · {article.readingTimeMinutes} min
      </div>
      <div style="margin-top: 16px; border-top: 1px solid var(--border);"></div>
    </header>

    <!-- Article Content -->
    <article class="article-content">
      {@html processedHtml}
    </article>

    <!-- Highlights section -->
    {#if articleHighlights.length > 0}
      <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--border);">
        <h3 style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px 0;">Highlights ({articleHighlights.length})</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          {#each articleHighlights as highlight}
            <div style="padding-left: 16px; border-left: 2px solid {HIGHLIGHT_COLORS[highlight.color]};">
              <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 0; font-family: Georgia, Charter, 'Times New Roman', serif; font-style: italic;">"{highlight.textExact}"</p>
              {#if highlight.note}
                <p style="font-size: 12px; color: var(--text-tertiary); margin: 6px 0 0 0;">{highlight.note}</p>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px;">
    <p style="font-size: 12px; color: var(--text-tertiary);">Article not found</p>
    <a href="/articles" style="font-size: 11px; color: var(--accent); text-decoration: none; margin-top: 8px;">Back to Articles</a>
  </div>
{/if}

<style>
  .back-link:hover {
    color: var(--text-primary);
  }

  :global(.article-content) {
    font-size: 16px;
    line-height: 1.7;
    color: var(--text-primary);
    font-family: Georgia, Charter, 'Times New Roman', serif;
  }

  :global(.article-content h2) {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 32px;
    margin-bottom: 12px;
    line-height: 1.3;
    font-family: 'Inter', system-ui, sans-serif;
  }

  :global(.article-content h3) {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    margin-top: 24px;
    margin-bottom: 8px;
    line-height: 1.3;
    font-family: 'Inter', system-ui, sans-serif;
  }

  :global(.article-content p) {
    margin-bottom: 20px;
  }

  :global(.article-content blockquote) {
    border-left: 2px solid var(--accent);
    padding-left: 16px;
    margin: 24px 0;
    font-style: italic;
    color: var(--text-secondary);
  }

  :global(.article-content blockquote p) {
    margin-bottom: 8px;
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
    margin: 20px 0;
  }

  :global(.article-content ul),
  :global(.article-content ol) {
    padding-left: 20px;
    margin-bottom: 20px;
  }

  :global(.article-content li) {
    margin-bottom: 8px;
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
    padding: 16px;
    border-radius: 4px;
    overflow-x: auto;
    margin-bottom: 20px;
    border: 1px solid var(--border);
  }

  :global(.article-content pre code) {
    background: none;
    padding: 0;
  }

  :global(.article-content hr) {
    border: none;
    border-top: 1px solid var(--border);
    margin: 32px 0;
  }

  :global(.article-content strong) {
    color: var(--text-primary);
    font-weight: 600;
  }
</style>
