# Design System Reference — The Pawn Shop
**Source:** `ThePawnShop-DesignSystem-v1.0.docx` — Definitive Reference Edition · Status: APPROVED FOR BUILD

> This file is the AI-readable extract of the master design system. The DOCX is the design authority; this file is the machine-readable version for planning, execution, and QA.
> When the DOCX changes, update this file to match.

---

## 1. Design Token Reference (Complete CSS Custom Properties)

All tokens are defined as CSS custom properties using Tailwind v4 `@theme`. Per-view overrides cascade from the root `.view-*` class injected by `ViewContext`. **No JS conditionals for theming — CSS only.**

| Token | `.view-pawn` | `.view-cannabis` | `.view-fireworks` |
|---|---|---|---|
| `--color-primary` | `#C8A14A` Gold | `#7B4FA0` Purple | `#C0392B` Red |
| `--color-bg` | `#080706` Near-black | `#1A0D2E` Deep purple | `#1A0A0A` Dark red |
| `--color-accent` | Brass / muted bronze | `#B89FCC` Lavender haze | `#E8A020` Amber spark |
| `--color-surface` | `#1A1714` Charcoal | `#2D1B4E` Midnight plum | `#2D0808` Deep maroon |
| `--color-highlight` | Warm gold glow | Soft ambient glow | Ember glow |
| `--color-text` (primary) | `#F5F0E8` Off-white | `#F0EAF8` Lavender tint | `#F8F0EA` Warm white |
| `--color-text-muted` | `#8A7E72` Warm muted | `#9B8AAE` Muted lavender | `#9A8070` Muted ember |
| `--font-display` | Playfair Display | Cormorant Garamond | Bebas Neue |
| `--font-body` | Lora | DM Sans | Oswald |
| `--motion-speed` | 400ms | 600ms | 300ms |
| `--motion-easing` | `cubic-bezier(0.4, 0, 0.2, 1)` | `cubic-bezier(0.6, 0, 0.4, 1)` | `cubic-bezier(0.25, 0, 0.5, 1)` |

**Additional Pawn palette values** (borders, inputs, dividers):
- `#2D2926` — Secondary surfaces, input fields, modals
- `#E8E0D6` — Borders, dividers, subtle separators

---

## 2. Colour Contrast Requirements & Known Risks

WCAG AA minimum: **4.5:1 body text · 3:1 large text**. Lighthouse Accessibility target: ≥ 90.

| View | Combination | Ratio | Status |
|---|---|---|---|
| Pawn | Gold `#C8A14A` on Black `#080706` | 6.2:1 | AA Pass (large) — verify body separately |
| Pawn | Off-white `#F5F0E8` on Black `#080706` | 16.8:1 | AAA Pass |
| Cannabis | Lavender `#F0EAF8` on Deep Purple `#1A0D2E` | 14.1:1 | AAA Pass |
| Cannabis | **Purple `#7B4FA0` on Deep Purple `#1A0D2E`** | **2.8:1** | **⚠ Large text only — review required** |
| Fireworks | Warm White `#F8F0EA` on Dark Red `#1A0A0A` | 15.4:1 | AAA Pass |
| Fireworks | Amber `#E8A020` on Dark Red `#1A0A0A` | 8.1:1 | AA Pass |

**Hard rule:** `--color-primary` on `--color-bg` in the cannabis view must only be used at `--text-subheading` (24px) or larger. Never for body copy, labels, or captions.

---

## 3. Typography System

### 3.1 Font Pairings Per View

| View | Display Font | Weights | Body Font | Weights |
|---|---|---|---|---|
| Pawn | Playfair Display | 400, 700, 900 | Lora | 400, 500, 600 |
| Cannabis | Cormorant Garamond | 300, 400, 600 | DM Sans | 300, 400, 500 |
| Fireworks | Bebas Neue | 400 (single) | Oswald | 300, 400, 500 |

Fonts load from `@fontsource` npm packages — no CDN requests. `font-display: swap` required.

### 3.2 Universal Type Scale

Apply across all views, substituting the view-appropriate font family:

