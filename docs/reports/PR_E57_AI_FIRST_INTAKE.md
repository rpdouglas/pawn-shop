# Epic E57: AI-First Inventory Intake Flow

## Summary
This PR implements **Epic E57**, reversing the traditional inventory intake flow to be an AI-First experience. Staff now select a storefront View (Pawn, Cannabis, Tobacco, Fireworks) and immediately upload a photo. This triggers a Gemini Vision background job that deep-dives into the image to extract product details (Title, Brand, Format, Category) and market pricing metrics (Average Regular, Sale, and Open-Box prices). 

The form is then automatically hydrated with this drafted data, drastically reducing data entry fatigue for staff. 

**Personas Served:**
- **Staff (Marie / Admin):** Reduces manual entry fatigue, speeds up intake times, and ensures consistent product classification.
- **Dale:** Out-of-the-gate pricing accuracy via AI-derived market comps, securing his trust in the platform's pricing model.
- **Jordan & Marcus:** The raw AI extraction and rationale are securely walled off in the private `items/{id}/internal/ai` Firestore document. No customer will see the raw AI analysis directly, passing the firewall test.

## Schema Changes
- `docs/firestore-schema.md` was updated to document the new `intakeExtraction` object inside the `items/{id}/internal/ai` private subcollection.
- Decisions were previously logged in `DECISIONS.md`.

## Verification & Test Plan
- **Build Status:** Clean build (`npx tsc -b`) and zero ESLint warnings/errors.
- **Access Control:** Verified that `intakeExtraction` is written strictly to `internal/ai`, inaccessible to public queries via Firestore Rules.
- **Accessibility:** Playwright `axe-core` tests passed with 0 violations (`npm run test:a11y`).
- **User Guide:** The `mobile-intake.md` and `intake.md` documentation pages were updated to teach staff about the new AI hydration feature.

## Linked Issues
Fixes Epic E57
