# E110 Plan — Pawn Compliance: Intake Forms & Printed Ticket
**Date:** 2026-06-10 · **Status:** Awaiting strategy approval

---

## Context

`docs/reports/pawn_ticket_gaps.md` documents ten compliance and quality gaps across the pawn loan stack. This plan addresses all of them across three strategies of increasing scope.

**Key legal context:**
- Criminal Interest Rate Regulations SOR/2024-114 (in force Jan 1 2025): APR must be disclosed on pawn agreements; the 48% APR exemption for pawn loans under $1,000 CAD requires the ticket to state the lender's only recourse on default is item seizure.
- 25 CFR §141.35: Agreed item value, post-maturity charge disclosure, customer default rights required on ticket.
- Ontario Pawnbrokers Act: Applicability on Cornwall Island is a legal grey zone — a formal opinion is recommended, but minimum pawn industry practice (ID verification, item description, APR) is prudent regardless.

**Persona Gate:**
- **Staff / POS Operator (Primary)** — complete intake, legally protected issuance
- **Makoonsii (Secondary)** — receives a complete, plain-language legal receipt

---

## State Read Summary

| Component | Current State | Gap |
|-----------|--------------|-----|
| `PrintableTicket.tsx` | Shows: shop header, ticket #, date, item description, loan terms, signature | Missing: APR, agreed value, serial #, staff name, police hold clause, age declaration, sole-recourse language, retention note |
| `IssueLoanModal.tsx` | Step 1: amount + term + rate. Step 2: signature. Step 3: print | Missing: agreed value input, ID verified confirmation, item received confirmation |
| `WalkInPawnModal.tsx` | Captures: name, item description, serial, phone, email | Missing: category, make/model, colour, condition, notableMarkings, requestedAmount |
| `PawnEnquiryForm.tsx` | Captures: name, email, phone, item description, serial | Missing: category, condition, notableMarkings, requestedAmount |
| `createLoanTicket` CF | Issues loan, copies uid + itemDescription from pawnRequest | Missing: copies serialNumber, persists issuedByDisplayName; has `?? 0.05` fallback (60% APR) |
| `createWalkInPawnRequest` CF | Accepts: name, itemDescription, phone, email, serialNumber | Does not accept: new intake fields |
| `submitPawnRequest` CF | Accepts: name, email, phone, itemDescription, serialNumber, imageUrls | Does not accept: new intake fields |

---

## Schema Audit

New fields required — added to `docs/firestore-schema.md` before this plan (Decision 0025):

**`pawnRequests/{id}` — new optional fields:**
- `itemCategory` — string
- `itemMake` — string
- `itemModel` — string
- `itemColour` — string
- `condition` — string (`'excellent'|'good'|'fair'|'poor'`)
- `notableMarkings` — string
- `requestedAmount` — number (CAD cents)
- `idType` — string (`'drivers_licence'|'status_card'|'passport'|'other'`)
- `idVerified` — boolean

**`loanTickets/{id}` — new optional fields:**
- `serialNumber` — string (copied from pawnRequest at creation)
- `issuedByDisplayName` — string (from `request.auth.token.name`)
- `agreedItemValue` — number (CAD cents)

---

## Three Strategies

---

### Strategy A — Ticket & Issuance Layer Only

**What it closes:** GAP-003 (APR), GAP-004 (agreed value), GAP-005 partial (sole-recourse text), GAP-008 (police hold clause), GAP-009 (age declaration), GAP-010 (retention note); code gaps I1–I5 (ID verified, item received, CF hardening, serial on ticket, staff name)

**What it leaves open:** GAP-001 partial (structured item details not in intake forms yet), GAP-002 partial (idType only at issuance, not intake)

#### Architecture

All changes are in the ticket/issuance layer. No intake form changes.

**`src/lib/types.ts`**
```typescript
// PrintTicketData additions:
staffName: string
serialNumber?: string
agreedItemValueCents?: number

// LoanTicket additions:
serialNumber?: string
issuedByDisplayName?: string
agreedItemValue?: number
```

