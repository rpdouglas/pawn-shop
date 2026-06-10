---
status: accepted
date: 2026-06-10
epic: FIX_PRINT_PAGE_BREAK
---

# 0029 — Print Ticket Page Break: Explicit Sibling Element (break-after)

## Context

E111 added `break-before: page; page-break-before: always` to `.print-ticket-agreement` in
`@media print` to force the Terms & Conditions onto a second printed page. Staff confirmed this
had no effect — the ticket still printed as a single continuous page.

Decision 0027 (E111) and decision 0028 (FIX_PRINT_TICKET_E111) both relied on the `break-before`
property on the target element. Neither resolved the page break.

## Root Cause

`break-before: page` is unreliable in Blink (Chrome's rendering engine) when the element's
containing block transitions from `display: none` (screen) to `display: block` (print). The
`PrintableTicket` portal renders `.print-ticket` into `document.body` as `display: none !important`
on screen. When `window.print()` is called and `@media print` rules take effect, `.print-ticket`
becomes `display: block !important`. Blink's print fragmenter does not always re-evaluate
`break-before` directives on elements whose containing block changed display mode at print time.

## Decision

Add an explicit empty page-break element as a direct sibling immediately before
`.print-ticket-agreement`:

```tsx
<div className="print-page-break" aria-hidden="true" />
<div className="print-ticket-agreement">
```

```css
@media print {
  .print-page-break {
    display: block;
    height: 0;
    break-after: page;
    page-break-after: always;
  }
}
```

The existing `break-before: page; page-break-before: always` is retained on
`.print-ticket-agreement` as a belt-and-suspenders fallback.

## Rationale

1. **`break-after` on a preceding sibling is evaluated earlier in the fragmentation pass** than
   `break-before` on the target element. In Blink's implementation, this means the break is
   computed before the containing block reflow (caused by the `display: none → block` transition)
   can suppress it.

2. **`height: 0` prevents visual artifacts.** On screen, `.print-page-break` is automatically
   hidden inside `.print-ticket { display: none !important; }`. In print mode it becomes
   `display: block` but contributes no visible height — the only effect is the page break.

3. **Belt-and-suspenders with `break-before`.** Retaining the break directive on the target
   ensures the break fires in rendering engines that correctly handle `break-before` even without
   the preceding sibling element.

4. **No new dependency.** Pure CSS + JSX. No JavaScript, no library.

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Change `.print-ticket` from `display:none` to `visibility:hidden` on screen | Causes the empty portal to occupy layout space on screen, potentially displacing page content |
| Use JavaScript to force a reflow before `window.print()` | Fragile timing hack; platform-dependent; violates the minimal-blast-radius bug fix rule |
| Separate portal per page | Significant JSX restructuring; out of scope for a surgical bug fix |

## Rule for Future Print Additions

Any new CSS page break in `PrintableTicket.tsx` must use the **explicit sibling element pattern**
(`break-after` on a preceding `<div class="print-page-break">`) in addition to any
`break-before` on the target. Do not rely on `break-before` alone in this component.

---

*The Pawn Shop · docs/decisions/0029-print-page-break-sibling-element.md · 2026-06-10*
