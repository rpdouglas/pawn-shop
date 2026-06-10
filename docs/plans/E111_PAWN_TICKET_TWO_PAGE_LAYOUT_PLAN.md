# E111 — Pawn Ticket Two-Page Print Layout — Plan

**Date:** 2026-06-10
**Status:** Awaiting approval

---

## Context

The printed pawn ticket is one continuous block. Staff requested the T&C section start on a new page and the shop logo (`/branding/logo_pc.png`, 1536×1024 RGBA PNG) to appear in the page 1 header. The terms section in `PrintableTicket.tsx` already carries `className="print-ticket-agreement"`, making the break point trivially targetable via CSS.

---

## Persona Gate

| Persona | Relevance |
|---------|-----------|
| Jordan | Print fidelity — two-page layout must feel intentional and polished |
| Staff | Counter clarity — customer can clearly distinguish loan summary from legal text |
| Dale | Secondary — two-page agreement is easier to skim and retain |
| Makoonsii | Secondary — plain layout on page 2 supports accessibility (less visual noise) |

---

## Schema Audit

No Firestore reads or writes. No schema changes. No Cloud Function changes.

---

## Strategy A — Minimal CSS (Recommended)

**Architecture:** One CSS rule. Add `break-before: page; page-break-before: always;` to `.print-ticket-agreement` in `src/styles/print.css`. The `break-before` property is the modern spec; `page-break-before` is the legacy alias for full browser coverage. No JSX change.

**Persona Lens:** Jordan: clean typographic break, no visual clutter. Staff: loan summary on page 1, terms on page 2. Makoonsii: page 1 stays uncluttered.

**Compliance:** No impact. No Firestore, no PII, no age gate, no AI key.

**Trade-offs:**
- Pro: One line of CSS. Zero blast radius. Trivially reversible.
- Con: Page 2 starts abruptly with the "Terms & Conditions" label — no page 2 header.

**Scope:** Small — 1 file, 1 CSS rule.

---

## Strategy B — CSS + Logo + Page 2 Header (Approved)

**Architecture:**
1. **Logo in page 1 header** — Replace the plain `.print-ticket-shop-name` text block with the shop logo `<img src="/branding/logo_pc.png">` constrained via a new `.print-ticket-logo` CSS rule (`max-height: 18mm; max-width: 50mm; display: block; margin: 0 auto 4pt;`). The shop address text remains below. The logo is a static asset served from the same origin, so it is already in browser cache when print fires; no change to the preload logic is required.
2. **Page break** — Add `break-before: page; page-break-before: always;` to `.print-ticket-agreement` in `print.css`.
3. **Page 2 header** — Add a `<div className="print-ticket-copy-header">` reading "— Page 2 of 2 — Terms & Conditions" immediately before `.print-ticket-agreement` in `PrintableTicket.tsx`. Reuses the existing `.print-ticket-copy-header` class — no new CSS rule needed.

**Persona Lens:** Jordan: polished branded two-page document. Staff: logo confirms document provenance; page 2 header prevents confusion. Dale: loan summary on page 1 is uncluttered by legal text.

**Compliance:** No impact. No Firestore, no PII, no age gate, no AI key.

**Trade-offs:**
- Pro: Branded output. Clean two-page split. Minimal complexity.
- Con: Logo PNG is 2.3 MB — large for a local asset, but it is a static file served from the same origin and cached on first app load, so print latency is unaffected.

**Scope:** Small — 2 files (`print.css` + `PrintableTicket.tsx`), ~8 lines total.

---

## Strategy C — Dual-Portal Split Render

**Architecture:** Restructure `PrintableTicket.tsx` to render two `<div>` containers inside the portal — `print-ticket-page1` and `print-ticket-page2` — each with its own copy header. CSS `break-after: page` on `print-ticket-page1` triggers the break. Page 2 receives an independent header.

**Persona Lens:** Maximum layout control. Each page is a self-contained unit.

**Compliance:** No impact.

**Trade-offs:**
- Pro: Clean HTML structure; page 2 fully independent from page 1.
- Con: Significantly more JSX restructuring for the same visual outcome. Adds unnecessary complexity. Riskier — restructuring the render tree could affect the signature preload logic.

**Scope:** Medium — 2 files, ~50 lines JSX refactor.

---

## Anti-Regression Check

All three strategies:
- ✅ No hardcoded hex values
- ✅ No Firestore field invention
- ✅ No AI API keys on client
- ✅ No scarcity tag changes
- ✅ No PII
- ✅ No component-level age gate
- ✅ No unapproved motion patterns

---

## Recommendation

**Strategy B.** Logo in page 1 header + CSS page break + page 2 label. Two files, ~8 lines. The logo gives the document provenance at a glance; the page 2 header makes the two-page structure intentional rather than accidental.

---

*The Pawn Shop · docs/plans/E111_PAWN_TICKET_TWO_PAGE_LAYOUT_PLAN.md · 2026-06-10*
