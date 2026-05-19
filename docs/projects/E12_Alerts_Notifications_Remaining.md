# Project E12-R: Alerts & Notifications — Remaining

**Status:** Done — 2026-05-19
**Epic:** E12 — Alerts & Notifications
**Phase:** Phase 5 — Retention & Post-Sale
**Primary Persona:** Tanya (seasonal SMS + pickup reminders) / Marie (discretion gate on digest)
**Secondary Personas:** Jordan, Marcus (weekly digest recipients); Kevin (CASL gate must not break existing alerts)
**AI Involvement:** Neither

**Objective:** Deliver the two remaining E12 tasks — (1) seasonal campaign reminder SMS and 24-hour pre-pickup reminder SMS for fireworks customers, and (2) a weekly digest email per view sent to CASL-opted-in users with a generic, category-neutral subject line — closing E12 entirely.

---

## 1. User Stories

> As **Tanya**, I want to receive an SMS reminder before major seasonal events (Canada Day, Victoria Day) so that I can confirm my fireworks order is in place before stock runs out.

> As **Tanya**, I want to receive a reminder SMS the day before my confirmed pickup window so that I arrive at the right time and don't miss my slot.

> As **Jordan / Marcus**, I want a weekly curated email from The Pawn Shop so that I stay engaged with new arrivals and editorial content without having to check the site daily.

> As **Marie**, I want any email I receive from The Pawn Shop to use neutral language in the subject line so that my wellness purchases are never disclosed to anyone who might see my inbox.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate — Tanya

> *"Tanya's purchase is only complete when she has received an SMS confirmation with a specific pickup window. Anything less is an incomplete transaction."*
> *"All CRM comms use generic 'The Pawn Shop Update' language. No 'fireworks' disclosure in SMS preview or subject line."*

- [ ] Seasonal reminder SMS is dispatched when a fireworks campaign activates and `reminderSentAt` is null on that campaign document
- [ ] Pickup reminder SMS is dispatched within the scheduled window for confirmed reservations and preorders with a pickup window starting within 24 hours
- [ ] SMS body references the specific pickup window (e.g., "Your pickup is tomorrow, June 30 at 2:00–4:00 PM") — not a generic "we'll be in touch"
- [ ] SMS body contains no category-specific words ("fireworks", "pyrotechnics", "sparklers")
- [ ] CASL `alertOptIn: true` verified on `users/{uid}` before every send

### Makoonsii Trust Test (always run)

- [ ] No Kanien'kéha in any SMS or email template
- [ ] SMS and email copy uses plain language — warm, direct, no retail buzzwords
- [ ] Feature is fully back-end scheduled; no new UI friction for customers

### Marie Discretion Test (mandatory — CRM/notification feature)

- [ ] Weekly digest subject line is **exactly** "The Pawn Shop Update" — no view, category, or product words
- [ ] SMS preview text (first ~30 chars of body) contains no cannabis, fireworks, or category identifiers
- [ ] Email preheader does not disclose view or product category
- [ ] CASL `alertOptIn: true` checked before every send (SMS and email)

### Kevin Speed Test (run — notification flow)

- [ ] CASL check is a guard on the existing `onItemPublished` alert path — this project must not modify or slow that function
- [ ] No change to 60-second SLA for inventory alerts

---

## 3. Compliance Gate

- [ ] **Age gate required?** No — these are post-opt-in communications to users who have already passed the age gate. No new gate logic needed.
- [ ] **`auditLogs` events required?**
  - `seasonal_reminder_sent` — details: `{ campaignId, viewTag, recipientCount }` — no PII
  - `pickup_reminder_sent` — details: `{ reservationId | preorderId, viewTag }` — no PII
  - `weekly_digest_sent` — details: `{ viewTag, recipientCount }` — no PII
- [ ] **PII exclusion** — No names, emails, phone numbers enter `auditLogs.details`. Recipient phone numbers are read from `users/{uid}.phoneNumber` and `reservations/{id}.customerPhone` at send time only; they are never logged.
- [ ] **`policeHold` respected** — Weekly digest queries items where `status == 'active' && policeHold != true`
- [ ] **`aiDescription` draft-only** — Not applicable (digest shows `description`, never `aiDescription`)
- [ ] **AI API security** — Not applicable (no AI calls in this feature)
- [ ] **CASL compliance** — `users/{uid}.alertOptIn == true` checked before every SMS and email send
- [ ] **Scarcity integrity** — Digest must not apply or display `rare-find` or `limited-edition` unless those tags are present on the item document (staff-set — no algorithmic application)

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: campaigns/{id}
Fields read:  active, viewTag, title, startDate, endDate, reminderSentAt
Fields written: reminderSentAt (set by sendSeasonalReminders CF on dispatch)

