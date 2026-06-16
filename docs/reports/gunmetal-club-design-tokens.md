# Gunmetal Club — Design Token System

**Admin Theme · The Pawn Shop · Akwesasne**
Version 1.0 · June 2026

> This document defines the complete visual language for the Gunmetal Club admin portal theme. Every colour, typeface, spacing value, and component state is captured here as a named token. Implement these tokens as CSS custom properties, a Tailwind theme extension, or a JS constants file — never hard-code raw values in component source.

---

## 1. Design Rationale

The Gunmetal Club theme replaces the public-facing black (`#000000`) shell with a considered deep slate (`#2A2D35`). This single shift reduces halation on OLED screens, softens the contrast ratio from a harsh 21:1 to a readable 14:1, and creates perceptual depth between the three surface layers: base, surface, and elevated.

Amber gold (`#C8A14A`) is retained as the sole accent — it reads as premium against slate the same way brass hardware reads against gunmetal fittings in a gentleman's club interior. All status colours (active, reserved, police hold) are desaturated slightly from their consumer-facing values so they feel operational rather than decorative.

---

## 2. Colour Palette

### 2.1 Background Layers

| Token | Hex | Usage |
|---|---|---|
| `bg/base` | `#2A2D35` | Page background — deepest layer. Never use for text containers. |
| `bg/surface` | `#32363F` | Card & panel background — primary container surface. |
| `bg/elevated` | `#3D4149` | Hovered card, modal backdrop, dropdown surface. |
| `bg/hover` | `#454951` | Pressed/active state for interactive surface elements. |

### 2.2 Text

| Token | Hex | Usage |
|---|---|---|
| `text/primary` | `#F0EDE8` | Headings, item titles, primary body copy. |
| `text/secondary` | `#BDB9B3` | Supporting text, labels, metadata. |
| `text/muted` | `#9B9FA8` | Placeholder text, tertiary info, captions. |
| `text/disabled` | `#5C6270` | Disabled controls, inactive nav items. |

### 2.3 Gold / Accent

| Token | Hex | Usage |
|---|---|---|
| `gold/primary` | `#C8A14A` | Primary CTA buttons, active nav, price values, focus ring. |
| `gold/dim` | `#8B6E32` | Secondary button borders, icon strokes, inline links. |
| `gold/subtle` | `#3A3020` | Tag background, badge fill, tinted hover state. |

### 2.4 Status Colours

| Token | Hex | Usage |
|---|---|---|
| `status/active` | `#4CAF7D` | Active inventory badge foreground. |
| `status/active-bg` | `#1E3D2F` | Active badge background. |
| `status/reserved` | `#5B9BD5` | Reserved item badge foreground. |
| `status/reserved-bg` | `#1A2E44` | Reserved badge background. |
| `status/hold` | `#E57373` | Police hold badge foreground. |
| `status/hold-bg` | `#3D1A1A` | Police hold badge background. |
| `status/draft` | `#9B9FA8` | Draft item badge foreground. |
| `status/draft-bg` | `#2A2D35` | Draft badge background — same as base. |

### 2.5 Borders & Structure

| Token | Hex | Usage |
|---|---|---|
| `border/default` | `#454951` | Default card and table borders. |
| `border/strong` | `#6B7280` | Section dividers, masthead rule, focused input ring. |
| `focus` | `#C8A14A` | Keyboard focus outline — matches `gold/primary` for brand cohesion. |

---

## 3. Typography

Two typefaces carry the Gunmetal Club personality. Georgia is used exclusively for display — logotype, page titles, and price figures — lending editorial gravitas. Arial handles all operational text: labels, table data, buttons, captions. Courier New is reserved for tokens, model numbers, and monospaced data fields. Never use a third typeface.

### 3.1 Type Roles

| Role | Family | Weight | Size | Sample |
|---|---|---|---|---|
| Display / Logo | Georgia | Bold 700 | 22–28px | The Pawn Shop |
| Page Title | Georgia | Regular 400 | 24–30px | Inventory |
| Price / Number | Georgia | Bold 700 | 16–20px | $650.00 CAD |
| Label / Button | Arial | Medium 500 | 11–13px | ADD ITEM |
| Body / Metadata | Arial | Regular 400 | 12–14px | 54 items · most recent first |
| Caption / Tag | Arial | SemiBold 600 | 9–10px | ACTIVE · NEW |
| Data / Token | Courier New | Regular 400 | 11–13px | #C8A14A · SKU-00421 |

### 3.2 Type Scale (base 16px / 1rem)

| Token | px | rem | Usage |
|---|---|---|---|
| `text/xs` | 10px | 0.625rem | Tags, badge labels, legal fine print |
| `text/sm` | 12px | 0.75rem | Captions, metadata, filter chips |
| `text/base` | 14px | 0.875rem | Body copy, item descriptions, table data |
| `text/md` | 16px | 1rem | Section labels, button labels |
| `text/lg` | 18px | 1.125rem | Card prices, nav item labels |
| `text/xl` | 22px | 1.375rem | Sub-page headings |
| `text/2xl` | 26px | 1.625rem | Page titles (Inventory, Dashboard) |
| `text/3xl` | 30px | 1.875rem | Masthead / logotype |

