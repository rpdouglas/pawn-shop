# QA Report — FIX · Pawn Hero Headline Line-Wrap

**Date:** 2026-07-08
**Cycle:** 33
**Status:** ✅ PASSED — Ready to merge

---

## Compiler & Lint Gates

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc -b + vite build) | ✅ PASS | Zero TypeScript errors. Built in 902ms. |
| `npm run lint` | ✅ PASS | Zero ESLint errors and zero warnings. |
| `npm run test` | ✅ PASS | 29/29 tests pass (8 test files). |
| `npx tsc -b` (functions/) | N/A | Functions not touched by this fix. |

---

## Schema Audit

No Firestore fields read or written. `PawnHero.tsx`'s only data dependency (`useHeroMedia`) is unchanged.

**Schema sync: complete — no changes to `docs/firestore-schema.md` required.**

---

## Token Compliance Audit

| Category | Rule | Result |
|----------|------|--------|
| Colours | No hardcoded hex in modified code | ✅ `color: var(--color-primary)` unchanged |
| Spacing | No hardcoded px spacing values | ✅ All `--space-*` tokens on siblings untouched; wrapper's `maxWidth` removal is a layout constraint, not a spacing value |
| Font sizes | No hardcoded px font sizes | ✅ Bespoke `clamp()` (rem-based fluid sizing), not a raw px value — consistent with the pre-existing pattern this replaces |
| `any` types | None introduced | ✅ |
| `console.log` | None introduced | ✅ |
| Unused imports | None | ✅ |
| Motion | No unapproved motion patterns | ✅ Existing `.pawn-hero-content` cinematic fade-up (§4.2) untouched |

---

## PII Compliance Audit

Not applicable — no data displayed, collected, or logged by this change. Static marketing copy only.

---

## Security Compliance Audit

Not applicable — pure CSS/layout change to a public, unauthenticated page. No new dependencies, no Cloud Function changes, no Firestore rules changes, no auth changes.

---

## Persona Compliance Tests

### Sandra (Primary — Visual discovery)

- Headline renders on exactly one line at all tested breakpoints — no jarring mid-phrase wrap on landing. ✅
- No horizontal scroll introduced at any width. ✅

### Jordan (Secondary — Editorial brand quality)

- Headline no longer breaks mid-sentence on desktop; brand statement reads as a single deliberate line. ✅
- Type scale still uses the display font (`--font-display`) and primary color token; only the size value changed. ✅

### Makoonsii (Accessibility anchor)

- CTA buttons (`Browse Liquidations`, `Pawn or Sell`) unaffected — untouched by this change, still meet the 44px `Button` component floor. ✅
- Headline remains legible at the smallest tested size (22px at 375px) — well above illegible territory. ✅

---

## Breakpoint Verification

Measured via headless Chromium (Playwright) against the running dev server — rendered `h1` font-size, line count (derived from box height ÷ line-height), and document-level horizontal overflow at each width:

| Viewport | Rendered `h1` font-size | Lines | Horizontal overflow |
|---|---|---|---|
| 375px | 22px | 1 | ✅ None |
| 414px | 22px | 1 | ✅ None |
| 768px | 38.4px | 1 | ✅ None |
| 1024px | 51.2px | 1 | ✅ None |
| 1280px | 60px | 1 | ✅ None |
| 1440px | 60px | 1 | ✅ None |
| 1920px | 60px | 1 | ✅ None |

---

## Compliance Checklist

| Requirement | Status |
|-------------|--------|
| No PII in logs or analytics | ✅ N/A — no data involved |
| No hardcoded hex values in modified file | ✅ |
| No hardcoded px font sizes | ✅ (bespoke `clamp()`, not a raw px value) |
| No hardcoded px spacing | ✅ |
| No unapproved motion patterns | ✅ |
| No new Firestore fields | ✅ |
| No AI API keys on client | ✅ N/A |
| No age gate changes | ✅ N/A — pawn view has no age gate |
| `auditLogs` not modified | ✅ N/A |
| No new npm dependencies | ✅ |
| No Cloud Function changes | ✅ |
| No Firestore rules changes | ✅ |
| Decision logged | ✅ Decision 0049 |

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/pawn/PawnHero.tsx` | Removed `maxWidth: '720px'` from `.pawn-hero-content` wrapper; retuned `h1` `fontSize` clamp |

---

## Sign-Off

All applicable compiler gates pass. Single-line rendering with zero horizontal overflow confirmed across the full 375px–1920px breakpoint range via headless-browser measurement. No schema, security, or compliance surface touched.

**QA PASSED. FIX_PAWN_HERO_HEADLINE_WRAP ready to merge.**

---

*The Pawn Shop · docs/reports/FIX_PAWN_HERO_HEADLINE_WRAP_QA_REPORT.md · 2026-07-08*
