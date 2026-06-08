# Plan — Inventory AI 500 Errors Fix
**Date:** 2026-06-08
**Cycle:** 32
**Spec:** `docs/projects/FIX_AI_INVENTORY_500.md`

---

## Diagnosis

### Root Cause

The deployed Cloud Functions bundle (`functions/operations/lib/index.js`) is stale. The `getModels()`
function in the bundle calls the Gemini API with `model: "gemini-3.1-pro"` — an invalid model ID
that **never existed**. Google returns a non-429/503 error (likely 404/400), which is NOT caught by
the fallback guard, re-throws to the outer `catch`, and translates to `HttpsError('internal')` → HTTP 500.

```
Source (correct):    model: 'gemini-2.5-pro'        ← commit bd3ae16
Bundle (deployed):   model: "gemini-3.1-pro"         ← commit b758cb7 (stale — BANNED model)
```

### Why This Happened

1. `functions/operations/lib/` is **tracked in git** (`.gitignore` only covers `functions/lib/`)
2. The source was fixed (`bd3ae16`) but the bundle was not rebuilt + redeployed
3. CI/CD deploys **Hosting only** — no functions deploy step exists in `deploy-dev.yml`
4. Manual `firebase deploy --only functions` was never run after the source fix

### Why extractIntakeData Still Works

`processUploadedImage` (mobile intake) uses `gemini-3.5-flash` as its **primary** model (not pro).
Since the flash model call works, extraction succeeds. The 500 only appears for
`generateAIDescription` and `suggestAiPrice`, which use pro as primary.

---

## Persona Gate

**Primary: Staff** — This bug blocks staff from using the AI Description Generator and AI Price
Suggester in the Inventory table. Jordan (Operations) and Marcus (Photography + Provenance) are the
downstream beneficiaries once AI-generated drafts flow correctly.

---

## Schema Audit

No Firestore schema changes. Functions read `items/{id}` (title, category, etc.) and write to
`items/{id}/internal/ai` (aiDescription, aiPriceSuggestion) and `auditLogs` — all existing fields.

---

## Anti-Regression Checklist

- ✅ No hardcoded hex values introduced
- ✅ No new Firestore fields
- ✅ AI API keys remain in Cloud Functions only
- ✅ No scarcity tag logic touched
- ✅ No PII in logs
- ✅ No age gate changes
- ✅ No motion patterns

---

## Three Strategies

---

### Strategy A — Emergency Rebuild + Deploy (Small — 1 file, ~5 min)

**Architecture:**
- Run `npm --prefix functions/operations run build` to rebuild `lib/index.js` from the correct source
- Run `firebase deploy --only functions --project nats-rack` to push the fresh bundle
- The `predeploy` step in `firebase.json` will also rebuild, so even without pre-building locally,
  a `firebase deploy` command rebuilds from source before pushing
- Bundle in git remains stale until someone manually commits it (or it never gets committed)

**Steps:**
1. `npm --prefix functions/operations run build`
2. `firebase deploy --only functions --project nats-rack`

**Persona Lens:**
- Staff get immediate unblocking (< 5 min)
- Jordan: AI pipeline restored; no editorial degradation

**Compliance:**
- No changes to auth, rules, or logging
- `GEMINI_API_KEY` stays in CF secrets — unchanged

**Trade-offs:**
- ✅ Fastest path to unblocking staff
- ⚠️ Bundle in git remains stale (source ≠ committed bundle) — source of confusion in future
- ⚠️ Does NOT fix the structural gap (CI still doesn't deploy functions)

**Estimated Scope:** Small — 0 file changes, 2 terminal commands

---

### Strategy B — Rebuild + Commit + Deploy (Small — 1 file, ~10 min)

**Architecture:**
- Rebuild `lib/index.js` from source
- Commit the rebuilt bundle so git repo reflects the correct deployed state
- User runs `firebase deploy --only functions --project nats-rack`

**Steps:**
1. `npm --prefix functions/operations run build`
2. `git add functions/operations/lib/index.js` (and other changed lib files)
3. `git commit` with message referencing the fix
4. `firebase deploy --only functions --project nats-rack`

**Persona Lens:**
- Staff unblocked; git history is clean and coherent

**Compliance:**
- No compliance impact

**Trade-offs:**
- ✅ Git repo in sync (source and bundle match)
- ✅ Future readers can trust the committed bundle reflects the source
- ⚠️ Committed build artifacts are generally an anti-pattern (git is not a build artifact store)
- ⚠️ Does NOT fix the structural gap (CI still doesn't deploy functions)

**Estimated Scope:** Small — 1 file rebuilt, 1 commit

---

### Strategy C — Structural Fix: Untrack Bundle + CI Functions Deploy (Medium — 3 files, ~30 min)

**Architecture:**
- Add `functions/operations/lib/` to `.gitignore` (root `.gitignore`)
- Remove the tracked lib files from git: `git rm --cached functions/operations/lib/`
- Add a Cloud Functions deploy step to `.github/workflows/deploy-dev.yml` so every push to `dev`
  that changes `functions/**` also deploys functions (using the `predeploy` build step)
- Run `firebase deploy --only functions --project nats-rack` now to fix the immediate issue

**Steps:**
1. Update `.gitignore` — add `functions/operations/lib/`
2. `git rm --cached -r functions/operations/lib/`
3. Update `deploy-dev.yml` — add Firebase Functions deploy step after the Hosting deploy
4. `firebase deploy --only functions --project nats-rack` (immediate fix)
5. Commit and push

**CI Addition (deploy-dev.yml):**
```yaml
- name: Deploy Functions to Firebase Dev
  if: steps.check.outputs.skip != 'true'
  run: |
    npm install -g firebase-tools
    firebase deploy --only functions --project nats-rack
  env:
    GOOGLE_APPLICATION_CREDENTIALS_JSON: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_DEV }}
```
*(Exact CI syntax to be confirmed against firebase-tools CLI auth pattern)*

**Persona Lens:**
- Staff unblocked immediately
- Future deployments are automatic — reduces operator burden

**Compliance:**
- No compliance impact
- Simplifies audit trail: deployed functions always match the last `dev` push

**Trade-offs:**
- ✅ Eliminates the root cause (build artifacts never stale in git again)
- ✅ Functions auto-deploy on every `dev` push — no manual step
- ⚠️ CI deploy step adds ~2–3 min to CI runtime
- ⚠️ Requires `firebase-tools` install in CI (or a Firebase deploy action)
- ⚠️ Medium scope — touching CI/CD has blast radius risk if misconfigured

**Estimated Scope:** Medium — 2 config files changed, CI step added

---

## Recommendation

**Strategy B** is the right call for today: it's fast, leaves git in a clean state, and doesn't
risk CI misconfiguration. Strategy C's CI fix is the right long-term answer but can be a separate
ticket once the 500 is resolved. Strategy A is acceptable if the user wants the absolute minimum —
but the stale committed bundle creates future confusion.

---

## STOP — Awaiting Approval

Do not write any code until the user approves a strategy.
