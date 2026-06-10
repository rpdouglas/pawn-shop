# E111 — Pawn Ticket Two-Page Print Layout
**Status:** ✅ CLOSED — 2026-06-10
**Priority:** LOW
**Effort:** TBD
**Cycle:** 33

---

## Problem

The printed pawn ticket renders as a single continuous page. Staff want Terms & Conditions to begin on a dedicated second page for legal clarity and easier review by customers at the counter.

## Solution Delivered

Strategy B executed. Two files, ~8 lines:

1. **Logo** — shop text replaced with `<img src="/branding/logo_pc.png">` constrained to `max-height: 18mm; max-width: 50mm` and centred.
2. **Page break** — `break-before: page; page-break-before: always` on `.print-ticket-agreement`.
3. **Page 2 header** — `<div className="print-ticket-copy-header">— Page 2 of 2 — Terms & Conditions</div>` as first child of the agreement div (reuses existing class, no new CSS).

## Files Changed

| File | Change |
|------|---------|
| `src/styles/print.css` | `.print-ticket-logo` rule; `break-before: page` on `.print-ticket-agreement` |
| `src/components/admin/PrintableTicket.tsx` | Logo img in header; page 2 copy-header in agreement div |

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — built in 2.50s |
| `npm run lint` | ✅ PASS — zero violations |
| `npm run test` | ✅ PASS — 29/29 |
| Decision 0027 logged | ✅ |

---

*The Pawn Shop · docs/projects/E111_PAWN_TICKET_TWO_PAGE_LAYOUT.md · Cornwall Island, Akwesasne*
