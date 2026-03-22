<script lang="ts">
  import { onMount } from 'svelte';
  import { getAllFolders, type WritingFolder } from '$lib/writing/db';

  let folders = $state<WritingFolder[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      folders = await getAllFolders();
    } catch (e: any) {
      console.error('Failed to load folders:', e);
    } finally {
      loading = false;
    }
  });
</script>

<!-- Header -->
<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 36px;">
  <a href="/writing" class="back-link" style="font-size: 13px; color: var(--text-tertiary); text-decoration: none;">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  </a>
  <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0;">Folders</h1>
  <div style="flex: 1;"></div>
  <span style="font-size: 13px; color: var(--text-tertiary);">{folders.length} folders</span>
</div>

{#if loading}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 15px; color: var(--text-tertiary);">Loading...</p>
  </div>
{:else if folders.length === 0}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 15px; color: var(--text-tertiary);">No folders yet. Assign a folder to a writing to create one.</p>
  </div>
{:else}
  <div>
    {#each folders as folder, i}
      <div
        class="folder-row"
        style="
          display: flex;
          align-items: center;
          gap: 16px;
          height: 52px;
          padding: 0 12px;
          border-bottom: {i < folders.length - 1 ? '1px solid var(--border-subtle)' : 'none'};
          transition: background 150ms ease-out;
        "
      >
        <span style="font-size: 15px; color: var(--text-primary); flex: 1;">{folder.name}</span>
        <span style="font-size: 13px; color: var(--text-tertiary);">{folder.writingCount}</span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .back-link:hover {
    color: var(--text-secondary);
  }

  .folder-row:hover {
    background: rgba(255, 255, 255, 0.03);
  }
</style>
