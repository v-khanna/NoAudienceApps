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
        `<mark style="background-color: ${colorHex}33; padding: 2px 0; border-radius: 2px; transition: background-color 200ms;" onmouseenter="this.style.backgroundColor='${colorHex}55'" onmouseleave="this.style.backgroundColor='${colorHex}33'">$1</mark>`
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
  <div class="max-w-[720px] mx-auto py-12 px-4">
    <!-- Back link -->
    <a href="/articles" class="inline-flex items-center gap-1.5 text-sm text-[#778899] hover:text-white transition-colors duration-200 mb-10">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Back to Articles
    </a>

    <!-- Article Header -->
    <header class="mb-12">
      {#if article.coverImagePath}
        <div class="aspect-[16/9] rounded-xl overflow-hidden mb-8 shadow-2xl shadow-black/40">
          <img src={article.coverImagePath} alt={article.title} class="w-full h-full object-cover" />
        </div>
      {/if}
      <h1 class="text-[2.75rem] leading-[1.12] font-bold text-white mb-6 tracking-tight" style="font-family: Charter, Georgia, 'Times New Roman', serif;">
        {article.title}
      </h1>
      <div class="flex items-center gap-4 text-sm text-[#99AABB]">
        <!-- Author avatar placeholder -->
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#2C3440] to-[#3C4450] flex items-center justify-center flex-shrink-0">
          <span class="text-white/60 text-sm font-medium">{article.author.charAt(0).toUpperCase()}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-white font-medium text-[15px]">{article.author}</span>
          <div class="flex items-center gap-2 text-xs text-[#778899] mt-0.5">
            {#if article.publication}
              <span>{article.publication}</span>
              <span class="text-white/15">·</span>
            {/if}
            <span>{formatDate(article.datePublished)}</span>
            <span class="text-white/15">·</span>
            <span>{article.readingTimeMinutes} min read</span>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="mt-8 border-t border-white/[0.06]"></div>
    </header>

    <!-- Article Content -->
    <article
      class="article-content"
      style="font-family: Charter, Georgia, 'Times New Roman', serif;"
    >
      {@html processedHtml}
    </article>

    <!-- Highlights section -->
    {#if articleHighlights.length > 0}
      <div class="mt-20 pt-10 border-t border-white/[0.06]">
        <h3 class="text-white font-semibold text-lg mb-6 tracking-tight" style="font-family: Charter, Georgia, 'Times New Roman', serif;">Highlights ({articleHighlights.length})</h3>
        <div class="space-y-5">
          {#each articleHighlights as highlight}
            <div class="pl-5 py-3 border-l-[3px] rounded-r-lg bg-white/[0.02]" style="border-color: {HIGHLIGHT_COLORS[highlight.color]};">
              <p class="text-[#CCDDEE] text-[15px] leading-relaxed italic" style="font-family: Charter, Georgia, 'Times New Roman', serif;">"{highlight.textExact}"</p>
              {#if highlight.note}
                <p class="text-[#99AABB] text-sm mt-2">{highlight.note}</p>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div class="flex flex-col items-center justify-center h-64">
    <div class="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#556677" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    </div>
    <p class="text-[#778899]">Article not found</p>
    <a href="/articles" class="text-sm text-[#40BCF4] hover:underline mt-2">Back to Articles</a>
  </div>
{/if}

<style>
  :global(.article-content) {
    font-size: 18px;
    line-height: 1.75;
    color: #CCDDEE;
    max-width: 660px;
    margin: 0 auto;
  }

  :global(.article-content h2) {
    font-size: 1.6rem;
    font-weight: 700;
    color: white;
    margin-top: 3rem;
    margin-bottom: 1rem;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }

  :global(.article-content h3) {
    font-size: 1.3rem;
    font-weight: 600;
    color: white;
    margin-top: 2.5rem;
    margin-bottom: 0.75rem;
    line-height: 1.3;
  }

  :global(.article-content p) {
    margin-bottom: 1.5rem;
  }

  :global(.article-content blockquote) {
    border-left: 3px solid #40BCF4;
    padding-left: 1.5rem;
    margin: 2rem 0;
    font-style: italic;
    color: #AABBCC;
  }

  :global(.article-content blockquote p) {
    margin-bottom: 0.5rem;
  }

  :global(.article-content a) {
    color: #40BCF4;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-color: #40BCF440;
    transition: text-decoration-color 200ms;
  }

  :global(.article-content a:hover) {
    text-decoration-color: #40BCF4;
  }

  :global(.article-content img) {
    max-width: 100%;
    border-radius: 10px;
    margin: 2rem 0;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }

  :global(.article-content ul),
  :global(.article-content ol) {
    padding-left: 1.5rem;
    margin-bottom: 1.5rem;
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
    background: #1B2028;
    padding: 1.25rem;
    border-radius: 10px;
    overflow-x: auto;
    margin-bottom: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.04);
  }

  :global(.article-content pre code) {
    background: none;
    padding: 0;
  }

  :global(.article-content hr) {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    margin: 2.5rem 0;
  }

  :global(.article-content strong) {
    color: white;
    font-weight: 600;
  }
</style>
