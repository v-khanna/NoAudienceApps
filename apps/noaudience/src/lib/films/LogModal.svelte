<script lang="ts">
  import Modal from '@noaudience/core/components/Modal.svelte';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import TagInput from '@noaudience/core/components/TagInput.svelte';
  import Button from '@noaudience/core/components/Button.svelte';
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
    // Add the TMDB film to local data first
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
  <div class="space-y-0">
    <!-- Film search (TMDB) -->
    <div class="relative pb-6">
      <label class="block text-[#667788] text-[10px] font-medium uppercase tracking-widest mb-2">Film</label>
      <input
        type="text"
        bind:value={filmQuery}
        oninput={handleInput}
        onfocus={() => { if (searchResults.length) showResults = true; }}
        placeholder="Search any movie..."
        class="w-full px-4 h-12 bg-[#14181C] ring-1 ring-white/[0.06] rounded-lg text-white text-sm placeholder:text-[#4A5568] focus:outline-none focus:ring-[#40BCF4]/50 transition-all duration-200"
      />
      {#if searching}
        <div class="absolute right-4 top-[42px] text-[#667788] text-xs animate-pulse">Searching...</div>
      {/if}
      {#if showResults && searchResults.length > 0}
        <div class="absolute z-10 w-full mt-1.5 backdrop-blur-xl bg-[#1E2530]/95 ring-1 ring-white/[0.08] rounded-xl overflow-hidden shadow-2xl max-h-[320px] overflow-y-auto">
          {#each searchResults as film}
            <button
              class="search-result w-full text-left px-4 py-3 text-sm text-white hover:bg-white/[0.04] transition-all duration-200 cursor-pointer flex items-center gap-3"
              onclick={() => selectFilm(film)}
            >
              {#if film.posterPath}
                <img src={film.posterPath} alt="" class="w-9 h-[54px] object-cover rounded-[3px] ring-1 ring-white/[0.06] flex-shrink-0" />
              {:else}
                <div class="w-9 h-[54px] bg-[#14181C] rounded-[3px] ring-1 ring-white/[0.06] flex items-center justify-center text-[#4A5568] text-xs flex-shrink-0">?</div>
              {/if}
              <div class="min-w-0">
                <div class="font-medium truncate">{film.title}</div>
                <div class="text-[#667788] text-xs">{film.year || 'Unknown year'}</div>
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Selected film preview -->
    {#if selectedFilm}
      <div class="flex gap-4 p-4 bg-gradient-to-r from-[#1B2028] to-[#181C22] rounded-xl ring-1 ring-white/[0.04] mb-6">
        {#if selectedFilm.posterPath}
          <img src={selectedFilm.posterPath} alt="" class="w-16 h-24 object-cover rounded-lg ring-1 ring-white/[0.06]" />
        {/if}
        <div class="min-w-0 flex-1">
          <div class="font-semibold text-white">{selectedFilm.title}</div>
          <div class="text-[#667788] text-sm mt-0.5">{selectedFilm.year}</div>
          {#if selectedFilm.overview}
            <p class="text-[#99AABB] text-xs mt-1.5 line-clamp-2 leading-relaxed">{selectedFilm.overview}</p>
          {/if}
        </div>
      </div>
    {/if}

    <div class="border-t border-white/[0.04]"></div>

    <!-- Date watched -->
    <div class="py-6">
      <label class="block text-[#667788] text-[10px] font-medium uppercase tracking-widest mb-2">Date Watched</label>
      <input
        type="date"
        bind:value={watchedDate}
        class="w-full px-4 h-12 bg-[#14181C] ring-1 ring-white/[0.06] rounded-lg text-white text-sm focus:outline-none focus:ring-[#40BCF4]/50 transition-all duration-200"
      />
    </div>

    <div class="border-t border-white/[0.04]"></div>

    <!-- Rating -->
    <div class="py-6">
      <label class="block text-[#667788] text-[10px] font-medium uppercase tracking-widest mb-3">Rating</label>
      <div class="flex items-center justify-center py-2">
        <StarRating value={rating} halfStars={true} size="lg" onchange={(v) => rating = v} />
      </div>
    </div>

    <div class="border-t border-white/[0.04]"></div>

    <!-- Like & Rewatch toggles -->
    <div class="flex items-center gap-8 py-6">
      <button
        class="toggle-btn flex items-center gap-2.5 text-sm transition-all duration-200 ease-out cursor-pointer {liked ? 'text-[#FF6B6B]' : 'text-[#99AABB] hover:text-white'}"
        onclick={() => liked = !liked}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span class="font-medium">Like</span>
      </button>
      <button
        class="toggle-btn flex items-center gap-2.5 text-sm transition-all duration-200 ease-out cursor-pointer {rewatch ? 'text-[#40BCF4]' : 'text-[#99AABB] hover:text-white'}"
        onclick={() => rewatch = !rewatch}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="1 4 1 10 7 10" />
          <polyline points="23 20 23 14 17 14" />
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
        </svg>
        <span class="font-medium">Rewatch</span>
      </button>
    </div>

    <div class="border-t border-white/[0.04]"></div>

    <!-- Review -->
    <div class="py-6">
      <label class="block text-[#667788] text-[10px] font-medium uppercase tracking-widest mb-2">Review</label>
      <textarea
        bind:value={review}
        placeholder="Write your thoughts..."
        rows="4"
        class="w-full px-4 py-3 bg-[#14181C] ring-1 ring-white/[0.06] rounded-lg text-white text-sm placeholder:text-[#4A5568] focus:outline-none focus:ring-[#40BCF4]/50 transition-all duration-200 resize-none leading-relaxed"
      ></textarea>
    </div>

    <div class="border-t border-white/[0.04]"></div>

    <!-- Tags -->
    <div class="py-6">
      <label class="block text-[#667788] text-[10px] font-medium uppercase tracking-widest mb-2">Tags</label>
      <TagInput bind:tags placeholder="Add tags..." />
    </div>

    <!-- Save -->
    <div class="flex justify-end pt-4 pb-1">
      <Button variant="primary" onclick={handleSave} disabled={!selectedFilm}>
        Save Entry
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

  .toggle-btn:hover {
    transform: scale(1.05);
  }
  .toggle-btn:active {
    transform: scale(0.95);
  }

  .search-result {
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  }
  .search-result:last-child {
    border-bottom: none;
  }
</style>