**`src/components/admin/PrintableTicket.tsx`**
- Add APR row: `APR = (interestRate × (365 / periodDays) × 100).toFixed(1)%`
- Add Agreed Item Value row (if present)
- Add Serial Number row (if present)
- Add staff issuer line in footer: "Issued by [staffName]"
- Add "Customer Copy — Present with photo ID to redeem"
- Expand terms block:
  - Sole-recourse clause (required for SOR/2024-114 48% exemption)
  - Police hold clause
  - Age/ownership declaration above signature
  - Record retention note in footer

**`src/components/admin/IssueLoanModal.tsx`**
- Add Agreed Item Value input (required) with CAD $ formatting
- Add ID Type dropdown (optional): Driver's Licence / Status Card / Passport / Other
- Add "ID verified" checkbox (required before Issue Loan can proceed)
- Add "Item physically received" checkbox (required)
- Pass `staffName` from `useAuth().user?.displayName ?? 'Staff'`
- Fix due-date drift: read `dueDate` back from CF response instead of computing client-side

**`src/components/admin/PawnInbox.tsx`**
- Thread `req.serialNumber` through `setIssueLoanSerial` state
- Pass to `IssueLoanModal` as `serialNumber` prop
- Include in `handleReadyToPrint` → `PrintTicketData`

**`src/pages/admin/LoanTicketsAdminPage.tsx`**
- Reprint path: read `ticket.serialNumber` and `ticket.issuedByDisplayName` from Firestore; pass to `PrintTicketData`

**`functions/core/src/loanTickets.ts`**
- `createLoanTicket`: copy `serialNumber` from pawnRequest; set `issuedByDisplayName = request.auth.token.name ?? ''`; accept `agreedItemValue`; remove `?? 0.05` fallback (throw instead: `if (request.data.interestRate == null) throw new HttpsError('invalid-argument', 'interestRate is required')`)
- Add `dueDate` to return payload so client uses server-computed value, not recalculate

**Firestore ops:** Update only `loanTickets/{id}` (add 3 new optional fields via createLoanTicket CF). No new collections.

**Security rules:** No changes needed — existing staff-write rules cover the new fields.

#### Compliance

- APR disclosure: ✅ calculated and shown on ticket
- Sole-recourse text: ✅ added to terms (satisfies SOR/2024-114 pawn exemption condition)
- No PII in auditLogs: ✅ `idType` and `agreedItemValue` not in audit log details; `idVerified` is a boolean safe for ops logging
- policeHold / rare-find / AI keys: ✅ N/A

#### Trade-offs

| Benefit | Cost |
|---------|------|
| Fastest path to APR compliance (legally critical) | Intake forms still free-text; staff must assess condition mentally |
| No CF scope beyond loanTickets | Walk-in form still has no structure |
| Minimal blast radius (~6 files) | GAP-001/002 only partially closed |

**Estimated scope:** Small · ~6–7 files

---

### Strategy B — Ticket + Structured Intake *(Recommended)*

**What it closes:** Everything in Strategy A, PLUS GAP-001 (structured item description on intake + ticket), GAP-002 partial (idType/idVerified at intake for walk-in; at issuance for online)

#### Architecture

Everything in Strategy A, PLUS:

**`src/components/admin/WalkInPawnModal.tsx`**
- Add: Category dropdown (`itemCategory`), Make input, Model input, Colour input, Condition dropdown (`'excellent'|'good'|'fair'|'poor'`), Notable Markings textarea, Requested Amount input
- Add: ID Type dropdown (`idType`), ID Verified checkbox (`idVerified`) — staff confirms they've checked ID at walk-in intake
- Layout: collapsible "Item Details" accordion keeps the modal scannable

**`src/components/pawn/PawnEnquiryForm.tsx`**
- Add to "About the item" section: Category dropdown, Condition dropdown, Notable Markings textarea (optional), Requested Amount input (optional, labelled "How much are you looking for?")
- No ID fields — online customers are not present; ID verified at issuance

**`functions/core/src/pawnIntake.ts` (`createWalkInPawnRequest`)**
- Accept: `itemCategory?`, `itemMake?`, `itemModel?`, `itemColour?`, `condition?`, `notableMarkings?`, `requestedAmount?`, `idType?`, `idVerified?`
- Persist to `pawnRequests` doc (all optional, write only if present)

