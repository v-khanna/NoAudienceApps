# Scaffolding + Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up the Tauri v2 + SvelteKit monorepo with SQLite database, Tailwind dark theme, sidebar navigation, and shared core components — producing a running desktop app with the design system applied and database ready for modules.

**Architecture:** Tauri v2 desktop shell with SvelteKit frontend in SPA mode. SQLite database via tauri-plugin-sql with Drizzle ORM (sqlite-proxy driver). Monorepo using npm workspaces. Tailwind CSS with custom dark theme tokens from DESIGN.md.

**Tech Stack:** Tauri v2, SvelteKit 2, Svelte 5, adapter-static, Tailwind CSS 4, Drizzle ORM, tauri-plugin-sql, Lucide icons, Inter font

---

## File Structure

```
noaudience/
├── package.json                          # Root workspace config
├── pnpm-workspace.yaml                   # Workspace definitions
├── tailwind.config.js                    # Shared Tailwind theme
├── packages/
│   └── core/
│       ├── package.json
│       ├── src/
│       │   ├── index.ts                  # Public exports
│       │   ├── db/
│       │   │   ├── schema.ts             # Drizzle schema (all tables)
│       │   │   ├── client.ts             # Database client setup
│       │   │   └── migrations/
│       │   │       └── 0000_init.sql      # Initial migration SQL
│       │   ├── components/
│       │   │   ├── Sidebar.svelte        # Main sidebar navigation
│       │   │   ├── SidebarItem.svelte    # Single nav item
│       │   │   ├── Modal.svelte          # Reusable modal overlay
│       │   │   ├── PosterCard.svelte     # Poster/cover card component
│       │   │   ├── PosterGrid.svelte     # Grid layout for poster cards
│       │   │   ├── StarRating.svelte     # Half-star rating input
│       │   │   ├── SearchBar.svelte      # Global search input (Cmd+K)
│       │   │   ├── Button.svelte         # Button component (primary/secondary/pill)
│       │   │   ├── TagInput.svelte       # Tag creation/selection input
│       │   │   └── ProgressBar.svelte    # Progress bar component
│       │   ├── stores/
│       │   │   ├── settings.ts           # App settings store
│       │   │   └── modules.ts            # Enabled modules store
│       │   └── utils/
│       │       ├── format.ts             # Date/number formatters
│       │       └── search.ts             # Fuzzy search utility
│       └── static/
│           └── fonts/
│               └── inter-variable.woff2  # Inter font file
├── apps/
│   └── noaudience/
│       ├── package.json
│       ├── svelte.config.js
│       ├── vite.config.ts
│       ├── src/
│       │   ├── app.html                  # HTML shell
│       │   ├── app.css                   # Global CSS (Tailwind + fonts)
│       │   ├── routes/
│       │   │   ├── +layout.svelte        # Root layout with sidebar
│       │   │   ├── +layout.ts            # SSR disable
│       │   │   ├── +page.svelte          # Home page
│       │   │   └── settings/
│       │   │       └── +page.svelte      # Settings page
│       │   └── lib/
│       │       └── tauri.ts              # Tauri invoke helpers
│       └── static/                       # Static assets
└── src-tauri/
    ├── Cargo.toml
    ├── tauri.conf.json
    ├── capabilities/
    │   └── default.json                  # Permission grants
    ├── icons/                            # App icons
    └── src/
        ├── main.rs                       # Tauri entry point
        └── lib.rs                        # Tauri commands + plugin setup
```

---

### Task 1: Initialize Tauri v2 + SvelteKit Project

**Files:**
- Create: `package.json` (root)
- Create: `pnpm-workspace.yaml`
- Create: `apps/noaudience/package.json`
- Create: `apps/noaudience/svelte.config.js`
- Create: `apps/noaudience/vite.config.ts`
- Create: `apps/noaudience/src/app.html`
- Create: `apps/noaudience/src/routes/+layout.ts`
- Create: `src-tauri/` (via `npx @tauri-apps/cli init`)

- [ ] **Step 1: Create root package.json with workspace config**

```json
{
  "name": "noaudience",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter noaudience dev",
    "build": "pnpm --filter noaudience build",
    "tauri": "pnpm --filter noaudience tauri"
  }
}
```

- [ ] **Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 3: Scaffold the SvelteKit app**

Run:
```bash
cd apps
pnpm create svelte@latest noaudience
# Select: Skeleton project, TypeScript, no additional options
cd noaudience
```

- [ ] **Step 4: Install adapter-static and configure SPA mode**

Run:
```bash
cd apps/noaudience
pnpm add -D @sveltejs/adapter-static
```

Update `apps/noaudience/svelte.config.js`:
```javascript
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: 'index.html'
    })
  }
};
```

Create `apps/noaudience/src/routes/+layout.ts`:
```typescript
export const ssr = false;
export const prerender = false;
```

- [ ] **Step 5: Initialize Tauri v2 in the project root**

Run from project root:
```bash
pnpm add -D @tauri-apps/cli@latest
pnpm tauri init
# App name: NoAudience
# Window title: NoAudience
# Frontend dev URL: http://localhost:5173
# Frontend dist: ../apps/noaudience/build
# Dev command: pnpm --filter noaudience dev
# Build command: pnpm --filter noaudience build
```