| Token | Size | Usage |
|---|---|---|
| `--text-hero` | 4.5rem / 72px | Hero headlines, above-the-fold impact |
| `--text-display` | 3rem / 48px | Section headlines, campaign titles |
| `--text-heading` | 2rem / 32px | Page section headers, product titles |
| `--text-subheading` | 1.5rem / 24px | Subheadings, collection names, card titles |
| `--text-lead` | 1.25rem / 20px | Lead paragraphs, feature descriptions |
| `--text-body` | 1rem / 16px | Standard body copy, product descriptions |
| `--text-small` | 0.875rem / 14px | Captions, metadata, labels, fine print |
| `--text-xs` | 0.75rem / 12px | Legal text, compliance notices, badges |

**Rule:** Always use a `--text-*` token for font size. Never hardcode `px` or `rem` values for typography in component styles.

---

## 4. Motion Design System

### 4.1 Timing Tokens

| Token | Value | View Context |
|---|---|---|
| `--motion-speed-fast` | 150ms | All views — micro-interactions (hover, focus, active) |
| `--motion-speed-base` | 300ms | Fireworks — standard transitions |
| `--motion-speed-standard` | 400ms | Pawn Shop — default |
| `--motion-speed-slow` | 600ms | Cannabis — deliberate, calming pace |

Use `--motion-speed` (the per-view token) for standard transitions; use `--motion-speed-fast` for all hover/focus micro-interactions across all views.

### 4.2 Approved Motion Patterns

| Pattern | CSS / Implementation | Use Case |
|---|---|---|
| Slow fade | `opacity 0→1` at 400–600ms ease-out | Page transitions, image reveals, modal entry |
| Cinematic reveal | `translateY(20px)→0` + `opacity 0→1` | Hero content, staff picks, editorial entries |
| Ambient glow | `box-shadow` pulse on `--color-primary` | CTA hover, VIP badge, featured item highlight |
| Smooth hover | `scale(1.02)` + shadow depth over 200ms | Product cards, staff picks, image galleries |
| Subtle parallax | Background-position shift on scroll (max 20px) | Hero sections only |
| Countdown pulse | Timer digit flip at each second | Fireworks countdown timer (Tanya) |
| Quick-view open | Modal slides from bottom or center-scales in 200ms | Quick-view cards — **must be < 200ms** |
| Staggered grid reveal | 50ms stagger delay per card, opacity + Y-translate | Masonry grid (Sandra) |

### 4.3 Prohibited Motion Patterns

These are **explicitly banned** across all three views. Their presence signals low-quality execution and is a QA blocker:

- Flashy transitions: slide-in-from-sides, wipes, page flips
- Excessive bounce: spring physics that overshoot their target
- Cheap particle effects: confetti, sparkle bursts, floating emojis
- Distracting micro-interactions: elements that animate **without user input**
- Hyperactive animations: movement competing with content
- Cheap gamification motion: point counters, XP bars, achievement pop-ups

---

## 5. Photography & Art Direction

### 5.1 Universal Requirements

| Requirement | Standard |
|---|---|
| Lighting | Directional · Warm highlights · Moody shadows · Controlled reflections |
| Mood | Cinematic · Intentional · Rich in texture · Atmospheric |
| Backgrounds | Rich shadows · Dark surfaces · Warm reflections — **never flat white, never flash** |
| Supplier images | Never use unedited supplier images. All imagery reshot or art-directed |
| Format | WebP primary · AVIF where supported · JPEG fallback only |
| Alt text | Descriptive, keyword-appropriate on every product image |
| Resolution | ≥1600px hero · ≥800px product cards · ≥400px thumbnails |

### 5.2 Five Required Shot Types (Publishing Blocker for High-Value Items)

| Shot | Type | Description |
|---|---|---|
| 1 | Hero Shot | Primary product reveal — atmospheric lighting, dark background |
| 2 | Detail Close-Up | Maker's mark, mechanism, condition detail, serial number area |
| 3 | Texture / Material | Surface quality — velvet, brass, wood grain, glass |
| 4 | Lifestyle / Environmental | Object in context — on a surface, held, displayed |
| 5 | Scale / Context | Object with a reference item to communicate true size |

