# NoAudience Production-Ready Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the existing NoAudience app from mock-data prototypes to a fully functional desktop app — real database persistence, working search, Substack article import, rich text editor, interactive chess board, and polished workflows.

**Architecture:** All 5 modules currently use in-memory `$state` mock data. We wire them to real SQLite via the existing `tauri-plugin-sql` + Drizzle ORM `sqlite-proxy` setup. API calls (TMDB, Open Library) stay on the frontend but tokens move to settings/env. Substack RSS is fetched client-side and articles stored in SQLite. TipTap editor replaces plain text in Writing. A chess board library renders interactive boards.

**Tech Stack:** Tauri v2, SvelteKit 2, Svelte 5, Drizzle ORM (sqlite-proxy), tauri-plugin-sql, Tailwind CSS 4, TipTap (via Svelte adapter), chessground (chess board), lucide-svelte

---

## Scope — 8 Phases

| # | Phase | What it does |
|---|-------|-------------|
| 1 | Database Wiring | Connect Drizzle to tauri-plugin-sql, replace all mock data |
| 2 | Films Module | Wire films CRUD, TMDB search, watchlist, lists, diary, stats to DB |
| 3 | Books Module | Wire books CRUD, Open Library search, shelves, progress, reviews, challenge, stats to DB |
| 4 | Articles + Substack Import | Wire articles DB, fetch RSS from virkhanna.substack.com, scrape article content, highlights |
| 5 | Writing + Rich Editor | Install TipTap, build markdown live-preview editor, wire to DB |
| 6 | Chess + Interactive Board | Install chessground, build interactive board viewer, wire to DB |
| 7 | Global Search & Settings | Cmd+K global search across all modules, wire settings to DB |
| 8 | Polish & Security | Move TMDB token, fix interactions, smooth workflows, .gitignore data files |

---

## File Structure

### New files to create:
```
apps/noaudience/src/lib/
├── db.ts                              # Central DB init — connects Drizzle to tauri-plugin-sql
├── films/
│   └── db.ts                          # REWRITE: real Drizzle queries replacing mock
├── books/
│   └── db.ts                          # REWRITE: real Drizzle queries replacing mock
├── articles/
│   ├── db.ts                          # REWRITE: real Drizzle queries replacing mock (rename from db.svelte.ts)
│   └── substack.ts                    # NEW: RSS fetch + article scraping for Substack
├── writing/
│   ├── db.ts                          # REWRITE: real Drizzle queries replacing mock (rename from db.svelte.ts)
│   └── Editor.svelte                  # NEW: TipTap rich text editor component
├── chess/
│   ├── db.ts                          # REWRITE: real Drizzle queries replacing mock
│   └── Board.svelte                   # NEW: Chessground interactive board component
└── search.ts                          # NEW: Global cross-module search

data/                                  # NEW: gitignored local data directory
└── substack-cache/                    # Cached Substack article HTML/images
```

### Files to modify:
```
apps/noaudience/src/routes/+layout.svelte           # Init DB on app start
apps/noaudience/src/routes/+layout.ts               # SPA mode + DB init
apps/noaudience/src/routes/articles/+page.svelte     # Wire to real DB + Substack sync
apps/noaudience/src/routes/articles/[id]/+page.svelte # Wire highlights to DB
apps/noaudience/src/routes/writing/[id]/+page.svelte  # TipTap editor integration
apps/noaudience/src/routes/chess/[id]/+page.svelte    # Chessground board integration
apps/noaudience/src/routes/settings/+page.svelte      # Wire settings to DB
apps/noaudience/src/lib/films/tmdb.ts                 # Remove hardcoded token
packages/core/src/components/SearchBar.svelte         # Cmd+K global search overlay
.gitignore                                            # Add data/ directory
```

---

## Phase 1: Database Wiring

### Task 1.1: Connect Drizzle to tauri-plugin-sql

**Files:**
- Create: `apps/noaudience/src/lib/db.ts`
- Modify: `apps/noaudience/src/routes/+layout.svelte`
- Reference: `packages/core/src/db/client.ts`, `packages/core/src/db/schema.ts`

- [ ] **Step 0: Install the @tauri-apps/plugin-sql npm package**

The Rust crate `tauri-plugin-sql` is installed, but the JS frontend bridge is missing.

```bash
cd /Users/adaa/Code/NoAudienceApps
pnpm add @tauri-apps/plugin-sql --filter noaudience
```

- [ ] **Step 1: Update the Drizzle sqlite-proxy client to use the `method` parameter**

The existing `packages/core/src/db/client.ts` already receives a `method` parameter in the sqlite-proxy callback, but only uses it for `get` vs default. We need to update it so the bridge function receives `method` too, enabling proper routing of `RETURNING` queries (which are INSERTs that return rows).

