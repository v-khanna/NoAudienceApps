# NoAudience — Technology Stack

## Overview

NoAudience is a local-first, private desktop app for tracking media consumption. No server, no accounts, no internet required after initial media lookups. All data lives in a single SQLite file on the user's machine.

---

## Runtime Environment

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | v25.8.1 | JavaScript runtime for build tooling and dev server |
| Rust | 1.94.0 | Backend language for Tauri shell |
| pnpm | 9.15.9 | Package manager (workspaces for monorepo) |

---

## Desktop Shell — Tauri v2

| Crate / Package | Version | Role |
|-----------------|---------|------|
| `tauri` | 2.x | Desktop app framework — wraps the frontend in a native window using the OS webview (WebKit on macOS) |
| `tauri-build` | 2.x | Build-time code generation |
| `tauri-plugin-sql` | 2.x (Rust) / 2.3.2 (JS) | SQLite database access via IPC — frontend sends SQL, Rust executes it |
| `tauri-plugin-opener` | 2.x | Opens URLs and files in the OS default handler |
| `@tauri-apps/api` | 2.3.0 | Frontend JS bindings for Tauri core APIs |
| `@tauri-apps/cli` | 2.3.1 | CLI for `tauri dev`, `tauri build` |

**Why Tauri over Electron:** ~5MB installer vs Electron's ~120MB. Uses the OS native webview instead of bundling Chromium. 30-50MB RAM vs 200-500MB.

**Capabilities (src-tauri/capabilities/default.json):**
- `core:default` — basic Tauri APIs
- `sql:allow-load`, `sql:allow-execute`, `sql:allow-select`, `sql:allow-close` — database access
- `opener:default` — file/URL opening

---

## Frontend Framework — SvelteKit + Svelte 5

| Package | Version | Role |
|---------|---------|------|
| `svelte` | ^5.19.0 | UI framework — uses Svelte 5's runes (`$state`, `$derived`, `$effect`, `$props`) |
| `@sveltejs/kit` | ^2.16.0 | App framework — routing, layouts, SPA mode |
| `@sveltejs/adapter-static` | ^3.0.8 | Builds to static files (no SSR — Tauri loads from disk) |
| `svelte-check` | ^4.1.4 | Type checking for Svelte files |

**SPA Mode:** SvelteKit runs with `adapter-static` and client-side routing only. No server-side rendering since the app runs in a Tauri webview.

**Svelte 5 Runes used throughout:**
- `$state()` — reactive mutable state
- `$derived()` / `$derived.by()` — computed values
- `$effect()` — side effects that re-run when dependencies change
- `$props()` — component props
- `$bindable()` — two-way bindable props

---

## Styling — Tailwind CSS v4

| Package | Version | Role |
|---------|---------|------|
| `tailwindcss` | ^4.2.2 | Utility-first CSS framework |
| `@tailwindcss/vite` | ^4.2.2 | Vite plugin for Tailwind (v4 uses Vite-native integration, no PostCSS) |

