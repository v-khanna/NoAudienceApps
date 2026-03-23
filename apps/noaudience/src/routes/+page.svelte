<script lang="ts">
  import { onMount } from 'svelte';
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import StarRating from '@noaudience/core/components/StarRating.svelte';
  import { getFilmStats, getRecentLogs, getWatchlist, type FilmLogWithFilm, type WatchlistEntryWithFilm, type FilmStats } from '$lib/films/db';
  import { getCurrentlyReading, getAllBooks } from '$lib/books/db';
  import type { Book, BookProgressEntry } from '$lib/books/mock';
  import { getDb } from '@noaudience/core/db';
  import { writings } from '@noaudience/core/db/schema';
  import { desc } from 'drizzle-orm';

  let stats = $state<FilmStats | null>(null);
  let recentLogs = $state<FilmLogWithFilm[]>([]);
  let watchlist = $state<WatchlistEntryWithFilm[]>([]);
  let currentlyReading = $state<Array<Book & { latestProgress: BookProgressEntry | undefined }>>([]);
  let bookCount = $state(0);
  let drafts = $state<any[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      const [s, logs, wl, reading, books, w] = await Promise.all([
        getFilmStats(),
        getRecentLogs(6),
        getWatchlist().then(items => items.slice(0, 6)),
        getCurrentlyReading(),
        getAllBooks(),
        getDb().select().from(writings).orderBy(desc(writings.updatedAt)).limit(3),
      ]);
      stats = s;
      recentLogs = logs;
      watchlist = wl;
      currentlyReading = reading;
      bookCount = books.length;
      drafts = w;
    } catch (e) {
      console.error('Dashboard load failed:', e);
    } finally {
      loading = false;
    }
  });

  function formatDate(d: string | null | undefined): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
</script>

