<script lang="ts">
  import Button from '@noaudience/core/components/Button.svelte';
  import { getAllFolders, getWritingsByFolder, createFolder } from '$lib/writing/db.svelte';

  let folders = $derived(getAllFolders());
  let selectedFolder = $state<string | null>(null);
  let folderWritings = $derived(selectedFolder ? getWritingsByFolder(selectedFolder) : []);
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

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
</script>

<div class="max-w-4xl">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-bold text-white mb-1">Folders</h1>
      <p class="text-sm text-[#99AABB]">Organize your writings</p>
    </div>
    <Button variant="secondary" size="sm" onclick={() => (showNewInput = true)}>
      New Folder
    </Button>
  </div>

  <!-- New Folder Input -->
  {#if showNewInput}
    <div class="mb-6 flex items-center gap-3">
      <input
        type="text"
        bind:value={newFolderName}
        onkeydown={handleKeydown}
        placeholder="Folder name..."
        class="flex-1 px-4 h-10 bg-[#1B2028] border border-white/[0.06] rounded-[6px] text-white text-sm placeholder:text-[#99AABB] focus:outline-none focus:border-[#40BCF4] transition-colors"
        autofocus
      />
      <Button variant="primary" size="sm" onclick={handleCreateFolder}>
        Create
      </Button>
      <Button variant="ghost" size="sm" onclick={() => { showNewInput = false; newFolderName = ''; }}>
        Cancel
      </Button>
    </div>
  {/if}

  <!-- Folders Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
    {#each folders as folder (folder.id)}
      <button
        class="flex flex-col gap-2 p-5 rounded-[8px] border cursor-pointer transition-all duration-150 text-left {selectedFolder === folder.name
          ? 'bg-white/[0.06] border-[#40BCF4]/40'
          : 'bg-[#1B2028] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'}"
        onclick={() => (selectedFolder = selectedFolder === folder.name ? null : folder.name)}
      >
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#99AABB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span class="text-[15px] font-medium text-white">{folder.name}</span>
        </div>
        <span class="text-xs text-[#667788]">
          {folder.writingCount} {folder.writingCount === 1 ? 'writing' : 'writings'}
        </span>
      </button>
    {:else}
      <div class="col-span-full text-center py-12 text-[#667788]">
        <p class="text-lg mb-2">No folders yet</p>
        <p class="text-sm">Create a folder to organize your writings</p>
      </div>
    {/each}
  </div>

  <!-- Folder Contents -->
  {#if selectedFolder}
    <div class="border-t border-white/[0.06] pt-6">
      <h2 class="text-lg font-semibold text-white mb-4">
        {selectedFolder}
        <span class="text-sm font-normal text-[#667788] ml-2">{folderWritings.length}</span>
      </h2>
      {#if folderWritings.length > 0}
        <div class="flex flex-col gap-1">
          {#each folderWritings as writing (writing.id)}
            <a
              href="/writing/{writing.id}"
              class="group flex items-center justify-between px-4 py-3 rounded-[8px] hover:bg-white/[0.04] transition-colors"
            >
              <div class="flex flex-col gap-1">
                <span class="text-[15px] text-white group-hover:text-[#40BCF4] transition-colors font-medium">
                  {writing.title}
                </span>
                <span class="text-xs text-[#667788]">{writing.wordCount} words</span>
              </div>
              <span class="text-xs text-[#667788]">{formatDate(writing.updatedAt)}</span>
            </a>
          {/each}
        </div>
      {:else}
        <p class="text-sm text-[#667788] py-4">No writings in this folder</p>
      {/if}
    </div>
  {/if}
</div>
