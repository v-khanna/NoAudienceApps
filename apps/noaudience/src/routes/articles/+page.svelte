<script lang="ts">
  import SearchBar from '@noaudience/core/components/SearchBar.svelte';
  import Modal from '@noaudience/core/components/Modal.svelte';
  import { getAllArticles, getOwnPosts, getSavedArticles, searchArticles, addArticle } from '$lib/articles/db';

  let searchQuery = $state('');
  let showSaveModal = $state(false);
  let saveUrl = $state('');

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
<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
  <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0;">Articles</h1>
  <div style="width: 200px;">
    <SearchBar bind:value={searchQuery} placeholder="Search articles..." />
  </div>
  <div style="flex: 1;"></div>
  <a href="/articles/feeds" class="header-btn">Add Feed</a>
  <button class="header-btn" onclick={() => (showSaveModal = true)}>Save</button>
</div>

<!-- Article list -->
{#if recentArticles.length === 0}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 12px; color: var(--text-tertiary);">No articles found</p>
  </div>
{:else}
  <div>
    {#each recentArticles as article, i}
      <a
        href="/articles/{article.id}"
        class="article-row"
        style="
          display: flex;
          align-items: center;
          gap: 12px;
          height: 36px;
          padding: 0 8px;
          text-decoration: none;
          border-bottom: {i < recentArticles.length - 1 ? '1px solid var(--border-subtle)' : 'none'};
          transition: background 150ms ease-out;
        "
      >
        <span style="font-size: 12px; color: var(--text-primary); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          {article.title}
        </span>
        <span style="font-size: 11px; color: var(--text-tertiary); flex-shrink: 0; width: 100px; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          {article.author}
        </span>
        <span style="font-size: 11px; color: var(--text-tertiary); flex-shrink: 0; width: 56px; text-align: right;">
          {formatDate(article.datePublished)}
        </span>
        <span style="font-size: 11px; color: var(--text-tertiary); flex-shrink: 0; width: 40px; text-align: right;">
          {article.readingTimeMinutes}m
        </span>
      </a>
    {/each}
  </div>
{/if}

<!-- Save Article Modal -->
<Modal open={showSaveModal} onclose={() => (showSaveModal = false)} title="Save Article">
  <div style="display: flex; flex-direction: column; gap: 12px;">
    <div>
      <label style="display: block; font-size: 12px; color: var(--text-secondary); margin-bottom: 6px;" for="article-url">Article URL</label>
      <input
        id="article-url"
        type="url"
        bind:value={saveUrl}
        placeholder="https://example.com/article"
        style="
          width: 100%;
          height: 32px;
          padding: 0 12px;
          font-size: 12px;
          background: var(--bg-inset);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--text-primary);
          outline: none;
          box-sizing: border-box;
        "
      />
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 8px; padding-top: 4px;">
      <button class="header-btn" onclick={() => (showSaveModal = false)}>Cancel</button>
      <button class="header-btn" style="color: var(--accent);" onclick={handleSaveArticle}>Save</button>
    </div>
  </div>
</Modal>

<style>
  .header-btn {
    height: 32px;
    padding: 0 12px;
    font-size: 12px;
    font-weight: 500;
    color: var(--accent);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 4px;
    cursor: pointer;
    transition: background 150ms ease-out;
  }

  .header-btn:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .article-row:hover {
    background: rgba(255, 255, 255, 0.03);
  }
</style>
