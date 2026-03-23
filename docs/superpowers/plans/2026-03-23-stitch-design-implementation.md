# Stitch Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the NoAudience app to match Stitch mockups, starting with design system foundation, then Home Dashboard, Films, and Books pages.

**Architecture:** Design tokens defined as CSS custom properties in `app.css`, consumed by Tailwind via `tailwind.config.js` theme references. Module accent colors swap via `data-module` attribute on the layout container. New shared components in `packages/core/src/components/`, page-specific components in `apps/noaudience/src/lib/components/<module>/`.

**Tech Stack:** SvelteKit + Svelte 5 (runes), Tailwind CSS, Tauri (WebKit), Drizzle ORM with sqlite-proxy, Newsreader + Inter fonts, Material Symbols Outlined icons.

**Spec:** `docs/superpowers/specs/2026-03-23-stitch-design-implementation.md`

---

## File Map

### Files to Modify
| File | Responsibility | Changes |
|------|---------------|---------|
| `tailwind.config.js` | Theme config | Replace color/font/spacing tokens with Stitch palette |
| `apps/noaudience/src/app.css` | Global styles | New CSS variables, @font-face for Newsreader, glass utilities, module accent system |
| `apps/noaudience/src/routes/+layout.svelte` | App shell | Add `data-module` attribute, HeaderBar component, page transitions |
| `packages/core/src/components/Sidebar.svelte` | Navigation | Restyle to Stitch: dark bg, glass hover, accent active states, Newsreader title |
| `packages/core/src/components/SidebarItem.svelte` | Nav item | Update active/hover styles to use new tokens and `var(--accent)` |
| `packages/core/src/components/PosterCard.svelte` | Film/book poster | Ghost-border, updated hover, remove colored ring |
| `packages/core/src/components/StarRating.svelte` | Rating display | Use `var(--accent)` instead of hardcoded green |
| `packages/core/src/components/Modal.svelte` | Dialog wrapper | Surface-container-highest bg, ghost border, Newsreader title |
| `apps/noaudience/src/routes/+page.svelte` | Home dashboard | Full rebuild with 6 sections |
| `apps/noaudience/src/routes/films/+page.svelte` | Films home | Restyle to match Stitch: featured review, stats, diary, watchlist |
| `apps/noaudience/src/routes/books/+page.svelte` | Books home | Restyle to match Stitch: currently reading, catalog, diary, stats |

### Files to Create
| File | Responsibility |
|------|---------------|
| `apps/noaudience/static/fonts/newsreader-variable.woff2` | Serif headline font |
| `apps/noaudience/static/fonts/material-symbols-outlined.woff2` | Icon font |
| `apps/noaudience/src/lib/components/HeaderBar.svelte` | Glass top bar with search + controls |
| `packages/core/src/components/StatsPanel.svelte` | Glass metric panel (reusable) |
| `packages/core/src/components/QuoteBlock.svelte` | Editorial diary quote (reusable) |
| `packages/core/src/components/FilterTabs.svelte` | Tab bar for filtering (reusable) |
| `apps/noaudience/src/lib/components/films/FeaturedReview.svelte` | Hero editorial block |
| `apps/noaudience/src/lib/components/films/DiaryList.svelte` | Recent film log entries |
| `apps/noaudience/src/lib/components/books/BookCard.svelte` | Book cover + progress |
| `apps/noaudience/src/lib/components/books/ReadingProgress.svelte` | Progress bar with % |
| `apps/noaudience/src/lib/components/EmptyState.svelte` | Reusable empty state with CTA |

---

## Task 1: Download & Bundle Fonts

**Files:**
- Create: `apps/noaudience/static/fonts/newsreader-variable.woff2`
- Create: `apps/noaudience/static/fonts/material-symbols-outlined.woff2`

- [ ] **Step 1: Download Newsreader variable font**

```bash
# Download from Google Fonts API — Latin subset, variable weight
curl -L "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&display=swap" -o /tmp/newsreader-css.txt
# Extract the woff2 URL from the CSS and download it
# Alternative: use fontsource
npm install --save-dev @fontsource-variable/newsreader
```

Copy the woff2 file from `node_modules/@fontsource-variable/newsreader/files/` to `apps/noaudience/static/fonts/newsreader-variable.woff2`.

- [ ] **Step 2: Download Material Symbols Outlined font**

```bash
npm install --save-dev @fontsource-variable/material-symbols-outlined
```

Copy the woff2 file to `apps/noaudience/static/fonts/material-symbols-outlined.woff2`.

- [ ] **Step 3: Verify fonts exist**

```bash
ls -la apps/noaudience/static/fonts/
```

Expected: three `.woff2` files (inter, newsreader, material-symbols).

- [ ] **Step 4: Commit**

```bash
git add apps/noaudience/static/fonts/
git commit -m "chore: bundle Newsreader and Material Symbols fonts for Stitch design"
```

---

## Task 2: Design System Foundation — CSS Tokens & Tailwind

**Files:**
- Modify: `apps/noaudience/src/app.css`
- Modify: `tailwind.config.js`

- [ ] **Step 1: Replace CSS custom properties in `app.css`**

Replace the existing `:root` block and add font-face declarations. Keep the existing `@import 'tailwindcss'` and body styles but update values.

