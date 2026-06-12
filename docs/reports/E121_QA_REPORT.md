# QA Report — E121 · Home Page Hero Redesign

**Date:** 2026-06-12
**Cycle:** 33
**Status:** ✅ PASSED — Ready to merge

---

## Compiler & Lint Gates

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc -b + vite build) | ✅ PASS | Zero TypeScript errors. Built in 3.62s. |
| `npm run lint` | ✅ PASS | Zero ESLint errors and zero warnings. |
| `npm run test` | ✅ PASS | 29/29 tests pass. |
| `npx tsc -b` (functions/) | ✅ PASS | Zero errors. |

---

## Schema Audit

No Firestore reads or writes. No new collections. No schema changes.

**Schema sync: complete — no changes to `docs/firestore-schema.md` required.**

---

## Token Compliance Audit

All new CSS verified against design token rules:

| Category | Rule | Result |
|----------|------|--------|
| Font sizes | `var(--text-hero)`, `var(--text-lead)`, `var(--text-small)`, `var(--text-subheading)` used | ✅ No hardcoded px font sizes |
| Spacing / padding | `var(--space-2)` through `var(--space-16)` throughout | ✅ No hardcoded spacing |
| Colours | `var(--color-text)`, `var(--color-primary)`, `var(--color-text-muted)`, `var(--color-surface)`, `var(--color-border)`, `var(--color-bg)` | ✅ No hardcoded hex |
| Overlay | `rgba(0,0,0,x)` — semi-transparent black, not a brand colour | ✅ Acceptable (consistent with existing `.portal-card:hover` pattern) |
| Logo width | `220px` — image sizing constraint, not a spacing token | ✅ Consistent with existing `portal-logo-wrap: 340px` precedent |
| Motion | `var(--motion-speed-standard)`, `var(--motion-easing)` | ✅ All motion tokens used |
| Font families | `var(--font-display)`, `var(--font-body)` | ✅ |

---

## Feature Smoke Tests

### HomeHero Component

| Test | Result |
|------|--------|
| `hero.png` renders as full-width background at ≥80vh | ✅ |
| Dark gradient overlay: top `rgba(0,0,0,0.45)` → bottom `rgba(0,0,0,0.72)` — logo and text legible | ✅ |
| `logo.webp` centered with drop-shadow filter | ✅ |
| "The Pawn Shop" headline renders in `var(--font-display)` at `var(--text-hero)` | ✅ |
| Tagline "Dapper. Debonair. Distinctly Akwesasne." in `var(--color-primary)` (gold) | ✅ |
| Location "Cornwall Island · Akwesasne" in `var(--color-text-muted)`, uppercase, tracked | ✅ |
| `heroReveal` animation: translateY(20px)→0 + opacity 0→1 on load | ✅ |
| `aria-label="The Pawn Shop — Cornwall Island, Akwesasne"` on `<section>` | ✅ |
| `img` has descriptive `alt` text | ✅ |

### Responsive 2×2 Grid

| Test | Result |
|------|--------|
| Desktop (≥768px): 4 cards in a 2×2 grid (`grid-template-columns: repeat(2, 1fr)`) | ✅ |
| Mobile (<768px): 4 cards in single column (`grid-template-columns: 1fr`) | ✅ |
| Grid `gap` uses `var(--space-8)` desktop, `var(--space-6)` mobile | ✅ |
| Grid container `max-width: var(--container-max-width)` — centred on wide viewports | ✅ |
| `<nav aria-label="Shop verticals">` semantic nav landmark | ✅ |

### Grid PortalCard Variant

| Test | Result |
|------|--------|
| Icon centered above title (flex-column layout) | ✅ |
| Title and description centered (`text-align: center`) | ✅ |
| No chevron rendered in grid variant | ✅ |
| Hover: `translateY(-4px)` + gold border + shadow — approved smooth hover pattern | ✅ |
| Card `min-height: var(--space-24)` (96px) — well above 48px touch target minimum | ✅ |
| TobaccoPage — default `variant="list"` unchanged; horizontal chevron layout preserved | ✅ |

### Reduced Motion

| Test | Result |
|------|--------|
| `@media (prefers-reduced-motion: reduce)` global rule suppresses `heroReveal` animation | ✅ |
| Cards still hover-interactive (transition suppressed too — correct behaviour) | ✅ |

---

## Persona Compliance Tests

### Jordan (Primary — Editorial Brand Quality)
- Hero cleared the editorial bar: atmospheric `hero.png` usage, gold tagline, Playfair Display headline at 72px. ✅
- No generic SaaS feel — brand voice ("Dapper. Debonair. Distinctly Akwesasne.") above the fold. ✅
- All typography governed by design tokens. ✅

### Sandra (Secondary — Visual Discovery)
- 2×2 grid surfaces all four verticals in a single visual scan. ✅
- No sequential list reading required. ✅
- Hover on each card gives immediate tactile feedback (smooth scale + gold border). ✅

### Marcus (Secondary — Photography Standard)
- `hero.png` rendered as cinematic background: full-cover, gradient-controlled, not flat. ✅
- Drop-shadow on logo adds depth — avoids "pasted-on" appearance. ✅

### Makoonsii (Secondary — Accessibility + Trust)
- Grid cards: `min-height: 96px` (well above 48px Makoonsii requirement). ✅
- Plain language copy — no jargon, no untested Kanien'kéha. ✅
- `<nav>` landmark with `aria-label`. ✅
- `<section aria-label>` on hero for screen readers. ✅
- `alt` text on logo image. ✅

---

## Compliance Checklist

| Requirement | Status |
|-------------|--------|
| No hardcoded hex in new or changed code | ✅ |
| No hardcoded px/spacing values — all design tokens | ✅ |
| No `any` types | ✅ |
| No `console.log` | ✅ |
| No unused imports or variables | ✅ |
| No new Firestore fields | ✅ |
| No Firestore reads or writes | ✅ |
| No PII in any output | ✅ |
| No AI API keys on client | ✅ |
| Age gates at router level only — homepage has no age gate (correct) | ✅ |
| No motion violations — `heroReveal` is the approved cinematic reveal pattern | ✅ |
| `rare-find` / `limited-edition` not touched | ✅ |
| `PortalLayout` unchanged — TobaccoPage unaffected | ✅ |

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/home/HomeHero.tsx` | New — cinematic hero section |
| `src/pages/HomePage.tsx` | Replaced PortalLayout + list cards with HomeHero + CSS grid |
| `src/components/layout/PortalCard.tsx` | Added `variant?: 'list' \| 'grid'` prop |
| `src/index.css` | Added `.home-hero`, `.home-grid`, `.portal-card--grid` CSS |
| `docs/decisions/0038-e121-home-hero-split-component.md` | Decision log |
| `docs/projects/E121_HOME_PAGE_HERO.md` | Status → CLOSED |
| `user-guide/getting-started.md` | Homepage section updated |

---

## Sign-Off

All compiler gates pass. All persona smoke tests pass. All compliance requirements met. Design token integrity verified — no violations in new code. Responsive 2×2 grid confirmed. `hero.png` used cinematically. `TobaccoPage` regression verified clean.

**QA PASSED. E121 ready to merge.**

---

*The Pawn Shop · docs/reports/E121_QA_REPORT.md · 2026-06-12*
