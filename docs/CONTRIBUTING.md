# Contributing

NoAudience is open source and contributions are welcome.

## Getting oriented

Start here:
1. [VISION.md](VISION.md) — why this project exists
2. [ARCHITECTURE.md](ARCHITECTURE.md) — how the system is structured
3. [MODULES.md](MODULES.md) — what each module does
4. [DESIGN.md](DESIGN.md) — the design system (colors, typography, components)
5. [SPEC.md](../SPEC.md) — the full specification with screen layouts, data models, and interaction details

## Development setup

Prerequisites:
- Node.js 20+
- Rust (latest stable)
- A TMDB API key (free at themoviedb.org) for the Films module

```bash
git clone https://github.com/v-khanna/NoAudienceApps.git
cd NoAudienceApps
npm install
npm run tauri dev
```

## Project structure

```
packages/core/       → Shared design system, database layer, sidebar, settings
packages/films/      → Films module
packages/books/      → Books module
packages/articles/   → Articles module
packages/writing/    → Writing module
packages/chess/      → Chess module
apps/noaudience/     → Full app build target
apps/noaudience-films/  → Standalone Films build
apps/noaudience-books/  → Standalone Books build
src-tauri/           → Rust backend
```

## Guidelines

- Each module only depends on `core`. Modules do not depend on each other.
- Follow the design system in DESIGN.md. Do not introduce new colors or spacing values without discussion.
- The UI clones Letterboxd (Films), Goodreads (Books), and Substack (Articles/Writing) interaction patterns intentionally. Deviations from those patterns need a good reason.
- No social features. No user accounts. No cloud sync. This is a single-user local app.
- Keep it lightweight. Tauri was chosen over Electron for a reason.
