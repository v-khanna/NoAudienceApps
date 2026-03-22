# NoAudience — File Map

Every source file in the project with a one-line description.

---

## Root

```
NoAudienceApps/
├── package.json                    # Root workspace config — defines pnpm workspaces
├── pnpm-workspace.yaml             # Declares workspace packages: apps/* and packages/*
├── pnpm-lock.yaml                  # Lockfile for all dependencies across workspaces
├── README.md                       # Project readme
└── .gitignore                      # Ignores node_modules, build artifacts, .db files, data/
```

---

## Tauri Backend (`src-tauri/`)

The Rust backend that wraps the frontend in a native desktop window and provides SQLite access.

```
src-tauri/
├── Cargo.toml                      # Rust dependencies: tauri 2, tauri-plugin-sql (sqlite), serde
├── build.rs                        # Tauri build script — generates Rust bindings
├── tauri.conf.json                 # App config: window size (1200x800), dev URL, bundle settings, icon paths
├── src/
│   ├── main.rs                     # Entry point — calls lib::run()
│   └── lib.rs                      # App setup: loads SQLite plugin with migrations, no custom Rust commands
├── capabilities/
│   └── default.json                # Security permissions: core, sql (load/execute/select/close), opener
├── icons/
│   ├── 32x32.png                   # App icon 32px (generated placeholder — green circle on dark bg)
│   ├── 128x128.png                 # App icon 128px
│   ├── 128x128@2x.png             # App icon 256px (retina)
│   └── icon.png                    # App icon base
└── gen/schemas/                    # Auto-generated Tauri schemas (do not edit)
    ├── acl-manifests.json
    ├── capabilities.json
    ├── desktop-schema.json
    └── macOS-schema.json
```

---

## Shared Core Package (`packages/core/`)

Reusable components, database schema, and stores shared across all modules.

```
packages/core/
├── package.json                    # Package config — exports: ./db, ./db/schema, ./components/*, ./stores/*
└── src/
    ├── index.ts                    # Public entry point (re-exports)
    ├── db/
    │   ├── schema.ts               # Drizzle ORM schema — ALL tables for all 5 modules (films, books, articles, writings, chess, settings)
    │   ├── client.ts               # Database client — creates Drizzle instance from a sqlite-proxy execute callback
    │   └── migrations/
    │       └── 0000_init.sql       # Initial migration — creates all tables, seeds default book shelves
    ├── components/
    │   ├── Sidebar.svelte          # Main nav sidebar (240px wide, expandable module sections)
    │   ├── SidebarItem.svelte      # Single sidebar nav link with active state highlighting
    │   ├── Modal.svelte            # Reusable modal overlay with backdrop blur, close button, escape key
    │   ├── Button.svelte           # Button component (primary/secondary/pill variants)
    │   ├── PosterCard.svelte       # Film/book poster card with hover animation and status ring color
    │   ├── PosterGrid.svelte       # Grid layout wrapper for poster cards
    │   ├── StarRating.svelte       # Interactive half-star rating widget (0.5-5.0 scale)
    │   ├── SearchBar.svelte        # Search input with magnifying glass icon (used in some pages)
    │   ├── TagInput.svelte         # Tag creation/selection input with pill display
    │   └── ProgressBar.svelte      # Linear progress bar component
    └── stores/
        ├── modules.ts              # Svelte store: which modules are enabled, module definitions with sub-pages
        └── settings.ts             # Svelte writable store for app settings (legacy — being replaced by DB-backed settings)
```

---

## Main App (`apps/noaudience/`)

The SvelteKit frontend application.

```
apps/noaudience/
├── package.json                    # App dependencies: Svelte 5, SvelteKit, Tauri APIs, TipTap, chessground, drizzle-orm
├── vite.config.ts                  # Vite config: Tailwind plugin, SvelteKit plugin, port 5173, CORS proxies for Substack and OpenLibrary
├── tsconfig.json                   # TypeScript config
├── svelte.config.js                # SvelteKit config: adapter-static (SPA mode)
└── src/
    ├── app.html                    # HTML shell — Tauri loads this
    ├── app.css                     # Global CSS — Tailwind imports, CSS custom properties for design tokens
    ├── app.d.ts                    # TypeScript ambient declarations
    └── ...
```

