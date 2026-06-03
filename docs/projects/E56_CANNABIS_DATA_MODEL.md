# E56 Project Spec: Cannabis Data Model Modernization

## Overview
The current cannabis inventory data model lacks granularity required for modern retail compliance and customer experience. Specifically, it is missing fields for Sub Categories (e.g., Infused vs Regular pre-rolls), Dosing (Servings and Weight per Serving), explicit Strain Types (Sativa, Indica, Hybrid), and Potency Units (% vs mg). This project modernizes the `CannabisProfile` schema to support these attributes and updates the intake forms and storefront to use them.

## Requirements
1. **Schema Update:** Expand the `CannabisProfile` in `src/lib/types.ts` and `docs/firestore-schema.md` to include:
   - `subCategory` (string)
   - `servings` (number)
   - `weightPerServing` (string)
   - `strainType` ('sativa' | 'indica' | 'hybrid' | 'blend' | 'high-cbd')
   - `cannabinoidUnit` ('%' | 'mg')
2. **Staff Intake Flow:** Update both desktop (`IntakeForm.tsx`) and mobile (`MobileIntakePage.tsx`) forms to capture these new fields when `viewTag === 'cannabis'`.
3. **Storefront UX:** Update customer-facing components (`CannabisProductData.tsx`, etc.) to beautifully render these new properties (e.g. dynamic `%` or `mg` signs, computed total weights, strain badges).

## Persona Impact
- **Staff (Marie):** Compliant, granular data entry ensures accurate descriptions and protects the business. 
- **Customer:** Sub-categories and strain types are the primary mental models customers use to shop. Clear servings data prevents edible dosing confusion.

## Compliance
- Firestore data handling must remain strictly typed.
- Ensure that updating the schema does not break existing cannabis items (new fields must be optional or fall back gracefully).

## Status
**DONE** (2026-06-03)
