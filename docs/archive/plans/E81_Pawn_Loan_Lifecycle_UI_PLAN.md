# E81: Pawn Loan Lifecycle UI — Execution Plan

## Epic Overview
**Epic:** E81 · Pawn Loan Lifecycle UI
**Goal:** Build the administrative and customer-facing interfaces, alongside the backend Cloud Functions, to manage the complete lifecycle of a pawn loan (issue, redeem, forfeit, extend).

---

## Strategy A: Minimal (The Functional Core)
*Focuses purely on the essential CRUD operations and Cloud Functions needed to transition loan states without automated payment validations or notifications.*

*   **Approach:**
    *   **Schema:** Add `principal`, `interestRatePct`, `termDays`, `dueDate`, `redemptionAmount`, and `status` to the existing `loanTickets` schema.
    *   **Backend:** Implement basic `issueLoanTicket`, `redeemLoan`, and `forfeitLoan` Cloud Functions. `redeemLoan` assumes the payment was handled offline or manually via POS.
    *   **Admin UI:** Basic table view of loan tickets in the Admin dashboard with buttons to trigger state changes.
    *   **Customer UI:** Display a simple list of active loans in the customer's `/profile` Activity History tab.
*   **Persona Impact:**
    *   *Staff:* Gets the job done but requires manual tracking of payments and due dates.
    *   *Makoonsii (Customer):* Can see her loans online, but cannot pay or extend them online.
*   **Compliance Checklist:**
    *   [x] Admin-only execution for `issueLoanTicket` and `forfeitLoan`.
    *   [x] Audit logs written on every state change.
*   **Schema Audit:**
    *   `loanTickets` requires new fields, but no new collections are needed.

---

## Strategy B: Recommended (The Stripe & SMS Integrated Workflow)
*Focuses on fully addressing the E81 requirements, integrating Stripe for redemptions and Twilio for SMS reminders.*

*   **Approach:**
    *   **Schema:** As above, extending `loanTickets`.
    *   **Backend:** 
        *   `issueLoanTicket` automatically calculates the `dueDate` and `redemptionAmount`.
        *   `redeemLoan` validates a provided `paymentIntentId` from Stripe before transitioning the ticket to `redeemed` and the item to `active`.
        *   `forfeitLoan` returns the item to `active` (shop-owned) and transitions the loan to `forfeited`.
        *   A scheduled Cloud Function runs daily to send an SMS reminder 3 days before the `dueDate`.
    *   **Admin UI:** A dedicated Loan Ticket detail page featuring redemption workflows, Stripe payment capture for in-person digital payments, and extension options.
    *   **Customer UI:** Customers can view loan status in their `/profile` and see exactly when their loan is due.
*   **Persona Impact:**
    *   *Staff:* Significant reduction in administrative overhead due to automated calculations and reminders.
    *   *Makoonsii (Customer):* Receives helpful SMS reminders and can clearly see her obligations, reducing the chance of accidental forfeiture.
*   **Compliance Checklist:**
    *   [x] Stripe integration maintains PCI compliance (no card data hits our servers).
    *   [x] SMS reminders check CASL `alertOptIn == true` before sending.
    *   [x] State changes restricted to `admin` / `manager` roles.
    *   [x] Audit logs written on every state change.
*   **Schema Audit:**
    *   `loanTickets` extended. Ensure `paymentIntentId` is mapped correctly.

---

## Strategy C: Robust (The Automated Finance Engine)
*Builds upon Strategy B by introducing automated forfeiture triggers, dynamic interest compounding (if applicable), and comprehensive forecasting.*

*   **Approach:**
    *   **Schema:** Add `extensionHistory` sub-collection to track every granted extension and adjusted interest rates.
    *   **Backend:** 
        *   All features of Strategy B.
        *   A scheduled CRON job that automatically transitions loans to `forfeited` if they remain unpaid 48 hours after the due date (with warning SMS alerts sent at T-24h).
    *   **Admin UI:** An advanced dashboard that forecasts expected incoming principal vs. forfeiture inventory value.
    *   **Customer UI:** Customers can request extensions directly from their profile, which managers can approve/deny in the Admin UI.
*   **Persona Impact:**
    *   *Staff:* Complete hands-off management of overdue loans.
    *   *Makoonsii (Customer):* Gains the ability to request extensions autonomously, though automated forfeiture introduces stricter deadlines.
*   **Compliance Checklist:**
    *   [x] Automated forfeiture must comply with local Akwesasne consumer protection and lending laws.
    *   [x] High scrutiny required on the CRON logic to prevent premature forfeitures.
    *   [x] All Stripe and CASL compliance from Strategy B.
*   **Schema Audit:**
    *   Requires new `extensionHistory` sub-collection under `loanTickets`.

---

## Recommendation
**Strategy B** is highly recommended. It fulfills every requirement outlined in the E81 epic without introducing the legal and operational complexities of fully automated forfeiture (which Strategy C introduces). It hits the sweet spot of reducing staff workload via SMS reminders while keeping the final decision to forfeit an item firmly in the hands of a human manager.

Would you like to approve Strategy B? If so, I will log the decision, update the schemas, and prepare the execution phase.
