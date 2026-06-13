# QA Report — E122 · Fireworks Hero Canvas Animation

**Date:** 2026-06-13
**Cycle:** 33
**Status:** ✅ PASSED — Ready to merge

---

## Compiler & Lint Gates

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc -b + vite build) | ✅ PASS | Zero TypeScript errors. |
| `npm run lint` | ✅ PASS | Zero ESLint errors and zero warnings. |
| `npm run test` | ✅ PASS | 29/29 tests pass. |
| `npx tsc -b` (functions/) | ✅ PASS | Zero errors. |

---

## Schema Audit

No Firestore reads or writes. No new collections. No schema changes.

**Schema sync: complete — no changes to `docs/firestore-schema.md` required.**

---

## Token Compliance Audit

| Category | Rule | Result |
|----------|------|--------|
| Colours (CSS) | All inline styles use `var(--color-*)` | ✅ No hardcoded hex in CSS/JSX |
| Canvas palette | `AMBER = '#E8A020'` = `--color-accent`, `RED = '#C0392B'` = `--color-primary`, `rgba(26,10,10)` = `--color-bg` — documented canvas API exception in decision 0039 | ✅ Acceptable — Canvas 2D cannot accept CSS custom properties |
| Spacing | `var(--space-*)` throughout `FireworksHero.tsx` | ✅ No hardcoded spacing |
| Font sizes | `var(--text-hero)`, `var(--text-lead)`, `var(--text-small)` | ✅ No hardcoded px font sizes |
| Section height | `minHeight: '80vh'` — viewport-relative, not a pixel value | ✅ Acceptable |
| Motion | rAF loop paused between episodes; no constant micro-animation | ✅ Complies with §4.3 (interval-burst pattern, not constant) |
| Font families | `var(--font-display)`, `var(--font-body)` | ✅ |

---

## Feature Smoke Tests

### Canvas Engine (`useFireworksCanvas`)

| Test | Result |
|------|--------|
| Hook mounts: canvas sized to `offsetWidth × offsetHeight` | ✅ |
| `resize` event: canvas re-sizes to match element | ✅ |
| First episode fires after 800ms — not immediate | ✅ |
| Salvo: 4 rockets launch staggered 350–600ms apart | ✅ |
| Each rocket produces radial, double-ring, or chrysanthemum burst | ✅ |
| Centre white flash on every explosion | ✅ |
| `phase = 'fadeout'` after last rocket launches + 2200ms | ✅ |
| `phase = 'quiet'`, rAF paused once all particles gone | ✅ |
| Next episode fires 6000ms after previous completes | ✅ |
| Cleanup: `cancelAnimationFrame`, `clearTimeout` (episode + rocket timers), `removeEventListener` on unmount | ✅ |

### FireworksHero Component

| Test | Result |
|------|--------|
| `<canvas aria-hidden="true">` present as first child of section | ✅ |
| Canvas `position: absolute; inset: 0` — fills full hero section | ✅ |
| Canvas `pointerEvents: none` — no interference with interactive elements | ✅ |
| Overlay (`zIndex: 1`) above canvas (canvas has no z-index — natural stacking) | ✅ |
| Text content (`zIndex: 2`) above overlay | ✅ |
| `minHeight: 80vh` on section — cinematic height | ✅ |
| Headline, tagline, countdown, YouTubeFacade all unchanged | ✅ |

### Reduced Motion

| Test | Result |
|------|--------|
| `prefers-reduced-motion: reduce` — hook returns immediately, no rAF started | ✅ |
| Hero section still renders correctly with no canvas activity | ✅ |

---

## Persona Compliance Tests

### Tanya (Primary — Seasonal Celebrator)
- Hero delivers genuine cinematic fireworks theatre before the product video. ✅
- Animation builds anticipation without gimmicks — physics-based, gold-dominant. ✅
- Countdown timer (when active) and video remain fully accessible below the animation. ✅

### Jordan (Secondary — Editorial Brand Quality)
- Physics-based burst simulation — not cheap confetti or sparkle effect. ✅
- Interval-burst pattern: deliberate moments, not wallpaper. ✅
- `aiDescription` not touched. ✅

### Marcus (Secondary — Photography + Provenance)
- Dark `--color-bg` canvas does not compete with product photography below the hero. ✅
- Gold-dominant palette (`#FFE566`, `#C9A84C`, `AMBER`) matches brand colour story. ✅

### Makoonsii (Secondary — Accessibility + Trust)
- `aria-hidden="true"` on canvas — invisible to screen readers, no false content. ✅
- `prefers-reduced-motion` fully respected. ✅
- No interactive elements added. ✅

---

## Design System §4.3 Compliance

Decision 0039 documents the formal resolution:

- **"Constant micro-animations"** prohibition: not violated. The rAF loop is paused for ~6 of every ~8 seconds. Animation occurs only during deliberate burst episodes.
- **"Cheap particle effects"** prohibition: not violated. This is a physics-based simulation (gravity, drag, multi-trail) for a fireworks retail page — thematically justified as editorial brand expression.
- **Classification:** Interval-burst / cinematic moment — same category as approved "Countdown digit flip" pattern.

---

## Compliance Checklist

| Requirement | Status |
|-------------|--------|
| No hardcoded hex in CSS/JSX | ✅ |
| Canvas hex constants documented as token-equivalent (decision 0039) | ✅ |
| No hardcoded px/spacing values — all design tokens | ✅ |
| No `any` types | ✅ |
| No `console.log` | ✅ |
| No unused imports or variables | ✅ |
| No new Firestore fields | ✅ |
| No Firestore reads or writes | ✅ |
| No PII in any output | ✅ |
| No AI API keys on client | ✅ |
| Age gate at router level only — Fireworks age gate unmodified | ✅ |
| `aria-hidden` on decorative canvas | ✅ |
| `prefers-reduced-motion` respected | ✅ |
| `rare-find` / `limited-edition` not touched | ✅ |
| `auditLogs` not touched | ✅ |

---

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useFireworksCanvas.ts` | New — canvas engine, episode state machine, `Particle` + `Rocket` classes |
| `src/components/fireworks/FireworksHero.tsx` | Canvas element added; `minHeight: 80vh` on section |
| `docs/decisions/0039-fireworks-hero-canvas-animation.md` | Decision log — §4.3 resolution + canvas/token exception |
| `docs/projects/E122_FIREWORKS_HERO_CANVAS.md` | Status → CLOSED |

---

## Sign-Off

All compiler gates pass. All persona smoke tests pass. All compliance requirements met. Design system §4.3 tension resolved and documented. Canvas/token exception formally recorded in decision 0039. Accessibility requirements satisfied (`aria-hidden`, `prefers-reduced-motion`).

**QA PASSED. E122 ready to merge.**

---

*The Pawn Shop · docs/reports/E122_QA_REPORT.md · 2026-06-13*
