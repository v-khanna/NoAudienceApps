# Stitch Design Implementation Spec

**Date:** 2026-03-23
**Scope:** Restyle NoAudience app to match Stitch mockups
**Approach:** Design system foundation first (C), then page-by-page visual match (A)
**Priority pages:** Home Dashboard, Films, Books

---

## 1. Design System Foundation

### 1.1 Color Tokens

Replace current CSS custom properties and Tailwind theme with Stitch's Material Design 3 dark palette.

**Implementation target:** All tokens are defined as CSS custom properties in `app.css` `:root`. Tailwind `tailwind.config.js` theme references these variables (e.g., `surface: 'var(--surface-base)'`). This way both Tailwind classes and raw CSS can consume the same tokens.

**Migration note:** Current tokens (`--bg-base`, `--bg-surface`, `--bg-elevated`, `--text-primary` as `#FFFFFF`) are replaced. `#FFFFFF` is dropped as a text color — the new `--text-primary` (`#E0E3E8`) is slightly warm/muted, matching Stitch's editorial feel. Current `--text-muted` (`#535353`) shifts to `#6B7280` (lighter, more legible).

**Surface hierarchy (the "no-line" rule — depth via tonal shifts, not borders):**

| Token | Hex | Usage |
|-------|-----|-------|
| `--surface-base` | `#101418` | Page background / canvas |
| `--surface-sidebar` | `#0B0F12` | Sidebar background (lowest) |
| `--surface-container-low` | `#181C20` | Secondary sections |
| `--surface-container` | `#1C2024` | Primary content cards |
| `--surface-container-high` | `#262A2F` | Elevated elements, hover states |
| `--surface-container-highest` | `#31353A` | Modals, dropdowns |
| `--surface-bright` | `#363A3E` | Interaction states |

**Text hierarchy:**

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#E0E3E8` | Headings, primary content |
| `--text-secondary` | `#99AABB` | Metadata, supporting text |
| `--text-muted` | `#6B7280` | Tertiary, timestamps |
| `--text-on-accent` | `#00390F` | Text on green accent backgrounds |

**Module accent system:**

Each module gets its own accent color applied via `data-module` attribute on the layout container. All components reference `var(--accent)` and `var(--accent-muted)`.

| Module | Accent | Muted | Rationale |
|--------|--------|-------|-----------|
| Home | `#00E054` | `rgba(0,224,84,0.15)` | App-level primary (green) |
| Films | `#00E054` | `rgba(0,224,84,0.15)` | Letterboxd green, "watched" = done |
| Books | `#FF8000` | `rgba(255,128,0,0.15)` | Warm/literary, bookmark energy |
| Articles | `#40BCF4` | `rgba(64,188,244,0.15)` | Information, reading, links |
| Writing | `#D1C6A8` | `rgba(209,198,168,0.15)` | Ink/journal, from Stitch "Writing" project |
| Chess | `#C0C0C8` | `rgba(192,192,200,0.15)` | Analytical, board-game neutral |

**Semantic accents (always available, not module-dependent):**

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#00E054` | Completed states, confirmations |
| `--color-warning` | `#FF8000` | Watchlist, pending items |
| `--color-info` | `#40BCF4` | Links, metadata highlights |
| `--color-error` | `#FFB4AB` | Errors, destructive actions |

### 1.2 Typography

**Dual-font strategy (from Stitch design system):**

- **Newsreader** (serif): Headlines, page titles, editorial content, diary quotes. "The soul of the system — authoritative and literary."
- **Inter** (sans): UI elements, labels, metadata, body text. "Precise, neutral, out of the way."

**Type scale:**

| Token | Font | Size | Weight | Usage |
|-------|------|------|--------|-------|
| `display-lg` | Newsreader | 3.5rem (56px) | 400 | Hero moments (rare) |
| `display-sm` | Newsreader | 2.25rem (36px) | 400 | Dashboard headings |
| `headline-lg` | Newsreader | 2rem (32px) | 500 | Page titles |
| `headline-sm` | Newsreader | 1.5rem (24px) | 500 | Section headers |
| `title-lg` | Inter | 1.25rem (20px) | 600 | Card titles, sub-sections |
| `title-sm` | Inter | 0.875rem (14px) | 600 | Component headers |
| `body-lg` | Inter | 1rem (16px) | 400 | Primary body text |
| `body-md` | Inter | 0.875rem (14px) | 400 | Default body text |
| `label-lg` | Inter | 0.875rem (14px) | 500 | Button labels |
| `label-md` | Inter | 0.75rem (12px) | 500 | Metadata, timestamps |
| `label-sm` | Inter | 0.6875rem (11px) | 500 | Chips, badges |

**Long-form reading (diary entries, writing):** Charter/Georgia at 18px, line-height 1.65.

### 1.3 Elevation & Glass-morphism

