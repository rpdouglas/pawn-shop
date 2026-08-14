# Decision 0054 — E131 Border Crossing Guide Page: Static Page (Approach A)

**Date:** 2026-08-14
**Epic:** E131 · Border Crossing Guide Page
**Cycle:** 34
**Status:** Implemented

---

## Context

The Pawn Shop sits on Cornwall Island (Kawehno:ke), Akwesasne. Customers
travelling from the island to the mainland store cross through the Cornwall
CBSA port of entry even when they've never left Canada, and don't generally
know there's a dedicated Domestic Lane for exactly this trip. The business
owner supplied a complete guide (`Border_Crossing_Guide.docx`) explaining
this and asked for it published as a page, linked from the site footer.

Three approaches were evaluated in the approved plan:

- **A:** Static hardcoded page, matching the existing `AccessibilityPage.tsx` pattern
- **B:** Firestore-backed CMS article, reusing the existing `articles/{id}` collection and editorial admin tooling
- **C:** Hybrid — static shell for the explanatory content, plus a small live Firestore config doc for the one fact realistically likely to change (Domestic Lane status/advisories)

## Decision

**Strategy A: Static hardcoded page at `/border-crossing`.**

## Rationale

1. **Matches the cleanest existing precedent.** `AccessibilityPage.tsx` is the only static-content page in the codebase without `[LEGAL REVIEW REQUIRED]` placeholder scaffolding — it's finished, reviewed content using semantic CSS classes, not inline styles. The new page mirrors it exactly: `<main>` → `<div>` → `<h1>` → repeated `<section>` blocks, new `.border-crossing-*` classes added to `src/index.css`'s component layer 1:1 with `.accessibility-*`.

2. **Zero schema risk.** No new Firestore fields, no new collections, no admin UI. The content is reference/explanatory (geography, process, what CBSA asks) rather than fast-changing operational data — Strategy C's live-config hybrid would have added a schema change and a Firebase-console-only editable doc for a fact that changes about as often as the rest of the page.

3. **Content is verbatim from the source document**, not AI-authored. This mattered specifically because the guide contains Kanien'kéha place names (Kawehno:ke, Kana:takon, Tsi Snaihne) — `CLAUDE.md`'s guardrail forbids AI from *generating* Kanien'kéha, but doesn't block transcribing user-supplied proper nouns. This is the same situation as the existing 2026-05-20 Cultural Log entry (Akwesasne place names in `ContactPage.tsx`/`PawnHero.tsx`, approved as "English proper noun" usage) — a new entry was added to `docs/CULTURAL_LOG.md` for consistency, not because the content needed to change.

4. **Footer link required no new infrastructure.** `App.tsx` already renders a global `<footer className="site-footer">` once, at the top-level route wrapper — every route inherits it via `<Outlet />`. Adding a 5th `<Link>` there satisfies "linked at the bottom of every page" completely; no per-page work was needed.

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Strategy B (Firestore `articles/{id}` CMS) | Requires populating Firestore data post-deploy (admin UI or a seed script) before the page exists at all; URL becomes `/articles/border-crossing` instead of the cleaner `/border-crossing`; articles are semantically designed for editorial/blog content (Finds of the Week, Warriors of Akwesasne), not a fixed reference page |
| Strategy C (hybrid static + live config) | Adds a schema change (`config/borderCrossingInfo`) and a Firebase-console-only editable field with no dedicated admin UI, for a fact that in practice changes about as rarely as the rest of the page — real added complexity for marginal benefit |

## Compliance Notes

- No hardcoded hex/px/font-size in any new JSX or CSS — all new styling is token-driven (`var(--space-*)`, `var(--text-*)`, `var(--color-*)`), matching `.accessibility-*` exactly.
- No age gate — content isn't age-restricted.
- No PII, no `auditLogs` interaction, no AI involvement in generating the page content (transcribed verbatim from the supplied .docx).

## Files Introduced

- `src/pages/BorderCrossingPage.tsx`

## Files Modified

- `src/index.css` — `.border-crossing-*` CSS classes
- `src/main.tsx` — new `border-crossing` route
- `src/App.tsx` — new footer `<Link>`
- `docs/CULTURAL_LOG.md` — new entry for Kanien'kéha place names

---

*The Pawn Shop · docs/decisions/0054-e131-border-crossing-guide-page.md · 2026-08-14*