Missing shots are a **publishing blocker** for Marcus Standard items.

### 5.3 Per-View Photography Direction

| View | Lighting Mood | Texture Emphasis | Signature Elements |
|---|---|---|---|
| Pawn | Warm directional · Brass highlights · Deep shadow pools | Velvet · Brass · Wood grain · Leather | Rich shadow detail · Museum-object framing · Provenance storytelling |
| Cannabis | Low-key cinematic · Ambient cool-to-warm · Rim lighting | Glass reflections · Organic materials · Premium hardware | Macro photography · Ritual-focused compositions · Privacy-first staging |
| Fireworks | Long exposure event · High contrast night · Ember tones | Spark trails · Colour bloom · Family warmth | Cinematic event imagery · High-contrast drama |

### 5.4 The Marcus Standard

**Trigger items** — any of these must receive the Marcus Standard:
- Vintage watches and luxury timepieces
- Acoustic and electric guitars, premium instruments
- Premium vape hardware (Cannabis view)
- Rare collectibles and limited-edition items
- Limited-edition fireworks bundles (Ceremony collection)
- Luxury accessories of any category

**Marcus Standard requirements:**
- All five required shot types (see §5.2) — **mandatory**
- Editorial-grade photography: dark luxury standard, no supplier images
- Deep AI-enhanced product descriptions (E18): provenance, cultural context, collecting significance
- Provenance storytelling: the object's story, not just its condition
- Hero image must work as a standalone editorial photograph
- Scarcity framing where applicable (`rare-find`, `limited-edition` — staff-set only)
- Display font (`--font-display`) for product name — never body font style

---

## 6. Component Specifications

### 6.1 Product Card

| Element | Standard | Marcus Standard Override |
|---|---|---|
| Container | `--color-surface` bg · border in `--color-accent` · `border-radius: 8px` | Elevated shadow: `0 8px 32px rgba(200,161,74,0.15)` |
| Image ratio | 4:3 · `object-fit: cover` · hover `scale(1.02)` over 300ms | 16:9 full-bleed · Cinematic crop · 400ms hover |
| Product name | `--font-display` at `--text-subheading` · `--color-text` | `--font-display` · `--text-heading` · `--color-primary` on hover |
| Price display | `--font-body` bold · `--color-primary` | AI suggestion range shown for Dale; exact price for Marcus |
| Rare Find flag | Gold star icon + "Rare Find" label — top-right overlay | Always displayed when applicable |
| Quick-view | Opens in **< 200ms** — hard performance requirement | Mandatory · Cinematic image gallery |

### 6.2 Hero Section

| View | Height | Key Elements | Motion |
|---|---|---|---|
| Pawn | ≥80vh | Shimmer headline (Playfair Display) · "Find of the Day" · Dual CTAs: Browse Inventory / Pawn or Sell | Staggered text reveal · Subtle shimmer on gold · 400ms |
| Cannabis | 100vh | Single CTA · Cormorant Garamond title · Mood tagline · No hard sell | Slow fade 600ms · Ambient overlay glow pulse |
| Fireworks | Full-screen | Countdown timer · Bebas Neue time display · Event nav below fold | Countdown digit flip · Ember accent (restrained — no particle effects) |

### 6.3 Buttons & CTAs

| Variant | Appearance | Hover State | Usage |
|---|---|---|---|
| Primary | Solid `--color-primary` bg · Dark text · **44px min-height** | Brighten 10% · subtle shadow glow | Main conversion action |
| Secondary | Outline `--color-primary` · Transparent bg | Fill with `--color-primary` · text invert | Save, Share, Enquire |
| Ghost | No border · `--color-primary` text | Underline · opacity shift | Navigation, editorial links |
| Urgency | Red/Amber tones | Pulse glow · `scale(1.02)` | Fireworks view **only** |
| Disabled | Opacity 0.4 · `cursor: not-allowed` | No change | Out of stock |

**Minimum button height: 44px** (WCAG 2.5.5). Project standard for Makoonsii is **48px** — use 48px for all primary touch-target flows.

### 6.4 Navigation Header

