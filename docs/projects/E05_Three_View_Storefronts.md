# Project E05: Three-View Storefronts

**Status:** Complete — 2026-05-17
**Epic:** E05 — Three-View Storefronts
**Phase:** Phase 2 — Core Product
**Primary Personas:** Sandra (Pawn masonry discovery), Marie (Cannabis discretion + age gate), Tanya (Fireworks age gate + event focus)
**Secondary Personas:** Dale (search speed, price visibility), Makoonsii (touch targets, plain language), Marcus (image quality on customer-facing pages), Kevin (alerts fire on publish — upstream, confirmed E04)
**AI Involvement:** Claude (dev) | Gemini E18 (runtime — not in this epic)

**Objective:** Replace the three E02 component scaffolds with real, Firestore-backed storefronts — complete with age gates at the router level for cannabis (19+) and fireworks (18+), a masonry discovery grid on the Pawn homepage, prefix search, and an item detail view — all mobile-responsive.

---

## 1. User Story

> As a **customer browsing The Pawn Shop**, I want each of the three storefronts to show real inventory with the appropriate age gate, search, and item detail so that I can discover, evaluate, and enquire about items from any device.

---

## 2. Persona Acceptance Criteria

### Primary Persona Gate — Sandra (Pawn)

> *"Masonry grid. Quick-view < 200ms. Live activity: rate-limited, no PII."*

Test: Pawn homepage renders items in a non-uniform, variable-height CSS Columns masonry layout (not a uniform grid). Tapping a card opens a quick-view in < 200ms (measured in DevTools Performance tab). No names, UIDs, or emails appear in any activity strip.

### Primary Persona Gate — Marie (Cannabis)

> *"Absolute discretion. 19+ gate at router, session-scoped, logged."*

Test: Navigate directly to `/cannabis` in a fresh browser tab without any prior session. The 19+ modal is the first thing rendered — no product content visible behind it, no scroll-past possible. Confirm/deny logs `age_gate_pass` or `age_gate_fail` to `auditLogs` before the user sees any product. Gate is session-scoped (passes the current tab session, re-prompts on new tab).

### Primary Persona Gate — Tanya (Fireworks)

> *"Confirmed pickup window. SMS within 60s of reservation."*

Test (age gate portion): Navigate directly to `/fireworks` without prior session acknowledgment. 18+ gate renders before any fireworks content. Every pass/fail logged. (SMS/pickup confirmation is E08.)

### Makoonsii Trust Test (always run)

- [ ] All touch targets ≥48px on mobile viewport (375px)
- [ ] All copy uses plain language — no jargon, no retail buzzwords
- [ ] No Kanien'kéha without `indigenousLanguageReviewed: true`
- [ ] Feature navigable by a low-tech mobile user in under 3 taps

### Marie Discretion Test

- [ ] Age gate modal copy uses no cannabis-specific language in its confirmation or denial messaging
- [ ] No cannabis words in any CRM, SMS, or notification triggered by this epic (none triggered — N/A)

### Marcus Photography Test

- [ ] Customer-facing item cards display real Firebase Storage images, not placeholders
- [ ] Item detail view shows full image gallery with correct alt text
- [ ] No flat white or supplier-style images surfaced (enforced by intake form from E04)

---

## 3. Compliance Gate

- [x] **Age gate required?** Yes — cannabis `/cannabis` (19+) and fireworks `/fireworks` (18+). Enforced via a route-level wrapper component (`AgeGate`) placed in the router config, not inside the page component. Full-screen modal, no bypass path, tab session-scoped via `sessionStorage`.
- [x] **`auditLogs` events required?** Yes:
  - `age_gate_pass` — fires on user confirming age, before any product renders
  - `age_gate_fail` — fires on user denying age or closing gate
  - Both written via `logAgeGate` Cloud Function (callable with `invoker: 'public'` — anonymous users must be able to log without being signed in)
- [x] **PII exclusion** — `auditLogs.details` contains only `{ viewTag, policyVersion }`. `uid` field is authenticated UID or `'anonymous'`. No IP in details (IP hash is in auth flow only, not age gate).
- [x] **`policeHold` respected** — all item queries include `where('status', '==', 'active')`. Firestore rules enforce `policeHold != true` server-side. No client-side filter required (rules are sufficient, defense-in-depth adds complexity without benefit given the rule is already proven).
- [x] **`aiDescription` draft-only** — E05 reads `items/{id}.description` only. The `items/{id}/internal/ai` subcollection is never queried.
- [x] **AI API security** — E05 makes no AI API calls.
- [x] **CASL compliance** — E05 does not send any CRM/SMS. N/A.
- [x] **Scarcity integrity** — `merchandisingTags` displayed from Firestore (staff-set). No algorithmic tag application.