New `:root` variables:
```css
:root {
  /* Surface hierarchy — depth via tonal shifts, not borders */
  --surface-base: #101418;
  --surface-sidebar: #0B0F12;
  --surface-container-low: #181C20;
  --surface-container: #1C2024;
  --surface-container-high: #262A2F;
  --surface-container-highest: #31353A;
  --surface-bright: #363A3E;

  /* Text hierarchy */
  --text-primary: #E0E3E8;
  --text-secondary: #99AABB;
  --text-muted: #6B7280;
  --text-on-accent: #00390F;

  /* Module accent — default is green, overridden per module */
  --accent: #00E054;
  --accent-muted: rgba(0, 224, 84, 0.15);

  /* Semantic colors (always available) */
  --color-success: #00E054;
  --color-warning: #FF8000;
  --color-info: #40BCF4;
  --color-error: #FFB4AB;

  /* Borders */
  --ghost-border: rgba(255, 255, 255, 0.06);
}

/* Module accent overrides */
[data-module="books"] { --accent: #FF8000; --accent-muted: rgba(255, 128, 0, 0.15); --text-on-accent: #502400; }
[data-module="articles"] { --accent: #40BCF4; --accent-muted: rgba(64, 188, 244, 0.15); --text-on-accent: #003549; }
[data-module="writing"] { --accent: #D1C6A8; --accent-muted: rgba(209, 198, 168, 0.15); --text-on-accent: #474029; }
[data-module="chess"] { --accent: #C0C0C8; --accent-muted: rgba(192, 192, 200, 0.15); --text-on-accent: #1A1A1A; }
```

Add `@font-face` declarations:
```css
@font-face {
  font-family: 'Newsreader';
  src: url('/fonts/newsreader-variable.woff2') format('woff2');
  font-weight: 200 800;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Newsreader';
  src: url('/fonts/newsreader-variable.woff2') format('woff2');
  font-weight: 200 800;
  font-style: italic;
  font-display: swap;
}

@font-face {
  font-family: 'Material Symbols Outlined';
  src: url('/fonts/material-symbols-outlined.woff2') format('woff2');
  font-style: normal;
  font-weight: 100 700;
  font-display: block;
}
```

Add utility classes:
```css
/* Glass panel */
.glass-panel {
  background: rgba(28, 32, 36, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--ghost-border);
}

/* Material icon */
.icon {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
}

/* Ghost border for images */
.ghost-border {
  border: 1px solid var(--ghost-border);
}

/* Ambient shadow for modals */
.shadow-ambient {
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.5);
}
```

Update body styles:
```css
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--surface-base);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
```

Update scrollbar colors to new tokens:
```css
::-webkit-scrollbar-track { background: var(--surface-base); }
::-webkit-scrollbar-thumb { background: var(--surface-container-highest); }
```

- [ ] **Step 2: Update `tailwind.config.js`**

Replace the theme with references to CSS variables:
```js
export default {
  content: [
    './apps/noaudience/src/**/*.{html,js,svelte,ts}',
    './packages/core/src/**/*.{html,js,svelte,ts}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          base: 'var(--surface-base)',
          sidebar: 'var(--surface-sidebar)',
          'container-low': 'var(--surface-container-low)',
          container: 'var(--surface-container)',
          'container-high': 'var(--surface-container-high)',
          'container-highest': 'var(--surface-container-highest)',
          bright: 'var(--surface-bright)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          'on-accent': 'var(--text-on-accent)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          muted: 'var(--accent-muted)',
        },
        semantic: {
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          info: 'var(--color-info)',
          error: 'var(--color-error)',
        },
        ghost: 'var(--ghost-border)',
      },
      fontFamily: {
        headline: ['Newsreader', 'Georgia', 'Charter', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'Charter', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', fontWeight: '400' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', fontWeight: '400' }],
        'headline-lg': ['2rem', { lineHeight: '1.25', fontWeight: '500' }],
        'headline-sm': ['1.5rem', { lineHeight: '1.3', fontWeight: '500' }],
        'title-lg': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'title-sm': ['0.875rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-md': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'label-lg': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
        'label-md': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
        'label-sm': ['0.6875rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        card: '6px',
        modal: '16px',
        pill: '999px',
        chip: '4px',
      },
      boxShadow: {
        ambient: '0 24px 48px -12px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Verify the app still runs**

```bash
cd apps/noaudience && npm run dev
```

Open in browser. The app should load with the new darker background (`#101418` vs old `#15191E`). Text colors will shift slightly. No layout should break — we only changed token values.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js apps/noaudience/src/app.css
git commit -m "feat: implement Stitch design system tokens, fonts, and utilities"
```

---

## Task 3: Layout Shell — Sidebar Restyle

**Files:**
- Modify: `packages/core/src/components/Sidebar.svelte` (106 lines)

- [ ] **Step 1: Restyle the Sidebar**

Key changes to `Sidebar.svelte` and `SidebarItem.svelte` (imported by Sidebar at line 3):
- Background: `var(--surface-sidebar)` (`#0B0F12`)
- App title: Use `font-headline` (Newsreader) class, `text-headline-sm` size
- Remove all `1px solid` borders — use surface color shifts for section separation
- Active nav item: left border uses `var(--accent)` (was hardcoded blue)
- Hover state: `var(--surface-container-low)` background
- Add "Add New Entry" button at bottom of nav section with `var(--accent)` background and `var(--text-on-accent)` text
- Settings section separator: background color shift to `var(--surface-container-low)` instead of border

Replace inline styles with Tailwind classes referencing new tokens:
- `background-color: #0D1117` → `bg-surface-sidebar`
- `color: #C9D1D9` → `text-text-primary`
- `border-left: 2px solid #58a6ff` → `border-l-2 border-accent`

- [ ] **Step 2: Verify sidebar renders correctly**

```bash
cd apps/noaudience && npm run dev
```

Check: sidebar is darker, app title is serif, active state uses green (or module accent), no visible borders between sections.

- [ ] **Step 3: Commit**

