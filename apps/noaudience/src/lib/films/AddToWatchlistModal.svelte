<script lang="ts">
  import Modal from '@noaudience/core/components/Modal.svelte';
  import { searchTmdb, type TmdbSearchResult } from './tmdb';
  import { addFilmFromTmdb, addToWatchlist, addToList, getLists, type FilmListWithFilms } from './db';

  interface Props {
    open: boolean;
    onclose: () => void;
    onsave?: () => void;
  }

  let { open, onclose, onsave }: Props = $props();

  let filmQuery = $state('');
  let searchResults = $state<TmdbSearchResult[]>([]);
  let selectedFilm = $state<TmdbSearchResult | null>(null);
  let showResults = $state(false);
  let searching = $state(false);
  let saving = $state(false);
  let errorMsg = $state('');
  let debounceTimer: ReturnType<typeof setTimeout>;

  // Destination: watchlist or a specific list
  let destination = $state<'watchlist' | number>('watchlist');
  let lists = $state<FilmListWithFilms[]>([]);

  $effect(() => {
    if (open) {
      getLists().then(l => lists = l).catch(() => {});
    }
  });

  function handleInput() {
    showResults = true;
    selectedFilm = null;
    clearTimeout(debounceTimer);
    if (filmQuery.length < 2) {
      searchResults = [];
      return;
    }
    searching = true;
    debounceTimer = setTimeout(async () => {
      try {
        errorMsg = '';
        searchResults = await searchTmdb(filmQuery);
      } catch (e: any) {
        errorMsg = `Search failed: ${e?.message || e}`;
        searchResults = [];
      }
      searching = false;
    }, 300);
  }

  function selectFilm(film: TmdbSearchResult) {
    selectedFilm = film;
    filmQuery = `${film.title} (${film.year})`;
    showResults = false;
  }

  async function handleSave() {
    if (!selectedFilm || saving) return;
    saving = true;
    try {
      const film = await addFilmFromTmdb(selectedFilm);
      if (destination === 'watchlist') {
        await addToWatchlist(film.id);
      } else {
        await addToList(destination, film.id);
      }
      // Reset
      filmQuery = '';
      selectedFilm = null;
      searchResults = [];
      destination = 'watchlist';
      errorMsg = '';
      onsave?.();
      onclose();
    } catch (e: any) {
      errorMsg = e?.message || 'Failed to save';
    } finally {
      saving = false;
    }
  }

  function reset() {
    filmQuery = '';
    selectedFilm = null;
    searchResults = [];
    showResults = false;
    destination = 'watchlist';
    errorMsg = '';
  }
</script>

<Modal {open} onclose={() => { reset(); onclose(); }} title="Add Film">
  <div style="display: flex; flex-direction: column; gap: 20px;">

    <!-- Search -->
    <div style="position: relative;">
      <input
        type="text"
        bind:value={filmQuery}
        oninput={handleInput}
        onfocus={() => { if (searchResults.length) showResults = true; }}
        placeholder="Search for a film..."
        style="width: 100%; height: 44px; padding: 0 14px; background: var(--surface-container-low); border: none; border-bottom: 2px solid transparent; border-radius: 6px; color: var(--text-primary); font-size: 15px; outline: none; transition: border-color 150ms;"
        onfocusin={(e) => e.currentTarget.style.borderBottomColor = 'var(--accent)'}
        onfocusout={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}
      />
      {#if showResults && searchResults.length > 0}
        <div style="position: absolute; z-index: 20; top: 100%; left: 0; right: 0; margin-top: 4px; background: var(--surface-container-highest, #31353A); border: 1px solid var(--ghost-border); border-radius: 8px; max-height: 240px; overflow-y: auto; box-shadow: 0 16px 32px rgba(0,0,0,0.4);">
          {#each searchResults as film}
            <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
            <div
              onclick={() => selectFilm(film)}
              style="display: flex; align-items: center; gap: 12px; padding: 8px 12px; cursor: pointer; transition: background 150ms;"
              onmouseenter={(e) => e.currentTarget.style.background = 'var(--surface-container-low)'}
              onmouseleave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {#if film.posterPath}
                <img src={film.posterPath} alt="" style="width: 32px; height: 48px; object-fit: cover; border-radius: 3px; flex-shrink: 0;" />
              {/if}
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 14px; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{film.title}</div>
                <div style="font-size: 12px; color: var(--text-muted);">{film.year}</div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
      {#if searching}
        <span style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 12px; color: var(--text-muted);">Searching...</span>
      {/if}
    </div>

    <!-- Selected film preview -->
    {#if selectedFilm}
      <div style="display: flex; gap: 16px; padding: 16px; background: var(--surface-container-low); border-radius: 8px;">
        {#if selectedFilm.posterPath}
          <img src={selectedFilm.posterPath} alt="" style="width: 56px; aspect-ratio: 2/3; object-fit: cover; border-radius: 4px;" />
        {/if}
        <div style="flex: 1;">
          <h4 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.125rem; color: var(--text-primary); margin: 0 0 4px;">{selectedFilm.title}</h4>
          <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">{selectedFilm.year}</p>
          {#if selectedFilm.overview}
            <p style="font-size: 12px; color: var(--text-muted); margin: 8px 0 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">{selectedFilm.overview}</p>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Destination picker -->
    <div>
      <label style="font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-secondary); display: block; margin-bottom: 8px;">Add to</label>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button
          onclick={() => destination = 'watchlist'}
          style="padding: 6px 14px; border-radius: 999px; font-size: 13px; border: none; cursor: pointer; transition: all 150ms;
            background: {destination === 'watchlist' ? 'var(--accent)' : 'var(--surface-container-low)'};
            color: {destination === 'watchlist' ? '#00390F' : 'var(--text-secondary)'};"
        >
          Watchlist
        </button>
        {#each lists as list}
          <button
            onclick={() => destination = list.id}
            style="padding: 6px 14px; border-radius: 999px; font-size: 13px; border: none; cursor: pointer; transition: all 150ms;
              background: {destination === list.id ? 'var(--accent)' : 'var(--surface-container-low)'};
              color: {destination === list.id ? '#00390F' : 'var(--text-secondary)'};"
          >
            {list.title}
          </button>
        {/each}
      </div>
    </div>

    {#if errorMsg}
      <p style="font-size: 13px; color: var(--color-error); margin: 0;">{errorMsg}</p>
    {/if}

    <!-- Save -->
    <div style="display: flex; justify-content: flex-end; gap: 12px;">
      <button
        onclick={() => { reset(); onclose(); }}
        style="padding: 8px 16px; background: none; border: none; color: var(--text-secondary); font-size: 14px; cursor: pointer;"
      >Cancel</button>
      <button
        onclick={handleSave}
        disabled={!selectedFilm || saving}
        style="padding: 8px 20px; border-radius: 6px; background: var(--accent); color: #00390F; border: none; font-size: 14px; font-weight: 600; cursor: pointer; opacity: {!selectedFilm || saving ? '0.4' : '1'}; transition: opacity 150ms;"
      >
        {saving ? 'Adding...' : 'Add Film'}
      </button>
    </div>
  </div>
</Modal>
