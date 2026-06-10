---
status: accepted
date: 2026-06-10
epic: FIX_PRINT_TICKET_E111
---

# 0028 — Print Ticket: Dual Image Preload Before window.print()

## Context

E111 (decision 0027) added the shop logo to the printed pawn ticket and assumed it would be in the
browser cache by the time `window.print()` fires. Decision 0027 explicitly stated:

> "It is in the browser cache on first app load so no preload is needed before `window.print()`
> fires."

This assumption was incorrect. Staff reported "nothing has changed" after E111 deployed — the logo
appeared blank in the print preview on first use.

## Root Cause

`PrintableTicket.tsx` renders via `createPortal` to `document.body`. The portal is hidden
on screen via `@media screen { .print-ticket { display: none !important; } }`. While the HTML spec
requires browsers to begin image fetches regardless of CSS display state, the fetch for
`/branding/logo_pc.png` is asynchronous. The existing `useEffect` preloads `data.signatureUrl`
(which is a Firebase Storage URL freshly uploaded moments earlier and guaranteed un-cached). As
soon as the signature `img.onload` fires, `window.print()` is called — but the logo fetch from the
same origin may not have completed, especially on first visit when the logo is not in the HTTP
cache. Chrome renders the print preview immediately, showing a blank logo.

The `@page` rule was also nested inside `@media print`, which is non-standard per the CSS spec
and silently ignored by some layout engines.

## Decisions

### 1 — Promise.all Dual Preload

Replace the single-image preload with `Promise.all` over two preloads:

```tsx
useEffect(() => {
  if (!data) return
  const preload = (src: string) => new Promise<void>(resolve => {
    const img = new window.Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()  // always resolve — print fires even if an asset fails
    img.src = src
  })
  Promise.all([
    preload(data.signatureUrl),
    preload('/branding/logo_pc.png'),
  ]).then(() => window.print())
}, [data])
```

`window.print()` is now deferred until BOTH images are in the browser cache. The `onerror`
handlers resolve (not reject) so that a missing logo does not silently swallow the print action.

### 2 — `@page` Rule Promoted to Top Level

```css
/* Top of print.css — top-level rule, not inside @media print */
@page {
  margin: 10mm;
  size: A4 portrait;
}
```

The duplicate `@page` block inside `@media print` was removed. The CSS spec places `@page` as a
top-level conditional group rule; nesting it inside `@media` is non-standard and silently dropped
by some PDF rendering engines (notably Chromium's headless print path in some versions).

## Consequences

- `window.print()` is slightly delayed on first use (by one additional network round-trip for the
  logo image). On repeat uses the logo is in the HTTP cache and there is no perceptible delay.
- If the logo path ever changes, the hardcoded `/branding/logo_pc.png` in the preload must be
  updated alongside the `<img src>` attribute in `PrintableTicket.tsx`.
- A4 page size and 10mm margins are now reliably applied across all print and PDF engines.

## Correction to Decision 0027

The statement in 0027 — "It is in the browser cache on first app load so no preload is needed" —
is retracted. Static assets served by Firebase Hosting are cached by the CDN, but the browser's
own HTTP cache is not primed until the user has actually visited the app and the asset has been
fetched by the rendering engine. An asset inside a `display: none` element may not be fetched on
initial page load in all browsers, and race conditions with `window.print()` exist regardless.
Any new image added to `PrintableTicket.tsx` must be added to the `Promise.all` preload list.

---

*The Pawn Shop · docs/decisions/0028-print-ticket-dual-image-preload.md · 2026-06-10*
