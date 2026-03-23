<script lang="ts">
  import { getWatchlist, type WatchlistEntryWithFilm } from '$lib/films/db';
  import AddToWatchlistModal from '$lib/films/AddToWatchlistModal.svelte';

  let sortBy = $state<'added' | 'title' | 'year'>('added');
  let watchlist = $state<WatchlistEntryWithFilm[]>([]);
  let addModalOpen = $state(false);

  async function loadWatchlist() {
    try {
      watchlist = await getWatchlist(sortBy);
    } catch (e: any) {
      console.error('Failed to load watchlist:', e);
    }
  }

  // Load on mount and reload when sort changes
  $effect(() => {
    // Access sortBy to create the dependency
    const _sort = sortBy;
    loadWatchlist();
  });
</script>

<main style="padding-bottom: 64px;">

  <!-- Header -->
  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 32px;">
    <h1 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.75rem; font-weight: 500; color: var(--text-primary); margin: 0;">Watchlist</h1>
    <span style="font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted);">{watchlist.length} Films</span>
    <button
      onclick={() => addModalOpen = true}
      style="padding: 6px 16px; border-radius: 999px; background: var(--accent); color: #00390F; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 150ms;"
      onmouseenter={(e) => e.currentTarget.style.opacity = '0.85'}
      onmouseleave={(e) => e.currentTarget.style.opacity = '1'}
    >+ Add Film</button>
    <div style="flex: 1;"></div>
    <!-- Sort -->
    <div style="display: flex; align-items: center; gap: 8px; background: var(--surface-container-low); padding: 6px 14px; border-radius: 8px; cursor: pointer;">
      <select
        bind:value={sortBy}
        class="sort-select"
      >
        <option value="added">Date Added</option>
        <option value="title">Title</option>
        <option value="year">Year</option>
      </select>
    </div>
  </div>

  <!-- Poster Grid -->
  {#if watchlist.length > 0}
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 32px 24px;">
      {#each watchlist as entry}
        <a href="/films/{entry.film.id}" class="poster-card" style="text-decoration: none; cursor: pointer; display: block;">
          <div style="aspect-ratio: 2/3; width: 100%; margin-bottom: 12px; overflow: hidden; border-radius: 6px; position: relative; background: var(--surface-container);">
            {#if entry.film.posterPath}
              <img
                src={entry.film.posterPath}
                alt={entry.film.title}
                class="poster-img"
                loading="lazy"
                style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s;"
              />
            {/if}
            <div class="poster-overlay" style="position: absolute; inset: 0; background: linear-gradient(to top, var(--surface-base) 0%, transparent 60%); opacity: 0; transition: opacity 0.3s; display: flex; align-items: flex-end; padding: 12px;">
            </div>
          </div>
          <h3 style="font-family: 'Newsreader', Georgia, serif; font-size: 1rem; color: var(--text-primary); margin: 0 0 4px; line-height: 1.3;">{entry.film.title}</h3>
          <div style="display: flex; align-items: center; gap: 6px;">
            {#if entry.film.genres?.length}
              <span style="font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); font-weight: 500;">{(entry.film.genres as string[])[0]}</span>
              <span style="color: var(--text-muted);">·</span>
            {/if}
            <span style="font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted);">
              {#if entry.addedAt}Added {new Date(entry.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}{/if}
            </span>
          </div>
        </a>
      {/each}

      <!-- Add Movie card -->
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <div onclick={() => addModalOpen = true} style="cursor: pointer; display: flex; align-items: center; justify-content: center; aspect-ratio: 2/3; border-radius: 6px; border: 1px dashed var(--ghost-border); background: transparent; transition: background 200ms, border-color 200ms;"
        onmouseenter={(e) => { e.currentTarget.style.background = 'var(--surface-container-low)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
        onmouseleave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--ghost-border)'; }}
      >
        <div style="text-align: center;">
          <div style="font-size: 32px; color: var(--text-muted); margin-bottom: 8px;">+</div>
          <span style="font-size: 0.6875rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted);">Add Movie</span>
        </div>
      </div>
    </div>
  {:else}
    <div style="padding: 80px 0; text-align: center;">
      <div style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;">+</div>
      <p style="font-family: 'Newsreader', Georgia, serif; font-size: 1.25rem; color: var(--text-primary); margin: 0 0 8px;">Your watchlist is empty</p>
      <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">Add films you want to watch later.</p>
    </div>
  {/if}
</main>

<AddToWatchlistModal
  open={addModalOpen}
  onclose={() => addModalOpen = false}
  onsave={loadWatchlist}
/>

<style>
  .sort-select {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: 0.6875rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    outline: none;
    appearance: none;
  }

  .poster-card:hover .poster-img {
    transform: scale(1.05);
  }

  .poster-card:hover .poster-overlay {
    opacity: 1 !important;
  }

  .poster-card:hover h3 {
    color: var(--accent) !important;
  }
</style>
