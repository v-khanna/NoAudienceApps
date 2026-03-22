<script lang="ts">
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import {
    getAllBooks,
    getAllShelves,
    getShelfBookCount,
    getBooksOnShelf,
    getExclusiveShelfForBook,
    getReviewForBook,
    searchBooks,
  } from '$lib/books/db';
  import type { Book, BookShelf } from '$lib/books/mock';

  let viewMode = $state<'grid' | 'table'>('grid');
  let searchQuery = $state('');
  let selectedShelfId = $state<number | null>(null);
  let sortColumn = $state<'title' | 'author' | 'rating' | 'pages' | 'dateRead'>('title');
  let sortAsc = $state(true);

  let allShelves = $state(getAllShelves());
  let allBooks = $state(getAllBooks());

  let filteredBooks = $derived.by(() => {
    let books: Book[];
    if (selectedShelfId !== null) {
      books = getBooksOnShelf(selectedShelfId);
    } else {
      books = allBooks;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      books = books.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }
    return books;
  });

  let sortedBooks = $derived.by(() => {
    const books = [...filteredBooks];
    books.sort((a, b) => {
      let cmp = 0;
      if (sortColumn === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortColumn === 'author') cmp = a.author.localeCompare(b.author);
      else if (sortColumn === 'pages') cmp = a.pageCount - b.pageCount;
      else if (sortColumn === 'rating') {
        const ra = getReviewForBook(a.id)?.rating ?? 0;
        const rb = getReviewForBook(b.id)?.rating ?? 0;
        cmp = ra - rb;
      } else if (sortColumn === 'dateRead') {
        const da = getReviewForBook(a.id)?.dateRead ?? '';
        const db = getReviewForBook(b.id)?.dateRead ?? '';
        cmp = da.localeCompare(db);
      }
      return sortAsc ? cmp : -cmp;
    });
    return books;
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

<div style="display: flex; height: 100%; overflow: hidden;">
  <!-- Sidebar: shelf filter -->
  <div style="width: 160px; flex-shrink: 0; border-right: 1px solid var(--border); overflow-y: auto; padding: 0 12px 12px 0;">
    <button
      class="shelf-btn"
      style="
        display: flex; align-items: center; justify-content: space-between; width: 100%;
        padding: 4px 8px; margin-bottom: 2px; border: none; border-radius: 4px; cursor: pointer;
        font-size: 12px; background: {selectedShelfId === null ? 'rgba(255,255,255,0.06)' : 'transparent'};
        color: {selectedShelfId === null ? 'var(--text-primary)' : 'var(--text-secondary)'};
        transition: background 150ms ease-out;
      "
      onclick={() => (selectedShelfId = null)}
    >
      <span>All</span>
      <span style="font-size: 11px; color: var(--text-tertiary);">{allBooks.length}</span>
    </button>
    {#each allShelves as shelf}
      <button
        class="shelf-btn"
        style="
          display: flex; align-items: center; justify-content: space-between; width: 100%;
          padding: 4px 8px; margin-bottom: 2px; border: none; border-radius: 4px; cursor: pointer;
          font-size: 12px; background: {selectedShelfId === shelf.id ? 'rgba(255,255,255,0.06)' : 'transparent'};
          color: {selectedShelfId === shelf.id ? 'var(--text-primary)' : 'var(--text-secondary)'};
          transition: background 150ms ease-out;
        "
        onclick={() => (selectedShelfId = shelf.id)}
      >
        <span>{shelf.name}</span>
        <span style="font-size: 11px; color: var(--text-tertiary);">{getShelfBookCount(shelf.id)}</span>
      </button>
    {/each}
  </div>

  <!-- Main content -->
  <div style="flex: 1; overflow-y: auto; padding-left: 20px;">
    <!-- Header -->
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
      <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin: 0;">Library</h1>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Filter books..."
        style="
          height: 32px;
          padding: 0 12px;
          font-size: 12px;
          background: var(--bg-inset);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--text-primary);
          outline: none;
          width: 180px;
        "
      />
      <div style="flex: 1;"></div>
      <!-- View toggle: text buttons -->
      <button
        class="view-toggle"
        style="
          font-size: 12px; background: none; border: none; cursor: pointer; padding: 2px 0;
          color: {viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-tertiary)'};
          {viewMode === 'grid' ? 'text-decoration: underline; text-underline-offset: 3px;' : ''}
        "
        onclick={() => (viewMode = 'grid')}
      >Grid</button>
      <button
        class="view-toggle"
        style="
          font-size: 12px; background: none; border: none; cursor: pointer; padding: 2px 0; margin-left: 8px;
          color: {viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-tertiary)'};
          {viewMode === 'table' ? 'text-decoration: underline; text-underline-offset: 3px;' : ''}
        "
        onclick={() => (viewMode = 'table')}
      >Table</button>
    </div>

    <p style="font-size: 11px; color: var(--text-tertiary); margin-bottom: 12px;">{sortedBooks.length} book{sortedBooks.length !== 1 ? 's' : ''}</p>

    {#if sortedBooks.length === 0}
      <p style="font-size: 12px; color: var(--text-tertiary);">No books found.</p>
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
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <thead>
          <tr style="border-bottom: 1px solid var(--border);">
            <th style="text-align: left; padding: 6px 8px; font-size: 11px; color: var(--text-tertiary); font-weight: 500;">
              <button class="sort-btn" onclick={() => toggleSort('title')} style="font-size: 11px; color: var(--text-tertiary); background: none; border: none; cursor: pointer; padding: 0; font-weight: 500;">
                Title{sortIndicator('title')}
              </button>
            </th>
            <th style="text-align: left; padding: 6px 8px; font-size: 11px; color: var(--text-tertiary); font-weight: 500;">
              <button class="sort-btn" onclick={() => toggleSort('author')} style="font-size: 11px; color: var(--text-tertiary); background: none; border: none; cursor: pointer; padding: 0; font-weight: 500;">
                Author{sortIndicator('author')}
              </button>
            </th>
            <th style="text-align: left; padding: 6px 8px; font-size: 11px; color: var(--text-tertiary); font-weight: 500;">
              <button class="sort-btn" onclick={() => toggleSort('rating')} style="font-size: 11px; color: var(--text-tertiary); background: none; border: none; cursor: pointer; padding: 0; font-weight: 500;">
                Rating{sortIndicator('rating')}
              </button>
            </th>
            <th style="text-align: left; padding: 6px 8px; font-size: 11px; color: var(--text-tertiary); font-weight: 500;">Shelf</th>
            <th style="text-align: left; padding: 6px 8px; font-size: 11px; color: var(--text-tertiary); font-weight: 500;">
              <button class="sort-btn" onclick={() => toggleSort('pages')} style="font-size: 11px; color: var(--text-tertiary); background: none; border: none; cursor: pointer; padding: 0; font-weight: 500;">
                Pages{sortIndicator('pages')}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {#each sortedBooks as book}
            {@const review = getReviewForBook(book.id)}
            {@const shelf = getExclusiveShelfForBook(book.id)}
            <tr class="table-row" style="height: 32px; border-bottom: 1px solid var(--border); transition: background 150ms ease-out;">
              <td style="padding: 4px 8px;">
                <a href="/books/{book.id}" style="color: var(--text-primary); text-decoration: none; font-size: 12px;" class="title-link">{book.title}</a>
              </td>
              <td style="padding: 4px 8px; color: var(--text-secondary); font-size: 12px;">{book.author}</td>
              <td style="padding: 4px 8px;">
                {#if review}
                  <StarRating value={review.rating} halfStars={false} readonly size="sm" />
                {:else}
                  <span style="color: var(--text-tertiary); font-size: 11px;">--</span>
                {/if}
              </td>
              <td style="padding: 4px 8px; color: var(--text-tertiary); font-size: 11px;">
                {shelf?.name ?? ''}
              </td>
              <td style="padding: 4px 8px; color: var(--text-tertiary); font-size: 11px;">{book.pageCount}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
</div>

<style>
  .poster-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 100px);
    gap: 8px;
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
