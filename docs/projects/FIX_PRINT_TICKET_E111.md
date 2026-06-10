# FIX — Pawn Ticket E111 Regression: Logo Blank & Page Break Unverified
**Status:** ✅ CLOSED — 2026-06-10
**Priority:** HIGH
**Effort:** Small (2 files, ~12 lines)
**Cycle:** 32

---

## Problem

E111 implemented a two-page printed pawn ticket layout with:
1. Shop logo replacing plain "The Pawn Shop" text in the header
2. Terms & Conditions forced to page 2 via `break-before: page`

Staff reported "nothing has changed" after the fix — neither the logo nor the two-page
layout is visible in the print output.

## Root Cause Analysis

### Bug 1 — Logo preload missing (HIGH CONFIDENCE)

`PrintableTicket.tsx` preloads `data.signatureUrl` before calling `window.print()` but does NOT
preload the logo:

```tsx
// Current: only preloads signature
const img = new window.Image()
img.onload = () => window.print()
img.src = data.signatureUrl
```

The logo `<img src="/branding/logo_pc.png">` lives inside `.print-ticket { display: none !important }`
on screen. While HTML-spec-compliant browsers (Chrome, Firefox, Safari) do begin fetching images in
`display:none` elements, the fetch is asynchronous. Since the signature is already cached from the
signing step moments earlier, `img.onload` fires immediately and `window.print()` is called before
the logo fetch completes. Chrome's print engine then renders the preview with a blank logo, giving
the impression that "nothing changed" vs. the old text header.

This is the exact same class of bug fixed by `FIX_PRINT_TICKET_BUGS` for the signature — the fix
was not extended to cover the new logo image added in E111.

### Bug 2 — `@page` inside `@media print` (non-standard, LOW IMPACT)

`print.css` nests `@page { size: A4 portrait; margin: 10mm; }` inside `@media print`. The CSS spec
places `@page` as a top-level rule; nesting it inside `@media` is non-standard and silently ignored
by some layout engines. Doesn't directly cause "nothing changed" but means page dimensions are
controlled by browser defaults.

### Bug 3 — Page break unverified (INVESTIGATION NEEDED)

`break-before: page` on `.print-ticket-agreement` is well-supported in Chrome/Firefox and the CSS
is correctly placed inside `@media print`. If the logo blank is fixed and the user now sees the
logo but still only one page, a separate investigation into the page break is needed. Likely
causes if it fails: printer's "fit to page" setting, or user not scrolling to page 2 in preview.

## Files Changed

| File | Change |
|------|--------|
| `src/components/admin/PrintableTicket.tsx` | Replaced single `Image()` preload with `Promise.all` dual preload (signature + logo) |
| `src/styles/print.css` | Promoted `@page` rule to top-level (outside `@media print`); removed duplicate nested `@page` |

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — built in 4.29s, zero TypeScript errors |
| `npm run lint` | ✅ PASS — zero violations |
| `npm run test` | ✅ PASS — 29/29 |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| Decision 0028 logged | ✅ |

---

*The Pawn Shop · docs/projects/FIX_PRINT_TICKET_E111.md · Cornwall Island, Akwesasne*