- [ ] **Step 6: Install Tauri API packages in the app**

Run:
```bash
cd apps/noaudience
pnpm add @tauri-apps/api@latest @tauri-apps/plugin-sql @tauri-apps/plugin-fs @tauri-apps/plugin-http
```

- [ ] **Step 7: Verify the app launches**

Run from project root:
```bash
pnpm tauri dev
```
Expected: A native window opens showing the SvelteKit skeleton page.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Scaffold Tauri v2 + SvelteKit monorepo"
```

---

### Task 2: Configure Tailwind CSS with NoAudience Theme

**Files:**
- Create: `tailwind.config.js` (root)
- Create: `apps/noaudience/src/app.css`
- Modify: `apps/noaudience/src/app.html`

- [ ] **Step 1: Install Tailwind CSS**

Run:
```bash
cd apps/noaudience
pnpm add -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Create root tailwind.config.js with the NoAudience theme**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './apps/*/src/**/*.{html,js,svelte,ts}',
    './packages/*/src/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    extend: {
      colors: {
        page: '#14181C',
        surface: '#1B2028',
        elevated: '#2C3440',
        sidebar: '#0F1318',
        modal: '#1E2229',
        accent: {
          green: '#00E054',
          orange: '#FF8000',
          blue: '#40BCF4'
        },
        text: {
          primary: '#FFFFFF',
          body: '#E0E0E0',
          secondary: '#99AABB',
          muted: '#535353'
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.06)',
          hover: 'rgba(255, 255, 255, 0.12)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Charter', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      fontSize: {
        'page-title': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'section-header': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        'card-title': ['14px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'metadata': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
        'small-label': ['11px', { lineHeight: '1.3', fontWeight: '500' }]
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '15': '60px'
      },
      borderRadius: {
        'card': '6px',
        'modal': '16px',
        'pill': '999px',
        'chip': '4px'
      },
      boxShadow: {
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.6)',
        'modal': '0 24px 48px rgba(0, 0, 0, 0.5)'
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      letterSpacing: {
        'dark': '0.01em'
      }
    }
  },
  plugins: []
};
```

- [ ] **Step 3: Create global CSS with font import and base styles**

Create `apps/noaudience/src/app.css`:
```css
@import 'tailwindcss';

@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}

body {
  @apply bg-page text-text-body font-sans tracking-dark antialiased;
  overflow: hidden;
}

/* Scrollbar styling for dark theme */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
```

- [ ] **Step 4: Update app.html to load CSS**

Update `apps/noaudience/src/app.html`:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>NoAudience</title>
    <link rel="icon" href="%sveltekit.assets%/favicon.png" />
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

- [ ] **Step 5: Configure Vite to use Tailwind**

Update `apps/noaudience/vite.config.ts`:
```typescript
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit()
  ]
});
```

- [ ] **Step 6: Download Inter variable font**

Run:
```bash
mkdir -p apps/noaudience/static/fonts
curl -fsSL "https://github.com/rsms/inter/raw/master/docs/font-files/InterVariable.woff2" -o apps/noaudience/static/fonts/inter-variable.woff2
```

- [ ] **Step 7: Verify Tailwind renders with dark theme**

Create a test page at `apps/noaudience/src/routes/+page.svelte`:
```svelte
<div class="flex items-center justify-center h-screen">
  <div class="text-center">
    <h1 class="text-page-title text-text-primary mb-4">NoAudience</h1>
    <p class="text-body text-text-secondary italic">Does every hobby need an audience?</p>
    <div class="flex gap-3 mt-8 justify-center">
      <span class="w-4 h-4 rounded-full bg-accent-green"></span>
      <span class="w-4 h-4 rounded-full bg-accent-orange"></span>
      <span class="w-4 h-4 rounded-full bg-accent-blue"></span>
    </div>
  </div>
</div>
```

Run: `pnpm tauri dev`
Expected: Dark background (#14181C), white title, three colored dots, Inter font.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Add Tailwind CSS with NoAudience dark theme"
```

---

### Task 3: Set Up SQLite Database with Drizzle ORM

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/src/db/schema.ts`
- Create: `packages/core/src/db/client.ts`
- Create: `packages/core/src/db/migrations/0000_init.sql`
- Create: `packages/core/src/index.ts`
- Modify: `src-tauri/Cargo.toml` (add sql plugin)
- Modify: `src-tauri/src/lib.rs` (register plugin)
- Modify: `src-tauri/capabilities/default.json` (add permissions)

- [ ] **Step 1: Create the core package**

Create `packages/core/package.json`:
```json
{
  "name": "@noaudience/core",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./db": "./src/db/client.ts",
    "./db/schema": "./src/db/schema.ts",
    "./components/*": "./src/components/*"
  }
}
```

- [ ] **Step 2: Install Drizzle ORM in core**

Run:
```bash
cd packages/core
pnpm add drizzle-orm
pnpm add -D drizzle-kit
```

- [ ] **Step 3: Write the Drizzle schema with all tables**

Create `packages/core/src/db/schema.ts`:
```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ── Settings ──────────────────────────────────────
export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull()
});

