# Architecture

## Overview

NoAudience is a Tauri v2 desktop app with a SvelteKit frontend and a Rust backend. All data lives in a single SQLite file on the user's machine. The app requires no server, no internet connection (after initial media lookups), and no account.

## Why Tauri over Electron

Tauri uses the operating system's native webview instead of bundling Chromium. On macOS, that means WebKit (Safari's engine). The result: a 5-10MB installer instead of 120MB, 30-50MB RAM usage instead of 200-500MB, and sub-second startup.

The tradeoff is less control over the rendering engine, but for a single-user local app this does not matter.

## Monorepo structure

```
noaudience/
├── packages/
│   ├── core/              # Design system, DB schema, sidebar, settings, global search
│   ├── films/             # Films module (Letterboxd clone)
│   ├── books/             # Books module (Goodreads clone)
│   ├── articles/          # Articles module (Substack reader + annotations)
│   ├── writing/           # Markdown editor module
│   └── chess/             # PGN viewer + analysis module
├── apps/
│   ├── noaudience/        # Full app — imports all modules from packages/
│   ├── noaudience-films/  # Standalone — imports core + films only
│   └── noaudience-books/  # Standalone — imports core + books only
└── src-tauri/             # Rust backend — shared across all build targets
```

Each package under `packages/` is self-contained. The `apps/` directory defines build targets that compose packages together. Adding a new module means creating a new package and importing it into the full app.

## Frontend

SvelteKit runs in SPA mode (no SSR) with `@sveltejs/adapter-static`. All routing is client-side. Tauri APIs are called via `invoke()` for operations that need the Rust backend (database queries, HTTP requests, file system access).

Styling uses Tailwind CSS with a custom dark theme matching the design system in SPEC.md.

## Backend (Rust)

The Rust backend handles:

- **Database**: SQLite via `tauri-plugin-sql`, with Drizzle ORM on the frontend side using the `sqlite-proxy` driver
- **TMDB API calls**: Movie/TV metadata fetched through `reqwest` to keep the API key out of the JS bundle
- **Open Library API calls**: Book metadata (no key required, but routed through Rust for consistency)
- **RSS parsing**: Substack feed syncing via the `feed-rs` crate
- **Web scraping**: Article content extraction via `reqwest` + `scraper` crate, with `html2md` for markdown conversion
- **File system**: Image caching (posters, covers, article images) stored in the app's local data directory

## Database

Single SQLite file. One database for the full app. Standalone builds use the same schema but only populate their relevant tables.

Migrations are bundled into the app at build time using Vite's `import.meta.glob` (since Drizzle's migrator depends on Node's `fs` module, which does not exist in a webview).

## Data flow

```
User action (UI)
  → SvelteKit component
    → Drizzle query (generates SQL)
      → tauri invoke() / plugin IPC
        → Rust executes against SQLite
          → Result returned to frontend
            → Svelte reactivity updates the UI
```

For external API calls:
```
User searches for a movie
  → Frontend calls invoke("search_tmdb", { query })
    → Rust fetches from api.themoviedb.org
      → Returns JSON to frontend
        → User selects a result
          → Poster image downloaded and cached locally
            → Film record saved to SQLite
```

## Image storage

All images (movie posters, book covers, article thumbnails, inline article images) are downloaded once and cached in the app's local data directory:

```
~/Library/Application Support/com.noaudience.app/
├── noaudience.db          # SQLite database
└── images/
    ├── films/             # TMDB posters and backdrops
    ├── books/             # Open Library covers
    └── articles/          # Article images
```

Images are served to the webview via Tauri's asset protocol (`convertFileSrc()`), which converts local file paths to `asset://` URLs.

## Module independence

Each module only depends on `core`. Modules do not depend on each other. Cross-module features (like linking a writing piece to a film) are handled through a generic `links` table in core that stores `(source_type, source_id, target_type, target_id)` pairs.

This means removing a module from a build target requires no code changes in other modules — just exclude it from the app's import list.
