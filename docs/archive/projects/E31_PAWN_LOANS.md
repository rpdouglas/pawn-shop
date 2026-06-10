# Epic 31: Pawn Loan Management Portal

## Overview
A portal allowing customers to view their active pawn loan tickets, track due dates, and request loan extensions natively within the web application.

## Personas & Constraints
- **Makoonsii (Customer):** The loan viewer and extension request form must be completable one-handed in portrait mode (48px touch targets). Plain language copy with no financial jargon.
- **Compliance (Strict):** No client-side writes to `loanTickets`. All status changes must route through Cloud Functions via the Admin SDK and generate a corresponding `auditLog` entry.

## Technical Scope
1. **Schema & Security:** 
   - Define `loanTickets/{id}` in `firestore-schema.md`.
   - Update `firestore.rules` (Customer read `isOwner`, Staff read/write all).
2. **Backend (Cloud Functions):**
   - Create `functions/core/src/loanTickets.ts`.
   - Functions: `createLoanTicket`, `requestExtension`, `processExtension`, `checkLoanDueDates` (scheduled 48h forfeit alert).
3. **Frontend (Customer):**
   - `/pawn/my-loans` route (`LoanTicketsPage.tsx`).
   - `LoanTicketCard.tsx` and `ExtensionRequestModal.tsx`.
4. **Frontend (Admin):**
   - Add loan ticket tracking to the staff `/admin` dashboard.

## Status
**Completed.**
- `loanTickets` collection schema defined and secured.
- Cloud functions implemented for creation, extension requests, and processing.
- Daily scheduled Cloud Function added for 48h forfeit alerts.
- Customer view (`/pawn/my-loans`) and Admin view (`/admin/loans`) created.
- Tests passed successfully.
