<script lang="ts">
  import { getAllFolders, createFolder } from '$lib/writing/db.svelte';

  let folders = $derived(getAllFolders());
  let showNewInput = $state(false);
  let newFolderName = $state('');

  function handleCreateFolder() {
    const name = newFolderName.trim();
    if (name) {
      createFolder(name);
      newFolderName = '';
      showNewInput = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleCreateFolder();
    } else if (e.key === 'Escape') {
      showNewInput = false;
      newFolderName = '';
    }
  }
</script>

<!-- Header -->
<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
  <a href="/writing" class="back-link" style="font-size: 11px; color: var(--text-tertiary); text-decoration: none;">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  </a>
  <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0;">Folders</h1>
  <div style="flex: 1;"></div>
  <button class="header-btn" onclick={() => (showNewInput = true)}>New Folder</button>
</div>

<!-- New folder input -->
{#if showNewInput}
  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
    <input
      type="text"
      bind:value={newFolderName}
      onkeydown={handleKeydown}
      placeholder="Folder name..."
      style="
        flex: 1;
        height: 32px;
        padding: 0 12px;
        font-size: 12px;
        background: var(--bg-inset);
        border: 1px solid var(--border);
        border-radius: 4px;
        color: var(--text-primary);
        outline: none;
      "
      autofocus
    />
    <button class="header-btn" style="color: var(--accent);" onclick={handleCreateFolder}>Create</button>
    <button class="header-btn" onclick={() => { showNewInput = false; newFolderName = ''; }}>Cancel</button>
  </div>
{/if}

{#if folders.length === 0 && !showNewInput}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 12px; color: var(--text-tertiary);">No folders yet</p>
  </div>
{:else}
  <div>
    {#each folders as folder, i (folder.id)}
      <div
        class="folder-row"
        style="
          display: flex;
          align-items: center;
          gap: 12px;
          height: 36px;
          padding: 0 8px;
          border-bottom: {i < folders.length - 1 ? '1px solid var(--border-subtle)' : 'none'};
          transition: background 150ms ease-out;
        "
      >
        <span style="font-size: 12px; color: var(--text-primary); flex: 1;">{folder.name}</span>
        <span style="font-size: 11px; color: var(--text-tertiary);">{folder.writingCount}</span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .back-link:hover {
    color: var(--text-secondary);
  }

  .header-btn {
    height: 32px;
    padding: 0 12px;
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 4px;
    cursor: pointer;
    transition: background 150ms ease-out;
  }

  .header-btn:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .folder-row:hover {
    background: rgba(255, 255, 255, 0.03);
  }
</style>