No traditional drop-shadows. Depth through surface tonal layering.

**Glass panels** (for floating elements like nav, header, context menus):
```css
.glass-panel {
  background: rgba(28, 32, 36, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
```

**Ambient shadows** (only for truly floating elements like modals):
```css
.shadow-ambient {
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.5);
}
```

**Ghost borders** (the only allowed border, for image containers):
```css
.ghost-border {
  border: 1px solid rgba(255, 255, 255, 0.06);
}
```

### 1.4 Spacing & Layout

- **8px grid**: All padding/margins are multiples of 8
- **Page gutters**: 48px (current app already uses this)
- **Section gaps**: 32px–48px between major sections
- **Card gaps**: 16px–24px within grids
- **Media aspect ratio**: 2:3 for all posters/book covers, 6px border-radius

### 1.5 Icons

Adopt Material Symbols Outlined (variable font). Configuration: `FILL 0, wght 300, GRAD 0, opsz 24`.

### 1.6 Font Files to Bundle

- `newsreader-variable.woff2` (variable weight, for Tauri — no CDN in production)
- `material-symbols-outlined.woff2`
- `inter-variable.woff2` (already bundled)

---

## 2. Layout Shell

### 2.1 Sidebar (`Sidebar.svelte`)

**Changes from current:**
- Background: `--surface-sidebar` (`#0B0F12`)
- Glass-morphism treatment on hover states
- Add "Add New Entry" action button (green accent)
- Active state: accent-colored left border (using module `var(--accent)`)
- Newsreader for the app title/logo
- User profile section at bottom with avatar

**Keep:** 240px width, collapsible sections, current nav items.

### 2.2 Top Header Bar (new)

Add a slim glass-morphism header bar across the main content area:
- Left: breadcrumb or page context
- Center: global search (Cmd+K trigger)
- Right: notification bell, settings gear, user avatar

This is a new component (`HeaderBar.svelte`) placed in the layout above the `<slot>`.

### 2.3 Module Context

The `+layout.svelte` sets `data-module` attribute based on the current route:
```
/ → data-module="home"
/films/* → data-module="films"
/books/* → data-module="books"
/articles/* → data-module="articles"
/writing/* → data-module="writing"
/chess/* → data-module="chess"
```

This drives the accent color swap via CSS.

**CSS implementation:**
```css
:root, [data-module="home"], [data-module="films"] {
  --accent: #00E054;
  --accent-muted: rgba(0,224,84,0.15);
}
[data-module="books"] {
  --accent: #FF8000;
  --accent-muted: rgba(255,128,0,0.15);
}
[data-module="articles"] {
  --accent: #40BCF4;
  --accent-muted: rgba(64,188,244,0.15);
}
[data-module="writing"] {
  --accent: #D1C6A8;
  --accent-muted: rgba(209,198,168,0.15);
}
[data-module="chess"] {
  --accent: #C0C0C8;
  --accent-muted: rgba(192,192,200,0.15);
}
```

### 2.4 Existing Component Locations

Shared components live in `packages/core/src/components/` (Sidebar, Modal, Button, PosterCard, StarRating, etc.). Page-specific components should live in `apps/noaudience/src/lib/components/<module>/` (e.g., `$lib/components/films/FeaturedReview.svelte`). Reusable cross-module components (StatsPanel, QuoteBlock, FilterTabs) go in `packages/core/src/components/`.

The existing `GlobalSearch.svelte` in `$lib/` will be composed into the new `HeaderBar.svelte`, not replaced.

### 2.5 Font Loading

Font files go in `apps/noaudience/static/fonts/`. `@font-face` declarations in `app.css`:
```css
@font-face {
  font-family: 'Newsreader';
  src: url('/fonts/newsreader-variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}
```
Inter is already bundled. For long-form reading (diary entries), use the existing serif stack (`Georgia, Charter, serif`) at 18px/1.65 — this is distinct from Newsreader which is for headlines only.

### 2.6 Empty & Loading States

Since this is a personal app that starts empty:
- **Empty states** use a centered illustration/icon + Newsreader headline + call-to-action. E.g., Films empty: "Your archive awaits" + "Log your first film" button.
- **Loading states** use skeleton shimmer rectangles matching the component layout (poster shapes for grids, text lines for lists).
- **Error states** use `--color-error` background tint + message + retry action.

### 2.7 Responsive Behavior

Minimum window width: 900px (Tauri can enforce this). At widths below 1100px, the stats grid collapses from 4 to 2 columns. Sidebar remains fixed at 240px — it does not collapse (desktop app, not mobile).

### 2.8 Accessibility

Target: WCAG AA (4.5:1 contrast for normal text, 3:1 for large text). Verified: `--text-primary` on `--surface-base` = ~12:1 (pass), `--text-secondary` on `--surface-base` = ~7.5:1 (pass), `--text-muted` on `--surface-container` = ~4.0:1 (borderline AA — acceptable for timestamps/metadata which is large-label-sized). Focus rings use `var(--accent)` with 2px outline offset.

