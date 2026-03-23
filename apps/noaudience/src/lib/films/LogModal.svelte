<script lang="ts">
  import Modal from '@noaudience/core/components/Modal.svelte';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import TagInput from '@noaudience/core/components/TagInput.svelte';
  import { searchTmdb, type TmdbSearchResult } from './tmdb';
  import { logFilm, addFilmFromTmdb } from './db';

  interface Props {
    open: boolean;
    onclose: () => void;
    onsave?: () => void;
  }

  let { open, onclose, onsave }: Props = $props();

  let filmQuery = $state('');
  let watchedDate = $state(new Date().toISOString().split('T')[0]);
  let rating = $state(0);
  let liked = $state(false);
  let rewatch = $state(false);
  let review = $state('');
  let tags = $state<string[]>([]);

  let searchResults = $state<TmdbSearchResult[]>([]);
  let selectedFilm = $state<TmdbSearchResult | null>(null);
  let showResults = $state(false);
  let searching = $state(false);
  let errorMsg = $state('');
  let debounceTimer: ReturnType<typeof setTimeout>;

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
        console.error('TMDB search failed:', e);
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
    if (!selectedFilm) return;
    try {
      errorMsg = '';
      const localFilm = await addFilmFromTmdb(selectedFilm);
      await logFilm({
        filmId: localFilm.id,
        watchedDate,
        rating,
        liked,
        rewatch,
        review,
        tags,
      });
      resetForm();
      onsave?.();
      onclose();
    } catch (e: any) {
      errorMsg = `Save failed: ${e?.message || e}`;
      console.error('Save failed:', e);
    }
  }

  function resetForm() {
    filmQuery = '';
    watchedDate = new Date().toISOString().split('T')[0];
    rating = 0;
    liked = false;
    rewatch = false;
    review = '';
    tags = [];
    selectedFilm = null;
    searchResults = [];
  }
</script>

<Modal {open} {onclose} title="Log Film">
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <!-- Film search (TMDB) -->
    <div class="search-container">
      <label class="field-label">Film</label>
      <input
        type="text"
        bind:value={filmQuery}
        oninput={handleInput}
        onfocus={() => { if (searchResults.length) showResults = true; }}
        placeholder="Search any movie..."
        class="field-input"
      />
      {#if searching}
        <div style="position: absolute; right: 8px; top: 30px; color: var(--text-tertiary); font-size: 13px;">Searching...</div>
      {/if}
      {#if errorMsg}
        <div style="margin-top: 8px; padding: 8px 12px; background: rgba(255,0,0,0.1); border: 1px solid rgba(255,0,0,0.3); border-radius: 6px; color: #ff6b6b; font-size: 13px;">{errorMsg}</div>
      {/if}
      {#if showResults && searchResults.length > 0}
        <div class="search-dropdown">
          {#each searchResults as film}
            <button
              class="search-result"
              onclick={() => selectFilm(film)}
            >
              {#if film.posterPath}
                <img src={film.posterPath} alt="" class="result-poster" />
              {:else}
                <div class="result-poster-placeholder">?</div>
              {/if}
              <div class="min-w-0">
                <div style="font-size: 15px; color: var(--text-primary);">{film.title}</div>
                <div style="font-size: 13px; color: var(--text-tertiary);">{film.year || 'Unknown year'}</div>
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Selected film preview -->
    {#if selectedFilm}
      <div class="selected-preview">
        {#if selectedFilm.posterPath}
          <img src={selectedFilm.posterPath} alt="" style="width: 40px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border);" />
        {/if}
        <div class="min-w-0" style="flex: 1;">
          <div style="font-size: 15px; font-weight: 500; color: var(--text-primary);">{selectedFilm.title}</div>
          <div style="font-size: 13px; color: var(--text-tertiary);">{selectedFilm.year}</div>
        </div>
      </div>
    {/if}

    <!-- Date watched -->
    <div>
      <label class="field-label">Date Watched</label>
      <input
        type="date"
        bind:value={watchedDate}
        class="field-input"
      />
    </div>

    <!-- Rating -->
    <div>
      <label class="field-label">Rating</label>
      <div style="padding: 4px 0;">
        <StarRating value={rating} halfStars={true} size="sm" onchange={(v) => rating = v} />
      </div>
    </div>

    <!-- Like & Rewatch -->
    <div class="flex items-center gap-16">
      <button
        class="toggle-btn"
        class:active={liked}
        onclick={() => liked = !liked}
      >
        {liked ? '\u2665' : '\u2661'} Like
      </button>
      <button
        class="toggle-btn"
        class:active={rewatch}
        onclick={() => rewatch = !rewatch}
      >
        \u21BB Rewatch
      </button>
    </div>

    <!-- Review -->
    <div>
      <label class="field-label">Review</label>
      <textarea
        bind:value={review}
        placeholder="Write your thoughts..."
        rows="3"
        class="field-textarea"
      ></textarea>
    </div>

    <!-- Tags -->
    <div>
      <label class="field-label">Tags</label>
      <TagInput bind:tags placeholder="Add tags..." />
    </div>

    <!-- Save -->
    <div class="flex justify-end">
      <button class="save-btn" onclick={handleSave} disabled={!selectedFilm}>Save Entry</button>
    </div>
  </div>
</Modal>

<style>
  .field-label {
    display: block;
    font-size: 0.6875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-secondary);
    margin-bottom: 6px;
  }

  .field-input {
    width: 100%;
    height: 44px;
    padding: 0 14px;
    background: var(--surface-container-low);
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 15px;
    outline: none;
    transition: border-color 150ms;
  }
  .field-input:focus {
    border-bottom-color: var(--accent);
  }

  .field-textarea {
    width: 100%;
    padding: 12px 14px;
    background: var(--surface-container-low);
    border: none;
    border-bottom: 2px solid transparent;
    border-radius: 6px;
    color: var(--text-primary);
    font-family: 'Newsreader', Georgia, serif;
    font-size: 15px;
    font-style: italic;
    outline: none;
    resize: none;
    transition: border-color 150ms;
  }
  .field-textarea:focus {
    border-bottom-color: var(--accent);
  }

  .search-container {
    position: relative;
  }

  .search-dropdown {
    position: absolute;
    z-index: 10;
    width: 100%;
    margin-top: 4px;
    background: var(--surface-container-highest, #31353A);
    border: 1px solid var(--ghost-border);
    border-radius: 8px;
    max-height: 240px;
    overflow-y: auto;
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.4);
  }

  .search-result {
    width: 100%;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    font-size: 14px;
    background: none;
    border: none;
    cursor: pointer;
    transition: background 150ms;
  }
  .search-result:hover {
    background: var(--surface-container-low);
  }

  .result-poster {
    width: 32px;
    height: 48px;
    object-fit: cover;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .result-poster-placeholder {
    width: 32px;
    height: 48px;
    background: var(--surface-container-high);
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: 14px;
    flex-shrink: 0;
  }

  .selected-preview {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 14px;
    background: var(--surface-container-low);
    border-radius: 8px;
  }

  .toggle-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 14px;
    padding: 6px 12px;
    border-radius: 999px;
    transition: all 150ms;
  }
  .toggle-btn:hover {
    background: var(--surface-container-low);
    color: var(--text-primary);
  }
  .toggle-btn.active {
    background: rgba(0, 224, 84, 0.1);
    color: var(--accent);
  }

  .save-btn {
    background: var(--accent);
    color: #00390F;
    border: none;
    border-radius: 6px;
    height: 44px;
    padding: 0 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 150ms;
  }
  .save-btn:hover {
    opacity: 0.9;
  }
  .save-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
