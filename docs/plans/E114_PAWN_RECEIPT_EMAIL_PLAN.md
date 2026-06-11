# E114 — Pawn Loan Receipt Email: Plan
**Status:** 🔄 AWAITING STRATEGY APPROVAL
**Date:** 2026-06-11
**Cycle:** 34

---

## Problem Restatement

After a pawn loan is signed, the customer's only record is the printed paper ticket. There is no digital copy. The shop has email hosting through CanSpace.ca. This plan adds an HTML receipt email sent to the customer's email address covering the key loan summary.

---

## Persona Gate

| Persona | Requirement |
|---------|-------------|
| **Makoonsii** (primary) | Plain-language summary. No financial jargon. 48px touch targets on any new UI element. Trust signal: "A copy has been sent to your email." |
| **Staff** (primary) | The workflow must not gain a mandatory extra step. If email delivery fails silently (no address on file), the loan issuance must still complete normally. |
| **Jordan** (secondary) | HTML email matches the dark luxury aesthetic: `#080706` background, `#C8A14A` gold headings, Georgia serif font — consistent with `buildDigestHtml` in `notifications.ts`. |
| **Compliance** | `pawn_receipt_emailed` auditLog entry (no PII in `details`). CASL `alertOptIn` NOT required here — this is a transactional receipt tied to a signed agreement, not a marketing communication. Receipt email must not include `staffNotes` or `staffNotes`-derived content. No PII in console logs. |

---

## Current Infrastructure

| Asset | Location | Notes |
|-------|---------|-------|
| `dispatchEmail` helper | `functions/shared/src/email.ts` | Uses `@sendgrid/mail`. Skips gracefully when `sendgridApiKey === 'dummy'` |
| `sendgridApiKey` secret | `functions/shared/src/secrets.ts` | Already defined; dummy in dev |
| `sendgridFromEmail` param | `functions/shared/src/secrets.ts` | Already defined; configured per deploy |
| `signPawnAgreement` CF | `functions/core/src/pawnAgreement.ts` | Fires after signature canvas PNG is stored |
| `pawnRequests/{id}.email` | Firestore | Optional — walk-in requests may have no email |
| `users/{uid}.email` | Firestore | Present for registered customers |
| `loanTickets/{id}` | Firestore | All loan summary data available |

---

## Email Address Resolution

The CF must resolve the customer email in order:
1. If `loanTickets.uid` is a non-empty string → read `users/{uid}.email`
2. Else → read `pawnRequests/{pawnRequestId}.email`
3. If neither exists → **skip silently** (no error thrown; no email sent)

---

## Proposed Email Content (all strategies share this)

| Section | Content |
|---------|---------|
| From | `noreply@<configured domain>` |
| Subject | `Your Pawn Loan — Ticket #PLT-XXXXXXXX` |
| Header | Shop logo + "Cornwall Island · Akwesasne" |
| Body | Ticket number, item description, loan amount (CAD), agreed item value, interest rate, APR, due date, staff name |
| Footer | "Your signed agreement is on file at The Pawn Shop. To redeem, visit us before [due date]." + "This is a transactional receipt — not marketing." |
| Design | `#080706` background · `#C8A14A` headings · Georgia serif · inline CSS only |

**Not included:** full legal Terms & Conditions text, signature image, `staffNotes`, serial number (omitted from email for security — item identification data stays at the counter).

---

## Schema Changes (pre-approved — Decision 0032)

| Collection | Field | Type |
|-----------|-------|------|
| `loanTickets/{id}` | `receiptEmailSentAt` | timestamp |
| `loanTickets/{id}` | `receiptEmailAddress` | string |

---

## Strategy A — Auto-Send on Sign, SendGrid + CanSpace Domain

### Architecture

Extend `signPawnAgreement` CF (`functions/core/src/pawnAgreement.ts`):
1. After updating the ticket document with `signatureUrl`/`signedAt`, check `receiptEmailSentAt` (idempotency).
2. Resolve customer email (uid → users, fallback → pawnRequests).
3. Build HTML receipt using a new `buildReceiptHtml(ticket, email)` helper.
4. Call `dispatchEmail(to, subject, html)` — existing helper.
5. Update `loanTickets/{id}` with `receiptEmailSentAt` + `receiptEmailAddress`.
6. Write `pawn_receipt_emailed` auditLog entry (no email address in `details`).

**CanSpace.ca connection:** The `sendgridFromEmail` parameter is set to the CanSpace-hosted domain (e.g. `noreply@thepawnshop.ca`). SendGrid sends *on behalf of* that domain. Requires adding two DNS records to CanSpace nameservers:
- SPF `TXT` record: `v=spf1 include:sendgrid.net ~all`
- DKIM `CNAME` record: provided by SendGrid domain verification wizard

This is a one-time DNS operation — no code change.

