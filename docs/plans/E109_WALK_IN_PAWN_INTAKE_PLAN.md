# E109 — Walk-in Pawn Intake · Strategy Plan

**Date:** 2026-06-10  
**Cycle:** 32  
**Epic spec:** `docs/projects/E109_WALK_IN_PAWN_INTAKE.md`

---

## Problem Statement

`IssueLoanModal` requires `pawnRequestId` and only surfaces when `status === 'quoted' && !pawnLoanId`. That document only exists when a customer submits the public online pawn enquiry form. Walk-in customers who simply arrive at the counter with an item to pawn have no path through the system. Staff have no UI to initiate a loan without first requiring the customer to use the website.

---

## Persona Gate

| Persona | Test |
|---|---|
| **Staff (Primary)** | Counter operator can initiate a walk-in pawn, collect customer info, issue loan, sign, print — without leaving the admin portal or requiring customer to use the public form |
| **Makoonsii (Secondary)** | All inputs ≥ 48px touch targets. Plain language labels. Transaction completes at the counter in one visit. |

---

## Schema Audit

### Reads / Writes

| Collection | Operation | Fields |
|---|---|---|
| `pawnRequests/{id}` | Write (create) | `uid`, `name`, `email`, `phone`, `itemDescription`, `serialNumber`, `images`, `status`, `staffNotes`, `serialBlacklistHit`, `source`, `createdAt` |
| `loanTickets/{id}` | Write (existing flow — no change) | all existing fields via `createLoanTicket` CF |
| `auditLogs` | Write (existing CF behaviour) | `pawn_request_created`, `loan_ticket_created` |

### New Field Required

| Collection | Field | Type | Notes |
|---|---|---|---|
| `pawnRequests/{id}` | `source` | `'online' \| 'walk_in'` | Distinguishes online form submissions from staff-created walk-in records |

**Pre-approval:** Schema must be updated in `docs/firestore-schema.md` before any code ships.

---

## Strategy A — Staff-Created PawnRequest + Immediate IssueLoan (Recommended)

### Architecture

1. **Schema change:** Add `source: 'online' | 'walk_in'` to `pawnRequests/{id}` in `firestore-schema.md`.
2. **New CF `createWalkInPawnRequest`** (in `functions/core/src/pawnAgreement.ts` or a new `pawnIntake.ts`):
   - Auth gate: `isStaff()` required
   - Accepts: `{ name, phone?, email?, itemDescription, serialNumber? }`
   - Creates `pawnRequest` with `status: 'quoted'`, `source: 'walk_in'`, `uid: null`, `images: []`
   - The existing Firestore `onCreate` trigger `checkSerialBlacklist` fires automatically — no extra work
   - Writes `auditLogs` entry `pawn_request_created`
   - Returns `{ pawnRequestId }`
3. **New `WalkInPawnModal.tsx`** (`src/components/admin/WalkInPawnModal.tsx`):
   - Fields: name (required), phone (optional), email (optional), item description (required), serial number (optional)
   - All inputs `minHeight: 48px` for Makoonsii touch target compliance
   - On submit: calls `createWalkInPawnRequest` CF
   - On success: closes itself, `PawnInbox` calls `setIssueLoanFor(pawnRequestId)` → `IssueLoanModal` opens
4. **`PawnInbox.tsx` update:**
   - "New Walk-in Pawn" button added to the page header (beside the existing title)
   - State: `walkInModalOpen: boolean`
   - On `WalkInPawnModal` success callback: set `issueLoanFor` to returned ID (same state used by existing "Issue Loan" rows)
   - New `issueLoanRequest` state must handle the synthetic walk-in record (description passed from modal callback, not from `requests[]` array since it may not have loaded yet)

### Files Changed

| File | Change |
|---|---|
| `docs/firestore-schema.md` | Add `source` field to `pawnRequests` |
| `docs/decisions/0022-walk-in-pawn-source-field.md` | New decision log |
| `functions/core/src/pawnIntake.ts` | New CF `createWalkInPawnRequest` |
| `functions/core/src/index.ts` | Export new CF |
| `src/components/admin/WalkInPawnModal.tsx` | New modal |
| `src/components/admin/PawnInbox.tsx` | Add button + state wiring |

**Total: ~6 files.  Scope: Small.**