```bash
git add packages/core/src/components/Sidebar.svelte packages/core/src/components/SidebarItem.svelte
git commit -m "feat: restyle Sidebar to Stitch design — dark bg, Newsreader title, accent active states"
```

---

## Task 4: Layout Shell — Module Context & Page Transitions

**Files:**
- Modify: `apps/noaudience/src/routes/+layout.svelte` (46 lines)

- [ ] **Step 1: Add `data-module` attribute and page transitions**

In `+layout.svelte`, derive the module from the current URL path and set it as an attribute on the main wrapper. Add the "Slow Reveal" fade transition on route change.

```svelte
<script lang="ts">
  import '../app.css';
  import Sidebar from '@noaudience/core/components/Sidebar.svelte';
  import GlobalSearch from '$lib/GlobalSearch.svelte';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';

  let { children } = $props();
  let dbReady = $state(false);
  let dbError = $state<string | null>(null);

  // Derive module from route
  let module = $derived.by(() => {
    const path = $page.url.pathname;
    if (path.startsWith('/films')) return 'films';
    if (path.startsWith('/books')) return 'books';
    if (path.startsWith('/articles')) return 'articles';
    if (path.startsWith('/writing')) return 'writing';
    if (path.startsWith('/chess')) return 'chess';
    return 'home';
  });

  // ... existing db init code ...
</script>

<div class="flex h-screen overflow-hidden" data-module={module()}>
  <Sidebar />
  <main class="flex-1 overflow-y-auto" style="padding: 40px 48px;">
    {#key $page.url.pathname}
      <div in:fade={{ duration: 200 }} class="page-enter">
        {@render children()}
      </div>
    {/key}
    <!-- In app.css: .page-enter { animation: slowReveal 300ms ease-out; }
         @keyframes slowReveal { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } } -->
  </main>
</div>
```

Note: Keep existing `dbReady`, `dbError`, loading/error states. Only add the `data-module` attribute and page transition wrapper.

- [ ] **Step 2: Update main wrapper styles**

Replace inline background color references with new tokens. The `<main>` element should use `bg-surface-base`. Remove any remaining old CSS variable references.

- [ ] **Step 3: Verify module context works**

```bash
cd apps/noaudience && npm run dev
```

Navigate between `/`, `/films`, `/books`. Inspect the DOM — the outer `div` should have `data-module="home"`, `data-module="films"`, `data-module="books"` respectively. Page transitions should show a subtle fade.

- [ ] **Step 4: Commit**

```bash
git add apps/noaudience/src/routes/+layout.svelte
git commit -m "feat: add module context (data-module) and page transitions to layout"
```

---

## Task 5: Layout Shell — HeaderBar Component

**Files:**
- Create: `apps/noaudience/src/lib/components/HeaderBar.svelte`
- Modify: `apps/noaudience/src/routes/+layout.svelte`

- [ ] **Step 1: Create HeaderBar component**

```svelte
<!-- apps/noaudience/src/lib/components/HeaderBar.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { onSearchClick, breadcrumb }: { onSearchClick?: () => void; breadcrumb?: Snippet } = $props();
</script>

<header class="glass-panel sticky top-0 z-10 flex items-center justify-between px-8 py-3">
  <!-- Left: breadcrumb placeholder -->
  <div class="text-label-md text-text-secondary">
    {#if breadcrumb}{@render breadcrumb()}{/if}
  </div>

  <!-- Center: search trigger -->
  <button
    onclick={onSearchClick}
    class="flex items-center gap-2 rounded-chip px-4 py-2 text-body-md text-text-muted
           bg-surface-container-low hover:bg-surface-container transition-colors duration-150"
  >
    <span class="icon text-[18px]">search</span>
    <span>Search</span>
    <kbd class="ml-4 text-label-sm text-text-muted bg-surface-container px-1.5 py-0.5 rounded">⌘K</kbd>
  </button>

  <!-- Right: controls -->
  <div class="flex items-center gap-4">
    <button class="text-text-secondary hover:text-text-primary transition-colors">
      <span class="icon">notifications</span>
    </button>
    <button class="text-text-secondary hover:text-text-primary transition-colors">
      <span class="icon">settings</span>
    </button>
  </div>
</header>
```

- [ ] **Step 2: Integrate HeaderBar into layout**

In `+layout.svelte`, import `HeaderBar` and place it above the `{@render children()}` slot inside `<main>`:

```svelte
import HeaderBar from '$lib/components/HeaderBar.svelte';

<!-- Inside <main> -->
<HeaderBar onSearchClick={() => { /* toggle GlobalSearch */ }} />
<div class="px-12 py-8">
  {#key $page.url.pathname}
    <div transition:fade={{ duration: 200 }}>
      {@render children()}
    </div>
  {/key}
</div>
```

Move the `GlobalSearch` open/close logic to be triggered by HeaderBar's search button and Cmd+K.

- [ ] **Step 3: Create the `$lib/components/` directory structure**

```bash
mkdir -p apps/noaudience/src/lib/components/films
mkdir -p apps/noaudience/src/lib/components/books
```

- [ ] **Step 4: Verify header renders**

```bash
cd apps/noaudience && npm run dev
```

Check: glass header bar at top of main content area, search button centered, notification/settings icons on right.

- [ ] **Step 5: Commit**

```bash
git add apps/noaudience/src/lib/components/HeaderBar.svelte apps/noaudience/src/routes/+layout.svelte
git commit -m "feat: add glass HeaderBar component with search trigger and module controls"
```

---

## Task 6: Shared Components — StatsPanel, QuoteBlock, FilterTabs, EmptyState

