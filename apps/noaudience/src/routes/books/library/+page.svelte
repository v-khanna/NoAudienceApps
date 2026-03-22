<script lang="ts">
  import { onMount } from 'svelte';
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import {
    getAllBooks,
    getAllShelves,
    getShelfBookCount,
    getBooksOnShelf,
    getExclusiveShelfForBook,
    getReviewForBook,
  } from '$lib/books/db';
  import type { Book, BookShelf, BookReview } from '$lib/books/mock';

  let viewMode = $state<'grid' | 'table'>('grid');
  let searchQuery = $state('');
  let selectedShelfId = $state<number | null>(null);
  let sortColumn = $state<'title' | 'author' | 'rating' | 'pages' | 'dateRead'>('title');
  let sortAsc = $state(true);
  let loaded = $state(false);

  let allShelvesData = $state<BookShelf[]>([]);
  let allBooksData = $state<Book[]>([]);
  let shelfCounts = $state<Record<number, number>>({});
  let displayBooks = $state<Book[]>([]);

  // Cache for reviews looked up during sorting/rendering
  let reviewCache = $state<Record<number, BookReview | undefined>>({});

  onMount(async () => {
    try {
      const [shelves, bks] = await Promise.all([getAllShelves(), getAllBooks()]);
      allShelvesData = shelves;
      allBooksData = bks;
      displayBooks = bks;

      // Load shelf counts in parallel
      const counts: Record<number, number> = {};
      await Promise.all(
        shelves.map(async (s) => {
          counts[s.id] = await getShelfBookCount(s.id);
        })
      );
      shelfCounts = counts;

      // Preload reviews for all books
      const cache: Record<number, BookReview | undefined> = {};
      await Promise.all(
        bks.map(async (b) => {
          cache[b.id] = await getReviewForBook(b.id);
        })
      );
      reviewCache = cache;
    } catch (e: any) {
      console.error('Failed to load library:', e);
    } finally {
      loaded = true;
    }
  });

  async function selectShelf(shelfId: number | null) {
    selectedShelfId = shelfId;
    if (shelfId !== null) {
      displayBooks = await getBooksOnShelf(shelfId);
    } else {
      displayBooks = allBooksData;
    }
  }

  let filteredBooks = $derived.by(() => {
    let bks = displayBooks;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      bks = bks.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }
    return bks;
  });

  let sortedBooks = $derived.by(() => {
    const bks = [...filteredBooks];
    bks.sort((a, b) => {
      let cmp = 0;
      if (sortColumn === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortColumn === 'author') cmp = a.author.localeCompare(b.author);
      else if (sortColumn === 'pages') cmp = a.pageCount - b.pageCount;
      else if (sortColumn === 'rating') {
        const ra = reviewCache[a.id]?.rating ?? 0;
        const rb = reviewCache[b.id]?.rating ?? 0;
        cmp = ra - rb;
      } else if (sortColumn === 'dateRead') {
        const da = reviewCache[a.id]?.dateRead ?? '';
        const db_ = reviewCache[b.id]?.dateRead ?? '';
        cmp = da.localeCompare(db_);
      }
      return sortAsc ? cmp : -cmp;
    });
    return bks;
  });

  // Shelf lookup cache for table view
  let shelfCache = $state<Record<number, BookShelf | undefined>>({});

  // Load exclusive shelves for display books when they change
  $effect(() => {
    const bks = displayBooks;
    if (!loaded) return;
    (async () => {
      const cache: Record<number, BookShelf | undefined> = {};
      await Promise.all(
        bks.map(async (b) => {
          cache[b.id] = await getExclusiveShelfForBook(b.id);
        })
      );
      shelfCache = cache;
    })();
  });

  function toggleSort(col: typeof sortColumn) {
    if (sortColumn === col) {
      sortAsc = !sortAsc;
    } else {
      sortColumn = col;
      sortAsc = true;
    }
  }

  function sortIndicator(col: typeof sortColumn): string {
    if (sortColumn !== col) return '';
    return sortAsc ? ' \u2191' : ' \u2193';
  }
</script>

