# Session Summary: Stitch Design Implementation — March 23-24, 2026

## Branch: `stitch-design-implementation` (off `main`)

## Overview

This session restyled the NoAudience app to match Stitch mockups and added several functionality features. All work follows the CSS-only restyling approach — template/style changes only, no script block rewrites.

**Previous attempt** (`feat/stitch-design-system`) was abandoned because subagents rewrote entire pages from scratch, breaking functionality. That branch should NOT be used.

---

## Commits (11 total)

```
16a1393 feat: book detail — shelf selector, delete review, back button, restyle
e7c0190 feat: restyle Books overview and stats to match Stitch design
fa256ad feat: add back button and Escape key to film detail page
d9e3e7a fix: sidebar Overview only highlights on exact /films match, not sub-pages
423bf62 feat: add arrow reorder to film lists
c9c8e42 feat: add '+ Watchlist' button to Log Film modal
eb778eb feat: restyle Log Film modal to match Stitch design
352737c feat: add-to-watchlist modal, restyle diary and stats pages
91ef4d0 feat: add list detail page with search & add films functionality
1e09729 feat: restyle Home, Films, and Watchlist pages to match Stitch design
ac804b5 feat: add Stitch design tokens and Newsreader font
```

---

## What Was Done

### Design System Foundation
- **`app.css`**: Updated CSS variables to Stitch palette (darker `#101418` bg, green `#00E054` accent). Added Stitch surface hierarchy tokens alongside existing ones for backward compat. Added Newsreader `@font-face`.
- **`tailwind.config.js`**: Added `font-headline` (Newsreader) family.
- **Font**: Bundled `newsreader-variable.woff2` (56KB) in `apps/noaudience/static/fonts/`.

### Pages Restyled (template/CSS only, script blocks untouched)

| Page | Route | Key Changes |
|------|-------|-------------|
| **Home Dashboard** | `/` | Bento grid (8/4 col stats+activity), big Newsreader headline, watchlist poster shelf, library highlights + writing side-by-side |
| **Films Overview** | `/films` | Hero featured review with backdrop image, Private Library stats card, diary entry cards, watchlist poster grid |
| **Films Watchlist** | `/films/watchlist` | Large poster cards with genre/date metadata, hover scale, "+ Add Film" button and placeholder card |
| **Films Diary** | `/films/diary` | Newsreader month headers, rounded card rows, "Mar 23" date format |
| **Films Stats** | `/films/stats` | 3 summary cards, taller bar chart, 2-col grid for genres + directors |
| **Films Lists** | `/films/lists` | List rows now clickable (link to detail page), Newsreader titles |
| **Log Film Modal** | Modal | Surface backgrounds, bottom-border focus, italic review textarea, pill toggle buttons |
| **Books Overview** | `/books` | "Your Library" heading, stats bar (total/reading/finished), cover grids with hover |
| **Books Stats** | `/books/stats` | "Archival Analytics" with milestone page-count card, 2-col dashboard |
| **Books Detail** | `/books/[id]` | Back button, Newsreader heading, clickable shelf pills, delete review |
| **Books Shelves** | `/books/shelves` | Newsreader heading, styled input |

### New Features (functionality additions)

| Feature | Files | Description |
|---------|-------|-------------|
| **Add to Watchlist Modal** | `$lib/films/AddToWatchlistModal.svelte` | Search TMDB → save to watchlist or a list. Used on watchlist page. |
| **"+ Watchlist" in Log Modal** | `$lib/films/LogModal.svelte` | Button alongside "Log Entry" to add film to watchlist without logging |
| **Film List Detail Page** | `/films/lists/[id]/+page.svelte` | View list films, search-to-add, ranked position numbers |
| **Arrow Reorder for Lists** | `/films/lists/[id]/+page.svelte` + `db.ts` | ▲/▼ buttons to reorder films, new `swapListPositions()` DB function |
| **Back Button + Escape** | `/films/[id]`, `/books/[id]` | ← Back button and Escape key on detail pages |
| **Shelf Selector** | `/books/[id]` | Clickable pills to change between Want to Read / Currently Reading / Read |
| **Delete Review** | `/books/[id]` | Red "Delete" button next to "Edit review" |
| **Sidebar Fix** | `SidebarItem.svelte` | "Overview" only highlights on exact `/films` match, not sub-pages |

### New DB Function
- `swapListPositions(listId, filmIdA, filmIdB)` in `$lib/films/db.ts`

---

## What's NOT Done (for next agent)

### Restyling remaining
- `/books/library` — full library page (has grid/table toggle, shelf filter)
- `/books/challenge` — reading challenge page
- `/articles/*` — all article pages
- `/writing/*` — all writing pages
- `/chess/*` — all chess pages
- `/settings` — settings page
- **Sidebar** — still uses old styling (could match Stitch with Newsreader title, darker bg)
- **Add Book Modal** (`$lib/books/AddBookModal.svelte`) — needs same restyle as Log Film modal

### Functionality gaps
- No way to remove a film from watchlist (from the watchlist page)
- No way to remove a film from a list (from the list detail page)
- Book search (OpenLibrary) is slow — no loading indicator
- No way to update reading progress from the book detail page
- No way to delete a book from library

### Known issues
- Multiple StarRating instances on same page: SVG clipPath IDs can collide (was fixed on abandoned branch but not on this one). The fix is adding a unique `uid` per component instance.
- HMR cache can get stale after many file changes — restart with `rm -rf apps/noaudience/.svelte-kit && npx --yes @tauri-apps/cli dev`

---

## How to Run

```bash
# From project root
npx --yes @tauri-apps/cli dev
# OR
pnpm tauri dev
```

The app does NOT work in a regular browser — requires Tauri for SQLite.

DB location: `~/Library/Application Support/com.noaudience.app/noaudience.db`

## Critical Rules for Next Agent

1. **Never rewrite page script blocks** — only change template HTML and CSS
2. **Test in Tauri** after every change — not in browser
3. **Clear `.svelte-kit` cache** if HMR acts weird
4. **Stitch screens** are in project `3533165300518879215` — use `mcp__stitch__list_screens` to find them
5. **DB constraint**: never use `.returning()` with Drizzle sqlite-proxy
6. **pnpm workspace** — use `pnpm` not `npm` for package operations

## Stitch MCP Access

```json
{
  "mcpServers": {
    "stitch": {
      "type": "http",
      "url": "https://stitch.googleapis.com/mcp",
      "headers": {
        "X-Goog-Api-Key": "AQ.Ab8RN6LzQAM0xyQNjzpzsks2qbJwcnOR3LB4oidq0BTdql3dJw"
      }
    }
  }
}
```

Stitch project ID for NoAudience: `3533165300518879215`
