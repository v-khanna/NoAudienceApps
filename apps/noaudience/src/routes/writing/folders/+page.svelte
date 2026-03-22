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

<div class="max-w-3xl mx-auto">
  <!-- Header -->
  <div class="flex items-center justify-between mb-10">
    <div>
      <h1 class="text-3xl font-bold text-white mb-1.5 tracking-tight" style="font-family: Charter, Georgia, 'Times New Roman', serif;">Folders</h1>
      <p class="text-sm text-[#778899]">Organize your writings</p>
    </div>
    <Button variant="secondary" size="sm" onclick={() => (showNewInput = true)}>
      New Folder
    </Button>
  </div>

  <!-- New Folder Input -->
  {#if showNewInput}
    <div class="mb-8 flex items-center gap-3">
      <input
        type="text"
        bind:value={newFolderName}
        onkeydown={handleKeydown}
        placeholder="Folder name..."
        class="flex-1 px-4 h-11 bg-[#14181C] border border-white/[0.06] rounded-lg text-white text-sm placeholder:text-[#556677] focus:outline-none focus:border-[#40BCF4]/60 focus:ring-1 focus:ring-[#40BCF4]/20 transition-all duration-200"
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
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
    {#each folders as folder (folder.id)}
      <button
        class="flex flex-col gap-3 p-5 rounded-xl border cursor-pointer transition-all duration-250 text-left group {selectedFolder === folder.name
          ? 'bg-white/[0.04] border-[#40BCF4]/30 shadow-lg shadow-[#40BCF4]/5'
          : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.10]'}"
        onclick={() => (selectedFolder = selectedFolder === folder.name ? null : folder.name)}
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br {selectedFolder === folder.name ? 'from-[#40BCF4]/20 to-[#40BCF4]/5' : 'from-[#2C3440] to-[#1B2028]'} flex items-center justify-center transition-colors duration-250">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="{selectedFolder === folder.name ? '#40BCF4' : '#778899'}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <span class="text-[15px] font-medium text-white">{folder.name}</span>
        </div>
        <span class="text-xs text-[#556677]">
          {folder.writingCount} {folder.writingCount === 1 ? 'writing' : 'writings'}
        </span>
      </button>
    {:else}
      <div class="col-span-full flex flex-col items-center justify-center py-20 text-center">
        <div class="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#556677" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p class="text-[#778899] text-sm">No folders yet</p>
        <p class="text-[#556677] text-xs mt-1">Create a folder to organize your writings</p>
      </div>
    {/each}
  </div>

  <!-- Folder Contents -->
  {#if selectedFolder}
    <div class="border-t border-white/[0.06] pt-8">
      <h2 class="text-lg font-semibold text-white mb-5 tracking-tight" style="font-family: Charter, Georgia, 'Times New Roman', serif;">
        {selectedFolder}
        <span class="text-sm font-normal text-[#556677] ml-2">{folderWritings.length}</span>
      </h2>
      {#if folderWritings.length > 0}
        <div class="flex flex-col gap-0.5">
          {#each folderWritings as writing (writing.id)}
            <a
              href="/writing/{writing.id}"
              class="group flex items-center justify-between px-5 py-4 rounded-xl border-l-[3px] border-l-transparent hover:border-l-[#40BCF4] hover:bg-white/[0.02] transition-all duration-250"
            >
              <div class="flex flex-col gap-1.5">
                <span class="text-[16px] text-white group-hover:text-[#40BCF4] transition-colors duration-200 font-bold" style="font-family: Charter, Georgia, 'Times New Roman', serif;">
                  {writing.title}
                </span>
                <span class="text-xs text-[#556677]">{writing.wordCount} words</span>
              </div>
              <span class="text-xs text-[#556677]">{formatDate(writing.updatedAt)}</span>
            </a>
          {/each}
        </div>
      {:else}
        <div class="flex flex-col items-center justify-center py-12 text-center">
          <p class="text-sm text-[#667788]">No writings in this folder</p>
        </div>
      {/if}
    </div>
  {/if}
</div>
