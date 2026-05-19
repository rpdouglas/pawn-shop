# Project E25: Header Navigation Refinement

**Status:** Done — 2026-05-19
**Epic:** E25 — Header Navigation Refinement
**Phase:** Phase 8 (Infrastructure & Polish)
**Primary Persona:** Jordan — The Lifestyle Connoisseur
**Secondary Personas:** Makoonsii, all staff personas
**AI Involvement:** Claude (dev)

**Objective:** Move the admin dashboard link from the header bar into the hamburger drawer (staff-only, role-gated) and update page title display to "The Pawn Shop - [View]" format to reinforce brand identity on every view.

---

## 1. User Story

> As **Jordan**, I want the header to reflect the full brand name on every page so that the editorial quality of "The Pawn Shop" is present throughout the experience, and the admin link lives where utility actions belong — in the menu.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate

> *"Jordan expects PWA Lighthouse ≥90 and `aiDescription` never customer-visible."*

Test for it: `npm run build` clean, no customer-facing admin content exposed.

### Makoonsii Trust Test (always run)

- [x] All touch targets ≥48px on mobile viewport (375px) — admin link in drawer uses `minHeight: '48px'`
- [x] All copy uses plain language — "Admin Dashboard" is plain; brand prefix is clear
- [x] No Kanien'kéha without `indigenousLanguageReviewed: true` — N/A
- [x] Feature is navigable by a low-tech mobile user in under 3 taps — hamburger → Admin Dashboard

---

## 3. Compliance Gate

- [x] **Age gate required?** No — navigation/header only
- [x] **`auditLogs` events required?** None — no data written
- [x] **PII exclusion** — N/A
- [x] **`policeHold` respected** — N/A
- [x] **`aiDescription` draft-only** — N/A
- [x] **AI API security** — N/A
- [x] **CASL compliance** — N/A
- [x] **Scarcity integrity** — N/A

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collections impacted: NONE
New fields required: NONE
```

### TypeScript Interfaces

```typescript
// AuthUser — user.isStaff gates admin link visibility in NavigationDrawer
```

---

## 5. AI Involvement Detail

### Claude (development):
- `docs/prompts/PLANNING.md`, `docs/prompts/TESTING.md`, `docs/prompts/TICKET_CLOSE.md`
- No special guardrails beyond standard ones

---

## 6. Implementation Phases

### Phase 1 — Schema & Security Rules
- [x] No schema changes required

### Phase 2 — Cloud Functions
- [x] No Cloud Functions modified

### Phase 3 — UI Components

- [x] `src/components/layout/NavigationDrawer.tsx` — updated `getPageTitle()` with brand prefix; added staff-gated admin link in drawer; fixed `fontSize: '1.25rem'` → `var(--text-lead)` and `transition: '0.3s'` × 3 → `var(--motion-speed-base)`; added overflow ellipsis on title span
- [x] `src/components/layout/UserNav.tsx` — removed admin `<Link>` block and unused `Link` import

### Phase 4 — QA

Run `docs/prompts/TESTING.md` with:
- Jordan persona: build clean, brand prefix visible on all views
- Makoonsii: 48px touch targets in drawer verified
- Accessibility: axe-core passes (no new interactive elements without labels)

---

## 7. Definition of Done

- [x] Persona acceptance criteria: all applicable items passed
- [x] Compliance gate: all applicable items verified
- [x] `npm run build` — zero errors
- [x] `npm run lint` — zero warnings
- [x] Relevant `docs/EPICS.md` task(s) ticked
- [x] `docs/DECISIONS.md` updated (if decisions made)
- [ ] PR opened

---

*The Pawn Shop · docs/projects/E25_Header_Navigation.md*
