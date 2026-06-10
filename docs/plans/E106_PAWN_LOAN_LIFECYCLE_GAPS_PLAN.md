# E106 — Pawn Loan Lifecycle Gap Remediation — Plan

**Epic:** E106  
**Date:** 2026-06-09  
**Author:** Claude Code (Phase A Plan)  
**Status:** ⏳ AWAITING APPROVAL

---

## Background

A lifecycle audit (2026-06-09) of the pawn loan system identified six gaps between the E31
spec, the Firestore schema, and the deployed implementation. E31 explicitly required all
loan status changes to route through Cloud Functions with full `auditLogs` coverage —
several do not.

### The Six Gaps

| # | Gap | Files | Severity |
|---|-----|-------|----------|
| 1 | No admin UI to issue a loan from a pawn request | `src/lib/useLoanTickets.ts:81`, `src/components/admin/PawnInbox.tsx` | **High** |
| 2 | PawnRequest status changes bypass Cloud Functions; no auditLog written | `src/components/admin/PawnInbox.tsx:107` | **Medium** |
| 3 | Six loan event types absent from `firestore-schema.md` auditLogs table | `docs/firestore-schema.md` | **Medium** |
| 4 | `redemptionAmount` never written to `loanTickets/{id}` on redemption | `functions/core/src/loanTickets.ts:179` | **Low** |
| 5 | Auto-forfeit scheduler does not transition linked item to `active` | `functions/core/src/loanTickets.ts:270` | **Medium** |
| 6 | Extension decline silently returns to `active` with no distinct audit trail capture beyond the `extension_declined` auditLog | `functions/core/src/loanTickets.ts:149` | **Low** |

---

## Personas

| Persona | Relevance |
|---------|-----------|
| **Staff** `[Staff]` | Gap 1 is a full blocker — no way to issue a loan ticket from the admin UI |
| **Makoonsii** `[Mak]` | Any new loan issuance UI must meet 48px touch targets and plain language copy |
| **Compliance** `[Comp]` | Gaps 2 and 3 directly violate E31's "all status changes via CF Admin SDK" requirement |

**Persona Gate:**  
- Gap 1 UI: Makoonsii Loan Form Test — one-handed portrait mode, ≥48px targets, no financial jargon  
- Gap 2 CF: Compliance Audit Trail Test — every pawnRequest status change must produce an auditLog entry  
- Gaps 3–6: No customer-facing persona test; these are staff/compliance fixes

---

## Schema Audit

All required Firestore fields already exist. No new collections or document fields are introduced by any strategy.

**Collections touched:**

| Collection | Read / Write | Relevant Fields |
|------------|-------------|-----------------|
| `pawnRequests/{id}` | R/W | `status`, `staffNotes`, `pawnLoanId` (read — already in schema, missing from `PawnRequest` TypeScript interface) |
| `loanTickets/{id}` | R/W | `status`, `redemptionAmount`, `itemId`, `extensionCount`, `updatedAt` |
| `auditLogs/{id}` | W (create-only) | `eventType`, `uid`, `targetId`, `details`, `createdAt` |
| `items/{id}` | W | `status`, `policeHold`, `updatedAt` |
| `users/{uid}` | R | `alertOptIn`, `phoneNumber` |

**Schema doc changes required (documentation only — no Firestore structure change):**

Update `auditLogs.eventType` in `docs/firestore-schema.md` to add:
- `loan_ticket_created`
- `loan_redeemed`
- `loan_forfeited`
- `extension_requested`
- `extension_approved`
- `extension_declined`
- `pawn_request_status_updated` (new — needed for Gap 2 CF)

**TypeScript gap (not a schema change):**
Add `pawnLoanId?: string` to the `PawnRequest` interface in `src/lib/types.ts` so the admin UI can detect whether a loan ticket already exists and prevent duplicate issuance.

---

## Three-Strategy Proposal

---

### Strategy A — Documentation + Backend Hotfixes (4 of 6 gaps)

**Scope:** Small | **Estimated files:** 5 | **Effort:** ~0.5 developer-days

**What it fixes:**
- **Gap 3** — Schema docs: add 6 missing event types to `firestore-schema.md`
- **Gap 2** — Replace direct `updateDoc` in `PawnInbox.tsx` with a new `updatePawnRequestStatus`
  callable CF that also writes a `pawn_request_status_updated` auditLog entry
- **Gap 4** — `redeemLoanTicket` CF accepts and persists the manually-entered `redemptionAmount`
  (cash amount; Stripe payment intent still handled by E79)
- **Gap 5** — One-line fix in `checkLoanDueDates` to update `items/{id}` to `active` when the
  linked `itemId` is present (mirrors the existing logic in `forfeitLoan`)
- **Gap 6** — No status model change. The `extension_declined` auditLog event already fires. Accept
  the current `active`-return behaviour as intentional and document it.

**What it defers:**
- **Gap 1** — No UI to issue a loan from a pawn request. The `useIssueLoanTicket` hook remains
  unused. Staff must invoke the `createLoanTicket` CF via Firebase console or a future epic.

