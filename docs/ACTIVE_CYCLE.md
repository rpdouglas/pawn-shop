# Active Cycle — The Pawn Shop

> **Sprint tracking file.** Update at the start and end of every work cycle.
> Referenced by `docs/prompts/INITIALIZATION.md` on session load.

---

## Current Cycle

**Cycle:** 06
**Started:** 2026-05-18
**Target close:** TBD
**Deploy target:** dev

---

## Cycle Goal

Deliver E13 · Merchandising Engine — staff picks admin UI, `calculateTrendingScore` Cloud Function, mood collections per view, quick-view modal (≤200ms), related items by trending score.

---

## In Progress

| Task | Epic | Persona | Owner | Notes |
|---|---|---|---|---|
| — | — | — | — | No tasks in flight |

---

## Completed This Cycle

| Task | Epic | Completed |
|---|---|---|
| — | — | — |

---

## Deferred / Blocked

| Item | Reason | Target cycle |
|---|---|---|
| WCAG AA axe-core browser verification | Requires running browser session on `/pawn`, `/cannabis`, `/fireworks` | Before E02 fully closes |
| MFA bypass confirmed impossible | Requires Identity Platform upgrade — pre-prod compliance gate | Before prod deploy (E09/E11) |
| eBay developer account setup (webhook URL registration, notification subscription) | Requires eBay seller account and developer credentials — outside codebase scope | Before E06 deploys to prod |
| axe-core browser run on admin intake success view (EbayPushButton) | Requires live browser session | Post-E06 merge verification |

---

## Open Decisions Needed

| Question | Context | Urgency |
|---|---|---|
| Legal counsel on cannabis/fireworks regulation | Required before E09/E11 features ship to prod | Before prod deploy |
| Kanien'kéha community review process | Required before E19 (Akwesasne Identity System) begins | Before E19 starts |

---

## Previous Cycle Summary

**Cycle 05** (2026-05-18 → 2026-05-18) — Closed E08 · Click & Collect / Contact.

| Task | Epic | Completed |
|---|---|---|
| Click-and-collect request form on Pawn + Fireworks item pages (`ClickCollectModal`) | E08 | 2026-05-18 |
| `reservations/{id}` collection + status flow (pending → confirmed → declined → completed) | E08 | 2026-05-18 |
| `createReservation` / `confirmReservation` / `completeReservation` callable CFs | E08 | 2026-05-18 |
| SMS confirmation inline in CF — guarantees 60-second SLA (Twilio) | E08 | 2026-05-18 |
| `ReservationInbox` admin component — real-time onSnapshot, confirm/decline/complete | E08 | 2026-05-18 |
| `updateStoreHours` CF + `StoreHoursEditor` admin component — 30-min slot generation | E08 | 2026-05-18 |
| `sendContactEmail` CF (SendGrid) + `ContactPage` with Google Maps iframe | E08 | 2026-05-18 |
| Firestore rules — reservations client write blocked; `config/{docId}` read: signed-in only | E08 | 2026-05-18 |
| **E08 CLOSED** | E08 | 2026-05-18 |

---

**Cycle 04** (2026-05-17 → 2026-05-18) — Closed E07 · Pawn Form & Inbox.

| Task | Epic | Completed |
|---|---|---|
| Customer pawn enquiry form (`PawnEnquiryForm`) + `/pawn/sell` route | E07 | 2026-05-18 |
| `submitPawnRequest` callable CF — serial blacklist check, auditLogs, admin alert | E07 | 2026-05-18 |
| `pawnRequests/{id}` Firestore rules — create blocked on client, update field-scoped | E07 | 2026-05-18 |
| `PawnInbox` admin component — real-time `onSnapshot`, status/notes update | E07 | 2026-05-18 |
| Storage rules — `pawn-requests/` read restricted to staff custom claims | E07 | 2026-05-18 |
| **E07 CLOSED** | E07 | 2026-05-18 |

---

**Cycle 03** (2026-05-17 → 2026-05-17) — Closed E06 · eBay Cross-Posting.

| Task | Epic | Completed |
|---|---|---|
| `docs/projects/E06_eBay_Cross_Posting.md` spec drafted | E06 | 2026-05-17 |
| `pushToEbay` callable CF — three-step eBay Sell Inventory API flow | E06 | 2026-05-17 |
| `ebayWebhook` HTTP CF — HMAC-verified real-time sold sync | E06 | 2026-05-17 |
| `EbayPushButton` admin component + CSS | E06 | 2026-05-17 |
| `auditLogs` event types `ebay_push` and `ebay_sync_sold` added to schema | E06 | 2026-05-17 |
| **E06 CLOSED** (eBay developer account setup required before prod deploy — see Deferred) | E06 | 2026-05-17 |

---

## Next Cycle Preview

After E13 closes: E09 · Customer Accounts — purchase history, saved searches with CASL-compliant alert opt-in, account settings, reseller tier display.

---

*The Pawn Shop · docs/ACTIVE_CYCLE.md · updated 2026-05-18*
