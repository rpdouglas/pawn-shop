# Project E24_QA: Token Fixes

**Status:** Planned
**Epic:** Cycle 24 QA — Design Token & WCAG Fixes
**Phase:** Phase 9 — Production Readiness
**Primary Persona:** Jordan
**Secondary Personas:** Makoonsii
**AI Involvement:** Claude (dev)

**Objective:** Eliminate all hardcoded CSS values (px, rem, ms) in `HomePage.tsx` and `UserProfileCircle.tsx` by replacing them with design tokens, and fix the WCAG AA contrast failure in `NavigationDrawer.tsx` to achieve a zero-violation axe-core scan.

---

## 1. User Story

> As **Jordan (The Lifestyle Connoisseur)**, I want to **ensure the app's components strictly use the defined design tokens** so that **the visual consistency and premium feel of the PWA are maintained without layout shifts or contrast issues**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate

> *"No hardcoded px/rem/ms values in any shipped component. Token system must be consistent end-to-end."* (Jordan)
> *"Navigation drawer heading must pass WCAG AA contrast in all three views."* (Makoonsii)

Test for it: Code review verifies `HomePage.tsx` and `UserProfileCircle.tsx` no longer contain `px`, `rem`, or `ms` values inline. `NavigationDrawer.tsx` uses `--color-text-muted` instead of `--color-primary` for the `h2`. Automated tests: Playwright axe-core scan passes.

### Makoonsii Trust Test (always run)

- [x] All touch targets ≥48px on mobile viewport (375px)
- [x] All copy uses plain language — no jargon, no retail buzzwords
- [x] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [x] Feature is navigable by a low-tech mobile user in under 3 taps

---

## 3. Compliance Gate

- [x] **Age gate required?** — No
- [x] **`auditLogs` events required?** — No
- [x] **PII exclusion** — Confirmed
- [x] **`policeHold` respected** — N/A
- [x] **`aiDescription` draft-only** — N/A
- [x] **AI API security** — N/A
- [x] **CASL compliance** — N/A
- [x] **Scarcity integrity** — N/A

---

## 4. Schema & Architecture

### Firestore Collections Impacted

None.

### New Fields Required

None.

### TypeScript Interfaces

None.

### Security Rules Required

None.

---

## 5. AI Involvement Detail

### If Claude (development):
- `docs/prompts/PLANNING.md`, `docs/prompts/TESTING.md`, `docs/prompts/TICKET_CLOSE.md` apply.
- Guardrails: Do not introduce any new hardcoded hex values, `px`, `rem`, or `ms` values. Strictly adhere to CSS tokens.

---

## 6. Implementation Phases

### Phase 1 — Component Refactoring

- [ ] Fix `HomePage.tsx`: replace `maxWidth`, `minHeight`, `fontSize`, `transition` with `--space-*`, `--text-*`, `--motion-*` tokens.
- [ ] Fix `UserProfileCircle.tsx`: replace all hardcoded `px`/`rem` with `--space-*` / `--text-*` / `--dropdown-min-width` tokens.
- [ ] Fix `NavigationDrawer.tsx`: change `h2` colour from `--color-primary` to `--color-text-muted`.

### Phase 2 — QA

Run `docs/prompts/TESTING.md` with:
- Accessibility: axe-core + WCAG AA via `npm run test:a11y`

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: all applicable items passed
- [ ] Compliance gate: all applicable items verified
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] Relevant `docs/EPICS.md` task(s) ticked
- [ ] `TICKET_CLOSE.md` drift check: clean
- [ ] PR opened with description generated from `TICKET_CLOSE.md` Phase 4
