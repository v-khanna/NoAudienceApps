<script lang="ts">
  import Modal from '@noaudience/core/components/Modal.svelte';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import TagInput from '@noaudience/core/components/TagInput.svelte';
  import Button from '@noaudience/core/components/Button.svelte';
  import { searchTmdb, type TmdbSearchResult } from './tmdb';
  import { logFilm } from './db';

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
    logFilm({
      filmId: selectedFilm.id,
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
  <div class="space-y-5">
    <!-- Film search (TMDB) -->
    <div class="relative">
      <label class="block text-[#99AABB] text-xs font-medium uppercase tracking-wider mb-1.5">Film</label>
      <input
        type="text"
        bind:value={filmQuery}
        oninput={handleInput}
        onfocus={() => { if (searchResults.length) showResults = true; }}
        placeholder="Search any movie..."
        class="w-full px-3 h-10 bg-[#1B2028] border border-white/[0.06] rounded-[6px] text-white text-sm placeholder:text-[#99AABB] focus:outline-none focus:border-[#40BCF4] transition-colors"
      />
      {#if searching}
        <div class="absolute right-3 top-[38px] text-[#99AABB] text-xs">Searching...</div>
      {/if}
      {#if showResults && searchResults.length > 0}
        <div class="absolute z-10 w-full mt-1 bg-[#2C3440] border border-white/[0.08] rounded-[6px] overflow-hidden shadow-xl max-h-[320px] overflow-y-auto">
          {#each searchResults as film}
            <button
              class="w-full text-left px-3 py-2.5 text-sm text-white hover:bg-[#3C4450] transition-colors cursor-pointer flex items-center gap-3"
              onclick={() => selectFilm(film)}
            >
              {#if film.posterPath}
                <img src={film.posterPath} alt="" class="w-9 h-[54px] object-cover rounded-[3px] flex-shrink-0" />
              {:else}
                <div class="w-9 h-[54px] bg-[#1B2028] rounded-[3px] flex items-center justify-center text-[#535353] text-xs flex-shrink-0">?</div>
              {/if}
              <div class="min-w-0">
                <div class="font-medium truncate">{film.title}</div>
                <div class="text-[#99AABB] text-xs">{film.year || 'Unknown year'}</div>
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Selected film preview -->
    {#if selectedFilm}
      <div class="flex gap-3 p-3 bg-[#1B2028] rounded-[6px] border border-white/[0.06]">
        {#if selectedFilm.posterPath}
          <img src={selectedFilm.posterPath} alt="" class="w-16 h-24 object-cover rounded-[4px]" />
        {/if}
        <div class="min-w-0 flex-1">
          <div class="font-semibold text-white">{selectedFilm.title}</div>
          <div class="text-[#99AABB] text-sm">{selectedFilm.year}</div>
          {#if selectedFilm.overview}
            <p class="text-[#99AABB] text-xs mt-1 line-clamp-2">{selectedFilm.overview}</p>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Date watched -->
    <div>
      <label class="block text-[#99AABB] text-xs font-medium uppercase tracking-wider mb-1.5">Date Watched</label>
      <input
        type="date"
        bind:value={watchedDate}
        class="w-full px-3 h-10 bg-[#1B2028] border border-white/[0.06] rounded-[6px] text-white text-sm focus:outline-none focus:border-[#40BCF4] transition-colors"
      />
    </div>

    <!-- Rating -->
    <div>
      <label class="block text-[#99AABB] text-xs font-medium uppercase tracking-wider mb-1.5">Rating</label>
      <StarRating value={rating} halfStars={true} size="lg" onchange={(v) => rating = v} />
    </div>

    <!-- Like & Rewatch toggles -->
    <div class="flex items-center gap-6">
      <button
        class="flex items-center gap-2 text-sm transition-colors cursor-pointer {liked ? 'text-[#FF6B6B]' : 'text-[#99AABB] hover:text-white'}"
        onclick={() => liked = !liked}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        Like
      </button>
      <button
        class="flex items-center gap-2 text-sm transition-colors cursor-pointer {rewatch ? 'text-[#40BCF4]' : 'text-[#99AABB] hover:text-white'}"
        onclick={() => rewatch = !rewatch}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <polyline points="23 20 23 14 17 14" />
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
        </svg>
        Rewatch
      </button>
    </div>

    <!-- Review -->
    <div>
      <label class="block text-[#99AABB] text-xs font-medium uppercase tracking-wider mb-1.5">Review</label>
      <textarea
        bind:value={review}
        placeholder="Write your thoughts..."
        rows="3"
        class="w-full px-3 py-2 bg-[#1B2028] border border-white/[0.06] rounded-[6px] text-white text-sm placeholder:text-[#99AABB] focus:outline-none focus:border-[#40BCF4] transition-colors resize-none"
      ></textarea>
    </div>

    <!-- Tags -->
    <div>
      <label class="block text-[#99AABB] text-xs font-medium uppercase tracking-wider mb-1.5">Tags</label>
      <TagInput bind:tags placeholder="Add tags..." />
    </div>

    <!-- Save -->
    <div class="flex justify-end pt-2">
      <Button variant="primary" onclick={handleSave} disabled={!selectedFilm}>
        Save
      </Button>
    </div>
  </div>
</Modal>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
