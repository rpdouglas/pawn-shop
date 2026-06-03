# Epic Planner: E58 — Desktop Photo First

## Phase 1 — Persona & Compliance Gate
- **Primary Persona:** Staff / Admin
- **Tests Applied:** Staff workflows must prioritize speed and reduce redundant data entry.
- **Compliance Audit:** 
  - Age Gates: N/A
  - `auditLogs`: Will write `item_draft_created` and `ai_description_generated` via existing Cloud Functions.
  - PII: No PII involved.
  - `policeHold`: Handled via existing schema.
  - AI API Routing: Uses existing `processUploadedImage` Cloud Function.

## Phase 2 — Schema Audit
**Impacted Collections:**
- `items/{id}`
  - Read fields: `status`, `title`, `price`, `condition`, `viewTag`
  - Written fields: `images`, `title`, `category`, `description`, `condition`
- `items/{id}/internal/ai`
  - Read fields: `intakeExtraction`
- `auditLogs`
  - Written fields: `eventType`, `uid`, `targetId`, `details`, `createdAt`

**New Fields Needed:** NONE. The existing schema supports everything required.

## Phase 3 — Three-Strategy Proposal

### Strategy A: Minimal (The Quick Fix)
- **Architecture:** Move the `ImageUploadZone` to the top of `IntakeForm.tsx`. Remove the validation that blocks photo upload when `title` and `category` are empty. If `itemId` is null when a photo is dropped, automatically invoke `createDraftItemFn` behind the scenes, then upload the image.
- **Persona Lens:** Fixes the immediate blockade for staff.
- **Compliance:** Full compliance maintained.
- **Trade-offs:** No clear visual indicator that AI extraction is happening; the user might be confused if they start typing manually before the AI finishes.
- **Estimated Scope:** Small (1 file).

### Strategy B: Recommended (Guided Automation)
- **Architecture:** Implement Strategy A, but also add a visual overlay or clear visual cue (e.g., "✨ AI Extracting...") across the form fields while `images.length === 0` and the upload/processing state is active. Update the `onSnapshot` listener to safely populate fields if they are blank or hold placeholder values.
- **Persona Lens:** Excellent for staff. It explicitly signals that manual entry is temporarily unnecessary, reducing cognitive load and preventing duplicate work.
- **Compliance:** Full compliance maintained.
- **Trade-offs:** Requires slightly more React state management for the visual cue.
- **Estimated Scope:** Small-Medium (1 file).

### Strategy C: Robust (Multi-Step Desktop Wizard)
- **Architecture:** Completely rewrite `IntakeForm.tsx` to match the `MobileIntakePage.tsx` wizard approach (Step 1: Capture, Step 2: Details). Include dedicated error bounds, a "Retry AI" button, and strict step transitions.
- **Persona Lens:** High consistency across platforms, but might feel slower on desktop where staff prefer having all fields visible at once for bulk editing.
- **Compliance:** Full compliance maintained.
- **Trade-offs:** Heavy refactoring of a large component. Forces desktop users into a constrained wizard, which may not be ideal for power users.
- **Estimated Scope:** Large (1 file rewrite, potentially splitting into multiple components).

**Recommendation:** **Strategy B (Recommended)**. It unblocks the AI photo-first flow and provides the necessary visual cues without forcing desktop power users into a multi-step wizard.

## Phase 4 — Anti-Regression Protocol
- **No Hardcoded Hex/Px:** We will use CSS tokens (`var(--color-bg-subtle)`, `var(--space-*)`) for the new loading overlay.
- **Firestore Field Invention:** None.
- **Client-Side AI Keys:** None. AI runs in the existing CF.
- **Manufactured Scarcity:** N/A.
- **PII in Logs:** N/A.
- **Unapproved Motion Patterns:** None.
- **Brand Voice Violations:** Loading text will use established patterns ("✨ AI Extracting...").