---

## 3. Home Dashboard (`/`)

### 3.1 Sections

1. **Welcome Header** — Newsreader display-sm, tagline in text-secondary
2. **At a Glance** — 4-column stats grid (glass panels):
   - Total Archive (all media count)
   - Films Catalogued
   - Books Read
   - Top Genre (calculated)
3. **Recent Activity** — Timeline of latest actions across all modules (film logs, book sessions, saved articles). Each entry: icon, description, timestamp. Max 8 items.
4. **Watchlist / Queue** — Horizontal scroll of film poster cards (PosterCard component, 2:3)
5. **Library Highlights** — Currently reading books with progress bars
6. **Writing Drafts** — Latest draft titles with word count

### 3.2 Data Sources (matches actual schema in `packages/core/src/db/schema.ts`)

- **Stats:** `SELECT COUNT(*) FROM films`, `SELECT COUNT(*) FROM books`, top genre from `films.genres` JSON aggregation
- **Recent Activity:** UNION query across `film_logs` (by `created_at`), `book_progress` (by `created_at`), `articles` (by `created_at`) — ORDER BY date DESC LIMIT 8. Note: `book_logs` does not exist; use `book_progress` and `book_reviews`.
- **Watchlist:** `SELECT f.* FROM films f JOIN film_watchlist fw ON f.id = fw.film_id ORDER BY fw.added_at DESC LIMIT 6`
- **Currently Reading:** Books on a "Reading" shelf: `SELECT b.* FROM books b JOIN book_shelf_assignments bsa ON b.id = bsa.book_id JOIN book_shelves bs ON bsa.shelf_id = bs.id WHERE bs.name = 'Reading'`. Requires a "Reading" shelf to exist (seed in DB init or create on first use).
- **Writing Drafts:** `SELECT * FROM writings ORDER BY updated_at DESC LIMIT 3` (no `status` column — all writings are drafts by nature in this app)

---

## 4. Films Home (`/films`)

### 4.1 Sections

