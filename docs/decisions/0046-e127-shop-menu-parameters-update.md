# Decision 0046 — E127 Shop Menu Parameters Update: Strategy B (Idiomatic Dataset Property Injection)

**Date:** 2026-07-07
**Epic:** E127 · Brother POS Inventory Embed
**Cycle:** 33
**Status:** Implemented & Closed

---

## Context

The Shop Menu integration previously loaded the external `embed.js` script with only the `data-mode` parameter configured. To support advanced inventory filtering and theme customizations, we needed to pass additional parameters:
1. `data-revenue-center="44"`
2. `data-category="1804"`
3. `data-theme="clean"`

---

## Decision

**Strategy B: Idiomatic Dataset Property Injection.**

We updated `src/components/pawn/ShopMenu.tsx` to programmatically inject the new parameters into the script element's `dataset` object:
*   `dataset.revenueCenter = '44'`
*   `dataset.category = '1804'`
*   `dataset.theme = 'clean'`

Additionally, the parameter `data-theme` was used instead of the typo `data-heme` specified in the request, because source inspection of the third-party `embed.js` confirmed it specifically checks for `data-theme` and has no reference to `data-heme`.

---

## Rationale

1. **Safety & Correctness:** Using the correct `data-theme` parameter guarantees that the storefront custom styles are correctly loaded, whereas keeping the typo `data-heme` would have resulted in formatting issues.
2. **Idiomatic dataset manipulation:** Using camelCase dataset property properties (`dataset.revenueCenter`, `dataset.category`, `dataset.theme`) aligns with React and modern web standard practices rather than manual attribute styling using `.setAttribute`.
3. **Low-Risk Scope:** Hardcoding the parameters directly within the standalone component prevents scope creep in `PawnPage.tsx`.

---

## Compliance Notes

- **A11y/Axe Accessibility Gating:** Verified that the iframe element target `#brotherpos-shop` remains properly ignored from Ax scans as part of E127 rules.
- **Strict Git Governance:** No git operations were performed.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/pawn/ShopMenu.tsx` | Updated script injection parameters with `revenueCenter`, `category`, and `theme`. |
| `docs/plans/E127_SHOP_MENU_PARAM_UPDATE_PLAN.md` | Created the 3-strategy proposal plan. |

---

*The Pawn Shop · docs/decisions/0046-e127-shop-menu-parameters-update.md · 2026-07-07*
