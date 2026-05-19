# Implementation Plan — E15 · CRM & Retention

**Status:** Draft
**Epic:** E15 — CRM & Retention
**Primary Persona:** Kevin (VIP/Reseller), Marcus (Lifestyle/Cross-view)
**Secondary Personas:** Marie (Discretion), Dale (Follow-up), Makoonsii (Trust)

---

## Phase 1 — Persona & Compliance Gate

### 1.1 Persona Identification

- **Primary:** Kevin. His VIP/Reseller tier is the core retention engine. Marcus is served by `crossViewFlag` tracking for lifestyle journeys.
- **Secondary:** Marie (protected by Discretion Test), Dale (served by deal follow-ups), Makoonsii (served by warm, community-centric copy).

**Persona Tests:**
- **Makoonsii Trust Test:** All follow-up copy must be warm, direct, and plain language.
- **Marie Discretion Test:** Automated follow-ups MUST use generic "The Pawn Shop Update" language. No category disclosure.
- **Marcus Photography Test:** History views must use standard dark luxury item thumbnails.
- **Kevin Speed Test:** 48h staff reminders must be punctual.

### 1.2 Compliance Gate

- **Age gate required?** NO.
- **`auditLogs` events:** `vip_status_change`, `reseller_tier_change`, `crm_followup_sent`.
- **PII exclusion:** Confirmed. No names/emails in `auditLogs.details`.
- **`policeHold` respected:** Staff-facing history views will flag police-held items.
- **CASL compliance:** All automated customer follow-ups will verify `alertOptIn: true`.

---

## Phase 2 — Schema Audit

**Collections impacted:**
- `users/{uid}` — fields: `purchaseHistory`, `inquiryHistory`, `lifetimeValue`, `segments`, `vipFlag`, `resellerTier`, `alertOptIn`, `crossViewFlag`
- `auditLogs/{id}` — fields: `eventType`, `uid`, `targetId`, `details`, `createdAt`
- `pawnRequests/{id}` — fields: `status`, `createdAt`, `uid`
- `reservations/{id}` — fields: `status`, `createdAt`, `uid`

**New fields required:** NONE. All fields are pre-defined in `docs/firestore-schema.md`.

---

## Phase 3 — Three-Strategy Proposal

## Strategy A — Minimal History & List

**Summary:** Basic history tracking in existing CFs and a staff-only list view.

**Architecture:**
- Logic lives in `completeReservation` and `submitPawnRequest` CFs (appends to arrays).
- `/admin/crm` is a simple searchable table of users.
- No new Cloud Functions for follow-ups.
- Security rules: Allow staff read on all `users/{uid}`.

**Persona Lens:**
- Kevin gets his history tracked, but no tier recognition.
- Dale/Makoonsii get no automated follow-ups.

**Compliance:**
- Satisfies PII and Discretion tests (minimal outbound comms).

**Trade-offs:**
- Gained: Speed of implementation.
- Sacrificed: The "Retention" part of the epic.

**Estimated scope:** Small — 1 admin page, 2 CF modifications.

---

## Strategy B — Integrated Tiers & Reminders (Recommended)

**Summary:** Automated history tracking, manual tier management, and scheduled follow-ups.

**Architecture:**
- CF Modifications: `completeReservation` (purchaseHistory + lifetimeValue), `submitPawnRequest` (inquiryHistory).
- New Callables: `assignVipStatus`, `updateResellerTier` (admin/manager only).
- New Scheduled CFs: `crmDailyReminders` (Staff 48h / Customer 72h).
- UI: `/admin/crm` list + `/admin/crm/{uid}` detail with tier controls.

**Persona Lens:**
- Kevin: Recognised via VIP/Reseller tiers.
- Marcus: Tracked via `crossViewFlag` for future journeys.
- Marie: Discretion-safe generic follow-ups.

**Compliance:**
- Audit logs for all tier changes. CASL checks for all customer reminders.

**Trade-offs:**
- Gained: Full E15 scope coverage.
- Sacrificed: None.

**Estimated scope:** Medium — 2 admin pages, 4 CFs, 2 CF modifications.

---

## Strategy C — Engagement Engine

**Summary:** Strategy B + persistent engagement scores and automated segmentation.

**Architecture:**
- Same as B, plus:
- Engagement score computed and stored on `users/{uid}` via scheduled job.
- Automated segment assignment (e.g., "high-value-picker") based on history patterns.

**Persona Lens:**
- Kevin/Marcus: More granular recognition.

**Compliance:**
- More complex PII/Data logic to manage.

**Trade-offs:**
- Gained: Proactive segmentation for marketing.
- Sacrificed: Significant additional complexity and cost.

**Estimated scope:** Large — 3 admin pages, 6 CFs.

### Recommendation
**Strategy B** is recommended. It delivers the hard requirements of E15 (VIP tiers, history, follow-ups) while maintaining simplicity and strictly adhering to the Marie Discretion Test and CASL compliance without the overhead of Strategy C's scoring engine.

---

## Phase 4 — Anti-Regression Protocol

1. **Hardcoded Hex:** All CRM components will use `.view-pawn` tokens.
2. **Field Invention:** None. All fields verified.
3. **AI Keys:** No AI in this epic.
4. **Scarcity:** N/A.
5. **PII Logs:** Confirmed. `details` maps will use `requestId`, `userId`, `tier` only.
6. **Age Gate:** N/A.
7. **Motion:** No animations planned beyond standard transitions.
8. **Typography:** Standard tokens only.
9. **Brand Voice:** Follow-up copy will be warm and direct (Makoonsii-friendly).

---

## Phase 5 — Output & Storage

I have drafted the implementation plan and saved it to `docs/plans/E15_CRM_Retention_PLAN.md`.

**Proposed Strategies:**
- **Strategy A:** Basic history tracking and a staff list view without automated reminders.
- **Strategy B:** History tracking, tier management, and scheduled staff/customer reminders. (Recommended)
- **Strategy C:** Adds persistent engagement scoring and automated segmentation logic.

Please review the markdown file and reply with your approved strategy.