// ── Films ─────────────────────────────────────────
export const films = sqliteTable('films', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tmdbId: integer('tmdb_id').unique(),
  title: text('title').notNull(),
  year: integer('year'),
  director: text('director'),
  runtime: integer('runtime'),
  tagline: text('tagline'),
  synopsis: text('synopsis'),
  posterPath: text('poster_path'),
  backdropPath: text('backdrop_path'),
  genres: text('genres'), // JSON array
  cast: text('cast'),     // JSON array
  crew: text('crew'),     // JSON array
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const filmLogs = sqliteTable('film_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filmId: integer('film_id').notNull().references(() => films.id),
  watchedDate: text('watched_date').notNull(),
  rating: real('rating'), // 0.5 to 5.0
  liked: integer('liked', { mode: 'boolean' }).default(false),
  rewatch: integer('rewatch', { mode: 'boolean' }).default(false),
  review: text('review'),
  tags: text('tags'), // JSON array
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const filmWatchlist = sqliteTable('film_watchlist', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filmId: integer('film_id').notNull().references(() => films.id),
  addedAt: text('added_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const filmLists = sqliteTable('film_lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  ranked: integer('ranked', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const filmListItems = sqliteTable('film_list_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  listId: integer('list_id').notNull().references(() => filmLists.id),
  filmId: integer('film_id').notNull().references(() => films.id),
  position: integer('position').notNull(),
  note: text('note')
});

// ── Books ─────────────────────────────────────────
export const books = sqliteTable('books', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  openlibraryId: text('openlibrary_id'),
  title: text('title').notNull(),
  author: text('author'),
  pageCount: integer('page_count'),
  publisher: text('publisher'),
  publishDate: text('publish_date'),
  isbn: text('isbn'),
  language: text('language'),
  description: text('description'),
  genres: text('genres'), // JSON array
  coverPath: text('cover_path'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const bookShelves = sqliteTable('book_shelves', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  exclusive: integer('exclusive', { mode: 'boolean' }).default(false),
  position: integer('position').notNull().default(0)
});

export const bookShelfAssignments = sqliteTable('book_shelf_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookId: integer('book_id').notNull().references(() => books.id),
  shelfId: integer('shelf_id').notNull().references(() => bookShelves.id),
  assignedAt: text('assigned_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const bookProgress = sqliteTable('book_progress', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookId: integer('book_id').notNull().references(() => books.id),
  progressType: text('progress_type').notNull(), // 'page' or 'percent'
  progressValue: integer('progress_value').notNull(),
  note: text('note'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const bookReviews = sqliteTable('book_reviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookId: integer('book_id').notNull().references(() => books.id),
  rating: integer('rating'), // 1-5
  review: text('review'),
  dateRead: text('date_read'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const readingChallenges = sqliteTable('reading_challenges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  year: integer('year').notNull(),
  goal: integer('goal').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

// ── Articles ──────────────────────────────────────
export const feeds = sqliteTable('feeds', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url').notNull(),
  name: text('name'),
  lastSyncedAt: text('last_synced_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  feedId: integer('feed_id').references(() => feeds.id),
  sourceUrl: text('source_url'),
  title: text('title').notNull(),
  author: text('author'),
  publication: text('publication'),
  datePublished: text('date_published'),
  coverImagePath: text('cover_image_path'),
  contentHtml: text('content_html'),
  readingTimeMinutes: integer('reading_time_minutes'),
  isOwnPost: integer('is_own_post', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const highlights = sqliteTable('highlights', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  articleId: integer('article_id').notNull().references(() => articles.id),
  color: text('color').notNull().default('yellow'),
  note: text('note'),
  textExact: text('text_exact').notNull(),
  textPrefix: text('text_prefix'),
  textSuffix: text('text_suffix'),
  positionStart: integer('position_start'),
  positionEnd: integer('position_end'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

// ── Writing ───────────────────────────────────────
export const writings = sqliteTable('writings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull().default('Untitled'),
  contentMarkdown: text('content_markdown'),
  contentHtml: text('content_html'),
  wordCount: integer('word_count').default(0),
  tags: text('tags'), // JSON array
  folder: text('folder'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString())
});

export const writingLinks = sqliteTable('writing_links', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  writingId: integer('writing_id').notNull().references(() => writings.id),
  linkedType: text('linked_type').notNull(), // 'film' | 'book' | 'article' | 'writing'
  linkedId: integer('linked_id').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});

// ── Chess ─────────────────────────────────────────
export const chessGames = sqliteTable('chess_games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pgnText: text('pgn_text').notNull(),
  white: text('white'),
  black: text('black'),
  result: text('result'),
  date: text('date'),
  openingEco: text('opening_eco'),
  openingName: text('opening_name'),
  yourColor: text('your_color'),
  annotations: text('annotations'), // JSON
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString())
});
```

- [ ] **Step 4: Generate the initial migration SQL**

Create `packages/core/src/db/migrations/0000_init.sql`:
```sql
-- Films
CREATE TABLE IF NOT EXISTS films (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tmdb_id INTEGER UNIQUE,
  title TEXT NOT NULL,
  year INTEGER,
  director TEXT,
  runtime INTEGER,
  tagline TEXT,
  synopsis TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  genres TEXT,
  cast TEXT,
  crew TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS film_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  film_id INTEGER NOT NULL REFERENCES films(id),
  watched_date TEXT NOT NULL,
  rating REAL,
  liked INTEGER DEFAULT 0,
  rewatch INTEGER DEFAULT 0,
  review TEXT,
  tags TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS film_watchlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  film_id INTEGER NOT NULL REFERENCES films(id),
  added_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS film_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  ranked INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS film_list_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  list_id INTEGER NOT NULL REFERENCES film_lists(id),
  film_id INTEGER NOT NULL REFERENCES films(id),
  position INTEGER NOT NULL,
  note TEXT
);

-- Books
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  openlibrary_id TEXT,
  title TEXT NOT NULL,
  author TEXT,
  page_count INTEGER,
  publisher TEXT,
  publish_date TEXT,
  isbn TEXT,
  language TEXT,
  description TEXT,
  genres TEXT,
  cover_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS book_shelves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  exclusive INTEGER DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS book_shelf_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL REFERENCES books(id),
  shelf_id INTEGER NOT NULL REFERENCES book_shelves(id),
  assigned_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS book_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL REFERENCES books(id),
  progress_type TEXT NOT NULL,
  progress_value INTEGER NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS book_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL REFERENCES books(id),
  rating INTEGER,
  review TEXT,
  date_read TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reading_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  year INTEGER NOT NULL,
  goal INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Articles
CREATE TABLE IF NOT EXISTS feeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  name TEXT,
  last_synced_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feed_id INTEGER REFERENCES feeds(id),
  source_url TEXT,
  title TEXT NOT NULL,
  author TEXT,
  publication TEXT,
  date_published TEXT,
  cover_image_path TEXT,
  content_html TEXT,
  reading_time_minutes INTEGER,
  is_own_post INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS highlights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL REFERENCES articles(id),
  color TEXT NOT NULL DEFAULT 'yellow',
  note TEXT,
  text_exact TEXT NOT NULL,
  text_prefix TEXT,
  text_suffix TEXT,
  position_start INTEGER,
  position_end INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Writing
CREATE TABLE IF NOT EXISTS writings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL DEFAULT 'Untitled',
  content_markdown TEXT,
  content_html TEXT,
  word_count INTEGER DEFAULT 0,
  tags TEXT,
  folder TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS writing_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  writing_id INTEGER NOT NULL REFERENCES writings(id),
  linked_type TEXT NOT NULL,
  linked_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Chess
CREATE TABLE IF NOT EXISTS chess_games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pgn_text TEXT NOT NULL,
  white TEXT,
  black TEXT,
  result TEXT,
  date TEXT,
  opening_eco TEXT,
  opening_name TEXT,
  your_color TEXT,
  annotations TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Default shelves
INSERT OR IGNORE INTO book_shelves (id, name, exclusive, position) VALUES (1, 'Want to Read', 1, 0);
INSERT OR IGNORE INTO book_shelves (id, name, exclusive, position) VALUES (2, 'Currently Reading', 1, 1);
INSERT OR IGNORE INTO book_shelves (id, name, exclusive, position) VALUES (3, 'Read', 1, 2);
```

- [ ] **Step 5: Create the database client**

Create `packages/core/src/db/client.ts`:
```typescript
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import * as schema from './schema';

let db: ReturnType<typeof createDb> | null = null;

function createDb(execute: (sql: string, params: unknown[]) => Promise<unknown[]>) {
  return drizzle(
    async (sql, params, method) => {
      const result = await execute(sql, params as unknown[]);
      if (method === 'get') {
        return { rows: result.length ? [result[0]] : [] };
      }
      return { rows: result || [] };
    },
    { schema }
  );
}

export function initDb(execute: (sql: string, params: unknown[]) => Promise<unknown[]>) {
  db = createDb(execute);
  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

export type Database = ReturnType<typeof createDb>;
```

- [ ] **Step 6: Create core package index**

Create `packages/core/src/index.ts`:
```typescript
export { initDb, getDb } from './db/client';
export type { Database } from './db/client';
export * as schema from './db/schema';
```

- [ ] **Step 7: Add tauri-plugin-sql to the Rust backend**

Add to `src-tauri/Cargo.toml` under `[dependencies]`:
```toml
tauri-plugin-sql = { version = "2", features = ["sqlite"] }
```

Update `src-tauri/src/lib.rs`:
```rust
use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create initial tables",
            sql: include_str!("../../packages/core/src/db/migrations/0000_init.sql"),
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:noaudience.db", migrations)
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 8: Add SQL permissions to capabilities**

Update `src-tauri/capabilities/default.json`:
```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default permissions",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "sql:default",
    "sql:allow-load",
    "sql:allow-execute",
    "sql:allow-select",
    "sql:allow-close"
  ]
}
```

- [ ] **Step 9: Verify database initializes on app launch**

Run: `pnpm tauri dev`
Expected: App launches without errors. SQLite file `noaudience.db` created in the Tauri data directory.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Add SQLite database with Drizzle schema and migrations"
```

---

### Task 4: Build Sidebar Navigation

**Files:**
- Create: `packages/core/src/components/Sidebar.svelte`
- Create: `packages/core/src/components/SidebarItem.svelte`
- Create: `packages/core/src/stores/modules.ts`
- Modify: `apps/noaudience/src/routes/+layout.svelte`

- [ ] **Step 1: Create the modules store**

Create `packages/core/src/stores/modules.ts`:
```typescript
import { writable, derived } from 'svelte/store';

export type ModuleId = 'films' | 'books' | 'articles' | 'writing' | 'chess';

export interface Module {
  id: ModuleId;
  label: string;
  icon: string;
  subPages: { label: string; path: string }[];
}

const allModules: Module[] = [
  {
    id: 'films',
    label: 'Films',
    icon: 'film',
    subPages: [
      { label: 'Diary', path: '/films/diary' },
      { label: 'Watchlist', path: '/films/watchlist' },
      { label: 'Lists', path: '/films/lists' },
      { label: 'Stats', path: '/films/stats' }
    ]
  },
  {
    id: 'books',
    label: 'Books',
    icon: 'book-open',
    subPages: [
      { label: 'Library', path: '/books/library' },
      { label: 'Shelves', path: '/books/shelves' },
      { label: 'Challenge', path: '/books/challenge' },
      { label: 'Stats', path: '/books/stats' }
    ]
  },
  {
    id: 'articles',
    label: 'Articles',
    icon: 'newspaper',
    subPages: [
      { label: 'Your Posts', path: '/articles/yours' },
      { label: 'Saved', path: '/articles/saved' },
      { label: 'Feeds', path: '/articles/feeds' },
      { label: 'Annotations', path: '/articles/annotations' }
    ]
  },
  {
    id: 'writing',
    label: 'Writing',
    icon: 'pen-line',
    subPages: [
      { label: 'All Writings', path: '/writing' },
      { label: 'Tags', path: '/writing/tags' },
      { label: 'Folders', path: '/writing/folders' }
    ]
  },
  {
    id: 'chess',
    label: 'Chess',
    icon: 'crown',
    subPages: [
      { label: 'Games', path: '/chess' },
      { label: 'Analysis', path: '/chess/analysis' }
    ]
  }
];

export const enabledModuleIds = writable<Set<ModuleId>>(
  new Set(['films', 'books', 'articles', 'writing', 'chess'])
);

export const enabledModules = derived(enabledModuleIds, ($ids) =>
  allModules.filter((m) => $ids.has(m.id))
);

export { allModules };
```

- [ ] **Step 2: Create SidebarItem component**

Create `packages/core/src/components/SidebarItem.svelte`:
```svelte
<script lang="ts">
  import { page } from '$app/stores';

  interface Props {
    href: string;
    label: string;
    icon?: string;
    indent?: boolean;
  }

  let { href, label, icon, indent = false }: Props = $props();

  let active = $derived($page.url.pathname === href || $page.url.pathname.startsWith(href + '/'));
</script>

<a
  {href}
  class="flex items-center gap-3 px-4 h-10 text-sm transition-colors duration-150 relative
    {indent ? 'pl-11' : ''}
    {active
      ? 'text-text-primary bg-white/[0.07]'
      : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'}"
>
  {#if active && !indent}
    <span class="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-accent-blue"></span>
  {/if}
  <span class="text-body">{label}</span>
</a>
```

- [ ] **Step 3: Create Sidebar component**

Create `packages/core/src/components/Sidebar.svelte`:
```svelte
<script lang="ts">
  import { enabledModules } from '../stores/modules';
  import SidebarItem from './SidebarItem.svelte';

  let expandedModule = $state<string | null>(null);

  function toggleModule(id: string) {
    expandedModule = expandedModule === id ? null : id;
  }
</script>

<aside class="w-60 h-screen bg-sidebar border-r border-border flex flex-col shrink-0">
  <!-- Logo -->
  <div class="px-4 h-16 flex items-center">
    <span class="text-section-header text-text-primary font-semibold tracking-tight">
      NoAudience
    </span>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 overflow-y-auto py-2">
    <SidebarItem href="/" label="Home" />

    {#each $enabledModules as mod}
      <button
        class="flex items-center gap-3 px-4 h-10 w-full text-sm text-text-secondary
          hover:text-text-primary hover:bg-white/[0.04] transition-colors duration-150"
        onclick={() => toggleModule(mod.id)}
      >
        <span class="flex-1 text-left">{mod.label}</span>
        <svg
          class="w-3.5 h-3.5 transition-transform duration-150 {expandedModule === mod.id ? 'rotate-90' : ''}"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {#if expandedModule === mod.id}
        <div class="pb-1">
          <SidebarItem href="/{mod.id}" label="Overview" indent />
          {#each mod.subPages as sub}
            <SidebarItem href={sub.path} label={sub.label} indent />
          {/each}
        </div>
      {/if}
    {/each}
  </nav>

  <!-- Settings -->
  <div class="border-t border-border py-2">
    <SidebarItem href="/settings" label="Settings" />
  </div>
</aside>
```

- [ ] **Step 4: Create root layout with sidebar**

Update `apps/noaudience/src/routes/+layout.svelte`:
```svelte
<script>
  import '../app.css';
  import Sidebar from '@noaudience/core/components/Sidebar.svelte';

  let { children } = $props();
</script>

<div class="flex h-screen overflow-hidden bg-page">
  <Sidebar />
  <main class="flex-1 overflow-y-auto p-8">
    {@render children()}
  </main>
</div>
```

- [ ] **Step 5: Create placeholder route pages for each module**

Create `apps/noaudience/src/routes/films/+page.svelte`:
```svelte
<h1 class="text-page-title text-text-primary">Films</h1>
<p class="text-body text-text-secondary mt-2">Your private Letterboxd.</p>
```

Create `apps/noaudience/src/routes/books/+page.svelte`:
```svelte
<h1 class="text-page-title text-text-primary">Books</h1>
<p class="text-body text-text-secondary mt-2">Your private Goodreads.</p>
```

Create `apps/noaudience/src/routes/articles/+page.svelte`:
```svelte
<h1 class="text-page-title text-text-primary">Articles</h1>
<p class="text-body text-text-secondary mt-2">Your Substack reader.</p>
```

Create `apps/noaudience/src/routes/writing/+page.svelte`:
```svelte
<h1 class="text-page-title text-text-primary">Writing</h1>
<p class="text-body text-text-secondary mt-2">Your markdown editor.</p>
```

Create `apps/noaudience/src/routes/chess/+page.svelte`:
```svelte
<h1 class="text-page-title text-text-primary">Chess</h1>
<p class="text-body text-text-secondary mt-2">Your game library.</p>
```

Create `apps/noaudience/src/routes/settings/+page.svelte`:
```svelte
<h1 class="text-page-title text-text-primary">Settings</h1>
<p class="text-body text-text-secondary mt-2">Configure NoAudience.</p>
```

- [ ] **Step 6: Verify sidebar navigation works**

Run: `pnpm tauri dev`
Expected: Sidebar on the left with NoAudience title, expandable module sections, clicking navigates to placeholder pages. Active state shows blue left bar.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add sidebar navigation with module system"
```

---

### Task 5: Build Core UI Components

**Files:**
- Create: `packages/core/src/components/Button.svelte`
- Create: `packages/core/src/components/Modal.svelte`
- Create: `packages/core/src/components/PosterCard.svelte`
- Create: `packages/core/src/components/PosterGrid.svelte`
- Create: `packages/core/src/components/StarRating.svelte`
- Create: `packages/core/src/components/SearchBar.svelte`
- Create: `packages/core/src/components/TagInput.svelte`
- Create: `packages/core/src/components/ProgressBar.svelte`

- [ ] **Step 1: Create Button component**

Create `packages/core/src/components/Button.svelte`:
```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    pill?: boolean;
    onclick?: () => void;
    disabled?: boolean;
    children: Snippet;
  }

  let { variant = 'primary', size = 'md', pill = false, onclick, disabled = false, children }: Props = $props();

  const base = 'inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-accent-green text-page hover:bg-accent-green/90',
    secondary: 'bg-transparent border border-border-hover text-text-primary hover:bg-white/[0.04]',
    ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/[0.04]'
  };

  const sizes = {
    sm: 'px-3 h-8 text-sm',
    md: 'px-4 h-10 text-sm',
    lg: 'px-6 h-12 text-base'
  };

  let classes = $derived(`${base} ${variants[variant]} ${sizes[size]} ${pill ? 'rounded-pill' : 'rounded-card'}`);
</script>

<button class={classes} {onclick} {disabled}>
  {@render children()}
</button>
```

- [ ] **Step 2: Create Modal component**

Create `packages/core/src/components/Modal.svelte`:
```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    open: boolean;
    onclose: () => void;
    title?: string;
    children: Snippet;
  }

  let { open, onclose, title, children }: Props = $props();

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) onclose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
  >
    <div class="bg-modal border border-border rounded-modal shadow-modal w-full max-w-lg max-h-[85vh] overflow-y-auto">
      {#if title}
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 class="text-section-header text-text-primary">{title}</h2>
          <button
            class="text-text-muted hover:text-text-primary transition-colors"
            onclick={onclose}
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      {/if}
      <div class="p-6">
        {@render children()}
      </div>
    </div>
  </div>
{/if}
```

- [ ] **Step 3: Create StarRating component**

Create `packages/core/src/components/StarRating.svelte`:
```svelte
<script lang="ts">
  interface Props {
    value: number;
    max?: number;
    halfStars?: boolean;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    onchange?: (value: number) => void;
  }

  let { value = 0, max = 5, halfStars = true, readonly = false, size = 'md', onchange }: Props = $props();

  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

  function handleClick(starIndex: number, e: MouseEvent) {
    if (readonly) return;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftHalf = clickX < rect.width / 2;

    let newValue: number;
    if (halfStars && isLeftHalf) {
      newValue = starIndex + 0.5;
    } else {
      newValue = starIndex + 1;
    }

    if (newValue === value) newValue = 0; // toggle off
    onchange?.(newValue);
  }
</script>

<div class="flex gap-0.5" role="group" aria-label="Rating">
  {#each Array(max) as _, i}
    {@const filled = value >= i + 1}
    {@const halfFilled = !filled && halfStars && value >= i + 0.5}
    <button
      class="{sizes[size]} transition-colors {readonly ? 'cursor-default' : 'cursor-pointer'}"
      onclick={(e) => handleClick(i, e)}
      disabled={readonly}
      aria-label="{i + 1} star{i > 0 ? 's' : ''}"
    >
      <svg viewBox="0 0 24 24" fill="none" class="w-full h-full">
        {#if filled}
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="#00E054" />
        {:else if halfFilled}
          <defs>
            <linearGradient id="half-{i}">
              <stop offset="50%" stop-color="#00E054" />
              <stop offset="50%" stop-color="transparent" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill="url(#half-{i})" stroke="#00E054" stroke-width="1" />
        {:else}
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            stroke="#535353" stroke-width="1" />
        {/if}
      </svg>
    </button>
  {/each}
</div>
```

- [ ] **Step 4: Create PosterCard and PosterGrid components**

Create `packages/core/src/components/PosterCard.svelte`:
```svelte
<script lang="ts">
  interface Props {
    src: string;
    alt: string;
    title?: string;
    subtitle?: string;
    rating?: number;
    href?: string;
    status?: 'watched' | 'watchlist' | 'none';
  }

  let { src, alt, title, subtitle, rating, href = '#', status = 'none' }: Props = $props();

  const borderColors = {
    watched: 'hover:ring-accent-green',
    watchlist: 'hover:ring-accent-orange',
    none: 'hover:ring-accent-blue'
  };
</script>

<a {href} class="group block">
  <div class="aspect-[2/3] rounded-card overflow-hidden ring-2 ring-transparent
    {borderColors[status]} transition-all duration-300 ease-smooth
    group-hover:-translate-y-1 group-hover:scale-[1.02] group-hover:shadow-card-hover">
    <img {src} {alt} class="w-full h-full object-cover" loading="lazy" />
  </div>
  {#if title}
    <p class="text-card-title text-text-primary mt-2 truncate">{title}</p>
  {/if}
  {#if subtitle}
    <p class="text-metadata text-text-secondary truncate">{subtitle}</p>
  {/if}
</a>
```

Create `packages/core/src/components/PosterGrid.svelte`:
```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<div class="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4">
  {@render children()}
</div>
```

- [ ] **Step 5: Create SearchBar component**

Create `packages/core/src/components/SearchBar.svelte`:
```svelte
<script lang="ts">
  interface Props {
    value?: string;
    placeholder?: string;
    oninput?: (value: string) => void;
  }

  let { value = $bindable(''), placeholder = 'Search...', oninput }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    oninput?.(value);
  }
</script>

<div class="relative">
  <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
  <input
    type="text"
    {value}
    {placeholder}
    oninput={handleInput}
    class="w-full h-10 pl-10 pr-4 bg-surface border border-border rounded-card
      text-body text-text-body placeholder:text-text-muted
      focus:outline-none focus:border-accent-blue transition-colors"
  />
</div>
```

- [ ] **Step 6: Create TagInput and ProgressBar components**

Create `packages/core/src/components/TagInput.svelte`:
```svelte
<script lang="ts">
  interface Props {
    tags: string[];
    placeholder?: string;
    onchange?: (tags: string[]) => void;
  }

  let { tags = $bindable([]), placeholder = 'Add tag...', onchange }: Props = $props();
  let input = $state('');

  function addTag() {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      tags = [...tags, trimmed];
      onchange?.(tags);
    }
    input = '';
  }

  function removeTag(tag: string) {
    tags = tags.filter((t) => t !== tag);
    onchange?.(tags);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && !input && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  }
</script>

<div class="flex flex-wrap gap-2 p-2 bg-surface border border-border rounded-card min-h-[40px]">
  {#each tags as tag}
    <span class="flex items-center gap-1 px-2 py-1 bg-elevated rounded-chip text-metadata text-text-body">
      {tag}
      <button class="text-text-muted hover:text-text-primary" onclick={() => removeTag(tag)}>
        <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </span>
  {/each}
  <input
    type="text"
    bind:value={input}
    {placeholder}
    onkeydown={handleKeydown}
    class="flex-1 min-w-[100px] bg-transparent text-body text-text-body
      placeholder:text-text-muted focus:outline-none"
  />
</div>
```

Create `packages/core/src/components/ProgressBar.svelte`:
```svelte
<script lang="ts">
  interface Props {
    value: number;
    max?: number;
    color?: 'green' | 'blue' | 'gradient';
    height?: 'sm' | 'md';
  }

  let { value, max = 100, color = 'green', height = 'sm' }: Props = $props();

  let percent = $derived(Math.min(100, Math.max(0, (value / max) * 100)));

  const colors = {
    green: 'bg-accent-green',
    blue: 'bg-accent-blue',
    gradient: 'bg-gradient-to-r from-accent-green to-accent-blue'
  };

  const heights = { sm: 'h-1.5', md: 'h-2.5' };
</script>

<div class="w-full bg-white/[0.08] rounded-full {heights[height]}">
  <div
    class="{colors[color]} {heights[height]} rounded-full transition-all duration-400 ease-smooth"
    style="width: {percent}%"
  ></div>
</div>
```

- [ ] **Step 7: Verify all components render**

Create a temporary test page at `apps/noaudience/src/routes/+page.svelte` that imports and renders each component to verify they work visually.

Run: `pnpm tauri dev`
Expected: All components render with correct dark theme styling.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Add core UI components: Button, Modal, StarRating, PosterCard, PosterGrid, SearchBar, TagInput, ProgressBar"
```

---

### Task 6: Home Page and Settings Page

**Files:**
- Modify: `apps/noaudience/src/routes/+page.svelte`
- Modify: `apps/noaudience/src/routes/settings/+page.svelte`
- Create: `packages/core/src/stores/settings.ts`

- [ ] **Step 1: Create settings store**

Create `packages/core/src/stores/settings.ts`:
```typescript
import { writable } from 'svelte/store';

export interface AppSettings {
  tmdbApiKey: string;
  substackFeedUrl: string;
  accentColor: string;
}

export const appSettings = writable<AppSettings>({
  tmdbApiKey: '',
  substackFeedUrl: '',
  accentColor: '#00E054'
});
```

- [ ] **Step 2: Build the Home page**

Update `apps/noaudience/src/routes/+page.svelte`:
```svelte
<script>
  import { enabledModules } from '@noaudience/core/stores/modules';
</script>

<div class="max-w-4xl">
  <h1 class="text-page-title text-text-primary">NoAudience</h1>
  <p class="text-body text-text-secondary mt-1 italic">Does every hobby need an audience?</p>

  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
    {#each $enabledModules as mod}
      <a
        href="/{mod.id}"
        class="p-6 bg-surface border border-border rounded-card
          hover:border-border-hover hover:bg-elevated
          transition-all duration-200 group"
      >
        <h2 class="text-section-header text-text-primary group-hover:text-accent-blue transition-colors">
          {mod.label}
        </h2>
        <p class="text-metadata text-text-secondary mt-1">
          {mod.subPages.length} sections
        </p>
      </a>
    {/each}
  </div>
</div>
```

- [ ] **Step 3: Build the Settings page**

Update `apps/noaudience/src/routes/settings/+page.svelte`:
```svelte
<script>
  import { enabledModuleIds, allModules } from '@noaudience/core/stores/modules';
  import type { ModuleId } from '@noaudience/core/stores/modules';
  import Button from '@noaudience/core/components/Button.svelte';

  function toggleModule(id: ModuleId) {
    enabledModuleIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  let tmdbKey = $state('');
  let substackUrl = $state('');
</script>

<div class="max-w-2xl">
  <h1 class="text-page-title text-text-primary">Settings</h1>

  <!-- Modules -->
  <section class="mt-8">
    <h2 class="text-section-header text-text-primary mb-4">Modules</h2>
    <div class="space-y-3">
      {#each allModules as mod}
        <label class="flex items-center justify-between p-4 bg-surface border border-border rounded-card cursor-pointer hover:border-border-hover transition-colors">
          <span class="text-body text-text-body">{mod.label}</span>
          <input
            type="checkbox"
            checked={$enabledModuleIds.has(mod.id)}
            onchange={() => toggleModule(mod.id)}
            class="w-5 h-5 accent-accent-green"
          />
        </label>
      {/each}
    </div>
  </section>

  <!-- API Keys -->
  <section class="mt-8">
    <h2 class="text-section-header text-text-primary mb-4">API Keys</h2>
    <div class="space-y-4">
      <div>
        <label class="block text-metadata text-text-secondary mb-1">TMDB API Key</label>
        <input
          type="password"
          bind:value={tmdbKey}
          placeholder="Enter your TMDB API key"
          class="w-full h-10 px-4 bg-surface border border-border rounded-card
            text-body text-text-body placeholder:text-text-muted
            focus:outline-none focus:border-accent-blue transition-colors"
        />
        <p class="text-small-label text-text-muted mt-1">
          Free at themoviedb.org — needed for movie metadata and posters
        </p>
      </div>
      <div>
        <label class="block text-metadata text-text-secondary mb-1">Substack Feed URL</label>
        <input
          type="text"
          bind:value={substackUrl}
          placeholder="yourname.substack.com"
          class="w-full h-10 px-4 bg-surface border border-border rounded-card
            text-body text-text-body placeholder:text-text-muted
            focus:outline-none focus:border-accent-blue transition-colors"
        />
      </div>
    </div>
  </section>

  <!-- Data -->
  <section class="mt-8">
    <h2 class="text-section-header text-text-primary mb-4">Data</h2>
    <div class="flex gap-3">
      <Button variant="secondary">Export All Data</Button>
      <Button variant="secondary">Import Data</Button>
    </div>
  </section>
</div>
```

- [ ] **Step 4: Verify Home and Settings pages**

Run: `pnpm tauri dev`
Expected: Home shows module cards. Settings shows module toggles, API key inputs, data export buttons. Toggling a module hides it from the sidebar.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add Home page and Settings page with module toggles"
```

---

## Plan Summary

| Task | What it produces | Estimated steps |
|------|-----------------|----------------|
| 1. Scaffold project | Running Tauri + SvelteKit app | 8 steps |
| 2. Tailwind theme | NoAudience dark design system | 8 steps |
| 3. SQLite + Drizzle | Database with all tables, migrations | 10 steps |
| 4. Sidebar navigation | Working nav with module system | 7 steps |
| 5. Core UI components | 8 reusable components | 8 steps |
| 6. Home + Settings | Landing page, module toggles, API config | 5 steps |

**After this plan is complete**, the app will:
- Launch as a native desktop window
- Show the NoAudience dark theme
- Have a working sidebar with expandable modules
- Have a SQLite database ready with all tables
- Have reusable components (posters, ratings, modals, buttons, etc.)
- Allow enabling/disabling modules from Settings

**Next plans:** Films module, Books module, Articles module, Writing module, Chess module — each building on this foundation.
