# E128 — Design Token & Type-Safety Cleanup
**Status:** 🔄 IN PROGRESS
**Priority:** MEDIUM
**Effort:** TBD (sized in `/plan`)
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

- [ ] Zero hardcoded hex values remain in the 10 identified files (or a
      documented reason is logged in `DECISIONS.md` for any left in place).
- [ ] Zero `any` types remain in `AcknowledgmentWall.tsx` and
      `LoanTicketsAdminPage.tsx`.
- [ ] `px`-value triage table produced and committed (which files change,
      which are accepted-as-is and why).
- [ ] `npm run build`, `npm run lint`, `npm run test`, `npx tsc -b` (functions)
      all pass — zero warnings/errors (per `CLAUDE.md`'s blocking gate).
- [ ] No visual regression on Pawn/Cannabis/Fireworks/Admin views (manual
      spot-check or Playwright screenshot diff where available).
- [ ] Decision(s) logged in `docs/decisions/`.

---

*The Pawn Shop · docs/projects/E128_DESIGN_TOKEN_CLEANUP.md · 2026-08-13*
