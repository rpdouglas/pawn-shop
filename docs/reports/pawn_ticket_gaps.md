# Pawn Ticket Gap Analysis
## The Pawn Shop — Cornwall Island · Akwesasne
**Document:** PLT-20260610-VWRD (reference ticket)
**Prepared:** June 10, 2026
**Purpose:** Legal/compliance gap analysis of current pawn loan agreement template, with actionable remediation tasks for Claude Code.

---

## Context & Jurisdiction

The Pawn Shop operates on Cornwall Island (Kawehnò:ke), which is part of Akwesasne 59 — an Indian reserve under the Indian Act. This creates a three-layer regulatory environment:

| Layer | Framework | Status |
|---|---|---|
| Federal | Criminal Code (s.347), Criminal Interest Rate Regulations (SOR/2024-114, in force Jan 1 2025) | **Applies unconditionally** |
| Mohawk Council of Akwesasne (MCA) | Kaiahnehronsehra Iehiontakwa (MCA Law Registry) | **Likely primary governance — verify with MCA Justice Dept** |
| Ontario | Pawnbrokers Act RSO 1990 c.P.6, Consumer Protection Act | **Legal grey zone on reserve — requires legal opinion** |

> ⚠️ **Legal prerequisite:** Before finalizing any ticket template, obtain a legal opinion from a First Nations commercial law practitioner on whether Ontario's Pawnbrokers Act applies on Cornwall Island / Akwesasne 59, and review the MCA Law Registry for any applicable commercial lending or second-hand goods laws. Contact: MCA Justice Department, 45 Johnson Road, Kana:takon · 613-575-5000.

---

## Current Ticket — What Exists

```
Ticket No:        PLT-20260610-VWRD
Date:             Jun 10, 2026
ITEM:             Ryan                        ← customer name in wrong field; no item data
LOAN AMOUNT:      $500.00 CAD
INTEREST RATE:    4.0%                        ← flat rate only; no APR disclosed
TERM:             30 days
DUE DATE:         Jul 10, 2026
REDEMPTION AMT:   $519.75 CAD

Terms (summary):
- Customer leaves item as security
- Full redemption amount due by due date
- Non-redemption = item becomes property of shop for resale
- Extensions at staff discretion
- Ticket required for redemption
```

---

## Gap Register

### 🔴 GAP-001 — Item Description (Critical)

**What's missing:** The ITEM field contains only the customer's name. There is no description of the pledged property.

**Why it matters:**
- Core function of a pawn ticket as a legal document
- Required by Ontario Pawnbrokers Act s.14, 25 CFR §141.35(a), and standard industry practice
- Without serial numbers, you have no stolen goods paper trail and cannot cooperate with police investigations
- Exposes the business to liability if stolen property is accepted unknowingly

**Required fields to add:**
- Item category (e.g., Electronics, Jewellery, Power Tools)
- Make / Brand
- Model
- Serial number (or "None" if absent)
- Colour / finish
- Condition (Excellent / Good / Fair / Poor)
- Notable markings, engravings, or damage

**Remediation tasks for Claude Code:**
- [ ] Add `itemDescription` object to the pawn loan Firestore schema (`category`, `make`, `model`, `serialNumber`, `colour`, `condition`, `notableMarkings`)
- [ ] Add item description form section to the admin loan creation UI
- [ ] Make `serialNumber` field required for Electronics and Power Tools categories; optional with "N/A" option for others
- [ ] Render item description block in the printed ticket PDF template
- [ ] Add serial number to the loan record index for police hold / search queries

---

### 🔴 GAP-002 — Customer Identity (Critical)

**What's missing:** Only a first name ("Ryan") is captured. No address, DOB, or ID verification.

**Why it matters:**
- Required by Ontario Pawnbrokers Act and standard municipal pawn bylaws
- Without ID verification, ticket is not legally enforceable as a loan agreement
- No ability to report to police if fraud is suspected
- Cannot comply with any future MCA or Ontario record-keeping requirements

