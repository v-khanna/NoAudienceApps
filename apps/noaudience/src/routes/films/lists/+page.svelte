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
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-bold text-white">Lists</h1>
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
        <div class="bg-[#1B2028] rounded-[8px] border border-white/[0.06] p-5 hover:border-white/[0.12] transition-colors">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-white font-semibold text-lg">{list.title}</h3>
              {#if list.description}
                <p class="text-[#99AABB] text-sm mt-1">{list.description}</p>
              {/if}
              <div class="flex items-center gap-3 mt-3 text-xs text-[#667788]">
                <span>{list.films.length} {list.films.length === 1 ? 'film' : 'films'}</span>
                {#if list.ranked}
                  <span class="px-2 py-0.5 bg-[#2C3440] rounded-[4px] text-[#40BCF4]">Ranked</span>
                {/if}
              </div>
            </div>

            <!-- Film poster previews -->
            {#if list.films.length > 0}
              <div class="flex -space-x-3 ml-4">
                {#each list.films.slice(0, 4) as film, i}
                  <img
                    src={film.posterPath}
                    alt={film.title}
                    class="w-12 h-18 object-cover rounded-[3px] ring-2 ring-[#1B2028]"
                    style="z-index: {4 - i}"
                  />
                {/each}
                {#if list.films.length > 4}
                  <div
                    class="w-12 h-18 bg-[#2C3440] rounded-[3px] ring-2 ring-[#1B2028] flex items-center justify-center text-xs text-[#99AABB]"
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
    <div class="flex flex-col items-center justify-center py-20 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2C3440" stroke-width="1.5" class="mb-4">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
      <p class="text-[#99AABB]">No lists yet.</p>
      <p class="text-[#667788] text-sm mt-1">Create a list to organize your films.</p>
    </div>
  {/if}
</div>

<!-- New List Modal -->
<Modal open={showNewListModal} onclose={() => showNewListModal = false} title="New List">
  <div class="space-y-5">
    <div>
      <label class="block text-[#99AABB] text-xs font-medium uppercase tracking-wider mb-1.5">Title</label>
      <input
        type="text"
        bind:value={newTitle}
        placeholder="List name..."
        class="w-full px-3 h-10 bg-[#1B2028] border border-white/[0.06] rounded-[6px] text-white text-sm placeholder:text-[#99AABB] focus:outline-none focus:border-[#40BCF4] transition-colors"
      />
    </div>

    <div>
      <label class="block text-[#99AABB] text-xs font-medium uppercase tracking-wider mb-1.5">Description</label>
      <textarea
        bind:value={newDescription}
        placeholder="What is this list about?"
        rows="3"
        class="w-full px-3 py-2 bg-[#1B2028] border border-white/[0.06] rounded-[6px] text-white text-sm placeholder:text-[#99AABB] focus:outline-none focus:border-[#40BCF4] transition-colors resize-none"
      ></textarea>
    </div>

    <label class="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        bind:checked={newRanked}
        class="w-4 h-4 rounded bg-[#1B2028] border-white/[0.12] text-[#00E054] focus:ring-[#00E054] focus:ring-offset-0 cursor-pointer"
      />
      <span class="text-sm text-white">Ranked list</span>
    </label>

    <div class="flex justify-end pt-2">
      <Button variant="primary" onclick={handleCreateList} disabled={!newTitle.trim()}>
        Create List
      </Button>
    </div>
  </div>
</Modal>
