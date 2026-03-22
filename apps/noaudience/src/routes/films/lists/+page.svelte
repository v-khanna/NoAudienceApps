<script lang="ts">
  import Button from '@noaudience/core/components/Button.svelte';
  import Modal from '@noaudience/core/components/Modal.svelte';
  import { getLists, createList } from '$lib/films/db';

  let lists = $state(getLists());
  let showNewListModal = $state(false);

  let newTitle = $state('');
  let newDescription = $state('');
  let newRanked = $state(false);

  function handleCreateList() {
    if (!newTitle.trim()) return;
    createList(newTitle.trim(), newDescription.trim(), newRanked);
    lists = getLists();
    newTitle = '';
    newDescription = '';
    newRanked = false;
    showNewListModal = false;
  }
</script>

<div class="max-w-4xl">
  <div class="flex items-center justify-between mb-10">
    <h1 class="text-4xl font-bold text-white tracking-tight">Lists</h1>
    <Button variant="primary" onclick={() => showNewListModal = true}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      New List
    </Button>
  </div>

  {#if lists.length > 0}
    <div class="space-y-4">
      {#each lists as list}
        <div class="list-card bg-gradient-to-b from-[#1B2028] to-[#181C22] rounded-xl ring-1 ring-white/[0.04] p-6 hover:ring-white/[0.08] transition-all duration-250 ease-out">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-white font-semibold text-lg tracking-tight">{list.title}</h3>
              {#if list.description}
                <p class="text-[#99AABB] text-sm mt-1.5 leading-relaxed">{list.description}</p>
              {/if}
              <div class="flex items-center gap-3 mt-4 text-xs text-[#667788]">
                <span class="font-medium">{list.films.length} {list.films.length === 1 ? 'film' : 'films'}</span>
                {#if list.ranked}
                  <span class="px-2.5 py-0.5 bg-[#40BCF4]/10 rounded-full text-[#40BCF4] font-medium ring-1 ring-[#40BCF4]/20">Ranked</span>
                {/if}
              </div>
            </div>

            <!-- Film poster previews -->
            {#if list.films.length > 0}
              <div class="flex -space-x-3 ml-6">
                {#each list.films.slice(0, 4) as film, i}
                  <img
                    src={film.posterPath}
                    alt={film.title}
                    class="w-12 h-18 object-cover rounded-[4px] ring-2 ring-[#1B2028] transition-transform duration-200 ease-out hover:scale-110 hover:z-10"
                    style="z-index: {4 - i}"
                  />
                {/each}
                {#if list.films.length > 4}
                  <div
                    class="w-12 h-18 bg-[#2C3440] rounded-[4px] ring-2 ring-[#1B2028] flex items-center justify-center text-xs text-[#99AABB] font-medium"
                    style="z-index: 0"
                  >
                    +{list.films.length - 4}
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center py-28 text-center">
      <div class="w-20 h-20 rounded-full bg-gradient-to-br from-[#1E2530] to-[#14181C] ring-1 ring-white/[0.04] flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2C3440" stroke-width="1.5">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </div>
      <p class="text-[#99AABB] text-lg font-medium">No lists yet</p>
      <p class="text-[#667788] text-sm mt-2 max-w-xs">Create a list to curate and organize your favorite films.</p>
    </div>
  {/if}
</div>

<!-- New List Modal -->
<Modal open={showNewListModal} onclose={() => showNewListModal = false} title="New List">
  <div class="space-y-6">
    <div>
      <label class="block text-[#667788] text-xs font-medium uppercase tracking-widest mb-2">Title</label>
      <input
        type="text"
        bind:value={newTitle}
        placeholder="List name..."
        class="w-full px-4 h-11 bg-[#14181C] ring-1 ring-white/[0.06] rounded-lg text-white text-sm placeholder:text-[#4A5568] focus:outline-none focus:ring-[#40BCF4]/50 transition-all duration-200"
      />
    </div>

    <div class="border-t border-white/[0.04] pt-6">
      <label class="block text-[#667788] text-xs font-medium uppercase tracking-widest mb-2">Description</label>
      <textarea
        bind:value={newDescription}
        placeholder="What is this list about?"
        rows="3"
        class="w-full px-4 py-3 bg-[#14181C] ring-1 ring-white/[0.06] rounded-lg text-white text-sm placeholder:text-[#4A5568] focus:outline-none focus:ring-[#40BCF4]/50 transition-all duration-200 resize-none"
      ></textarea>
    </div>

    <div class="border-t border-white/[0.04] pt-6">
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          bind:checked={newRanked}
          class="w-4 h-4 rounded bg-[#14181C] border-white/[0.12] text-[#00E054] focus:ring-[#00E054] focus:ring-offset-0 cursor-pointer"
        />
        <span class="text-sm text-white">Ranked list</span>
      </label>
    </div>

    <div class="flex justify-end pt-3">
      <Button variant="primary" onclick={handleCreateList} disabled={!newTitle.trim()}>
        Create List
      </Button>
    </div>
  </div>
</Modal>

<style>
  .list-card {
    cursor: pointer;
  }
  .list-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  }
</style>
