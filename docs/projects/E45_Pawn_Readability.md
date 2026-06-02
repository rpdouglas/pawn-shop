# Project E45: Pawn View Readability Improvements

**Status:** Done
**Epic:** E09 — Quality, Security, Accessibility
**Phase:** Phase 3
**Primary Persona:** Makoonsii
**Secondary Personas:** Dale, Sandra
**AI Involvement:** Claude (dev)

**Objective:** Improve the body text legibility and contrast ratio in the Pawn Shop view to ensure effortless reading without sacrificing the cinematic, luxury brand aesthetic.

---

## 1. User Story

> As **Makoonsii**, I want to **easily read product descriptions and editorial content** so that I can **engage with the stories without eye strain or difficulty**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate (Makoonsii)
> *"All copy uses plain language... Feature is navigable by a low-tech mobile user..."*

Test for it: Readability on mobile viewports must be clear and crisp. The body font must render cleanly at 16px and 14px sizes. The contrast ratio for muted text (`--color-text-muted`) against the background must comfortably exceed WCAG AA minimums (4.5:1).

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

### Phase 1 — Font Selection & Palette Adjustment
- [x] Select a new highly readable body font to replace `IM Fell English` in `.view-pawn`.
- [x] Adjust `--color-text-muted` in `.view-pawn` to improve contrast against `#080706`.

### Phase 2 — Implementation
- [x] Update `src/index.css` with the new `@fontsource` import and CSS variable updates.
- [x] Update `docs/design-system.md` to reflect the new typography and palette rules.

### Phase 3 — QA
- [x] Run Lighthouse Accessibility to verify contrast ratios pass ≥ 90.

---

## 7. Definition of Done

- [x] New font installed and rendering without FOUT.
- [x] `npm run build` — zero errors.
- [x] `docs/design-system.md` updated.
- [x] PR opened.
