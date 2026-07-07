# Decision 0044 — E127 Brother POS Inventory Embed: Strategy A (Direct Script Widget)

**Date:** 2026-06-23
**Epic:** E127 · Brother POS Inventory Embed
**Cycle:** 33
**Status:** Implemented & Closed

---

## Context

The Pawn Page previously drove its public inventory display entirely from Firestore (`items/{viewTag:'pawn', status:'active'}`). Staff manage live liquidation and fireworks stock in Brother POS (`thepawnshop.brotherpos.ca`). The goal was to replace the Firestore-driven grid with the Brother POS embed so customers see the authoritative live POS inventory.

Three strategies were evaluated:

- **A:** Direct Script Widget Embed — inject Brother POS `embed.js` via `useEffect`; zero Firestore dependency
- **B:** Feature-Flagged Hybrid — Remote Config flag toggles between POS widget and existing Firestore inventory
- **C:** Webhook Sync + Native Render — extend `receivePosWebhook` CF (E42 stub) to sync POS events into Firestore; no frontend changes

---

## Decision

**Strategy A: Direct Script Widget Embed.**

---

## Rationale

1. **Police hold is inapplicable to these items.** The items served through Brother POS are liquidation and fireworks stock from wholesale channels — they carry no serial provenance trail and are not subject to the police hold workflow. The compliance concern that would have blocked Strategy A in a pawn context does not apply.

2. **POS is the authoritative source.** Liquidation and fireworks inventory is managed entirely in Brother POS. Mirroring data via webhooks (Strategy C) or maintaining a dual-system flag (Strategy B) adds sync complexity with no benefit when the POS system is the single source of truth.

3. **Minimum viable surface area.** The script injection pattern is standard for third-party embed widgets and requires changes to one file only. Strategy B adds a Remote Config flag and featureFlags interface change. Strategy C requires substantial CF development and external webhook configuration.

4. **No new dependencies.** The `useEffect` + `document.createElement('script')` pattern uses only React and native browser APIs. Zero npm packages added.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Strategy B (feature flag hybrid) | Dual-inventory complexity adds no value; both systems would show identical items (POS stock); Remote Config flag is unnecessary overhead for a clean cutover |
| Strategy C (webhook sync) | Appropriate for pawn items where our compliance tooling (policeHold, auditLogs, design tokens) must apply; inapplicable here because (a) items don't need policeHold, (b) the E42 CF stub requires Brother POS to share webhook payload schema and register the endpoint — external dependency with no timeline |

---

## Compliance Notes

- **policeHold:** Not required for liquidation/fireworks stock from wholesale channels. No audit log event needed for items never entering our pawn intake flow.
- **PII:** No customer data involved. Script renders a catalog widget, not a customer-data surface.
- **Age gate:** Pawn view has no age gate. Fireworks items appearing in this widget are not subject to the `/fireworks` age gate because they are displayed on `/pawn`.
- **Analytics:** GA4 `viewItemList` / `selectItem` events do not fire for items rendered inside the Brother POS widget. Brother POS's own analytics will track these. If GA4 coverage of POS items is required in the future, migrate to Strategy C.
- **CSP:** Firebase Hosting has no outbound CSP headers defined in `firebase.json`. The browser imposes no script-src restriction, so `thepawnshop.brotherpos.ca` loads without a headers change.

---

## Implementation Notes

- Script injected in `useEffect` with `[]` deps — fires once on mount, cleaned up on unmount.
- Guard: `document.getElementById(BROTHER_POS_SCRIPT_ID)` prevents double-injection on React Strict Mode double-mount.
- `data-mode="menu"` attribute passed via `script.dataset.mode` (camelCase maps to kebab-case attribute per HTMLElement spec).
- Mount div `id="brotherpos-shop"` is the target the embed script should discover and render into.
- **embed.js is HTTP 404 as of 2026-06-23.** The embed feature must be activated by Brother POS support before the widget renders. The code is production-ready; the `<div id="brotherpos-shop">` will be an empty placeholder until activation.

---

## Pre-Existing Architecture Preserved

Page-level non-inventory features retained on PawnPage:
- `<PawnHero />` — brand above-fold
- `<RecentlySoldStrip />` — Dale persona trust signal (Firestore-sourced)
- `<ActivityFeed />` — Sandra persona privacy-safe feed (Firestore-sourced)
- `<CampaignBanner />` — promotion scheduler
- `<ArticleSection>` — E19 Akwesasne narrative
- `<YearsInBusinessBadge />` — Makoonsii/Dale trust signal

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/PawnPage.tsx` | Removed: `useItemSearch`, `MasonryGrid`, `LayoutToggle`, `LuxuryProductCard`, `ItemQuickView`, `ClickCollectModal`, `SaveSearchButton`, search bar, staff picks, featured items, all inventory state/handlers. Added: `useEffect` script injection, `<div id="brotherpos-shop">` mount point. |

---

*The Pawn Shop · docs/decisions/0044-e127-brother-pos-script-embed.md · 2026-06-23*
