# Project E15: CRM & Retention

**Status:** Done — 2026-05-19
**Epic:** E15 — CRM & Retention
**Phase:** Phase 5 — Retention & Post-Sale
**Primary Persona:** Kevin (VIP/Reseller), Marcus (Lifestyle/Cross-view)
**Secondary Personas:** Marie (Discretion), Dale (Bargain/Follow-up), Makoonsii (Trust/Follow-up)
**AI Involvement:** Claude (dev)

**Objective:** Deliver customer relationship management capabilities including `purchaseHistory` and `inquiryHistory` tracking on `users/{uid}`, VIP flags and reseller tiers (bronze/silver/gold), automated 48h/72h staff/customer follow-ups, and the `/admin/crm` profile view.

---

## 1. User Story

> As **Kevin**, I want the platform to recognize my high-frequency purchase behavior and grant me VIP/Reseller tier status so that I can access priority support and feel like a valued partner.

> As **staff**, I want an automated reminder when a pawn request has been pending for 48 hours so that I can follow up with Makoonsii or Dale and ensure we don't lose the deal.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate — Kevin (Reseller & Picker)

> *"VIP tier (`vipFlag`, `resellerTier`) is the retention mechanism built for Kevin. Engagement scoring surfaces candidates — staff confirms. Never auto-assigned."*

Test: Staff sets `vipFlag: true` and `resellerTier: 'gold'` on a user in the CRM dashboard. Verify the user's profile reflects these changes and can be used for priority logic in E12 (Alerts).

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px) — CRM dashboard is staff-only, but follow-up emails/SMS reach Makoonsii.
- [ ] All follow-up copy uses plain language — "Checking in on your item" instead of "Follow-up on Transaction ID #123".
- [ ] No Kanien'kéha without `indigenousLanguageReviewed: true`.
- [ ] Feature is navigable by a low-tech mobile user (if customer-facing profile is added).

### Marie Discretion Test (run for any CRM, notification, or cannabis/fireworks feature)

- [ ] All CRM comms use "The Pawn Shop Update" — no category disclosure.
- [ ] No cannabis/fireworks words in subject lines, SMS previews, or follow-up copy.
- [ ] Automated follow-up for cannabis/fireworks views must use generic language.

### Marcus Photography Test (run for any customer-facing item display)

- [ ] Item thumbnails in `purchaseHistory` or `inquiryHistory` use the same dark luxury standard images.

### Kevin Speed Test (run for any alert, notification, or new-listing flow)

- [ ] 48h staff reminder on pending pawn requests fires exactly 48h after `createdAt` if status is still `pending`.
- [ ] CASL `alertOptIn: true` verified before every automated customer follow-up.

---

## 3. Compliance Gate

- [ ] **Age gate required?** No — CRM is a background tracking and admin management feature.
- [ ] **`auditLogs` events required?** YES — `vip_status_change`, `reseller_tier_change`, `crm_followup_sent`.
- [ ] **PII exclusion** — Confirm no names, emails, or phone numbers enter `auditLogs.details`.
- [ ] **`policeHold` respected** — CRM history views must still respect the visual identity of police-held items (flagged for staff).
- [ ] **`aiDescription` draft-only** — Not applicable.
- [ ] **AI API security** — Not applicable (no Gemini runtime in E15).
- [ ] **CASL compliance** — Any automated customer follow-up (72h quoted item reminder) MUST check `alertOptIn: true`.
- [ ] **Scarcity integrity** — N/A.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

Collection: `users/{uid}`
Fields read: `role`, `purchaseHistory`, `inquiryHistory`, `vipFlag`, `resellerTier`, `alertOptIn`
Fields written: `purchaseHistory`, `inquiryHistory`, `lifetimeValue`, `segments`, `vipFlag`, `resellerTier`, `crossViewFlag`

Collection: `auditLogs/{id}`
Fields written: `eventType`, `uid`, `targetId`, `details`, `createdAt`
Event types: `vip_status_change`, `reseller_tier_change`, `crm_followup_sent`

Collection: `pawnRequests/{id}`
Fields read: `status`, `createdAt`, `uid`

Collection: `reservations/{id}`
Fields read: `status`, `createdAt`, `uid`

### New Fields Required

NEW FIELDS (update schema doc first):
- All fields currently in `docs/firestore-schema.md` under `users/{uid}` for E15 already exist.

### TypeScript Interfaces

List the interfaces from `src/lib/types.ts` this feature uses or extends:
- `User`
- `AuditLog`
- `PawnRequest`
- `Reservation`

### Security Rules Required

- `users/{uid}`: Allow staff to read CRM fields for any user.
- `users/{uid}`: Allow staff to update `vipFlag`, `resellerTier`, and `segments`.
- `users/{uid}`: Allow automated process (Cloud Functions) to update history and lifetime value.

---

## 5. AI Involvement Detail

### If Claude (development):
- `PLANNING.md`, `TESTING.md`, `TICKET_CLOSE.md` apply.

---

## 6. Implementation Phases

### Phase 1 — History Tracking (Automated)

- [ ] Update `completeReservation` CF to append `itemId` to `users/{uid}.purchaseHistory` and update `lifetimeValue`.
- [ ] Update `submitPawnRequest` CF to append `requestId` to `users/{uid}.inquiryHistory`.
- [ ] Update `ViewContext` or a new hook to detect cross-view browsing and set `crossViewFlag`.

### Phase 2 — VIP & Reseller Management

- [ ] `assignVipStatus` callable CF (admin/manager only).
- [ ] `updateResellerTier` callable CF (admin/manager only).
- [ ] Both CFs write to `auditLogs`.

### Phase 3 — CRM Dashboard UI

- [ ] `/admin/crm` - Customer list with engagement scores (derived from history lengths).
- [ ] `/admin/crm/{uid}` - Detail view showing full history, notes, and VIP/Reseller controls.

### Phase 4 — Automated Follow-ups

- [ ] `crmStaffReminders` scheduled CF (daily): Identifies pending pawn requests > 48h.
- [ ] `crmCustomerFollowups` scheduled CF (daily): Identifies quoted pawn requests > 72h.
- [ ] Dispatches notifications (Email/SMS) only if `alertOptIn: true`.

### Phase 5 — QA

- [ ] Marie Discretion Test on all follow-up copy.
- [ ] Kevin Speed Test on 48h reminders.
- [ ] PII Audit on all new `auditLogs` and CRM views.

---

## 7. Definition of Done

- [ ] Persona acceptance criteria: all items passed.
- [ ] Compliance gate: all items verified.
- [ ] `npm run build` — zero errors.
- [ ] `npm run lint` — zero warnings.
- [ ] E15 tasks in `docs/EPICS.md` ticked.
- [ ] `docs/DECISIONS.md` updated.
- [ ] PR opened.

---

*The Pawn Shop · docs/projects/E15_CRM_Retention.md · v1.0*
