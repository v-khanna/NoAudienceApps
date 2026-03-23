<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getLists, searchFilms, addToList, type FilmListWithFilms, type Film } from '$lib/films/db';

  let list = $state<FilmListWithFilms | null>(null);
  let loading = $state(true);

  // Search state
  let searchQuery = $state('');
  let searchResults = $state<Film[]>([]);
  let showResults = $state(false);
  let debounceTimer: ReturnType<typeof setTimeout>;

  onMount(async () => {
    try {
      const listId = Number($page.params.id);
      const allLists = await getLists();
      list = allLists.find(l => l.id === listId) ?? null;
    } catch (e) {
      console.error('Failed to load list:', e);
    } finally {
      loading = false;
    }
  });

  function handleSearch() {
    clearTimeout(debounceTimer);
    if (searchQuery.length < 2) {
      searchResults = [];
      showResults = false;
      return;
    }
    showResults = true;
    debounceTimer = setTimeout(async () => {
      searchResults = await searchFilms(searchQuery);
    }, 300);
  }

  async function handleAddFilm(film: Film) {
    if (!list) return;
    await addToList(list.id, film.id);
    // Reload list
    const allLists = await getLists();
    list = allLists.find(l => l.id === list!.id) ?? null;
    searchQuery = '';
    searchResults = [];
    showResults = false;
  }

  function isInList(filmId: number): boolean {
    return list?.films.some(f => f.id === filmId) ?? false;
  }
</script>

<main style="padding-bottom: 64px;">
  {#if loading}
    <p style="color: var(--text-muted);">Loading...</p>
  {:else if !list}
    <p style="color: var(--text-muted);">List not found.</p>
  {:else}

    <!-- Header -->
    <div style="margin-bottom: 40px;">
      <a href="/films/lists" style="font-size: 12px; color: var(--text-muted); text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; display: inline-flex; align-items: center; gap: 4px; margin-bottom: 16px;">
        ← Back to Lists
      </a>
      <h1 style="font-family: 'Newsreader', Georgia, serif; font-size: 2rem; font-weight: 500; color: var(--text-primary); margin: 0;">
        {list.title}
      </h1>
      {#if list.description}
        <p style="font-size: 14px; color: var(--text-secondary); margin: 8px 0 0; max-width: 500px; line-height: 1.5;">{list.description}</p>
      {/if}
      <div style="display: flex; align-items: center; gap: 12px; margin-top: 12px;">
        <span style="font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted);">{list.films.length} {list.films.length === 1 ? 'film' : 'films'}</span>
        {#if list.ranked}
          <span style="font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent);">Ranked</span>
        {/if}
      </div>
    </div>

    <!-- Add Film Search -->
    <div style="margin-bottom: 40px; position: relative;">
      <div style="display: flex; align-items: center; gap: 8px; background: var(--surface-container-low); padding: 10px 16px; border-radius: 8px; max-width: 400px;">
        <span style="color: var(--text-muted); font-size: 18px;">+</span>
        <input
          type="text"
          bind:value={searchQuery}
          oninput={handleSearch}
          onfocus={() => { if (searchResults.length) showResults = true; }}
          onblur={() => setTimeout(() => showResults = false, 200)}
          placeholder="Search films to add..."
          style="flex: 1; background: none; border: none; outline: none; color: var(--text-primary); font-size: 14px;"
        />
      </div>
      {#if showResults && searchResults.length > 0}
        <div style="position: absolute; z-index: 20; top: 100%; left: 0; width: 400px; margin-top: 4px; background: var(--surface-container-highest, #31353A); border: 1px solid var(--ghost-border); border-radius: 8px; max-height: 300px; overflow-y: auto; box-shadow: 0 24px 48px -12px rgba(0,0,0,0.5);">
          {#each searchResults as film}
            <button
              onclick={() => handleAddFilm(film)}
              disabled={isInList(film.id)}
              style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; width: 100%; background: none; border: none; cursor: {isInList(film.id) ? 'default' : 'pointer'}; text-align: left; transition: background 150ms; opacity: {isInList(film.id) ? '0.4' : '1'};"
              onmouseenter={(e) => { if (!isInList(film.id)) e.currentTarget.style.background = 'var(--surface-container-low)'; }}
              onmouseleave={(e) => e.currentTarget.style.background = 'none'}
            >
              {#if film.posterPath}
                <img src={film.posterPath} alt="" style="width: 28px; height: 42px; object-fit: cover; border-radius: 3px; flex-shrink: 0;" />
              {/if}
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 14px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{film.title}</div>
                <div style="font-size: 12px; color: var(--text-muted);">{film.year}{#if film.director} · {film.director}{/if}</div>
              </div>
              {#if isInList(film.id)}
                <span style="font-size: 11px; color: var(--text-muted);">Added</span>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Films Grid -->
    {#if list.films.length > 0}
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 28px 20px;">
        {#each list.films as film, i}
          <a href="/films/{film.id}" style="text-decoration: none; cursor: pointer; display: block;">
            <div style="aspect-ratio: 2/3; border-radius: 6px; overflow: hidden; background: var(--surface-container); margin-bottom: 10px; position: relative;">
              {#if film.posterPath}
                <img src={film.posterPath} alt={film.title} style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s;"
                  onmouseenter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onmouseleave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              {/if}
              {#if list.ranked}
                <div style="position: absolute; top: 8px; left: 8px; width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--accent);">
                  {i + 1}
                </div>
              {/if}
            </div>
            <h4 style="font-family: 'Newsreader', Georgia, serif; font-size: 0.9375rem; color: var(--text-primary); margin: 0 0 2px; line-height: 1.3;">{film.title}</h4>
            <p style="font-size: 0.6875rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin: 0;">
              {film.year ?? ''}{#if film.director} · {film.director}{/if}
            </p>
          </a>
        {/each}
      </div>
    {:else}
      <div style="padding: 60px 0; text-align: center;">
        <p style="font-family: 'Newsreader', Georgia, serif; font-size: 1.25rem; color: var(--text-primary); margin: 0 0 8px;">This list is empty</p>
        <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">Use the search above to add films.</p>
      </div>
    {/if}

  {/if}
</main>
