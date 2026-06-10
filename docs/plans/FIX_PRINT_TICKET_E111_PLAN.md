# Plan — FIX_PRINT_TICKET_E111: Logo Blank & Page Break Unverified

**Status:** PENDING APPROVAL
**Cycle:** 32
**Serves:** Staff (Dale adjacent — reliable printed pawn ticket is a trust artefact)
**Anti-persona risk:** Makoonsii — physical ticket must be correct; a broken ticket breaks counter trust

---

## Context

E111 replaced the plain "The Pawn Shop" header text with `<img src="/branding/logo_pc.png">` and
added `break-before: page` on `.print-ticket-agreement` to push T&C to page 2. Staff reports the
print output is unchanged — no logo, no two-page split.

Root causes identified (full analysis in `docs/projects/FIX_PRINT_TICKET_E111.md`):
1. **Logo not preloaded**: `window.print()` fires after the signature preload but before the logo
   fetch completes. Chrome renders print preview with a blank logo because the image hasn't arrived.
2. **`@page` nesting (non-standard)**: `@page` is inside `@media print` — silently ignored by some engines.
3. **Page break status unknown**: The CSS is technically correct; needs browser verification.

---

## Personas

**Primary:** Staff at the POS counter — they need a legible, correctly formatted printed ticket to hand to the customer. A blank logo means the ticket looks unbranded; a single-page layout means T&C is buried.

**Secondary:** Compliance — the printed ticket is a legal document; the two-page format improves readability of terms the customer is agreeing to.

---

## Schema Audit

No Firestore reads or writes. No schema changes. Print ticket data is passed in-memory via `PrintTicketData` interface (already in `src/lib/types.ts`).

---

## Strategy A — Dual Preload (Recommended)

**What:** Preload both the logo and the signature image before calling `window.print()`. Use `Promise.all` on two `Image()` preloads. Move `@page` outside `@media print`.

**Files:** 2 files, ~12 lines

**Change in `PrintableTicket.tsx`:**
```tsx
useEffect(() => {
  if (!data) return
  const preload = (src: string) => new Promise<void>(resolve => {
    const img = new window.Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()   // resolve on error so print still fires
    img.src = src
  })
  Promise.all([
    preload(data.signatureUrl),
    preload('/branding/logo_pc.png'),
  ]).then(() => window.print())
}, [data])
```

**Change in `print.css`:**
- Move `@page { margin: 10mm; size: A4 portrait; }` to the top of the file, outside `@media print`.

**Trade-offs:**
- ✅ Minimal change, directly targets the confirmed bug
- ✅ Graceful degradation (both `onerror` handlers resolve, so `window.print()` always fires)
- ✅ Promise.all means `window.print()` waits for the slower of the two images
- ✅ Fixes `@page` nesting (best practice)
- ⚠️ If logo URL changes in future, the hardcoded `/branding/logo_pc.png` path in the preload will need updating alongside `PrintableTicket.tsx`

**Compliance:** No PII, no Firestore, no AI keys. Print-only code path. Zero regression risk.

---

## Strategy B — Inline Logo as Data URI

**What:** Import the logo as a Vite asset using `import logoPc from '/branding/logo_pc.png?url'` (or embed as base64) so the logo is bundled into the JS and available synchronously — no network fetch at print time.

**Files:** 1 file + build change

**Trade-offs:**
- ✅ Completely eliminates the timing issue — logo is always available
- ✅ Works even when the app is offline (offline capability future goal)
- ❌ Increases the JS/CSS bundle size by the logo file size (~50–100 KB typical PNG)
- ❌ Vite `?url` imports for files in `/public` require different import syntax and may need `import.meta.url` handling
- ❌ The logo file is in `/public` (not `/src/assets`), so Vite doesn't automatically hash/inline it — requires moving the logo or a more complex import configuration
- ❌ Medium complexity for what is fundamentally a simple timing issue

---

## Strategy C — CSS-Only Logo via `content:` / Background Image

**What:** Replace `<img>` with a `<div class="print-ticket-logo">` styled with `background-image: url('/branding/logo_pc.png')` in `print.css`. CSS background images ARE fetched even in `display: none` elements in Chrome (earlier and more reliably than `<img>` elements in some edge cases).

**Files:** 2 files, ~8 lines

**Trade-offs:**
- ✅ Print CSS controls the image entirely — the component doesn't need to know the logo path
- ✅ Background images get fetched slightly more eagerly by some browser engines
- ❌ Accessibility: background images have no `alt` text — the logo loses its alt text
- ❌ Screen readers cannot announce the logo
- ❌ Less semantically correct than `<img>`
- ❌ Sizing and aspect ratio control is harder with background-image than with `<img>`
- ❌ Does NOT fix the timing issue — background-image fetches are still async

---

## Recommended Strategy: A

**Reason:** The bug is a simple missing preload — exactly the same class as the signature bug fixed in `FIX_PRINT_TICKET_BUGS`. Strategy A mirrors that same pattern extended to cover the new logo. It's minimal, reversible, and doesn't change the component's semantics or the bundle size.

The `@page` fix is a one-liner (move the rule to the top of `print.css`) and eliminates the non-standard nesting.

After Strategy A is applied, staff should retest to confirm:
1. Logo is visible in the print preview
2. T&C starts on a new page (scroll to page 2 in print preview)
3. If page break still missing, raise `FIX_PRINT_TICKET_PAGE_BREAK` as a follow-on

---

## Anti-Regression Checklist

- [ ] No hardcoded hex values introduced (no new hex values — print.css already uses existing `var()` where applicable)
- [ ] No new Firestore fields
- [ ] No AI keys on client
- [ ] No `rare-find`/`limited-edition` auto-tagging
- [ ] No PII in logs
- [ ] Age gates untouched
- [ ] No unapproved motion patterns
- [ ] `npm run build` passes
- [ ] `npm run test` passes (29/29)

---

## Estimated Scope

**Small** — 2 files, ~12 lines total.

---

*The Pawn Shop · docs/plans/FIX_PRINT_TICKET_E111_PLAN.md · Cornwall Island, Akwesasne*
