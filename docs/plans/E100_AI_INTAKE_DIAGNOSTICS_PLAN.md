# E100 — AI Intake Pipeline Diagnostics: Plan

**Status:** 🔄 AWAITING APPROVAL
**Spec:** `docs/projects/E100_AI_INTAKE_DIAGNOSTICS.md`
**Date:** 2026-06-09

---

## Context: The Pipeline

```
Staff uploads photo
     ↓
ImageUploadZone / MobileIntakePage (client)
     ↓  (Storage upload)
processUploadedImage CF called with { filePath, extractData: true, viewTag }
     ↓  (download from Storage)
     ↓  (watermark + WebP + save to images/)
     ↓  (if extractData && viewTag)
extractIntakeData(buffer, mimeType, viewTag)   ← calls Gemini
     ↓  (Gemini response → JSON.parse)
     ↓  (Firestore write to items/{id}/internal/ai.intakeExtraction)
     ↓
Frontend onSnapshot on items/{id}/internal/ai  ← already has [AI Intake] logs
     ↓  (hydrate form fields)
```

**Current logging gaps (CF side):**
- No log that CF was called or with what params
- No log confirming image download size
- No log confirming `extractIntakeData` was invoked
- No log of which Gemini model was used
- No log of raw response text (to catch partial/malformed JSON)
- No log confirming Firestore write succeeded

**Frontend logging already present** (no changes needed):
- `[AI Intake] Starting real-time listener for item: {id}`
- `[AI Intake] 'internal/ai' document does not exist yet`
- `[AI Intake] Received update from 'internal/ai': {data}`
- `[AI Intake] Hydrating form with AI suggested fields`

---

## Persona Gate

**Primary:** Staff — inventory_staff, manager, admin who run intake flows.
No customer-facing persona is served by this diagnostic work. The fix unblocks the staff intake workflow.

---

## Schema Audit

No new Firestore fields required. No `firestore-schema.md` changes needed.
Reads/writes remain unchanged — only logging is added.

---

## Strategy A — CF Console Logging Only (Recommended)

### What it does
Add `console.log` breadcrumbs to two Cloud Function files:
- `functions/operations/src/inventory.ts` — `processUploadedImage`
- `functions/operations/src/ai.ts` — `extractIntakeData`

Firebase Cloud Logging captures all `console.log` from deployed CFs automatically.

### Log lines added

**`processUploadedImage`:**
```
[processUploadedImage] called itemId={itemId} extractData={true/false} viewTag={pawn/cannabis/fireworks}
[processUploadedImage] image downloaded bufferBytes={n}
[processUploadedImage] watermark+WebP complete finalPath={path}
[processUploadedImage] image saved to Firestore images[] url={url}
[processUploadedImage] extractData=true, calling extractIntakeData viewTag={tag}
[processUploadedImage] extractIntakeData returned successfully
[processUploadedImage] intakeExtraction written to Firestore items/{id}/internal/ai
[processUploadedImage] complete success
```

**`extractIntakeData`:**
```
[extractIntakeData] called viewTag={tag} mimeType={type} bufferBytes={n}
[extractIntakeData] cannabis pass1 strainName extracted: {name}   (if viewTag=cannabis)
[extractIntakeData] fuzzy match result: bestMatch={name} distance={n}  (if viewTag=cannabis)
[extractIntakeData] attempting Gemini Flash model
[extractIntakeData] Flash succeeded, rawLength={n}
  OR
[extractIntakeData] Flash failed ({status}), falling back to Pro
[extractIntakeData] Pro succeeded, rawLength={n}
  OR
[extractIntakeData] Pro also failed, gracefully degrading
[extractIntakeData] JSON parse succeeded fields={title,category,...}
  OR
[extractIntakeData] JSON parse failed, rawText={first 300 chars}
```

### Architecture
- 2 files changed
- No schema changes
- No frontend changes
- No new dependencies
- Logs viewable in Firebase Console → Functions → Logs (or `firebase functions:log`)

### Anti-regression
- No hardcoded hex
- No Firestore field changes
- No AI key on client
- No PII in any log (item IDs and byte counts only)

### Trade-offs
- **Pro:** Minimal blast radius. Zero risk to existing pipeline.
- **Con:** Requires Firebase Console access to view logs. Staff cannot see diagnostic in the app UI.

### Estimated scope
**Small** — 2 files, ~25 log lines total.

---

## Strategy B — CF Logging + imageJobs Diagnostic Fields (Small-Medium)

### What it does
All of Strategy A plus: enrich the `imageJobs/{filename}` Firestore doc (already written/read by the pipeline) with structured diagnostic fields so the frontend can surface pipeline stage without Firebase Console access.

### New fields on `imageJobs/{filename}` (no schema change needed — imageJobs is a transient tracking doc):
```
aiModel: string          — 'flash' | 'pro' | 'none'
aiResponseBytes: number  — raw response length
aiParseSuccess: boolean  — did JSON.parse succeed
aiWriteSuccess: boolean  — did Firestore write succeed
aiError: string | null   — error message if any step failed
```

### Architecture
- 3 files changed (`inventory.ts`, `ai.ts`, and a small `imageJobs` update)
- `imageJobs` already has `status`, `attempt`, `updatedAt` — these diagnostic fields extend it
- Frontend `MobileIntakePage.tsx` already listens to `imageJobs` for status — could optionally display `aiModel` / `aiParseSuccess`

### Trade-offs
- **Pro:** Diagnostic visible in the app without Firebase Console.
- **Con:** More Firestore writes per intake. Slightly wider scope than strictly needed.

### Estimated scope
**Small-Medium** — 3 files, ~30 lines.

---

## Strategy C — CF + Frontend Pipeline Status Panel (Medium)

### What it does
All of Strategy B plus: add a collapsible "Pipeline Diagnostics" panel inside `IntakeForm.tsx` and `MobileIntakePage.tsx` (staff-only, dev/debug mode) that displays the `imageJobs` diagnostic fields in real-time as the intake pipeline runs.

### Architecture
- 5 files changed (`inventory.ts`, `ai.ts`, `IntakeForm.tsx`, `MobileIntakePage.tsx`, and potentially a `DiagnosticPanel.tsx` component)
- Panel hidden behind `import.meta.env.DEV` or staff-only gate
- No new routes or public-facing changes

### Trade-offs
- **Pro:** Full real-time visibility in the UI. Easiest to use for non-technical staff.
- **Con:** Adds UI complexity. Requires UI testing. Larger scope than the problem warrants for a transient debugging need.

### Estimated scope
**Medium** — 4-5 files, ~80 lines.

---

## Recommendation

**Strategy A.** The frontend already has comprehensive `[AI Intake]` log coverage — the gap is entirely on the CF side. A focused set of `console.log` breadcrumbs in the two CF files will immediately reveal whether Gemini is being called, which model responds, whether JSON parsing succeeds, and whether the Firestore write completes. Firebase Cloud Logging is the right tool for CF diagnostics. This is the smallest, safest approach.

Once the root cause is identified, a targeted fix (separate epic/fix ticket) can be applied.

---

## Anti-Regression Checklist (All Strategies)

- [ ] No hardcoded hex values
- [ ] No invented Firestore fields (Strategy A/B extend existing `imageJobs` tracking doc only)
- [ ] No AI API keys on client
- [ ] No PII in any log line (item IDs, buffer sizes, model names only)
- [ ] No age gate changes
- [ ] No auto-applied scarcity tags
- [ ] No unapproved motion patterns

---

*The Pawn Shop · docs/plans/E100_AI_INTAKE_DIAGNOSTICS_PLAN.md · 2026-06-09*
