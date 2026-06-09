# Decision 0008 — E99 Cloud Functions Architecture Remediation (Strategy B)

**Date:** 2026-06-09
**Epic:** E99 · Cloud Functions Architecture Remediation
**Cycle:** 32
**Status:** Implemented & Closed

---

## Context

After the E34 modular refactor (monolith → core + operations), several migration tasks were left incomplete. E99 was triggered by three active P0 runtime failures and four structural gaps discovered during an architecture review.

---

## Decision

**Strategy B: Full structural remediation in one coordinated pass.**

Seven gaps closed across six phases:

| Gap | Fix |
|-----|-----|
| P0: `issueLoanTicket`, `redeemLoan` name mismatches | Renamed client calls to `createLoanTicket`, `redeemLoanTicket` |
| P0: `forfeitLoan` not deployed | Added `forfeitLoan` export to `functions/core/src/loanTickets.ts` |
| P1: `batchProcessItems` not deployed | Migrated to `functions/operations/src/ai.ts` with E97 schema alignment |
| P2: Node 20 vs Node 24 mismatch | Updated `engines.node` and esbuild `--target` to `node24` in both codebases |
| P2: TypeScript gate covers only old monolith | Converted `functions/tsconfig.json` to project references solution; added `composite: true` to core + operations tsconfigs |
| P2: Old monolith `functions/src/` not deleted | Deleted post-refactor |
| P3: `lib/` build artifacts tracked in git | Added `functions/core/lib/` and `functions/operations/lib/` to `.gitignore` |
| P3: No CI/CD for functions | Added `google-github-actions/auth` + functions deploy step to `deploy-dev.yml` |

---

## Rationale

### Project references for TypeScript gate
`functions/tsconfig.json` converted to a solution file with `"references": [{"path":"core"},{"path":"operations"}]`. This means `npx tsc -b` from `/functions` now type-checks both deployed codebases. Previously it only checked the deleted monolith — all TypeScript errors in deployed functions were invisible until esbuild at deploy time (which does not typecheck).

### `forfeitLoan` scope: admin + manager only
The old monolith restricted `forfeitLoan` to admins only (`isAdmin` check). The new implementation allows admins and managers, matching the `redeemLoanTicket` pattern. Forfeiture triggers an item status update (`status: 'active'`, `policeHold: false`) only when `itemId` is present on the loan ticket.

### `batchProcessItems` migrated with E97 alignment
The migrated implementation uses the E97 output schema (title + category + description + tags) rather than the old description-only schema. Batch operations now produce `aiTitle` and `aiCategory` drafts, matching the per-item workflow introduced in E97.

### CI/CD functions deploy
Uses `google-github-actions/auth@v2` with the existing `FIREBASE_SERVICE_ACCOUNT_DEV` secret (same credential used by `FirebaseExtended/action-hosting-deploy`). Firebase predeploy hooks in `firebase.json` build each codebase before deploy — no separate build step needed in CI.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Strategy A (hotfix only) | Fixes P0 but leaves structural debt that caused prior incidents (E96, E99) |
| Strategy C (monolith consolidation) | E34 split was deliberate for resource isolation; high blast radius; AI image processing and lightweight auth CFs have very different memory/timeout profiles |

---

## Compliance Notes

- `forfeitLoan` CF: `auditLogs` write contains only `loanTicketId` — no PII.
- `forfeitLoan` CF: `policeHold: false` is set only via Admin SDK — never via client write.
- `batchProcessItems` CF: all AI output written to `items/{id}/internal/ai` — staff-promote gate preserved.
- `batchProcessItems` CF: 20-item hard cap enforced server-side; 400ms rate-limit between items.

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/useLoanTickets.ts` | Renamed `issueLoanTicket` → `createLoanTicket`, `redeemLoan` → `redeemLoanTicket` |
| `functions/core/src/loanTickets.ts` | Added `forfeitLoan` export |
| `functions/operations/src/ai.ts` | Added `batchProcessItems` + helpers; imported `Part`/`Schema` types; fixed `getModels` cast; fixed eBay comps price access |
| `functions/operations/src/markdownEngine.ts` | Fixed pre-existing bug: `assertMfaEnrolled(request.auth.token)` → `assertMfaEnrolled(request)` |
| `functions/core/package.json` | `engines.node`: `"20"` → `"24"`, esbuild target: `node20` → `node24` |
| `functions/operations/package.json` | Same |
| `functions/package.json` | `build` script: now runs both codebases; added `typecheck` script |
| `functions/tsconfig.json` | Replaced with project references solution file |
| `functions/core/tsconfig.json` | Added `"composite": true` |
| `functions/operations/tsconfig.json` | Added `"composite": true` |
| `functions/src/` | Deleted (pre-E34 monolith — 4,393 lines, 25 files) |
| `.gitignore` | Added `functions/core/lib/` and `functions/operations/lib/` |
| `.github/workflows/deploy-dev.yml` | Node 20 → 24; added functions deploy step |
| `docs/firestore-schema.md` | Added `forfeitAlertSentAt` drift correction (E81 field never documented) |

---

*The Pawn Shop · docs/decisions/0008-functions-architecture-remediation.md · 2026-06-09*
