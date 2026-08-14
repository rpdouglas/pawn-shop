# Decision 0053 — E130 Raw `px` Value Triage: Execution

**Date:** 2026-08-13
**Epic:** E130 · Raw `px` Value Triage
**Cycle:** 34
**Status:** Implemented

---

## Context

E128's audit flagged 97 files with raw `px` literals, never triaged (a blind
grep count, not a violation count). E130 was scoped specifically to do that
triage: read the CSS property context around every `px` value, and classify
each as a real `--space-*`/`--text-*`/`--radius-*` scale violation or a
legitimate exception.

## Decision

**Executed Strategy A** (`docs/plans/E130_PX_TRIAGE_PLAN.md`): fixed every
value that exactly matched an existing token in a spacing/font-size/radius
context; left everything else untouched.

**51 planned fixes + 6 additional fixes found incidentally while reading
`Card.tsx` during Gate 2** (bare-number `gap: 8`, `top: 8`, `left: 8`,
`gap: 4` — not caught by the original `px`-string grep, but the same
category of violation) — **57 total property-level fixes across 15 files:**

`MfaEnrollPage.tsx` (11), `LoginPage.tsx` (9), `SignUpPage.tsx` (5),
`BundleCard.tsx` (4), `ReturnRequestForm.tsx` (4), `columns.tsx` (4),
`MoodCard.tsx` (3), `Card.tsx` (6), `SocialDashboardPage.tsx` (3),
`CellEditors.tsx` (2), `SocialComposerPage.tsx` (2), `UrgencyBadge.tsx` (1,
partial), `InventoryTable.tsx` (1), `IntakeForm.tsx` (1),
`MobileIntakePage.tsx` (1).

All fixes use tokens that already existed (`--space-1/2/4/6/8`,
`--text-xs/small/body/lead/subheading`, `--radius-sm`) — no new tokens
needed, matching the reuse-over-invention precedent from Decisions 0051/0052.

## Accepted Exceptions (documented, not fixed)

- **~220** hairline border widths (1–3px) — established codebase pattern.
- **~113** WCAG 44/48px touch targets — explicit literal requirement per
  `design-system.md` §9.1, verified via sampling to be 100% touch-target
  context (no violations hiding in this bucket).
- **~150** one-off component/layout dimensions with no scale match (icon
  sizes, modal/container widths, thumbnail sizes) — verified zero of these
  appear in a padding/margin/gap context.
- Values in spacing-shaped properties with **no exact token match** (e.g.
  `12px` gap/padding, `2px`/`6px`, `20px` icon sizes, `40px` in mixed
  `'40px 32px'` padding shorthand) — left as literal rather than rounded to
  a nearby token, per the "no approximation" principle established in
  Decision 0051/0052. Rounding these would be a real, unreviewed visual size
  change, not a cleanup.
- A special case: `IntakeForm.tsx`/`MobileIntakePage.tsx`'s AI-toggle switch
  (`width: '44px', height: '24px', borderRadius: '12px'`) — the `borderRadius`
  is a computed half-of-height value creating a pill/stadium shape, not a
  coincidental match to any `--radius-*` step. Left literal; only the
  `height` (which does exactly match `--space-6`) was converted.

## Rationale

Same principle as E128: fix only exact, lossless matches. A blind
find-replace across 97 files risked breaking WCAG touch targets or silently
shrinking/growing dozens of icon and layout dimensions with no design
review — verified empirically (100% of the 44/48px and 3-digit-value buckets
checked out as non-violations) rather than assumed.

## Verification

- `npm run build` — ✅ zero TypeScript errors
- `npm run lint` — ✅ zero ESLint errors/warnings
- `npm run test` — ✅ 29/29 tests pass
- `npx tsc -b` (functions) — ✅ zero errors
- Every fix is a value-for-value substitution — zero computed-value change,
  zero visual regression by construction.

## Files Changed

`src/pages/auth/MfaEnrollPage.tsx`, `src/pages/auth/LoginPage.tsx`,
`src/pages/auth/SignUpPage.tsx`, `src/components/fireworks/BundleCard.tsx`,
`src/components/pawn/ReturnRequestForm.tsx`,
`src/components/admin/InventoryTable/columns.tsx`,
`src/components/cannabis/MoodCard.tsx`, `src/components/ui/Card.tsx`,
`src/pages/admin/social/SocialDashboardPage.tsx`,
`src/components/admin/InventoryTable/CellEditors.tsx`,
`src/pages/admin/social/SocialComposerPage.tsx`,
`src/components/fireworks/UrgencyBadge.tsx`,
`src/components/admin/InventoryTable.tsx`,
`src/components/admin/IntakeForm.tsx`, `src/pages/admin/MobileIntakePage.tsx`.

---

*The Pawn Shop · docs/decisions/0053-e130-px-triage-execution.md · 2026-08-13*
