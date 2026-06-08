# Decision 0003 — E93 AI Intake Toggle: Strategy B

**Date:** 2026-06-08
**Epic:** E93 · AI Intake Toggle (Opt-Out for Batch Entry)
**Cycle:** 32
**Status:** Implemented & Closed

---

## Context

The AI-first intake flow (`E57`, `E58`) automatically triggers Gemini extraction + eBay pricing
comps on the first photo uploaded for every new item. This is correct for single-item intake but
wasteful when staff are batch-entering multiple similar items (e.g., a batch of identical watches)
or manually entering items where the description and price are already known.

Staff requested a way to skip the AI engine for a given intake without losing the ability to
upload photos.

---

## Decision

**Strategy B: Session-scoped toggle with sessionStorage persistence.**

- A toggle switch (`role="switch"`) is rendered inline in the "Capture & View" section of both
  `IntakeForm.tsx` (desktop) and `MobileIntakePage.tsx` (mobile).
- Default state: **ON** — AI runs as today; no change to the happy path.
- The toggle is persisted in `sessionStorage` under the key `'aiIntakeEnabled'` so it survives
  navigation within a batch session but resets on page reload.
- Both forms read the same sessionStorage key for cross-form consistency within a tab.
- The toggle locks (disabled) once the first photo upload fires — prevents mid-flight state
  confusion where AI is running but the toggle has been switched.
- When OFF, `extractData: false` is passed to `processUploadedImageFn` — the Cloud Function
  already honours this flag, skipping both Gemini extraction and eBay pricing comps.

---

## Alternatives Considered

| Option | Rejected Reason |
|--------|----------------|
| Strategy A: No persistence (always resets) | Defeats the batch-entry use case — staff must uncheck on every new item |
| Strategy C: "Run AI now" button after upload | Adds complexity to the CF call pattern; deferred to future enhancement |
| Two separate toggles (extraction vs pricing) | Overcomplicated for the use case; one toggle is sufficient since the CF handles both in a single call |

---

## Compliance Notes

- Toggle state lives in `sessionStorage` only — no Firestore writes, no PII.
- `aiDescription` customer-visibility gate is unchanged. The toggle only controls whether
  extraction *runs*, not whether its output is customer-visible.
- No new Firestore fields or schema changes required.
- `role="switch"` with `aria-checked` and `aria-label` — WCAG compliant.

---

## Files Changed

- `src/components/admin/IntakeForm.tsx` — `aiEnabled` state, `handleAiToggle`, toggle UI,
  `extractData={aiEnabled && images.length === 0}` prop
- `src/pages/admin/MobileIntakePage.tsx` — `aiEnabled` state + `aiEnabledRef`, `handleAiToggle`,
  toggle UI, `extractData: aiEnabledRef.current` in CF call, dynamic step subtitle
- `src/components/admin/IntakeForm.test.tsx` — 7 new unit tests for toggle behaviour

---

*The Pawn Shop · docs/decisions/0003-ai-intake-toggle.md · 2026-06-08*
