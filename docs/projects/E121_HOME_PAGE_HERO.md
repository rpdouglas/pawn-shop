# E121 — Home Page Hero Redesign
**Status:** ✅ CLOSED — 2026-06-12
**Priority:** HIGH — First impression for all visitors
**Effort:** Small–Medium (4 files, ~200 lines)
**Cycle:** 33

---

## Problem

The current homepage (`/`) is a minimal portal: logo + "The Pawn Shop" heading + "Cornwall Island · Akwesasne" subtitle + 4 plain vertical link cards. There is no brand statement, no atmospheric hero, and no visual hierarchy that communicates who The Pawn Shop is before asking visitors to choose a vertical. First-time visitors have no context; the shop's brand identity (Dapper, Debonair, Distinctly Akwesasne) is completely absent above the fold.

## Personas

**Primary:** Jordan (editorial brand quality — the homepage must clear her aesthetic bar)
**Secondary:** Sandra (visual discovery — first impression must compel exploration), Marcus (photography + brand standard), Makoonsii (cultural trust + accessibility — 48px targets, plain language)

## Scope

- No Firestore reads or writes
- No new schema fields
- No Cloud Functions
- No AI API calls
- Frontend/CSS only

## Solution Delivered

**`HomeHero.tsx`** (new) — Self-contained cinematic hero section: ≥80vh, `hero.png` as `background-image: cover`, `rgba(0,0,0)` gradient overlay, centered logo (`logo.webp`), `--text-hero` brand name, `--text-lead` tagline ("Dapper. Debonair. Distinctly Akwesasne."), `--text-small` location line. `heroReveal` entrance animation (translateY+opacity, approved pattern). Suppressed by global `prefers-reduced-motion` rule.

**`HomePage.tsx`** — Replaced `PortalLayout` + flex-column `PortalCard` list with `<HomeHero />` + `<nav class="home-grid">` containing four `<PortalCard variant="grid" />` entries.

**`PortalCard.tsx`** — Added `variant?: 'list' | 'grid'` prop (`'list'` default). Grid variant: `portal-card--grid` class, centered flex-column layout, no chevron. `TobaccoPage.tsx` unaffected (uses default `variant="list"`).

**`index.css`** — Added `.home-hero`, `.home-hero-content`, `.home-hero-logo`, `.home-hero-title`, `.home-hero-tagline`, `.home-hero-location`, `.home-grid` (responsive: 1 col mobile → 2 col ≥768px), `.portal-card--grid` centered variant. Zero hardcoded hex, px font sizes, or spacing values.

## Files Changed

| File | Change |
|------|--------|
| `src/components/home/HomeHero.tsx` | New — cinematic hero section |
| `src/pages/HomePage.tsx` | Replaced PortalLayout + list with HomeHero + grid |
| `src/components/layout/PortalCard.tsx` | Added `variant` prop |
| `src/index.css` | `.home-hero`, `.home-grid`, `.portal-card--grid` CSS |

## Docs Updated

| File | Change |
|------|--------|
| `docs/decisions/0038-e121-home-hero-split-component.md` | Decision log |
| `docs/reports/E121_QA_REPORT.md` | QA sign-off |
| `docs/EPICS.md` | E121 entry added and closed |
| `docs/ACTIVE_CYCLE.md` | E121 completed row added |
| `user-guide/getting-started.md` | Homepage section updated |

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — Zero TypeScript errors, built in 3.62s |
| `npm run lint` | ✅ PASS — Zero ESLint errors/warnings |
| `npm run test` | ✅ PASS — 29/29 tests pass |
| `npx tsc -b` (functions/) | ✅ PASS — Zero errors |
| Hardcoded hex audit | ✅ PASS — Design tokens only |
| Hardcoded px font-size audit | ✅ PASS — `var(--text-*)` tokens only |
| Hardcoded spacing audit | ✅ PASS — `var(--space-*)` tokens only |
| PII in logs audit | ✅ PASS — No Firestore reads/writes |