Update `packages/core/src/db/client.ts`:
```typescript
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema';

let db: ReturnType<typeof createDb> | null = null;

function createDb(execute: (sql: string, params: unknown[], method: string) => Promise<unknown[]>) {
  return drizzle(
    async (sql, params, method) => {
      const result = await execute(sql, params as unknown[], method);
      if (method === 'get') {
        return { rows: result.length ? [result[0]] : [] };
      }
      return { rows: result || [] };
    },
    { schema }
  );
}

export function initDb(execute: (sql: string, params: unknown[], method: string) => Promise<unknown[]>) {
  db = createDb(execute);
  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

export type Database = ReturnType<typeof createDb>;
```

- [ ] **Step 2: Create the central DB initialization module**

This file bridges Drizzle ORM's `sqlite-proxy` driver to Tauri's SQL plugin. We use the `method` parameter to route queries correctly — `run` for mutations, `all`/`get` for selects. Queries with `RETURNING` are INSERTs that need `tauriDb.select()` to get rows back.

```typescript
// apps/noaudience/src/lib/db.ts
import TauriDatabase from '@tauri-apps/plugin-sql';
import { initDb, getDb } from '@noaudience/core/db';

let tauriDb: Awaited<ReturnType<typeof TauriDatabase.load>> | null = null;

export async function initDatabase() {
  if (tauriDb) return getDb();

  tauriDb = await TauriDatabase.load('sqlite:noaudience.db');

  const db = initDb(async (sql: string, params: unknown[], method: string) => {
    // 'run' = mutation with no return rows (unless RETURNING is present)
    // 'all' / 'get' = SELECT queries that return rows
    if (method === 'run') {
      // Check for RETURNING clause — these are INSERT/UPDATE/DELETE that return rows
      if (sql.toUpperCase().includes('RETURNING')) {
        return await tauriDb!.select<Record<string, unknown>[]>(sql, params as any[]);
      }
      await tauriDb!.execute(sql, params as any[]);
      return [];
    }
    // 'all' or 'get' — SELECT queries
    return await tauriDb!.select<Record<string, unknown>[]>(sql, params as any[]);
  });

  return db;
}

export { getDb } from '@noaudience/core/db';
```

- [ ] **Step 2: Initialize DB on app startup in layout**

Modify `+layout.svelte` to call `initDatabase()` before rendering content. Use an `{#await}` block or `onMount` to show a loading state while DB connects.

```svelte
<!-- Add to +layout.svelte -->
<script>
  import { onMount } from 'svelte';
  import { initDatabase } from '$lib/db';

  let ready = $state(false);

  onMount(async () => {
    await initDatabase();
    ready = true;
  });
</script>

{#if ready}
  <!-- existing layout content -->
{:else}
  <div class="flex items-center justify-center h-screen bg-[#14181C]">
    <p class="text-[#99AABB]">Loading...</p>
  </div>
{/if}
```

- [ ] **Step 3: Verify the app starts and connects to SQLite**

Run: `cd /Users/adaa/Code/NoAudienceApps && pnpm tauri dev`
Expected: App launches, shows loading briefly, then renders the normal UI. No errors in console about database.

- [ ] **Step 4: Commit**

```bash
git add apps/noaudience/src/lib/db.ts apps/noaudience/src/routes/+layout.svelte
git commit -m "feat: wire Drizzle ORM to tauri-plugin-sql for real SQLite persistence"
```

---

## Phase 2: Films Module — Real Database

### Task 2.1: Rewrite films/db.ts with Drizzle queries

**Files:**
- Rewrite: `apps/noaudience/src/lib/films/db.ts`
- Reference: `packages/core/src/db/schema.ts` (films, filmLogs, filmWatchlist, filmLists, filmListItems)

- [ ] **Step 1: Rewrite films/db.ts — Film CRUD**

Replace mock data arrays with real Drizzle queries. Keep the same function signatures so UI components don't need changes.