### Persona Lens

- **Staff:** One button in the place they already work (PawnInbox). Walk-in intake takes ~60 seconds. Immediately flows into the existing sign + print path — no learning curve.
- **Makoonsii:** 48px inputs, plain labels ("Customer Name", "Item Description"). Transaction completes without requiring the customer to touch a phone.

### Compliance

- Serial blacklist trigger fires automatically (CF `onCreate` on `pawnRequests`)
- `auditLogs` entry written by CF (create only, no PII)
- `source: 'walk_in'` flag enables future reporting differentiation (online vs walk-in volume)
- `uid: null` for walk-in is already handled by existing types (`uid: string | null`)
- Staff auth gate (`isStaff()`) on CF — no public access

### Trade-offs

| Pro | Con |
|---|---|
| Reuses 100% of E107 sign + print flow | Creates a `pawnRequest` that will appear in PawnInbox with `quoted` status — could look odd to staff if they don't know what it is. Mitigated by `source` badge in PawnInbox. |
| Serial blacklist check fires — compliance benefit | Adds one more CF to the core module |
| Smallest scope — least regression risk | `issueLoanRequest` state in PawnInbox needs careful handling for synthetic walk-in records |

---

## Strategy B — Standalone Walk-in Loan (No PawnRequest, pawnRequestId Optional)

### Architecture

1. **Schema change:** `loanTickets.pawnRequestId` becomes optional/nullable.
2. **Modify `createLoanTicket` CF:** Accepts either `{ pawnRequestId }` OR `{ walkIn: { name, phone, itemDescription } }`.
3. **New "New Walk-in Loan" button on `LoanTicketsAdminPage`** (not PawnInbox).
4. **Unified modal:** Combined customer info + loan terms in one form (no separate WalkIn + IssueLoan modal chain).

### Files Changed

`functions/core/src/loanTickets.ts`, `src/pages/admin/LoanTicketsAdminPage.tsx`, `src/lib/types.ts`, `docs/firestore-schema.md`, new modal component.

**Total: ~5 files. Scope: Medium.**

### Trade-offs

| Pro | Con |
|---|---|
| Leaner data model — not every loan needs a pawnRequest | Loses serial blacklist check for walk-ins (compliance gap) |
| Entry point on LoanTicketsAdminPage is logical | `pawnRequestId` becoming nullable is a breaking schema change |
| Single unified form (no modal chain) | Duplicates loan terms form logic that already exists in `IssueLoanModal` |

---

## Strategy C — Unified Multi-Step Walk-in POS Modal (Best UX, Most Code)

### Architecture

Full POS intake flow:
- Step 1: Customer info (name, phone, email)
- Step 2: Item description, serial, optional photos (reuses `ImageUploadZone`)
- Step 3: Loan terms (amount, rate, days)
- Step 4: Sign & Print (reuses `IssueLoanModal` sign/print logic from E107)

New CF `createWalkInLoan` creates `pawnRequest` + `loanTicket` atomically.

### Files Changed

~8-10 files. **Scope: Large.**

### Trade-offs

| Pro | Con |
|---|---|
| Best POS UX — single cohesive flow | Most new code, highest regression risk |
| Photo capture for walk-in items is possible | Duplicates large chunks of `IssueLoanModal` and intake forms |
| Could become the basis for a full POS mode | Overkill for the immediate need |

---

## Anti-Regression Checklist (All Strategies)

- [ ] No hardcoded hex values — `var(--color-*)` only
- [ ] No invented Firestore fields — `source` added to schema first
- [ ] No AI API keys on client — no AI in this feature
- [ ] `rare-find`/`limited-edition` not touched
- [ ] No PII in `auditLogs` — `pawn_request_created` stores only IDs
- [ ] Age gates not touched — no public-facing routes in this feature
- [ ] No unapproved motion patterns

---

## Recommended Strategy: A

Strategy A reuses 100% of the E107 sign + print infrastructure, keeps the serial blacklist check firing for compliance, and delivers the feature in ~6 files. The only complexity is wiring the walk-in modal's success callback into `PawnInbox`'s existing `issueLoanFor` state, which is straightforward.

---

*The Pawn Shop · docs/plans/E109_WALK_IN_PAWN_INTAKE_PLAN.md · 2026-06-10*