1. **Featured Review** (hero) — Latest diary entry with rating, displayed as an editorial quote block. Newsreader headline, large poster backdrop or blurred background.
2. **Stats Bar** — Glass panel: total films catalogued, monthly goal progress (e.g., "12 / 15 FILMS"), year stats.
3. **Latest in Diary** — Vertical list of recent film logs: poster thumbnail, title (Newsreader), year, star rating, date, short review excerpt. 5 items.
4. **Watchlist** — Poster grid (2:3 cards) with filter tabs (All, plus top genres from user's data). Displays pending count.

### 4.2 Component Reuse

- `PosterCard.svelte` — exists in `packages/core/src/components/`, needs style update (ghost-border, hover transition tweak)
- `StarRating.svelte` — exists in `packages/core/src/components/`, maps directly
- New: `$lib/components/films/FeaturedReview.svelte` — hero editorial block
- New: `packages/core/src/components/StatsPanel.svelte` — glass panel with metrics (reusable across films + books)
- New: `packages/core/src/components/FilterTabs.svelte` — reusable tab bar for genre/category filtering

### 4.3 Data Sources (actual schema)

- **Featured Review:** `SELECT fl.*, f.title, f.poster_path, f.year FROM film_logs fl JOIN films f ON fl.film_id = f.id ORDER BY fl.watched_date DESC LIMIT 1`
- **Stats:** `SELECT COUNT(*) FROM films` for total; `SELECT COUNT(*) FROM film_logs WHERE watched_date >= '<first-of-month>'` for monthly count; monthly goal stored in `settings` table (key: `films_monthly_goal`)
- **Diary:** `SELECT fl.*, f.title, f.poster_path, f.year FROM film_logs fl JOIN films f ON fl.film_id = f.id ORDER BY fl.watched_date DESC LIMIT 5`
- **Watchlist:** `SELECT f.* FROM films f JOIN film_watchlist fw ON f.id = fw.film_id` with genre filtering via `f.genres` JSON

---

## 5. Books Home (`/books`)

### 5.1 Sections

1. **Currently Reading** — Horizontal card layout. Each card: book cover, title (Newsreader), author, progress bar with percentage, "Update Progress" and "Add Journal Entry" buttons. Orange accent for progress.
2. **Full Catalog / Library** — Grid of book covers with: star rating overlay, title, category badge. Grid/list view toggle. Filter button.
3. **Recent Diary Entry** — Quote block from latest reading journal. Newsreader italic for the quote, author + date metadata below.
4. **Reading Stats** — Widget: books read this year (progress toward goal), total pages, reading streak.

### 5.2 Component Reuse

- New: `$lib/components/books/BookCard.svelte` — cover + metadata + progress (reusable across home + books)
- `StarRating.svelte` — exists in `packages/core/src/components/`
- New: `$lib/components/books/ReadingProgress.svelte` — progress bar with percentage
- New: `packages/core/src/components/QuoteBlock.svelte` — editorial diary quote (reusable for films diary too)
- `StatsPanel.svelte` — same component from Films, reused with different metrics

### 5.3 Data Sources (actual schema)

- **Currently Reading:** `SELECT b.*, bp.progress_value, bp.progress_type FROM books b JOIN book_shelf_assignments bsa ON b.id = bsa.book_id JOIN book_shelves bs ON bsa.shelf_id = bs.id LEFT JOIN book_progress bp ON b.id = bp.book_id WHERE bs.name = 'Reading' ORDER BY bp.created_at DESC`. Progress percentage = `bp.progress_value / b.page_count * 100` when `progress_type = 'page'`.
- **Library:** `SELECT b.*, br.rating FROM books b LEFT JOIN book_reviews br ON b.id = br.book_id` with pagination + genre filter via `b.genres` JSON
- **Diary:** `SELECT br.*, b.title, b.author, b.cover_path FROM book_reviews br JOIN books b ON br.book_id = b.id WHERE br.review IS NOT NULL ORDER BY br.created_at DESC LIMIT 1`
- **Stats:** Books read this year = `SELECT COUNT(*) FROM book_reviews WHERE date_read >= '<jan-1>'`; total pages = `SELECT SUM(b.page_count) FROM books b JOIN book_reviews br ON b.id = br.book_id WHERE br.date_read >= '<jan-1>'`; reading goal from `reading_challenges` table (year-based). Streak calculated from consecutive days with `book_progress` entries.

---

## 6. Modal Screens

### 6.1 Log Film Modal

Triggered from Films page or global "Add New Entry" button.

- Search for film (existing TMDB search)
- Star rating (StarRating component)
- Date watched (date picker)
- Review text (textarea, Newsreader for preview)
- Tags (TagInput component, exists)
- "Watched before" toggle

### 6.2 Add Book Modal

Triggered from Books page.

- Search for book (existing search)
- Status selector (Reading / Read / Want to Read)
- Star rating
- Start/finish dates
- Notes textarea

### 6.3 Styling

Both modals use:
- `--surface-container-highest` background
- Ambient shadow
- Ghost border
- 16px border-radius (current modal already uses this)
- Newsreader for the modal title

---

## 7. Design Rules (Enforced Across All Pages)

1. **No 1px borders for structural layout** — sidebar/main separation, section dividers, card boundaries all use surface color shifts. Allowed exceptions: ghost-borders on image containers (`rgba(255,255,255,0.06)`), form input focus states (1px bottom-border in `var(--accent)`), and ghost-borders on glass panels.
2. **2:3 aspect ratio** for all media thumbnails (posters, book covers), 6px radius
3. **Newsreader for headlines**, Inter for everything else, Georgia/Charter for long-form reading
4. **8px spacing grid** — all gaps/padding in multiples of 8
5. **Module accent via `var(--accent)`** — never hardcode accent colors in components
6. **Glass-morphism for floating elements** — nav, header, context menus
7. **Material Symbols Outlined** for all icons
8. **"Slow Reveal" transitions** — implemented via SvelteKit page transitions: `transition:fade={{ duration: 300 }}` on page wrapper + CSS `transform: scale(0.98)` → `scale(1)` with `ease-out` easing. Applied to the main content `<slot>` wrapper in `+layout.svelte`, not individual components.

---

## 8. What's NOT Covered (Later Phases)

These routes exist but don't have Stitch designs. They'll inherit the design system and be styled cohesively, but are out of scope for this spec:

- `/films/diary`, `/films/stats`, `/films/lists`, `/films/watchlist`, `/films/[id]`
- `/books/library`, `/books/shelves`, `/books/challenge`, `/books/stats`, `/books/[id]`
- `/articles/*`, `/writing/*`, `/chess/*`
- `/settings`
- Global search overlay (Stitch has designs — Phase 2)

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Newsreader font bundle size | Use variable font subset (Latin only), ~60KB |
| Glass-morphism performance | Tauri uses WebKit which handles backdrop-filter well; limit blur to nav/header only |
| Material Symbols bundle | Subset to only icons used (~200 vs 2500+) or use individual SVGs |
| DB queries for dashboard stats | Queries join across tables (film_watchlist, book_shelf_assignments); add indexes on foreign keys and date columns |
| App starts empty | All sections need empty states with CTAs; dashboard should gracefully show "0" stats not broken UI |
| Module accent CSS conflicts | Strict `var(--accent)` convention, lint for hardcoded color values |
| Stitch HTML divergence | Use Stitch as visual reference only, not HTML source. Build in Svelte 5 idioms |
