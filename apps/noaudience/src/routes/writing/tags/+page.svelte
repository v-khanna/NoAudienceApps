<script lang="ts">
  import { getAllTags } from '$lib/writing/db.svelte';

  let tags = $derived(getAllTags());
</script>

<!-- Header -->
<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
  <a href="/writing" class="back-link" style="font-size: 11px; color: var(--text-tertiary); text-decoration: none;">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  </a>
  <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0;">Tags</h1>
  <div style="flex: 1;"></div>
  <span style="font-size: 11px; color: var(--text-tertiary);">{tags.length} tags</span>
</div>

{#if tags.length === 0}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 12px; color: var(--text-tertiary);">No tags yet</p>
  </div>
{:else}
  <div>
    {#each tags as { tag, count }, i}
      <div
        class="tag-row"
        style="
          display: flex;
          align-items: center;
          gap: 12px;
          height: 36px;
          padding: 0 8px;
          border-bottom: {i < tags.length - 1 ? '1px solid var(--border-subtle)' : 'none'};
          transition: background 150ms ease-out;
        "
      >
        <span style="font-size: 12px; color: var(--text-primary); flex: 1;">#{tag}</span>
        <span style="font-size: 11px; color: var(--text-tertiary);">{count}</span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .back-link:hover {
    color: var(--text-secondary);
  }

  .tag-row:hover {
    background: rgba(255, 255, 255, 0.03);
  }
</style>
