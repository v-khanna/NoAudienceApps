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
        searchResults = await searchTmdb(filmQuery);
      } catch (e) {
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

  function handleSave() {
    if (!selectedFilm) return;
    const localFilm = addFilmFromTmdb(selectedFilm);
    logFilm({
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
        <div style="position: absolute; right: 8px; top: 28px; color: var(--text-tertiary); font-size: 13px;">Searching...</div>
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
                <div style="color: var(--text-primary);">{film.title}</div>
                <div style="color: var(--text-tertiary);">{film.year || 'Unknown year'}</div>
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
          <div style="font-size: 13px; font-weight: 500; color: var(--text-primary);">{selectedFilm.title}</div>
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
        {liked ? '♥' : '♡'} Like
      </button>
      <button
        class="toggle-btn"
        class:active={rewatch}
        onclick={() => rewatch = !rewatch}
      >
        ↻ Rewatch
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
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .field-input {
    width: 100%;
    height: 32px;
    padding: 0 8px;
    background: var(--bg-inset);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
  }
  .field-input:focus {
    border-color: var(--accent);
  }

  .field-textarea {
    width: 100%;
    padding: 8px;
    background: var(--bg-inset);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text-primary);
    font-size: 13px;
    outline: none;
    resize: none;
  }
  .field-textarea:focus {
    border-color: var(--accent);
  }

  .search-container {
    position: relative;
  }

  .search-dropdown {
    position: absolute;
    z-index: 10;
    width: 100%;
    margin-top: 4px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 4px;
    max-height: 240px;
    overflow-y: auto;
  }

  .search-result {
    width: 100%;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    font-size: 13px;
    background: none;
    border: none;
    border-bottom: 1px solid var(--border-subtle);
    cursor: pointer;
    transition: background-color 150ms ease-out;
  }
  .search-result:last-child {
    border-bottom: none;
  }
  .search-result:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }

  .result-poster {
    width: 28px;
    height: 42px;
    object-fit: cover;
    border-radius: 2px;
    border: 1px solid var(--border);
    flex-shrink: 0;
  }

  .result-poster-placeholder {
    width: 28px;
    height: 42px;
    background: var(--bg-inset);
    border-radius: 2px;
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-size: 13px;
    flex-shrink: 0;
  }

  .selected-preview {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 8px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 4px;
  }

  .toggle-btn {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 13px;
    padding: 4px 0;
    transition: color 150ms ease-out;
  }
  .toggle-btn:hover {
    color: var(--text-primary);
  }
  .toggle-btn.active {
    color: var(--accent);
  }

  .save-btn {
    background: var(--accent);
    color: #000;
    border: none;
    border-radius: 4px;
    height: 28px;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 150ms ease-out;
  }
  .save-btn:hover {
    opacity: 0.9;
  }
  .save-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
