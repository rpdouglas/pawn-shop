# QA Report — E99 · Cloud Functions Architecture Remediation
**Date:** 2026-06-09 · **Result:** QA PASSED

---

## Part 1 — Build Health

| Check | Result |
|-------|--------|
| `npm run build` (Vite frontend) | ✅ PASS — `built in 2.85s` |
| `npm run lint` (ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| `npm run typecheck` (functions `tsc -b`) | ✅ PASS — zero errors; covers `functions/core/src/` + `functions/operations/src/` |
| `npm run build` in `/functions` (esbuild) | ✅ PASS — core 12.3mb, operations 8.0mb, both target node24 |
| No `any` type casts introduced | ✅ PASS |
| No unused imports/variables | ✅ PASS |

---

## Part 2 — Root Cause Verification

| Gap | Fix Verified |
|-----|-------------|
| P0: `issueLoanTicket` → `createLoanTicket` | ✅ `useLoanTickets.ts` line 83 updated |
| P0: `redeemLoan` → `redeemLoanTicket` | ✅ `useLoanTickets.ts` line 98 updated |
| P0: `forfeitLoan` not deployed | ✅ `forfeitLoan` exported from `functions/core/src/loanTickets.ts` |
| P1: `batchProcessItems` not deployed | ✅ Migrated to `functions/operations/src/ai.ts`; E97 schema alignment (title+category) |
| P2: Node 20 in package.json vs Node 24 in firebase.json | ✅ `engines.node` and esbuild `--target` updated to `node24` in core + operations |
| P2: `tsc -b` only checked old monolith | ✅ `functions/tsconfig.json` is now a project references solution; `composite: true` in core + operations tsconfigs |
| P2: Old monolith `functions/src/` (4,393 lines) still present | ✅ Deleted |
| P3: `lib/` tracked in git | ✅ `functions/core/lib/` and `functions/operations/lib/` added to `.gitignore` |
| P3: No CI/CD functions deploy | ✅ `google-github-actions/auth` + `firebase deploy --only functions` added to `deploy-dev.yml` |
| Pre-existing: `assertMfaEnrolled(request.auth.token)` wrong arg in `markdownEngine.ts` | ✅ Fixed to `assertMfaEnrolled(request)` — surfaced by new TypeScript gate |
| Pre-existing: `forfeitAlertSentAt` not in `firestore-schema.md` | ✅ Added (E81 drift correction) |

---

## Part 3 — Persona Smoke Tests

### Staff (Loan Operations)
- [x] `useLoanTickets.useIssueLoanTicket()` calls `createLoanTicket` — matches CF export name
- [x] `useLoanTickets.useRedeemLoan()` calls `redeemLoanTicket` — matches CF export name
- [x] `useLoanTickets.useForfeitLoan()` calls `forfeitLoan` — now deployed in core
- [x] `forfeitLoan` CF: staff auth gate (admin + manager), `auditLogs` write, item status update on forfeiture
- [x] `LoanTicketsAdminPage` — all three mutations now resolve correctly

### Staff (Batch AI)
- [x] `batchProcessItems` CF deployed in operations — `InventoryTable` batch AI buttons will succeed
- [x] Helper `generateDescriptionForItem`: passes images, generates `aiTitle`/`aiCategory`/`aiDescription`, three-tier Gemini fallback
- [x] Helper `suggestPriceForItem`: generates price range, three-tier Gemini fallback
- [x] 20-item hard cap enforced server-side
- [x] 400ms rate-limit between items to avoid Gemini quota exhaustion

### Jordan (Editorial Quality / Build Integrity)
- [x] `tsc -b` from `/functions` now type-checks both deployed codebases — TypeScript errors in CFs are caught before deploy
- [x] Pre-existing `markdownEngine.ts` argument bug fixed by TypeScript gate
- [x] Old monolith with stale `gemini-3.1-pro` reference (banned model) deleted — no confusion risk
- [x] Node version consistent: `package.json` engines, esbuild target, and `firebase.json` runtime all declare Node 24
- [x] CI/CD will rebuild and deploy functions on push to `dev` — no stale-bundle incidents

---

## Part 4 — Compliance Audit

| Item | Status |
|------|--------|
| `forfeitLoan` CF: `auditLogs` write via Admin SDK | ✅ PASS |
| `forfeitLoan` CF: `auditLogs.details` contains only `{ loanTicketId }` — no PII | ✅ PASS |
| `forfeitLoan` CF: `policeHold: false` set only via Admin SDK | ✅ PASS |
| `batchProcessItems` CF: all AI output to `items/{id}/internal/ai` only | ✅ PASS |
| `batchProcessItems` CF: staff auth via `assertStaff()` | ✅ PASS |
| No AI API keys on client | ✅ PASS — all calls remain in Cloud Functions |
| `rare-find`/`limited-edition` not auto-applied by `batchProcessItems` | ✅ PASS — tags are suggestions only |
| No PII in `auditLogs` | ✅ PASS — `batch: true` flag only |
| Decision logged in `docs/decisions/0008-functions-architecture-remediation.md` | ✅ PASS |

---

## Part 5 — Structural Verification

- [x] `functions/src/` directory no longer exists — `ls functions/` confirms
- [x] `functions/tsconfig.json` is a solution file with `"files": []` and `"references"` — not a compilation target
- [x] `functions/core/lib/` and `functions/operations/lib/` in `.gitignore`
- [x] `deploy-dev.yml`: Node 20 → Node 24 in `setup-node` step
- [x] `deploy-dev.yml`: functions deploy step uses `google-github-actions/auth@v2` + `FIREBASE_SERVICE_ACCOUNT_DEV` (existing secret)
- [x] `deploy-dev.yml`: functions deploy runs before hosting deploy — functions always fresh when hosting lands

---

## Sign-Off

**QA PASSED.** Feature: E99 Cloud Functions Architecture Remediation. Personas: Staff (Loan Operations), Staff (Batch AI), Jordan. Build: clean. TypeScript gate: active on deployed codebases. Compliance: verified. Smoke tests: passed. All 7 structural gaps closed.

---

*The Pawn Shop · docs/reports/E99_QA_REPORT.md · 2026-06-09*
