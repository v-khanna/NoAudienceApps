<script lang="ts">
  import { goto } from '$app/navigation';
  import SearchBar from '@noaudience/core/components/SearchBar.svelte';
  import { getAllWritings, createWriting } from '$lib/writing/db.svelte';

  let searchQuery = $state('');

  let allWritings = $derived(getAllWritings());

  let filteredWritings = $derived.by(() => {
    let result = allWritings;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.excerpt.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return [...result].sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });

  function handleNew() {
    const writing = createWriting();
    goto(`/writing/${writing.id}`);
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }
</script>

<!-- Header -->
<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
  <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0;">Writing</h1>
  <div style="width: 200px;">
    <SearchBar bind:value={searchQuery} placeholder="Search writings..." />
  </div>
  <div style="flex: 1;"></div>
  <button class="header-btn" onclick={handleNew}>New</button>
</div>

<!-- Writings List -->
{#if filteredWritings.length === 0}
  <div style="padding: 48px 0; text-align: center;">
    <p style="font-size: 12px; color: var(--text-tertiary);">
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
          gap: 12px;
          height: 44px;
          padding: 0 8px;
          text-decoration: none;
          border-bottom: {i < filteredWritings.length - 1 ? '1px solid var(--border-subtle)' : 'none'};
          transition: background 150ms ease-out;
        "
      >
        <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;">
          <span style="font-size: 13px; font-weight: 600; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            {writing.title}
          </span>
          <span style="font-size: 11px; color: var(--text-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            {writing.excerpt}
          </span>
        </div>
        <span style="font-size: 11px; color: var(--text-tertiary); flex-shrink: 0;">
          {writing.wordCount}w
        </span>
        <span style="font-size: 11px; color: var(--text-tertiary); flex-shrink: 0;">
          {formatDate(writing.updatedAt)}
        </span>
      </a>
    {/each}
  </div>
{/if}

<style>
  .header-btn {
    height: 32px;
    padding: 0 12px;
    font-size: 12px;
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
