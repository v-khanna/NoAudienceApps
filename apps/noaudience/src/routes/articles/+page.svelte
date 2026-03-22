<script lang="ts">
  import Button from '@noaudience/core/components/Button.svelte';
  import SearchBar from '@noaudience/core/components/SearchBar.svelte';
  import Modal from '@noaudience/core/components/Modal.svelte';
  import { getAllArticles, getOwnPosts, getSavedArticles, searchArticles, addArticle } from '$lib/articles/db';

  let searchQuery = $state('');
  let showSaveModal = $state(false);
  let showAddFeedModal = $state(false);
  let saveUrl = $state('');

  let ownPosts = $derived(getOwnPosts());
  let savedPosts = $derived(getSavedArticles());
  let allArticles = $derived(
    searchQuery ? searchArticles(searchQuery) : getAllArticles()
  );
  let recentArticles = $derived(
    [...allArticles].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function handleSaveArticle() {
    if (saveUrl.trim()) {
      addArticle({
        feedId: null,
        sourceUrl: saveUrl.trim(),
        title: 'Saved Article',
        author: 'Unknown',
        publication: new URL(saveUrl.trim()).hostname,
        datePublished: new Date().toISOString().split('T')[0],
        coverImagePath: '',
        contentHtml: '<p>Content will be fetched...</p>',
        readingTimeMinutes: 0,
        isOwnPost: false,
        excerpt: 'Article saved from ' + saveUrl.trim(),
      });
      saveUrl = '';
      showSaveModal = false;
    }
  }
</script>

<!-- Header -->
<div class="flex items-center justify-between mb-10">
  <h1 class="text-3xl font-bold text-white" style="font-family: Georgia, 'Times New Roman', serif;">Articles</h1>
  <div class="flex items-center gap-3">
    <div class="w-64">
      <SearchBar bind:value={searchQuery} placeholder="Search articles..." />
    </div>
    <Button variant="secondary" onclick={() => (showAddFeedModal = true)}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5">
        <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" />
      </svg>
      Add Feed
    </Button>
    <Button onclick={() => (showSaveModal = true)}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
      </svg>
      Save Article
    </Button>
  </div>
</div>

{#if !searchQuery}
  <!-- Your Posts Section -->
  {#if ownPosts.length > 0}
    <section class="mb-12">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-white tracking-tight">Your Posts</h2>
        <a href="/articles/yours" class="text-sm text-[#99AABB] hover:text-white transition-colors duration-200">View all</a>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each ownPosts.slice(0, 3) as article}
          <a href="/articles/{article.id}" class="magazine-card group block rounded-xl overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30">
            <div class="aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#1B2028] to-[#2C3440]">
              {#if article.coverImagePath}
                <img src={article.coverImagePath} alt={article.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {/if}
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-5">
              <h3 class="text-white font-bold text-lg leading-snug line-clamp-2 mb-1.5" style="font-family: Georgia, 'Times New Roman', serif;">{article.title}</h3>
              <p class="text-white/60 text-xs">{formatDate(article.datePublished)}</p>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Saved Posts Section -->
  {#if savedPosts.length > 0}
    <section class="mb-12">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-semibold text-white tracking-tight">Saved Articles</h2>
        <a href="/articles/saved" class="text-sm text-[#99AABB] hover:text-white transition-colors duration-200">View all</a>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each savedPosts.slice(0, 3) as article}
          <a href="/articles/{article.id}" class="magazine-card group block rounded-xl overflow-hidden relative transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/30">
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
              </div>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}
{/if}

<!-- Recent / Search Results -->
<section>
  <h2 class="text-lg font-semibold text-white mb-5 tracking-tight">
    {searchQuery ? `Results for "${searchQuery}"` : 'Recent'}
  </h2>
  {#if recentArticles.length === 0}
    <div class="flex flex-col items-center justify-center py-20 text-center">
      <div class="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#556677" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
      <p class="text-[#778899] text-sm">No articles found</p>
      <p class="text-[#556677] text-xs mt-1">Save an article or add a feed to get started</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each recentArticles as article}
        <a href="/articles/{article.id}" class="flex gap-5 p-4 rounded-xl border border-white/[0.04] hover:border-white/[0.10] hover:bg-white/[0.02] transition-all duration-250 group">
          {#if article.coverImagePath}
            <div class="w-36 h-24 flex-shrink-0 rounded-lg overflow-hidden">
              <img src={article.coverImagePath} alt={article.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          {/if}
          <div class="flex-1 min-w-0 flex flex-col justify-center">
            <h3 class="text-white font-semibold text-[17px] mb-1.5 line-clamp-1 group-hover:text-[#40BCF4] transition-colors duration-200" style="font-family: Georgia, 'Times New Roman', serif;">{article.title}</h3>
            <div class="flex items-center gap-2 text-xs text-[#778899] mb-2">
              <span class="text-[#99AABB] font-medium">{article.author}</span>
              <span class="text-white/15">·</span>
              <span>{article.publication}</span>
              <span class="text-white/15">·</span>
              <span>{formatDate(article.datePublished)}</span>
              <span class="text-white/15">·</span>
              <span>{article.readingTimeMinutes} min read</span>
            </div>
            <p class="text-[#667788] text-sm line-clamp-1 leading-relaxed">{article.excerpt}</p>
          </div>
        </a>
      {/each}
    </div>
  {/if}
</section>

<!-- Save Article Modal -->
<Modal open={showSaveModal} onclose={() => (showSaveModal = false)} title="Save Article">
  <div class="space-y-4">
    <div>
      <label class="block text-sm text-[#99AABB] mb-1.5" for="article-url">Article URL</label>
      <input
        id="article-url"
        type="url"
        bind:value={saveUrl}
        placeholder="https://example.com/article"
        class="w-full px-4 h-11 bg-[#14181C] border border-white/[0.06] rounded-lg text-white text-sm placeholder:text-[#556677] focus:outline-none focus:border-[#40BCF4]/60 focus:ring-1 focus:ring-[#40BCF4]/20 transition-all duration-200"
      />
    </div>
    <div class="flex justify-end gap-2 pt-2">
      <Button variant="ghost" onclick={() => (showSaveModal = false)}>Cancel</Button>
      <Button onclick={handleSaveArticle}>Save</Button>
    </div>
  </div>
</Modal>

<!-- Add Feed Modal (redirects to feeds page) -->
<Modal open={showAddFeedModal} onclose={() => (showAddFeedModal = false)} title="Add Feed">
  <div class="space-y-4">
    <p class="text-[#99AABB] text-sm leading-relaxed">Manage your RSS feeds on the feeds page.</p>
    <div class="flex justify-end gap-2 pt-2">
      <Button variant="ghost" onclick={() => (showAddFeedModal = false)}>Cancel</Button>
      <a href="/articles/feeds">
        <Button>Go to Feeds</Button>
      </a>
    </div>
  </div>
</Modal>