**Design System:**
- Background: `#14181C` (Letterboxd's dark blue-gray)
- Surface: `#1B2028`, Elevated: `#2C3440`
- Accent Green: `#00E054` (watched/read/completed)
- Accent Orange: `#FF8000` (queued/watchlist)
- Accent Blue: `#40BCF4` (links, navigation)
- Font: Inter (variable weight)
- Many components use inline styles due to rapid iteration; not fully converted to Tailwind utility classes

---

## Database — SQLite + Drizzle ORM

| Package | Version | Role |
|---------|---------|------|
| `drizzle-orm` | ^0.45.1 | Type-safe ORM — generates SQL from TypeScript, maps results back to types |
| `drizzle-kit` | ^0.31.10 | Migration generation and management |

**Driver:** `drizzle-orm/sqlite-proxy` — a generic driver that accepts a callback function for executing SQL. We provide a callback that routes queries through Tauri's `tauri-plugin-sql` IPC.

**Data flow:**
```
Svelte component
  → Drizzle query builder (generates SQL string + params)
    → sqlite-proxy callback
      → Tauri IPC (invoke)
        → Rust: tauri-plugin-sql executes against SQLite
          → Result returned as JSON through IPC
            → Drizzle maps rows back to TypeScript types
```

**Schema location:** `packages/core/src/db/schema.ts`
**Migrations:** `packages/core/src/db/migrations/0000_init.sql` (bundled into the Rust binary at compile time)

**Database file:** `~/Library/Application Support/com.noaudience.app/noaudience.db`

**Tables:**
- `settings` — key/value app configuration
- `films`, `film_logs`, `film_watchlist`, `film_lists`, `film_list_items`
- `books`, `book_shelves`, `book_shelf_assignments`, `book_progress`, `book_reviews`, `reading_challenges`
- `feeds`, `articles`, `highlights`
- `writings`, `writing_links`
- `chess_games`

**Known limitation:** `.returning()` on INSERT/UPDATE/DELETE does not work through the sqlite-proxy bridge when the table has JSON columns (defined as `text('col', { mode: 'json' })`). All inserts use a separate SELECT to fetch the row back.

---

## Build Tool — Vite

| Package | Version | Role |
|---------|---------|------|
| `vite` | ^6.0.7 | Dev server with HMR, production bundler |

**Dev mode proxies (vite.config.ts):**
- `/api/substack/*` → `https://virkhanna.substack.com/*` (CORS workaround for RSS fetch)
- `/api/openlibrary/*` → `https://openlibrary.org/*`

These proxies are only needed in dev mode. Tauri's production webview doesn't enforce CORS.

---

## Rich Text Editor — TipTap v3

| Package | Version | Role |
|---------|---------|------|
| `@tiptap/core` | ^3.20.4 | Editor core — ProseMirror wrapper |
| `@tiptap/pm` | ^3.20.4 | ProseMirror bindings |
| `@tiptap/starter-kit` | ^3.20.4 | Bundle: paragraphs, headings, bold, italic, lists, code blocks, blockquotes, etc. |
| `@tiptap/extension-placeholder` | ^3.20.4 | Placeholder text when editor is empty |
| `@tiptap/extension-highlight` | ^3.20.4 | Text highlighting |
| `@tiptap/extension-task-list` | ^3.20.4 | Checkbox task lists |
| `@tiptap/extension-task-item` | ^3.20.4 | Individual task items |
| `@tiptap/extension-link` | ^3.20.4 | Hyperlinks with auto-detection |
| `@tiptap/extension-image` | ^3.20.4 | Image insertion |
| `@tiptap/extension-code-block-lowlight` | ^3.20.4 | Syntax-highlighted code blocks |
| `@tiptap/extension-typography` | ^3.20.4 | Smart quotes, em dashes, etc. |
| `lowlight` | ^3.3.0 | Syntax highlighting engine (used by code-block-lowlight) |

**Why TipTap:** Substack uses TipTap for their editor. It provides the Obsidian-like live preview markdown experience specified in the design doc.

**Integration:** `apps/noaudience/src/lib/writing/Editor.svelte` wraps TipTap in a Svelte 5 component with `onMount`/`onDestroy` lifecycle management.

---

## Chess — Chessground + chess.js

| Package | Version | Role |
|---------|---------|------|
| `chessground` | ^9.2.1 | Board renderer — Lichess's open-source chess board (SVG-based, supports drag/drop, animations) |
| `chess.js` | ^1.4.0 | Chess logic — legal move generation, FEN computation, game state |

**Integration:** `apps/noaudience/src/lib/chess/Board.svelte` combines both:
- chess.js tracks the game state and computes FEN for each position
- chessground renders the board from FEN and handles interaction

**PGN Parser:** `apps/noaudience/src/lib/chess/pgn.ts` — custom parser, handles single and multi-game PGN files.

---

## External APIs

### TMDB (The Movie Database)
- **Endpoint:** `https://api.themoviedb.org/3`
- **Auth:** Bearer token (JWT read-access token)
- **Used for:** Movie search, film details, cast/crew, posters, backdrops
- **Client:** `apps/noaudience/src/lib/films/tmdb.ts`
- **Token storage:** SQLite `settings` table, key `tmdb_api_key`, with hardcoded fallback in source

### Open Library
- **Endpoint:** `https://openlibrary.org`
- **Auth:** None required
- **Used for:** Book search by title/author, cover images, metadata
- **Client:** `apps/noaudience/src/lib/books/openlibrary.ts`
- **Cover images:** `https://covers.openlibrary.org/b/id/{coverId}-{size}.jpg`

### Substack RSS
- **Endpoint:** `https://virkhanna.substack.com/feed` (user-configurable)
- **Auth:** None (public RSS)
- **Used for:** Syncing the user's own Substack articles
- **Client:** `apps/noaudience/src/lib/articles/substack.ts`
- **Dev proxy:** Routed through Vite at `/api/substack/feed` to bypass CORS

---

## TypeScript

| Package | Version | Role |
|---------|---------|------|
| `typescript` | ^5.7.3 | Type checking — used in `.ts` files and `<script lang="ts">` Svelte blocks |

---

## Rust Dependencies (Backend)

| Crate | Version | Role |
|-------|---------|------|
| `tauri` | 2.x | Core Tauri runtime |
| `tauri-plugin-sql` | 2.x | SQLite database plugin (bundles libsqlite3) |
| `tauri-plugin-opener` | 2.x | OS file/URL opener |
| `serde` | 1.x | Serialization framework |
| `serde_json` | 1.x | JSON serialization |

**Not yet used but planned (per spec):**
- `reqwest` — HTTP client (for server-side API calls)
- `feed-rs` — RSS parser
- `scraper` — HTML scraping
- `html2md` — HTML to markdown conversion

Currently all HTTP calls happen on the frontend. Moving them to Rust would improve security (API tokens stay out of JS bundle) and bypass CORS entirely.

---

## Monorepo Structure

```
NoAudienceApps/
├── apps/
│   └── noaudience/          # Main SvelteKit app (SPA)
├── packages/
│   └── core/                # Shared: DB schema, components, stores
├── src-tauri/               # Rust backend
├── docs/                    # Documentation and plans
├── package.json             # Root workspace config
└── pnpm-workspace.yaml      # Workspace definitions
```

**Package manager:** pnpm with workspaces. The core package is referenced as `@noaudience/core` via `workspace:*`.

---

## Dev Commands

```bash
# Start the app in dev mode (Vite + Tauri)
export PATH="$HOME/.cargo/bin:$PATH"
cd /Users/adaa/Code/NoAudienceApps
./apps/noaudience/node_modules/.bin/tauri dev

# Reset the database (delete and restart)
rm ~/Library/Application\ Support/com.noaudience.app/noaudience.db

# Type check
cd apps/noaudience && pnpm svelte-check

# Add a dependency to the app
pnpm add <package> --filter noaudience
```
