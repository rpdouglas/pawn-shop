# FIX — Print Ticket: Invalid Date & Missing Signature Image

**Status:** ✅ CLOSED — 2026-06-10
**Priority:** HIGH — Blocking POS workflow
**Cycle:** 32

---

## Bugs

### Bug 1 — Invalid Date on Printed Ticket

After E110 shipped the `createLoanTicket` CF now returns `dueDate` in its response. However, the deployed CF had not yet been redeployed with the E110 build. `IssueLoanModal` blindly called `new Date(result.dueDate)` where `result.dueDate` was `undefined` on older CF responses, producing `Invalid Date` on the printed ticket.

### Bug 2 — Customer Signature Image Missing from Printed Ticket

`PrintableTicket.tsx` called `window.print()` inside a `useEffect` that runs after React's DOM commit. At that point the portal markup is in the DOM but the browser has not yet fetched the remote Firebase Storage URL for the signature PNG. The print dialog captures the DOM synchronously, rendering the `<img>` element as a broken / blank image.

---

## Fix

**`src/components/admin/IssueLoanModal.tsx`**
- Defensive fallback: `result.dueDate ? new Date(result.dueDate) : new Date(Date.now() + days * 24 * 60 * 60 * 1000)`
- Server value is always preferred; fallback fires only when CF build hasn't deployed yet.

**`src/components/admin/PrintableTicket.tsx`**
- Replaced bare `window.print()` in `useEffect` with a hidden `Image()` preload.
- `window.print()` is now called from `img.onload` — guarantees the signature PNG is in browser cache before the print dialog opens.
- `img.onerror` also calls `window.print()` so the ticket still prints if the image fails to load.

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS |
| `npm run lint` | ✅ PASS |
| `npm run test` | ✅ PASS — 29/29 |
| Decision 0026 logged | ✅ |

---

*The Pawn Shop · docs/projects/FIX_PRINT_TICKET_BUGS.md · Cornwall Island, Akwesasne*
