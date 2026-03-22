<script lang="ts">
  import Modal from '@noaudience/core/components/Modal.svelte';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import TagInput from '@noaudience/core/components/TagInput.svelte';
  import Button from '@noaudience/core/components/Button.svelte';
  import { logFilm, searchFilms } from './db';

  interface Props {
    open: boolean;
    onclose: () => void;
    onsave?: () => void;
  }

  let { open, onclose, onsave }: Props = $props();

  let filmTitle = $state('');
  let watchedDate = $state(new Date().toISOString().split('T')[0]);
  let rating = $state(0);
  let liked = $state(false);
  let rewatch = $state(false);
  let review = $state('');
  let tags = $state<string[]>([]);

  let searchResults = $derived(
    filmTitle.length >= 2 ? searchFilms(filmTitle).slice(0, 5) : []
  );
  let selectedFilmId = $state<number | null>(null);
  let showResults = $state(false);

  function selectFilm(film: { id: number; title: string; year: number }) {
    selectedFilmId = film.id;
    filmTitle = `${film.title} (${film.year})`;
    showResults = false;
  }

  function handleSave() {
    if (!selectedFilmId) return;
    logFilm({
      filmId: selectedFilmId,
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
    filmTitle = '';
    watchedDate = new Date().toISOString().split('T')[0];
    rating = 0;
    liked = false;
    rewatch = false;
    review = '';
    tags = [];
    selectedFilmId = null;
  }
</script>

<Modal {open} {onclose} title="Log Film">
  <div class="space-y-5">
    <!-- Film search -->
    <div class="relative">
      <label class="block text-[#99AABB] text-xs font-medium uppercase tracking-wider mb-1.5">Film</label>
      <input
        type="text"
        bind:value={filmTitle}
        onfocus={() => showResults = true}
        placeholder="Search for a film..."
        class="w-full px-3 h-10 bg-[#1B2028] border border-white/[0.06] rounded-[6px] text-white text-sm placeholder:text-[#99AABB] focus:outline-none focus:border-[#40BCF4] transition-colors"
      />
      {#if showResults && searchResults.length > 0}
        <div class="absolute z-10 w-full mt-1 bg-[#2C3440] border border-white/[0.08] rounded-[6px] overflow-hidden shadow-xl">
          {#each searchResults as film}
            <button
              class="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#3C4450] transition-colors cursor-pointer flex items-center gap-3"
              onclick={() => selectFilm(film)}
            >
              <img src={film.posterPath} alt="" class="w-8 h-12 object-cover rounded-[2px]" />
              <div>
                <span class="font-medium">{film.title}</span>
                <span class="text-[#99AABB] ml-1">({film.year})</span>
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>

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
        class="flex items-center gap-2 text-sm transition-colors cursor-pointer {liked ? 'text-[#FF8000]' : 'text-[#99AABB] hover:text-white'}"
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
      <Button variant="primary" onclick={handleSave} disabled={!selectedFilmId}>
        Save
      </Button>
    </div>
  </div>
</Modal>