**Required fields to add:**
- Full legal name
- Date of birth
- Street address
- Phone number
- Government-issued ID type (e.g., Driver's Licence, Status Card, Passport)
- ID number
- ID issuing jurisdiction

**Remediation tasks for Claude Code:**
- [ ] Add `customerIdentity` object to Firestore customer schema (`fullName`, `dateOfBirth`, `address`, `phone`, `idType`, `idNumber`, `idJurisdiction`)
- [ ] Add customer identity form section to loan creation flow with ID type dropdown
- [ ] Add age validation: block loan creation if DOB indicates customer is under 18
- [ ] Store ID details in the customer record (not on the printed ticket) — ticket prints name and DOB only; full ID on file
- [ ] Link customer record to loan document via `customerId` foreign key
- [ ] Display masked ID reference on admin loan detail view ("ID on file: DL-ON ****1234")

---

### 🔴 GAP-003 — APR Disclosure (Critical — Federal Law)

**What's missing:** Only a flat 4% monthly rate is shown. Annual Percentage Rate (APR) is not disclosed.

**Why it matters:**
- **Federal Criminal Interest Rate Regulations (SOR/2024-114), in force January 1, 2025:** Pawn loans under $1,000 are subject to a 48% APR cap (higher than the general 35% cap), but only if APR is properly disclosed and the ticket contains the required limiting language.
- 4% per 30 days = ~48% APR — this is right at the federal cap. It is legal, but only if disclosed correctly.
- Failure to disclose APR means the exemption may not apply, potentially making the interest rate a criminal offence under s.347 of the Criminal Code.
- The 25 CFR §141.35(h) standard (applicable on Indian lands) also requires APR disclosure.

**Required additions:**
- Explicit APR field: "Annual Percentage Rate (APR): 48.0%"
- Finance charge in dollars: the ticket has $19.75 — this is correct, keep it
- Language confirming that in the event of default, the lender's **only recourse is seizure of the pledged item** (required to qualify for the 48% APR pawn exemption under SOR/2024-114)

**Remediation tasks for Claude Code:**
- [ ] Add `annualPercentageRate` computed field to loan schema (calculated from rate + term at loan creation)
- [ ] Add APR display to the printed ticket template immediately below the Interest Rate field
- [ ] Add "Lender's sole recourse on default is seizure of pledged property" to the standard terms block
- [ ] Add APR calculation utility function: `calculateAPR(flatRate, termDays)` returning APR as a percentage
- [ ] Add a compliance warning in the admin UI if calculated APR exceeds 48% for loans < $1,000, or 35% for loans ≥ $1,000

---

### 🔴 GAP-004 — Agreed Item / Replacement Value (Critical)

**What's missing:** No appraisal or agreed item value is recorded on the ticket.

**Why it matters:**
- Required by 25 CFR §141.35(e): "Replacement value of the pawn as agreed upon by the pledgor and pledgee"
- Protects the shop legally — documents that the customer agreed to the valuation basis for the loan
- Protects the customer — establishes a reference value for the item separate from the loan amount
- Required for insurance purposes if the item is lost or damaged while in the shop's possession

**Required additions:**
- "Agreed Item Value: $___" field on the ticket

**Remediation tasks for Claude Code:**
- [ ] Add `agreedItemValue` field to loan schema
- [ ] Add appraisal value input to loan creation form (required field)
- [ ] Render "Agreed Item Value" on printed ticket between the item description and loan amount blocks
- [ ] Add validation: loan amount should not exceed agreed item value (warn if it does)

---

### 🔴 GAP-005 — Default Rights & Forfeiture Process (Critical)

**What's missing:** Terms only state the item "becomes property of The Pawn Shop for resale." No process, no customer rights, no timing.

**Why it matters:**
- Required by 25 CFR §141.35(j): "A statement of the conditions of default and the pledgor's rights upon default"
- Ontario Pawnbrokers Act (if applicable) requires pledges over $5 to be disposed of by public auction
- Without a documented forfeiture process, you are exposed to civil disputes from customers who claim they weren't given fair notice or opportunity
- The current language does not mention any grace period, which may be legally required depending on applicable law

**Required additions:**
- Definition of default (non-payment by due date, no extension in place)
- Statement of any grace period before forfeiture is final
- Disposal method (public resale, auction, etc.)
- Customer's right to any surplus if item sells for more than the outstanding balance (relevant for higher-value items)
- Confirmation that once forfeited, all claims to the item are extinguished

**Remediation tasks for Claude Code:**
- [ ] Draft expanded default/forfeiture terms clause for legal review
- [ ] Add `gracePeriodDays` field to loan schema (configurable per loan type or global default)
- [ ] Add grace period display to printed ticket ("Grace period before forfeiture: X days after due date")
- [ ] Add forfeiture workflow to admin panel: loan status transitions (Active → Overdue → Grace Period → Forfeited)
- [ ] Add automated status transition logic based on due date + grace period
- [ ] Add surplus tracking: if a forfeited item sells for more than loan + fees, flag for potential customer notification

---

### 🟡 GAP-006 — Post-Maturity Charges (Significant)

**What's missing:** No disclosure of what happens financially between the due date and forfeiture.

**Why it matters:**
- Required by 25 CFR §141.35(i): "The amount, or method of computing the amount, of any charges to be assessed after the date the loan is due"
- Without this, any interest or storage fees charged after the due date are legally unsupported by the agreement

**Required additions:**
- State whether interest continues to accrue after due date and at what rate
- State any storage or handling fee for overdue items
- Or explicitly state "No additional charges accrue after the due date — item is forfeited at end of grace period"

**Remediation tasks for Claude Code:**
- [ ] Add `postMaturityChargeType` field to loan schema (`none` | `daily_interest` | `flat_fee`)
- [ ] Add post-maturity terms to printed ticket
- [ ] If `daily_interest` type: add accrual calculation to overdue loan views in admin panel

---

### 🟡 GAP-007 — Extension / Renewal Terms (Significant)

**What's missing:** "Extensions may be requested at the discretion of staff" with no terms, costs, or process.

**Why it matters:**
- Vague extension language creates disputes — customers assume extensions are free or automatic
- No documented basis for the fee charged on an extension
- Staff have no documented policy to follow

**Required additions:**
- Extension fee or rate (e.g., same 4% monthly rate on outstanding balance)
- Maximum number of extensions allowed
- Process: must be requested before the due date
- New due date calculation method

**Remediation tasks for Claude Code:**
- [ ] Add extension policy fields to shop configuration (rate, max extensions, advance notice required)
- [ ] Add "Extend Loan" action to admin loan detail view
- [ ] Add extension terms to printed ticket ("Extensions available before due date at [rate] per 30-day period, subject to staff approval. Maximum [N] extensions.")
- [ ] Log each extension event to loan history with new due date and fee charged
- [ ] Generate a receipt/confirmation for granted extensions

---

### 🟡 GAP-008 — Police Hold Clause (Significant)

**What's missing:** No mention of the shop's right or obligation to hold items under police investigation.

**Why it matters:**
- Operationally necessary — police can and do request holds on pawned items
- Without contractual authority, holding an item past the due date creates a legal dispute with the customer
- Protects the shop from liability when cooperating with law enforcement

**Required additions:**
- Clause: "The Pawn Shop reserves the right to place a police hold on any item at the request of a law enforcement agency. Items subject to a police hold may not be redeemed until the hold is lifted. The pawn period will be tolled for the duration of any police hold."

**Remediation tasks for Claude Code:**
- [ ] Add police hold clause to the standard terms block on the ticket template
- [ ] Add `policeHold` boolean + `holdDetails` fields to loan schema
- [ ] Add "Place Police Hold" action to admin loan detail view (requires badge number, officer name, date)
- [ ] When a loan is on police hold, suppress the "Redemption Available" status and show hold notice
- [ ] Toll (pause) the due date / forfeiture clock while hold is active

---

### 🟡 GAP-009 — Age & Sobriety Declaration (Significant)

**What's missing:** No declaration confirming the customer is 18+ and not impaired.

**Why it matters:**
- Ontario Pawnbrokers Act explicitly prohibits accepting pledges from anyone under 18 or visibly impaired
- Without a declaration, there is no documented due diligence if a transaction is later disputed
- Age gate is also aligned with your other regulated verticals (cannabis)

**Required additions:**
- Customer signature line with declaration: "I declare that I am 18 years of age or older, that I am the lawful owner of the item described above, and that I am not under the influence of alcohol or drugs."

**Remediation tasks for Claude Code:**
- [ ] Add customer declaration text to ticket template above signature line
- [ ] Add `customerDeclarationSigned` boolean to loan schema (set to true on ticket generation)
- [ ] Add DOB-based age validation to loan creation flow (block if under 18)
- [ ] Add "Ownership attestation" field: customer confirms they own the item or have authority to pawn it

---

### 🟡 GAP-010 — Two-Copy / Record Retention (Significant)

**What's missing:** No notation that a copy is retained by the shop.

**Why it matters:**
- Standard legal practice: two-part ticket (one for customer, one for shop records)
- Required for record-keeping compliance under any applicable pawnbroker framework
- Current ticket has no retention notation

**Remediation tasks for Claude Code:**
- [ ] Add footer to ticket: "The Pawn Shop retains a copy of this agreement. Records are kept for a minimum of [X] years in accordance with applicable law."
- [ ] Ensure loan records in Firestore are never hard-deleted (use soft delete / `archivedAt` field)
- [ ] Add record retention policy to admin documentation

---

## What the Current Ticket Does Well ✅

- Structured ticket number format (`PLT-YYYYMMDD-XXXX`) — good for records and lookups
- Loan amount, term, due date, and redemption amount are all clearly stated
- Explicit statement that ticket is required for redemption
- Authorized-by line present
- Finance charge shown in dollars ($19.75) — correct

---

## Prioritized Remediation Order

| Priority | Gap | Effort | Blocker? |
|---|---|---|---|
| 1 | GAP-003 APR disclosure | Low | Federal law — do first |
| 2 | GAP-001 Item description | Medium | Core functionality |
| 3 | GAP-002 Customer identity | Medium | Core functionality |
| 4 | GAP-004 Agreed item value | Low | Required on ticket |
| 5 | GAP-005 Default/forfeiture terms | Medium | Needs legal review |
| 6 | GAP-008 Police hold clause | Low | Copy only |
| 7 | GAP-009 Age/sobriety declaration | Low | Copy only |
| 8 | GAP-006 Post-maturity charges | Low | Policy decision needed |
| 9 | GAP-007 Extension terms | Medium | Policy decision needed |
| 10 | GAP-010 Record retention | Low | Good practice |

---

## Suggested Prompt for Claude Code

> "I have a gap analysis for our pawn loan ticket system at `/path/to/pawn-ticket-gap-analysis.md`. Please read the full file, then produce a prioritized implementation plan covering:
> 1. All Firestore schema changes needed
> 2. All UI form changes to the loan creation flow
> 3. All printed ticket template changes
> 4. Any new utility functions or validation logic
>
> Start with the schema changes as a foundation, since UI and template work depends on them. Flag any gaps that require a policy decision before implementation can proceed."

---

*Document prepared June 10, 2026. This is a technical gap analysis, not legal advice. Consult a qualified lawyer with First Nations commercial law experience before finalizing ticket language and operating procedures.*