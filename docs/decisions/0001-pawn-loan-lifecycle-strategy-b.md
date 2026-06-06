# ADR 0001: Pawn Loan Lifecycle Implementation Strategy

## Status
Accepted (2026-06-06)

## Context
As part of **Epic E81 · Pawn Loan Lifecycle UI**, we needed to define the architecture and workflow for issuing, redeeming, and forfeiting pawn loans. We evaluated three strategies:
- **Strategy A:** Minimal (Basic manual tracking).
- **Strategy B:** Recommended (Manual Forfeiture & Stripe Stubbing).
- **Strategy C:** Robust (Fully Automated Forfeiture & Live Stripe Integration).

The core technical question was how to handle the forfeiture process (when a loan exceeds its term without payment) and the payment capture for redemptions.

## Decision
We selected **Strategy B: Manual Forfeiture & Stripe Stubbing** for the E81 release cycle.

1. **Manual Forfeiture:** The forfeiture process remains a manual trigger via the Admin UI rather than an automated chron-job.
2. **Stripe Stubbing:** The `redeemLoan` payment captures are temporarily stubbed out pending the completion of **Epic E79** (Stripe API Integration).

## Rationale
- **Compliance Risks with Automation (Strategy C):** Fully automated forfeiture is highly risky in pawn shop operations due to varying local jurisdiction rules (e.g., mandatory grace periods, required certified mail notifications). By keeping forfeiture as a manual administrative action, staff can ensure all legal prerequisites (such as reviewing communication logs) have been met before legally transferring the item's ownership to the shop.
- **Pending Stripe Integration:** Since Epic E79 (Stripe Payment Gateway Integration) is not yet completed, we cannot robustly test live payment capture. Stubbing this allows us to deliver the core UI and logic for E81 without being blocked.
- **Developer Effort vs Value:** Strategy B strikes the right balance between minimizing technical debt and providing immediate operational value to the shop staff (Marie and Kevin).

## Consequences
- **Positive:** Reduces the immediate risk of unlawful item forfeiture. Unblocks the E81 release, allowing the UI to be verified early.
- **Negative:** Requires an extra manual step for admins when loans expire. We will need to return to `redeemLoan` once E79 is finished to replace the stubs with real Stripe SDK calls.
- **Next Steps:** Ensure `redeemLoan` is updated to handle true `paymentIntentId` validations once E79 is closed.