| Element | Specification |
|---|---|
| Height | 64px desktop · 56px mobile · Fixed on scroll with `backdrop-filter: blur` |
| Logo | `--font-display` wordmark · `--color-primary` |
| Nav links | Ghost style · `--font-body` · `letter-spacing: wide` · Active: `--color-primary` · Hover: underline fade |
| Mobile menu | Full-screen overlay · Dark bg · Large touch targets (44px min) · Slide-in 300ms |
| View CTA | "Pawn or Sell" (Pawn) · "Explore" (Cannabis) · "Shop Events" (Fireworks) |

### 6.5 Masonry Discovery Grid (Sandra)

| Property | Specification |
|---|---|
| Layout | CSS Columns masonry · 2 col mobile · 3 col tablet · 4 col desktop |
| Card sizing | Variable height based on image aspect ratio — **never force-cropped** |
| Animation | Staggered 50ms delay per card · opacity fade + Y-translate on scroll |
| Staff Pick overlay | Gold badge · "Staff Pick" label · curator's note on hover |
| Quick-view | Single tap opens quick-view without page navigation |
| Infinite scroll | Load 20 items · trigger next batch at 80% scroll depth · no pagination buttons |

---

## 7. Layout & Spatial System

### 7.1 Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Fine internal spacing · badge padding |
| `--space-2` | 8px | Icon gaps · compact component padding |
| `--space-4` | 16px | Standard component padding · card inner spacing |
| `--space-6` | 24px | Section-level padding · comfortable card spacing |
| `--space-8` | 32px | Large component spacing · generous card padding |
| `--space-12` | 48px | Section separation · breathing room |
| `--space-16` | 64px | Major section breaks · editorial space |
| `--space-24` | 96px | Hero section padding · luxury breathing room |

### 7.2 Breakpoint System

| Breakpoint | Min Width | Tailwind Prefix | Grid Columns |
|---|---|---|---|
| Mobile | 375px | (default) | 4 columns |
| Mobile Large | 430px | `xs:` | 4 columns |
| Tablet | 768px | `md:` | 8 columns |
| Laptop | 1024px | `lg:` | 12 columns |
| Desktop | 1280px | `xl:` | 12 columns |
| Wide | 1536px | `2xl:` | 12 columns |

Mobile-first always. Primary discovery device for Sandra and Tanya is mobile.

### 7.3 Grid Systems

| Layout | Columns | Gutter | Usage |
|---|---|---|---|
| Product Grid | 1→2→3→4 | 16px→24px | Standard inventory, sorted/filtered |
| Masonry Grid | 2→3→4 variable height | 16px→24px | Discovery surface (Sandra) |
| Staff Picks | 1→2→3 | 24px→32px | Curated highlight grid — larger cards |
| Mood Collections | 1→2→2 | 24px | Cannabis view only |
| Bundle Grid | 1→2→3 | 16px→24px | Fireworks bundles |
| Editorial 2-col | 1→2 (60/40 split) | 32px→48px | Brand narrative, Akwesasne stories |

### 7.4 Container & Max-Width

| Context | Max Width | Side Padding |
|---|---|---|
| Hero section | Full viewport | 0 — never constrained |
| Content container | 1280px | 24px→48px |
| Narrow editorial | 860px | 24px→48px |
| Admin dashboard | 1440px | 32px |
| Quick-view modal | 640px | 32px |

---

## 8. Brand Voice & Copy Standards

### 8.1 Approved vs. Discouraged Vocabulary

| Approved | Discouraged |
|---|---|
| Curated · Collected · Discover | Cheap · Junk · Clearance dump |
| Rare find · Crafted · Elevated | Budget bin · Dirt cheap · Liquidation |
| Timeless · Heritage · Story | Overstock · Bargain basement |
| Provenance · Atmosphere · Community-rooted | BUY NOW!!! · Don't miss out!!! |
| Distinctive · Editorial · Signature | Limited time SALE · MASSIVE DISCOUNT |

### 8.2 Per-View Tone

