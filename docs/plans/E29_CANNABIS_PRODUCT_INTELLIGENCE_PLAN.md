# Epic Plan: E29 · Cannabis Product Intelligence

## Problem Statement
The generic `items/{id}` schema prevents us from properly tracking and merchandising cannabis products. We need to introduce a `cannabisProfile` submap, along with the admin interfaces to populate it, and the frontend components to display it elegantly.

## Persona Impact Statement
- **Marie:** Needs to view effects/mood and terpenes without overt cannabis branding. Discretion is key.
- **Jordan:** Expects a high-end, visual presentation of data (spider chart) that loads instantly and matches the dark luxury aesthetic.
- **Marcus:** Demands authenticity. Staff-verified genetic lineages and terpene profiles, never hallucinated by AI.

## Compliance Checklist
- [x] No PII involved in product intelligence.
- [x] Category disclosure avoided in notifications.
- [x] Lot numbers and packaged dates captured for recall/compliance tracking.

## Schema Audit
- Modifies `items/{id}` by adding a `cannabisProfile` map.

---

## Strategy A: Original E29 Scope (Minimal)
Implement exactly what was originally written in the Epic, covering only Potency, Genetics, and Terpenes.
- **Implementation:** Add `thcMin`, `thcMax`, `cbdMin`, `cbdMax`, `terpenes[]`, `geneticLineage`, `effectProfile[]`. Build the `TerpeneProfile` SVG chart and `CannabisProductData` panel.
- **Pros:** Fast implementation.
- **Cons:** Leaves major gaps in weight/format parsing and lacks the compliance tracking (Lot numbers) required for a true dispensary model.

## Strategy B: Comprehensive Cannabis Profile (Recommended)
Expand the `cannabisProfile` schema to include the missing operational and compliance fields.
- **Implementation:** Add all fields from Strategy A, plus `brand`, `format`, `weight`, `lotNumber`, and `packagedDate`. Update `src/lib/types.ts`. Extend the `IntakeForm` with all fields. Create the SVG radar chart and mount the profile data on `CannabisPage.tsx`.
- **Pros:** Full parity with modern dispensary systems (like Dutchie/Jane). Solves compliance and merchandising gaps simultaneously.
- **Cons:** Slightly more complex form state in `IntakeForm`.

## Strategy C: Dedicated Cannabis Collection (Robust)
Split cannabis products into a completely separate `cannabisItems/{id}` collection to enforce strict typing at the database rule level.
- **Implementation:** Migrate all cannabis items. Re-write the global search, masonry grids, and `useItems` hook to aggregate across collections.
- **Pros:** Strict schema validation.
- **Cons:** Highly disruptive. Breaks the platform's multi-view architecture (`ViewType` union) and unified cart/search flows. Over-engineered.

---
**Recommendation:** Strategy B provides the necessary robust data layer for cannabis while maintaining the unified platform architecture.