**Files:**
- Create: `packages/core/src/components/StatsPanel.svelte`
- Create: `packages/core/src/components/QuoteBlock.svelte`
- Create: `packages/core/src/components/FilterTabs.svelte`
- Create: `apps/noaudience/src/lib/components/EmptyState.svelte`

- [ ] **Step 1: Create StatsPanel**

A glass-panel row of metric cards. Used on Home, Films, and Books pages.

```svelte
<!-- packages/core/src/components/StatsPanel.svelte -->
<script lang="ts">
  type Stat = { label: string; value: string | number; icon?: string };
  let { stats }: { stats: Stat[] } = $props();
</script>

<div class="grid gap-4" style="grid-template-columns: repeat({stats.length}, 1fr);">
  {#each stats as stat}
    <div class="glass-panel rounded-card p-6 flex flex-col gap-1">
      {#if stat.icon}
        <span class="icon text-text-muted text-[20px]">{stat.icon}</span>
      {/if}
      <span class="font-headline text-headline-sm text-text-primary">{stat.value}</span>
      <span class="text-label-md text-text-secondary uppercase tracking-wider">{stat.label}</span>
    </div>
  {/each}
</div>
```

- [ ] **Step 2: Create QuoteBlock**

Editorial diary quote. Used for featured reviews on Films and Books pages.

```svelte
<!-- packages/core/src/components/QuoteBlock.svelte -->
<script lang="ts">
  let { quote, attribution, date, coverSrc }: {
    quote: string;
    attribution: string;
    date?: string;
    coverSrc?: string;
  } = $props();
</script>

<div class="flex gap-6 p-6 bg-surface-container-low rounded-card">
  {#if coverSrc}
    <img src={coverSrc} alt="" class="w-20 h-auto rounded-chip ghost-border object-cover" style="aspect-ratio: 2/3;" />
  {/if}
  <div class="flex flex-col gap-3 flex-1">
    <span class="icon text-text-muted text-[20px]">format_quote</span>
    <p class="font-headline text-title-lg text-text-primary italic leading-relaxed">"{quote}"</p>
    <div class="flex items-center gap-2 text-label-md text-text-secondary">
      <span>{attribution}</span>
      {#if date}
        <span class="text-text-muted">·</span>
        <span class="text-text-muted">{date}</span>
      {/if}
    </div>
  </div>
</div>
```

- [ ] **Step 3: Create FilterTabs**

Reusable tab bar for genre/category filtering.

```svelte
<!-- packages/core/src/components/FilterTabs.svelte -->
<script lang="ts">
  let { tabs, activeTab = 'all', onTabChange }: {
    tabs: string[];
    activeTab?: string;
    onTabChange: (tab: string) => void;
  } = $props();
</script>

<div class="flex items-center gap-1">
  {#each tabs as tab}
    <button
      class="px-4 py-2 rounded-chip text-label-md uppercase tracking-wider transition-colors duration-150
             {activeTab === tab
               ? 'bg-accent text-text-on-accent'
               : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-high'}"
      onclick={() => onTabChange(tab)}
    >
      {tab}
    </button>
  {/each}
</div>
```

- [ ] **Step 4: Create EmptyState**

Reusable empty state with icon, headline, and CTA.

```svelte
<!-- apps/noaudience/src/lib/components/EmptyState.svelte -->
<script lang="ts">
  let { icon, headline, description, ctaLabel, onCtaClick }: {
    icon: string;
    headline: string;
    description?: string;
    ctaLabel?: string;
    onCtaClick?: () => void;
  } = $props();
</script>

<div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
  <span class="icon text-[48px] text-text-muted">{icon}</span>
  <h3 class="font-headline text-headline-sm text-text-primary">{headline}</h3>
  {#if description}
    <p class="text-body-md text-text-secondary max-w-md">{description}</p>
  {/if}
  {#if ctaLabel && onCtaClick}
    <button
      class="mt-4 px-6 py-3 rounded-chip bg-accent text-text-on-accent text-label-lg
             hover:opacity-90 transition-opacity duration-150"
      onclick={onCtaClick}
    >
      {ctaLabel}
    </button>
  {/if}
</div>
```

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/components/StatsPanel.svelte packages/core/src/components/QuoteBlock.svelte packages/core/src/components/FilterTabs.svelte apps/noaudience/src/lib/components/EmptyState.svelte
git commit -m "feat: add shared StatsPanel, QuoteBlock, FilterTabs, and EmptyState components"
```

---

## Task 7: Update Existing Shared Components

**Files:**
- Modify: `packages/core/src/components/PosterCard.svelte` (51 lines)
- Modify: `packages/core/src/components/StarRating.svelte` (115 lines)
- Modify: `packages/core/src/components/Modal.svelte` (51 lines)

- [ ] **Step 1: Update PosterCard**

Changes:
- Replace hardcoded ring colors (`green`, `orange`, `blue`) with `var(--accent)`
- Add `ghost-border` class to the image
- Update hover from colored ring to subtle brightness increase + scale
- Background: `var(--surface-container)` for the card wrapper
- Ensure 2:3 aspect ratio with 6px radius

- [ ] **Step 2: Update StarRating**

Changes:
- Replace hardcoded `#00E054` with `var(--accent)` for filled stars
- Replace hardcoded `#535353` with `var(--text-muted)` for empty stars
- This makes ratings use the module accent (green for films, orange for books)

- [ ] **Step 3: Update Modal**

Changes:
- Background: `var(--surface-container-highest)` (was `#1E2229`)
- Border: `ghost-border` class (was `border-white/[0.08]`)
- Add `shadow-ambient` class
- Title: `font-headline text-headline-sm`
- Border radius: keep `rounded-modal` (16px)

