# Project Spec: E29 · Cannabis Product Intelligence

## 1. Goal
Provide a comprehensive, specialized data model and user interface for cannabis products. This will enable proper tracking of potency, genetics, terpenes, and compliance data, surfaced to the customer through a premium, discreet UI.

## 2. Background
Currently, cannabis products share a generic retail schema (`items/{id}`) with pawn and fireworks items. This schema lacks critical fields for cannabis retail (THC/CBD, terpenes, strain, format, weight, and compliance dates). E29 introduces the `cannabisProfile` submap to properly merchandise these products.

## 3. Requirements
- **Schema Extention:** Update `firestore-schema.md` to include a `cannabisProfile` map on `items/{id}`.
- **Extended Fields:** Must include `thcMin`, `thcMax`, `cbdMin`, `cbdMax`, `terpenes[]`, `geneticLineage`, `effectProfile[]`, `brand`, `format`, `weight`, `lotNumber`, and `packagedDate`.
- **Admin Input:** `IntakeForm.tsx` must conditionally render inputs for these fields when `viewTag === 'cannabis'`.
- **UI Components:** Create `CannabisProductData.tsx` and an SVG-only radar chart `TerpeneProfile.tsx`.
- **Persona Constraints:**
  - **Marie (Discretion Test):** The customer UI heading must be "Wellness Profile", avoiding category disclosure. No cannabis terminology in SMS/CRM.
  - **Jordan (Aesthetics):** The spider chart must be built with raw SVGs (no external libraries) using dark luxury tokens.
  - **Marcus (Authenticity):** All terpene data must be staff-entered, never AI-generated.

## 4. Scope & Dependencies
- Depends on the existing `items/{id}` and `IntakeForm`.
- No new Cloud Functions required (writes happen directly via Admin SDK/client).
