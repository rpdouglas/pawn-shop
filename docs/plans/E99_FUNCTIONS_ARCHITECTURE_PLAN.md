# Plan — E99 · Cloud Functions Architecture Remediation
**Date:** 2026-06-09
**Personas:** Staff (Loan Operations), Staff (Batch AI), Jordan

---

## Gap Analysis Summary

| # | Gap | Severity | Files Affected |
|---|---|---|---|
| 1 | Loan functions: 3 client calls use wrong names (`issueLoanTicket`, `redeemLoan`, `forfeitLoan`) — HTTP 404 in prod | **P0** | `useLoanTickets.ts`, `functions/core/src/loanTickets.ts` |
| 2 | `batchProcessItems` not deployed | **P1** | `functions/operations/src/ai.ts` (E98) |
| 3 | Node 20 in `package.json` / esbuild target, Node 24 in `firebase.json` | **P2** | `functions/core/package.json`, `functions/operations/package.json` |
| 4 | `npx tsc -b` only type-checks old monolith, not core/operations | **P2** | `functions/tsconfig.json` |
| 5 | Old monolith `functions/src/` not deleted | **P2** | `functions/src/` (25 files) |
| 6 | `lib/` build artifacts tracked in git | **P3** | `.gitignore`, `functions/core/lib/`, `functions/operations/lib/` |
| 7 | No CI/CD functions deploy | **P3** | `.github/workflows/deploy-dev.yml` |

---

## Strategy A — Hotfix Only (P0 patch, everything else deferred)

**What it does:** Fix the three loan call name mismatches immediately. Add `forfeitLoan` to core. Leave all structural gaps (Gaps 3–7) for later.

**Architecture:**
- Update `src/lib/useLoanTickets.ts`:
  - `issueLoanTicket` → `createLoanTicket`
  - `redeemLoan` → `redeemLoanTicket`
  - `forfeitLoan` call stays — add `forfeitLoan` export to `functions/core/src/loanTickets.ts`
- No CI changes, no monolith deletion, no Node version fix

**Persona Lens:**
- Unblocks staff loan workflow immediately
- Does not address batch AI (Gap 2) or structural risks

**Compliance:**
- `auditLogs` unchanged; no schema changes; no PII risk
- `forfeitLoan` CF follows same pattern as existing `redeemLoanTicket`

**Trade-offs:**
- ✅ Fastest path to stopping the P0 bleeding (1–2 hours)
- ✅ Minimal blast radius — touches 2 files
- ❌ Old monolith remains, TypeScript gate still broken, Node mismatch persists
- ❌ Structural debt guarantees a future incident

**Scope:** Small · 2 files · ~60 lines changed

---

## Strategy B — Full Structural Remediation (Recommended)

**What it does:** Fix all seven gaps in a single coordinated pass. P0 first, then structural improvements in dependency order.

**Architecture — Execution Order:**

**Phase 1 — P0 Fix (Loan name mismatch):**
- Update `src/lib/useLoanTickets.ts`: rename 3 `httpsCallable` call sites to match deployed function names
- Add `forfeitLoan` to `functions/core/src/loanTickets.ts` (new `onCall` handler)
- Deploy core codebase

**Phase 2 — P1 Fix (Batch AI — E98):**
- Migrate `batchProcessItems` + `generateDescriptionForItem` + `suggestPriceForItem` helpers from `functions/src/ai.ts` to `functions/operations/src/ai.ts`
- Update helpers: pass images, generate `aiTitle`/`aiCategory` (align with E97 schema)
- Export `batchProcessItems` from `functions/operations/src/index.ts`
- Deploy operations codebase

**Phase 3 — Structural (Node version + TypeScript gate):**
- Update `functions/core/package.json`: `engines.node` → `"24"`, esbuild target → `node24`
- Update `functions/operations/package.json`: same
- Update `functions/tsconfig.json` (or root `functions/package.json` build script) to call `tsc -b` in both core and operations, NOT in `functions/src/`
- Concretely: replace the root `functions/package.json` `typecheck` script with:
  ```
  "typecheck": "tsc --noEmit -p core/tsconfig.json && tsc --noEmit -p operations/tsconfig.json"
  ```

