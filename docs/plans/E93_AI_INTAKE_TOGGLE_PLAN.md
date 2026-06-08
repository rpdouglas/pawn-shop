# E93 · AI Intake Toggle — Plan
**Feature:** Optional AI Engine on Pawn Intake Forms
**Persona:** Staff (intake_staff / manager / admin)
**Cycle:** 32
**Status:** Approved — awaiting implementation

---

## Problem Statement

When staff need to batch-enter multiple similar items (e.g., 10 identical watches), the current
AI-first intake flow runs Gemini extraction + eBay pricing comps on every first photo upload.
This is wasteful (Gemini API cost) and creates unnecessary wait time for items where the staff
already knows the description and price.

Similarly, when manually entering a known item with a set price, the AI overlay is an unwanted
interruption.

---

## Decision Log (Grill-Me Session — 2026-06-08)

| Question | Decision |
|----------|----------|
| Scope | Both desktop (`IntakeForm.tsx`) and mobile (`MobileIntakePage.tsx`) |
| Default state | **ON** — AI runs automatically; staff unchecks to skip |
| What is skipped | BOTH extraction (title/category/description/fields) AND market pricing comps |
| Trigger timing | First photo only (unchanged from current behaviour) |
| Persistence | Session-scoped — remembered while the tab is open, resets on page reload |
| UI placement | Inline in the "Capture & View" section, above/below the upload zone |
| Toggle lock | Locked once the first photo is uploaded — prevents mid-flight state confusion |

---

## Strategy A — Minimal
Add a simple `<input type="checkbox">` with no persistence. Toggle resets on every page load.
- Pros: 2 lines of state, very fast.
- Cons: Useless for batch workflows — staff must uncheck every new item.

## Strategy B — Recommended ✅
Add a styled toggle switch with `sessionStorage` persistence.
- `useSessionStorage` hook (or inline) stores `aiIntakeEnabled: boolean`.
- Toggle displayed inline in "Capture & View", locked after first photo.
- Works on both desktop and mobile intake.
- One toggle controls both extraction + pricing.

## Strategy C — Robust
Strategy B + a "Run AI now" button that appears after upload if AI was skipped, allowing
staff to trigger AI retroactively without re-uploading.
- Deferred to a future enhancement cycle — adds complexity to the CF call pattern.

---

## Approved Strategy: **B — Recommended**

---

## Implementation Plan

### Files to Modify

#### 1. `src/components/admin/IntakeForm.tsx` (Desktop)
- Add `aiEnabled` state: `useState(true)` — session-persisted via `sessionStorage`.
- On mount: read `sessionStorage.getItem('aiIntakeEnabled')`.
- On toggle change: write `sessionStorage.setItem('aiIntakeEnabled', ...)`.
- Render toggle in `"Capture & View"` section, **above** the `<ImageUploadZone>`.
- Lock toggle (`disabled`) once `images.length > 0` or `phase === 'editing'`.
- Pass `extractData={aiEnabled && images.length === 0}` to `<ImageUploadZone>` (replaces
  current hardcoded `extractData={images.length === 0}`).

#### 2. `src/pages/admin/MobileIntakePage.tsx` (Mobile)
- Add `aiEnabled` state: same `sessionStorage` key (`'aiIntakeEnabled'`) for cross-form
  consistency — staff flipping it on desktop carries over to mobile in the same tab.
- Render toggle in **Step 1** (Photo step), above the upload button.
- Lock toggle after photo upload starts.
- Pass `extractData: aiEnabled` to `processUploadedImageFn` call (currently hardcoded `true`).

### Toggle Component
Reuse the existing design token system — no new CSS classes required. Style with:
- `role="switch"`, `aria-checked`, `aria-label="Use AI to fill form fields and pricing"`
- Visible label: `✨ Auto-fill with AI` (checked) / `Manual entry` (unchecked)
- A small muted helper text: `"AI will auto-fill title, description & pricing from your photo"`

### No Backend Changes Required
The `extractData` boolean is already wired through `ImageUploadZone` → `processUploadedImageFn`.
The CF already honours `extractData: false` (skips extraction). Zero CF changes needed.

---

## Compliance Checklist
- [x] No new Firestore fields — toggle is client-only state
- [x] No PII in sessionStorage — only a boolean flag
- [x] `aiDescription` still never customer-visible (unchanged)
- [x] No hardcoded hex / px — uses design tokens
- [x] Accessible: role="switch", aria-checked, aria-label

## Schema Audit
No schema changes required.

## Persona Impact
- **Staff:** Direct win — saves Gemini API cost and wait time during batch entry workflows.
- **Marcus / Jord:** Unaffected — AI-generated descriptions still go to `aiDescription` for
  staff review before promotion to `description`. Toggle doesn't change that gate.

---

*The Pawn Shop · docs/plans/E93_AI_INTAKE_TOGGLE_PLAN.md*
