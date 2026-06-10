---
status: accepted
date: 2026-06-10
epic: E111
---

# 0027 — Pawn Ticket Two-Page Print Layout & Logo

## Context

The printed pawn ticket was a single continuous block. Staff requested:
1. Terms & Conditions to start on a dedicated second page.
2. The shop logo to appear at the top of the ticket (replacing the plain text shop name).

## Decisions

### 1 — CSS Page Break on `.print-ticket-agreement`

```css
.print-ticket-agreement {
  break-before: page;
  page-break-before: always; /* legacy alias for full browser coverage */
  margin-bottom: 8pt;
}
```

`break-before` is the CSS Fragmentation Level 3 spec property. `page-break-before` is the legacy CSS 2.1 alias still required by some PDF engines. Both are set for maximum compatibility.

The `.print-ticket-agreement` class is already present on the terms section in `PrintableTicket.tsx`, making the break point trivially addressable without JSX restructuring.

### 2 — Logo in Page 1 Header

The plain `.print-ticket-shop-name` text was replaced with:

```tsx
<img src="/branding/logo_pc.png" alt="The Pawn Shop" className="print-ticket-logo" />
```

```css
.print-ticket-logo {
  display: block;
  max-height: 18mm;
  max-width: 50mm;
  margin: 0 auto 4pt;
}
```

`/branding/logo_pc.png` is a static asset (1536×1024 RGBA PNG, 2.3 MB) served from the same Firebase Hosting origin. It is in the browser cache on first app load so no preload is needed before `window.print()` fires. The existing `Image()` preload in `PrintableTicket.tsx`'s `useEffect` covers only the dynamic Firebase Storage signature URL, which is the only remote asset that may not be cached.

### 3 — Page 2 Header

A `print-ticket-copy-header` div was added as the first child of `.print-ticket-agreement`:

```tsx
<div className="print-ticket-copy-header">— Page 2 of 2 — Terms &amp; Conditions</div>
```

This reuses the existing `.print-ticket-copy-header` class (already present on page 1 for the "Customer Copy — Keep for Redemption" label) with no new CSS rule. Because `break-before: page` is applied to `.print-ticket-agreement`, the header element is inside the agreement div and therefore correctly appears at the top of page 2.

## Alternatives Considered

- **Dual-portal split render (Strategy C):** Restructure `PrintableTicket.tsx` into two independent `<div>` blocks. Rejected — significantly more JSX churn for the same visual outcome, and risks disturbing the `Image()` preload `useEffect` logic.
- **Page 2 header as a sibling before `.print-ticket-agreement`:** Would require a new CSS class to carry `break-before: page`. Rejected in favour of placing the header inside the agreement div and letting the div's own break rule carry both elements onto page 2.

## Consequences

- The printed ticket is now a two-page document: page 1 = loan summary + APR disclosure; page 2 = Terms & Conditions + customer signature.
- The shop logo replaces the text shop name in the page 1 header. The shop address and divider remain below it.
- If the logo PNG is ever moved or renamed, the page 1 header will render a broken image rather than text. The `alt="The Pawn Shop"` attribute provides a text fallback.

---

*The Pawn Shop · docs/decisions/0027-pawn-ticket-two-page-layout-and-logo.md · 2026-06-10*
