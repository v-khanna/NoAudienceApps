# Design Implementation Plan

## Overview

We have full UI mockups in Google Stitch (MCP server configured) that define how every screen should look. The current app has functional pages but the styling doesn't match the mockups. This document outlines the plan to bring the app's UI in line with the designs.

## Stitch Projects

### Primary: "NoAudience Project Brief" (project ID: 3533165300518879215)

Contains a comprehensive design system and 19 visible screens:

| Screen | What it covers |
|--------|---------------|
| Home Dashboard Final V2 | Main landing page with cross-module overview |
| Films Home Final V2 | Films module home — diary, watchlist, stats preview |
| Log Film Entry | Film logging flow |
| Log Film Modal V2 | Modal variant of film logging |
| Books Home Final / V2 | Books module home — currently reading, shelves, challenge |
| Add Book to Library | Book add flow |
| Add Book Modal V2 | Modal variant of book adding |
| Articles Home Final / V2 | Articles module home — grid layout with cover photos |
| Save Article / Save Article Modal V2 | Article save flow |
| Writing Editor Final / V2 | TipTap editor with Substack-style layout |
| Chess Viewer Final / V2 | Interactive board + move list |
| Global Search / V2 | Cmd+K search overlay |

### Secondary: "Writing & Articles" (project ID: 14714754154813055162)

4 screens with an alternative design direction:
- Films Library, Bookshelf, Writing & Articles, Dashboard (Home)

## Design System Highlights (from Stitch)

The mockups use a "Warm Noir" / "Private Archive" aesthetic:

- **Fonts**: Newsreader (serif) for headlines/display, Inter for UI/labels
- **"No-Line" rule**: No 1px borders for sectioning — use background color shifts instead
- **Surface tiers**: Base (#101418) → Low (#181C20) → Container (#1C2024) → Bright (#363A3E)
- **Accents**: Green (#00E054) for completed, Orange (#FF8000) for queued, Blue (#40BCF4) for info
- **2:3 aspect ratio** enforced on all poster/cover cards
- **Tonal layering** instead of drop shadows

## Implementation Steps

For each page:

1. **Pull the mockup HTML** from Stitch using `get_screen` (each screen has downloadable HTML)
2. **Screenshot comparison** — view the mockup screenshot vs current app
3. **Extract key styling** — colors, spacing, typography, layout structure from the HTML
4. **Update the Svelte component** to match the mockup's layout and styling
5. **Verify** side-by-side

## Priority Order

1. **Home Dashboard** — first thing users see, currently bare
2. **Films Home** — films/books not displaying after adding (functional + visual fix)
3. **Books Home** — same display issue
4. **Articles Home** — needs grid layout with cover photos (user requested)
5. **Global Search** — Cmd+K overlay styling
6. **Writing Editor** — TipTap styling to match Substack aesthetic
7. **Chess Viewer** — board + move list layout
8. **Modals** — Log Film, Add Book, Save Article

## Known Issues to Fix Alongside

- Films/books don't refresh on home pages after adding (data loads on mount only)
- Articles should show in grid with cover photos
- Articles saved button needs both text and icon
- Substack layout improvements
