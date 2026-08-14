# E130 — Raw `px` Value Triage
**Status:** ✅ CLOSED — 2026-08-13
**Priority:** MEDIUM
**Effort:** 0.5 developer-days (actual)
**Cycle:** 34

---

## Problem

E128's audit flagged 97 files under `src/components` and `src/pages` containing
literal `px` strings — a direct grep count, never triaged. `CLAUDE.md`'s
guardrails say "Never hardcode spacing values. Use `--space-*` tokens" and
"Never hardcode font sizes. Use `--text-*` scale tokens," but a blind
find-replace across 97 files risks breaking legitimate, non-violating uses:
hairline borders, WCAG-mandated 44/48px touch targets (which are *not* on the
`--space-*` scale and are explicitly literal per `design-system.md` §9.1),
and one-off component dimensions (modal max-widths, thumbnail sizes) that
were never meant to be spacing-scale values.

## Raw Data (2026-08-13, re-verified — unchanged since the E128 audit)

97 files, ~700 individual `px` occurrences. Frequency of the most common
values:

| Value | Count | Likely category |
|---|---|---|
| `1px` | 220 | Border width — not a spacing-scale concept |
| `48px` | 86 | WCAG/Makoonsii touch-target standard (explicit literal per design-system.md §9.1) *or* matches `--space-12` |
| `2px` / `3px` | 48 combined | Border width / border-radius |
| `44px` | 27 | WCAG 2.5.5 touch-target minimum (explicit literal) |
| `24px` | 23 | Matches `--space-6` exactly |
| `20px` | 18 | Matches `--text-lead` exactly |
| `1280px` | 17 | Matches `design-system.md` §7.4 content container max-width (not a spacing token) |
| `32px` | 12 | Matches `--space-8` exactly |
| `4px` / `16px` / `12px` | 33 combined | `4px`/`16px` match `--space-1`/`--space-4`; `12px` is not on either scale |
| ...long tail | ~150 | One-off component dimensions (modal widths, thumbnail sizes, icon sizes) — mostly 3-digit values (`400px`, `320px`, `120px`, etc.) |

**The core problem this epic solves:** distinguishing "value happens to be
`24px` because it's really `--space-6` in disguise" from "value is `24px`
because that's just how big this icon is" — grep frequency alone can't tell
the difference; each needs the surrounding CSS property/context read.

## Proposed Scope

- Triage every flagged file: for each `px` literal, read the surrounding
  property (padding/margin/gap/font-size vs. border/width/height/max-width/
  border-radius) and value, and classify as:
  - **(a) Real violation** — a padding/margin/gap/font-size value that
    exactly matches a `--space-*` or `--text-*` scale step → convert to the
    token.
  - **(b) Accepted exception** — border widths (1-3px), WCAG touch targets
    (44/48px on `minHeight`/`minWidth`/`height`/`width` of interactive
    elements), one-off component/layout dimensions (modal max-width, image
    thumbnail size, icon size, content container max-width), SVG geometry.
    Left as-is, documented.
- Produce a committed triage table (which files changed, which values were
  left and why) so future audits don't have to redo this work.
- Fix only category (a). No blind find-replace.

## Out of Scope

- Any visual redesign.
- `index.css`'s ~224 `px` occurrences inside the `:root` token *definitions*
  themselves (e.g. `--space-1: 4px;`) — those are the source of truth the
  rest of the codebase should point at, not a violation.
- Values already fixed in E128 (`.portal-logo-wrap`, `.portal-subtitle`).

## Persona Gate — E130

> - **Jordan (Primary):** Same rationale as E128 — token consistency is a
>   brand-quality signal, not just a lint rule.
> - **Makoonsii:** Touch-target values (44/48px) must be correctly identified
>   as accepted exceptions, not accidentally "fixed" into a `--space-*` token
>   that doesn't match — that would be a regression against her hard
>   accessibility requirement, not a cleanup.
> - **Compliance:** `CLAUDE.md` guardrail restoration, continuing E128.

## Acceptance Criteria

- [x] All 97 flagged files triaged — every `px` occurrence classified (a) or (b)
- [x] Category (a) violations fixed: 57 property-level fixes across 15 files, all using pre-existing tokens
- [x] Category (b) exceptions documented in Decision 0053 (borders, WCAG targets, one-off dimensions, no-scale-match values)
- [x] `npm run build`, `npm run lint`, `npm run test`, `npx tsc -b` (functions) all pass
- [x] No visual regression — every fix is a value-for-value token substitution, identical computed output
- [x] Decision 0053 logged

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — zero TypeScript errors |
| `npm run lint` | ✅ PASS — zero ESLint errors and zero warnings |
| `npm run test` | ✅ PASS — 29/29 tests pass (8 test files) |
| `npx tsc -b` (functions/) | ✅ PASS — zero errors |
| Real-violation coverage | ✅ PASS — 57/57 identified fixes applied |
| Exception verification | ✅ PASS — 44px/48px sampled at 100% touch-target context; 3-digit padding/margin/gap sampled at 0% matches (confirms one-off dimension bucket) |
| No new tokens introduced | ✅ PASS — all fixes reuse existing `--space-*`/`--text-*`/`--radius-*` tokens |
| No new Firestore fields | ✅ PASS — no schema changes |
| No new dependencies | ✅ PASS |

Full detail: `docs/reports/E130_QA_REPORT.md`, `docs/decisions/0053-e130-px-triage-execution.md`.

## Docs Updated

| Doc | Change |
|-----|--------|
| `docs/EPICS.md` | E130 tasks ticked; CLOSED entry added |
| `docs/ACTIVE_CYCLE.md` | E130 row in Completed table; Cycle Goal updated; footer timestamp updated |
| `docs/decisions/0053-e130-px-triage-execution.md` | Decision log created |
| `docs/plans/E130_PX_TRIAGE_PLAN.md` | Plan file |
| `docs/reports/E130_QA_REPORT.md` | QA sign-off |

---

*The Pawn Shop · docs/projects/E130_PX_TRIAGE.md · 2026-08-13*