Collection: reservations/{id}
Fields read:  status, pickupWindow, customerPhone, viewTag, pickupReminderSentAt, smsDeliveredAt
Fields written: pickupReminderSentAt (set by sendPickupReminders CF on dispatch)

Collection: preorders/{id}
Fields read:  status, pickupWindow, customerPhone, viewTag, pickupReminderSentAt, smsDeliveredAt
Fields written: pickupReminderSentAt (set by sendPickupReminders CF on dispatch)

Collection: users/{uid}
Fields read:  alertOptIn, alertMethod, phoneNumber, email, displayName
Fields written: NONE

Collection: items/{id}
Fields read:  status, title, viewTag, policeHold, description, condition, price, images (top 1), merchandisingTags
Fields written: NONE

Collection: auditLogs/{id}
Fields written: eventType, uid ('system'), targetId (optional), details, createdAt
Event types: seasonal_reminder_sent, pickup_reminder_sent, weekly_digest_sent
```

### New Fields Required

Schema already updated (2026-05-19):

```
campaigns/{id}.reminderSentAt       — timestamp | null — idempotency guard for seasonal batch
reservations/{id}.pickupReminderSentAt — timestamp | null — idempotency guard for 24h reminder
preorders/{id}.pickupReminderSentAt — timestamp | null — idempotency guard for 24h reminder
```

### TypeScript Interfaces

```typescript
// Existing — use as-is from src/lib/types.ts:
// Campaign, Reservation, Preorder, User, AuditLog, Item
```

### Security Rules Required

No new Firestore security rules are needed. All writes go through Cloud Functions using Admin SDK, which bypasses rules by design (established pattern in this codebase). The `campaigns` write rule already allows `isStaff()` — the CF adds `reminderSentAt` under Admin SDK so the client rule is irrelevant.

---

## 5. AI Involvement Detail

### Claude (development):
- Applies: `docs/prompts/PLANNING.md`, `docs/prompts/TESTING.md`, `docs/prompts/TICKET_CLOSE.md`
- Guardrails: SMS and email copy must be drafted by staff, not AI-generated. No `aiDescription` pipeline involved.

---

## 6. Implementation Phases

### Phase 1 — Schema & Security Rules

- [x] `docs/firestore-schema.md` updated — `reminderSentAt`, `pickupReminderSentAt` (×2), new `eventType` values
- [x] `docs/DECISIONS.md` updated — three schema decision entries
- [ ] No `firestore.rules` change required
- [ ] No `firestore.indexes.json` change required (queries use existing indexed fields: `active`, `viewTag`, `status`, `pickupReminderSentAt` is null-checked in CF logic, not a Firestore where clause)

### Phase 2 — Cloud Functions

**2a. `sendSeasonalReminders` — scheduled**
- Trigger: scheduled, every hour on the hour (matches `activateCampaigns` cadence)
- Logic:
  1. Query `campaigns` where `active == true && viewTag in ['fireworks', 'all'] && reminderSentAt == null`
  2. For each matching campaign: query `users` where `alertOptIn == true` and `phoneNumber` is set
  3. Dispatch SMS via `dispatchSms()` with "The Pawn Shop Update" body referencing the campaign title generically
  4. Set `campaigns/{id}.reminderSentAt = serverTimestamp()` atomically
  5. Write `auditLogs` entry: `seasonal_reminder_sent`, details `{ campaignId, viewTag, recipientCount }`
- Staff auth check: N/A (system-scheduled, no caller)
- Error handling: log per-user send failures; do not abort batch on individual failure

**2b. `sendPickupReminders` — scheduled**
- Trigger: scheduled, every hour on the hour
- Logic:
  1. Compute window: now + 20h → now + 28h (catches "tomorrow" pickups within an 8h buffer)
  2. Query `reservations` where `status == 'confirmed'` and `pickupReminderSentAt == null`
  3. Query `preorders` where `status in ['confirmed', 'ready']` and `pickupReminderSentAt == null`
  4. For each document: parse `pickupWindow` string, check if window start falls in the 20–28h range
  5. CASL check: look up `users/{uid}.alertOptIn`; use `customerPhone` from the reservation/preorder doc directly (E08 pattern)
  6. Dispatch SMS via `dispatchSms()` referencing the specific pickup window slot — no category words
  7. Set `pickupReminderSentAt = serverTimestamp()` on the document
  8. Write `auditLogs` entry: `pickup_reminder_sent`, details `{ reservationId | preorderId, viewTag }`
- Staff auth check: N/A (system-scheduled)
- Error handling: log failures per document; continue batch

**2c. `sendWeeklyDigest` — scheduled**
- Trigger: scheduled, every Monday at 09:00 (Cornwall Island local ≈ 14:00 UTC)
- Logic (run once per view: pawn, cannabis, fireworks):
  1. Query top 3 `items` by `trendingScore desc` where `status == 'active' && policeHold != true && viewTag == [view]`
  2. Query `users` where `alertOptIn == true` and `email` is set; filter by view affinity via `segments` or send all opted-in users the pawn digest by default (view-specific segments are a future CRM refinement — for MVP, send all-views digest to all opted-in users)
  3. Compose email via `dispatchEmail()` (new utility wrapping SendGrid)
     - Subject: `"The Pawn Shop Update"` — hard-coded, no view or category words ever
     - Preheader: `"This week's featured finds from Cornwall Island."`
     - Body: 3 item cards (title, condition, price in CAD formatted, one image URL), CTA "View in Shop"
  4. Write one `auditLogs` entry per view batch: `weekly_digest_sent`, details `{ viewTag, recipientCount }`
- Staff auth check: N/A (system-scheduled)
- Error handling: log per-user failures; continue batch; do not retry within same cycle

**2d. `dispatchEmail` utility — `functions/src/lib/email.ts`**
- Wraps SendGrid `@sendgrid/mail`
- Accepts: `to: string`, `subject: string`, `html: string`
- Reads `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` from env
- Returns `boolean` (sent / not sent), logs a warning if credentials are absent (mirrors `dispatchSms` pattern)

### Phase 3 — UI Components

No customer-facing UI components are required. These are fully server-side scheduled jobs.

Staff-facing consideration: The admin campaign edit UI (E14) should surface `reminderSentAt` as a read-only field so staff know whether the reminder batch has fired for a given campaign. This is a single line addition to the existing `CampaignAdminPage` — not a new component.

- [ ] `CampaignAdminPage.tsx` — add read-only `reminderSentAt` display ("Reminder sent: [date]" or "Not yet sent")
- [ ] ViewContext / `.view-*` class: not applicable (no customer-facing UI)
- [ ] CSS tokens only: not applicable

### Phase 4 — QA

Run `docs/prompts/TESTING.md` with:
- Tanya pickup reminder: confirm SMS body includes the exact pickup window string from `pickupWindow` field
- Tanya seasonal: confirm `reminderSentAt` is set after first run; confirm second CF invocation skips the campaign (idempotency)
- Marie Discretion: confirm subject line is exactly `"The Pawn Shop Update"` across all digest sends
- Kevin CASL: confirm no send fires when `alertOptIn != true`
- PII check: confirm `auditLogs.details` contains zero names, emails, or phone numbers

---

## 7. Definition of Done

- [ ] `sendSeasonalReminders` CF deployed and verified in emulator — fires on active campaigns, skips already-sent, writes `reminderSentAt`
- [ ] `sendPickupReminders` CF deployed — fires for reservations/preorders with pickup in 20–28h window, idempotent
- [ ] `sendWeeklyDigest` CF deployed — sends Monday digest, subject line exactly `"The Pawn Shop Update"`, CASL gate passes
- [ ] `dispatchEmail` utility in `functions/src/lib/email.ts` — mirrors `dispatchSms` pattern
- [ ] `CampaignAdminPage.tsx` shows read-only `reminderSentAt`
- [ ] Marie Discretion Test: passed — no category words in subject, body, or preheader
- [ ] CASL gate: confirmed — no send without `alertOptIn: true`
- [ ] `auditLogs` entries confirmed — zero PII in `details` map for all three event types
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — zero warnings
- [ ] `docs/EPICS.md` E12 tasks ticked — both remaining items
- [ ] `docs/ACTIVE_CYCLE.md` updated

---

*The Pawn Shop · docs/projects/E12_Alerts_Notifications_Remaining.md*
