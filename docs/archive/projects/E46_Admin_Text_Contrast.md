# Project E46: Muted Text Contrast Enhancement

**Status:** Done
**Epic:** E09 — Quality, Security, Accessibility
**Phase:** Phase 3
**Primary Persona:** Makoonsii
**Secondary Personas:** Staff
**AI Involvement:** Claude (dev)

**Objective:** Significantly lighten the muted text color used across the platform (most visibly in the Admin Intake forms) to resolve readability issues and eliminate eye strain for staff and users.

---

## 1. User Story

> As **Makoonsii** (or a staff member), I want to **easily read secondary and muted text (like form steps and helper text)** so that I can **navigate workflows without squinting or straining my eyes**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate (Makoonsii)
> *"Feature is navigable by a low-tech mobile user..."*

Test for it: The muted text color (`--color-text-muted`) must pass a visual high-contrast check against the dark backgrounds, ensuring it is distinctly legible even in poor lighting conditions.

---

## 3. Compliance Gate

- [ ] **Age gate required?** No.
- [ ] **`auditLogs` events required?** No.
- [ ] **PII exclusion** — Verified.
- [ ] **`policeHold` respected** — N/A.

---

## 4. Schema & Architecture

### Firestore Collections Impacted
NONE.

### New Fields Required
NONE.

### TypeScript Interfaces
NONE.

### Security Rules Required
NONE.

---

## 5. AI Involvement Detail

### If Claude (development):
- `docs/prompts/PLANNING.md`, `TESTING.md`, `TICKET_CLOSE.md` apply.

---

## 6. Implementation Phases

### Phase 1 — Palette Adjustment
- [x] Determine the scope of the color change (Global Pawn View vs. Admin-Only override).
- [x] Select a significantly lighter hex code for `--color-text-muted` (e.g., `#D1C9BE`).

### Phase 2 — Implementation
- [x] Update `src/index.css` or the relevant layout component with the new color token.
- [x] Update `docs/design-system.md` to document the palette shift.

### Phase 3 — QA
- [x] Verify the intake form on mobile reads clearly.
- [x] Verify contrast ratios exceed WCAG AAA standards.

---

## 7. Definition of Done

- [x] CSS token updated.
- [x] `npm run build` — zero errors.
- [x] `docs/design-system.md` updated.
- [x] PR opened.
