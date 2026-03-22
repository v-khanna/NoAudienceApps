# NoAudience — Full Specification

> *"Does every hobby need an audience?"*

A modular, private, open-source desktop app for tracking and reflecting on everything you consume and create. No accounts. No social features. No audience. Just you.

---

## Architecture

### Monorepo of Independent Modules

Each module is a standalone app that can also be used as part of the unified library. The monorepo builds three ways:

| Build Target | What's included | Install size |
|-------------|----------------|-------------|
| **NoAudience** | All 5 modules | ~10MB |
| **NoAudience Films** | Films only + shared core | ~3MB |
| **NoAudience Books** | Books only + shared core | ~3MB |

The full app also has a **first-run setup screen** where users toggle which modules to enable. Disabled modules are hidden from the sidebar and can be re-enabled anytime in Settings.

### Modules

| Module | Inspired By | Available standalone? |
|--------|------------|----------------------|
| **Films** | Letterboxd | Yes |
| **Books** | Goodreads | Yes |
| **Articles** | Substack Reader | Full app only |
| **Writing** | Obsidian + Substack Editor | Full app only |
| **Chess** | Lichess Analysis Board | Full app only |

### Monorepo Structure

```
noaudience/
├── packages/
│   ├── core/              # Shared: design system, DB layer, sidebar, settings
│   ├── films/             # Films module
│   ├── books/             # Books module
│   ├── articles/          # Articles module
│   ├── writing/           # Writing module
│   └── chess/             # Chess module
├── apps/
│   ├── noaudience/        # Full app (imports all modules)
│   ├── noaudience-films/  # Standalone Films app (imports core + films)
│   └── noaudience-books/  # Standalone Books app (imports core + books)
└── src-tauri/             # Rust backend (shared across all builds)
```

When running the full app, modules can cross-reference each other (e.g., write an article about a movie, link a book to your notes). Standalone apps are self-contained.

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Desktop shell | Tauri v2 | ~5MB install vs Electron's 120MB. Uses native macOS WebKit |
| Frontend | SvelteKit (SPA mode, adapter-static) | Fast, minimal, great DX |
| Database | SQLite via tauri-plugin-sql | Single file, zero setup, all data local |
| ORM | Drizzle (sqlite-proxy driver) | Type-safe queries, lightweight |
| Styling | Tailwind CSS | Utility-first, easy dark mode |
| Editor | Tipex or Edra (TipTap/ProseMirror for Svelte 5) | Substack uses TipTap too |
| Movie metadata | TMDB API | Free, comprehensive, what Letterboxd uses |
| Book metadata | Open Library API | Free, no key needed |
| RSS parsing | feed-rs (Rust crate) | Handles Atom, RSS 1.0/2.0, JSON Feed |
| Web scraping | reqwest + scraper (Rust) | Fast, no browser needed |
| Icons | Lucide | Clean, consistent, open source |
| Font | Inter (variable) | Free, screen-optimized, excellent at small sizes on dark |

---

## Global Design System

### Color Palette

```
Background (page):     #14181C   (Letterboxd's dark blue-gray)
Surface (cards):       #1B2028
Elevated surface:      #2C3440   (hover states, dropdowns)
Border:                rgba(255, 255, 255, 0.06)
Border hover:          rgba(255, 255, 255, 0.12)

Accent Green:          #00E054   (completed / watched / read)
Accent Orange:         #FF8000   (queued / watchlist / want to read)
Accent Blue:           #40BCF4   (links, info, navigation)

Primary text:          #FFFFFF   (titles, headings only)
Body text:             #E0E0E0   (paragraphs, descriptions)
Secondary text:        #99AABB   (metadata, captions)
Muted text:            #535353   (disabled, timestamps)
```

### Typography