- [ ] **Step 4: Verify all shared components**

```bash
cd apps/noaudience && npm run dev
```

Navigate to `/films` — poster cards and star ratings should use the new tokens. Open any modal — should have darker bg with ambient shadow.

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/components/PosterCard.svelte packages/core/src/components/StarRating.svelte packages/core/src/components/Modal.svelte
git commit -m "feat: update PosterCard, StarRating, Modal to use design system tokens"
```

---

## Task 8: Home Dashboard — Full Rebuild

**Files:**
- Modify: `apps/noaudience/src/routes/+page.svelte` (currently 5 lines — full rewrite)

The home page currently shows just a title and tagline. Rebuild it with 6 sections per the spec.

- [ ] **Step 1: Write the Home Dashboard page**

The page needs to query multiple tables. Structure:

Use the existing DB wrapper functions — do NOT write raw Drizzle queries in page components.

```svelte
<script lang="ts">
  import { getFilmStats, getWatchlist, getRecentLogs } from '$lib/films/db';
  import { getCurrentlyReading, getAllBooks, getBooksReadInYear } from '$lib/books/db';
  import { db } from '$lib/db';
  import { writings } from '@noaudience/core/db/schema';
  import { desc } from 'drizzle-orm';
  import StatsPanel from '@noaudience/core/components/StatsPanel.svelte';
  import PosterCard from '@noaudience/core/components/PosterCard.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';

  let filmStats = $state<any>(null);
  let recentLogs = $state<any[]>([]);
  let watchlistFilms = $state<any[]>([]);
  let currentlyReading = $state<any[]>([]);
  let recentDrafts = $state<any[]>([]);
  let bookCount = $state(0);

  $effect(() => {
    loadDashboard();
  });

  async function loadDashboard() {
    const [stats, logs, watchlist, reading, books, drafts] = await Promise.all([
      getFilmStats(),
      getRecentLogs(5),
      getWatchlist({ limit: 6 }),
      getCurrentlyReading(),
      getAllBooks(),
      db.select().from(writings).orderBy(desc(writings.updatedAt)).limit(3),
    ]);

    filmStats = stats;
    recentLogs = logs;
    watchlistFilms = watchlist;
    currentlyReading = reading;
    bookCount = books.length;
    recentDrafts = drafts;
  }
</script>