**Architecture:**
- New callable CF `updatePawnRequestStatus` in `functions/core/src/pawnRequests.ts`
- `PawnInbox.tsx` `handleSave` calls CF instead of `updateDoc`
- `redeemLoanTicket` CF signature adds optional `redemptionAmount: number`
- `checkLoanDueDates` auto-forfeit block gains a conditional item-status update

**Compliance:**
- Closes Gap 2 (auditLog on pawnRequest status change) ✅
- Closes Gap 3 (schema doc alignment) ✅
- Leaves Gap 1 open — no new compliance exposure, but the primary workflow (loan issuance) remains inaccessible from the UI

**Trade-offs:**
- ✅ Fastest to deliver; zero UI scope; minimal regression risk
- ✅ All backend fixes are self-contained
- ❌ Leaves the highest-impact gap (Gap 1) completely open
- ❌ Staff still cannot issue loans without a developer or console workaround

**Anti-regression check:** ✅ No hardcoded hex; no new Firestore fields; no AI keys on client; no auto-tagging; no PII in logs; age gates untouched; no motion violations

---

### Strategy B — Issue Loan Modal in PawnInbox + Full Backend Fix ✅ RECOMMENDED

**Scope:** Medium | **Estimated files:** 8 | **Effort:** ~1.5 developer-days

**What it fixes:** All 6 gaps.

**Architecture:**

*Backend changes:*
- `functions/core/src/pawnRequests.ts` — add `updatePawnRequestStatus` callable CF (admin/manager/inventory_staff). Validates ownership of the request, transitions status, writes `pawn_request_status_updated` auditLog. Replaces the direct `updateDoc` in `PawnInbox.tsx`.
- `functions/core/src/loanTickets.ts` — `redeemLoanTicket` CF: accept and persist `redemptionAmount` (CAD cents, optional; for cash transactions before E79 Stripe lands).
- `functions/core/src/loanTickets.ts` — `checkLoanDueDates` auto-forfeit block: add the same item-transition logic already present in `forfeitLoan` (update linked `items/{id}` to `status: 'active'`, `policeHold: false` when `itemId` is set).

*Frontend changes:*
- `src/lib/types.ts` — add `pawnLoanId?: string` to `PawnRequest` interface.
- `src/lib/useLoanTickets.ts` — `useIssueLoanTicket` already implemented; no changes needed.
- `src/components/admin/PawnInbox.tsx` — three changes:
  1. Update `handleSave` to call the `updatePawnRequestStatus` CF instead of `updateDoc`.
  2. Add "Issue Loan" button to the expanded detail row, enabled only when `req.status === 'quoted'` and `req.pawnLoanId` is falsy (prevents double-issue).
  3. "Issue Loan" opens `IssueLoanModal`.
- `src/components/admin/IssueLoanModal.tsx` — new component. Staff enters: loan amount (CAD cents), term in days, interest rate (defaults to 5%). Submit calls `useIssueLoanTicket`. Success shows the generated loan ticket ID and closes. ≥48px inputs, plain-language labels.
- `docs/firestore-schema.md` — add 7 event types to `auditLogs.eventType`.

*Gap 6:* No status model change. When extension is declined, the CF already writes an `extension_declined` auditLog and returns the ticket to `active`. This is correct behaviour — `active` is the accurate post-decline state. The auditLog captures the event; no new status value is needed.

**Firestore ops:**
- `pawnRequests/{id}` — write via CF only (no more direct client writes)
- `loanTickets/{id}` — write via existing CFs
- `auditLogs/{id}` — create-only

**Security rules impact:** None. The existing `isStaff` and `isOwner` rules cover all collections. The new CF uses Admin SDK.

**Persona Lens:**
- **Makoonsii:** `IssueLoanModal` inputs and "Issue Loan" button are ≥48px. Plain language: "Loan Amount", "Loan Term (days)", "Interest Rate". No financial jargon.
- **Staff:** Gap 1 is fully closed — the highest-priority blocker is resolved.
- **Compliance:** Gaps 2 and 3 fully closed. Every pawnRequest status change now produces an auditLog entry via CF.

**Compliance:**
- `auditLogs` written via Admin SDK CF — never from client ✅
- No PII in auditLog details (request ID only) ✅
- `policeHold` untouched ✅
- `rare-find`/`limited-edition` tags untouched ✅
- Age gates at router level — untouched ✅
- No AI API keys on client ✅

**Trade-offs:**
- ✅ Closes all 6 gaps in one cycle
- ✅ `IssueLoanModal` is a simple, focused component — no over-engineering
- ✅ CF-only writes satisfies E31 compliance requirement
- ⚠️ `IssueLoanModal` is a new component — requires Makoonsii persona smoke test before close
- ⚠️ Replacing `updateDoc` with a CF call in `PawnInbox` requires verifying the real-time `onSnapshot` still reflects updates (it will, because the CF writes via Admin SDK to the same collection)

