# Epic 31: Pawn Loan Management Portal — 3-Strategy Plan

## Strategy A: Minimal Viable Product
* **Approach:** Implement basic CRUD for `loanTickets`. Basic unstyled lists for customers to view loans. Minimal admin table.
* **Pros:** Fast implementation.
* **Cons:** Fails Makoonsii's Trust Test (requires 48px touch targets and mobile-first design).
* **Compliance:** Meets audit logging but lacks robust UX.

## Strategy B: Recommended (Persona-Driven & Strict Gating)
* **Approach:** 
  - Adheres strictly to the E31 Persona Gate: Mobile-first `LoanTicketCard` with 48px touch targets and plain-language copy.
  - Architecture: Frontend uses TanStack Query (`@tanstack/react-query`) for reading `loanTickets`. Mutations are handled strictly via Cloud Functions (`functions/core/src/loanTickets.ts`).
  - Implements `checkLoanDueDates` as a pubsub scheduled function.
* **Pros:** Directly addresses all requirements in `EPICS.md`. Secure, compliant, and highly usable for Makoonsii.
* **Cons:** Requires more frontend styling effort for the mobile-first components.

## Strategy C: Robust (Advanced Orchestration & Analytics)
* **Approach:** Includes everything in Strategy B but adds real-time complex state machines for loan lifecycles, and predictive analytics for forfeiture rates on the Admin dashboard.
* **Pros:** Highly advanced data insights for staff.
* **Cons:** Over-engineered for the current phase. Bloats the scope of E31.

## Recommendation
**Strategy B** is recommended as it perfectly balances the Persona requirements (Makoonsii) and strict compliance gates without over-engineering.
