# Decision 0006 — AI Inventory 500 Fix: Approved Gemini Model IDs & Bundle Commit Policy

**Date:** 2026-06-08
**Epic:** FIX_AI_INVENTORY_500 · Inventory AI 500 Errors (generateAIDescription / suggestAiPrice)
**Cycle:** 32
**Status:** Implemented & Closed

---

## Context

`generateAIDescription` and `suggestAiPrice` Cloud Functions were returning HTTP 500. Root cause:
the deployed bundle (`functions/operations/lib/index.js`) used model ID `gemini-3.1-pro`, which
**never existed** in the Google Gemini API. The source file had been corrected to `gemini-2.5-pro`
in commit `bd3ae16` ("feat: update AI model versions in getModels function"), but the
`functions/operations/lib/` directory is tracked in git and the bundle was never rebuilt after the
source fix. CI/CD does not deploy Cloud Functions — only Hosting.

---

## Decision

### 1. Approved Model IDs for `functions/operations/src/ai.ts`

| Role | Model ID | Rationale |
|------|----------|-----------|
| Primary (`model`) | `gemini-2.5-pro` | Stable GA; proven reasoning quality for editorial description generation |
| Fallback (`flashModel`) | `gemini-3.5-flash` | Stable GA; fast quota/503 fallback; confirmed working in `extractIntakeData` path |
| Budget (`liteModel`) | `gemini-3.1-flash-lite` | Stable GA; right-sized for high-volume tag suggestions only |

These IDs are already documented in `docs/AI_MODELS.md` as the authoritative source of truth. This
decision cross-references that document for any future model changes.

### 2. Fix Approach: Strategy B (Rebuild + Commit)

Three strategies were evaluated:
- **A:** Rebuild and deploy without committing (stale bundle remains in git)
- **B:** Rebuild, commit fresh bundle, user deploys manually ← **CHOSEN**
- **C:** Remove `functions/operations/lib/` from git tracking + add CI functions deploy step

**Strategy B chosen** because it: (a) fixes the immediate 500 errors, (b) restores source/bundle
parity in git, and (c) avoids scope-creep into CI restructuring during an active deploy cycle.

**Strategy C** is the correct structural fix and is tracked as **E96** on the backlog.

---

## Rationale for Committing Build Artifacts (Temporary)

The `firebase.json` `predeploy` hook (`npm run build`) would rebuild the bundle before any
`firebase deploy` run. However, since CI does not invoke `firebase deploy --only functions`,
the committed bundle in `functions/operations/lib/` **is** the deployed artefact for manual deploys.

Committing the rebuilt bundle ensures:
1. The repo accurately reflects the deployed state after Strategy B
2. Any future `firebase deploy` run starts from a consistent, known-good state
3. The stale `gemini-3.1-pro` bundle is no longer in git history going forward

Once E96 ships (CI auto-deploys functions), the `lib/` directory should be removed from git
tracking (build-time artefacts do not belong in source control).

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Strategy A (no commit) | Leaves stale bundle in git; creates confusion for next developer |
| Strategy C now | Restructuring CI/CD during an active hot-fix cycle is high blast-radius risk |
| Keep `gemini-3.1-pro` | Banned model — never existed; confirmed production 500 source |

---

## Compliance Notes

- No Firestore schema changes
- No new Cloud Function exports
- `GEMINI_API_KEY` secret unchanged; remains in Firebase Secret Manager
- `auditLogs` writes unaffected — the 500 occurred before any write reached Firestore
- All AI API keys remain exclusively in Cloud Functions (not on client)

---

## Follow-up Required

**E96** — Remove `functions/operations/lib/` from git tracking and add CI functions deploy step
to `deploy-dev.yml` and `deploy-prod.yml`. See `docs/EPICS.md` for full task list.

---

*The Pawn Shop · docs/decisions/0006-ai-inventory-model-fix.md · 2026-06-08*