### App Library (`src/lib/`)

Business logic, data layers, and module-specific components.

```
src/lib/
├── db.ts                           # DATABASE BRIDGE — connects Drizzle ORM to tauri-plugin-sql via sqlite-proxy
├── settings.ts                     # Settings CRUD — getSetting/setSetting backed by SQLite, seeds defaults on first run
├── search.ts                       # Global search — queries all 5 module search functions via dynamic import
├── GlobalSearch.svelte             # Cmd+K search overlay — modal with grouped results, keyboard navigation
│
├── films/
│   ├── db.ts                       # Films data layer — all Drizzle queries (getFilms, addFilmFromTmdb, logFilm, watchlist, lists, stats)
│   ├── tmdb.ts                     # TMDB API client — searchTmdb(), getFilmDetails(), posterUrl(), backdropUrl()
│   ├── LogModal.svelte             # "Log Film" modal — TMDB search, film selection, rating, review, tags, save
│   └── mock.ts                     # LEGACY: old mock data and type definitions (types still re-exported from here)
│
├── books/
│   ├── db.ts                       # Books data layer — all Drizzle queries (shelves, progress, reviews, challenge, stats)
│   ├── openlibrary.ts              # Open Library API client — searchOpenLibrary(), coverUrl()
│   ├── AddBookModal.svelte         # "Add Book" modal — Open Library search, click to add to "Want to Read" shelf
│   └── mock.ts                     # LEGACY: old mock data and type definitions (types still re-exported)
│
├── articles/
│   ├── db.ts                       # Articles data layer — all Drizzle queries (articles, highlights, feeds)
│   ├── substack.ts                 # Substack RSS fetcher — fetchSubstackFeed(), syncSubstackArticles(), uses Vite proxy in dev
│   ├── HighlightToolbar.svelte     # Floating toolbar for text highlighting (yellow/blue/green/pink) and notes
│   └── mock.ts                     # LEGACY: stripped to just HIGHLIGHT_COLORS constant
│
├── writing/
│   ├── db.ts                       # Writing data layer — all Drizzle queries (CRUD, tags, folders, search)
│   ├── Editor.svelte               # TipTap rich text editor — Substack-style layout, floating toolbar, status bar
│   ├── db.svelte.ts                # LEGACY: old rune-based mock data layer (no longer imported)
│   └── mock.ts                     # LEGACY: old mock data and type definitions
│
└── chess/
    ├── db.ts                       # Chess data layer — all Drizzle queries (games, import, filter, search)
    ├── pgn.ts                      # PGN parser — parsePgn(), parseMultiPgn(), extracts headers and moves
    ├── Board.svelte                # Interactive chess board — chessground + chess.js, move navigation, flip, auto-play
    └── mock.ts                     # LEGACY: old mock data
```

### Routes (`src/routes/`)

SvelteKit pages — each `+page.svelte` is a page, `+layout.svelte` wraps all pages.

