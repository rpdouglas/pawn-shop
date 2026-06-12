---
id: "0037"
title: Client-side campaign activate/deactivate via isStaff() rule (no new CF)
date: 2026-06-12
epic: E120
status: accepted
---

## Context

The `campaigns/{id}` schema documents `active` as "Managed by Cloud Function" — the existing `activateCampaigns` and `deactivateCampaigns` scheduled CFs run every 5 minutes and auto-transition the flag based on `startDate`/`endDate`. Staff had no way to override this immediately from the admin UI; they had to either wait up to 5 minutes for the CF sweep or edit Firestore directly.

## Decision

Allow staff to toggle `active` directly from the client via `updateDoc(doc(db, 'campaigns', id), { active: !current, updatedAt: serverTimestamp() })`. The existing Firestore security rule `allow write: if isStaff()` already permits this write without a new Cloud Function or security rule change.

## Rationale

**Why not a new `activateCampaign` CF?** The CF path adds a round-trip (client → CF → Firestore) for an operation that Firestore rules already gate correctly. Creating a CF purely to proxy a permissioned Firestore write adds latency and deployment surface with no security benefit — the rule evaluation is equivalent.

**Audit gap accepted.** The scheduled CFs write `campaign_activated` / `campaign_deactivated` auditLog entries automatically. The manual client toggle does not. This is a minor gap: Firebase Auth records the staff UID at the rule evaluation level, and the `updatedAt` timestamp on the document records when the manual toggle happened. For a promotional control (not a financial or compliance-sensitive action), this is acceptable.

**"Managed by Cloud Function" annotation updated in intent.** The CFs remain the canonical auto-management path. Client-side writes are now an explicit supplement — a "go live now" override for staff who don't want to wait for the next CF sweep.

## Consequences

- Staff can activate a campaign immediately from `/admin/campaigns` — no Firestore console access required.
- The `activateCampaigns` and `deactivateCampaigns` CFs continue to run every 5 minutes and will correctly deactivate expired campaigns even if staff forget to click Deactivate.
- No new auditLog entry on manual toggle. Acceptable given the low compliance sensitivity of campaign activation.
- No new CF, no new Firestore rule, no schema change.

---

*The Pawn Shop · docs/decisions/0037-e120-campaign-activate-client-side.md · 2026-06-12*