```typescript
// apps/noaudience/src/lib/films/db.ts
import { getDb } from '$lib/db';
import { films, filmLogs, filmWatchlist, filmLists, filmListItems } from '@noaudience/core/db/schema';
import { eq, desc, like, or, sql, asc } from 'drizzle-orm';

// ─── Films CRUD ─────────────────────────────────────────────

export async function getFilms() {
  return getDb().select().from(films).orderBy(desc(films.createdAt));
}

export async function getFilmById(id: number) {
  const rows = await getDb().select().from(films).where(eq(films.id, id));
  return rows[0];
}

export async function searchFilms(query: string) {
  const q = `%${query}%`;
  return getDb().select().from(films)
    .where(or(like(films.title, q), like(films.director, q)));
}

export async function addFilmFromTmdb(tmdbResult: {
  id: number; title: string; release_date: string; overview: string;
  poster_path: string; backdrop_path: string; genre_ids?: number[];
  director?: string; runtime?: number; tagline?: string;
  genres?: string[]; cast?: string[]; crew?: string[];
}) {
  const result = await getDb().insert(films).values({
    tmdbId: tmdbResult.id,
    title: tmdbResult.title,
    year: tmdbResult.release_date ? parseInt(tmdbResult.release_date) : null,
    director: tmdbResult.director || null,
    runtime: tmdbResult.runtime || null,
    tagline: tmdbResult.tagline || null,
    synopsis: tmdbResult.overview || null,
    posterPath: tmdbResult.poster_path || null,
    backdropPath: tmdbResult.backdrop_path || null,
    genres: tmdbResult.genres || [],
    cast: tmdbResult.cast || [],
    crew: tmdbResult.crew || [],
  }).returning();
  return result[0];
}

// ─── Film Logs (Diary) ─────────────────────────────────────

export async function logFilm(data: {
  filmId: number; watchedDate: string; rating: number;
  liked: boolean; rewatch: boolean; review: string; tags: string[];
}) {
  const result = await getDb().insert(filmLogs).values(data).returning();
  return result[0];
}

export async function getFilmLogs(filmId?: number) {
  if (filmId) {
    return getDb().select().from(filmLogs)
      .where(eq(filmLogs.filmId, filmId))
      .orderBy(desc(filmLogs.watchedDate));
  }
  return getDb().select().from(filmLogs).orderBy(desc(filmLogs.watchedDate));
}

export async function getRecentLogs(limit = 10) {
  const logs = await getDb().select().from(filmLogs)
    .orderBy(desc(filmLogs.watchedDate))
    .limit(limit);

  const enriched = [];
  for (const log of logs) {
    const film = await getFilmById(log.filmId!);
    if (film) enriched.push({ ...log, film });
  }
  return enriched;
}

// ─── Watchlist ──────────────────────────────────────────────

export async function addToWatchlist(filmId: number) {
  const result = await getDb().insert(filmWatchlist).values({ filmId }).returning();
  return result[0];
}

export async function removeFromWatchlist(filmId: number) {
  await getDb().delete(filmWatchlist).where(eq(filmWatchlist.filmId, filmId));
}

export async function isOnWatchlist(filmId: number) {
  const rows = await getDb().select().from(filmWatchlist).where(eq(filmWatchlist.filmId, filmId));
  return rows.length > 0;
}

export async function getWatchlist(sort: 'added' | 'title' | 'year' = 'added') {
  const entries = await getDb().select().from(filmWatchlist).orderBy(desc(filmWatchlist.addedAt));
  const enriched = [];
  for (const entry of entries) {
    const film = await getFilmById(entry.filmId!);
    if (film) enriched.push({ ...entry, film });
  }
  if (sort === 'title') enriched.sort((a, b) => a.film.title.localeCompare(b.film.title));
  if (sort === 'year') enriched.sort((a, b) => (b.film.year || 0) - (a.film.year || 0));
  return enriched;
}

// ─── Lists ──────────────────────────────────────────────────

export async function createList(title: string, description: string, ranked: boolean) {
  const result = await getDb().insert(filmLists).values({ title, description, ranked }).returning();
  return result[0];
}

export async function getLists() {
  const lists = await getDb().select().from(filmLists).orderBy(desc(filmLists.createdAt));
  const enriched = [];
  for (const list of lists) {
    const items = await getDb().select().from(filmListItems)
      .where(eq(filmListItems.listId, list.id))
      .orderBy(asc(filmListItems.position));
    const listFilms = [];
    for (const item of items) {
      const film = await getFilmById(item.filmId!);
      if (film) listFilms.push(film);
    }
    enriched.push({ ...list, films: listFilms });
  }
  return enriched;
}

export async function addToList(listId: number, filmId: number) {
  const items = await getDb().select().from(filmListItems)
    .where(eq(filmListItems.listId, listId));
  await getDb().insert(filmListItems).values({
    listId, filmId, position: items.length,
  });
}

// ─── Stats ──────────────────────────────────────────────────

export async function getFilmStats() {
  const allFilms = await getFilms();
  const allLogs = await getFilmLogs();

  const totalFilms = allFilms.length;
  const totalHours = allFilms.reduce((sum, f) => sum + (f.runtime || 0), 0) / 60;
  const ratings = allLogs.filter(l => l.rating).map(l => l.rating!);
  const averageRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  const ratingDistribution: Record<string, number> = {};
  for (const r of ratings) {
    const key = r.toString();
    ratingDistribution[key] = (ratingDistribution[key] || 0) + 1;
  }

  const genreCounts: Record<string, number> = {};
  for (const f of allFilms) {
    const genres = (f.genres as string[]) || [];
    for (const g of genres) {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    }
  }

  const directorCounts: Record<string, number> = {};
  for (const f of allFilms) {
    if (f.director) {
      directorCounts[f.director] = (directorCounts[f.director] || 0) + 1;
    }
  }
  const topDirectors = Object.entries(directorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  return { totalFilms, totalHours, averageRating, ratingDistribution, genreCounts, topDirectors };
}
```

