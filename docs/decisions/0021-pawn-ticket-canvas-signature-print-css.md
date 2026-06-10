# Decision 0021 — E107 Pawn Ticket: signature_pad + createPortal + @media print (Strategy A)

**Date:** 2026-06-10
**Epic:** E107 · Pawn Ticket Generation & Digital Signature (POS)
**Cycle:** 32
**Status:** Implemented & Closed

---

## Context

Issuing pawn loan tickets required two new POS capabilities:

1. **Signature capture** — the customer must sign the loan agreement on an Android tablet using a stylus or finger.
2. **Ticket printing** — staff must be able to print the signed agreement on any connected printer.

Three strategies were evaluated (full analysis in `docs/plans/E107_PAWN_TICKET_DIGITAL_SIGNATURE_PLAN.md`):

- **A (selected):** In-modal canvas signature (`signature_pad`) + print CSS (`@media print`) + `createPortal`
- **B (backlog E108):** Server-side PDF generation via `pdf-lib` in a Cloud Function
- **C:** Dedicated `/pos` route — a standalone POS SPA page

---

## Decision

**Strategy A: `signature_pad` v5 canvas + `@media print` CSS + React `createPortal`.**

---

## Rationale

### 1. No extra app surface — modal-first

The three-step modal (Terms → Sign → Done+Print) integrates into the existing `PawnInbox` → `IssueLoanModal` flow. Staff do not leave the admin dashboard or open a second application. The Android tablet's browser already has the admin session open.

### 2. `signature_pad` for canvas touch capture

`signature_pad` v5 (Szimek, MIT, 1.5 kB gzipped) is the industry reference for stylus/touch signature capture on browsers:
- Handles Pointer Events API natively — works with Android stylus, finger, and mouse without `touchAction` workarounds.
- `endStroke` event allows real-time "has the customer drawn anything?" guard.
- `toDataURL('image/png')` produces a base64 PNG ready for Firebase Storage upload.
- `devicePixelRatio` canvas scaling prevents blurry signatures on high-DPI Android displays.

### 3. `@media print` + `createPortal` for ticket printing

`window.print()` with `@media print` CSS is the correct primitive for in-browser printing without a server round-trip. Using `createPortal(content, document.body)` to render `<PrintableTicket>` outside the modal DOM tree solves the key problem: modals use `overflow: hidden` which clips the print layout. Portal placement lets the print CSS rule hide all siblings of `.print-ticket` without fighting the modal overlay.

### 4. Signature storage — Firebase Storage, not Firestore

The PNG blob is uploaded to `tickets/{loanTicketId}/signature.png` via the `signPawnAgreement` Cloud Function (Admin SDK). Only the resulting public URL is written to `loanTickets/{id}.signatureUrl`. This keeps Firestore documents lean (no large byte fields) and uses the same Storage pattern as item images. Public read is intentional: the URL is embedded in the printed ticket and the printed document is physically given to the customer.

### 5. Why not Strategy B immediately

Server-side PDF (pdf-lib) would produce an archival-grade PDF but adds a synchronous CF call at print time, a new `pdfUrl` Firestore field, and `pdf-lib` as a production Cloud Function dependency. Strategy B is better suited to retrospective PDF generation (e.g., emailing a copy after the fact). The browser print dialog already produces a PDF on most Android and desktop printers. E108 tracks Strategy B for future implementation.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Strategy B (pdf-lib CF) | Adds server round-trip at print time; requires `pdf-lib` in Cloud Function bundle; strategy A's browser print dialog produces equivalent output for POS use. Tracked as E108 for archival/email use cases. |
| Strategy C (dedicated `/pos` route) | Requires route-level auth plumbing, age gate audit, and a new Vite code-split chunk. The in-modal approach requires zero routing changes. |
| `react-signature-canvas` | Wrapper library around the same HTML5 canvas primitive; adds abstraction without capability gain. `signature_pad` exposes the raw canvas and Pointer Events API directly. |

---

## Compliance Notes

- **No PII in auditLogs:** `pawn_agreement_signed` event stores only `{ loanTicketId, agreementVersion }`. Customer identity is recoverable from `loanTickets/{id}.uid` — never in the log details.
- **Staff-only write gate:** `signPawnAgreement` CF enforces `admin | manager | inventory_staff` custom claim check before accepting the signature data URL.
- **Storage rules:** `tickets/{loanTicketId}/**` — public read (URL is printed on physical ticket), staff-role write.
- **`agreementVersion` tracking:** Stored as `'v1.0'` on every signed ticket. If agreement terms change, the version slug changes and prior signatures remain traceable to the terms the customer consented to.
- **Customer name:** `customerName` stored on `loanTickets/{id}` for agreement validity. Never written to `auditLogs`.

---

## New Dependency Added

| Package | Version | Notes |
|---------|---------|-------|
| `signature_pad` | `^5.1.3` | Canvas-based signature capture; MIT licence; Pointer Events API; zero CSS dependencies |

---

## Files Introduced

- `functions/core/src/pawnAgreement.ts` — `signPawnAgreement` Cloud Function
- `src/components/admin/PrintableTicket.tsx` — portal-rendered print layout
- `src/styles/print.css` — `@media print` rules; imported in `main.tsx`

## Files Modified

- `functions/core/src/loanTickets.ts` — `createLoanTicket` now generates `ticketNumber` after `add()`
- `functions/core/src/index.ts` — added `export * from './pawnAgreement'`
- `src/components/admin/IssueLoanModal.tsx` — three-step modal flow (Terms → Sign → Done+Print)
- `src/components/admin/PawnInbox.tsx` — wired `onReadyToPrint` + `<PrintableTicket>`
- `src/pages/admin/LoanTicketsAdminPage.tsx` — Signed/Unsigned badge + Print button + `<PrintableTicket>`
- `src/lib/useLoanTickets.ts` — added `useSignPawnAgreement` hook; extended `toTicket` helper; updated return type of `useIssueLoanTicket`
- `src/lib/types.ts` — extended `LoanTicket` with 5 optional fields; added `PrintTicketData` interface
- `src/main.tsx` — added `import './styles/print.css'`
- `storage.rules` — added `tickets/` path rule

---

*The Pawn Shop · docs/decisions/0021-pawn-ticket-canvas-signature-print-css.md · 2026-06-10*
