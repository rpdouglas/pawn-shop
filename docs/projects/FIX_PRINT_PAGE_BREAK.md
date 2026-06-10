# FIX — Print Ticket Page Break Not Splitting to Page 2
**Status:** ✅ CLOSED — 2026-06-10
**Priority:** HIGH
**Effort:** Small (2 files, ~8 lines)
**Cycle:** 32

---

## Problem

Despite E111 adding `break-before: page; page-break-before: always` to `.print-ticket-agreement`
in `@media print`, the printed pawn ticket continues to render as a single page. The Terms &
Conditions section does not start on page 2.

## Root Cause

`break-before: page` on the target element is unreliable in Blink (Chrome) when the element's
containing block transitions from `display: none` on screen to `display: block` at print time.
`PrintableTicket.tsx` renders `.print-ticket` into `document.body` as `display: none !important`
on screen. When `window.print()` fires and `@media print` takes effect, `.print-ticket` switches
to `display: block !important`. Blink's print fragmenter does not re-evaluate `break-before` on
elements whose containing block changed display mode during the media-query switch.

## Solution

Added an explicit `<div class="print-page-break" />` sibling immediately before
`.print-ticket-agreement`, styled with `break-after: page; page-break-after: always; height: 0`
in `@media print`. `break-after` on a preceding sibling is evaluated earlier in Blink's
fragmentation pass and is not affected by the containing-block display-mode transition.
The existing `break-before` on `.print-ticket-agreement` was retained as a belt-and-suspenders
fallback. Decision 0029 logged.

## Files Changed

| File | Change |
|------|--------|
| `src/components/admin/PrintableTicket.tsx` | Added `<div className="print-page-break" aria-hidden="true" />` before `.print-ticket-agreement` |
| `src/styles/print.css` | Added `.print-page-break { display: block; height: 0; break-after: page; page-break-after: always; }` inside `@media print` |

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — built in 2.18s, zero TypeScript errors |
| `npm run lint` | ✅ PASS — zero violations |
| `npm run test` | ✅ PASS — 29/29 |
| `npx tsc -b` (functions) | ✅ PASS — zero errors (unchanged) |
| Decision 0029 logged | ✅ |

---

*The Pawn Shop · docs/projects/FIX_PRINT_PAGE_BREAK.md · Cornwall Island, Akwesasne*
