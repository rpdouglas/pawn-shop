# E99 — Cloud Functions Architecture Remediation
**Status:** ✅ CLOSED — 2026-06-09
**Priority:** HIGH (contains P0 runtime failures)
**Effort:** Medium (~1 developer-day)
**Cycle:** 32

---

## Problem

The E34 modular refactor split the functions monolith into `functions/core` and
`functions/operations`. The split was correct, but several migration tasks were left
incomplete, causing active runtime failures and structural debt that creates risk on every deploy.

### Gap 1 — P0 · Three broken loan function calls

The client (`src/lib/useLoanTickets.ts`) calls three functions by names that do not match
what `functions/core` actually exports:

| Client calls | Core exports | Result |
|---|---|---|
| `issueLoanTicket` | `createLoanTicket` | ❌ HTTP 404 at runtime |
| `redeemLoan` | `redeemLoanTicket` | ❌ HTTP 404 at runtime |
| `forfeitLoan` | NOT PRESENT | ❌ HTTP 404 at runtime |

Every loan issuance, redemption, and forfeiture operation fails silently in production.
This is an active data-integrity issue affecting staff-facing finance workflows.

### Gap 2 — P1 · `batchProcessItems` not deployed (E98 overlap)

`InventoryTable.tsx:192` calls `batchProcessItems` which exists only in the
pre-E34 monolith (`functions/src/ai.ts:562`) and was never migrated to `functions/operations`.
Batch AI buttons always fail. E98 tracks this separately but it is included here as
part of the architectural picture.

### Gap 3 — P2 · Node version mismatch in package.json

`firebase.json` deploys both codebases on `nodejs24`. However:

- `functions/core/package.json` → `"engines": {"node": "20"}`, `esbuild target=node20`
- `functions/operations/package.json` → `"engines": {"node": "20"}`, `esbuild target=node20`

The deployed runtime is Node 24 but the build target and engines declaration say Node 20.
This is misleading to developers and could suppress Node 24 feature usage.

### Gap 4 — P2 · TypeScript gate does not cover deployed codebases

`npx tsc -b` run from `/functions` root reads `functions/src/tsconfig.json` — the old
monolith. It does NOT check `functions/core/src/` or `functions/operations/src/`. TypeScript
errors in deployed code are only caught by esbuild during `npm run build` in each sub-package,
which does not do type checking. Errors go to production.

### Gap 5 — P2 · Old monolith `functions/src/` not deleted post-E34

4,393 lines of outdated code remain. These files contain stale versions of every module
that is now in core/operations. Developers could accidentally edit these files. `tsc -b`
at root compiles them, creating noise. The E73 Gemini model fix was shipped but the old
`functions/src/ai.ts` still contains the banned `gemini-3.1-pro` reference.

### Gap 6 — P3 · Build artifacts (`lib/`) tracked in git

`functions/core/lib/` and `functions/operations/lib/` are committed. This caused the
FIX_AI_INVENTORY_500 incident (stale bundle deployed because git push carried an outdated
`lib/index.js`). E96 tracks the CI/CD side of this.

### Gap 7 — P3 · No CI/CD for functions

`.github/workflows/deploy-dev.yml` deploys Hosting only. Functions require a manual
`firebase deploy --only functions` on every change. There is no automated gate ensuring
deployed functions match the committed source.

---

## Persona Gate

- **Staff (Loan Operations):** Gap 1 directly blocks `issueLoanTicket`, `redeemLoan`,
  `forfeitLoan` — the entire loan workflow is non-functional in production.
- **Staff (Batch AI):** Gap 2 blocks batch AI enrichment in `InventoryTable`.
- **Jordan (Editorial Quality / PWA):** Gaps 3–7 are structural risks that increase the
  probability of regressions reaching production without detection.

---

## Compliance

- No Firestore schema changes required
- All changes are internal (CF source + CI/CD config)
- `auditLogs` unchanged
- No AI API key changes

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` (Vite frontend) | ✅ PASS — `built in 2.85s` |
| `npm run lint` (ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| `npm run typecheck` (functions `tsc -b`) | ✅ PASS — zero errors; now covers core + operations |
| `npm run build` (functions esbuild) | ✅ PASS — core 12.3mb, operations 8.0mb |
| No `any` types introduced | ✅ PASS |
| No unused imports/variables | ✅ PASS |
| `forfeitAlertSentAt` added to `firestore-schema.md` (E81 drift) | ✅ PASS |
| `forfeitLoan` CF: `auditLogs` write, no PII | ✅ PASS |
| `batchProcessItems` CF: staff auth gate + 20-item cap | ✅ PASS |
| `batchProcessItems` CF: all AI output to `internal/ai`, staff-promote gate | ✅ PASS |

---

*The Pawn Shop · docs/projects/E99_FUNCTIONS_ARCHITECTURE.md · 2026-06-09*
