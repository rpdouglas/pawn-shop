# Project E23: Unified Global Header

**Status:** Completed
**Epic:** E23 — Unified Global Header
**Phase:** Phase 7 from EPICS.md
**Primary Persona:** Makoonsii
**Secondary Personas:** Jordan, Marcus, Staff
**AI Involvement:** Claude (dev)

**Objective:** Consolidate the dual-header navigation into a single, mobile-first application shell featuring a Hamburger Menu, a dynamic page title, and a consolidated user actions area.

---

## 1. User Story

> As **Makoonsii**, I want to **navigate the site using a single, clear hamburger menu** so that I can **easily browse on my phone without confusing or duplicated menus**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate (Makoonsii)

> *"Touch targets ≥48px. IM Fell English body font legible at 16px minimum. High contrast on #080706 background."*

Test for it: Open the site on a 375px viewport (mobile). Verify that the hamburger toggle, all links within the navigation drawer, and the user profile circle have a computed hit area of at least 48x48 pixels.

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px)
- [ ] All copy uses plain language — no jargon, no retail buzzwords
- [ ] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [ ] Feature is navigable by a low-tech mobile user in under 3 taps

### Marcus Photography Test (run for any customer-facing item display)

- [N/A] Primary item images meet dark luxury standard
- [N/A] No placeholder or poorly lit images in the feature's view

---

## 3. Compliance Gate

- [x] **Age gate required?** No new age gate, but the navigation must successfully route to Cannabis/Fireworks and respect existing gates.
- [x] **`auditLogs` events required?** None for the header UI specifically, but the Profile/Sign Out flow must continue to log the `logout` event.
- [x] **PII exclusion** — Confirmed. No new PII exposed in the header (existing email/initials are auth-session scoped).
- [x] **`policeHold` respected** — N/A
- [x] **`aiDescription` draft-only** — N/A

---

## 4. Schema & Architecture

### Firestore Collections Impacted

No direct schema changes. Header relies exclusively on existing `AuthContext` and `ViewContext` states.

```
Collection: N/A
Fields read: N/A
Fields written: N/A
```

### New Fields Required

None.

### TypeScript Interfaces

Uses existing interfaces:
- `AuthUser` (for role gating and avatar initials)
- `ViewType` (for dynamic page title context)

### Security Rules Required

None.

---

## 5. AI Involvement Detail

### If Claude (development):
- `docs/prompts/PLANNING.md`, `TESTING.md`, `TICKET_CLOSE.md` apply.
- Guardrail: Claude must implement the hamburger menu using CSS tokens (`var(--color-*)`) without any hardcoded colors or dimensions that break the Makoonsii 48px rule.

---

## 6. Implementation Phases

### Phase 1 — GlobalHeader Skeleton & Context
- [ ] Refactor `GlobalHeader.tsx` to remove the monolithic navigation logic.
- [ ] Scaffold left-aligned section (Hamburger + Page Title).
- [ ] Scaffold right-aligned section (UserNav).
- [ ] Remove legacy `<nav>` dev links from `src/App.tsx`.

### Phase 2 — The Navigation Drawer
- [ ] Create `NavigationDrawer.tsx`.
- [ ] Implement toggle state and accessible backdrop overlay.
- [ ] Render the primary site links inside the drawer: `Home`, `Pawn`, `Cannabis`, `Fireworks`, and `Tobacco (Coming Soon)`.
- [ ] Read `ViewContext` to display the active view as the persistent title in the main header bar.

### Phase 3 — User Actions & Profile Circle
- [ ] Create `UserProfileCircle.tsx` to handle visual avatar state (Initials or default icon).
- [ ] Build dropdown menu for Profile Circle (`Profile`, `Sign Out`, `Sign In`).
- [ ] Integrate existing `NotificationDropdown` next to the Profile Circle.
- [ ] Integrate role-gated Admin Dashboard button (`user.isStaff`).

### Phase 4 — The Home Landing Page
- [ ] Create a placeholder `HomePage.tsx` in `src/pages/`.
- [ ] Map the index route (`/`) in `src/main.tsx` to `<HomePage />` instead of redirecting to `/pawn`.

### Phase 5 — QA
- [ ] Verify Makoonsii 48px hit areas for all new elements.
- [ ] Verify hamburger menu interaction on 375px viewport.
- [ ] Verify `user.isStaff` correctly hides/shows the Admin button.

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: all applicable items passed (specifically Makoonsii 48px).
- [ ] Compliance gate: all applicable items verified.
- [ ] `npm run build` — zero errors.
- [ ] `npm run lint` — zero warnings.
- [ ] `TICKET_CLOSE.md` drift check: clean.
- [ ] PR opened with description generated from `TICKET_CLOSE.md` Phase 4.

---

*The Pawn Shop · docs/projects/E23_Unified_Header.md · v1.0*
