# E120 — Fireworks Campaign Countdown
**Status:** ✅ CLOSED — 2026-06-12
**Priority:** HIGH — Canada Day is 2026-07-01
**Effort:** Small (~2 files, ~130 lines changed)
**Cycle:** 33

---

## Problem

Staff want to show a live countdown to Canada Day on the fireworks page, above the video. The campaign system with countdown support already existed, but:
1. `CountdownTimer.tsx` contained 10 hardcoded `px` values — design token violations, QA blocker
2. `CampaignAdminPage.tsx` had no Activate/Deactivate controls — staff had to wait up to 5 minutes for the scheduled CF, or edit Firestore directly
3. Existing campaigns could not be edited after creation — staff had to delete and recreate

## Solution Delivered

**`CountdownTimer.tsx`** — Replaced all 10 hardcoded pixel values with design tokens: `--text-display` (digits), `--text-heading` (colons), `--text-xs` (labels/units), `--text-subheading` (expired text), `--space-1` / `--space-2` (gaps/margins).

**`CampaignAdminPage.tsx`** (two additions):
1. **Activate / Deactivate button** — one-click toggle per campaign using `updateDoc` directly (permitted by existing `isStaff()` Firestore rule). Canada Day countdown can be live in seconds.
2. **Inline Edit form** — expands below each campaign card. Editable: title, view tag, start/end dates, banner copy, discount rule, countdown toggle. Uses `dateToInputStr()` for correct local-timezone date display. `active` field excluded — managed via the separate toggle button.

## Files Changed

| File | Change |
|------|--------|
| `src/components/fireworks/CountdownTimer.tsx` | Replaced 10 hardcoded px values with design tokens |
| `src/pages/admin/CampaignAdminPage.tsx` | Added Activate/Deactivate toggle + inline Edit form |

## Docs Updated

| File | Change |
|------|--------|
| `docs/decisions/0037-e120-campaign-activate-client-side.md` | Decision log |
| `docs/reports/E120_QA_REPORT.md` | QA sign-off |
| `docs/EPICS.md` | E120 epic entry added and closed |
| `docs/ACTIVE_CYCLE.md` | E120 completed row added |
| `user-guide/admin/campaigns.md` | Activate/Deactivate and Edit sections added |

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — Zero TypeScript errors, built in 2.42s |
| `npm run lint` | ✅ PASS — Zero ESLint errors/warnings |
| `npm run test` | ✅ PASS — 29/29 tests pass |
| `npx tsc -b` (functions/) | ✅ PASS — Zero errors |
| Hardcoded hex audit | ✅ PASS — Design tokens only |
| Hardcoded px audit | ✅ PASS — All CountdownTimer violations resolved |
| PII in logs audit | ✅ PASS — No PII in any write or log |

---

*The Pawn Shop · docs/projects/E120_FIREWORKS_CAMPAIGN_COUNTDOWN.md · 2026-06-12*
