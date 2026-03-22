<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import SearchBar from '@noaudience/core/components/SearchBar.svelte';
  import { getAllWritings, createWriting, searchWritings, type Writing } from '$lib/writing/db';

  let searchQuery = $state('');
  let allWritings = $state<Writing[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      allWritings = await getAllWritings();
    } catch (e: any) {
      console.error('Failed to load writings:', e);
    } finally {
      loading = false;
    }
  });

  let filteredWritings = $derived.by(() => {
    if (!searchQuery.trim()) return allWritings;
    const q = searchQuery.toLowerCase();
    return allWritings.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        ((w.tags as string[]) ?? []).some((t: string) => t.toLowerCase().includes(q))
    );
  });

  async function handleSearch() {
    if (searchQuery.trim()) {
      allWritings = await searchWritings(searchQuery);
    } else {
      allWritings = await getAllWritings();
    }
  }

  async function handleNew() {
    const writing = await createWriting();
    goto(`/writing/${writing.id}`);
  }

  function formatDate(iso: string | null): string {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
</script>

<!-- Header -->
<div style="display: flex; align-items: center; gap: 16px; margin-bottom: 36px;">
  <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0;">Writing</h1>
  <div style="width: 260px;">
    <SearchBar bind:value={searchQuery} placeholder="Search writings..." />
  </div>
  <div style="flex: 1;"></div>
  <button class="header-btn" onclick={handleNew}>New</button>
</div>

<!-- Writings List -->
{#if loading}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 15px; color: var(--text-tertiary);">Loading...</p>
  </div>
{:else if filteredWritings.length === 0}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 15px; color: var(--text-tertiary);">
      {searchQuery ? 'No writings found' : 'No writings yet'}
    </p>
  </div>
{:else}
  <div>
    {#each filteredWritings as writing, i (writing.id)}
      <a
        href="/writing/{writing.id}"
        class="writing-row"
        style="
          display: flex;
          align-items: center;
          gap: 16px;
          height: 60px;
          padding: 0 12px;
          text-decoration: none;
          border-bottom: {i < filteredWritings.length - 1 ? '1px solid var(--border-subtle)' : 'none'};
          transition: background 150ms ease-out;
        "
      >
        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
          <span style="font-size: 16px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            {writing.title}
          </span>
        </div>
        <span style="font-size: 13px; color: var(--text-tertiary); flex-shrink: 0;">
          {writing.wordCount ?? 0}w
        </span>
        <span style="font-size: 13px; color: var(--text-tertiary); flex-shrink: 0;">
          {formatDate(writing.updatedAt)}
        </span>
      </a>
    {/each}
  </div>
{/if}

<style>
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

  .writing-row:hover {
    background: rgba(255, 255, 255, 0.03);
  }
</style>
