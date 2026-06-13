# E124 — Site Analytics: GA4 Activation & Enhanced Event Tracking
**Status:** ✅ CLOSED — 2026-06-13
**Priority:** HIGH
**Effort:** Medium — 13 source files modified, 3 docs created
**Cycle:** 33

---

## Problem

Firebase Analytics is integrated in code but **completely inactive in all environments**.
`VITE_FIREBASE_MEASUREMENT_ID` is missing from `.env.example`, `CODESPACES_SECRETS`,
and `.env.local`. Every `Analytics.*` call silently no-ops. UTM params are captured
into `sessionStorage` but never forwarded to any analytics event.

Additionally, the existing event surface is incomplete:
- No homepage (`/`) `pageView` tracking
- No search tracking
- No wishlist/save events
- No UTM passthrough to conversion events
- No user properties set (staff vs customer, preferred view)
- No ecommerce-style funnel events (browse → select → enquire → convert)

Without analytics, there is no data to validate persona assumptions, measure
campaign ROI, or understand what drives pawn enquiry conversion.

## Personas Served

See `docs/PERSONAS.md` for full profiles. Primary: Jordan, Sandra, Dale.
Secondary: Kevin, Makoonsii (compliance), Marcus, Staff.

## Files Expected to Change

Pending strategy approval. See plan file.

## Docs to Update

- `docs/EPICS.md` — E124 entry
- `docs/ACTIVE_CYCLE.md` — cycle tracking
- `docs/decisions/0041-*.md` — analytics strategy decision
- `.env.example` — add `VITE_FIREBASE_MEASUREMENT_ID`
- `src/lib/analytics.ts` — extended event catalog
- `src/lib/utm.ts` — UTM passthrough to events

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` (tsc -b + vite build) | ✅ PASS — zero errors |
| `npm run lint` | ✅ PASS — zero errors, zero warnings |
| `npm run test` | ✅ PASS — 29/29 |
| `npx tsc -b` in `/functions` | ✅ PASS — zero errors |
| PII audit | ✅ PASS — no uid/email/name in any event |
| Marie Discretion Test | ✅ PASS — `view: 'cannabis'` internal only |
| Firestore schema sync | ✅ PASS — no Firestore changes |

---

*The Pawn Shop · docs/projects/E124_SITE_ANALYTICS.md · 2026-06-13*