```
src/routes/
├── +layout.svelte                  # ROOT LAYOUT — initializes DB, seeds settings, renders Sidebar + GlobalSearch + main content
├── +layout.ts                      # SPA config: prerender false, ssr false
├── +page.svelte                    # HOME PAGE — redirects to /films (or shows overview)
│
├── films/
│   ├── +page.svelte                # Films home — recently watched posters, diary preview, watchlist preview, stats summary, Log button
│   ├── [id]/+page.svelte           # Film detail — backdrop, poster, info, action buttons, synopsis, cast, your activity
│   ├── diary/+page.svelte          # Diary — reverse chronological log grouped by month, year filter tabs
│   ├── watchlist/+page.svelte      # Watchlist — poster grid with sort options (date added, title, year)
│   ├── lists/+page.svelte          # Custom lists — create ranked/unranked lists, add films, manage
│   └── stats/+page.svelte          # Stats — total films, hours, avg rating, genre counts, top directors, rating distribution
│
├── books/
│   ├── +page.svelte                # Books home — currently reading with progress, recently read, want to read, challenge bar, Add Book button
│   ├── [id]/+page.svelte           # Book detail — cover, info, shelf selector, progress updates, review, similar books
│   ├── library/+page.svelte        # Library — cover grid or table view, shelf sidebar filter, sortable columns
│   ├── shelves/+page.svelte        # Shelves — expandable shelf list with book counts, add custom shelf
│   ├── challenge/+page.svelte      # Reading challenge — yearly goal, progress bar, on-track calculation
│   └── stats/+page.svelte          # Stats — books per year, pages read, rating distribution, genre counts, top authors
│
├── articles/
│   ├── +page.svelte                # Articles home — all articles list, search, Substack sync button with status, save article by URL
│   ├── [id]/+page.svelte           # Article reader — Substack-style centered layout, highlight toolbar, margin notes
│   ├── yours/+page.svelte          # Your Posts — articles synced from your Substack (isOwnPost = true)
│   ├── saved/+page.svelte          # Saved — articles saved by URL from other publications
│   ├── feeds/+page.svelte          # Feeds — manage RSS feed subscriptions, add/remove feeds
│   └── annotations/+page.svelte    # Annotations — all highlights and notes across articles, filter by color, search
│
├── writing/
│   ├── +page.svelte                # Writings browser — grid of all writings with title, excerpt, date, word count, tags
│   ├── [id]/+page.svelte           # Editor page — TipTap rich editor, auto-save with 500ms debounce, delete button
│   ├── tags/+page.svelte           # Tags — all tags with counts, click to filter writings
│   └── folders/+page.svelte        # Folders — folder list derived from writings, click to filter
│
├── chess/
│   ├── +page.svelte                # Games library — list of imported games, search/filter by result/color, PGN import
│   ├── [id]/+page.svelte           # Game viewer — interactive chessground board, move list, annotations, controls
│   └── analysis/+page.svelte       # Analysis board — interactive board where you can make moves, undo, reset, load FEN
│
└── settings/
    └── +page.svelte                # Settings — module toggles, TMDB token input, Substack URL input, export/import buttons
```

---

## Documentation (`docs/`)

```
docs/
├── SPEC.md                         # Full product specification — all 5 modules, data models, UI layouts, design system
├── ARCHITECTURE.md                  # Technical architecture — monorepo structure, data flow, image storage, module independence
├── DESIGN.md                        # Design system — colors, typography, spacing, poster grids, modals, sidebar
├── MODULES.md                       # Module-by-module guide
├── VISION.md                        # Product vision — "Does every hobby need an audience?"
├── CONTRIBUTING.md                  # Contribution guidelines
├── TECH-STACK.md                    # Detailed technology stack reference with versions and rationale
├── SESSION-REPORT-2026-03-23.md     # Comprehensive report of the production-ready implementation attempt
├── FILE-MAP.md                      # This file
└── superpowers/plans/
    ├── 2026-03-22-scaffolding-and-core.md    # Original scaffolding plan (completed)
    └── 2026-03-23-production-ready.md        # Production-ready implementation plan (partially completed)
```

---

## Legacy Files (can be deleted)

These files are no longer imported but still exist in the repo:

| File | Why it exists | Safe to delete? |
|------|--------------|----------------|
| `src/lib/films/mock.ts` | Types are re-exported from here by `films/db.ts` | No — types still referenced |
| `src/lib/books/mock.ts` | Types are re-exported from here by `books/db.ts` | No — types still referenced |
| `src/lib/articles/mock.ts` | Only exports `HIGHLIGHT_COLORS` constant | No — constant still used |
| `src/lib/writing/mock.ts` | Old mock data | Yes |
| `src/lib/writing/db.svelte.ts` | Old rune-based mock DB layer, replaced by `db.ts` | Yes |
| `src/lib/chess/mock.ts` | Old mock data | Yes |
| `packages/core/src/stores/settings.ts` | Old Svelte writable store, being replaced by `src/lib/settings.ts` (DB-backed) | Not yet — settings page may still import it |
