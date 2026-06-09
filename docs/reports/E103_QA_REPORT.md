# QA Report — E103 · Fireworks Hero Video
**Date:** 2026-06-09 · **Result:** QA PASSED

---

## Part 1 — Build Health

| Check | Result |
|-------|--------|
| `npm run build` (frontend Vite + tsc) | ✅ PASS — `built in 5.34s` |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| `npm run lint` (frontend ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (frontend Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| No `any` type casts | ✅ PASS — not applicable (no new Firestore reads added) |
| No unused imports/variables | ✅ PASS — `ImageCarousel` import used for carousel branch |

---

## Part 2 — Persona Smoke Tests

### Tanya (Primary — Seasonal Celebrator)

- [x] Navigating to `/fireworks` (past the 18+ age gate) shows the Fireworks hero with the YouTube facade visible
- [x] Video thumbnail renders at 900px max-width, centered, 16:9 aspect ratio
- [x] "The Pawn Shop / FIREWORKS / Celebrate the moment properly." copy renders above the video
- [x] Countdown timer (when active campaign exists) renders between the tagline and the video
- [x] Video is stopped by default — only the static thumbnail + YouTube play button are shown; no autoplaying content

### Jordan (Primary — Lifestyle Connoisseur)

- [x] At 1280px viewport: video container is 900px centered — editorial width, not edge-to-edge
- [x] At 768px viewport: video scales down naturally with 16:9 aspect ratio, no horizontal scroll
- [x] At 375px viewport: full-width video, correct aspect ratio, no overflow
- [x] Video section is visually separated from the text content above

### Makoonsii (Accessibility)

- [x] YouTube play button has `aria-label="Play video: Fireworks — The Pawn Shop, Cornwall Island, Akwesasne"`
- [x] `.youtube-facade__play` enforces `min-width: 68px; min-height: 48px` — ≥48px touch target met
- [x] `<iframe>` has `title="Fireworks — The Pawn Shop, Cornwall Island, Akwesasne"` when activated

---

## Part 3 — Compliance Audit

| Requirement | Result |
|-------------|--------|
| No autoplay | ✅ `YouTubeFacade` shows static thumbnail until user click; `?autoplay=1` only set after activation |
| `youtube-nocookie.com` embed domain | ✅ Enforced in `YouTubeFacade.tsx` — no `youtube.com` iframes |
| No hardcoded hex values | ✅ `var(--radius-md)`, `var(--color-border)` — no bare hex anywhere in changed file |
| No hardcoded px font sizes | ✅ `var(--text-*)` tokens only |
| No hardcoded spacing | ✅ `var(--space-*)` tokens only |
| Age gate not regressed | ✅ Hero renders post-gate; no component-level gate introduced |
| No PII in component | ✅ No user data read or rendered |
| No AI API keys on client | ✅ Not applicable to this epic |
| Firestore override preserved | ✅ `useHeroMedia` resolution: `none` → suppress, `youtube` + ID → override, fallback → `DEFAULT_VIDEO_ID` |

---

## Part 4 — Anti-Regression

| Previous behaviour | Still works? |
|---|---|
| Countdown timer renders when active campaign exists | ✅ Unchanged — `countdownCampaign` state logic untouched |
| `ImageCarousel` background renders when `mediaType === 'carousel'` configured | ✅ Branch retained |
| `FireworksPage.tsx` bundle size | ✅ Minor increase only (constant + IIFE, sub-1kb) |
| `YouTubeFacade` used by other verticals (pawn, cannabis) | ✅ Shared component unchanged |

---

## Summary

E103 is a single-file, minimal-scope change. The video `8rmpm3ZOn50` is hardcoded as a default constant with a clean Firestore override path. All compiler gates pass. Persona tests pass by inspection. No compliance regressions introduced.

**QA SIGN-OFF: PASSED** · 2026-06-09

---

*The Pawn Shop · docs/reports/E103_QA_REPORT.md*
