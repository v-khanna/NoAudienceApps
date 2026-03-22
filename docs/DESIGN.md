# Design System

NoAudience uses a dark theme built from Letterboxd's color palette. The goal is a UI that feels cinematic and premium without being flashy.

---

## Colors

### Backgrounds
| Role | Hex | Usage |
|------|-----|-------|
| Page | `#14181C` | Main background (Letterboxd's dark blue-gray) |
| Surface | `#1B2028` | Cards, panels |
| Elevated | `#2C3440` | Hover states, dropdowns, tooltips |
| Sidebar | `#0F1318` | One shade darker than page |

### Accents
| Role | Hex | Usage |
|------|-----|-------|
| Green | `#00E054` | Completed actions: watched, read, finished |
| Orange | `#FF8000` | Queued actions: watchlist, want to read, in progress |
| Blue | `#40BCF4` | Links, info, navigation highlights |

### Text
| Role | Hex | Usage |
|------|-----|-------|
| Primary | `#FFFFFF` | Titles, headings (use sparingly) |
| Body | `#E0E0E0` | Paragraphs, descriptions |
| Secondary | `#99AABB` | Metadata, captions, timestamps |
| Muted | `#535353` | Disabled states, placeholders |

### Borders
| Role | Value |
|------|-------|
| Default | `rgba(255, 255, 255, 0.06)` |
| Hover | `rgba(255, 255, 255, 0.12)` |

---

## Typography

**Font**: Inter (variable weight). Free, screen-optimized, works well at small sizes on dark backgrounds.

**Reading/writing contexts**: Georgia or Charter (serif) for article reader view and the writing editor body text. Serif at 18px with 1.65 line-height for long-form reading.

| Element | Size | Weight | Line height |
|---------|------|--------|-------------|
| Page title | 28px | 700 | 1.2 |
| Section header | 22px | 600 | 1.3 |
| Card title | 14px | 600 | 1.3 |
| Body | 15px | 400 | 1.6 |
| Metadata | 12px | 500 | 1.4 |
| Small label | 11px | 500 | 1.3 |

Dark mode adjustments: increase font weight by one step vs light mode, add +0.01em letter-spacing, use `#E0E0E0` (not white) for body text.

---

## Spacing

8px base grid: `4 — 8 — 12 — 16 — 24 — 32 — 48 — 64 — 96`

---

## Components

### Poster/cover cards
- Aspect ratio: 2:3
- Border radius: 6px
- Hover: translateY(-4px), scale(1.02), box-shadow 0 8px 24px rgba(0,0,0,0.6)
- Transition: 300ms cubic-bezier(0.4, 0, 0.2, 1)

### Poster hover borders (Films)
- Green outline: watched
- Orange outline: in watchlist
- Blue outline: default hover

### Buttons
- Rectangular: 6px radius
- Pill: 999px radius
- Primary: green background, white text
- Secondary: transparent, border rgba(255,255,255,0.12), white text

### Modals
- Backdrop: rgba(0,0,0,0.6) with backdrop-filter blur(8px)
- Surface: #1E2229, border rgba(255,255,255,0.08), radius 16px
- Shadow: 0 24px 48px rgba(0,0,0,0.5)

### Inputs
- Background: #1B2028
- Border: rgba(255,255,255,0.06), radius 6px
- Focus: border-color #40BCF4

### Tags/chips
- Background: #2C3440
- Text: #E0E0E0
- Radius: 4px
- Padding: 4px 8px

### Sidebar
- Width: 240px expanded, 64px collapsed
- Item height: 40px
- Active state: white text + 3px accent-colored left bar
- Hover: rgba(255,255,255,0.07) background

---

## Charts and stats

- Bar colors: accent green at 70% opacity
- Grid lines: #333333, dotted
- Axis labels: #A0A0A0, 11-12px, weight 500
- Progress bars: 6px height, track rgba(255,255,255,0.08), fill gradient from green to blue

---

## Poster grid

```css
display: grid;
grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
gap: 16px;
```

Responsive: 3 columns on mobile, 5-7 on desktop, 7-10 on wide screens.

---

## Principles

1. Dark grays, not pure black. `#14181C` gives depth. `#000000` looks flat.
2. Off-white text for body. `#FFFFFF` only for titles. Reduces eye strain.
3. Subtle borders define edges. Shadows are nearly invisible on dark backgrounds — use borders and surface elevation instead.
4. Accent colors are used sparingly. Buttons, status indicators, active states. Never large backgrounds.
5. Generous whitespace. Premium means breathing room.
6. Smooth animations. 200-300ms, ease-out curves. Every hover and transition should feel deliberate.
7. Poster/cover images are the primary visual element. The UI stays out of their way.
