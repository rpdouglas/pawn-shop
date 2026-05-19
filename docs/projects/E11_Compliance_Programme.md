# Project E11: Compliance Programme

**Status:** Done — 2026-05-19
**Epic:** E11 — Compliance Programme
**Phase:** Phase 4 — Conversion & Admin Intelligence
**Primary Persona:** Marie — The Wellness Seeker
**Secondary Personas:** Tanya (fireworks age gate), Makoonsii (accessibility audit)
**AI Involvement:** Claude (dev)

**Objective:** Verify that all age gate audit logging writes correctly to `auditLogs`, implement PIPEDA consent capture for new user accounts, add legal disclosures to cannabis and fireworks age gate modals, complete the cannabis anonymous enquiry flow (WhatsApp deep link), document the Identity Platform MFA server-side enforcement path, and close all remaining EPICS.md verification tasks.

---

## 1. User Story

> As **Marie**, I want to use the cannabis wellness view knowing that my privacy is protected by a compliant, verifiable system — including a full-screen age gate enforced at the router, a privacy policy I can read, and an enquiry option that does not require me to create a persistent account.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate — Marie

Quoted from `docs/PERSONAS.md §3`:

> *"19+ age gate is full-screen acknowledgment, session-scoped only, enforced at router level. Not bypassable by direct URL navigation."*

> *"Every age gate pass/fail is written to `auditLogs`. No exceptions."*

> *"Anonymous enquiry via WhatsApp deep link must be available before account creation is required."*

Test — Age gate routing: Navigate directly to `/cannabis` without a prior session → full-screen gate appears and the protected page does not render until the gate is passed.

Test — Audit log: Pass the gate → `auditLogs` entry with `eventType: 'age_gate_pass'` visible in Firestore emulator. Decline the gate → `eventType: 'age_gate_fail'` written.

Test — Anonymous enquiry: Load a cannabis item detail page without signing in → WhatsApp deep link is visible and tappable.

Test — Legal disclosure: Age gate modal for `/cannabis` includes visible legal disclosure text before the user can click through.

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px) — including consent checkbox, age gate CTA, WhatsApp enquiry button
- [ ] All copy uses plain language — no jargon, no retail buzzwords in legal disclosures
- [ ] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [ ] Privacy policy and Terms of Use are reachable within 2 taps from any age gate modal

### Marie Discretion Test (primary — run for all CRM and cannabis features)

- [ ] All CRM comms use "The Pawn Shop Update" — no category disclosure
- [ ] No "cannabis," "weed," "wellness," or category words in any notification, SMS, or email subject
- [ ] WhatsApp enquiry link copy does not include the cannabis category name

---

## 3. Compliance Gate

- [x] **Age gate required?** — Yes. Cannabis 19+, fireworks 18+. Both enforced at router level via existing `AgeGate` component (E05). E11 task: verify the `logAgeGate` Cloud Function writes correct `auditLogs` entries under emulator conditions.
  - Route: `/cannabis` (19+), `/fireworks` (18+)
  - Enforcement: existing `AgeGate` component on protected routes in `main.tsx`

- [x] **`auditLogs` events required?**
  - `age_gate_pass` — existing event type; E11 verifies it writes correctly
  - `age_gate_fail` — existing event type; E11 verifies it writes correctly
  - No new event types required for E11

- [x] **PII exclusion** — PIPEDA consent fields (`consentAcceptedAt`, `consentVersion`) written to `users/{uid}` only. No names, emails, phone numbers, or IP addresses in `auditLogs.details` for any E11 event.

- [x] **`policeHold` respected** — E11 introduces no inventory queries. Not applicable.

- [x] **`aiDescription` draft-only** — E11 introduces no AI description paths. Not applicable.

- [x] **AI API security** — No Gemini runtime calls in this epic. Not applicable.

- [x] **CASL compliance** — E11 introduces no new alert or notification sends. Existing `alertOptIn` flag is unchanged. Consent captured here is for PIPEDA data collection acknowledgment, distinct from CASL marketing opt-in.

