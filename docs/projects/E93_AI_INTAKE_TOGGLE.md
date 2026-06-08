# E93 — AI Intake Toggle
**Status:** ✅ CLOSED — 2026-06-08
**Priority:** MEDIUM
**Effort:** 0.5 developer-days (actual)
**Cycle:** 32

---

## Problem

The AI-first intake flow runs Gemini extraction + eBay pricing comps automatically on every
first photo upload. For batch-entry workflows (multiple similar items) or manual-entry workflows
(known price/description), this is wasteful — it adds Gemini API cost and unnecessary wait time.

## Solution Delivered

Inline, session-persisted AI toggle on both intake forms:
- **Default ON** — no change to the happy path; existing staff workflows unaffected
- **Toggle OFF** — uploads the photo, skips AI entirely, staff fills fields manually
- **sessionStorage** — toggle preference survives navigation within a batch session
- **Lock after first photo** — prevents confusing mid-flight state changes
- **Accessible** — `role="switch"`, `aria-checked`, `aria-label`, ≥44px click target

## Files Changed

| File | Change |
|------|--------|
| `src/components/admin/IntakeForm.tsx` | Added `aiEnabled` state, toggle UI, updated `extractData` prop |
| `src/pages/admin/MobileIntakePage.tsx` | Added `aiEnabled` + ref, toggle UI, wired to CF call, dynamic subtitle |
| `src/components/admin/IntakeForm.test.tsx` | 7 new unit tests |

## Docs Updated

| Doc | Change |
|-----|--------|
| `docs/EPICS.md` | E93 closed entry appended |
| `docs/ACTIVE_CYCLE.md` | Cycle goal updated; E93 in Completed table |
| `docs/decisions/0003-ai-intake-toggle.md` | Decision log created |
| `docs/plans/E93_AI_INTAKE_TOGGLE_PLAN.md` | Spec & plan |

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — `built in 7.98s` |
| `npm run lint` | ✅ PASS — zero violations |
| `npm run test` | ✅ PASS — 27/27 tests pass (8 test files) |
| Hardcoded hex audit | ✅ PASS — none introduced |
| PII in logs audit | ✅ PASS — none |
| sessionStorage key consistency | ✅ PASS — both forms use `'aiIntakeEnabled'` |

---

*The Pawn Shop · docs/projects/E93_AI_INTAKE_TOGGLE.md · 2026-06-08*
