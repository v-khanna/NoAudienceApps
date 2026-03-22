<script lang="ts">
  import SearchBar from '@noaudience/core/components/SearchBar.svelte';
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import PosterGrid from '@noaudience/core/components/PosterGrid.svelte';
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

<div class="flex h-full overflow-hidden">
  <!-- Sidebar: shelves -->
  <div class="w-56 flex-shrink-0 border-r border-white/[0.06] overflow-y-auto p-4 space-y-1">
    <h3 class="text-[#99AABB] text-xs uppercase tracking-wider mb-3">Shelves</h3>
    <button
      class="w-full text-left px-3 py-2 rounded-[6px] text-sm transition-colors cursor-pointer {
        selectedShelfId === null
          ? 'bg-white/[0.07] text-white'
          : 'text-[#99AABB] hover:text-white hover:bg-white/[0.04]'
      }"
      onclick={() => (selectedShelfId = null)}
    >
      <span class="flex items-center justify-between">
        <span>All Books</span>
        <span class="text-xs text-[#99AABB]">{allBooks.length}</span>
      </span>
    </button>
    {#each allShelves as shelf}
      <button
        class="w-full text-left px-3 py-2 rounded-[6px] text-sm transition-colors cursor-pointer {
          selectedShelfId === shelf.id
            ? 'bg-white/[0.07] text-white'
            : 'text-[#99AABB] hover:text-white hover:bg-white/[0.04]'
        }"
        onclick={() => (selectedShelfId = shelf.id)}
      >
        <span class="flex items-center justify-between">
          <span>{shelf.name}</span>
          <span class="text-xs text-[#99AABB]">{getShelfBookCount(shelf.id)}</span>
        </span>
      </button>
    {/each}
  </div>

  <!-- Main content -->
  <div class="flex-1 overflow-y-auto p-8">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-bold text-white">Library</h1>
      <div class="flex items-center gap-3">
        <div class="w-64">
          <SearchBar bind:value={searchQuery} placeholder="Filter books..." />
        </div>
        <!-- View toggle -->
        <div class="flex bg-[#1B2028] border border-white/[0.06] rounded-[6px] overflow-hidden">
          <button
            class="px-3 py-2 text-sm cursor-pointer transition-colors {viewMode === 'grid' ? 'bg-white/[0.08] text-white' : 'text-[#99AABB] hover:text-white'}"
            onclick={() => (viewMode = 'grid')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            class="px-3 py-2 text-sm cursor-pointer transition-colors {viewMode === 'table' ? 'bg-white/[0.08] text-white' : 'text-[#99AABB] hover:text-white'}"
            onclick={() => (viewMode = 'table')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Results count -->
    <p class="text-[#99AABB] text-sm mb-4">{sortedBooks.length} book{sortedBooks.length !== 1 ? 's' : ''}</p>

    {#if viewMode === 'grid'}
      <!-- Grid view -->
      <PosterGrid>
        {#each sortedBooks as book}
          {@const review = getReviewForBook(book.id)}
          <div class="group relative">
            <PosterCard
              src={book.coverPath}
              alt={book.title}
              href="/books/{book.id}"
            />
            <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-end pointer-events-none">
              <div class="w-full p-2 bg-gradient-to-t from-black/80 to-transparent rounded-b-[6px]">
                <p class="text-white text-xs font-medium truncate">{book.title}</p>
                <p class="text-[#99AABB] text-[10px] truncate">{book.author}</p>
              </div>
            </div>
          </div>
        {/each}
      </PosterGrid>
    {:else}
      <!-- Table view -->
      <div class="bg-[#1B2028] border border-white/[0.06] rounded-[8px] overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/[0.06]">
              <th class="text-left px-4 py-3 text-[#99AABB] text-xs uppercase tracking-wider w-12">
                &nbsp;
              </th>
              <th class="text-left px-4 py-3">
                <button
                  class="text-[#99AABB] text-xs uppercase tracking-wider hover:text-white cursor-pointer"
                  onclick={() => toggleSort('title')}
                >
                  Title{sortIndicator('title')}
                </button>
              </th>
              <th class="text-left px-4 py-3">
                <button
                  class="text-[#99AABB] text-xs uppercase tracking-wider hover:text-white cursor-pointer"
                  onclick={() => toggleSort('author')}
                >
                  Author{sortIndicator('author')}
                </button>
              </th>
              <th class="text-left px-4 py-3">
                <button
                  class="text-[#99AABB] text-xs uppercase tracking-wider hover:text-white cursor-pointer"
                  onclick={() => toggleSort('rating')}
                >
                  Rating{sortIndicator('rating')}
                </button>
              </th>
              <th class="text-left px-4 py-3 text-[#99AABB] text-xs uppercase tracking-wider">
                Shelf
              </th>
              <th class="text-left px-4 py-3">
                <button
                  class="text-[#99AABB] text-xs uppercase tracking-wider hover:text-white cursor-pointer"
                  onclick={() => toggleSort('dateRead')}
                >
                  Date Read{sortIndicator('dateRead')}
                </button>
              </th>
              <th class="text-left px-4 py-3">
                <button
                  class="text-[#99AABB] text-xs uppercase tracking-wider hover:text-white cursor-pointer"
                  onclick={() => toggleSort('pages')}
                >
                  Pages{sortIndicator('pages')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {#each sortedBooks as book}
              {@const review = getReviewForBook(book.id)}
              {@const shelf = getExclusiveShelfForBook(book.id)}
              <tr class="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                <td class="px-4 py-2">
                  <a href="/books/{book.id}">
                    <img
                      src={book.coverPath}
                      alt={book.title}
                      class="w-8 h-12 object-cover rounded-[3px]"
                      loading="lazy"
                    />
                  </a>
                </td>
                <td class="px-4 py-2">
                  <a href="/books/{book.id}" class="text-white hover:text-[#40BCF4] transition-colors">
                    {book.title}
                  </a>
                </td>
                <td class="px-4 py-2 text-[#99AABB]">{book.author}</td>
                <td class="px-4 py-2">
                  {#if review}
                    <StarRating value={review.rating} halfStars={false} readonly size="sm" />
                  {:else}
                    <span class="text-[#99AABB] text-xs">--</span>
                  {/if}
                </td>
                <td class="px-4 py-2">
                  {#if shelf}
                    <span class="px-2 py-0.5 bg-[#2C3440] text-[#99AABB] text-xs rounded-full">
                      {shelf.name}
                    </span>
                  {/if}
                </td>
                <td class="px-4 py-2 text-[#99AABB] text-xs">{review?.dateRead ?? '--'}</td>
                <td class="px-4 py-2 text-[#99AABB]">{book.pageCount}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
