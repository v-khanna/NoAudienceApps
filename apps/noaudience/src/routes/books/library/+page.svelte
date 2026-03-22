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

  function shelfColor(name: string): string {
    if (name === 'Read') return 'bg-[#00E054]';
    if (name === 'Currently Reading') return 'bg-[#FF8000]';
    if (name === 'Want to Read') return 'bg-[#40BCF4]';
    return 'bg-[#99AABB]';
  }

  function shelfTextColor(name: string): string {
    if (name === 'Read') return 'text-[#00E054] bg-[#00E054]/[0.1] border-[#00E054]/20';
    if (name === 'Currently Reading') return 'text-[#FF8000] bg-[#FF8000]/[0.1] border-[#FF8000]/20';
    if (name === 'Want to Read') return 'text-[#40BCF4] bg-[#40BCF4]/[0.1] border-[#40BCF4]/20';
    return 'text-[#99AABB] bg-[#2C3440] border-white/[0.06]';
  }
</script>

<div class="flex h-full overflow-hidden">
  <!-- Sidebar: shelves -->
  <div class="w-60 flex-shrink-0 border-r border-white/[0.06] overflow-y-auto p-5 space-y-1.5">
    <h3 class="text-[#99AABB] text-xs uppercase tracking-wider mb-4 px-3">Shelves</h3>
    <button
      class="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer {
        selectedShelfId === null
          ? 'bg-white/[0.07] text-white'
          : 'text-[#99AABB] hover:text-white hover:bg-white/[0.04]'
      }"
      onclick={() => (selectedShelfId = null)}
    >
      <span class="flex items-center justify-between">
        <span class="font-medium">All Books</span>
        <span class="text-xs text-[#99AABB] bg-white/[0.06] px-2 py-0.5 rounded-full">{allBooks.length}</span>
      </span>
    </button>
    {#each allShelves as shelf}
      <button
        class="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer {
          selectedShelfId === shelf.id
            ? 'bg-white/[0.07] text-white'
            : 'text-[#99AABB] hover:text-white hover:bg-white/[0.04]'
        }"
        onclick={() => (selectedShelfId = shelf.id)}
      >
        <span class="flex items-center justify-between">
          <span class="flex items-center gap-2.5">
            <span class="w-2 h-2 rounded-full {shelfColor(shelf.name)}"></span>
            <span class="font-medium">{shelf.name}</span>
          </span>
          <span class="text-xs text-[#99AABB] bg-white/[0.06] px-2 py-0.5 rounded-full">{getShelfBookCount(shelf.id)}</span>
        </span>
      </button>
    {/each}
  </div>

  <!-- Main content -->
  <div class="flex-1 overflow-y-auto p-10">
    <!-- Header -->
    <div class="flex items-center justify-between gap-4 mb-8">
      <h1 class="text-2xl font-bold text-white tracking-tight">Library</h1>
      <div class="flex items-center gap-3">
        <div class="w-64">
          <SearchBar bind:value={searchQuery} placeholder="Filter books..." />
        </div>
        <!-- View toggle -->
        <div class="flex bg-[#1B2028] border border-white/[0.06] rounded-lg overflow-hidden">
          <button
            class="px-3 py-2 text-sm cursor-pointer transition-colors duration-200 {viewMode === 'grid' ? 'bg-white/[0.08] text-white' : 'text-[#99AABB] hover:text-white'}"
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
            class="px-3 py-2 text-sm cursor-pointer transition-colors duration-200 {viewMode === 'table' ? 'bg-white/[0.08] text-white' : 'text-[#99AABB] hover:text-white'}"
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
    <p class="text-[#99AABB] text-sm mb-6">{sortedBooks.length} book{sortedBooks.length !== 1 ? 's' : ''}</p>

    {#if sortedBooks.length === 0}
      <div class="bg-gradient-to-br from-[#1B2028] to-[#1D2430] border border-white/[0.06] rounded-2xl p-12 text-center">
        <div class="text-4xl mb-4 opacity-40">📚</div>
        <p class="text-white/80 font-serif text-lg">No books found.</p>
        <p class="text-[#99AABB] text-sm mt-2">Try adjusting your search or shelf filter.</p>
      </div>
    {:else if viewMode === 'grid'}
      <!-- Grid view -->
      <PosterGrid>
        {#each sortedBooks as book}
          {@const review = getReviewForBook(book.id)}
          <div class="group relative">
            <div class="shadow-[4px_4px_12px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden transition-shadow duration-300 group-hover:shadow-[6px_6px_16px_rgba(0,0,0,0.6)]">
              <PosterCard
                src={book.coverPath}
                alt={book.title}
                href="/books/{book.id}"
              />
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute inset-0 flex items-end pointer-events-none">
              <div class="w-full p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-lg">
                <p class="text-white text-xs font-semibold font-serif truncate">{book.title}</p>
                <p class="text-[#C8B8A0] text-[10px] truncate">{book.author}</p>
              </div>
            </div>
          </div>
        {/each}
      </PosterGrid>
    {:else}
      <!-- Table view -->
      <div class="bg-[#1B2028] border border-white/[0.06] rounded-xl overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/[0.08]">
              <th class="text-left px-4 py-3.5 text-[#99AABB] text-xs uppercase tracking-wider w-12">
                &nbsp;
              </th>
              <th class="text-left px-4 py-3.5">
                <button
                  class="text-[#99AABB] text-xs uppercase tracking-wider hover:text-white transition-colors duration-200 cursor-pointer"
                  onclick={() => toggleSort('title')}
                >
                  Title{sortIndicator('title')}
                </button>
              </th>
              <th class="text-left px-4 py-3.5">
                <button
                  class="text-[#99AABB] text-xs uppercase tracking-wider hover:text-white transition-colors duration-200 cursor-pointer"
                  onclick={() => toggleSort('author')}
                >
                  Author{sortIndicator('author')}
                </button>
              </th>
              <th class="text-left px-4 py-3.5">
                <button
                  class="text-[#99AABB] text-xs uppercase tracking-wider hover:text-white transition-colors duration-200 cursor-pointer"
                  onclick={() => toggleSort('rating')}
                >
                  Rating{sortIndicator('rating')}
                </button>
              </th>
              <th class="text-left px-4 py-3.5 text-[#99AABB] text-xs uppercase tracking-wider">
                Shelf
              </th>
              <th class="text-left px-4 py-3.5">
                <button
                  class="text-[#99AABB] text-xs uppercase tracking-wider hover:text-white transition-colors duration-200 cursor-pointer"
                  onclick={() => toggleSort('dateRead')}
                >
                  Date Read{sortIndicator('dateRead')}
                </button>
              </th>
              <th class="text-left px-4 py-3.5">
                <button
                  class="text-[#99AABB] text-xs uppercase tracking-wider hover:text-white transition-colors duration-200 cursor-pointer"
                  onclick={() => toggleSort('pages')}
                >
                  Pages{sortIndicator('pages')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {#each sortedBooks as book, i}
              {@const review = getReviewForBook(book.id)}
              {@const shelf = getExclusiveShelfForBook(book.id)}
              <tr class="border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors duration-200 {i % 2 === 1 ? 'bg-white/[0.02]' : ''}">
                <td class="px-4 py-2.5">
                  <a href="/books/{book.id}">
                    <img
                      src={book.coverPath}
                      alt={book.title}
                      class="w-8 h-12 object-cover rounded shadow-[2px_2px_6px_rgba(0,0,0,0.4)]"
                      loading="lazy"
                    />
                  </a>
                </td>
                <td class="px-4 py-2.5">
                  <a href="/books/{book.id}" class="text-white font-serif font-medium hover:text-amber-400 transition-colors duration-200">
                    {book.title}
                  </a>
                </td>
                <td class="px-4 py-2.5 text-[#99AABB]">{book.author}</td>
                <td class="px-4 py-2.5">
                  {#if review}
                    <StarRating value={review.rating} halfStars={false} readonly size="sm" />
                  {:else}
                    <span class="text-[#99AABB]/40 text-xs">--</span>
                  {/if}
                </td>
                <td class="px-4 py-2.5">
                  {#if shelf}
                    <span class="px-2.5 py-1 text-xs rounded-full border {shelfTextColor(shelf.name)}">
                      {shelf.name}
                    </span>
                  {/if}
                </td>
                <td class="px-4 py-2.5 text-[#99AABB] text-xs">{review?.dateRead ?? '--'}</td>
                <td class="px-4 py-2.5 text-[#99AABB]">{book.pageCount}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>
