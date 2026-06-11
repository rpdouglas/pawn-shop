# E116 — Pawn Intake & Ticket UX Improvements — Plan
**Date:** 2026-06-11
**Status:** Awaiting approval

---

## Context

Three related UX gaps:

1. **Duplicate ID:** `WalkInPawnModal` captures `idType` + `idVerified` but they are not included in `IssueLoanCtx`. `IssueLoanModal` asks again independently. One walk-in transaction = two ID-verification entries.

2. **No pre-commitment cost preview:** The loan cost summary (interest $ amount, total redemption, due date) is only visible in step 2 of `IssueLoanModal` after `createLoanTicket` has already been called. Staff cannot quote the customer before locking in the loan.

3. **Ticket terms present but not actionable:** Extension and default clauses exist on page 2 of the printed ticket but give no contact channel, no specific timeline, and no plain-language "what you need to do" instruction.

---

## Data Flow Trace — Current State

```
WalkInPawnModal.onSuccess(pawnRequestId, itemDesc, serialBlacklistHit, itemData?)
  └─ itemData: { serialNumber, itemCategory, itemMake, itemModel, itemColour, condition, notableMarkings }
  └─ ⚠ idType / idVerified NOT in itemData — dropped here

PawnInbox.handleWalkInSuccess → setIssueLoanCtx({ pawnRequestId, itemDescription, ...itemData })
  └─ IssueLoanCtx: { pawnRequestId, itemDescription, serialNumber, itemCategory, ... }
  └─ ⚠ no idType / idVerified

IssueLoanModal receives props including serialNumber, itemCategory, etc.
  └─ ⚠ no initialIdType / initialIdVerified → starts blank → staff enters again
```

---

## Persona Gate

| Persona | Role |
|---|---|
| **Staff** `[Staff]` | Primary. The POS operator runs both modals back-to-back for every walk-in. Duplicate entry wastes time and introduces inconsistency. |
| **Makoonsii** `[Mak]` | Secondary. Walk-in customer whose loan terms must be clearly communicated before signing. Printed ticket is her only record — it must be plain-language and actionable. |

---

## Schema Audit

No Firestore field changes in any strategy. All changes are:
- UI state only (`IssueLoanCtx`, `IssueLoanModalProps`)
- Callback signature type (`WalkInPawnModalProps.onSuccess`)
- JSX/copy in `PrintableTicket.tsx`

No schema update or decision file required for Strategies A and B.
Strategy C adds no new Firestore reads or writes.

**Schema sync: complete — no changes needed.**

---

## Anti-Regression Checklist (all strategies)

| Rule | Status |
|---|---|
| No hardcoded hex | ✅ — cost preview uses `var(--color-surface)`, `var(--color-primary)`, `var(--color-text-muted)` |
| No invented Firestore fields | ✅ — no schema changes |
| No AI API keys on client | ✅ — not applicable |
| No scarcity tags | ✅ — not applicable |
| No PII in logs | ✅ — not applicable |
| Age gates at router level | ✅ — not touched |
| No unapproved motion | ✅ — no animation added |

---

## Strategy A — Fix ID + Basic Inline Cost Preview

### Architecture

**`WalkInPawnModal.tsx`:**
- Add `idType` and `idVerified` to the `onSuccess` callback parameter object alongside `itemData`.

**`PawnInbox.tsx`:**
- Add `idType?: string` and `initialIdVerified?: boolean` to `IssueLoanCtx`.
- Update `handleWalkInSuccess` to extract and forward them.
- Pass `initialIdType` and `initialIdVerified` as new props on `<IssueLoanModal>`.

**`IssueLoanModal.tsx`:**
- Add `initialIdType?: string` and `initialIdVerified?: boolean` to `IssueLoanModalProps`.
- Use them as `useState` initial values: `useState(initialIdType ?? '')` and `useState(initialIdVerified ?? false)`.
- In the existing `useMemo` block, compute a simple inline cost summary — interest dollar amount, redemption total, APR, projected due date — rendered as plain text below the rate field (or the warning banner) when all three values are valid.

No ticket changes.

### Persona Lens

- **Staff:** ID fields pre-filled from walk-in — one less step. Cost figures visible on the same screen where rate is entered — can quote verbally to the customer.
- **Makoonsii:** No change to her experience. Ticket is unchanged.

### Trade-offs

**Benefits:** Smallest change. Fix is surgical — only threads existing data that's already collected. Cost preview is unobtrusive (text only, no new visual treatment).

**Costs:** Cost figures are plain text below the rate field — not visually distinct enough to be shown to a customer on screen. Ticket gaps are not addressed.

### Scope: **Small — 3 files, ~50 lines**