<main style="min-height: 100%; padding-bottom: 64px;">

  {#if loading}
    <p style="color: var(--text-muted);">Loading...</p>
  {:else}

    <!-- Hero / Editorial Header -->
    <section style="margin-bottom: 64px;">
      <span style="font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.2em; color: var(--accent); display: block; margin-bottom: 16px;">Dashboard Overview</span>
      <h1 style="font-family: 'Newsreader', Georgia, serif; font-size: 3rem; font-weight: 400; color: var(--text-primary); margin: 0; max-width: 600px; line-height: 1.15;">
        Refining the collection, one entry at a time.
      </h1>
    </section>

    <!-- Bento Grid: At a Glance + Recent Activity -->
    <section style="display: grid; grid-template-columns: 8fr 4fr; gap: 24px; margin-bottom: 64px;">

      <!-- At a Glance (left, wider) -->
      <div style="background: var(--surface-container-low); padding: 32px; border-radius: 8px; position: relative; overflow: hidden;">
        <h3 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.5rem; color: var(--text-primary); margin: 0 0 32px;">At a Glance</h3>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;">
          {#each [
            { label: 'Total Archive', value: (stats?.totalFilms ?? 0) + bookCount, color: 'var(--text-secondary)' },
            { label: 'Films', value: stats?.totalFilms ?? 0, color: 'var(--accent)' },
            { label: 'Books', value: bookCount, color: '#76E9B1' },
            { label: 'Writings', value: drafts.length, color: 'var(--text-secondary)' },
          ] as stat}
            <div>
              <p style="font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: {stat.color}; margin: 0 0 4px;">{stat.label}</p>
              <span style="font-family: 'Newsreader', Georgia, serif; font-size: 1.875rem; color: var(--text-primary);">{stat.value.toLocaleString()}</span>
            </div>
          {/each}
        </div>
        <!-- Decorative glow -->
        <div style="position: absolute; right: -48px; bottom: -48px; width: 256px; height: 256px; background: rgba(0, 224, 84, 0.04); border-radius: 50%; filter: blur(60px); pointer-events: none;"></div>
      </div>

      <!-- Recent Activity (right, narrower) -->
      <div style="background: var(--surface-container); padding: 32px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h3 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.25rem; color: var(--text-primary); margin: 0;">Recent Activity</h3>
        </div>
        {#if recentLogs.length === 0}
          <p style="font-size: 13px; color: var(--text-muted);">No activity yet.</p>
        {:else}
          <div style="display: flex; flex-direction: column; gap: 20px;">
            {#each recentLogs.slice(0, 4) as log}
              <div style="display: flex; gap: 12px; align-items: flex-start;">
                <div style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-top: 6px; flex-shrink: 0;"></div>
                <div>
                  <p style="font-size: 14px; color: var(--text-primary); margin: 0; line-height: 1.4;">
                    Logged <a href="/films/{log.film?.id}" style="color: var(--accent); text-decoration: none;">{log.film?.title ?? 'Unknown'}</a>
                    {#if log.rating} — {log.rating}★{/if}
                  </p>
                  <p style="font-size: 0.6875rem; color: var(--text-muted); margin: 4px 0 0;">{formatDate(log.watchedDate)}</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>

    </section>

    <!-- Watchlist Shelf -->
    {#if watchlist.length > 0}
      <section style="margin-bottom: 64px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px;">
          <div>
            <span style="font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.15em; color: var(--accent);">Cinematic Queue</span>
            <h3 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.875rem; color: var(--text-primary); margin: 8px 0 0;">Recent Watchlist</h3>
          </div>
          <a href="/films/watchlist" style="font-size: 13px; color: var(--text-secondary); text-decoration: underline; text-underline-offset: 4px;">View All</a>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 24px;">
          {#each watchlist as item}
            <div style="cursor: pointer;">
              <div style="aspect-ratio: 2/3; overflow: hidden; border-radius: 8px; background: var(--surface-container); margin-bottom: 12px;">
                {#if item.film?.posterPath}
                  <img src={item.film.posterPath} alt={item.film?.title ?? ''} style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85; transition: opacity 0.5s, transform 0.7s;"
                    onmouseenter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onmouseleave={(e) => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                {/if}
              </div>
              <a href="/films/{item.film?.id}" style="text-decoration: none;">
                <h4 style="font-family: 'Newsreader', Georgia, serif; font-size: 1rem; color: var(--text-primary); margin: 0;">{item.film?.title ?? ''}</h4>
              </a>
              <p style="font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-secondary); margin: 4px 0 0;">
                {item.film?.year ?? ''}{#if item.film?.genres?.length} • {(item.film.genres as string[])[0]}{/if}
              </p>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Library Highlights + Writing — Side by side -->
    <section style="display: grid; grid-template-columns: 7fr 5fr; gap: 32px;">

      <!-- Library Highlights -->
      <div>
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 32px;">
          <h3 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.875rem; color: var(--text-primary); margin: 0;">Library Highlights</h3>
          <div style="height: 1px; flex: 1; background: rgba(255,255,255,0.06);"></div>
        </div>
        {#if currentlyReading.length === 0 && bookCount === 0}
          <p style="font-size: 13px; color: var(--text-muted);">No books in your library yet.</p>
        {:else}
          <div style="display: flex; flex-direction: column; gap: 12px;">
            {#each currentlyReading as item}
              <a href="/books/{item.id}" style="display: flex; align-items: center; gap: 20px; padding: 16px; border-radius: 8px; background: var(--surface-container-low); text-decoration: none; transition: background 200ms;"
                onmouseenter={(e) => e.currentTarget.style.background = 'var(--surface-container)'}
                onmouseleave={(e) => e.currentTarget.style.background = 'var(--surface-container-low)'}
              >
                <div style="width: 48px; height: 64px; background: var(--surface-container-high); border-radius: 4px; overflow: hidden; flex-shrink: 0;">
                  {#if item.coverPath}
                    <img src={item.coverPath} alt={item.title} style="width: 100%; height: 100%; object-fit: cover; opacity: 0.7;" />
                  {/if}
                </div>
                <div style="flex: 1; min-width: 0;">
                  <h5 style="font-family: 'Newsreader', Georgia, serif; font-size: 1rem; color: var(--text-primary); margin: 0; line-height: 1.2;">{item.title}</h5>
                  {#if item.author}
                    <p style="font-size: 13px; color: var(--text-secondary); margin: 4px 0 0;">{item.author}</p>
                  {/if}
                </div>
                <div style="text-align: right; flex-shrink: 0;">
                  {#if item.latestProgress?.progressValue && item.pageCount}
                    <span style="display: inline-block; padding: 4px 12px; background: rgba(0, 224, 84, 0.1); color: var(--accent); border-radius: 999px; font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em;">In Progress</span>
                    <p style="font-size: 0.6875rem; color: var(--text-secondary); margin: 8px 0 0;">Page {item.latestProgress.progressValue} / {item.pageCount}</p>
                  {:else}
                    <span style="display: inline-block; padding: 4px 12px; background: var(--surface-container-high); color: var(--text-secondary); border-radius: 999px; font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em;">Queued</span>
                  {/if}
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Writing -->
      <div style="background: var(--surface-container-low); border-radius: 8px; padding: 32px; height: fit-content;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;">
          <div>
            <h3 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.25rem; color: var(--text-primary); margin: 0 0 4px;">Writing</h3>
            <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">Recent drafts and notes.</p>
          </div>
        </div>
        {#if drafts.length === 0}
          <p style="font-size: 13px; color: var(--text-muted);">No drafts yet.</p>
        {:else}
          {#each drafts as draft, i}
            {#if i === 0}
              <!-- Featured draft -->
              <a href="/writing/{draft.id}" style="display: block; padding: 20px; background: var(--surface-container-lowest, #0A0F13); border-radius: 8px; border-left: 2px solid var(--accent); text-decoration: none; margin-bottom: 16px;">
                <p style="font-size: 14px; font-style: italic; color: var(--text-primary); margin: 0 0 12px; line-height: 1.6;">
                  {draft.title}
                </p>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  {#if draft.wordCount}
                    <span style="font-size: 0.6875rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent);">{draft.wordCount.toLocaleString()} words</span>
                  {/if}
                  <span style="font-size: 0.6875rem; color: var(--text-muted);">{formatDate(draft.updatedAt)}</span>
                </div>
              </a>
            {:else}
              <a href="/writing/{draft.id}" style="display: flex; align-items: center; gap: 12px; padding: 10px 0; text-decoration: none; border-top: 1px solid rgba(255,255,255,0.04);">
                <span style="font-size: 14px; color: var(--text-primary); flex: 1;">{draft.title}</span>
                <span style="font-size: 12px; color: var(--text-muted);">{formatDate(draft.updatedAt)}</span>
              </a>
            {/if}
          {/each}
        {/if}
      </div>

    </section>

  {/if}
</main>