- [x] **Scarcity integrity** — No urgency mechanics introduced.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: users/{uid}
Fields read:  mfaEnrolled, alertOptIn, role
Fields written: consentAcceptedAt (NEW), consentVersion (NEW)

Collection: auditLogs/{id}
Fields used: eventType, uid, targetId, details, createdAt
Event types: age_gate_pass, age_gate_fail — EXISTING, verification only
```

### New Fields Required

Update `docs/firestore-schema.md` and log in `docs/DECISIONS.md` before any implementation begins.

```
NEW FIELDS:
- users/{uid} / consentAcceptedAt — timestamp | null
  PIPEDA: when the user accepted the privacy policy. Set on account creation
  (new users) or on first post-E11 authenticated session (existing users).
  Staff accounts: must not be null before staff access is granted.

- users/{uid} / consentVersion — string | null
  Version slug of the accepted policy (e.g. "2026-05-01"). Allows detecting
  users who require re-consent if the policy changes materially in the future.
```

### Store Contact Number for WhatsApp Enquiry

`config/shopInfo.phoneNumber` (E.164 format) — decision logged in `DECISIONS.md` (2026-05-18). Schema updated. Follows the same admin-only write / public read pattern as `foundedYear`.

### TypeScript Interfaces

```typescript
// src/lib/types.ts: User interface
// Extend with: consentAcceptedAt: Timestamp | null, consentVersion: string | null
```

### Security Rules Required

No changes to existing Firestore rules are anticipated:
- `users/{uid}` write is already scoped to the authenticated user and staff claims — consent fields are written by the user's own auth-gated flow, covered by the existing user write rule.
- `auditLogs` writes go through Cloud Functions via Admin SDK — no rule change needed.
- If `config/shopInfo.phoneNumber` is added: the existing `shopInfo` public read rule already covers it.

---

## 5. AI Involvement Detail

### Claude (development):

- Applicable prompt files: `PLANNING.md`, `TESTING.md`, `TICKET_CLOSE.md`
- Guardrails:
  - All legal disclosure copy (privacy policy, terms of use) must be reviewed by legal counsel before publication. Claude may scaffold placeholder structure only. Any placeholder legal text must be marked `[LEGAL REVIEW REQUIRED]` in the PR.
  - No Kanien'kéha generated under any circumstances.
  - `consentAcceptedAt` / `consentVersion` writes must go through the user's authenticated session — never anonymously.

---

## 6. Implementation Phases

### Phase 0 — Pre-flight Verification (no new code)

Verify existing E05/E09 compliance work before writing anything new:

- [ ] Confirm `logAgeGate` Cloud Function is exported in `functions/src/index.ts`
- [ ] In Firebase emulator: trigger `/cannabis` age gate → confirm `age_gate_pass` entry appears in `auditLogs`
- [ ] In Firebase emulator: decline `/fireworks` age gate → confirm `age_gate_fail` entry appears in `auditLogs`
- [ ] Confirm `/accessibility` page renders at its route — tick EPICS.md task if live
- [ ] Confirm `purgeExpiredData` schedule is documented in `DECISIONS.md` (E09 entry exists: 2026-05-18) — tick EPICS.md task

### Phase 1 — Schema & Decisions

- [ ] Add `consentAcceptedAt` and `consentVersion` to `users/{uid}` in `docs/firestore-schema.md`
- [ ] `config/shopInfo.phoneNumber` already added to schema (E11 pre-planning) — log remaining consent field decisions in `docs/DECISIONS.md`

### Phase 2 — PIPEDA Consent Management

- [ ] Privacy policy static page at `/privacy` — accessible from footer, sign-up form, and age gate modals — [LEGAL REVIEW REQUIRED before content goes live]
- [ ] Consent checkbox on account creation (sign-up): "I have read and agree to the [Privacy Policy](/privacy)" — required field, blocks account creation if unchecked
- [ ] On account creation success: write `consentAcceptedAt: serverTimestamp()` and `consentVersion: '2026-05-01'` to `users/{uid}` (user's own auth-gated write)
- [ ] Existing users without `consentAcceptedAt`: soft consent prompt on next authenticated session — non-blocking banner in `GlobalHeader`, links to `/privacy`, writes consent fields on acknowledgment

### Phase 3 — Legal Disclosures on Age Gate Modals

- [ ] Add legal disclosure sub-text to cannabis `AgeGate` instance: "By entering, you confirm you are 19 or older and agree to our [Terms of Use](/terms) and [Privacy Policy](/privacy)." — [LEGAL REVIEW REQUIRED]
- [ ] Add equivalent to fireworks `AgeGate` instance (18+) — [LEGAL REVIEW REQUIRED]
- [ ] Terms of Use static page at `/terms` — [LEGAL REVIEW REQUIRED before content goes live]
- [ ] Add `/privacy` and `/terms` routes to `main.tsx` — accessible without auth

### Phase 4 — Cannabis Anonymous Enquiry

- [ ] WhatsApp deep link CTA on cannabis item detail pages — visible without sign-in
- [ ] Link format: `https://wa.me/[storePhone]?text=Hi%2C+I%27m+enquiring+about%3A+[item.title]` — item title URL-encoded, store phone sourced from config (not hardcoded)
- [ ] CTA copy uses brand voice — no cannabis category words in the link text or surrounding copy
- [ ] No `auditLogs` entry written for WhatsApp enquiry: contact is phone-initiated and external to Firestore; logging it would require storing PII
- [ ] WhatsApp CTA visible on cannabis item cards / detail pages only — not on pawn or fireworks