- [ ] **Step 2: Update all Films route pages to use async DB calls**

Every films page currently calls synchronous mock functions like `getFilms()`. Now they return Promises. Update each page to use `onMount` + `await` or `{#await}` blocks.

Pattern for each page:
```svelte
<script>
  import { onMount } from 'svelte';
  import { getRecentLogs, getWatchlist, getFilmStats } from '$lib/films/db';

  let recentLogs = $state([]);
  let watchlist = $state([]);
  let stats = $state(null);

  onMount(async () => {
    recentLogs = await getRecentLogs(8);
    watchlist = await getWatchlist();
    stats = await getFilmStats();
  });
</script>
```

Apply this pattern to all 7 films routes:
- `/films/+page.svelte` — getRecentLogs, getWatchlist, getFilmStats
- `/films/[id]/+page.svelte` — getFilmById, getFilmLogs(id), isOnWatchlist(id)
- `/films/diary/+page.svelte` — getFilmLogs (all)
- `/films/watchlist/+page.svelte` — getWatchlist
- `/films/lists/+page.svelte` — getLists
- `/films/stats/+page.svelte` — getFilmStats
- Log modal — logFilm, addFilmFromTmdb, searchTmdb

- [ ] **Step 3: Test films module end-to-end**

Run: `pnpm tauri dev`
Test flow:
1. Navigate to Films
2. Search for a movie via TMDB → add it
3. Log a viewing with rating and review
4. Check it appears in Diary
5. Add a film to Watchlist
6. Create a list and add films
7. Check Stats page

- [ ] **Step 4: Commit**

```bash
git add apps/noaudience/src/lib/films/db.ts apps/noaudience/src/routes/films/
git commit -m "feat(films): wire films module to real SQLite database"
```

---

## Phase 3: Books Module — Real Database

### Task 3.1: Rewrite books/db.ts with Drizzle queries

**Files:**
- Rewrite: `apps/noaudience/src/lib/books/db.ts`
- Reference: `packages/core/src/db/schema.ts` (books, bookShelves, bookShelfAssignments, bookProgress, bookReviews, readingChallenges)

- [ ] **Step 1: Rewrite books/db.ts with real Drizzle queries**

Same pattern as films — replace mock arrays with Drizzle queries. Keep identical function signatures. All functions become async.

Key functions to implement:
- `getAllBooks()`, `getBookById(id)`, `searchBooks(query)`, `addBookFromOpenLibrary(result)`, `deleteBook(id)`
- `getAllShelves()`, `createShelf(name, exclusive?)`, `assignBookToShelf(bookId, shelfId)`, `removeBookFromShelf(bookId, shelfId)`, `getBooksOnShelf(shelfId)`, `getExclusiveShelfForBook(bookId)`, `getAllShelvesForBook(bookId)`
- `getProgressForBook(bookId)`, `getLatestProgress(bookId)`, `addProgress(entry)`
- `getReviewForBook(bookId)`, `createReview(review)`, `updateReview(bookId, updates)`
- `getChallenge(year)`, `setChallenge(year, goal)`, `getBooksReadInYear(year)`
- Convenience: `getCurrentlyReading()`, `getRecentlyRead(limit)`, `getWantToRead()`
- Stats: `getTotalPagesRead()`, `getAverageRating()`, `getRatingDistribution()`, `getGenreCounts()`, `getAuthorCounts()`, `getBooksReadPerYear()`

Exclusive shelf logic: When assigning a book to an exclusive shelf, first remove it from any other exclusive shelf.

- [ ] **Step 2: Update all Books route pages to use async DB calls**

Apply the same `onMount` + `$state` pattern to all 6 books routes:
- `/books/+page.svelte` — getCurrentlyReading, getRecentlyRead, getWantToRead, getChallenge
- `/books/[id]/+page.svelte` — getBookById, getAllShelvesForBook, getProgressForBook, getReviewForBook
- `/books/library/+page.svelte` — getAllBooks, getAllShelves, getBooksOnShelf
- `/books/shelves/+page.svelte` — getAllShelves with counts
- `/books/challenge/+page.svelte` — getChallenge, getBooksReadInYear
- `/books/stats/+page.svelte` — all stats functions

- [ ] **Step 3: Test books module end-to-end**

Run: `pnpm tauri dev`
Test flow:
1. Search for a book via Open Library → add it
2. Move it to "Currently Reading" shelf
3. Update progress (page 50 of 300)
4. Mark as finished → rate and review
5. Check reading challenge progress
6. Check Stats page

- [ ] **Step 4: Commit**

```bash
git add apps/noaudience/src/lib/books/db.ts apps/noaudience/src/routes/books/
git commit -m "feat(books): wire books module to real SQLite database"
```

---

## Phase 4: Articles + Substack Import

### Task 4.1: Create Substack fetcher

**Files:**
- Create: `apps/noaudience/src/lib/articles/substack.ts`