**`functions/core/src/pawnRequests.ts` (`submitPawnRequest`)**
- Accept: `itemCategory?`, `condition?`, `notableMarkings?`, `requestedAmount?`
- Persist (all optional)

**`PrintableTicket.tsx` — structured item block:**
```
ITEM
  Description: [itemDescription]
  Category: [itemCategory if present]
  Make / Model: [itemMake / itemModel if present]
  Colour: [itemColour if present]
  Serial #: [serialNumber if present]
  Condition: [condition if present]
  Notable Markings: [notableMarkings if present]
  Agreed Value: [agreedItemValueCents formatted as CAD]
```

**IssueLoanModal.tsx** — pull structured item fields from the pawnRequest (passed from PawnInbox). Display them in the Step 1 summary before issuance, so staff can verify accuracy before locking the loan.

**Firestore ops:** Same as Strategy A for `loanTickets`. For `pawnRequests`: walk-in CF and online CF both write new optional fields. No new collections.

#### Compliance

All of Strategy A, plus:
- Structured item description satisfies GAP-001 and the spirit of Ontario Pawnbrokers Act itemisation requirements
- `idType` + `idVerified` at walk-in intake closes GAP-002 partially (type of ID documented; full number in paper ledger pending E112)
- No new PII stored digitally

#### Trade-offs

