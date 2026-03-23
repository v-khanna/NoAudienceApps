<script lang="ts">
  import { onMount } from 'svelte';
  import { getRecentLogs, type FilmLogWithFilm } from '$lib/films/db';

  interface GroupedLogs {
    label: string;
    entries: FilmLogWithFilm[];
  }

  let logs = $state<FilmLogWithFilm[]>([]);

  onMount(async () => {
    try {
      logs = await getRecentLogs(50);
    } catch (e: any) {
      console.error('Failed to load diary:', e);
    }
  });

  let groupedLogs = $derived.by(() => {
    const groups: GroupedLogs[] = [];
    const monthMap = new Map<string, FilmLogWithFilm[]>();

    for (const log of logs) {
      const date = new Date(log.watchedDate ?? '');
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (!monthMap.has(key)) {
        monthMap.set(key, []);
        groups.push({ label, entries: monthMap.get(key)! });
      }
      monthMap.get(key)!.push(log);
    }

    return groups;
  });

  function ratingToStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '\u2605'.repeat(full) + (half ? '\u00BD' : '');
  }
</script>

<main style="padding-bottom: 64px;">
  <h1 style="font-family: 'Newsreader', Georgia, serif; font-size: 1.75rem; font-weight: 500; color: var(--text-primary); margin: 0 0 8px;">Film Diary</h1>
  <p style="font-size: 13px; color: var(--text-secondary); margin: 0 0 40px;">{logs.length} entries</p>

  {#each groupedLogs as group}
    <section style="margin-bottom: 40px;">
      <h2 class="month-header">{group.label}</h2>
      <div style="display: flex; flex-direction: column; gap: 2px; border-radius: 10px; overflow: hidden;">
        {#each group.entries as entry}
          <a
            href="/films/{entry.film.id}"
            class="diary-row"
          >
            <span class="diary-date">
              {new Date(entry.watchedDate ?? '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            {#if entry.film.posterPath}
              <img src={entry.film.posterPath} alt={entry.film.title} class="diary-poster" />
            {/if}
            <div style="flex: 1; min-width: 0;">
              <span class="diary-title">{entry.film.title}</span>
              <span class="diary-year">{entry.film.year}</span>
            </div>
            <span class="diary-rating">{ratingToStars(entry.rating ?? 0)}</span>
            {#if entry.liked}
              <span style="color: #FF6B6B; flex-shrink: 0;">{'\u2665'}</span>
            {/if}
            {#if entry.rewatch}
              <span style="font-size: 11px; color: var(--text-muted); flex-shrink: 0;">↻</span>
            {/if}
          </a>
        {/each}
      </div>
    </section>
  {/each}

  {#if logs.length === 0}
    <div style="padding: 80px 0; text-align: center;">
      <p style="font-family: 'Newsreader', Georgia, serif; font-size: 1.25rem; color: var(--text-primary); margin: 0 0 8px;">Your diary is empty</p>
      <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">Start logging films to build your viewing history.</p>
    </div>
  {/if}
</main>

<style>
  .month-header {
    font-family: 'Newsreader', Georgia, serif;
    font-size: 1.125rem;
    font-weight: 500;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .diary-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 16px;
    font-size: 14px;
    text-decoration: none;
    color: inherit;
    background: var(--surface-container-low);
    transition: background 150ms;
  }
  .diary-row:hover {
    background: var(--surface-container);
  }

  .diary-date {
    color: var(--text-muted);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    width: 52px;
    text-align: left;
    flex-shrink: 0;
  }

  .diary-poster {
    width: 32px;
    height: 48px;
    object-fit: cover;
    border-radius: 3px;
    flex-shrink: 0;
  }

  .diary-title {
    font-family: 'Newsreader', Georgia, serif;
    color: var(--text-primary);
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .diary-year {
    color: var(--text-muted);
    font-size: 12px;
    margin-left: 6px;
    flex-shrink: 0;
  }

  .diary-rating {
    color: var(--accent);
    font-size: 13px;
    flex-shrink: 0;
  }
</style>