**Secrets:** No new secrets. Uses existing `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`.

### Persona Lens
- **Makoonsii:** Email arrives automatically after signing. Staff doesn't need to take an extra action.
- **Staff:** Zero workflow change. CF handles everything.
- **Jordan:** Consistent branded template; follows same design pattern as `buildDigestHtml`.

### Compliance
- CASL: transactional receipt — exempt from marketing opt-in. No `alertOptIn` check required.
- PII: email address in `receiptEmailAddress` field (staff-visible in admin only). `auditLogs.details` contains only `{ loanTicketId, ticketNumber, sent: true }` — no email.
- No API key on client.
- `staffNotes` never included in email body.

### Anti-Regression
- ✅ No hardcoded hex — inline CSS uses same values as existing digest template (matches brand tokens by design; Cloud Function templates cannot reference CSS variables)
- ✅ No new Firestore fields beyond Decision 0032
- ✅ `signPawnAgreement` still succeeds (returns `{ signatureUrl }`) even if email dispatch fails — email failure is caught and logged, never re-thrown
- ✅ No AI API keys involved
- ✅ No motion patterns

### Estimated Scope
**Small** — 3 files changed:
1. `functions/core/src/pawnAgreement.ts` — add email dispatch logic
2. `functions/core/src/pawnAgreement.ts` — add `buildReceiptHtml` helper (or separate file)
3. `functions/core/package.json` — add `@pawn-shop/shared` dependency already present; no new packages

Plus: schema (done), decision doc (done), spec (done).

### Trade-offs
**Benefits:** Minimal code change. No new UI. Uses existing `dispatchEmail` infrastructure. Automatic — zero staff overhead.
**Costs:** Requires SendGrid DNS setup on CanSpace nameservers (one-time, outside the codebase). If customer has no email on file, they get nothing — no fallback.

---

## Strategy B — Staff-Triggered "Email Receipt" Button

### Architecture

New `emailLoanReceipt(loanTicketId, toEmail?: string)` callable CF in `functions/core/src/pawnAgreement.ts`:
- Staff-only (admin, manager, inventory_staff)
- `toEmail` optional: if provided, overrides the resolved address (staff can type a different address at the counter)
- Resolves email using same uid → pawnRequest fallback chain
- Builds HTML receipt, calls `dispatchEmail`, writes audit log + idempotency fields
- Returns `{ sent: boolean, toEmail: string }`

**UI additions:**
- `IssueLoanModal.tsx`: after the sign step, show "Email Receipt" button in the success state panel. Pre-fills resolved email if one exists; editable text input if not. Sends via CF call.
- `LoanTicketsAdminPage.tsx`: add "Email Receipt" row action on signed tickets without `receiptEmailSentAt`. Shows inline email input before confirm.

**Secrets:** Same as Strategy A.

### Persona Lens
- **Makoonsii:** Explicit staff confirmation means the email goes to the right address. Staff can correct a typo at the counter.
- **Staff:** More control; can handle edge cases (customer gives different email verbally, email address corrected at counter).
- **Jordan:** Same branded template.

### Compliance
- Same as Strategy A, plus: `toEmail` override never logged (only `{ sent: true, ticketNumber }` in audit details).

### Anti-Regression
- ✅ Same as Strategy A plus
- ✅ No client-side email: all dispatch via CF callable
- ✅ `IssueLoanModal` success state is additive — existing print flow unchanged

### Estimated Scope
**Medium** — 5 files changed:
1. `functions/core/src/pawnAgreement.ts` — new `emailLoanReceipt` CF + `buildReceiptHtml` helper
2. `functions/core/src/index.ts` — export `emailLoanReceipt`
3. `src/components/pawn/IssueLoanModal.tsx` — email section in success state
4. `src/pages/admin/LoanTicketsAdminPage.tsx` — row action + inline email input
5. `src/lib/useLoanTickets.ts` — `useEmailLoanReceipt` hook

### Trade-offs
**Benefits:** Staff control over email address. Safer for walk-in customers whose email wasn't captured in the system. Can resend on demand.
**Costs:** Extra step in workflow (staff must click "Send"). Email may be forgotten or skipped. Slightly larger surface.

---

## Strategy C — CanSpace SMTP Transport (nodemailer), Auto-Send on Sign

### Architecture

Add SMTP-based email transport to avoid any SendGrid dependency. The customer's CanSpace.ca account provides an SMTP server:

**New shared helper:** `functions/shared/src/emailSmtp.ts`
```
import nodemailer from 'nodemailer'
async function dispatchEmailSmtp(to, subject, html): Promise<boolean>
```
Uses new Firebase Secrets:
- `CANSPACE_SMTP_HOST` — e.g. `mail.canspace.ca`
- `CANSPACE_SMTP_USER` — e.g. `noreply@thepawnshop.ca`
- `CANSPACE_SMTP_PASS` — CanSpace mail account password