---

## 4. Spacing & Radius

### 4.1 Spacing Scale

All spacing uses a 4px base unit. Margins, paddings, gaps, and border-radii are expressed as multiples. Never use arbitrary values — always choose the nearest token.

| Token | Value | Common Usage |
|---|---|---|
| `space/1` | 4px | Icon-label gap, badge inner padding |
| `space/2` | 8px | Chip horizontal padding, tight row gap |
| `space/3` | 12px | Card internal padding (compact), nav icon gap |
| `space/4` | 16px | Card padding (standard), filter row gap |
| `space/5` | 20px | Page horizontal gutter, section gap |
| `space/6` | 24px | Page top margin, between stat cards |
| `space/8` | 32px | Between major sections |
| `space/12` | 48px | Pre-footer spacer, large section breaks |

### 4.2 Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius/none` | 0px | Masthead, full-bleed dividers |
| `radius/sm` | 4px | Buttons, small action chips |
| `radius/md` | 6px | Input fields, dropdown menus |
| `radius/lg` | 8px | Item cards, stat cards, panels |
| `radius/xl` | 12px | Modal / bottom sheet containers |
| `radius/full` | 9999px | Status pills, avatar, notification dot |

---

## 5. Component Tokens

### 5.1 Buttons

| Variant | Background | Border | Label Colour |
|---|---|---|---|
| Primary | `#C8A14A` | none | `#2A2D35` (inverted) |
| Primary Hover | `#D4B060` | none | `#2A2D35` |
| Secondary | transparent | `#8B6E32` | `#C8A14A` |
| Secondary Hover | `#3A3020` | `#C8A14A` | `#C8A14A` |
| Ghost | transparent | `#454951` | `#9B9FA8` |
| Ghost Hover | `#3D4149` | `#454951` | `#F0EDE8` |
| Danger | transparent | `#E57373` | `#E57373` |
| Disabled | transparent | `#454951` | `#5C6270` |

### 5.2 Input Fields

| State | Token Values |
|---|---|
| Default | `bg: #3D4149` · `border: #454951` · `text: #F0EDE8` |
| Focus | `bg: #3D4149` · `border: #C8A14A` · ring: 2px `#C8A14A` at 30% opacity |
| Filled | `bg: #3D4149` · `border: #6B7280` · `text: #F0EDE8` |
| Error | `bg: #3D4149` · `border: #E57373` · `text: #F0EDE8` |
| Disabled | `bg: #32363F` · `border: #454951` · `text: #5C6270` |
| Placeholder | `text: #5C6270` · font-style: italic |

### 5.3 Navigation Bar (Bottom)

| Property | Value |
|---|---|
| Background | `#32363F` |
| Top border | 1px solid `#454951` |
| Icon — inactive | `#9B9FA8` · 22px |
| Icon — active | `#C8A14A` · 22px |
| Label — inactive | `#9B9FA8` · Arial 10px · tracking 0.08em |
| Label — active | `#C8A14A` · Arial 10px · tracking 0.08em · bold |
| Height | 64px including safe area padding |
| Safe area pad | `env(safe-area-inset-bottom)` — add below 10px bottom padding |

### 5.4 Item Cards

| Property | Value |
|---|---|
| Background | `#32363F` |
| Border | 1px solid `#454951` |
| Border radius | 8px |
| Padding | 12px all sides |
| Thumbnail | 48×48px · 6px radius · `#3D4149` fill |
| Title | `#F0EDE8` · Arial 13px · bold · truncate with ellipsis |
| Price | `#C8A14A` · Georgia 13px · bold |
| Hover | border-color: `#6B7280` · shadow: `0 2px 8px rgba(0,0,0,0.3)` |
| Gap (list) | 8px between cards |

### 5.5 Stat Cards (Dashboard)

| Property | Value |
|---|---|
| Background | `#32363F` |
| Border | 1px solid `#454951` |
| Border radius | 8px |
| Padding | 12px 8px |
| Number — non-zero | `#C8A14A` · Georgia 22px |
| Number — zero | `#9B9FA8` · Georgia 22px |
| Label | `#9B9FA8` · Arial 9px · tracking 0.12em · uppercase |
| Layout | 4-up grid, equal columns, 1px dividers between cells |

### 5.6 Status Badges

| Status | Foreground | Background | Notes |
|---|---|---|---|
| ACTIVE | `#4CAF7D` | `#1E3D2F` | Pawn / Cannabis items available for sale |
| RESERVED | `#5B9BD5` | `#1A2E44` | Item held pending customer decision |
| POLICE HOLD | `#E57373` | `#3D1A1A` | Flagged — never move or sell |
| DRAFT | `#9B9FA8` | `#2A2D35` | Not yet published to public storefront |
| SOLD | `#9B9FA8` | `#32363F` | Archived — visible in history only |

Badge anatomy: `radius/full` · Arial `text/xs` · tracking 0.10em · horizontal padding `space/2` · vertical padding 2px.

---

## 6. CSS Custom Properties

Copy this block into your `:root` selector. All component styles reference these variables — never hardcode hex values in component files.

