# Decision 0040 — E123: Cannabis Vertical Suspension (Legal Hold)

**Date:** 2026-06-13
**Status:** Accepted
**Epic:** E123

## Context

Legal counsel placed the Cannabis vertical on hold pending regulatory review. The `/cannabis` route, the Cannabis card on the homepage, and the Cannabis link in the navigation drawer must be removed from public access immediately.

## Decision

**Strategy B — Source-Comment Toggle** was chosen (per developer selection from the three-strategy proposal).

The cannabis entry points are commented out in three files, each marked `// CANNABIS SUSPENDED — E123 (legal hold)`. All Cannabis source files (`CannabisPage.tsx`, `MoodCollectionPage.tsx`, all `src/components/cannabis/` components) are preserved and untouched.

## Files Changed

| File | Change |
|---|---|
| `src/main.tsx` | Two cannabis route objects commented out |
| `src/pages/HomePage.tsx` | Cannabis `<PortalCard>` commented out |
| `src/components/layout/NavigationDrawer.tsx` | Cannabis LINKS entry + `getPageTitle` case commented out |

## Re-enable Instructions

Search the codebase for `CANNABIS SUSPENDED — E123` to find all three comment blocks. Uncomment each block, run `npm run build && npm run lint && npm run test`, commit, and deploy.

## Compliance Notes

- The `/cannabis` and `/cannabis/collections/:mood` routes are absent from the router. React Router's `*` catch-all serves `NotFoundPage`.
- No `AgeGate` for cannabis is triggered — nothing to gate.
- No `auditLogs` entries for cannabis age gate pass/fail will occur while suspended (correct behaviour).
- No Firestore reads, writes, or schema changes.
- All Cannabis data and code preserved for future reinstatement.
