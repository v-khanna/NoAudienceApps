<script lang="ts">
  import { onMount } from 'svelte';
  import { getOwnPosts } from '$lib/articles/db';
  import type { Article } from '$lib/articles/db';

  let posts = $state<Article[]>([]);
  let loading = $state(true);

  async function loadPosts() {
    try {
      posts = await getOwnPosts();
    } catch (e) {
      console.error('Failed to load posts:', e);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    loadPosts();
  });

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
</script>

<!-- Header -->
<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 36px;">
  <a href="/articles" class="back-link" style="font-size: 13px; color: var(--text-tertiary); text-decoration: none;">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  </a>
  <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0;">Your Posts</h1>
</div>

{#if loading}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 15px; color: var(--text-tertiary);">Loading...</p>
  </div>
{:else if posts.length === 0}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 15px; color: var(--text-tertiary);">No posts synced yet</p>
  </div>
{:else}
  <div>
    {#each posts as article, i}
      <a
        href="/articles/{article.id}"
        class="row"
        style="
          display: flex;
          align-items: center;
          gap: 16px;
          height: 52px;
          padding: 0 12px;
          text-decoration: none;
          border-bottom: {i < posts.length - 1 ? '1px solid var(--border-subtle)' : 'none'};
          transition: background 150ms ease-out;
        "
      >
        <span style="font-size: 15px; color: var(--text-primary); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          {article.title}
        </span>
        <span style="font-size: 13px; color: var(--text-tertiary); flex-shrink: 0;">
          {formatDate(article.datePublished)}
        </span>
      </a>
    {/each}
  </div>
{/if}

<style>
  .back-link:hover {
    color: var(--text-secondary);
  }

  .row:hover {
    background: rgba(255, 255, 255, 0.03);
  }
</style>