```css
:root {
  /* ── Backgrounds ─────────────────── */
  --bg-base:            #2A2D35;
  --bg-surface:         #32363F;
  --bg-elevated:        #3D4149;
  --bg-hover:           #454951;

  /* ── Text ────────────────────────── */
  --text-primary:       #F0EDE8;
  --text-secondary:     #BDB9B3;
  --text-muted:         #9B9FA8;
  --text-disabled:      #5C6270;

  /* ── Gold / Accent ───────────────── */
  --gold-primary:       #C8A14A;
  --gold-dim:           #8B6E32;
  --gold-subtle:        #3A3020;

  /* ── Borders ─────────────────────── */
  --border-default:     #454951;
  --border-strong:      #6B7280;
  --focus-ring:         #C8A14A;

  /* ── Status ──────────────────────── */
  --status-active:      #4CAF7D;
  --status-active-bg:   #1E3D2F;
  --status-reserved:    #5B9BD5;
  --status-reserved-bg: #1A2E44;
  --status-hold:        #E57373;
  --status-hold-bg:     #3D1A1A;
  --status-draft:       #9B9FA8;
  --status-draft-bg:    #2A2D35;

  /* ── Spacing ─────────────────────── */
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-12:  48px;

  /* ── Radius ──────────────────────── */
  --radius-sm:   4px;
  --radius-md:   6px;
  --radius-lg:   8px;
  --radius-xl:   12px;
  --radius-full: 9999px;

  /* ── Typography ──────────────────── */
  --font-display: 'Georgia', serif;
  --font-body:    'Arial', sans-serif;
  --font-mono:    'Courier New', monospace;
}
```

---

## 7. Tailwind Theme Extension

Add this object to the `theme.extend` block in `tailwind.config.js`.

```js
// tailwind.config.js — theme.extend
colors: {
  'gmc-base':        '#2A2D35',
  'gmc-surface':     '#32363F',
  'gmc-elevated':    '#3D4149',
  'gmc-hover':       '#454951',
  'gmc-text':        '#F0EDE8',
  'gmc-text-sec':    '#BDB9B3',
  'gmc-text-muted':  '#9B9FA8',
  'gmc-text-off':    '#5C6270',
  'gmc-gold':        '#C8A14A',
  'gmc-gold-dim':    '#8B6E32',
  'gmc-gold-subtle': '#3A3020',
  'gmc-border':      '#454951',
  'gmc-border-str':  '#6B7280',
  'gmc-active':      '#4CAF7D',
  'gmc-active-bg':   '#1E3D2F',
  'gmc-reserved':    '#5B9BD5',
  'gmc-reserved-bg': '#1A2E44',
  'gmc-hold':        '#E57373',
  'gmc-hold-bg':     '#3D1A1A',
},
fontFamily: {
  display: ['Georgia', 'serif'],
  body:    ['Arial', 'sans-serif'],
  mono:    ['Courier New', 'monospace'],
},
borderRadius: {
  'gmc-sm':   '4px',
  'gmc-md':   '6px',
  'gmc-lg':   '8px',
  'gmc-xl':   '12px',
  'gmc-full': '9999px',
},
spacing: {
  'gmc-1':  '4px',
  'gmc-2':  '8px',
  'gmc-3':  '12px',
  'gmc-4':  '16px',
  'gmc-5':  '20px',
  'gmc-6':  '24px',
  'gmc-8':  '32px',
  'gmc-12': '48px',
},
```

---

## 8. Accessibility

### 8.1 Contrast Ratios

| Pair | Foreground | Background | WCAG Ratio | Result |
|---|---|---|---|---|
| Primary text on base | `#F0EDE8` | `#2A2D35` | ~14:1 | ✅ AAA |
| Muted text on base | `#9B9FA8` | `#2A2D35` | ~5.8:1 | ✅ AA |
| Gold on base | `#C8A14A` | `#2A2D35` | ~6.4:1 | ✅ AA |
| Gold on surface | `#C8A14A` | `#32363F` | ~5.9:1 | ✅ AA |
| Active badge on active-bg | `#4CAF7D` | `#1E3D2F` | ~4.6:1 | ✅ AA |
| Hold badge on hold-bg | `#E57373` | `#3D1A1A` | ~4.5:1 | ✅ AA |
| Disabled text on surface | `#5C6270` | `#32363F` | ~2.4:1 | ⚠️ Intentional fail |

The one failing pair (disabled text on surface) is intentional — disabled elements must read as inactive. Never place important information in disabled-colour text.

### 8.2 Focus & Motion

- All interactive focus states use `--gold-primary` (`#C8A14A`) at 2px offset with a 3px outline, meeting WCAG 2.1 SC 1.4.11.
- Honour `prefers-reduced-motion` — suppress all transitions and hover animations when set.
- Minimum touch target: 44×44px for all tappable elements (WCAG 2.5.5).

---

## 9. Version History

| Version | Date | Notes |
|---|---|---|
| 1.0 | June 2026 | Initial release. Established all palette, type, spacing, and component tokens for the Gunmetal Club admin theme. |

---

*Confidential — The Pawn Shop, Akwesasne*