**Anti-regression check:** ✅ No hardcoded hex; no new Firestore fields; `pawnLoanId` is a doc-fix not a new field; no AI keys on client; no auto-tagging; no PII in new logs (`requestId` only); age gates untouched; no motion patterns

---

### Strategy C — Dedicated Pawn Operations Admin Section (All gaps + UX enhancement)

**Scope:** Large | **Estimated files:** 14 | **Effort:** ~3 developer-days

**What it fixes:** All 6 gaps plus a significant UX improvement for the admin pawn workflow.

**Architecture:**

Everything in Strategy B, plus:
- **New page:** `src/pages/admin/PawnRequestDetailPage.tsx` — dedicated full-page view at `/admin/pawn-requests/:id`.
  Shows: customer contact info, item description, photos, serial status, full pawnRequest status timeline,
  and — when status is `quoted` — the full loan issuance form (not a modal, but an inline panel).
  Links to the associated loan ticket if `pawnLoanId` is set.
- **New page:** `src/pages/admin/PawnOperationsDashboardPage.tsx` — combined view at `/admin/pawn-operations`.
  Two-panel layout: open pawnRequests on the left, active loanTickets on the right. Replaces the current separate
  `/admin/pawn-inbox` and `/admin/loans` routes (or augments them with a cross-link).
- **New component:** `src/components/admin/LoanTimeline.tsx` — visual status history for a loan ticket using
  `auditLogs` query by `targetId`. Shows: created → active → extension_requested (if applicable) → redeemed/forfeited.
- **Updated:** `src/components/layout/AdminSidebar.tsx` — replace separate "Pawn Inbox" and "Loans" entries
  with a single "Pawn Operations" group entry.

**Persona Lens:**
- **Staff:** Most efficient — loan issuance is inline on the request detail page; no modal switching.
- **Makoonsii:** Dedicated page has more room for accessible, large-format controls than the cramped expanded row in a table.
- **Compliance:** Full audit trail visible to staff without leaving the admin UI.

**Trade-offs:**
- ✅ Best long-term UX; closes all gaps; adds meaningful transparency (loan timeline)
- ✅ Positions the system for E32 (Digital Pawn Wallets) which references loan ticket data
- ❌ Largest scope; highest regression risk from sidebar refactor
- ❌ `LoanTimeline` requires an `auditLogs` query by `targetId` — this may need a composite Firestore index
- ❌ 3 developer-days is the longest of the three strategies; other cycle priorities may compete

**Anti-regression check:** ✅ Sidebar changes use existing CSS tokens; no hardcoded hex; no new Firestore fields; no AI keys on client; age gates untouched; motion: no new animations

---

## Summary Table

| | Strategy A | Strategy B (Recommended) | Strategy C |
|--|------------|--------------------------|------------|
| Gap 1 — Loan Issuance UI | ❌ Deferred | ✅ Modal in PawnInbox | ✅ Inline on detail page |
| Gap 2 — Unaudited pawnRequest writes | ✅ New CF | ✅ New CF | ✅ New CF |
| Gap 3 — Schema event type docs | ✅ Docs update | ✅ Docs update | ✅ Docs update |
| Gap 4 — redemptionAmount not written | ✅ CF + UI | ✅ CF + UI | ✅ CF + UI |
| Gap 5 — Scheduler item transition | ✅ One-line fix | ✅ One-line fix | ✅ One-line fix |
| Gap 6 — Extension decline status | ✅ Documented | ✅ Documented | ✅ Documented |
| Estimated effort | ~0.5 days | ~1.5 days | ~3 days |
| Estimated files | ~5 | ~8 | ~14 |
| Compliance gate satisfied | Partial | **Full** | Full |

---

## Recommended Strategy

**Strategy B** is recommended. It closes all 6 gaps in a bounded scope, satisfies the E31
compliance requirement fully (CF-only writes to `pawnRequests` and `loanTickets`), and introduces
exactly one new component (`IssueLoanModal`) which is small and testable. Strategy A is too
incomplete to satisfy the compliance requirement. Strategy C is the correct long-term direction
but belongs in a future epic once the immediate gaps are patched.

---

## Execution Tasks (if B is approved)

1. Update `docs/firestore-schema.md` — add 7 event types to `auditLogs.eventType`
2. Update `src/lib/types.ts` — add `pawnLoanId?: string` to `PawnRequest`
3. Add `updatePawnRequestStatus` callable CF to `functions/core/src/pawnRequests.ts`
4. Update `redeemLoanTicket` CF — accept and write `redemptionAmount`
5. Update `checkLoanDueDates` — add item-status transition on auto-forfeit
6. Update `src/components/admin/PawnInbox.tsx` — route status save through CF; add "Issue Loan" button
7. Create `src/components/admin/IssueLoanModal.tsx` — loan issuance form (≥48px, plain language)
8. Run `npm run build` and `npx tsc -b` — zero errors gate

---

*The Pawn Shop · docs/plans/E106_PAWN_LOAN_LIFECYCLE_GAPS_PLAN.md · 2026-06-09*
