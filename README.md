# NoAudience

> Does every hobby need an audience?

Track what you watch, read, and think — without broadcasting it. NoAudience is a private, local-first desktop app for logging movies, books, articles, and your own writing. No accounts. No social graph. No cloud. Your data stays on your machine in a single SQLite file.

## What it does

Five modules, each usable on its own or together:

- **Films** — Log movies with ratings, reviews, and tags. Diary view, watchlist, custom lists, stats. Metadata and posters pulled from TMDB. Designed after Letterboxd, minus the social layer.
- **Books** — Shelves (want to read, reading, read), progress tracking, reading challenges, stats. Covers and metadata from Open Library. Designed after Goodreads, minus the social layer.
- **Articles** — Auto-sync your Substack via RSS. Save other posts by URL. Highlight and annotate.
- **Writing** — Markdown editor with live preview. Write about what you consume, or write about anything. Link your writing to specific films, books, or articles in your library.
- **Chess** — Import PGN files, replay games, annotate positions.

## Standalone builds

Not everyone wants the full suite. Films and Books ship as independent apps:

| App | Modules | Size |
|-----|---------|------|
| NoAudience | Everything | ~10MB |
| NoAudience Films | Films only | ~3MB |
| NoAudience Books | Books only | ~3MB |

## Stack

- [Tauri v2](https://v2.tauri.app/) — native desktop shell, ~5MB vs Electron's 120MB
- [SvelteKit](https://kit.svelte.dev/) — frontend
- [SQLite](https://sqlite.org/) + [Drizzle ORM](https://orm.drizzle.team/) — local database
- [TipTap](https://tiptap.dev/) — rich text editor (via Tipex for Svelte)
- [Tailwind CSS](https://tailwindcss.com/) — styling

## Status

Early development. See [SPEC.md](SPEC.md) for the full design document.

## License

MIT