| View | Tone | Example Headline | Avoid |
|---|---|---|---|
| Pawn | Curator-style · Story-driven · Warm discovery | "Objects with stories deserve presentation with meaning." | Transactional urgency · Price-first copy |
| Cannabis | Discreet · Atmospheric · Non-clinical wellness | "Wellness, curated with intention." | Medical claims · Clinical terminology · Youth-oriented language |
| Fireworks | Celebratory · Anticipatory · Event-forward | "Celebrate the moment properly." | Reckless depictions · Dangerous challenge-style content |

### 8.3 Cannabis Copy Compliance Rules (Hard Stops)

- **NEVER** make medical claims or promise treatment outcomes
- **NEVER** use youth-oriented imagery or language
- **NEVER** encourage or glamourise unsafe usage
- CRM subject lines, SMS previews, push notifications: **generic "The Pawn Shop Update" only** — never disclose cannabis category
- Anonymous inquiry path must exist — WhatsApp deep-link without account required

---

## 9. UX Principles & Performance Targets

### 9.1 Interaction Rules

| Principle | Specification |
|---|---|
| Touch targets | **44px × 44px minimum** (WCAG 2.5.5) · **48px for Makoonsii flows** |
| Quick-view | Opens in **< 200ms** — hard requirement (Marcus) |
| Algolia search | **< 300ms** response — hard requirement (Dale) |
| Mobile-first | All discovery experiences optimised for mobile first |
| Progressive disclosure | Surface key info immediately · full detail on tap |
| No dark patterns | No fake scarcity · No guilt-trip flows · No auto-checked consent |
| Infinite scroll trigger | 80% scroll depth · 20 items per batch |

### 9.2 Performance Targets

| Metric | Target | Gate Type |
|---|---|---|
| Lighthouse Performance (all views) | ≥ 90 | Pre-launch hard gate |
| Lighthouse Accessibility | ≥ 90 | Pre-launch hard gate |
| Lighthouse SEO | ≥ 95 | Pre-launch hard gate |
| LCP mobile | < 2.5s | Pre-launch hard gate |
| Algolia search response | < 300ms | Sprint 12 acceptance |
| Quick-view modal open | < 200ms | Sprint 12 acceptance (Marcus) |
| Cloud Function p95 | < 500ms | Soft target post-launch |

---

## 10. Compliance & Age Gate Visual Spec

| Element | Cannabis (`/cannabis`) | Fireworks (`/fireworks`) |
|---|---|---|
| Age requirement | 19+ (Ontario / Quebec) | 19+ (Ontario) |
| Gate style | Full-screen modal · `--color-bg` cannabis · Cinematic | Full-screen modal · `--color-bg` fireworks · Bold Bebas Neue |
| Bypass | **IMPOSSIBLE** — no dismiss, no scroll-past, no back button | Same — no bypass path in UI |
| Consent logged | IP hash, timestamp, policy version, `viewTag` | Same fields |
| Retention | 7 years — immutable Firestore rules | Same |
| Accessibility | Screen-reader accessible · Tab-trapped · Clear CTA labels | Same |
| Underage redirect | `/cannabis/age-restricted` — no product content visible | `/fireworks/age-restricted` |

Privacy footer: **"Built with Canadian privacy standards."** — approved design element on all views.

---

## 11. Homepage Section Blueprints (E05 Reference)

### Pawn Shop (`/pawn`)

1. Art-Deco Hero — Gold/black · Playfair Display shimmer headline · Find of the Day · Dual CTAs
2. Trust Badge Strip — Community-owned · eBay verified · Akwesasne · In-store pickup
3. Recently Sold Strip — Animated · sale prices · "Gone in X hours" timestamps
4. Featured Inventory Grid — 4 most recent active items · Marcus Standard photography
5. Staff Picks Collection — Curated with staff note · Gold badge · Editorial framing
6. Brand Narrative Callout — Akwesasne story · Warriors of Akwesasne preview
7. Masonry Discovery Section — All active inventory · Infinite scroll · Quick-view
8. Footer Newsletter — CASL-compliant opt-in · "Finds of the Week" hook

### Cannabis Lifestyle (`/cannabis`)

