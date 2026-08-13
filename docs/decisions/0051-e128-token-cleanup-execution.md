# Decision 0051 — E128 Design Token & Type-Safety Cleanup: Strategy C Execution

**Date:** 2026-08-13
**Epic:** E128 · Design Token & Type-Safety Cleanup
**Cycle:** 34
**Status:** Implemented (partial — see Scope Adjustment)

---

## Context

The 2026-08-13 full-codebase audit (`docs/reports/AUDIT_2026-08-13.md`) found
guardrail violations: hardcoded hex in 10 files, 3 `any` types, and raw `px`
values in ~97 files. Three strategies were planned (`docs/plans/E128_DESIGN_TOKEN_CLEANUP_PLAN.md`); **Strategy C** (hybrid: CSS tokens for CSS
contexts, an audited constants module for literal-required contexts) was
approved.

## Scope Adjustment (Gate 2 discovery)

Reading the complete current contents of every file in scope, before editing
anything, surfaced that the three-view CSS token override system described in
`docs/design-system.md` and `CLAUDE.md` (`.view-cannabis`/`.view-fireworks`
remapping `--color-primary` etc.) **does not exist in the codebase** — see
`docs/reports/FINDING_2026-08-13_VIEW_TOKEN_CSS_GAP.md`. This means the
`var(--color-primary-dim, #7A6030)`-style fallbacks in `TerpeneProfile.tsx`,
`LuxuryProductCard.tsx`, and `CannabisPage.tsx` are currently load-bearing, not
dead weight — Strategy C's plan to strip them was written under an incorrect
assumption. Per user direction, those three files were pulled out of E128's
execution scope entirely (comment-only, flagging E129) rather than partially
fixed.

## Decision

**Executed Strategy C for everything except the three Cannabis-view files
pulled per the scope adjustment above:**

1. **New token:** `--color-signature-bg: #ffffff` added to `src/index.css` `:root` (canvas signature-pad background — always white for ink visibility/print, not per-view).
2. **Stale/wrong fallback removed:** `InventoryTable/columns.tsx` — `var(--color-success, #4caf50)` → `var(--color-success)` (the real token is `#16a34a`; the fallback never matched and was unreachable dead code since `--color-success` is always defined).
3. **Real violation fixed:** `IssueLoanModal.tsx` — raw `background: '#fff'` → `var(--color-signature-bg)`.
4. **New consolidated module:** `src/lib/theme-colors.ts` — holds the three literal-required-context colors (YouTube brand-mark SVG fill, `<meta name="theme-color">` per-view map, QR-code generator contrast pair), each with a comment explaining why it can't be a CSS custom property. `YouTubeFacade.tsx`, `ViewLayout.tsx`, and `QRLabel.tsx` now import from it instead of inlining hex.
5. **`any` types resolved:**
   - `AcknowledgmentWall.tsx` — the Playwright-mock-user check appeared twice, once already correctly typed (`window as unknown as {...}`) and once still `any`. Deduplicated into one `isPlaywrightMockActive()` helper, used in both places.
   - `LoanTicketsAdminPage.tsx` — root cause was `src/components/ui/Table.tsx`'s `TableProps<T extends Record<string, unknown>>` constraint, which rejects plain interfaces without an index signature (like `LoanTicket`). Relaxed to `T extends object` and exported the `Column<T>` type. Verified against all 4 existing `Table` callers (`FaqAdminPage`, `ArticleListPage`, `DisputeAdminPage`, `LoanTicketsAdminPage`) — the other three already cast through `Record<string, unknown>`, which still satisfies `object`, so no other file needed changes.
6. **Bonus `px`/scale fixes in `index.css`:** `.portal-logo-wrap`'s hardcoded `width: 340px` now uses the pre-existing `--logo-width-clamp` token (which already covered this exact use case and is responsive, unlike the fixed value it replaced). `.portal-subtitle`'s `font-size: 21px` (not on any `--text-*` step) now uses `--text-lead` (20px, closest scale step, same visual weight class as the eyebrow-label context it's used in).
7. **`px` full triage (97 files) — deferred, not executed.** Given the scope already grew from the E129 discovery, a full per-file triage of the remaining 97 flagged files was not attempted in this pass. The `index.css` fixes above (#6) were done because they were found and unambiguous during Gate 2 reading, not because the full triage was completed.

## Not Fixed (flagged instead)

`TerpeneProfile.tsx`, `LuxuryProductCard.tsx`, `CannabisPage.tsx` — hex left
exactly as found, each with a one-line comment explaining why (load-bearing
until E129 lands) and pointing at this decision.

## Also Noted, Not Changed

`--container-max-width: 1200px` in `src/index.css` vs. `1280px` specified in
`docs/design-system.md` §7.4 — pre-existing doc/code drift, unrelated to this
epic's hex/`any` scope. Not touched; noted here for whoever picks it up next.

## Verification

- `npm run build` — ✅ zero TypeScript errors
- `npm run lint` — ✅ zero ESLint errors/warnings
- `npm run test` — ✅ 29/29 tests pass
- `npx tsc -b` (functions) — ✅ zero errors

## Files Changed

`src/index.css`, `src/components/admin/InventoryTable/columns.tsx`,
`src/components/admin/IssueLoanModal.tsx`, `src/components/ui/Table.tsx`,
`src/pages/admin/LoanTicketsAdminPage.tsx`,
`src/components/auth/AcknowledgmentWall.tsx`,
`src/components/ui/YouTubeFacade.tsx`, `src/components/layout/ViewLayout.tsx`,
`src/components/admin/QRLabel.tsx` (all modified); `src/lib/theme-colors.ts`
(new). Comment-only: `src/components/cannabis/TerpeneProfile.tsx`,
`src/components/cannabis/LuxuryProductCard.tsx`, `src/pages/CannabisPage.tsx`.

## Follow-up

- **E129** (not yet spec'd): investigate and fix the missing per-view CSS token
  override system. See `docs/reports/FINDING_2026-08-13_VIEW_TOKEN_CSS_GAP.md`.
- Full `px` triage of the remaining ~97 flagged files — could be folded into a
  future cycle or a dedicated follow-up ticket.

---

*The Pawn Shop · docs/decisions/0051-e128-token-cleanup-execution.md · 2026-08-13*
