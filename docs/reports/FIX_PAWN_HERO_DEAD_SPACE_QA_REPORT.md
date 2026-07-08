# QA Report — FIX · Pawn Hero Dead Space

**Date:** 2026-07-08
**Cycle:** 33
**Status:** ✅ PASSED — Ready to merge

---

## Compiler & Lint Gates

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc -b + vite build) | ✅ PASS | Zero TypeScript errors. |
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
| Colours | No hardcoded hex in modified code | ✅ N/A — no color values touched |
| Spacing | No hardcoded px spacing values | ✅ Only `minHeight: '80vh'` removed; remaining `padding` still uses `var(--space-12) var(--space-8)` |
| Font sizes | No hardcoded px font sizes | ✅ N/A — untouched by this fix |
| `any` types | None introduced | ✅ |
| Unused imports | None | ✅ |
| Motion | No unapproved motion patterns | ✅ Existing `.pawn-hero-content` cinematic fade-up (§4.2) untouched |

---

## PII / Security Compliance Audit

Not applicable — pure CSS/layout change to a public, unauthenticated page. No data, dependencies, Cloud Functions, Firestore rules, or auth touched.

---

## Persona Compliance Tests

### Sandra (Primary — Visual discovery)

- No large empty gap between page header and hero text on load. ✅
- No large empty gap between CTA buttons and the next section (Brother POS "Liquidation Items"). ✅

### Jordan (Secondary — Editorial brand quality)

- Hero reads as an intentional, tightly composed brand banner rather than a stretched, half-empty box. ✅
- Hero text centering and typography unaffected — only the outer section's forced height changed. ✅

---

## Breakpoint Verification

Measured via headless Chromium (Playwright), full-page screenshots against the running dev server:

| Viewport | Gap above eyebrow text | Gap below CTA buttons (before next section) | Result |
|---|---|---|---|
| 412×915 (mobile) | ~48px (section top padding only) | ~80px (48px section bottom padding + 32px page-wrapper padding) | ✅ Matches intentional spacing, no forced viewport-height gap |
| 1440×900 (desktop) | ~48px (section top padding only) | ~80px (48px section bottom padding + 32px page-wrapper padding) | ✅ Matches intentional spacing, no forced viewport-height gap |

Note: the Brother POS embed (`ShopMenu.tsx`) itself did not render content in this sandboxed dev environment because `https://thepawnshop.trafficstores.ca/shop/embed.js` is unreachable from the sandbox network (`ERR_TUNNEL_CONNECTION_FAILED`, confirmed via console/network listener) — this is an environment limitation, not a regression from this fix. The measured gap is the space between the hero and the (empty, in this environment) `ShopMenu` container, which is unaffected by whether the widget's own content has loaded.

---

## Compliance Checklist

| Requirement | Status |
|-------------|--------|
| No PII in logs or analytics | ✅ N/A — no data involved |
| No hardcoded hex values in modified file | ✅ |
| No hardcoded px font sizes | ✅ |
| No hardcoded px spacing | ✅ |
| No unapproved motion patterns | ✅ |
| No new Firestore fields | ✅ |
| No new npm dependencies | ✅ |
| No Cloud Function changes | ✅ |
| No Firestore rules changes | ✅ |
| Decision logged | ✅ Decision 0050 |

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/pawn/PawnHero.tsx` | Removed `minHeight: '80vh'` from the outer `<section>` style |

---

## Sign-Off

All applicable compiler gates pass. Dead-space gaps confirmed resolved at both mobile and desktop widths via headless-browser measurement, matching the section's intentional padding rather than a forced viewport-height floor. No schema, security, or compliance surface touched.

**QA PASSED. FIX_PAWN_HERO_DEAD_SPACE ready to merge.**

---

*The Pawn Shop · docs/reports/FIX_PAWN_HERO_DEAD_SPACE_QA_REPORT.md · 2026-07-08*
