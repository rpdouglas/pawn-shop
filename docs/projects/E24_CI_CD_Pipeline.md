# Project E24: CI/CD Pipeline Strategy

**Status:** Planned
**Epic:** E24 — CI/CD Pipeline Strategy
**Phase:** Phase 8 (Infrastructure)
**Primary Persona:** Staff
**Secondary Personas:** NONE
**AI Involvement:** Neither

**Objective:** Restructure GitHub Actions to support a `dev` and `main` branch flow, with both initially deploying to the Dev environment for safe feature testing and rollback.

---

## 1. User Story

> As **Staff (Developer)**, I want to **deploy feature branches to a dev environment and maintain a stable main branch that also deploys to dev** so that I can **test safely and quickly revert if a deployment breaks**.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate

> *Staff infrastructure requirement.*

Test for it: A push to `dev` branch triggers `deploy-dev.yml` and updates the dev Firebase project. A push to `main` triggers `deploy-prod.yml` which (temporarily) also updates the dev Firebase project.

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

No schema impact. Purely GitHub Actions configuration.

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

---

## 6. Implementation Phases

### Phase 1 — Update Workflow Triggers

- [ ] Modify `.github/workflows/deploy-dev.yml`:
  - Change `on: push: branches: [main]` to `branches: [dev]`
- [ ] Modify `.github/workflows/deploy-prod.yml`:
  - Add `on: push: branches: [main]` (replacing `workflow_dispatch` deployment confirmation logic).
  - Temporarily map the `projectId` to `nats-rack` (Dev environment).
  - Temporarily map the secrets block in `deploy-prod.yml` to use `DEV_FIREBASE_*` instead of `PROD_FIREBASE_*`.

### Phase 2 — Documentation & Next Steps

- [ ] Add a prominent comment block in `deploy-prod.yml` documenting how to revert to Production secrets and project ID when ready for actual production deployment.
- [ ] Log decision in `DECISIONS.md`.
- [ ] (Optional) Add an epic task in `EPICS.md` for this infrastructure task.

---

## 7. Definition of Done

- [ ] `deploy-dev.yml` properly targets `dev` branch.
- [ ] `deploy-prod.yml` properly targets `main` branch but writes to the `nats-rack` project with dev secrets.
- [ ] Documentation for future Prod switchover is embedded in the yaml file.
- [ ] `docs/DECISIONS.md` updated.
- [ ] PR opened with description generated from `TICKET_CLOSE.md` Phase 4.

---

*The Pawn Shop · docs/projects/E24_CI_CD_Pipeline.md · v1.0*
