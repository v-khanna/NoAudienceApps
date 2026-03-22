<script lang="ts">
  import { goto } from '$app/navigation';
  import Modal from '@noaudience/core/components/Modal.svelte';
  import { searchOpenLibrary, type OLSearchResult } from './openlibrary';
  import { addBookFromOpenLibrary } from './db';

  interface Props {
    open: boolean;
    onclose: () => void;
    onadd?: () => void;
  }

  let { open, onclose, onadd }: Props = $props();

  let query = $state('');
  let results = $state<OLSearchResult[]>([]);
  let searching = $state(false);
  let adding = $state<string | null>(null);
  let debounceTimer: ReturnType<typeof setTimeout>;

  function handleInput() {
    clearTimeout(debounceTimer);
    if (query.length < 2) {
      results = [];
      return;
    }
    searching = true;
    debounceTimer = setTimeout(async () => {
      try {
        results = await searchOpenLibrary(query);
      } catch (e) {
        console.error('Open Library search failed:', e);
        results = [];
      }
      searching = false;
    }, 300);
  }

  async function addBook(result: OLSearchResult) {
    adding = result.id;
    try {
      const book = await addBookFromOpenLibrary(result);
      onadd?.();
      onclose();
      resetForm();
      goto(`/books/${book.id}`);
    } catch (e) {
      console.error('Failed to add book:', e);
    }
    adding = null;
  }

  function resetForm() {
    query = '';
    results = [];
  }
</script>

<Modal {open} {onclose} title="Add Book">
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div>
      <input
        type="text"
        bind:value={query}
        oninput={handleInput}
        placeholder="Search by title or author..."
        style="
          width: 100%;
          height: 44px;
          padding: 0 14px;
          font-size: 16px;
          background: var(--bg-inset);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--text-primary);
          outline: none;
        "
        class="search-input"
      />
    </div>

    {#if searching}
      <p style="font-size: 14px; color: var(--text-tertiary); text-align: center; padding: 16px 0;">Searching Open Library...</p>
    {/if}

    {#if results.length > 0}
      <div style="display: flex; flex-direction: column; gap: 4px; max-height: 400px; overflow-y: auto;">
        {#each results as result (result.id)}
          <button
            class="result-item"
            onclick={() => addBook(result)}
            disabled={adding === result.id}
          >
            {#if result.coverUrl}
              <img src={result.coverUrl} alt="" style="width: 40px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border); flex-shrink: 0;" />
            {:else}
              <div style="width: 40px; height: 60px; background: var(--bg-inset); border-radius: 4px; border: 1px solid var(--border); flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 14px;">?</div>
            {/if}
            <div style="flex: 1; min-width: 0; text-align: left;">
              <div style="font-size: 15px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{result.title}</div>
              <div style="font-size: 13px; color: var(--text-secondary);">{result.author}{result.year ? ` · ${result.year}` : ''}</div>
              {#if result.pageCount}
                <div style="font-size: 12px; color: var(--text-tertiary);">{result.pageCount} pages</div>
              {/if}
            </div>
            <span style="font-size: 13px; color: var(--accent); flex-shrink: 0;">
              {adding === result.id ? 'Adding...' : '+ Add'}
            </span>
          </button>
        {/each}
      </div>
    {:else if query.length >= 2 && !searching}
      <p style="font-size: 14px; color: var(--text-tertiary); text-align: center; padding: 16px 0;">No books found for "{query}"</p>
    {:else if !searching}
      <p style="font-size: 14px; color: var(--text-tertiary); text-align: center; padding: 24px 0;">Search Open Library to add books to your shelves</p>
    {/if}
  </div>
</Modal>

<style>
  .search-input:focus {
    border-color: var(--accent);
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: none;
    border: 1px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    width: 100%;
    transition: background 150ms, border-color 150ms;
  }

  .result-item:hover {
    background: rgba(255, 255, 255, 0.03);
    border-color: var(--border);
  }

  .result-item:disabled {
    opacity: 0.6;
    cursor: wait;
  }
</style>
