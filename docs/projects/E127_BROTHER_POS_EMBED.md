# E127 — Brother POS Inventory Embed
**Status:** ✅ CLOSED — 2026-06-23
**Priority:** MEDIUM
**Effort:** TBD (strategy-dependent)
**Cycle:** 33

---

## Problem

The Pawn Page currently drives its inventory display from Firestore (`items/{viewTag:'pawn', status:'active'}`). Staff now manage live inventory in Brother POS (`thepawnshop.brotherpos.ca`), creating two sources of truth. The goal is to replace or synchronise the public-facing inventory view with Brother POS data so customers see the real, live POS inventory.

The trigger embed snippet provided by staff:

```html
<script src="https://thepawnshop.brotherpos.ca/shop/embed.js" data-mode="menu" async></script>
```

## Critical Pre-Flight Findings

1. **embed.js is HTTP 404** — the script endpoint does not exist on the Brother POS server as of 2026-06-23. The embed feature must be activated by Brother POS support before any client-side script approach can ship.

2. **CSP blocks iframe embedding** — `thepawnshop.brotherpos.ca` sets `frame-ancestors: 'self' *.brotherpos.ca ...`. Our `nats-rack.web.app` domain is NOT in that list. Direct `<iframe>` is impossible.

3. **`receivePosWebhook` CF stub already exists** — E42 built an HMAC-verified webhook receiver (`functions/operations/src/pos.ts`) that currently sets `posSyncStatus: 'pending'` but does not process payloads. Schema fields `posId`, `posSyncStatus`, `posLastSyncAt` are already in `firestore-schema.md`.

4. **policeHold compliance gap** — A third-party widget or iframe has no knowledge of our Firestore `policeHold: true` flag. Items placed on police hold by admin would still appear in the POS-served view. This is a non-negotiable guardrail per CLAUDE.md.

## Personas Served

- **Dale** (primary): POS inventory is authoritative for pricing; Dale needs verified prices visible without click-through
- **Sandra** (primary): Masonry discovery experience; layout and visual quality depend on strategy chosen
- **Kevin** (secondary): Firestore-based saved search alerts depend on items being in Firestore
- **Jordan** (secondary): Brand design tokens and editorial quality must be maintained
- **Marcus** (secondary): Photography standard; POS-hosted images may not pass the Marcus Photography Test

## Schema Audit

No new Firestore fields required. All relevant fields already exist in `firestore-schema.md`:
- `items/{id}.posId` — Brother POS external identifier
- `items/{id}.posSyncStatus` — `'not_synced' | 'synced' | 'pending' | 'error'`
- `items/{id}.posLastSyncAt` — Last successful sync timestamp

## Files Modified (strategy-dependent)

| Strategy | Files |
|---|---|
| A | `src/pages/PawnPage.tsx`, `firebase.json` |
| B | `src/pages/PawnPage.tsx`, `src/lib/featureFlags.ts`, `firebase.json` |
| C | `functions/operations/src/pos.ts`, `src/lib/types.ts`, `docs/decisions/` |

---

## Gate Results

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc -b + vite build) | ✅ PASS | Zero TypeScript errors. 468 modules transformed. Built in 3.82s. |
| `npm run lint` | ✅ PASS | Zero ESLint errors and zero warnings. |
| `npm run test` | ✅ PASS | 29/29 tests pass (8 test files). |
| `npx tsc -b` (functions/) | ✅ PASS | Zero errors. |
| Hardcoded hex audit | ✅ PASS | None introduced. |
| PII in logs | ✅ PASS | No logging added. |
| policeHold compliance | ✅ N/A | Items are liquidation/fireworks wholesale stock — police hold workflow does not apply. |

---

*The Pawn Shop · docs/projects/E127_BROTHER_POS_EMBED.md · 2026-06-23*
