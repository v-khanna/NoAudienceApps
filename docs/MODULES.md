# Modules

Each module is described here at a high level. For detailed screen layouts, interactions, and data models, see [SPEC.md](../SPEC.md).

---

## Films

A private Letterboxd. Log movies with dates, ratings, reviews, and tags. Browse your collection as a poster grid. Keep a watchlist. Build custom lists. See your stats.

**Key screens**: Films Home, Log Modal, Film Detail, Diary, Watchlist, Lists, Stats

**Data source**: TMDB API (free, requires API key)

**Core interactions cloned from Letterboxd**:
- Half-star ratings (0.5 to 5.0)
- Heart/like toggle independent of rating
- Rewatch tracking
- Diary grouped by month
- Poster hover states (green = watched, orange = watchlist, blue = default)
- Stats page with genre/director/actor breakdowns and rating histogram

---

## Books

A private Goodreads. Organize books into shelves, track reading progress, set yearly reading goals, rate and review.

**Key screens**: Books Home, Book Detail, My Books (library), Shelves, Reading Challenge, Stats

**Data source**: Open Library API (free, no key needed)

**Core interactions cloned from Goodreads**:
- Three exclusive shelves: Want to Read, Currently Reading, Read
- Custom non-exclusive shelves (act as tags)
- Reading progress updates (page number or percentage) with notes
- "Want to Read" button with shelf dropdown
- Table view and cover grid view (switchable)
- Sortable columns in table view
- Reading challenge with progress bar and pace tracking

---

## Articles

A private Substack reader with annotations. Auto-sync your own Substack posts via RSS. Save posts from other publications by pasting a URL. Highlight passages and add notes.

**Key screens**: Articles Home, Add Feed, Save Article, Article Reader, Annotations View

**Data sources**:
- Your Substack RSS feed (auto-polled every 30 minutes)
- Substack's undocumented API (`/api/v1/posts/{slug}`) for saving individual articles
- Mozilla Readability as fallback for non-Substack URLs

**Core features**:
- Reader view cloned from Substack's layout: centered 660px column, serif typography, 18px body text
- Text highlighting with multiple colors
- Margin notes on highlights
- All images downloaded and cached locally
- Full formatting preserved (headings, blockquotes, images, code blocks)

**Annotation system**: Uses the W3C Web Annotation data model. Each highlight stores a TextQuoteSelector (exact text + surrounding context) and a TextPositionSelector (character offsets) for resilient anchoring even if content shifts slightly.

---

## Writing

A markdown editor that combines Obsidian's live preview with Substack's clean aesthetic. Write about what you consume, or write about anything.

**Key screens**: Writings Browser, Editor, Tags/Folders

**Editor foundation**: TipTap/ProseMirror (via Tipex for Svelte 5) — the same framework Substack's own editor uses

**Core features**:
- Live preview: type markdown, it renders inline when the cursor moves away
- Markdown shortcuts: `#` for headings, `**` for bold, `-` for lists, `>` for quotes, ``` for code
- Slash command menu: type `/` to insert blocks
- Drag-and-drop images
- Auto-save (continuous, no save button)
- Word count and reading time in status bar
- Internal linking: `[[` to search and link other writings
- Cross-module linking: `@` to search and link films, books, or articles from your library (renders as inline cards with poster/cover)

**Design**: Centered 660px content column, serif body font (Georgia/Charter), generous margins, distraction-free. The editor looks like a Substack post while writing.

---

## Chess

Import and review chess games. Not a playing interface — a study and annotation tool.

**Key screens**: Games Library, Game Viewer, Analysis

**Data source**: PGN files (paste text or upload files, including multi-game files)

**Core features**:
- Interactive board: click through moves, drag pieces to navigate
- Move list panel with clickable notation
- Board controls: flip, first/prev/next/last, auto-play
- Per-move annotations and comments
- Opening auto-detection from ECO database
- Optional Stockfish integration (local engine or WASM) for eval bar and best-line suggestions
- Export annotated PGN