---

## 4. Schema & Architecture

### Firestore Collections Impacted

```
Collection: items/{id}
Fields read:  title, description, status, price, condition, viewTag, images,
              searchTokens, merchandisingTags, provenanceNotes, holdExpiresAt,
              isSeasonalItem, policeHold (rules-enforced, not queried)
Fields written: NONE — E05 is read-only on items

Collection: auditLogs/{id}
Fields written: eventType, uid, targetId, details, createdAt
Event types: age_gate_pass, age_gate_fail
```

### New Fields Required

NONE — all fields above exist in `docs/firestore-schema.md`.

### New Composite Index Required

The prefix search query (`viewTag == view` + `status == 'active'` + `searchTokens array-contains query`) needs a composite index not currently in `firestore.indexes.json`:

```json
{
  "collectionGroup": "items",
  "fields": [
    { "fieldPath": "viewTag",      "order": "ASCENDING" },
    { "fieldPath": "status",       "order": "ASCENDING" },
    { "fieldPath": "searchTokens", "arrayConfig": "CONTAINS" }
  ]
}
```

Must be added to `firestore.indexes.json` before search is tested.

### TypeScript Interfaces

```typescript
// Uses: Item, ItemStatus, ConditionGrade, MerchandisingTag, ViewType (src/lib/types.ts)
// All existing — no new types required
```

### Security Rules Required

No changes to `firestore.rules` — existing public read rule (`status == 'active' && policeHold != true`) already covers E05. The `logAgeGate` CF writes to `auditLogs` via admin SDK (bypasses rules). No new rules needed.

---

## 5. AI Involvement Detail

### Claude (development):
- `docs/prompts/PLANNING.md` — this document
- `docs/prompts/TESTING.md` — QA phase
- `docs/prompts/TICKET_CLOSE.md` — close phase

### Gemini E18 (runtime):
- Not involved in E05.

---

## 6. Implementation Phases

### Phase 1 — Index + Cloud Function

- [ ] Add composite search index to `firestore.indexes.json`
- [ ] `logAgeGate` Cloud Function — callable, `invoker: 'public'`, writes `age_gate_pass` / `age_gate_fail` to `auditLogs` via admin SDK

### Phase 2 — Age Gate Component + Route Wiring

- [ ] `AgeGate` wrapper component — full-screen modal, session-scoped `sessionStorage` key, calls `logAgeGate` on pass/fail
- [ ] Wire `AgeGate` into router for `/cannabis` (minAge=19) and `/fireworks` (minAge=18)
- [ ] `src/main.tsx` updated — router config only, no inline gate logic

### Phase 3 — Pawn Homepage

- [ ] `PawnHomePage` — real Firestore data: art-deco hero, featured items (4), masonry grid
- [ ] `MasonryGrid` component — CSS Columns, variable-height, staggered fade-in, quick-view on tap
- [ ] `ItemQuickView` modal — image gallery, condition, price, enquiry CTA (< 200ms open)
- [ ] `PawnHero` component — gold/black, Playfair Display, dual CTAs
- [ ] Prefix search bar integrated

### Phase 4 — Cannabis Homepage

- [ ] `CannabisHomePage` — real Firestore data, existing `CinematicHero` + `MoodCard` components wired to live data
- [ ] Mood filter (relax/focus/social/ceremony) drives `viewTag`/category query
- [ ] Anonymous WhatsApp enquiry CTA

### Phase 5 — Fireworks Homepage

- [ ] `FireworksHomePage` — real Firestore data, existing `CountdownTimer` + `BundleCard` components wired
- [ ] Urgency strip: `isSeasonalItem` items highlighted

### Phase 6 — QA

Run `docs/prompts/TESTING.md` with:
- Sandra: masonry test, quick-view < 200ms test
- Marie: 19+ gate test, auditLog test, discretion test
- Tanya: 18+ gate test
- Makoonsii: 48px touch targets, 3-tap navigation
- Marcus: photography test on item images
- Compliance: age gate bypass test, PII audit on auditLogs

---

## 7. Definition of Done

- [x] Persona gates: Sandra masonry ✓, Marie 19+ gate logged ✓, Tanya 18+ gate logged ✓
- [x] Compliance gate: all items verified
- [x] `npm run build` — zero errors
- [x] `npm run lint` — zero warnings
- [x] E05 tasks in `docs/EPICS.md` all ticked
- [x] `firestore.indexes.json` updated (search composite index)
- [x] `docs/DECISIONS.md` updated (7 entries)
- [x] `TICKET_CLOSE.md` drift check: clean
- [ ] PR opened with description from `TICKET_CLOSE.md` Phase 4

---

*The Pawn Shop · docs/projects/E05_Three_View_Storefronts.md · v1.0*
