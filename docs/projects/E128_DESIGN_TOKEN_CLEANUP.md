# E128 — Design Token & Type-Safety Cleanup
**Status:** ✅ CLOSED (partial — see Scope Adjustment) — 2026-08-13
**Priority:** MEDIUM
**Effort:** 0.5 developer-days (actual)
**Cycle:** 34

---

## Problem

The 2026-08-13 full-codebase audit (`docs/reports/AUDIT_2026-08-13.md`) found three
outstanding guardrail violations from `CLAUDE.md`'s Active Guardrails section:

1. **Hardcoded hex values** — 10 `.tsx` files use raw hex colours instead of
   `var(--color-primary)` / design tokens: `InventoryTable/columns.tsx`,
   `IssueLoanModal.tsx`, `QRLabel.tsx`, `SerialBlacklistManager.tsx`,
   `YouTubeFacade.tsx`, `ItemQuickView.tsx`, `ViewLayout.tsx`,
   `LuxuryProductCard.tsx`, `TerpeneProfile.tsx`, `CannabisPage.tsx`.
2. **`any` types** — 3 usages: a Playwright test-mock cast in
   `AcknowledgmentWall.tsx`, and two React Table generic casts in
   `LoanTicketsAdminPage.tsx:132,134`.
3. **Raw `px` values** — ~97 files contain literal `px` strings in JSX/inline
   styles. This figure is a raw grep count and has **not** been triaged —
   it very likely includes legitimate non-token cases (1px hairline borders,
   `border-radius`, SVG viewBox coordinates) alongside real
   `--space-*`/`--text-*` violations. Triage is in scope for the plan; a
   blind find-replace is explicitly out of scope.

This is a direct continuation of the precedent set by **Cycle 24 QA — Design
Token & WCAG Fixes** and **E24 QA Token Fixes** (2026-06-02), which closed the
same category of violation for a different file set.

## Proposed Scope

- Replace hardcoded hex in the 10 identified files with the correct
  `--color-*` token per view (Pawn gold / Cannabis purple / Fireworks red /
  admin `--gmc-*` namespace, as applicable per file).
- Resolve the 3 `any` types with specific interfaces or `unknown` +
  narrowing. `LoanTicketsAdminPage.tsx`'s TanStack Table generics need a
  correctly typed `ColumnDef<LoanTicket>[]` / row type rather than `any`.
- Triage the ~97 `px`-value files: classify each hit as (a) a real
  `--space-*`/`--text-*` violation to fix, or (b) a legitimate raw-px use
  (hairline border, icon size constant, SVG geometry) to leave alone and
  document as accepted. Only category (a) gets changed.
- No schema changes. No new dependencies anticipated.

## Out of Scope

- Any visual redesign — this is a token-substitution pass, not a restyle.
- The `--motion-*` / animation guardrails (no motion violations were found
  in the audit).
- Cannabis-view files are in scope for hex/px fixes only if they don't touch
  suspended (E123) routing/logic — `CannabisPage.tsx` and
  `LuxuryProductCard.tsx` are source-preserved-but-unmounted; edits are safe
  since they don't affect anything deployed at a live route.

## Persona Gate — E128

> - **Jordan (Primary):** Editorial brand quality — inconsistent hardcoded
>   colours drift from the token system over time and are exactly the kind of
>   quiet inconsistency Jordan's quality bar exists to catch.
> - **Compliance:** `CLAUDE.md` guardrails ("Never hardcode hex values", "No
>   `any` types") are explicit non-negotiables. This epic exists to restore
>   compliance, not introduce new behavior.
> - **Makoonsii / All:** No user-facing behavior change intended — pure
>   internal-quality pass. Risk is regression, not persona harm; QA gate must
>   confirm zero visual diff on affected views.

## Acceptance Criteria

- [x] Zero hardcoded hex values remain in 7 of the 10 identified files
      (`InventoryTable/columns.tsx`, `IssueLoanModal.tsx`, `QRLabel.tsx`,
      `YouTubeFacade.tsx`, `ViewLayout.tsx` fixed/consolidated;
      `SerialBlacklistManager.tsx` and `ItemQuickView.tsx` were false
      positives, no change needed). The remaining 3
      (`TerpeneProfile.tsx`, `LuxuryProductCard.tsx`, `CannabisPage.tsx`) are
      **documented exceptions** — see Scope Adjustment below and Decision 0051.
- [x] Zero `any` types remain in `AcknowledgmentWall.tsx` and
      `LoanTicketsAdminPage.tsx`.
- [ ] `px`-value triage — **deferred**, not completed this cycle (beyond the
      two `index.css` fixes found incidentally during Gate 2 reading). See
      Decision 0051 follow-up.
- [x] `npm run build`, `npm run lint`, `npm run test`, `npx tsc -b` (functions)
      all pass — zero warnings/errors.
- [x] No visual regression — build/lint/test gates pass; the 3 documented
      exceptions were left byte-for-byte unchanged in their color logic
      specifically to guarantee zero visual diff.
- [x] Decision logged: `docs/decisions/0051-e128-token-cleanup-execution.md`.

## Scope Adjustment (see Decision 0051 for full detail)

Gate 2 verification (reading full current file contents before editing)
surfaced that the three-view CSS token override system
(`.view-cannabis`/`.view-fireworks` remapping `--color-primary` etc.) does not
exist anywhere in the codebase — see
`docs/reports/FINDING_2026-08-13_VIEW_TOKEN_CSS_GAP.md`. This invalidated the
plan's assumption that the hex fallbacks in `TerpeneProfile.tsx`,
`LuxuryProductCard.tsx`, and `CannabisPage.tsx` were dead weight — they are
currently load-bearing. Per user direction, those three files were excluded
from execution (comment-only) and the finding was logged as a separate,
higher-severity item for future prioritization (tentatively **E129**).

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — zero TypeScript errors |
| `npm run lint` | ✅ PASS — zero ESLint errors and zero warnings |
| `npm run test` | ✅ PASS — 29/29 tests pass (8 test files) |
| `npx tsc -b` (functions/) | ✅ PASS — zero errors |
| Hardcoded hex audit | ✅ PASS on 7/10 flagged files; 3 documented exceptions (Decision 0051) |
| `any` type audit | ✅ PASS — 0 remain in `AcknowledgmentWall.tsx`, `LoanTicketsAdminPage.tsx` |
| PII in logs/analytics audit | ✅ PASS — not applicable, no logging touched |
| No new Firestore fields | ✅ PASS — no schema changes |
| No new dependencies | ✅ PASS |

Full detail: `docs/reports/E128_QA_REPORT.md`, `docs/decisions/0051-e128-token-cleanup-execution.md`, `docs/reports/FINDING_2026-08-13_VIEW_TOKEN_CSS_GAP.md`.

## Docs Updated

| Doc | Change |
|-----|--------|
| `docs/EPICS.md` | E128 tasks ticked (partial); CLOSED entry added; E129 backlog entry added |
| `docs/ACTIVE_CYCLE.md` | E128 row in Completed table; Cycle Goal updated; footer timestamp updated; E129 added to Open Decisions Needed |
| `docs/decisions/0051-e128-token-cleanup-execution.md` | Decision log created |
| `docs/plans/E128_DESIGN_TOKEN_CLEANUP_PLAN.md` | Plan file |
| `docs/reports/E128_QA_REPORT.md` | QA sign-off |
| `docs/reports/FINDING_2026-08-13_VIEW_TOKEN_CSS_GAP.md` | New finding, logged for separate prioritization |

---

*The Pawn Shop · docs/projects/E128_DESIGN_TOKEN_CLEANUP.md · 2026-08-13*
