# E56 Epic Plan: Cannabis Data Model Modernization

## Phase 1 — Persona & Compliance Gate
- **Primary Persona:** Customers. This allows customers to accurately filter and understand products (e.g., distinguishing a high-THC infused pre-roll from a regular one, or knowing if gummies are 5mg or 10mg per serving). Secondary: Staff (Marie/Dale) who need clear input fields to ensure accurate, compliant listings.
- **Compliance Audit:** Updates will be purely additive to `CannabisProfile`. Existing items without these fields will gracefully fall back, preventing any breakage of historical inventory data.

## Phase 2 — Schema Audit
- **Impacted Collections:** `items/{id}`
- **Schema Changes:** 
  - Add `subCategory` (string) to `CannabisProfile`.
  - Add `servings` (number) to `CannabisProfile`.
  - Add `weightPerServing` (string) to `CannabisProfile`.
  - Add `strainType` ('sativa' | 'indica' | 'hybrid' | 'blend' | 'high-cbd') to `CannabisProfile`.
  - Add `cannabinoidUnit` ('%' | 'mg') to `CannabisProfile`.

## Phase 3 — Three-Strategy Proposal

### Strategy A: Granular Schema Modernization (Recommended)
- **Architecture:** Directly implement the exact gap analysis schema additions. 
  1. Add the 5 new fields to `src/lib/types.ts` and `docs/firestore-schema.md`.
  2. Update `IntakeForm` and `MobileIntakePage` with explicit UI controls (e.g. dropdowns for Strain Type and Potency Unit).
  3. Update `CannabisProductData` to intelligently render this data (e.g., showing `[Servings] x [Weight Per Serving]` if applicable, and appending `%` or `mg` based on the unit).
- **Persona Lens:** Perfectly balances Staff data entry constraints (using dropdowns/toggles to prevent typos) while giving customers exactly what they need to make purchasing decisions.
- **Trade-offs:** Adds vertical length to the already dense Intake forms when `viewTag === 'cannabis'`.

### Strategy B: "Catch-All" Tags
- **Architecture:** Instead of adding 5 dedicated fields, just add a generic `cannabisTags` string array to the model, and force Staff to type things like "Sativa", "Infused", "10mg per serving".
- **Trade-offs:** Terrible data integrity. Staff will inevitably create typos ("Sativva", "10 mg" vs "10mg"), breaking any future filtering systems on the storefront. Strongly discouraged.

### Strategy C: Complete POS Taxonomy Sync
- **Architecture:** Build an automated sync that pulls these exact taxonomy fields from the POS provider's API directly into Firestore on a nightly basis, completely bypassing manual Staff entry for these fields.
- **Trade-offs:** Out of scope for this Epic. Requires massive backend infrastructure and tight integration with the POS system, which is currently slated for future development (E30+).

## Phase 4 — Anti-Regression Protocol
- [x] No hardcoded Hex Codes.
- [x] Firestore field invention: Prohibited. All fields will be documented in `docs/firestore-schema.md`.
- [x] Legacy Item Support: All new fields will be typed as optional (`?`) in TypeScript to prevent compiler errors on older items.

**Recommendation:** Strategy A is the robust, compliant path forward.
