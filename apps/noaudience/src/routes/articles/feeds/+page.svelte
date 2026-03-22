<script lang="ts">
  import { onMount } from 'svelte';
  import Modal from '@noaudience/core/components/Modal.svelte';
  import { getAllFeeds, addFeed, deleteFeed, updateFeedSyncTime } from '$lib/articles/db';
  import type { Feed } from '$lib/articles/db';

  let showAddModal = $state(false);
  let feedUrl = $state('');
  let feedName = $state('');
  let feedList = $state<Feed[]>([]);
  let loading = $state(true);

  async function loadFeeds() {
    try {
      feedList = await getAllFeeds();
    } catch (e) {
      console.error('Failed to load feeds:', e);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadFeeds();
  });

  function formatSyncTime(dateStr: string | null): string {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  }

  async function handleAddFeed() {
    if (feedUrl.trim()) {
      await addFeed({
        url: feedUrl.trim(),
        name: feedName.trim() || new URL(feedUrl.trim()).hostname,
      });
      feedUrl = '';
      feedName = '';
      showAddModal = false;
      await loadFeeds();
    }
  }

  async function handleSync(id: number) {
    await updateFeedSyncTime(id);
    await loadFeeds();
  }

  async function handleDelete(id: number) {
    await deleteFeed(id);
    await loadFeeds();
  }
</script>

<!-- Header -->
<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 36px;">
  <a href="/articles" class="back-link" style="font-size: 13px; color: var(--text-tertiary); text-decoration: none;">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  </a>
  <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0;">Feeds</h1>
  <div style="flex: 1;"></div>
  <button class="header-btn" onclick={() => (showAddModal = true)}>Add Feed</button>
</div>

{#if loading}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 15px; color: var(--text-tertiary);">Loading...</p>
  </div>
{:else if feedList.length === 0}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 15px; color: var(--text-tertiary);">No feeds added yet</p>
  </div>
{:else}
  <div>
    {#each feedList as feed, i}
      <div
        class="feed-row"
        style="
          display: flex;
          align-items: center;
          gap: 16px;
          height: 52px;
          padding: 0 12px;
          border-bottom: {i < feedList.length - 1 ? '1px solid var(--border-subtle)' : 'none'};
          transition: background 150ms ease-out;
        "
      >
        <span style="font-size: 15px; color: var(--text-primary); flex-shrink: 0; min-width: 0; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          {feed.name}
        </span>
        <span style="font-size: 13px; color: var(--text-tertiary); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          {feed.url}
        </span>
        <span style="font-size: 13px; color: var(--text-tertiary); flex-shrink: 0; width: 72px; text-align: right;">
          {formatSyncTime(feed.lastSyncedAt)}
        </span>
        <button class="icon-btn" onclick={() => handleSync(feed.id)} title="Sync">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
        <button class="icon-btn delete-btn" onclick={() => handleDelete(feed.id)} title="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    {/each}
  </div>
{/if}

<!-- Add Feed Modal -->
<Modal open={showAddModal} onclose={() => (showAddModal = false)} title="Add Feed">
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div>
      <label style="display: block; font-size: 15px; color: var(--text-secondary); margin-bottom: 8px;" for="feed-url">Feed URL</label>
      <input
        id="feed-url"
        type="url"
        bind:value={feedUrl}
        placeholder="https://example.com/feed"
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
    <div>
      <label style="display: block; font-size: 15px; color: var(--text-secondary); margin-bottom: 8px;" for="feed-name">Name (optional)</label>
      <input
        id="feed-name"
        type="text"
        bind:value={feedName}
        placeholder="My Favorite Blog"
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
      <button class="header-btn" onclick={() => (showAddModal = false)}>Cancel</button>
      <button class="header-btn" style="color: var(--accent);" onclick={handleAddFeed}>Add</button>
    </div>
  </div>
</Modal>

<style>
  .back-link:hover {
    color: var(--text-secondary);
  }

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
  }

  .header-btn:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .feed-row:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: var(--text-tertiary);
    flex-shrink: 0;
    transition: color 150ms ease-out, background 150ms ease-out;
  }

  .icon-btn:hover {
    color: var(--text-secondary);
    background: rgba(255, 255, 255, 0.03);
  }

  .delete-btn:hover {
    color: #f87171;
  }
</style>
