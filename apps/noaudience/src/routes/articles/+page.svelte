<script lang="ts">
  import { onMount } from 'svelte';
  import SearchBar from '@noaudience/core/components/SearchBar.svelte';
  import Modal from '@noaudience/core/components/Modal.svelte';
  import { getAllArticles, searchArticles, addArticle, getAllArticleUrls } from '$lib/articles/db';
  import { syncSubstackArticles } from '$lib/articles/substack';
  import type { Article } from '$lib/articles/db';

  const SUBSTACK_URL = 'https://virkhanna.substack.com';

  let searchQuery = $state('');
  let showSaveModal = $state(false);
  let saveUrl = $state('');
  let articleList = $state<Article[]>([]);
  let loading = $state(true);

  // Sync state
  let syncStatus = $state<'idle' | 'syncing' | 'done' | 'error'>('idle');
  let syncMessage = $state('');
  let syncCount = $state(0);

  async function loadArticles() {
    try {
      if (searchQuery) {
        articleList = await searchArticles(searchQuery);
      } else {
        articleList = await getAllArticles();
      }
    } catch (e) {
      console.error('Failed to load articles:', e);
    } finally {
      loading = false;
    }
  }

  async function handleSync() {
    if (syncStatus === 'syncing') return;
    syncStatus = 'syncing';
    syncMessage = 'Checking for new posts...';
    syncCount = 0;

    try {
      const existingUrls = await getAllArticleUrls();
      const newArticles = await syncSubstackArticles(SUBSTACK_URL, existingUrls);

      if (newArticles.length === 0) {
        syncStatus = 'done';
        syncMessage = 'All posts are up to date';
        return;
      }

      for (const article of newArticles) {
        await addArticle({
          feedId: null,
          sourceUrl: article.sourceUrl,
          title: article.title,
          author: article.author,
          publication: article.publication,
          datePublished: article.datePublished,
          coverImagePath: article.coverImagePath,
          contentHtml: article.contentHtml,
          readingTimeMinutes: article.readingTimeMinutes,
          isOwnPost: true,
        });
        syncCount++;
      }

      syncStatus = 'done';
      syncMessage = `Synced ${syncCount} new post${syncCount !== 1 ? 's' : ''}`;
      await loadArticles();
    } catch (e) {
      syncStatus = 'error';
      syncMessage = e instanceof Error ? e.message : 'Sync failed';
      console.error('Substack sync error:', e);
    }
  }

  // React to search query changes
  $effect(() => {
    // Access searchQuery to track it
    const _q = searchQuery;
    loadArticles();
  });

  onMount(() => {
    handleSync();
  });

  let recentArticles = $derived(
    [...articleList].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  );

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  async function handleSaveArticle() {
    if (saveUrl.trim()) {
      await addArticle({
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
      });
      saveUrl = '';
      showSaveModal = false;
      await loadArticles();
    }
  }
</script>

<!-- Header -->
<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 36px;">
  <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0;">Articles</h1>
  <div style="width: 260px;">
    <SearchBar bind:value={searchQuery} placeholder="Search articles..." />
  </div>
  <div style="flex: 1;"></div>

  <!-- Sync status -->
  {#if syncStatus === 'syncing'}
    <span class="sync-indicator syncing">{syncMessage}</span>
  {:else if syncStatus === 'done'}
    <span class="sync-indicator done">{syncMessage}</span>
  {:else if syncStatus === 'error'}
    <span class="sync-indicator error" title={syncMessage}>Sync failed</span>
  {/if}

  <button class="header-btn" onclick={handleSync} disabled={syncStatus === 'syncing'}>
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; margin-right: 6px;" class:spinning={syncStatus === 'syncing'}>
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
    Sync
  </button>
  <a href="/articles/feeds" class="header-btn">Add Feed</a>
  <button class="header-btn" onclick={() => (showSaveModal = true)}>Save</button>
</div>

<!-- Article list -->
{#if loading}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 15px; color: var(--text-tertiary);">Loading articles...</p>
  </div>
{:else if recentArticles.length === 0}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 15px; color: var(--text-tertiary);">No articles found</p>
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
          gap: 16px;
          height: 52px;
          padding: 0 12px;
          text-decoration: none;
          border-bottom: {i < recentArticles.length - 1 ? '1px solid var(--border-subtle)' : 'none'};
          transition: background 150ms ease-out;
        "
      >
        <span style="font-size: 15px; color: var(--text-primary); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          {article.title}
        </span>
        <span style="font-size: 13px; color: var(--text-tertiary); flex-shrink: 0; width: 120px; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          {article.author}
        </span>
        <span style="font-size: 13px; color: var(--text-tertiary); flex-shrink: 0; width: 64px; text-align: right;">
          {formatDate(article.datePublished)}
        </span>
        <span style="font-size: 13px; color: var(--text-tertiary); flex-shrink: 0; width: 48px; text-align: right;">
          {article.readingTimeMinutes}m
        </span>
      </a>
    {/each}
  </div>
{/if}

<!-- Save Article Modal -->
<Modal open={showSaveModal} onclose={() => (showSaveModal = false)} title="Save Article">
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div>
      <label style="display: block; font-size: 15px; color: var(--text-secondary); margin-bottom: 8px;" for="article-url">Article URL</label>
      <input
        id="article-url"
        type="url"
        bind:value={saveUrl}
        placeholder="https://example.com/article"
        style="
          width: 100%;
          height: 40px;
          padding: 0 14px;
          font-size: 15px;
          background: var(--bg-inset);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--text-primary);
          outline: none;
          box-sizing: border-box;
        "
      />
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px;">
      <button class="header-btn" onclick={() => (showSaveModal = false)}>Cancel</button>
      <button class="header-btn" style="color: var(--accent);" onclick={handleSaveArticle}>Save</button>
    </div>
  </div>
</Modal>

<style>
  .header-btn {
    height: 40px;
    padding: 0 16px;
    font-size: 15px;
    font-weight: 500;
    color: var(--accent);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 4px;
    cursor: pointer;
    transition: background 150ms ease-out;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
  }

  .header-btn:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .header-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .article-row:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .sync-indicator {
    font-size: 13px;
    padding: 6px 12px;
    border-radius: 4px;
  }

  .sync-indicator.syncing {
    color: var(--text-tertiary);
  }

  .sync-indicator.done {
    color: #86EFAC;
  }

  .sync-indicator.error {
    color: #FDA4AF;
  }

  .spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