| Element | Size | Weight | Line Height | Color |
|---------|------|--------|-------------|-------|
| Page title (H1) | 28px | 700 | 1.2 | #FFFFFF |
| Section header (H2) | 22px | 600 | 1.3 | #FFFFFF |
| Card title | 14px | 600 | 1.3 | #FFFFFF |
| Body text | 15px | 400 | 1.6 | #E0E0E0 |
| Metadata | 12px | 500 | 1.4 | #99AABB |
| Small label | 11px | 500 | 1.3 | #535353 |

Font: `Inter` variable, all weights. Increase letter-spacing by +0.01em for dark mode legibility.

### Spacing Scale (8px base)

`4 — 8 — 12 — 16 — 24 — 32 — 48 — 64 — 96`

### Poster/Cover Grid

```css
.poster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.poster-card {
  aspect-ratio: 2 / 3;
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s ease;
}

.poster-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}
```

### Rounded Corners

| Element | Radius |
|---------|--------|
| Poster/cover cards | 6px |
| Buttons | 6px (rect) or 999px (pill) |
| Inputs | 6px |
| Modals | 16px |
| Tags/chips | 4px |

### Modal Overlays

```css
.modal-backdrop {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
}

.modal {
  background: #1E2229;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
}
```

### Sidebar Navigation

