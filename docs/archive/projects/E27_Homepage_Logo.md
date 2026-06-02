# Project E27: Homepage Logo Integration

**Status:** Done
**Epic:** E27 — Homepage Logo Integration
**Phase:** Phase 7 from EPICS.md
**Primary Persona:** Makoonsii
**Secondary Personas:** Jordan, Marcus
**AI Involvement:** Claude (dev)

**Objective:** Add the official brand logo (`/branding/logo_pc.png`) to the homepage to strengthen brand identity and trust, ensuring it is correctly sized, accessible, and optimized for performance.

---

## 1. User Story

> As **Makoonsii**, I want to **see the official Pawn Shop logo prominently on the homepage** so that I can **immediately recognize the brand and feel confident I am in the right place**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate (Makoonsii)

> *"Feature is navigable by a low-tech mobile user in under 3 taps"*

Test for it: Open the homepage on a mobile device. The logo must be clear and appropriately sized (not overpowering the viewport) before the first scroll.

### Makoonsii Trust Test (always run)

- [x] All touch targets ≥48px on mobile viewport (375px) - *N/A for static image, but verified for surroundings.*
- [ ] All copy uses plain language — no jargon, no retail buzzwords
- [ ] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [x] Feature is navigable by a low-tech mobile user in under 3 taps

### Jordan & Marcus Performance/Quality Test

- [ ] Logo is optimized (webp preferred) or significantly compressed from the current 2.3MB source to ensure Lighthouse SEO/Performance scores remain ≥95.
- [ ] Logo alt text provided for screen readers (`alt="The Pawn Shop - Cornwall Island, Akwesasne"`).

---

## 3. Compliance Gate

- [ ] **Age gate required?** No (Homepage).
- [ ] **`auditLogs` events required?** No.
- [ ] **PII exclusion** — Confirmed.
- [ ] **`policeHold` respected** — N/A.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

NONE.

### New Fields Required

None.

### TypeScript Interfaces

None.

### Security Rules Required

None.

---

## 5. AI Involvement Detail

### If Claude (development):
- `docs/prompts/PLANNING.md`, `TESTING.md`, `TICKET_CLOSE.md` apply.
- Guardrail: Ensure image dimensions are specified (`width`, `height`) to prevent Layout Shift (CLS) on page load.

---

## 6. Implementation Phases

### Phase 1 — Asset Optimization
- [ ] Investigate/execute compression on `/public/branding/logo_pc.png`.
- [ ] Provide dimensions for the `<img>` tag in `HomePage.tsx`.

### Phase 2 — UI Integration
- [ ] Modify `src/pages/HomePage.tsx` to insert the logo between the header and the main `h1`.
- [ ] Apply responsive styles (e.g., `max-width: 250px` on mobile, `max-width: 350px` on desktop).

### Phase 3 — QA
- [ ] Run `axe-core` to verify accessibility.
- [ ] Run `lhci` or check Lighthouse performance locally to ensure no regression from the large asset.

---

## 7. Definition of Done

- [ ] Logo is visible and centered on the homepage.
- [ ] Alt text is present.
- [ ] Performance score ≥90 (or no regression >2 points).
- [ ] `npm run build` — zero errors.
- [ ] Relevant `docs/EPICS.md` task(s) ticked.

---

*The Pawn Shop · docs/projects/E27_Homepage_Logo.md · v1.0*
