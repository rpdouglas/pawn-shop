# E131 — Border Crossing Guide Page
**Status:** ✅ CLOSED — 2026-08-14
**Priority:** MEDIUM
**Effort:** 0.25 developer-days (actual)
**Cycle:** 34

---

## Problem

The Pawn Shop sits on Cornwall Island (Kawehno:ke), Akwesasne. Every customer
travelling from the island to the mainland store crosses through the Cornwall
CBSA port of entry — even though most of them never leave Canada. Customers
don't know there's a dedicated Domestic Lane for exactly this trip, don't
know what CBSA will ask, and don't know that "domestic" travel (island ↔
Cornwall, no U.S. stop) is handled completely differently from
"international" travel (anyone who's been to or through the U.S. side via
Kana:takon/Tsi Snaihne). This is real friction for **Dale, the Cross-Border
Bargain Hunter** persona — someone the site is explicitly designed to move
quickly and confidently across this exact border.

The user supplied a complete, ready-to-publish guide (source:
`Border_Crossing_Guide.docx`) written to clear this up, and wants it live as
a page, linked from the footer of every page on the site.

## Proposed Scope (Approach A — Static Hardcoded Page)

- New `src/pages/BorderCrossingPage.tsx`, structured like the existing
  `AccessibilityPage.tsx` (the cleanest, most "finished" static-page
  precedent in the codebase — no legal-placeholder scaffolding).
- New dedicated CSS classes in `src/index.css`, mirroring `.accessibility-*`
  1:1, token-driven (no hardcoded hex/px).
- New route `/border-crossing` in `main.tsx`, no age gate (not
  age-restricted content).
- New footer link in `App.tsx`, alongside the existing four
  (Contact/Accessibility/Privacy/Terms) — this is a global footer rendered
  once at the top-level route wrapper, so it appears on every page
  automatically.
- Content is the docx text verbatim: title, intro, 5 sections (Why You Even
  Hit a Border Checkpoint; Domestic vs. International Travel; The Domestic
  Lane; What CBSA Will Ask You; A Few Things to Keep in Mind), footer note.
- No Firestore changes, no new dependencies, no admin UI.

Full three-approach comparison (static page vs. Firestore-backed `articles/{id}`
CMS vs. hybrid static+live-config) is in the approved plan; Approach A was
selected.

## Out of Scope

- Any Firestore-backed editability (see Approach B/C in the plan — not
  needed for this content's change cadence).
- Age gating (this content isn't restricted).
- Per-view color/theme variation (per Decision 0052, the whole site uses one
  unified Pawn Shop theme — this page follows the same default as
  Accessibility/Privacy/Contact, which render in the Pawn palette since
  they're outside the `/cannabis`/`/fireworks` route prefixes).

## Persona Gate — E131

> - **Dale (Primary):** This page exists specifically for him — removing
>   uncertainty about the border crossing is a direct trust/friction-removal
>   feature for the Cross-Border Bargain Hunter.
> - **Makoonsii (Secondary):** Plain-language explanation, WCAG-compliant
>   structure (matching the Accessibility page's own standard), accessible to
>   community members regardless of technical familiarity.
> - **Compliance:** Content is transcribed verbatim from a source document
>   the business owner supplied — no AI-authored claims about CBSA policy.
>   Kanien'kéha place names (Kawehno:ke, Kana:takon, Tsi Snaihne) are
>   user-supplied proper nouns, not AI-generated, consistent with the
>   existing approved precedent in `docs/CULTURAL_LOG.md`.

## Acceptance Criteria

- [x] `/border-crossing` renders the full guide content, matching the source doc
- [x] Footer "Border Crossing" link appears on every route (global footer in `App.tsx`)
- [x] `npm run build`, `npm run lint`, `npm run test`, `npx tsc -b` (functions) all pass
- [x] No hardcoded hex/px — all new CSS token-driven, matching `.accessibility-*` pattern
- [x] Cultural Log entry added for the Kanien'kéha place names
- [x] Decision 0054 logged

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — zero TypeScript errors, `BorderCrossingPage` code-split into its own lazy chunk |
| `npm run lint` | ✅ PASS — zero ESLint errors and zero warnings |
| `npm run test` | ✅ PASS — 29/29 tests pass (8 test files) |
| `npx tsc -b` (functions/) | ✅ PASS — zero errors |
| Hardcoded hex/px audit | ✅ PASS — none introduced, all new CSS token-driven |
| Footer link audit | ✅ PASS — 5th `<Link>` added to the global footer in `App.tsx`, inherited on every route via `<Outlet />` |
| Cultural review | ✅ PASS — Decision 0054 + `docs/CULTURAL_LOG.md` entry logged |
| No new Firestore fields | ✅ PASS — no schema changes |
| No new dependencies | ✅ PASS |

## Docs Updated

| Doc | Change |
|-----|--------|
| `docs/EPICS.md` | E131 tasks ticked; entry added |
| `docs/ACTIVE_CYCLE.md` | E131 row added, Cycle Goal updated |
| `docs/decisions/0054-e131-border-crossing-guide-page.md` | Decision log created |
| `docs/CULTURAL_LOG.md` | New entry for Kanien'kéha place names |
| `docs/reports/E131_QA_REPORT.md` | QA sign-off |

---

*The Pawn Shop · docs/projects/E131_BORDER_CROSSING_GUIDE.md · 2026-08-14*
