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
      weekday: 'long',
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
        `<mark style="background-color: ${colorHex}4D; padding: 2px 0; border-radius: 2px;">$1</mark>`
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
  <div class="max-w-[660px] mx-auto py-8">
    <!-- Back link -->
    <a href="/articles" class="inline-flex items-center gap-1.5 text-sm text-[#99AABB] hover:text-white transition-colors mb-8">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Back to Articles
    </a>

    <!-- Article Header -->
    <header class="mb-10">
      {#if article.coverImagePath}
        <div class="aspect-video rounded-[10px] overflow-hidden mb-6">
          <img src={article.coverImagePath} alt={article.title} class="w-full h-full object-cover" />
        </div>
      {/if}
      <h1 class="text-[2.5rem] leading-[1.15] font-bold text-white mb-4" style="font-family: Georgia, 'Times New Roman', serif;">
        {article.title}
      </h1>
      <div class="flex items-center gap-3 text-sm text-[#99AABB]">
        <span class="text-white font-medium">{article.author}</span>
        {#if article.publication}
          <span class="text-white/20">·</span>
          <span>{article.publication}</span>
        {/if}
        <span class="text-white/20">·</span>
        <span>{formatDate(article.datePublished)}</span>
        <span class="text-white/20">·</span>
        <span>{article.readingTimeMinutes} min read</span>
      </div>
    </header>

    <!-- Article Content -->
    <article
      class="article-content"
      style="font-family: Georgia, 'Times New Roman', serif;"
    >
      {@html processedHtml}
    </article>

    <!-- Highlights sidebar -->
    {#if articleHighlights.length > 0}
      <div class="mt-16 pt-8 border-t border-white/[0.08]">
        <h3 class="text-white font-semibold text-lg mb-4">Highlights ({articleHighlights.length})</h3>
        <div class="space-y-4">
          {#each articleHighlights as highlight}
            <div class="pl-4 border-l-2" style="border-color: {HIGHLIGHT_COLORS[highlight.color]};">
              <p class="text-[#CCDDEE] text-sm leading-relaxed">"{highlight.textExact}"</p>
              {#if highlight.note}
                <p class="text-[#99AABB] text-xs mt-1.5 italic">{highlight.note}</p>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div class="flex items-center justify-center h-64">
    <p class="text-[#99AABB]">Article not found.</p>
  </div>
{/if}

<style>
  :global(.article-content) {
    font-size: 18px;
    line-height: 1.65;
    color: #CCDDEE;
  }

  :global(.article-content h2) {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-top: 2.5rem;
    margin-bottom: 1rem;
    line-height: 1.3;
  }

  :global(.article-content h3) {
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
    margin-top: 2rem;
    margin-bottom: 0.75rem;
    line-height: 1.3;
  }

  :global(.article-content p) {
    margin-bottom: 1.25rem;
  }

  :global(.article-content blockquote) {
    border-left: 3px solid #40BCF4;
    padding-left: 1.25rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: #99AABB;
  }

  :global(.article-content blockquote p) {
    margin-bottom: 0.5rem;
  }

  :global(.article-content a) {
    color: #40BCF4;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  :global(.article-content a:hover) {
    color: #60CCF8;
  }

  :global(.article-content img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 1.5rem 0;
  }

  :global(.article-content ul),
  :global(.article-content ol) {
    padding-left: 1.5rem;
    margin-bottom: 1.25rem;
  }

  :global(.article-content li) {
    margin-bottom: 0.5rem;
  }

  :global(.article-content code) {
    background: #2C3440;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.875em;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  }

  :global(.article-content pre) {
    background: #2C3440;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 1.25rem;
  }

  :global(.article-content pre code) {
    background: none;
    padding: 0;
  }
</style>