- [ ] **Step 1: Build Substack RSS fetcher and article scraper**

Fetch RSS from `virkhanna.substack.com/feed`, parse entries, then fetch full article content from each post URL.

```typescript
// apps/noaudience/src/lib/articles/substack.ts

export interface SubstackArticle {
  title: string;
  url: string;
  author: string;
  publication: string;
  datePublished: string;
  contentHtml: string;
  coverImageUrl: string | null;
  readingTimeMinutes: number;
}

export async function fetchSubstackFeed(substackUrl: string): Promise<SubstackArticle[]> {
  // Normalize URL to RSS feed
  const feedUrl = substackUrl.replace(/\/$/, '') + '/feed';

  const response = await fetch(feedUrl);
  const xml = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');

  const items = doc.querySelectorAll('item');
  const articles: SubstackArticle[] = [];

  for (const item of items) {
    const title = item.querySelector('title')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || '';
    const creator = item.querySelector('dc\\:creator, creator')?.textContent || '';
    const contentEncoded = item.querySelector('content\\:encoded, encoded')?.textContent || '';
    const description = item.querySelector('description')?.textContent || '';

    // Extract cover image from content or enclosure
    const enclosure = item.querySelector('enclosure');
    const coverImageUrl = enclosure?.getAttribute('url') || extractFirstImage(contentEncoded) || null;

    // Use content:encoded for full HTML, fall back to description
    const contentHtml = contentEncoded || description;

    // Estimate reading time
    const textContent = contentHtml.replace(/<[^>]*>/g, '');
    const wordCount = textContent.split(/\s+/).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 250));

    // Extract publication name from feed URL
    const publication = substackUrl.replace(/https?:\/\//, '').replace(/\.substack\.com.*/, '');

    articles.push({
      title,
      url: link,
      author: creator || publication,
      publication,
      datePublished: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      contentHtml,
      coverImageUrl,
      readingTimeMinutes,
    });
  }

  return articles;
}

function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  return match ? match[1] : null;
}

export async function fetchFullArticleContent(url: string): Promise<string> {
  // Substack exposes a JSON API for individual posts
  // e.g., https://virkhanna.substack.com/api/v1/posts/the-green-triangle
  // But we can also just fetch the page and extract the article body
  const response = await fetch(url);
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Substack articles have their content in .body.markup
  const body = doc.querySelector('.body.markup, .post-content, article');
  return body?.innerHTML || html;
}

export async function syncSubstackArticles(
  substackUrl: string,
  existingUrls: Set<string>
): Promise<SubstackArticle[]> {
  const all = await fetchSubstackFeed(substackUrl);
  const newArticles = all.filter(a => !existingUrls.has(a.url));

  // For any articles where content:encoded was truncated, fetch full content
  for (const article of newArticles) {
    if (article.contentHtml.length < 500 && article.url) {
      try {
        article.contentHtml = await fetchFullArticleContent(article.url);
      } catch {
        // Keep RSS content as fallback
      }
    }
  }

  return newArticles;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/noaudience/src/lib/articles/substack.ts
git commit -m "feat(articles): add Substack RSS fetcher and article parser"
```

### Task 4.2: Rewrite articles/db.ts with Drizzle queries

**Files:**
- Rewrite: `apps/noaudience/src/lib/articles/db.ts` (already named db.ts — rewrite in-place, removing `$state` runes)

- [ ] **Step 1: Rewrite articles/db.ts with real Drizzle queries**

Replace the Svelte runes-based mock with async Drizzle queries. All functions become async.

Key functions:
- `getAllArticles()`, `getArticleById(id)`, `getOwnPosts()`, `getSavedArticles()`, `searchArticles(query)`, `addArticle(article)`, `deleteArticle(id)`
- `getHighlightsByArticle(articleId)`, `getAllHighlights()`, `addHighlight(highlight)`, `updateHighlightNote(id, note)`, `deleteHighlight(id)`
- `getAllFeeds()`, `addFeed(feed)`, `deleteFeed(id)`, `updateFeedSyncTime(id)`

- [ ] **Step 2: Update articles route pages for async + add Substack sync**

Modify `/articles/+page.svelte` to:
1. On mount, check if user has a Substack URL configured in settings
2. If so, fetch the feed and insert any new articles as `isOwnPost: true`
3. Show sync status indicator

Add a "Sync Now" button that triggers `syncSubstackArticles()`.

Modify `/articles/[id]/+page.svelte` to load article and highlights from DB.

- [ ] **Step 3: Seed the user's Substack articles on first run**

When the app detects no articles exist and the Substack URL is set to `virkhanna.substack.com`, automatically sync all 3 articles:
1. "The Green Triangle" (March 17, 2026)
2. "Challenging Notions of Free Will" (November 17, 2025)
3. "What if my favourite painting was AI generated?" (September 26, 2025)

- [ ] **Step 4: Test articles module**