Auto-send on sign (same extension to `signPawnAgreement` as Strategy A), but calling `dispatchEmailSmtp` instead of `dispatchEmail`.

**Existing `dispatchEmail` (SendGrid) is unchanged** — still used for weekly digest, seasonal reminders.

### Persona Lens
- Same as Strategy A from Makoonsii/Staff/Jordan perspective.
- Adds Canadian data sovereignty: email routing passes through CanSpace's Canadian-hosted servers rather than SendGrid's US infrastructure.

### Compliance
- Same as Strategy A.
- CanSpace SMTP uses authenticated TLS (port 587 STARTTLS or 465 SSL) — credentials in Firebase Secret Manager, never on client.

### Anti-Regression
- ✅ All existing email flows (digest, reminders) unchanged — they still use `dispatchEmail`/SendGrid
- ✅ `nodemailer` is a server-only package — no client risk
- ✅ No hardcoded credentials — all via `defineSecret`

### Estimated Scope
**Medium** — 4 files changed + 1 new:
1. `functions/shared/src/emailSmtp.ts` — new SMTP helper (new file)
2. `functions/shared/src/secrets.ts` — add 3 SMTP secret definitions
3. `functions/shared/package.json` — add `nodemailer` + `@types/nodemailer`
4. `functions/core/src/pawnAgreement.ts` — add email dispatch (same as Strategy A)
5. `functions/core/package.json` — may need `nodemailer` if not in shared

### Trade-offs
**Benefits:** Zero SendGrid dependency for receipts. Email passes through CanSpace (Canadian hosting — data sovereignty). Uses infrastructure the user already owns and pays for.
**Costs:** CanSpace shared SMTP has lower reliability than SendGrid for transactional email (IP reputation, rate limits, uptime SLA). Adds `nodemailer` dependency. Three new secrets to provision. CanSpace SMTP password rotation affects deployed CFs. SendGrid DNS setup (Strategy A) may actually be simpler.

---

## Anti-Regression Summary (all strategies)

| Check | Status |
|-------|--------|
| Hardcoded hex in email HTML | ⚠️ Inline CSS in email templates cannot use CSS variables — this is standard email client limitation. Hardcoded colours in email templates are acceptable and consistent with existing `buildDigestHtml` precedent. |
| New Firestore fields without schema update | ✅ Decision 0032 — fields added before this plan was written |
| AI API keys on client | ✅ None — email CFs use SendGrid or SMTP only |
| `rare-find`/`limited-edition` auto-tagging | ✅ N/A |
| PII in `auditLogs` | ✅ `receiptEmailAddress` stored on `loanTickets` only — never in audit event `details` |
| Age gates at component level | ✅ N/A |
| Motion patterns | ✅ N/A |
| Email fails blocking loan issuance | ✅ All strategies: email errors caught and logged, never re-thrown |

---

## Recommendation

**Strategy A** for teams running SendGrid (already configured). **Strategy C** if CanSpace SMTP data sovereignty is a priority and the user is comfortable provisioning 3 new Firebase Secrets and accepting CanSpace SMTP reliability constraints.

Strategy B adds useful staff control but at the cost of a mandatory extra workflow step that will be inconsistently followed in a busy counter environment.

---

## Files to Change (Strategy A — recommended)

| File | Change |
|------|--------|
| `functions/core/src/pawnAgreement.ts` | Add `buildReceiptHtml` helper + email dispatch block inside `signPawnAgreement` CF |
| `docs/firestore-schema.md` | ✅ Done — Decision 0032 |
| `docs/decisions/0032-…` | ✅ Done |
| `docs/plans/E114_PAWN_RECEIPT_EMAIL_PLAN.md` | This file |
| `docs/projects/E114_PAWN_RECEIPT_EMAIL.md` | ✅ Done |

## Files to Change (Strategy B)

All Strategy A files plus:

| File | Change |
|------|--------|
| `functions/core/src/index.ts` | Export `emailLoanReceipt` |
| `src/components/pawn/IssueLoanModal.tsx` | Email section in success state |
| `src/pages/admin/LoanTicketsAdminPage.tsx` | "Email Receipt" row action |
| `src/lib/useLoanTickets.ts` | `useEmailLoanReceipt` hook |

## Files to Change (Strategy C)

Strategy A files plus:

| File | Change |
|------|--------|
| `functions/shared/src/emailSmtp.ts` | New SMTP helper |
| `functions/shared/src/secrets.ts` | 3 SMTP secret definitions |
| `functions/shared/package.json` | Add `nodemailer` |

---

*The Pawn Shop · docs/plans/E114_PAWN_RECEIPT_EMAIL_PLAN.md · 2026-06-11*