---

## Strategy B — Fix ID + Styled Customer Quote Panel (Recommended)

### Architecture

Everything in Strategy A, plus:

**`IssueLoanModal.tsx` — cost preview panel:**
Replace the simple text with a styled "Quote for Customer" card rendered below the ID/confirmation section in step 1 (below `itemReceived` checkbox, above the buttons) — visible only when loan amount, term, and rate are all valid numbers.

The card uses `var(--color-surface)` background + `var(--color-primary)` accent on the redemption amount, with the following fields:
- You borrow: **$XXX.XX**
- Interest: **$X.XX** (X.XX% for N days)
- **You owe back: $XXX.XX** (large, `var(--color-primary)`)
- Due date: **[date]**
- APR: ~X.X%

This is designed to be turned toward the customer on the POS tablet before the loan is committed. Staff hits "Issue Loan" after the customer has seen and agreed to the figures verbally.

No ticket changes.

### Persona Lens

- **Staff:** Quote card gives staff a professional, readable screen to show the customer. Replaces the current verbal calculation from rate%.
- **Makoonsii:** Sees the total amount owed in plain dollars before any signing occurs. Builds trust (she is not surprised at the signing step).

### Trade-offs

**Benefits:** The quote panel serves both staff and customer simultaneously. The figures are large, clear, and dollar-denominated rather than percentage-based — the format Makoonsii actually understands.

**Costs:** Slightly more styling work (~30 extra lines vs Strategy A). Still doesn't address the ticket content gaps.

### Scope: **Small-Medium — 3 files, ~80 lines**

---

## Strategy C — B + Actionable Ticket Terms

### Architecture

Everything in Strategy B, plus:

**`PrintableTicket.tsx` — enhanced terms (page 2):**

Replace the existing three-sentence extension paragraph with a more specific version:

> *"To request an extension, visit The Pawn Shop in person or contact staff before the due date shown above. Extensions are granted at staff discretion and may require a partial interest payment. Bring this ticket and valid photo ID."*

Replace the existing default paragraph's position — keep the sole-recourse clause but add a plain-language summary *before* the legal text:

> *"If you do not redeem the item by the due date and have not requested an extension, your item becomes the property of The Pawn Shop. No further debt, fees, or legal action will be taken against you."*

Add a "How to Redeem" action line to the footer (below the existing "Authorized by" line):

> *"To redeem or extend: visit The Pawn Shop · Cornwall Island · Akwesasne before [due date]."*

Where `[due date]` is `formatDate(data.dueDate)` — dynamic per ticket.

### Persona Lens

- **Staff:** Ticket is a self-contained document the customer can reference without calling the shop.
- **Makoonsii:** The ticket now answers "what do I do if I can't pay?" and "how do I extend?" in plain language — not legal jargon. She can read the ticket at home and know exactly what to do. This is the Makoonsii Trust Test.

### Trade-offs

**Benefits:** Closes the most customer-facing gap. The ticket is the only document the customer takes home — it should be a complete reference. Reduces customer service calls about "what happens if I can't pay back."

**Costs:** One additional file. The copy changes are not Firestore schema-related but should be reviewed against any applicable regulatory requirements (the sole-recourse language must remain).

### Scope: **Medium — 4 files, ~110 lines**

---

## Strategy Comparison

| Criterion | A | B | C |
|---|---|---|---|
| ID duplication fixed | ✅ | ✅ | ✅ |
| Live cost preview | Text only | ✅ Styled card | ✅ Styled card |
| Staff can show customer on tablet | ❌ | ✅ | ✅ |
| Ticket extension guidance | ❌ | ❌ | ✅ |
| Ticket default guidance | ❌ | ❌ | ✅ |
| Files changed | 3 | 3 | 4 |
| Estimated lines | ~50 | ~80 | ~110 |

**Recommendation: Strategy C.** The ticket is the customer's only take-home document. Making it actionable is exactly what Makoonsii needs — she should be able to look at the ticket at home and know what to do without calling the shop. The extra scope (one file, ~30 lines of copy) is minimal.

---

## Files by Strategy

| File | A | B | C |
|---|---|---|---|
| `src/components/admin/WalkInPawnModal.tsx` | ✅ | ✅ | ✅ |
| `src/components/admin/PawnInbox.tsx` | ✅ | ✅ | ✅ |
| `src/components/admin/IssueLoanModal.tsx` | ✅ | ✅ | ✅ |
| `src/components/admin/PrintableTicket.tsx` | — | — | ✅ |

---

*The Pawn Shop · docs/plans/E116_PAWN_INTAKE_UX_IMPROVEMENTS_PLAN.md · 2026-06-11*