- Width: 240px expanded, 64px collapsed
- Background: #0F1318 (one shade darker than page)
- Separator: 1px rgba(255, 255, 255, 0.06)
- Items: icon + label, 40px row height
- States: default (#99AABB), hover (#FFFFFF + rgba bg), active (#FFFFFF + accent left bar)

Sections:
- Top: App logo/name
- Main: Home, Films, Books, Articles, Writing, Chess
- Bottom: Settings

---

## Module 1: Films (Letterboxd Clone)

### Screens

#### 1.1 Films Home
- **Header**: "Films" title + search bar + "Log" button (green, #00E054)
- **Recently Watched**: Horizontal scroll row of poster cards with star ratings below
- **Diary Preview**: Last 5 diary entries (date, poster thumb, title, year, stars, heart icon)
- **Stats Preview**: Films this year count, hours watched, average rating
- **Watchlist Preview**: Poster grid of next 8 watchlist items

#### 1.2 Log Film Modal
Triggered by the green "+" button (always visible in header). Modal contains:

1. **Film search field** — type-ahead, hits TMDB API, shows poster + title + year in dropdown
2. **Date watched** — date picker, defaults to today
3. **Star rating** — 0.5 to 5.0 in half-star increments. Click left half of star = half, right half = full
4. **Heart/Like toggle** — heart icon, independent of rating. "I love this regardless of quality"
5. **Rewatch toggle** — circular arrows icon checkbox
6. **Review text area** — free-form, optional, supports markdown
7. **Tags** — type-ahead input, create new or select existing (e.g., "cinema", "date night", "netflix")
8. **Save button** — top right of modal

#### 1.3 Film Detail Page
Layout (top to bottom):

1. **Backdrop image** — full-width cinematic still from TMDB, behind header area with gradient fade to #14181C
2. **Poster** (left) + **Film info** (right):
   - Title (large, bold)
   - Year, Director, Runtime
   - Tagline (italic)
3. **Action buttons row**:
   - Eye icon (mark watched) — green when active
   - Heart icon (like) — fills red when active
   - Clock icon (add to watchlist) — orange when active
   - Star rating (inline)
4. **Synopsis** — plot description text
5. **Cast & Crew** — expandable sections
6. **Genres** — tag pills
7. **Your Activity**:
   - Your rating and review
   - Diary entries for this film (date, rewatch indicator)
8. **Similar Films** — horizontal poster row from TMDB recommendations

#### 1.4 Diary View
- Reverse chronological, grouped by month
- Each row: date (day) | poster thumbnail (40px) | title | year | stars | heart icon | rewatch icon | review indicator
- Month headers: "March 2026"
- Year filter tabs at top
- Poster hover shows green/orange/blue border per Letterboxd convention:
  - Green: watched
  - Orange: in watchlist
  - Blue: default hover

#### 1.5 Watchlist
- Poster grid (same as main grid)
- Sort by: date added (default), title, year
- Auto-removes when a film is logged/watched
- "Add to watchlist" via clock icon on any poster hover

#### 1.6 Lists
- Create custom lists (ranked or unranked)
- Each list: title, description, poster grid of films
- Per-film notes within a list
- Drag to reorder for ranked lists
- First film's backdrop becomes the list header image

#### 1.7 Stats Page
- **Total**: Films watched, hours watched, average rating
- **By Year**: Bar chart of films per year
- **By Genre**: Horizontal bar chart
- **Top Directors**: Most watched + highest rated
- **Top Actors**: Most watched + highest rated
- **Rating Distribution**: Histogram across 0.5-5.0 scale (green bars on dark bg)
- **By Month**: Activity heatmap or bar chart
- Chart styling: green accent bars at 70% opacity, #333 gridlines, #A0A0A0 axis labels

### Data Model (Films)

```
films
  id, tmdb_id, title, year, director, runtime, tagline, synopsis,
  poster_path, backdrop_path, genres (JSON), cast (JSON), crew (JSON),
  created_at

film_logs (diary entries)
  id, film_id, watched_date, rating (0.5-5.0), liked (bool),
  rewatch (bool), review (text), tags (JSON), created_at

film_watchlist
  id, film_id, added_at

film_lists
  id, title, description, ranked (bool), created_at

film_list_items
  id, list_id, film_id, position, note
```

---

## Module 2: Books (Goodreads Clone)

### Screens

#### 2.1 Books Home
- **Header**: "Books" title + search bar + reading challenge progress bar
- **Currently Reading**: Book cover + title + author + progress bar + "Update Progress" button
- **Recently Read**: Cover grid of last 8 books with star ratings
- **Want to Read**: Cover grid preview of next 8

#### 2.2 Add Book Flow
- Search by title or author → hits Open Library API → shows cover + title + author in dropdown
- Select → book is added to "Want to Read" shelf by default
- Green "Want to Read" button on every book card (click to add, dropdown arrow for shelf selection)
- Dropdown shows: Want to Read, Currently Reading, Read + custom shelves

#### 2.3 Book Detail Page
Layout:

1. **Left column** (sticky): Book cover image (large)
2. **Right column** (scrollable):
   - Title (large, bold)
   - Author (linked, clickable)
   - Your rating: interactive star row (1-5 stars)
   - Shelf button: "Want to Read" / "Currently Reading" / "Read" with dropdown
   - Description/synopsis (with "show more" truncation)
   - Genre tags: clickable pills
   - Metadata: page count, format, publisher, ISBN, publish date, language
   - Your review: text area (if read)
   - Your notes: previous progress updates with timestamps
   - Similar books: horizontal cover row from Open Library

#### 2.4 My Books (Library View)
**Two view modes** (toggle in top right):

**Cover View:**
- Grid of book covers (same grid system as films)
- Hover shows title + author overlay

**Table View:**
- Sortable columns: Cover (thumb) | Title | Author | Your Rating | Shelf | Date Read | Date Added | Pages
- Click column header to sort
- Click again to reverse

**Left Sidebar:**
- All shelves with counts: Read (42), Currently Reading (3), Want to Read (17), custom shelves...
- "Add shelf" input at bottom
- Click shelf to filter

#### 2.5 Currently Reading / Progress Updates
- When book is on "Currently Reading" shelf, a progress section appears on the book detail page
- Enter progress as **page number** or **percentage**
- Optionally add a text note about thoughts at that point
- Progress bar updates visually
- "I'm finished" button → moves to "Read" shelf, prompts for rating and review

#### 2.6 Shelves
- **3 exclusive default shelves**: Want to Read, Currently Reading, Read
- Every book must be on exactly one exclusive shelf
- **Custom shelves** (non-exclusive, act as tags): "favorites", "sci-fi", "owned", "library", "2026-reads"
- A book can be on multiple non-exclusive shelves
- Shelves are drag-to-reorder

#### 2.7 Reading Challenge
- Set a yearly goal (e.g., "Read 24 books in 2026")
- Progress widget: "You've read 7 of 24 books (29%) — 2 books ahead of schedule"
- Visual progress bar (green fill)
- Appears on Books Home and in sidebar

#### 2.8 Stats Page
- Books read per year (bar chart)
- Pages read per year
- Rating distribution (1-5 histogram)
- By genre (horizontal bars)
- Average rating given
- Longest / shortest book
- Most-read authors

### Data Model (Books)

```
books
  id, openlibrary_id, title, author, page_count, publisher,
  publish_date, isbn, language, description, genres (JSON),
  cover_path, created_at

book_shelves
  id, name, exclusive (bool), position

book_shelf_assignments
  id, book_id, shelf_id, assigned_at

book_progress
  id, book_id, progress_type (page|percent), progress_value,
  note (text), created_at

book_reviews
  id, book_id, rating (1-5), review (text), date_read, created_at

reading_challenges
  id, year, goal, created_at
```

---

## Module 3: Articles (Substack Reader)

### Screens

#### 3.1 Articles Home
- **Header**: "Articles" title + search bar + "Add Feed" button + "Save Article" button
- **Your Posts**: Auto-synced from your Substack RSS feed. Card layout:
  - Cover image (16:9 ratio) on top
  - Title (bold)
  - Date published
  - Excerpt (2 lines)
- **Saved Posts**: Articles from other people you've saved via URL
- **Recent**: Combined chronological feed of all articles

#### 3.2 Add Feed
- Enter your Substack URL (e.g., `yourname.substack.com`)
- App appends `/feed`, validates it, starts syncing
- Auto-polls every 30 minutes for new posts
- Shows sync status: "Last synced: 5 min ago"

#### 3.3 Save Article (by URL)
- Paste any Substack URL
- App hits `https://{publication}.substack.com/api/v1/posts/{slug}` for structured JSON
- Falls back to fetch + @mozilla/readability for non-Substack URLs
- Extracts: title, author, publication, date, full HTML content, cover image
- Downloads and caches all images locally
- Preserves original formatting

#### 3.4 Article Reader View
Faithful clone of Substack's reader layout:

- **Content width**: 660px max, centered with generous margins
- **Typography**: Serif font for body (Georgia or Charter), 18px, line-height 1.65
- **Headings**: Clear hierarchy, sans-serif (Inter), bold
- **Block quotes**: Left border bar (4px, accent blue), slight indent
- **Images**: Centered, responsive, full-width option
- **Code blocks**: Monospace, light gray background (#2C3440), syntax highlighting
- **Dividers**: Thin horizontal line, #2C3440

Additional features:
- **Annotation toolbar**: Select text → floating toolbar appears with: Highlight (yellow/blue/green/pink), Add Note
- **Highlights**: Rendered as `<mark>` elements with colored backgrounds at 30% opacity
- **Margin notes**: Click a highlight to see/edit your note in a small popover
- **Article metadata header**: Title, author, publication, date, estimated reading time

#### 3.5 Annotations View
- List of all your highlights and notes across all articles
- Grouped by article
- Each entry: highlighted text excerpt, your note, article title, date
- Search across all annotations
- Filter by color/tag

### Highlight Data Model

```
highlights
  id, article_id, color, note (text),
  text_exact (the highlighted text),
  text_prefix (30 chars before),
  text_suffix (30 chars after),
  position_start (char offset),
  position_end (char offset),
  created_at
```

Using both TextQuoteSelector (prefix/exact/suffix) and TextPositionSelector (start/end) for resilience — position for fast lookup, quote for fallback if content shifts.

### Data Model (Articles)

```
feeds
  id, url, name, last_synced_at, created_at

articles
  id, feed_id (nullable — null for saved articles),
  source_url, title, author, publication,
  date_published, cover_image_path,
  content_html, reading_time_minutes,
  is_own_post (bool), created_at

highlights
  (see above)
```

---

## Module 4: Writing (Markdown Editor)

### Design Philosophy

The best of both worlds:
- **Obsidian's editing experience**: Live preview, markdown shortcuts, keyboard-first, linking
- **Substack's aesthetic**: Clean, centered, serif reading, distraction-free, premium feel

### Editor Features

#### Core (must have):
| Feature | How it works |
|---------|-------------|
| **Live preview** | Type markdown, it renders inline when cursor leaves. `**bold**` → **bold**. Click back into it to see the `**` delimiters again. Built on TipTap/ProseMirror. |
| **Headings** | Type `#` + space for H1, `##` for H2, etc. Or use toolbar/slash menu. |
| **Bold / Italic / Strikethrough** | `Cmd+B`, `Cmd+I`, `Cmd+Shift+X`. Or `**`, `*`, `~~` syntax. |
| **Links** | `Cmd+K` to insert. Or type `[text](url)`. |
| **Images** | Drag and drop into editor. Stored locally. Resize handles on click. Full-width toggle via context menu. Captions and alt text via context menu. |
| **Bullet & numbered lists** | Type `-` or `1.` + space. Tab/Shift+Tab to indent/outdent. |
| **Checklists** | Type `- [ ]` + space. Click to toggle. |
| **Block quotes** | Type `>` + space. Renders with left accent bar. |
| **Code blocks** | Type ``` + language name. Syntax highlighting. |
| **Inline code** | Single backtick wrapping. |
| **Dividers** | Type `---`. Renders as thin horizontal line. |
| **Tables** | Pipe-and-hyphen syntax. |
| **Footnotes** | `[^1]` reference style. Rendered at bottom of document. |
| **Highlights** | `==text==` renders with yellow background. |
| **Slash command menu** | Type `/` to insert blocks (heading, list, quote, image, divider, callout, code block). |
| **Command palette** | `Cmd+P` — fuzzy search all actions. |

#### Nice to have:
| Feature | How it works |
|---------|-------------|
| **Internal links** | `[[` triggers autocomplete of other writings. Creates wikilinks between your pieces. |
| **Tags** | `#tag` inline. Hierarchical: `#topic/subtopic`. Browsable in sidebar. |
| **Callouts/Admonitions** | `> [!info] Title` + content. Styled blocks for notes, warnings, tips. Color-coded by type. |
| **Embeds** | Paste a URL on a new line → auto-embed (YouTube, etc.). |
| **Word count / reading time** | Status bar at bottom: "847 words · 4 min read". |
| **Focus mode** | Hide sidebar, status bar. Just the text. |
| **Auto-save** | Continuous, silent. No save button needed. Draft status indicator. |
| **Outline sidebar** | Auto-generated table of contents from headings. Click to jump. |

### Editor Layout

```
┌─────────────────────────────────────────────────┐
│ ← Back    Title field (large, bold)      ···    │
├─────────────────────────────────────────────────┤
│                                                 │
│          ┌─────────────────────┐                │
│          │                     │                │
│          │   Centered content  │                │
│          │   column (660px)    │                │
│          │                     │                │
│          │   Serif body text   │                │
│          │   18px, 1.65 lh     │                │
│          │                     │                │
│          │   [Toolbar appears  │                │
│          │    on text select]  │                │
│          │                     │                │
│          └─────────────────────┘                │
│                                                 │
├─────────────────────────────────────────────────┤
│ 847 words · 4 min read        Draft saved ✓     │
└─────────────────────────────────────────────────┘
```

- **Toolbar**: Persistent top bar (Substack style) — Style dropdown, B, I, S, Link, List, Quote, Image, More...
- **Content area**: Centered 660px column, generous margins, off-white on dark or dark bg
- **Reading font**: Georgia / Charter (serif) for body, Inter for headings
- **Status bar**: Bottom — word count, reading time, save status
- **Formatting toolbar on selection**: Float above selected text for quick formatting

### Writings Browser

- Grid or list view of all your writings
- Each card: title, excerpt (2 lines), date, word count, tags
- Sort by: date modified, date created, title
- Filter by: tag, folder
- Search across all writings (full-text)

### Cross-module linking
- When writing about a film: type `@` to search and link to a film from your library
- When writing about a book: same — `@` to search and link
- Links render as styled inline cards (small poster/cover + title)

### Data Model (Writing)

```
writings
  id, title, content_markdown, content_html (rendered cache),
  word_count, tags (JSON), folder (text),
  created_at, updated_at

writing_links
  id, writing_id, linked_type (film|book|article|writing),
  linked_id, created_at
```

---

## Module 5: Chess (PGN Viewer / Analyzer)

### Screens

#### 5.1 Games Library
- List of saved games: White vs Black, result, date, opening name, your color
- Import: paste PGN text or upload .pgn file
- Bulk import: upload multi-game .pgn files
- Filter by: result (win/loss/draw), color (white/black), opening, date range
- Search by opponent name

#### 5.2 Game Viewer
- **Interactive board** (center): click through moves, drag pieces to navigate
- **Move list** (right panel): scrollable notation, click any move to jump
- **Board controls**: flip board, first/prev/next/last move, auto-play
- **Annotations**: add comments/notes to any position (stored in PGN comments)
- **Opening name**: auto-detected from move sequence (ECO database)
- **Evaluation bar** (optional): if engine analysis is available

#### 5.3 Analysis
- Connect to a local Stockfish engine (if installed) or use WASM Stockfish
- Show eval bar, best lines, engine suggestions
- Mark blunders/mistakes/inaccuracies with color-coded move highlighting
- Export annotated PGN

### Data Model (Chess)

```
chess_games
  id, pgn_text, white, black, result, date,
  opening_eco, opening_name, your_color,
  annotations (JSON), created_at
```

---

## Global Features

### Search (Cmd+K)
- Global search across all modules
- Results grouped by type: Films, Books, Articles, Writings, Chess Games
- Fuzzy matching on titles, authors, directors, tags
- Keyboard navigable (arrow keys + Enter)

### Settings
- TMDB API key input
- Substack feed URL
- Theme tweaks (accent color picker)
- Data location (where SQLite file lives)
- Export all data (JSON/CSV)
- Import from Letterboxd (CSV), Goodreads (CSV), Substack (RSS)

### Sidebar Structure

```
┌──────────────────┐
│  [App Logo]       │
│                   │
│  ◉ Home           │
│                   │
│  ▸ Films          │
│  ▸ Books          │
│  ▸ Articles       │
│  ▸ Writing        │
│  ▸ Chess          │
│                   │
│                   │
│                   │
│  ⚙ Settings       │
└──────────────────┘
```

Each module expands to show sub-pages:
- Films → Diary, Watchlist, Lists, Stats
- Books → Library, Shelves, Challenge, Stats
- Articles → Your Posts, Saved, Feeds, Annotations
- Writing → All Writings, Tags, Folders
- Chess → Games, Analysis

---

## Import/Export

| Source | Import Format | What's imported |
|--------|--------------|----------------|
| Letterboxd | CSV export | Films, ratings, dates, reviews |
| Goodreads | CSV export | Books, shelves, ratings, reviews, dates |
| Substack | RSS feed | Posts with full content and images |
| Chess | PGN files | Games with annotations |

Export: Full SQLite database file + JSON export per module.

---

## Build & Distribution

- **macOS**: `.dmg` installer via Tauri bundler (~5-10MB)
- **Windows**: `.msi` installer
- **Linux**: `.AppImage` or `.deb`
- All data stored in `~/Library/Application Support/com.personal-library.app/` (macOS)
- Single SQLite file + `images/` directory for cached covers/posters/article images