<div class="space-y-12">
  <!-- Welcome Header -->
  <header>
    <h1 class="font-headline text-display-sm text-text-primary">Your Archive</h1>
    <p class="text-body-lg text-text-secondary mt-2">Does every hobby need an audience?</p>
  </header>

  <!-- At a Glance -->
  <section>
    <StatsPanel stats={[
      { label: 'Total Archive', value: (filmStats?.totalFilms ?? 0) + bookCount, icon: 'inventory_2' },
      { label: 'Films', value: filmStats?.totalFilms ?? 0, icon: 'movie' },
      { label: 'Books', value: bookCount, icon: 'menu_book' },
      { label: 'Writings', value: recentDrafts.length, icon: 'edit_note' },
    ]} />
  </section>

  <!-- Recent Activity -->
  <section>
    <h2 class="font-headline text-headline-sm text-text-primary mb-6">Recent Activity</h2>
    {#if recentActivity.length === 0}
      <EmptyState icon="history" headline="No activity yet" description="Start logging films and books to see your timeline here." />
    {:else}
      <div class="space-y-3">
        {#each recentActivity as item}
          <div class="flex items-center gap-4 p-3 rounded-card bg-surface-container-low hover:bg-surface-container transition-colors">
            <span class="icon text-text-muted">movie</span>
            <span class="text-body-md text-text-primary flex-1">{item.title}</span>
            {#if item.rating}
              <span class="text-label-md text-accent">{item.rating}★</span>
            {/if}
            <span class="text-label-md text-text-muted">{item.date}</span>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Watchlist Queue -->
  <section>
    <h2 class="font-headline text-headline-sm text-text-primary mb-6">Watchlist</h2>
    {#if watchlistFilms.length === 0}
      <EmptyState icon="playlist_add" headline="Your queue is empty" description="Add films to your watchlist to see them here." />
    {:else}
      <div class="grid gap-4" style="grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));">
        {#each watchlistFilms as item}
          <PosterCard
            src={item.films.posterPath}
            alt={item.films.title}
            title={item.films.title}
            subtitle={item.films.year?.toString()}
          />
        {/each}
      </div>
    {/if}
  </section>

  <!-- Currently Reading -->
  <section>
    <h2 class="font-headline text-headline-sm text-text-primary mb-6">Currently Reading</h2>
    {#if currentlyReading.length === 0}
      <EmptyState icon="menu_book" headline="Nothing on the nightstand" description="Add a book and mark it as reading to see it here." />
    {:else}
      <div class="flex gap-6 overflow-x-auto pb-2">
        {#each currentlyReading as item}
          <a href="/books/{item.book.id}" class="flex-shrink-0 w-48">
            <BookCard
              title={item.book.title}
              author={item.book.author}
              coverPath={item.book.coverPath}
              progress={item.progress?.progressValue}
              pageCount={item.book.pageCount}
            />
          </a>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Writing Drafts -->
  <section>
    <h2 class="font-headline text-headline-sm text-text-primary mb-6">Writing</h2>
    {#if recentDrafts.length === 0}
      <EmptyState icon="edit_note" headline="Start writing" description="Your drafts and journal entries will appear here." />
    {:else}
      <div class="space-y-3">
        {#each recentDrafts as draft}
          <a href="/writing/{draft.id}" class="flex items-center gap-4 p-4 rounded-card bg-surface-container-low hover:bg-surface-container transition-colors">
            <span class="icon text-text-muted">description</span>
            <div class="flex-1">
              <span class="text-body-md text-text-primary">{draft.title}</span>
              {#if draft.wordCount}
                <span class="text-label-md text-text-muted ml-2">{draft.wordCount} words</span>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </section>
</div>
```

Note: This is the structural template. The implementing agent should adapt based on exact import paths and the DB query patterns already established in the films/books pages.

- [ ] **Step 2: Verify the dashboard loads**

```bash
cd apps/noaudience && npm run dev
```

Navigate to `/`. Should see the stats panel, sections with empty states (if no data) or populated content.

- [ ] **Step 3: Commit**

```bash
git add apps/noaudience/src/routes/+page.svelte
git commit -m "feat: rebuild Home Dashboard with stats, activity, watchlist, and writing sections"
```

---

## Task 9: Films Page — FeaturedReview & DiaryList Components

**Files:**
- Create: `apps/noaudience/src/lib/components/films/FeaturedReview.svelte`
- Create: `apps/noaudience/src/lib/components/films/DiaryList.svelte`

- [ ] **Step 1: Create FeaturedReview component**

Hero editorial block showing the latest film diary entry.

```svelte
<!-- apps/noaudience/src/lib/components/films/FeaturedReview.svelte -->
<script lang="ts">
  let { title, year, rating, review, posterPath, watchedDate }: {
    title: string;
    year?: number;
    rating?: number;
    review?: string;
    posterPath?: string;
    watchedDate?: string;
  } = $props();
</script>

<div class="relative rounded-card overflow-hidden bg-surface-container-low">
  <!-- Backdrop blur of poster -->
  {#if posterPath}
    <div class="absolute inset-0 opacity-20 blur-2xl" style="background-image: url({posterPath}); background-size: cover;"></div>
  {/if}
  <div class="relative flex gap-8 p-8">
    {#if posterPath}
      <img src={posterPath} alt={title} class="w-32 rounded-chip ghost-border object-cover" style="aspect-ratio: 2/3;" />
    {/if}
    <div class="flex flex-col gap-3 flex-1">
      <span class="text-label-md text-text-muted uppercase tracking-wider">Latest Review</span>
      <h2 class="font-headline text-headline-lg text-text-primary">
        {title}
        {#if year}<span class="text-text-secondary font-sans text-title-sm ml-2">{year}</span>{/if}
      </h2>
      {#if rating}
        <div class="flex items-center gap-1 text-accent">
          {#each Array(Math.floor(rating)) as _}
            <span class="icon text-[18px]">star</span>
          {/each}
          {#if rating % 1 >= 0.5}
            <span class="icon text-[18px]">star_half</span>
          {/if}
        </div>
      {/if}
      {#if review}
        <p class="font-headline text-body-lg text-text-secondary italic leading-relaxed line-clamp-3">"{review}"</p>
      {/if}
      {#if watchedDate}
        <span class="text-label-md text-text-muted">{watchedDate}</span>
      {/if}
    </div>
  </div>
</div>
```

- [ ] **Step 2: Create DiaryList component**

Vertical list of recent film log entries.

```svelte
<!-- apps/noaudience/src/lib/components/films/DiaryList.svelte -->
<script lang="ts">
  import StarRating from '@noaudience/core/components/StarRating.svelte';

  type DiaryEntry = {
    id: number;
    title: string;
    year?: number;
    posterPath?: string;
    rating?: number;
    review?: string;
    watchedDate?: string;
  };

  let { entries }: { entries: DiaryEntry[] } = $props();
</script>

<div class="space-y-2">
  {#each entries as entry}
    <div class="flex items-center gap-4 p-4 rounded-card bg-surface-container-low hover:bg-surface-container transition-colors duration-150">
      {#if entry.posterPath}
        <img src={entry.posterPath} alt={entry.title} class="w-10 rounded-sm ghost-border object-cover" style="aspect-ratio: 2/3;" />
      {:else}
        <div class="w-10 bg-surface-container-high rounded-sm" style="aspect-ratio: 2/3;"></div>
      {/if}
      <div class="flex-1 min-w-0">
        <span class="font-headline text-title-sm text-text-primary">{entry.title}</span>
        {#if entry.year}
          <span class="text-label-md text-text-muted ml-1">{entry.year}</span>
        {/if}
        {#if entry.review}
          <p class="text-label-md text-text-secondary truncate mt-0.5">{entry.review}</p>
        {/if}
      </div>
      {#if entry.rating}
        <StarRating value={entry.rating} readonly size="sm" />
      {/if}
      {#if entry.watchedDate}
        <span class="text-label-md text-text-muted whitespace-nowrap">{entry.watchedDate}</span>
      {/if}
    </div>
  {/each}
</div>
```

- [ ] **Step 3: Commit**

```bash
git add apps/noaudience/src/lib/components/films/
git commit -m "feat: add FeaturedReview and DiaryList film components"
```

---

## Task 10: Films Home — Page Restyle

**Files:**
- Modify: `apps/noaudience/src/routes/films/+page.svelte` (275 lines)

- [ ] **Step 1: Restructure Films page**

Rewrite the page to use the new components and match Stitch layout. The page currently has: header with search, Recently Watched grid, Diary list, Watchlist grid, and a LogModal. Restructure to:

1. **FeaturedReview** hero (latest diary entry)
2. **StatsPanel** (total films, monthly log count)
3. **DiaryList** (latest 5 entries heading "Latest in Diary")
4. **Watchlist** with FilterTabs (poster grid)

Key changes:
- Import new components: `FeaturedReview`, `DiaryList`, `StatsPanel`, `FilterTabs`, `EmptyState`
- Replace inline heading styles with `font-headline text-headline-sm`
- Replace inline grid styles with Tailwind grid classes
- Replace the search header with just a "Log Film" button (search is now in HeaderBar)
- **Use existing DB wrapper functions** from `$lib/films/db.ts` — do NOT write raw Drizzle queries
- Add filter tabs for watchlist genres
- Use `text-text-*` and `bg-surface-*` Tailwind classes everywhere

Preserve: the LogModal integration and TMDB search functionality — just restyle them.

- [ ] **Step 2: Wire up data using existing DB wrappers**

```ts
import { getRecentLogs, getWatchlist, getFilmStats } from '$lib/films/db';

// These functions already exist and return properly typed results
const [logs, watchlist, stats] = await Promise.all([
  getRecentLogs(5),       // returns logs with film data joined
  getWatchlist({ limit: 20 }),  // returns watchlist with film data
  getFilmStats(),         // returns { totalFilms, totalHours, averageRating }
]);

// Featured review = first entry from getRecentLogs with a review
const featured = logs.find(l => l.review);
```

- [ ] **Step 4: Verify Films page**

```bash
cd apps/noaudience && npm run dev
```

Navigate to `/films`. Should see: featured review hero (or empty state), stats panel, diary list, watchlist grid with filter tabs. All using new design tokens — dark surfaces, Newsreader headings, green accent.

- [ ] **Step 5: Commit**

```bash
git add apps/noaudience/src/routes/films/+page.svelte
git commit -m "feat: restyle Films home to match Stitch — featured review, stats, diary, filtered watchlist"
```

---

## Task 11: Books Page — BookCard & ReadingProgress Components

**Files:**
- Create: `apps/noaudience/src/lib/components/books/BookCard.svelte`
- Create: `apps/noaudience/src/lib/components/books/ReadingProgress.svelte`

- [ ] **Step 1: Create ReadingProgress component**

Progress bar with percentage for currently reading books.

```svelte
<!-- apps/noaudience/src/lib/components/books/ReadingProgress.svelte -->
<script lang="ts">
  let { current, total, label }: {
    current: number;
    total: number;
    label?: string;
  } = $props();

  let percentage = $derived(total > 0 ? Math.round((current / total) * 100) : 0);
</script>

<div class="flex flex-col gap-1.5">
  <div class="flex justify-between items-center">
    {#if label}
      <span class="text-label-sm text-text-secondary">{label}</span>
    {/if}
    <span class="text-label-sm text-text-muted">{percentage}%</span>
  </div>
  <div class="h-1.5 rounded-pill bg-surface-container-high overflow-hidden">
    <div
      class="h-full rounded-pill transition-all duration-300"
      style="width: {percentage}%; background-color: var(--accent);"
    ></div>
  </div>
</div>
```

- [ ] **Step 2: Create BookCard component**

Book cover with metadata and optional progress.

```svelte
<!-- apps/noaudience/src/lib/components/books/BookCard.svelte -->
<script lang="ts">
  import ReadingProgress from './ReadingProgress.svelte';

  let { title, author, coverPath, rating, progress, pageCount, href }: {
    title: string;
    author?: string;
    coverPath?: string;
    rating?: number;
    progress?: number;
    pageCount?: number;
    href?: string;
  } = $props();
</script>

<a href={href ?? '#'} class="group flex flex-col gap-3">
  <!-- Cover -->
  <div class="relative rounded-card overflow-hidden ghost-border" style="aspect-ratio: 2/3;">
    {#if coverPath}
      <img src={coverPath} alt={title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    {:else}
      <div class="w-full h-full bg-surface-container-high flex items-center justify-center">
        <span class="icon text-[40px] text-text-muted">menu_book</span>
      </div>
    {/if}
  </div>

  <!-- Info -->
  <div class="flex flex-col gap-1">
    <span class="font-headline text-title-sm text-text-primary group-hover:text-accent transition-colors line-clamp-1">{title}</span>
    {#if author}
      <span class="text-label-md text-text-secondary line-clamp-1">{author}</span>
    {/if}
    {#if progress !== undefined && pageCount}
      <ReadingProgress current={progress} total={pageCount} />
    {/if}
  </div>
</a>
```

- [ ] **Step 3: Commit**

```bash
git add apps/noaudience/src/lib/components/books/
git commit -m "feat: add BookCard and ReadingProgress components for Books page"
```

---

## Task 12: Books Home — Page Restyle

**Files:**
- Modify: `apps/noaudience/src/routes/books/+page.svelte` (219 lines)

- [ ] **Step 1: Restructure Books page**

Rewrite to match Stitch layout. Current page has: header, Currently Reading, Recently Read, Want to Read sections. Restructure to:

1. **Currently Reading** — horizontal BookCards with progress bars (from `book_shelf_assignments` + `book_progress`)
2. **StatsPanel** — books read this year, total pages, reading streak (from `book_reviews`, `reading_challenges`)
3. **QuoteBlock** — latest book review excerpt (from `book_reviews`)
4. **Full Catalog** — grid of BookCards with rating, filter tabs by genre

Key changes:
- Import: `BookCard`, `StatsPanel`, `QuoteBlock`, `FilterTabs`, `EmptyState`
- Replace inline heading styles with `font-headline text-headline-sm`
- **Use existing DB wrapper functions** from `$lib/books/db.ts` — do NOT write raw Drizzle queries

- [ ] **Step 2: Wire up data using existing DB wrappers**

```ts
import {
  getCurrentlyReading, getAllBooks, getBooksReadInYear,
  getTotalPagesRead, getAverageRating, getAllReviews,
  getChallenge, getWantToRead, getRecentlyRead
} from '$lib/books/db';

const currentYear = new Date().getFullYear();
const [reading, booksThisYear, totalPages, reviews, challenge, allBooks] = await Promise.all([
  getCurrentlyReading(),     // returns { book, progress }[]
  getBooksReadInYear(currentYear),  // returns Book[]
  getTotalPagesRead(),       // returns number
  getAllReviews(),           // returns BookReview[]
  getChallenge(currentYear), // returns { year, goal }
  getAllBooks(),             // returns Book[]
]);

// Latest review with text for QuoteBlock
const latestReview = reviews.find(r => r.review);
```

- [ ] **Step 3: Build the page sections**

Use the data from Step 2 to populate:
1. Currently Reading → from `reading` (getCurrentlyReading returns book + progress)
2. Stats → `booksThisYear.length` / `challenge?.goal`, `totalPages`
3. QuoteBlock → from `latestReview`
4. Full Catalog → from `allBooks` with FilterTabs by genre

- [ ] **Step 4: Verify Books page**

```bash
cd apps/noaudience && npm run dev
```

Navigate to `/books`. Should see: currently reading cards with orange progress bars, stats panel, latest review quote, full catalog grid. All with orange accent (via `data-module="books"`).

- [ ] **Step 5: Commit**

```bash
git add apps/noaudience/src/routes/books/+page.svelte
git commit -m "feat: restyle Books home to match Stitch — reading progress, stats, catalog grid"
```

---

## Task 13: Modal Restyle — Log Film & Add Book

**Files:**
- Modify: `apps/noaudience/src/routes/films/+page.svelte` (modal section)
- Modify: `apps/noaudience/src/routes/books/+page.svelte` (modal section)

- [ ] **Step 1: Update Log Film modal content**

The `Modal.svelte` wrapper was already restyled in Task 7. Now update the modal *content* inside the Films page:
- Use `font-headline` for the film title in search results
- Form inputs: `bg-surface-container-low` background, no borders, bottom-border focus state in `var(--accent)`
- Tags input: chips use `bg-surface-container-high text-label-sm`
- "Watched before" toggle: use accent color
- Submit button: `bg-accent text-text-on-accent`

- [ ] **Step 2: Update Add Book modal content**

Same pattern:
- Form inputs styled consistently
- Status selector uses accent-colored active state
- Star rating already uses `var(--accent)` from Task 7
- Submit button: `bg-accent text-text-on-accent`

- [ ] **Step 3: Verify both modals**

Open Log Film modal on `/films`, Add Book modal on `/books`. Check: dark surface backgrounds, no borders on inputs, accent-colored focus states, serif title.

- [ ] **Step 4: Commit**

```bash
git add apps/noaudience/src/routes/films/+page.svelte apps/noaudience/src/routes/books/+page.svelte
git commit -m "feat: restyle Log Film and Add Book modals to match Stitch design"
```

---

## Task 14: Final Polish & Verification

**Files:**
- Potentially any of the above

- [ ] **Step 1: Full visual walkthrough**

Navigate through all restyled pages in order:
1. `/` — Home Dashboard: stats, activity, watchlist, writing
2. `/films` — Featured review, stats, diary, watchlist with filters
3. `/books` — Currently reading, stats, quote, catalog

Check for:
- Consistent use of `font-headline` (Newsreader) on all headings
- No hardcoded colors (search for `#00E054`, `#FF8000`, `#40BCF4` in components — should be `var(--accent)` or semantic tokens)
- No visible 1px borders used for layout separation
- Glass-morphism on header bar and sidebar hover states
- Module accent switching: green on home/films, orange on books
- Empty states render gracefully with CTAs
- Page transitions (subtle fade between routes)
- **Responsive:** StatsPanel grid collapses from 4 to 2 columns below 1100px (add `@media (max-width: 1100px)` or Tailwind `lg:` breakpoint)
- **Accessibility:** Focus rings use `outline: 2px solid var(--accent); outline-offset: 2px` on interactive elements
- **Old token cleanup:** Replace any remaining `var(--bg-base)`, `var(--bg-surface)`, `var(--bg-elevated)`, `var(--bg-inset)` in `+layout.svelte` and other files
- **GlobalSearch integration:** Ensure HeaderBar's search button toggles the existing GlobalSearch component (use shared `$state` or bind)

- [ ] **Step 2: Fix any remaining old-token references**

Search for old CSS variable names that should be replaced:
```bash
grep -r "bg-base\|bg-surface\|bg-elevated\|bg-inset\|text-primary\|text-secondary" --include="*.svelte" apps/noaudience/src/ packages/core/src/
```

Replace any remaining `--bg-base` → `--surface-base`, `--bg-surface` → `--surface-container`, etc.

- [ ] **Step 3: Test with empty database**

Reset the database (or use a fresh profile) and verify all pages show empty states correctly, no crashes from null data.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: final polish — remove old token references, verify empty states"
```

---

## Execution Notes

- **DB bridge constraint:** Never use `.returning()` with Drizzle queries. Do insert + separate SELECT.
- **JSON columns:** `films.genres`, `films.cast`, `films.crew`, `books.genres`, `writings.tags` are JSON. Drizzle calls `JSON.parse` on these.
- **Import paths:** Shared components use `@noaudience/core/components/...` (mapped in tsconfig). App components use `$lib/components/...`.
- **Svelte 5 runes:** Use `$state`, `$derived`, `$effect`, `$props()`. No `export let` or `$:` reactive statements.
- **Stitch reference:** Use Stitch screenshots as visual reference. Do NOT copy Stitch HTML directly — it's static and uses different class names.