{#if loaded}
<div style="display: flex; height: 100%; overflow: hidden;">
  <!-- Sidebar: shelf filter -->
  <div style="width: 200px; flex-shrink: 0; border-right: 1px solid var(--border); overflow-y: auto; padding: 0 16px 16px 0;">
    <button
      class="shelf-btn"
      style="
        display: flex; align-items: center; justify-content: space-between; width: 100%;
        padding: 8px 10px; margin-bottom: 2px; border: none; border-radius: 4px; cursor: pointer;
        font-size: 15px; background: {selectedShelfId === null ? 'rgba(255,255,255,0.06)' : 'transparent'};
        color: {selectedShelfId === null ? 'var(--text-primary)' : 'var(--text-secondary)'};
        transition: background 150ms ease-out;
      "
      onclick={() => selectShelf(null)}
    >
      <span>All</span>
      <span style="font-size: 13px; color: var(--text-tertiary);">{allBooksData.length}</span>
    </button>
    {#each allShelvesData as shelf}
      <button
        class="shelf-btn"
        style="
          display: flex; align-items: center; justify-content: space-between; width: 100%;
          padding: 8px 10px; margin-bottom: 2px; border: none; border-radius: 4px; cursor: pointer;
          font-size: 15px; background: {selectedShelfId === shelf.id ? 'rgba(255,255,255,0.06)' : 'transparent'};
          color: {selectedShelfId === shelf.id ? 'var(--text-primary)' : 'var(--text-secondary)'};
          transition: background 150ms ease-out;
        "
        onclick={() => selectShelf(shelf.id)}
      >
        <span>{shelf.name}</span>
        <span style="font-size: 13px; color: var(--text-tertiary);">{shelfCounts[shelf.id] ?? 0}</span>
      </button>
    {/each}
  </div>

  <!-- Main content -->
  <div style="flex: 1; overflow-y: auto; padding-left: 24px;">
    <!-- Header -->
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
      <h1 style="font-size: 28px; font-weight: 700; color: var(--text-primary); margin: 0;">Library</h1>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Filter books..."
        style="
          height: 40px;
          padding: 0 12px;
          font-size: 15px;
          background: var(--bg-inset);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--text-primary);
          outline: none;
          width: 200px;
        "
      />
      <div style="flex: 1;"></div>
      <!-- View toggle: text buttons -->
      <button
        class="view-toggle"
        style="
          font-size: 15px; background: none; border: none; cursor: pointer; padding: 2px 0;
          color: {viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-tertiary)'};
          {viewMode === 'grid' ? 'text-decoration: underline; text-underline-offset: 3px;' : ''}
        "
        onclick={() => (viewMode = 'grid')}
      >Grid</button>
      <button
        class="view-toggle"
        style="
          font-size: 15px; background: none; border: none; cursor: pointer; padding: 2px 0; margin-left: 8px;
          color: {viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-tertiary)'};
          {viewMode === 'table' ? 'text-decoration: underline; text-underline-offset: 3px;' : ''}
        "
        onclick={() => (viewMode = 'table')}
      >Table</button>
    </div>

    <p style="font-size: 13px; color: var(--text-tertiary); margin-bottom: 16px;">{sortedBooks.length} book{sortedBooks.length !== 1 ? 's' : ''}</p>

    {#if sortedBooks.length === 0}
      <p style="font-size: 15px; color: var(--text-tertiary);">No books found.</p>
    {:else if viewMode === 'grid'}
      <div class="poster-grid">
        {#each sortedBooks as book}
          <a href="/books/{book.id}" class="poster-item" title={book.title}>
            <PosterCard
              src={book.coverPath}
              alt={book.title}
              href="/books/{book.id}"
            />
          </a>
        {/each}
      </div>
    {:else}
      <!-- Table view -->
      <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border);">
            <th style="text-align: left; padding: 10px 12px; font-size: 13px; color: var(--text-tertiary); font-weight: 500;">
              <button class="sort-btn" onclick={() => toggleSort('title')} style="font-size: 13px; color: var(--text-tertiary); background: none; border: none; cursor: pointer; padding: 0; font-weight: 500;">
                Title{sortIndicator('title')}
              </button>
            </th>
            <th style="text-align: left; padding: 10px 12px; font-size: 13px; color: var(--text-tertiary); font-weight: 500;">
              <button class="sort-btn" onclick={() => toggleSort('author')} style="font-size: 13px; color: var(--text-tertiary); background: none; border: none; cursor: pointer; padding: 0; font-weight: 500;">
                Author{sortIndicator('author')}
              </button>
            </th>
            <th style="text-align: left; padding: 10px 12px; font-size: 13px; color: var(--text-tertiary); font-weight: 500;">
              <button class="sort-btn" onclick={() => toggleSort('rating')} style="font-size: 13px; color: var(--text-tertiary); background: none; border: none; cursor: pointer; padding: 0; font-weight: 500;">
                Rating{sortIndicator('rating')}
              </button>
            </th>
            <th style="text-align: left; padding: 10px 12px; font-size: 13px; color: var(--text-tertiary); font-weight: 500;">Shelf</th>
            <th style="text-align: left; padding: 10px 12px; font-size: 13px; color: var(--text-tertiary); font-weight: 500;">
              <button class="sort-btn" onclick={() => toggleSort('pages')} style="font-size: 13px; color: var(--text-tertiary); background: none; border: none; cursor: pointer; padding: 0; font-weight: 500;">
                Pages{sortIndicator('pages')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {#each sortedBooks as book}
            {@const rv = reviewCache[book.id]}
            {@const shelf = shelfCache[book.id]}
            <tr class="table-row" style="height: 48px; border-bottom: 1px solid var(--border); transition: background 150ms ease-out;">
              <td style="padding: 8px 12px;">
                <a href="/books/{book.id}" style="color: var(--text-primary); text-decoration: none; font-size: 15px;" class="title-link">{book.title}</a>
              </td>
              <td style="padding: 8px 12px; color: var(--text-secondary); font-size: 15px;">{book.author}</td>
              <td style="padding: 8px 12px;">
                {#if rv}
                  <StarRating value={rv.rating} halfStars={false} readonly size="sm" />
                {:else}
                  <span style="color: var(--text-tertiary); font-size: 13px;">--</span>
                {/if}
              </td>
              <td style="padding: 8px 12px; color: var(--text-tertiary); font-size: 13px;">
                {shelf?.name ?? ''}
              </td>
              <td style="padding: 8px 12px; color: var(--text-tertiary); font-size: 13px;">{book.pageCount}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>
{/if}

<style>
  .poster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }

  .poster-item {
    display: block;
    text-decoration: none;
    border-radius: 4px;
    overflow: hidden;
  }

  .shelf-btn:hover {
    background: rgba(255, 255, 255, 0.04);
  }

  .table-row:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  .title-link:hover {
    color: var(--accent);
  }

  .sort-btn:hover {
    color: var(--text-secondary);
  }

  .view-toggle:hover {
    color: var(--text-primary);
  }
</style>