### Phase 5 — MFA Identity Platform Enforcement

This is primarily a process and documentation task:

- [ ] Log in `DECISIONS.md`: Identity Platform upgrade is a pre-prod compliance gate. Staff accounts must not be created in production until the upgrade is confirmed and `sign_in_second_factor` enforcement is active server-side.
- [ ] Add MFA claim check to any callable Cloud Function that accepts `admin` or `manager` claims: verify `request.auth.token.firebase.sign_in_second_factor` is present before proceeding. Return `unauthenticated` if not set.
- [ ] Document the upgrade steps in `DECISIONS.md` for the operator to follow in the Firebase console before prod deploy.

### Phase 6 — Accessibility Spot-Check

- [ ] NVDA (Windows) spot-check: `/pawn`, `/cannabis`, `/fireworks` homepages — age gate modal fully navigable by keyboard and screen reader
- [ ] VoiceOver (iOS) spot-check: same routes — age gate modal, consent banner, WhatsApp enquiry link all have correct ARIA labels
- [ ] Any failures: fix before E11 closes
- [ ] Any deferred items: add to Deferred table in `ACTIVE_CYCLE.md`
- [ ] Tick EPICS.md task on completion

### Phase 7 — Legal Counsel Scheduling

- [ ] Schedule jurisdiction legal review (cannabis retail + fireworks regulation, PIPEDA compliance) — log scheduled date in `ACTIVE_CYCLE.md` under Open Decisions Needed
- [ ] Scheduling (not completion) is the gate — E11 may close with review scheduled but not yet received

---

## 7. Definition of Done

A feature is done when all of these are true:

- [ ] All persona acceptance criteria passed (Marie gate, Makoonsii Trust Test, Marie Discretion Test)
- [ ] Compliance gate verified (age gate audit log entries confirmed, PII exclusion confirmed)
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] EPICS.md tasks ticked:
  - [ ] Age gate audit log entries confirmed working for all gate events
  - [ ] `purgeExpiredData` schedule documented in `DECISIONS.md`
  - [ ] Jurisdiction legal review scheduled
  - [ ] NVDA + VoiceOver spot-check on all three storefronts
  - [ ] `/accessibility` page confirmed live
- [ ] `docs/firestore-schema.md` updated with `consentAcceptedAt` and `consentVersion` (`config/shopInfo.phoneNumber` already added in pre-planning)
- [ ] `docs/DECISIONS.md` updated with all E11 implementation decisions
- [ ] All legal copy marked `[LEGAL REVIEW REQUIRED]` where counsel has not yet reviewed
- [ ] PR description generated via `docs/prompts/TICKET_CLOSE.md`

---

*The Pawn Shop · docs/projects/E11_Compliance_Programme.md · v1.0*