| Benefit | Cost |
|---------|------|
| GAP-001 fully closed: structured item description in intake + on ticket | ~10 files vs ~7 for Strategy A |
| Walk-in intake captures everything needed for a proper pawn record | Online form gains more fields; need clear optional labelling for Makoonsii UX |
| Closes all HIGH severity gaps from report | Full customer identity (DOB, address, ID#) still deferred to E112 |
| Two CFs updated, still small blast radius | CF scope creep risk — must stay purely additive |

**Estimated scope:** Medium · ~10–11 files

---

### Strategy C — Full Compliance Pass (Requires Policy Decisions)

**What it closes:** Everything in Strategy B, PLUS GAP-002 fully (DOB + address + ID number in secure subcollection), GAP-005 fully (grace period + overdue status), GAP-006 (post-maturity charges), GAP-007 (extension policy)

#### Architecture

Everything in Strategy B, PLUS:

**New subcollection `loanTickets/{id}/identity/{doc}`** (staff-only read)
- Fields: `fullName`, `dateOfBirth`, `address`, `idType`, `idNumber`, `idJurisdiction`
- Security rule: `isStaff()` only — admin + manager + inventory_staff
- Set by `createLoanTicket` CF — staff enters in IssueLoanModal step 1
- Never readable by customers; never in `auditLogs`

**Age validation:** DOB input in IssueLoanModal step 1 → CF validates age ≥ 18 before writing loanTicket

**New `config/loanPolicy` document:**
- `gracePeriodDays`: number (e.g., 7)
- `postMaturityChargeType`: `'none'|'daily_interest'|'flat_fee'`
- `extensionFeeRatePct`: number (per-period rate for extensions)
- `maxExtensions`: number
- `recordRetentionYears`: number

**New loan status:** `overdue` (between `active` and `forfeited`) — `checkLoanDueDates` CF transitions `active` → `overdue` on due date; `overdue` → `forfeited` after `gracePeriodDays`

**Extension UI:** Admin "Grant Extension" action on `LoanTicketsAdminPage` — reads extension fee from `config/loanPolicy`, creates extension record, updates due date

**Policy decisions required BEFORE execution:**
1. What is the grace period? (Owner decision)
2. Post-maturity charge: none / daily interest at X% / flat $Y fee? (Owner decision)
3. Extension fee: same rate as original loan? Or configurable? (Owner decision)
4. Record retention: how many years? (Legal opinion recommended)

#### Compliance

All of Strategy B, plus:
- Full GAP-002 (customer identity with DOB/address/ID number in staff-only subcollection)
- Full GAP-005 (grace period disclosed on ticket, customer rights on default)
- GAP-006 (post-maturity charges policy)
- GAP-007 (extension terms fully documented)

#### Trade-offs

| Benefit | Cost |
|---------|------|
| Most comprehensive compliance pass | Requires 4 policy decisions from the owner before execution can start |
| Digitises customer identity records | PII subcollection adds security review overhead |
| Grace period eliminates unfair "instant forfeit" risk | New `overdue` status requires updating all status-dependent UI |
| Config-driven policy = no redeploy to change grace period | `config/loanPolicy` document must be created manually in Firestore before going live |

**Estimated scope:** Large · ~15+ files + new Firestore collection/schema + Firestore security rules update

---

## Comparison Matrix

| Criterion | Strategy A | Strategy B *(Rec.)* | Strategy C |
|-----------|-----------|---------------------|-----------|
| APR on ticket | ✅ | ✅ | ✅ |
| Agreed item value | ✅ | ✅ | ✅ |
| Serial # on ticket | ✅ | ✅ | ✅ |
| Staff name on ticket | ✅ | ✅ | ✅ |
| Legal terms (sole-recourse, police hold, age decl.) | ✅ | ✅ | ✅ |
| CF hardening (rate default removed) | ✅ | ✅ | ✅ |
| Structured item at intake | ❌ | ✅ | ✅ |
| ID type + verified at walk-in | ❌ | ✅ | ✅ |
| Full customer identity (DOB, address, ID#) | ❌ | ❌ | ✅ |
| Grace period / overdue status | ❌ | ❌ | ✅ |
| Extension policy + fee | ❌ | ❌ | ✅ |
| Requires policy decisions | ❌ | ❌ | ✅ (4) |
| Files changed | ~7 | ~11 | ~16+ |
| Scope | Small | Medium | Large |

---

## Recommended Strategy: B

Strategy B closes every HIGH-severity gap from the report plus all code audit gaps, without requiring any policy decisions from the owner. The structured intake fields (category, condition, make/model) materially improve the quality of pawn records and are required to properly populate the ticket's item description block.

Strategy C is the right long-term destination but should wait until the owner confirms the grace period, post-maturity charge, and extension fee policies. Those decisions should be logged as a decision doc before E111 (the follow-on) begins execution.

---

## Anti-Regression Checks

For all strategies:
- [ ] No hardcoded hex — all new UI uses `var(--color-*)` tokens
- [ ] No new fields invented outside `docs/firestore-schema.md` — Decision 0025 documents all additions
- [ ] No AI API keys on client — N/A (no AI in this epic)
- [ ] No auto-applied scarcity tags — N/A
- [ ] No PII in `auditLogs` — `idType` (string) and `idVerified` (boolean) are safe; full ID number never stored digitally
- [ ] Age gates at router level only — N/A (admin route, no new public-facing gates)
- [ ] No unapproved motion — N/A

---

## Files to Create / Modify (Strategy B)

| File | Action |
|------|--------|
| `docs/firestore-schema.md` | ✅ Updated (Decision 0025) |
| `docs/decisions/0025-pawn-compliance-schema-additions.md` | ✅ Created |
| `src/lib/types.ts` | MODIFY — add fields to `PrintTicketData`, `LoanTicket`, `PawnRequest` |
| `src/components/admin/PrintableTicket.tsx` | MODIFY — APR, agreed value, serial, structured item, improved terms |
| `src/components/admin/IssueLoanModal.tsx` | MODIFY — agreed value, idType, checkboxes, staffName, due date fix |
| `src/components/admin/WalkInPawnModal.tsx` | MODIFY — add structured intake fields |
| `src/components/pawn/PawnEnquiryForm.tsx` | MODIFY — add category, condition, notableMarkings, requestedAmount |
| `src/components/admin/PawnInbox.tsx` | MODIFY — thread serialNumber through |
| `src/pages/admin/LoanTicketsAdminPage.tsx` | MODIFY — reprint path gets serialNumber + staffName |
| `functions/core/src/loanTickets.ts` | MODIFY — CF hardening, copy fields, remove default |
| `functions/core/src/pawnIntake.ts` | MODIFY — accept new walk-in intake fields |
| `functions/core/src/pawnRequests.ts` | MODIFY — accept new online intake fields |
| `user-guide/admin/pawn-inbox.md` | MODIFY — document new intake fields |
| `user-guide/admin/loans.md` | MODIFY — document APR, agreed value, checkboxes |

---

*The Pawn Shop · docs/plans/E110_PAWN_COMPLIANCE_INTAKE_TICKET_PLAN.md · 2026-06-10*
