# NoAudience

> Does every hobby need an audience? No. No it does not.

A private, local-first desktop app for the kind of person who tracks movies in a spreadsheet and thinks Letterboxd has too much social. Log films, books, articles, and your own writing — all stored in a single SQLite file on your machine. No accounts. No cloud. No one sees your 3-star review of a film everyone else gave 5.

## What it does

Five modules for people who consume media like it's a full-time job:

- **Films** — Log movies with ratings, reviews, tags. Diary view, watchlist, custom ranked lists with drag-to-reorder, stats dashboard. Posters and metadata from TMDB. Think Letterboxd, but it respects your privacy and doesn't make you feel bad about watching The Meg.
- **Books** — Shelves (want to read, reading, read — actually clickable and changeable, imagine that), progress tracking, reading challenges, analytics. Covers from Open Library. Goodreads without the influencers.
- **Articles** — Sync your Substack via RSS. Save posts by URL. Highlight and annotate. For when you want to remember what you read instead of just sharing it.
- **Writing** — Markdown editor with live preview. Write about what you consume, or write about nothing. Link entries to films, books, or articles in your library.
- **Chess** — Import PGN files, replay games, annotate positions. Because apparently that's a hobby now.

## Design

Dark mode only. Editorial typography via Newsreader serif for headings, Inter for everything else. The aesthetic is "dimly lit study" — lots of negative space, tonal surface layering instead of borders, glass-morphism where it matters. Designed in Google Stitch, implemented one CSS change at a time because we learned the hard way that rewriting pages from scratch breaks everything.

## Stack

- [Tauri v2](https://v2.tauri.app/) — native desktop shell (~5MB, not Electron's 120MB tax)
- [SvelteKit](https://kit.svelte.dev/) + Svelte 5 runes — frontend
- [SQLite](https://sqlite.org/) + [Drizzle ORM](https://orm.drizzle.team/) — local database via sqlite-proxy
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [TipTap](https://tiptap.dev/) — rich text editor

## Running it

```bash
# Install deps
pnpm install

# Run the desktop app
npx --yes @tauri-apps/cli dev
```

Opens in a native Tauri window. Does not work in a browser — the database needs the native runtime.

## Status

Active development. Films and Books modules are functional with Stitch-designed UI. Articles, Writing, and Chess are scaffolded but less polished. See `docs/session-2026-03-24-stitch-implementation.md` for the latest implementation details.

## License

MIT
