# Project E26: Versioning Strategy (CalVer + SHA)

**Status:** Planned
**Epic:** E26 — Versioning Strategy
**Phase:** Phase 8 (Infrastructure)
**Primary Persona:** Staff
**Secondary Personas:** NONE
**AI Involvement:** Neither

**Objective:** Implement an automated hybrid versioning strategy (CalVer + Git SHA) injected via GitHub Actions to provide zero-friction, traceable, and staff-friendly version numbers without manually bumping `package.json`.

---

## 1. User Story

> As **Staff (Developer)**, I want **my app to automatically generate a version number combining the current date and the git commit hash during deployment** so that I can **easily identify when the app was last updated and which exact commit is running without any manual version bumping**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate

> *Staff infrastructure requirement.*

Test for it: A deployment from GitHub Actions successfully injects `VITE_APP_VERSION` into the build. The version string is accessible in the React application and follows the format `vYY.MM.DD-shortsha` (e.g., `v26.05.19-a1b2c3d`).

### Makoonsii Trust Test (always run)
- [N/A] All touch targets ≥48px on mobile viewport (375px)
- [N/A] All copy uses plain language — no jargon, no retail buzzwords
- [N/A] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [N/A] Feature is navigable by a low-tech mobile user in under 3 taps

### Marie Discretion Test (run for any CRM, notification, or cannabis/fireworks feature)
- [N/A] All CRM comms use "The Pawn Shop Update" — no category disclosure
- [N/A] No cannabis/fireworks words in subject lines, SMS previews, or push notification copy

### Marcus Photography Test (run for any customer-facing item display)
- [N/A] Primary item images meet dark luxury standard
- [N/A] No placeholder or poorly lit images in the feature's view

### Kevin Speed Test (run for any alert, notification, or new-listing flow)
- [N/A] Alert dispatches within 60 seconds of `status: 'active'`
- [N/A] CASL `alertOptIn: true` verified before every send

---

## 3. Compliance Gate

- [ ] **Age gate required?** No.
- [ ] **`auditLogs` events required?** No.
- [ ] **PII exclusion** — Confirmed.
- [ ] **`policeHold` respected** — N/A
- [ ] **`aiDescription` draft-only** — N/A
- [ ] **AI API security** — N/A
- [ ] **CASL compliance** — N/A
- [ ] **Scarcity integrity** — N/A

---

## 4. Schema & Architecture

### Firestore Collections Impacted
None.

### New Fields Required
None.

### TypeScript Interfaces
Update `src/vite-env.d.ts` (or similar env typing file) to include `VITE_APP_VERSION` in `ImportMetaEnv`.

### Security Rules Required
None.

---

## 5. AI Involvement Detail

### If Claude (development):
- `docs/prompts/PLANNING.md`, `TESTING.md`, `TICKET_CLOSE.md` apply.

---

## 6. Implementation Phases

### Phase 1 — CI/CD Pipeline Updates
- [ ] Modify `.github/workflows/deploy-dev.yml` and `.github/workflows/deploy-prod.yml`:
  - Add a step to generate the version string before the build step: 
    ```bash
    echo "VITE_APP_VERSION=v$(date +'%y.%m.%d')-$(git rev-parse --short HEAD)" >> $GITHUB_ENV
    ```
  - Pass `VITE_APP_VERSION` into the build step's `env` block.

### Phase 2 — Application Integration
- [ ] Update `src/vite-env.d.ts` to declare `readonly VITE_APP_VERSION: string`.
- [ ] Update the UI (e.g., the Site Footer or Admin Dashboard) to display the version from `import.meta.env.VITE_APP_VERSION || 'v0.0.0-local'`.

### Phase 3 — Documentation
- [ ] Log the versioning strategy decision in `docs/DECISIONS.md`.
- [ ] Add the epic task to `docs/EPICS.md` if an Infrastructure phase section is active.

---

## 7. Definition of Done

- [ ] GitHub Actions successfully generate and inject the `VITE_APP_VERSION` on deploy.
- [ ] The application successfully displays the version string in the designated UI component.
- [ ] Local development builds work cleanly (displaying the local fallback string).
- [ ] `docs/DECISIONS.md` is updated with the versioning approach.
- [ ] PR opened with description generated from `TICKET_CLOSE.md` Phase 4.

---

*The Pawn Shop · docs/projects/E26_Versioning_Strategy.md · v1.0*