1. 19+ Age Gate — Full-screen · No bypass · Consent logged before any content
2. Cinematic Hero — Full-bleed video/image · Single CTA · Cormorant Garamond · No hard sell
3. Mood Collections — Relax · Focus · Social · Ceremony
4. Limited Edition Framing — Scarcity signal · Marcus-grade photography
5. Lifestyle Editorial Strip — Non-clinical copy · Ritual-focused imagery
6. Anonymous Inquiry CTA — WhatsApp deep-link · No account required
7. Privacy Assurance Footer — PIPEDA notice · "Built with Canadian privacy standards."

### Fireworks & Seasonal (`/fireworks`)

1. 19+ Age Gate — Fireworks-specific compliance message · Consent logged
2. Countdown Hero — Animated to next major event · Bebas Neue timer · Amber/red palette
3. Event Category Navigation — Family Night · Display Shows · Sparklers & Kids · Professional
4. Bundle Showcase — Staff-curated event bundles · Pickup scheduling CTA
5. Seasonal Campaign Module — Admin-configurable · Holiday templates
6. Urgency Strip — Low stock signals · "X bundles left" · Pickup window closing notices
7. Pickup Scheduling CTA — Prominent on all item detail pages

---

## 12. Design QA Checklist (Pre-Launch Gate)

Items marked ★ are hard blocking — launch cannot proceed with failures.

| # | Check | Criteria | Priority |
|---|---|---|---|
| 1 | Three-view token system | All CSS custom properties committed. ViewContext switching verified at `/pawn` `/cannabis` `/fireworks`. | ★ Critical |
| 2 | Typography rendering | All `@fontsource` packages loading. No FOUT. `font-display: swap` in place. | ★ Critical |
| 3 | WCAG AA contrast — all views | All text/bg combinations pass 4.5:1 body / 3:1 large. Cannabis purple-on-plum only at large text. | ★ Critical |
| 4 | Age gate — Cannabis | 19+ modal renders before any content. Cannot be dismissed. Consent logs to Firestore. | ★ Critical |
| 5 | Age gate — Fireworks | Same enforcement. Consent logging verified. | ★ Critical |
| 6 | Mobile responsiveness | All three view homepages correct at 375px, 768px, 1280px. No horizontal scroll. | ★ Critical |
| 7 | Lighthouse Performance ≥ 90 | All three views passing. LCP < 2.5s mobile. | ★ Critical |
| 8 | Marcus Standard photography | All high-value items shot to five-type standard. No supplier images. | ★ Critical |
| 9 | Touch targets 44px min | All interactive elements meet WCAG 2.5.5. Verified on 375px device. | ★ Critical |
| 10 | Pawn hero | Art-deco gold/black · Shimmer headline · Find of the Day · Dual CTAs functional. | High |
| 11 | Cannabis cinematic hero | Full-bleed · Minimal copy · Single CTA · Cormorant Garamond rendering. | High |
| 12 | Fireworks countdown hero | Countdown live and auto-updating · Bebas Neue rendering · Correct palette. | High |
| 13 | Masonry grid (Sandra) | Non-linear layout · Quick-view < 300ms · Infinite scroll at 80%. | High |
| 14 | Mood Collections (Marie) | Relax · Focus · Social · Ceremony navigable. Cannabis view only. | High |
| 15 | Staff Picks module | Curated items with staff note · Gold badge · Editorial photography. | High |
| 16 | Quick-view modal (Marcus) | Opens < 200ms · Cinematic gallery · Provenance copy visible · Close without navigation. | High |
| 17 | Trust badge strip | Community-owned · eBay verified · Akwesasne · Pickup. Pawn view only. | Medium |
| 18 | Motion — no prohibited patterns | No bounce · No particle effects · No constant micro-animations. QA all three views. | Medium |
| 19 | Kanien'kéha review | All published Mohawk phrases have community review approval on file. | ★ Critical |
| 20 | Persona sign-off | Business owner confirms all 8 persona UX requirements visible in implemented interface. | ★ Critical |

---

*The Pawn Shop · docs/design-system.md · Extracted from ThePawnShop-DesignSystem-v1.0.docx*
