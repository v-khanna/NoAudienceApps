<script lang="ts">
  import Button from '@noaudience/core/components/Button.svelte';
  import Modal from '@noaudience/core/components/Modal.svelte';
  import { getAllFeeds, addFeed, deleteFeed, updateFeedSyncTime } from '$lib/articles/db';

  let showAddModal = $state(false);
  let feedUrl = $state('');
  let feedName = $state('');

  let feeds = $derived(getAllFeeds());

  function formatSyncTime(dateStr: string | null): string {
    if (!dateStr) return 'Never synced';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  }

  function handleAddFeed() {
    if (feedUrl.trim()) {
      addFeed({
        url: feedUrl.trim(),
        name: feedName.trim() || new URL(feedUrl.trim()).hostname,
      });
      feedUrl = '';
      feedName = '';
      showAddModal = false;
    }
  }

  function handleSync(id: number) {
    updateFeedSyncTime(id);
  }

  function handleDelete(id: number) {
    deleteFeed(id);
  }
</script>

<div class="mb-10">
  <a href="/articles" class="inline-flex items-center gap-1.5 text-sm text-[#778899] hover:text-white transition-colors duration-200 mb-5">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
    Articles
  </a>
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-white tracking-tight" style="font-family: Georgia, 'Times New Roman', serif;">Feeds</h1>
      <p class="text-[#778899] text-sm mt-2">Manage your RSS subscriptions</p>
    </div>
    <Button onclick={() => (showAddModal = true)}>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Add Feed
    </Button>
  </div>
</div>

{#if feeds.length === 0}
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <div class="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#556677" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" />
      </svg>
    </div>
    <p class="text-[#778899] text-sm">No feeds added yet</p>
    <p class="text-[#556677] text-xs mt-1">Add an RSS feed to start syncing articles</p>
  </div>
{:else}
  <div class="space-y-3">
    {#each feeds as feed}
      <div class="flex items-center justify-between p-5 rounded-xl border border-white/[0.04] hover:border-white/[0.10] hover:bg-white/[0.02] transition-all duration-250">
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2C3440] to-[#1B2028] flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#778899" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 11a9 9 0 0 1 9 9" /><path d="M4 4a16 16 0 0 1 16 16" /><circle cx="5" cy="19" r="1" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-white font-semibold text-[15px]">{feed.name}</h3>
            <p class="text-[#556677] text-xs mt-0.5 truncate">{feed.url}</p>
            <div class="flex items-center gap-2 mt-2">
              <span class="inline-flex items-center gap-1.5 text-xs text-[#778899]">
                {#if feed.lastSyncedAt}
                  <span class="w-1.5 h-1.5 rounded-full bg-[#00E054] shadow-[0_0_6px_rgba(0,224,84,0.4)]"></span>
                {:else}
                  <span class="w-1.5 h-1.5 rounded-full bg-[#FF8000] shadow-[0_0_6px_rgba(255,128,0,0.3)]"></span>
                {/if}
                {formatSyncTime(feed.lastSyncedAt)}
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 ml-4">
          <Button variant="ghost" size="sm" onclick={() => handleSync(feed.id)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </Button>
          <Button variant="ghost" size="sm" onclick={() => handleDelete(feed.id)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400/70 hover:text-red-400">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </Button>
        </div>
      </div>
    {/each}
  </div>
{/if}

<!-- Add Feed Modal -->
<Modal open={showAddModal} onclose={() => (showAddModal = false)} title="Add RSS Feed">
  <div class="space-y-4">
    <div>
      <label class="block text-sm text-[#99AABB] mb-1.5" for="feed-url">Feed URL</label>
      <input
        id="feed-url"
        type="url"
        bind:value={feedUrl}
        placeholder="https://example.com/feed"
        class="w-full px-4 h-11 bg-[#14181C] border border-white/[0.06] rounded-lg text-white text-sm placeholder:text-[#556677] focus:outline-none focus:border-[#40BCF4]/60 focus:ring-1 focus:ring-[#40BCF4]/20 transition-all duration-200"
      />
    </div>
    <div>
      <label class="block text-sm text-[#99AABB] mb-1.5" for="feed-name">Name (optional)</label>
      <input
        id="feed-name"
        type="text"
        bind:value={feedName}
        placeholder="My Favorite Blog"
        class="w-full px-4 h-11 bg-[#14181C] border border-white/[0.06] rounded-lg text-white text-sm placeholder:text-[#556677] focus:outline-none focus:border-[#40BCF4]/60 focus:ring-1 focus:ring-[#40BCF4]/20 transition-all duration-200"
      />
    </div>
    <div class="flex justify-end gap-2 pt-2">
      <Button variant="ghost" onclick={() => (showAddModal = false)}>Cancel</Button>
      <Button onclick={handleAddFeed}>Add Feed</Button>
    </div>
  </div>
</Modal>
