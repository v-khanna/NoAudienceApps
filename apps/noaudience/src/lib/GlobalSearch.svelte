<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { globalSearch, type SearchResult } from '$lib/search';

  let open = $state(false);
  let query = $state('');
  let results = $state<SearchResult[]>([]);
  let selectedIndex = $state(0);
  let searching = $state(false);
  let inputEl = $state<HTMLInputElement | null>(null);
  let debounceTimer: ReturnType<typeof setTimeout>;

  const typeLabels: Record<string, string> = {
    film: 'Films', book: 'Books', article: 'Articles',
    writing: 'Writing', chess: 'Chess',
  };

  const typeIcons: Record<string, string> = {
    film: '🎬', book: '📚', article: '📰',
    writing: '✍️', chess: '♟️',
  };

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      open = !open;
      if (open) {
        query = '';
        results = [];
        selectedIndex = 0;
        setTimeout(() => inputEl?.focus(), 50);
      }
      return;
    }

    if (!open) return;

    if (e.key === 'Escape') {
      open = false;
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      navigateTo(results[selectedIndex]);
    }
  }

  function navigateTo(result: SearchResult) {
    const routes: Record<string, string> = {
      film: '/films', book: '/books', article: '/articles',
      writing: '/writing', chess: '/chess',
    };
    goto(`${routes[result.type]}/${result.id}`);
    open = false;
  }

  async function doSearch(q: string) {
    if (q.length < 2) {
      results = [];
      return;
    }
    searching = true;
    results = await globalSearch(q);
    selectedIndex = 0;
    searching = false;
  }

  function onInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => doSearch(query), 200);
  }

  // Group results by type
  function groupedResults(): { type: string; items: SearchResult[] }[] {
    const groups = new Map<string, SearchResult[]>();
    for (const r of results) {
      if (!groups.has(r.type)) groups.set(r.type, []);
      groups.get(r.type)!.push(r);
    }
    return Array.from(groups.entries()).map(([type, items]) => ({ type, items }));
  }

  function flatIndex(result: SearchResult): number {
    return results.indexOf(result);
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeydown);
  });
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="search-backdrop" onclick={() => open = false}>
    <div class="search-modal" onclick={(e) => e.stopPropagation()}>
      <div class="search-input-wrapper">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          bind:this={inputEl}
          bind:value={query}
          oninput={onInput}
          placeholder="Search films, books, articles, writing, chess..."
          class="search-input"
        />
        <kbd class="search-kbd">ESC</kbd>
      </div>

      {#if results.length > 0}
        <div class="search-results">
          {#each groupedResults() as group}
            <div class="result-group-label">{typeLabels[group.type] || group.type}</div>
            {#each group.items as result}
              <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
              <div
                class="result-item"
                class:selected={flatIndex(result) === selectedIndex}
                onclick={() => navigateTo(result)}
                onmouseenter={() => selectedIndex = flatIndex(result)}
              >
                <span class="result-icon">{typeIcons[result.type] || ''}</span>
                <div class="result-text">
                  <span class="result-title">{result.title}</span>
                  <span class="result-subtitle">{result.subtitle}</span>
                </div>
              </div>
            {/each}
          {/each}
        </div>
      {:else if query.length >= 2 && !searching}
        <div class="search-empty">No results found</div>
      {:else if searching}
        <div class="search-empty">Searching...</div>
      {:else}
        <div class="search-empty">Type to search across all modules</div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .search-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    z-index: 9999;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 20vh;
  }

  .search-modal {
    width: 560px;
    max-height: 420px;
    background: #1E2229;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .search-input-wrapper {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    color: #99AABB;
  }

  .search-input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    font-size: 15px;
    color: #FFFFFF;
    font-family: inherit;
  }

  .search-input::placeholder {
    color: #535353;
  }

  .search-kbd {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.06);
    color: #535353;
    font-family: inherit;
  }

  .search-results {
    overflow-y: auto;
    padding: 6px;
  }

  .result-group-label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #535353;
    padding: 8px 10px 4px;
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 100ms;
  }

  .result-item.selected {
    background: rgba(255, 255, 255, 0.06);
  }

  .result-icon {
    font-size: 16px;
    width: 24px;
    text-align: center;
  }

  .result-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .result-title {
    font-size: 14px;
    font-weight: 500;
    color: #FFFFFF;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .result-subtitle {
    font-size: 12px;
    color: #99AABB;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .search-empty {
    padding: 24px;
    text-align: center;
    font-size: 13px;
    color: #535353;
  }
</style>