Run: `pnpm tauri dev`
Test flow:
1. Navigate to Articles
2. Verify Substack articles appear (auto-synced)
3. Open an article → verify content renders
4. Highlight text → verify highlight saves
5. Add a note to highlight
6. Check Annotations view

- [ ] **Step 5: Commit**

```bash
git add apps/noaudience/src/lib/articles/ apps/noaudience/src/routes/articles/
git commit -m "feat(articles): wire articles to SQLite with Substack RSS sync"
```

---

## Phase 5: Writing + Rich Text Editor

### Task 5.1: Install TipTap and build editor component

**Files:**
- Create: `apps/noaudience/src/lib/writing/Editor.svelte`
- Modify: `apps/noaudience/package.json` (add tiptap dependencies)

- [ ] **Step 1: Install TipTap dependencies**

```bash
cd /Users/adaa/Code/NoAudienceApps/apps/noaudience
pnpm add @tiptap/core @tiptap/pm @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-highlight @tiptap/extension-task-list @tiptap/extension-task-item @tiptap/extension-link @tiptap/extension-image @tiptap/extension-code-block-lowlight @tiptap/extension-typography lowlight
```

- [ ] **Step 2: Create the TipTap Editor Svelte component**

Build `Editor.svelte` — a Svelte 5 wrapper around TipTap with:
- Markdown-like shortcuts (# for headings, ** for bold, etc.)
- Floating toolbar on text selection (bold, italic, link, highlight)
- Slash command menu (/, then type to insert heading/list/quote/code/divider/image)
- Substack-style centered layout (660px max-width, serif body text)
- Auto-save via `onUpdate` callback (debounced 500ms)
- Word count + reading time in status bar
- Support for: headings, bold, italic, strikethrough, links, images, lists, task lists, blockquotes, code blocks, horizontal rules, highlights

The component should accept:
```typescript
interface Props {
  content: string;  // HTML content
  onUpdate: (html: string, text: string) => void;
  editable?: boolean;
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/noaudience/src/lib/writing/Editor.svelte apps/noaudience/package.json pnpm-lock.yaml
git commit -m "feat(writing): add TipTap rich text editor component"
```

### Task 5.2: Wire writing module to DB

**Files:**
- Rewrite: `apps/noaudience/src/lib/writing/db.ts` (rename from db.svelte.ts)
- Modify: `apps/noaudience/src/routes/writing/[id]/+page.svelte`

- [ ] **Step 1: Rewrite writing/db.ts with Drizzle queries**

Key functions (all async):
- `getAllWritings()`, `getWritingById(id)`, `createWriting()`, `updateWriting(id, updates)`, `deleteWriting(id)`
- `getAllTags()`, `getWritingsByTag(tag)`
- `getWritingsByFolder(folder)`, `getAllFolders()`
- `searchWritings(query)` — search title and content text, needed for global search (Phase 7)

Auto-calculate `wordCount` and `readingTime` on each update from the text content.

**Important**: The mock data used string IDs (`Date.now().toString(36)`), but the DB schema uses integer autoincrement. All route pages using `params.id` for writings must change from string to `Number(params.id)`. Update `/writing/[id]/+page.svelte` accordingly.

- [ ] **Step 2: Integrate TipTap editor into writing/[id] page**

Replace the plain text `<textarea>` with the new `<Editor>` component. Wire auto-save to `updateWriting()` with 500ms debounce.

```svelte
<Editor
  content={writing.contentHtml || ''}
  onUpdate={(html, text) => {
    debouncedSave(writing.id, {
      contentHtml: html,
      contentMarkdown: text,
      wordCount: text.split(/\s+/).filter(Boolean).length,
    });
  }}
/>
```

- [ ] **Step 3: Test writing module**

Run: `pnpm tauri dev`
Test flow:
1. Navigate to Writing
2. Create a new piece
3. Type markdown → verify it renders (headings, bold, lists)
4. Select text → verify floating toolbar appears
5. Type `/` → verify slash menu appears
6. Navigate away and back → verify content persisted
7. Check word count updates

- [ ] **Step 4: Commit**

```bash
git add apps/noaudience/src/lib/writing/ apps/noaudience/src/routes/writing/
git commit -m "feat(writing): wire writing to SQLite with TipTap rich editor"
```

---

## Phase 6: Chess + Interactive Board

### Task 6.1: Install chessground and build board component

**Files:**
- Create: `apps/noaudience/src/lib/chess/Board.svelte`
- Modify: `apps/noaudience/package.json`

- [ ] **Step 1: Install chess dependencies**

```bash
cd /Users/adaa/Code/NoAudienceApps/apps/noaudience
pnpm add chessground chess.js
```

`chessground` is Lichess's board renderer (handles piece display, drag/drop, animations).
`chess.js` handles legal move generation and game state.

- [ ] **Step 2: Create Board.svelte component**

Build an interactive chess board that:
- Renders a board with pieces from a FEN position
- Accepts a list of moves and allows click-through navigation
- Has controls: first, prev, next, last, auto-play, flip board
- Shows the move list alongside the board with the current move highlighted
- Supports click-to-navigate on the move list
- Annotations/comments shown below the board for each position

```typescript
interface Props {
  moves: string[];           // SAN moves ['e4', 'e5', 'Nf3', ...]
  annotations?: Record<number, string>;  // move index → comment
  white: string;
  black: string;
  result: string;
  onFlip?: () => void;
}
```

- [ ] **Step 3: Import chessground CSS**

Chessground needs its CSS for the board and pieces. Import in the Board.svelte component's `<script>` tag (Vite resolves node_modules imports in JS better than in CSS `@import`):

```typescript
// In Board.svelte <script>
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';  // or custom dark theme
import 'chessground/assets/chessground.cburnett.css'; // piece set
```

- [ ] **Step 4: Commit**

```bash
git add apps/noaudience/src/lib/chess/Board.svelte apps/noaudience/package.json pnpm-lock.yaml
git commit -m "feat(chess): add interactive chessground board component"
```

### Task 6.2: Wire chess module to DB

**Files:**
- Rewrite: `apps/noaudience/src/lib/chess/db.ts`
- Modify: `apps/noaudience/src/routes/chess/[id]/+page.svelte`

- [ ] **Step 1: Rewrite chess/db.ts with Drizzle queries**

Key functions (all async):
- `getGames()`, `getGameById(id)`, `searchGames(query)`, `filterGames(opts)`, `importPgn(pgnText)`, `deleteGame(id)`

Keep the existing `pgn.ts` parser — it works. `importPgn` should parse the PGN, extract headers, and insert into the DB.

- [ ] **Step 2: Integrate Board.svelte into chess/[id] page**

Replace the current non-interactive view with the new Board component. Parse the PGN moves and pass them to the Board.

- [ ] **Step 3: Test chess module**

Run: `pnpm tauri dev`
Test flow:
1. Navigate to Chess
2. Import a PGN (paste or file)
3. Open a game → verify interactive board works
4. Click through moves
5. Flip board
6. Use auto-play

- [ ] **Step 4: Commit**

```bash
git add apps/noaudience/src/lib/chess/ apps/noaudience/src/routes/chess/
git commit -m "feat(chess): wire chess to SQLite with interactive chessground board"
```

---

## Phase 7: Global Search & Settings

### Task 7.1: Build global Cmd+K search

**Files:**
- Create: `apps/noaudience/src/lib/search.ts`
- Modify: `packages/core/src/components/SearchBar.svelte` or create new `GlobalSearch.svelte`
- Modify: `apps/noaudience/src/routes/+layout.svelte`

- [ ] **Step 1: Create cross-module search function**

```typescript
// apps/noaudience/src/lib/search.ts
import { searchFilms } from '$lib/films/db';
import { searchBooks } from '$lib/books/db';
import { searchArticles } from '$lib/articles/db';
import { searchWritings } from '$lib/writing/db';
import { searchGames } from '$lib/chess/db';

export interface SearchResult {
  type: 'film' | 'book' | 'article' | 'writing' | 'chess';
  id: number | string;
  title: string;
  subtitle: string;
  image?: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const [filmResults, bookResults, articleResults, writingResults, chessResults] = await Promise.all([
    searchFilms(query).catch(() => []),
    searchBooks(query).catch(() => []),
    searchArticles(query).catch(() => []),
    searchWritings(query).catch(() => []),
    searchGames(query).catch(() => []),
  ]);

  const results: SearchResult[] = [
    ...filmResults.map(f => ({
      type: 'film' as const, id: f.id, title: f.title,
      subtitle: `${f.year} · ${f.director || 'Unknown'}`,
      image: f.posterPath,
    })),
    ...bookResults.map(b => ({
      type: 'book' as const, id: b.id, title: b.title,
      subtitle: b.author || 'Unknown author',
      image: b.coverPath,
    })),
    ...articleResults.map(a => ({
      type: 'article' as const, id: a.id, title: a.title,
      subtitle: `${a.author} · ${a.publication || ''}`,
      image: a.coverImagePath,
    })),
    ...writingResults.map(w => ({
      type: 'writing' as const, id: w.id, title: w.title,
      subtitle: `${w.folder || 'Unfiled'} · ${w.wordCount || 0} words`,
    })),
    ...chessResults.map(g => ({
      type: 'chess' as const, id: g.id,
      title: `${g.white} vs ${g.black}`,
      subtitle: `${g.openingName || 'Unknown opening'} · ${g.result}`,
    })),
  ];

  return results;
}
```

- [ ] **Step 2: Build Cmd+K search overlay component**

Create a modal overlay that:
- Opens on Cmd+K (or Ctrl+K)
- Shows a search input with type-ahead
- Groups results by type (Films, Books, Articles, Chess)
- Each result shows icon + title + subtitle + optional thumbnail
- Enter or click navigates to the item's detail page
- Esc closes the overlay

Wire it into `+layout.svelte` so it's available app-wide.

- [ ] **Step 3: Commit**

```bash
git add apps/noaudience/src/lib/search.ts apps/noaudience/src/routes/+layout.svelte
git commit -m "feat: add Cmd+K global search across all modules"
```

### Task 7.2: Wire settings to database

**Files:**
- Modify: `apps/noaudience/src/routes/settings/+page.svelte`
- Modify: `packages/core/src/stores/settings.ts`

- [ ] **Step 1: Persist settings in SQLite settings table**

The `settings` table is a key-value store. Wire it so:
- `tmdb_api_key` is stored and loaded from DB
- `substack_feed_url` is stored and loaded from DB (default: `virkhanna.substack.com`)
- Module toggles are stored as `enabled_modules` JSON array

Create helper functions:
```typescript
export async function getSetting(key: string): Promise<string | null>
export async function setSetting(key: string, value: string): Promise<void>
```

- [ ] **Step 2: Settings page loads from and saves to DB**

On mount, load settings from DB. On change, persist immediately.

- [ ] **Step 3: Commit**

```bash
git add apps/noaudience/src/routes/settings/ packages/core/src/stores/
git commit -m "feat: wire app settings to SQLite persistence"
```

---

## Phase 8: Polish & Security

### Task 8.1: Move TMDB token to settings

**Files:**
- Modify: `apps/noaudience/src/lib/films/tmdb.ts`

- [ ] **Step 1: Remove hardcoded TMDB access token**

Replace the hardcoded token in `tmdb.ts` with a call to `getSetting('tmdb_api_key')`. If no key is set, show a prompt in the Films UI directing to Settings.

```typescript
async function getTmdbToken(): Promise<string | null> {
  const { getSetting } = await import('$lib/settings-helpers');
  return getSetting('tmdb_api_key');
}
```

- [ ] **Step 2: Pre-populate the user's TMDB key in settings**

Since the user already has a key, store it in settings on first run (migration or seed) so they don't lose functionality. The key just won't be in source code anymore.

- [ ] **Step 3: Commit**

```bash
git add apps/noaudience/src/lib/films/tmdb.ts
git commit -m "fix(security): move TMDB access token from source to settings DB"
```

### Task 8.2: Gitignore data files and add Substack default

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Update .gitignore**

Add entries to ensure local data never enters git:

```
# Local data
data/
substack-cache/
*.db-journal
*.db-wal
*.db-shm
```

- [ ] **Step 2: Set default Substack URL**

In the settings initialization (Phase 7), default `substack_feed_url` to `https://virkhanna.substack.com` so the user's articles auto-sync on first launch.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: gitignore local data files and DB journals"
```

### Task 8.3: Polish interactions and workflows

**Files:** Various route pages

- [ ] **Step 1: Add loading states to all data-fetching pages**

Every page that loads data should show a skeleton/spinner while loading, not a blank screen.

- [ ] **Step 2: Add empty states**

When a module has no data yet, show a helpful empty state with a call to action:
- Films: "No films logged yet. Search for a movie to get started."
- Books: "Your library is empty. Search for a book to add it."
- Articles: "No articles yet. Your Substack will sync automatically, or save an article by URL."
- Writing: "No writings yet. Click + to start writing."
- Chess: "No games imported. Paste a PGN to add your first game."

- [ ] **Step 3: Add confirmation dialogs for destructive actions**

Delete operations should show a confirm modal before proceeding.

- [ ] **Step 4: Ensure navigation works smoothly**

- Clicking a poster/cover navigates to detail page
- Back button works correctly
- Sidebar highlights the active section
- Module sub-navigation (Diary, Watchlist, etc.) highlights correctly

- [ ] **Step 5: Final test of all workflows**

Complete test of every module:
1. Films: Search → Add → Log → Diary → Watchlist → Lists → Stats
2. Books: Search → Add → Shelve → Read progress → Review → Challenge → Stats
3. Articles: Auto-sync Substack → Read → Highlight → Annotate
4. Writing: Create → Edit with TipTap → Tags → Folders
5. Chess: Import PGN → View with board → Navigate moves
6. Global: Cmd+K search → Settings → Module toggles

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "polish: loading states, empty states, confirmations, smooth navigation"
```

---

## Execution Dependencies

```
Phase 1 (DB Wiring) ← everything depends on this
├── Phase 2 (Films DB) ← independent
├── Phase 3 (Books DB) ← independent
├── Phase 4 (Articles + Substack) ← independent
├── Phase 5 (Writing + Editor) ← independent
├── Phase 6 (Chess + Board) ← independent
├── Phase 7 (Search + Settings) ← depends on 2-6 being done
└── Phase 8 (Polish) ← depends on everything
```

Phases 2-6 can be parallelized after Phase 1 is complete.
