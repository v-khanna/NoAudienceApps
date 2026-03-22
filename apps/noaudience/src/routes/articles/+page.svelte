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
<div class="flex items-center justify-between mb-8">
  <h1 class="text-3xl font-bold text-white">Articles</h1>
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
    <section class="mb-10">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white">Your Posts</h2>
        <a href="/articles/yours" class="text-sm text-[#99AABB] hover:text-white transition-colors">View all</a>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {#each ownPosts.slice(0, 3) as article}
          <a href="/articles/{article.id}" class="group block bg-[#1B2028] rounded-[10px] overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 hover:-translate-y-0.5">
            {#if article.coverImagePath}
              <div class="aspect-video overflow-hidden">
                <img src={article.coverImagePath} alt={article.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            {/if}
            <div class="p-4">
              <h3 class="text-white font-semibold text-base mb-1 line-clamp-2">{article.title}</h3>
              <p class="text-[#99AABB] text-xs mb-2">{formatDate(article.datePublished)}</p>
              <p class="text-[#778899] text-sm line-clamp-2">{article.excerpt}</p>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Saved Posts Section -->
  {#if savedPosts.length > 0}
    <section class="mb-10">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white">Saved Articles</h2>
        <a href="/articles/saved" class="text-sm text-[#99AABB] hover:text-white transition-colors">View all</a>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {#each savedPosts.slice(0, 3) as article}
          <a href="/articles/{article.id}" class="group block bg-[#1B2028] rounded-[10px] overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 hover:-translate-y-0.5">
            {#if article.coverImagePath}
              <div class="aspect-video overflow-hidden">
                <img src={article.coverImagePath} alt={article.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            {/if}
            <div class="p-4">
              <h3 class="text-white font-semibold text-base mb-1 line-clamp-2">{article.title}</h3>
              <div class="flex items-center gap-2 text-xs text-[#99AABB] mb-2">
                <span>{article.author}</span>
                <span class="text-white/20">·</span>
                <span>{article.publication}</span>
                <span class="text-white/20">·</span>
                <span>{formatDate(article.datePublished)}</span>
              </div>
              <p class="text-[#778899] text-sm line-clamp-2">{article.excerpt}</p>
            </div>
          </a>
        {/each}
      </div>
    </section>
  {/if}
{/if}

<!-- Recent / Search Results -->
<section>
  <h2 class="text-lg font-semibold text-white mb-4">
    {searchQuery ? `Results for "${searchQuery}"` : 'Recent'}
  </h2>
  {#if recentArticles.length === 0}
    <p class="text-[#99AABB] text-sm">No articles found.</p>
  {:else}
    <div class="space-y-3">
      {#each recentArticles as article}
        <a href="/articles/{article.id}" class="flex gap-4 p-4 bg-[#1B2028] rounded-[10px] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-200 group">
          {#if article.coverImagePath}
            <div class="w-32 h-20 flex-shrink-0 rounded-[6px] overflow-hidden">
              <img src={article.coverImagePath} alt={article.title} class="w-full h-full object-cover" />
            </div>
          {/if}
          <div class="flex-1 min-w-0">
            <h3 class="text-white font-semibold text-base mb-1 truncate group-hover:text-[#40BCF4] transition-colors">{article.title}</h3>
            <div class="flex items-center gap-2 text-xs text-[#99AABB] mb-1">
              <span>{article.author}</span>
              <span class="text-white/20">·</span>
              <span>{article.publication}</span>
              <span class="text-white/20">·</span>
              <span>{formatDate(article.datePublished)}</span>
              <span class="text-white/20">·</span>
              <span>{article.readingTimeMinutes} min read</span>
            </div>
            <p class="text-[#778899] text-sm truncate">{article.excerpt}</p>
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
        class="w-full px-4 h-10 bg-[#14181C] border border-white/[0.06] rounded-[6px] text-white text-sm placeholder:text-[#99AABB] focus:outline-none focus:border-[#40BCF4] transition-colors"
      />
    </div>
    <div class="flex justify-end gap-2">
      <Button variant="ghost" onclick={() => (showSaveModal = false)}>Cancel</Button>
      <Button onclick={handleSaveArticle}>Save</Button>
    </div>
  </div>
</Modal>

<!-- Add Feed Modal (redirects to feeds page) -->
<Modal open={showAddFeedModal} onclose={() => (showAddFeedModal = false)} title="Add Feed">
  <div class="space-y-4">
    <p class="text-[#99AABB] text-sm">Manage your RSS feeds on the feeds page.</p>
    <div class="flex justify-end gap-2">
      <Button variant="ghost" onclick={() => (showAddFeedModal = false)}>Cancel</Button>
      <a href="/articles/feeds">
        <Button>Go to Feeds</Button>
      </a>
    </div>
  </div>
</Modal>
