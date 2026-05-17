# Project E02: Three-View Design System

**Status:** Active
**Epic:** E02 — Three-View Design System
**Phase:** Phase 1 — Foundation
**Primary Persona:** Makoonsii (Pawn), Marie (Cannabis), Tanya (Fireworks) — each view has a primary anchor
**Secondary Personas:** Marcus (Photography framing across all views), Jordan (PWA manifest + cross-view coherence), Sandra (Pawn grid readiness)
**AI Involvement:** Claude (dev) only

**Objective:** Establish the complete Tailwind v4 design token system, `ViewContext` provider, React Router route structure, self-hosted font loading, and base component library for all three views, such that every subsequent epic can style correctly by writing `.view-*`-scoped CSS with `var(--color-primary)` — and nothing else.

---

## 1. User Story

> As **Makoonsii, Marie, and Tanya**, I want each view of The Pawn Shop to feel like a distinct, intentional brand expression — rich gold on dark for Pawn, dark luxury purple for Cannabis, high-energy red for Fireworks — so that the platform feels built with care for each specific audience, not reskinned from a template.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gates

**Makoonsii (Pawn):**
> *"Touch targets minimum 48px. Text minimum 16px body, high contrast."*
> *"No Kanien'kéha copy that has not passed community review — ever."*

Test: Render Button, Card, and Input on a 375px viewport. Verify all interactive targets hit 48px minimum. Verify IM Fell English body font renders at ≥16px. Verify WCAG AA contrast ratio ≥4.5:1 for body text on `#080706`.

**Marie (Cannabis):**
> *"Photography must match Marketing Guideline 1 (dark luxury, macro, minimalist)."*
> *"The `.view-cannabis` dark luxury aesthetic matches premium wellness brand standards."*

Test: Render the cinematic hero, mood card, and luxury product card on mobile. Verify Cormorant Garamond loads at correct weights. Verify `#7B4FA0` on `#1A0D2E` passes WCAG AA.

**Tanya (Fireworks):**
> *".view-fireworks high-energy palette and Bebas Neue headline render correctly on mobile."*

Test: Render the bundle card and urgency badge at 375px. Verify Bebas Neue headline renders. Verify `#C0392B` on `#1A0A0A` passes WCAG AA.

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px)
- [ ] All copy uses plain language — no jargon, no retail buzzwords
- [ ] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [ ] Feature is navigable by a low-tech mobile user in under 3 taps

### Marcus Photography Test (run for any customer-facing item display)

- [ ] Every `.view-*` layout frames product photography without cropping or clipping the primary image
- [ ] Dark background is the layout default — item images are not floated on white

### Marie Discretion Test

Not applicable — E02 contains no CRM, notifications, or cannabis/fireworks category disclosure.

### Kevin Speed Test

Not applicable — E02 contains no inventory alerts or listing flows.

---

## 3. Compliance Gate

- [ ] **Age gate required?** NO. Age gates are enforced in E05 at the router level. E02 establishes the visual system only.
- [ ] **`auditLogs` events required?** NO. No user-triggered events in a design system epic.
- [ ] **PII exclusion** — Confirmed. No user data touches this epic.
- [ ] **`policeHold` respected** — N/A. No inventory display in E02.
- [ ] **`aiDescription` draft-only** — N/A. No AI output displayed in E02.
- [ ] **AI API security** — N/A. No AI calls in E02.
- [ ] **CASL compliance** — N/A. No notifications in E02.
- [ ] **Scarcity integrity** — N/A. No `rare-find` or `limited-edition` tags in E02.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collections impacted: NONE

E02 is a pure frontend epic. No Firestore reads or writes occur.
No security rules require modification.
```

### New Fields Required

```
NEW FIELDS: NONE
```

### TypeScript Interfaces

```typescript
// ViewType — 'pawn' | 'cannabis' | 'fireworks'
// ViewContextValue — { view: ViewType; setView: (v: ViewType) => void }
// No src/lib/types.ts exists yet — ViewContext types defined locally
```

### Security Rules Required

None. E02 does not touch Firestore.

---

## 5. AI Involvement Detail

### Claude (development):

- `docs/prompts/PLANNING.md` — this document
- `docs/prompts/APPROVAL.md` — execution gate
- `docs/prompts/TESTING.md` — QA after delivery
- `docs/prompts/TICKET_CLOSE.md` — close after QA passes
- Guardrails: No hardcoded hex values. No JS conditionals for theming. `var(--color-primary)` only.

---

## 6. Implementation Phases

### Phase 1 — Infrastructure Setup

- [ ] Add `tailwindcss()` plugin to `vite.config.ts`
- [ ] Install `react-router-dom`
- [ ] Download and place self-hosted fonts in `public/fonts/`
- [ ] Clear default Vite scaffold (`App.tsx`, `App.css`, `index.css` → replace with project system)

### Phase 2 — Token System & ViewContext

- [ ] `@theme` block in `index.css` — Pawn tokens (`#C8A14A` primary / `#080706` bg)
- [ ] `@theme` block — Cannabis tokens (`#7B4FA0` primary / `#1A0D2E` bg)
- [ ] `@theme` block — Fireworks tokens (`#C0392B` primary / `#1A0A0A` bg)
- [ ] `@font-face` declarations for all 6 typefaces (self-hosted)
- [ ] `src/context/ViewContext.tsx` — reads URL prefix, injects `.view-*` class on root

### Phase 3 — Route Structure

- [ ] `react-router-dom` `createBrowserRouter` with `/pawn`, `/cannabis`, `/fireworks` routes
- [ ] Layout component wrapping each route — applies `.view-*` class from `ViewContext`
- [ ] Redirect `/` → `/pawn` (default view)

### Phase 4 — Core Components (Pawn base)

- [ ] Button — primary / secondary / ghost variants, 48px touch target minimum
- [ ] Badge — status-tagged (active / reserved / sold / condition grades)
- [ ] Card — item card with image, title, price, condition
- [ ] Modal — accessible, focus-trapped, escape-dismissible
- [ ] Input — text, search variants
- [ ] Table — data table with sort header

### Phase 5 — Cannabis & Fireworks Variants

- [ ] Cannabis: cinematic hero, mood card, luxury product card
- [ ] Fireworks: countdown timer shell (display only — real dates wired in E14), bundle card, urgency badge

### Phase 6 — PWA Manifest

- [ ] `public/manifest.json` — base manifest
- [ ] Per-view theme colours and icons configured
- [ ] `<link rel="manifest">` in `index.html`

### Phase 7 — QA

Run `docs/prompts/TESTING.md` with:
- Makoonsii Trust Test (Pawn base components, 375px viewport)
- Marcus Photography Test (dark background layout, no image cropping)
- WCAG AA: axe-core pass on all three palettes
- `npm run build` — zero errors
- `npm run lint` — zero warnings

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: all applicable items passed
- [ ] Compliance gate: all applicable items verified
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] WCAG AA contrast passes on all three palettes (axe-core)
- [ ] All E02 tasks in `docs/EPICS.md` ticked
- [ ] `docs/DECISIONS.md` updated (font strategy, router installation)
- [ ] `TICKET_CLOSE.md` drift check: clean
- [ ] PR opened with description generated from `TICKET_CLOSE.md` Phase 4

---

*The Pawn Shop · docs/projects/E02_Three_View_Design_System.md · v1.0*