**Phase 4 — Cleanup (Delete old monolith):**
- Delete `functions/src/` directory entirely
- Verify `functions/tsconfig.json` doesn't reference it

**Phase 5 — Git hygiene (.gitignore + lib/ removal):**
- Add `functions/core/lib/` and `functions/operations/lib/` to root `.gitignore`
- `git rm --cached` to untrack the committed lib artifacts (user runs this)

**Phase 6 — CI/CD (functions deploy gate):**
- Add a `deploy-functions` job to `.github/workflows/deploy-dev.yml` that runs after lint/test:
  ```yaml
  - name: Deploy Functions
    run: firebase deploy --only functions --project nats-rack
    env:
      FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_NATS_RACK }}
  ```

**Persona Lens:**
- Fixes loan P0 → Staff can issue, redeem, forfeit loans
- Fixes batch AI P1 → Staff can run AI enrichment across multiple items
- TypeScript gate now covers deployed code → Jordan's quality bar met
- CI/CD ensures deployed functions always match committed source

**Compliance:**
- All Gemini calls remain in Cloud Functions
- No schema changes
- `forfeitLoan` CF: `auditLogs` write follows same pattern as `redeemLoanTicket`
- `batchProcessItems` migration: `aiTitle`/`aiCategory` writes to `internal/ai` (already in schema)

**Trade-offs:**
- ✅ Closes all 7 gaps in one cycle
- ✅ TypeScript gate finally covers all deployed code
- ✅ Eliminates stale monolith confusion
- ✅ CI/CD deploy prevents future stale-bundle incidents
- ❌ Larger scope — more files to review before deploy
- ❌ Deleting `functions/src/` is irreversible (mitigated by git history)
- ❌ CI/CD deploy requires `FIREBASE_SERVICE_ACCOUNT_NATS_RACK` secret in GitHub

**Scope:** Medium · ~12 files · ~200 lines net change (large deletions)

---

## Strategy C — Monorepo Consolidation (Merge core + operations)

**What it does:** Reverse the E34 split. Merge `functions/core` and `functions/operations` back into a single codebase (`functions/main`). Eliminates workspace complexity entirely.

**Architecture:**
- Merge all source files into `functions/main/src/`
- Single `index.ts` exporting all functions
- Single `package.json`, single esbuild build, single `firebase.json` codebase entry
- Fix all gaps as part of the consolidation

**Persona Lens:**
- Simplifies mental model for all developers
- Single `tsc` check, single deploy command

**Compliance:**
- Same as Strategy B

**Trade-offs:**
- ✅ Eliminates the multi-codebase complexity that caused E96 and E99
- ✅ Single deploy, single typecheck, simpler CI
- ❌ E34 split was done deliberately (cold-start isolation, independent scaling)
- ❌ Large refactor with high blast radius — every file in both codebases touched
- ❌ Firebase recommends multiple codebases for functions with very different resource profiles (AI image processing vs. lightweight auth CFs)
- ❌ Risk of introducing regressions during consolidation

**Scope:** Large · 25+ files · full restructure

---

## Recommendation

**Strategy B.** It closes the P0 loan failures and all structural gaps in a single coordinated pass, without the risk of a full codebase consolidation. The phases are ordered by severity — P0 can be deployed independently if urgency requires it.

---

## Anti-Regression Checklist (all strategies)

- [ ] No hardcoded hex values introduced
- [ ] No new Firestore fields that aren't in `firestore-schema.md`
- [ ] AI keys remain in Cloud Functions only
- [ ] No auto-applied scarcity tags
- [ ] No PII in logs or console output
- [ ] `npm run build` passes (both core and operations)
- [ ] `npm run test` passes (29/29 Vitest)
- [ ] `npx tsc -b` passes (after gate fix, covers deployed codebases)

---

*The Pawn Shop · docs/plans/E99_FUNCTIONS_ARCHITECTURE_PLAN.md · 2026-06-09*
