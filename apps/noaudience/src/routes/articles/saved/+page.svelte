<script lang="ts">
  import SearchBar from '@noaudience/core/components/SearchBar.svelte';
  import { getSavedArticles, searchArticles } from '$lib/articles/db';

  let searchQuery = $state('');

  let allSaved = $derived(getSavedArticles());
  let articles = $derived(
    searchQuery
      ? searchArticles(searchQuery).filter((a) => !a.isOwnPost)
      : allSaved
  );

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
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
      <h1 class="text-3xl font-bold text-white tracking-tight" style="font-family: Georgia, 'Times New Roman', serif;">Saved Articles</h1>
      <p class="text-[#778899] text-sm mt-2">{allSaved.length} article{allSaved.length !== 1 ? 's' : ''} saved</p>
    </div>
    <div class="w-64">
      <SearchBar bind:value={searchQuery} placeholder="Search saved..." />
    </div>
  </div>
</div>

{#if articles.length === 0}
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <div class="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#556677" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </div>
    <p class="text-[#778899] text-sm">{searchQuery ? 'No results found' : 'No saved articles yet'}</p>
    <p class="text-[#556677] text-xs mt-1">{searchQuery ? 'Try a different search term' : 'Save articles from the web to read later'}</p>
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each articles as article}
      <a href="/articles/{article.id}" class="group block rounded-xl overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30">
        <div class="aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#1B2028] to-[#2C3440]">
          {#if article.coverImagePath}
            <img src={article.coverImagePath} alt={article.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {/if}
        </div>
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div class="absolute bottom-0 left-0 right-0 p-5">
          <h3 class="text-white font-bold text-lg leading-snug line-clamp-2 mb-1.5" style="font-family: Georgia, 'Times New Roman', serif;">{article.title}</h3>
          <div class="flex items-center gap-2 text-xs text-white/50">
            <span>{article.author}</span>
            <span class="text-white/30">·</span>
            <span>{article.publication}</span>
            <span class="text-white/30">·</span>
            <span>{formatDate(article.datePublished)}</span>
          </div>
        </div>
      </a>
    {/each}
  </div>
{/if}
