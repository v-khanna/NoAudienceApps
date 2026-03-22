<script lang="ts">
  import { getRecentLogs } from '$lib/films/db';
  import type { Film } from '$lib/films/mock';

  interface LogWithFilm {
    id: number;
    filmId: number;
    watchedDate: string;
    rating: number;
    liked: boolean;
    rewatch: boolean;
    review: string;
    tags: string[];
    createdAt: string;
    film: Film;
  }

  let logs = $state(getRecentLogs(50));

  let groupedLogs = $derived(() => {
    const groups: { label: string; entries: LogWithFilm[] }[] = [];
    const monthMap = new Map<string, LogWithFilm[]>();

    for (const log of logs) {
      const date = new Date(log.watchedDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (!monthMap.has(key)) {
        monthMap.set(key, []);
        groups.push({ label, entries: monthMap.get(key)! });
      }
      monthMap.get(key)!.push(log as LogWithFilm);
    }

    return groups;
  });

  function ratingToStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return '★'.repeat(full) + (half ? '½' : '');
  }
</script>

<div class="max-w-3xl">
  <h1 style="font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 24px;">Diary</h1>

  {#each groupedLogs() as group}
    <section style="margin-bottom: 24px;">
      <h2 class="month-header">{group.label}</h2>
      <div class="diary-table">
        {#each group.entries as entry, i}
          <a
            href="/films/{entry.film.id}"
            class="diary-row"
            class:border-bottom={i < group.entries.length - 1}
          >
            <span class="diary-date">
              {new Date(entry.watchedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <img
              src={entry.film.posterPath}
              alt={entry.film.title}
              class="diary-poster"
            />
            <span class="diary-title">{entry.film.title}</span>
            <span class="diary-year">{entry.film.year}</span>
            <span class="diary-rating">{ratingToStars(entry.rating)}</span>
            {#if entry.liked}
              <span class="diary-liked">♥</span>
            {/if}
          </a>
        {/each}
      </div>
    </section>
  {/each}

  {#if logs.length === 0}
    <div style="padding: 32px 0; color: var(--text-secondary); text-align: center;">
      No diary entries yet. Start logging films to build your viewing history.
    </div>
  {/if}
</div>

<style>
  .month-header {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
    margin-bottom: 8px;
    font-weight: 500;
  }

  .diary-table {
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
  }

  .diary-row {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 32px;
    padding: 0 12px;
    font-size: 13px;
    text-decoration: none;
    color: inherit;
    transition: background-color 150ms ease-out;
  }
  .diary-row:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }
  .diary-row.border-bottom {
    border-bottom: 1px solid var(--border-subtle);
  }

  .diary-date {
    color: var(--text-secondary);
    width: 64px;
    flex-shrink: 0;
  }

  .diary-poster {
    width: 24px;
    height: 24px;
    object-fit: cover;
    border-radius: 2px;
    border: 1px solid var(--border);
    flex-shrink: 0;
  }

  .diary-title {
    color: var(--text-primary);
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .diary-year {
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  .diary-rating {
    color: var(--accent);
    flex-shrink: 0;
  }

  .diary-liked {
    color: var(--text-secondary);
    flex-shrink: 0;
  }
</style>
