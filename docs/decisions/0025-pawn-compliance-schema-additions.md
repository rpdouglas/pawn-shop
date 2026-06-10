---
status: accepted
date: 2026-06-10
epic: E110
---

# 0025 — Pawn Compliance Schema Additions: Intake Fields + Ticket Metadata

## Context

A legal/compliance gap analysis of the pawn loan flow (see `docs/reports/pawn_ticket_gaps.md`) identified gaps in:

1. **Printed ticket legal validity** — missing APR disclosure, agreed item value, staff issuer name, and serial number on the ticket document
2. **Intake data quality** — intake forms collect a free-text item description only; no structured category, condition, make/model, or ID verification fields
3. **Cloud Function hardening** — `createLoanTicket` does not persist the issuing staff member's name or copy the serial number to the loan record

The gap report references both Canadian federal law (Criminal Interest Rate Regulations SOR/2024-114) and 25 CFR §141.35 (US Indian lands pawn regulation) as applicable compliance frameworks. On the Ontario/Canada side of Akwesasne, the Criminal Code caps are unconditionally applicable; provincial Pawnbrokers Act applicability is a legal grey zone requiring a formal opinion.

## Decision

Add the following fields to `pawnRequests/{id}` and `loanTickets/{id}` to support E110 work.

### New fields on `pawnRequests/{id}`

| Field | Rationale |
|-------|-----------|
| `itemCategory` | Structured classification enables faster valuation; required for serial-mandatory rule on electronics |
| `itemMake` | Used in item description block on printed ticket |
| `itemModel` | Same; also used for stolen goods identification |
| `itemColour` | Physical identification of pledged item |
| `condition` | Affects loan valuation; staff reference; displayed on ticket |
| `notableMarkings` | Distinctive features used to confirm correct item is returned on redemption |
| `requestedAmount` | Staff reference during issuance — customer's stated need |
| `idType` | Documents which type of government ID was verified |
| `idVerified` | Boolean gate; staff confirms ID was checked before loan is issued |

**PII decision on ID numbers:** The full government ID number is NOT stored in Firestore at this stage. It is recorded in the paper ledger only. `idType` and `idVerified` provide compliance evidence that ID was checked without creating a digital PII store that would require additional security controls. A future epic (E112) may implement a secure `loanTickets/{id}/identity/{doc}` subcollection for digitising ID records if the business decides to go paperless.

### New fields on `loanTickets/{id}`

| Field | Rationale |
|-------|-----------|
| `serialNumber` | Copied from `pawnRequests/{id}.serialNumber` at `createLoanTicket` CF execution so reprinting from `LoanTicketsAdminPage` can display it without a second Firestore read |
| `issuedByDisplayName` | `request.auth.token.name` persisted at creation time; printed on ticket as the issuing authority; protects business if the issuing staff member later leaves |
| `agreedItemValue` | Required by 25 CFR §141.35(e) — "replacement value of the pawn as agreed upon by pledgor and pledgee." Also important for insurance if the item is lost or damaged while in the shop's possession |

### Condition scale

`pawnRequests.condition` uses `'excellent'|'good'|'fair'|'poor'` (4-point scale) rather than the items schema's `'new'|'like-new'|'good'|'fair'|'poor'` (5-point). Pawn items are always pre-owned, so `'new'` is not a valid intake assessment. Using a separate scale avoids confusion.

## Consequences

- `createLoanTicket` CF must be updated to: (a) copy `serialNumber` from the pawnRequest read it already performs, (b) persist `request.auth.token.name` as `issuedByDisplayName`, (c) accept and store `agreedItemValue` from the client
- `createWalkInPawnRequest` CF must accept the new optional intake fields
- `submitPawnRequest` CF must accept the new optional intake fields
- Frontend: `PrintTicketData` interface gains `staffName`, `serialNumber?`, `agreedItemValue?`; the ticket renders all three
- Full ID number collection deferred to E112 pending legal opinion on applicable jurisdiction

---

*The Pawn Shop · docs/decisions/0025-pawn-compliance-schema-additions.md · 2026-06-10*
