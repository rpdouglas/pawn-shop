# Decision 0048 — E102 Pawn Hero Copy and CTA Update

**Date:** 2026-07-08
**Epic:** E102 · Vertical Hero Sections
**Cycle:** 33
**Status:** Implemented & Closed

---

## Context

The previous default headline and subheading in [PawnHero.tsx](file:///workspaces/pawn-shop/src/components/pawn/PawnHero.tsx) read:
> *Quiet confidence. Curated objects of distinction.*
> *An uncompromising collection of timepieces, instruments, and heirlooms—presented with editorial precision.*

However, this positioning did not reflect the store's primary business model, which consists of sourcing bulk liquidation items and clearing them out at rock-bottom prices. Keeping the legacy text was misleading to customers. The copy needed an overhaul to accurately describe the liquidation inventory while preserving the dapper, debonair, and distinctly Akwesasne brand tone.

---

## Decision

We implemented Strategy A:
1. Replaced the static header and description copy in [PawnHero.tsx](file:///workspaces/pawn-shop/src/components/pawn/PawnHero.tsx) with **Option 3: The Direct Pipeline** copy:
   * **Headline:** `Clear Freight. Direct Trade.`
   * **Subheading:** `Sourcing bulk liquidation stock and clearing the floor at rock-bottom prices. High utility, zero markup—Akwesasne’s direct pipeline to smart savings.`
2. Updated the primary CTA button text from `Browse Inventory` to `Browse Liquidations`.
3. Kept the secondary CTA button text as `Pawn or Sell` to support buy-ins, trade-ins, and local appraisals.

---

## Rationale

1. **Aesthetic Sincerity:** Aligns the above-the-fold experience with the actual Brother POS embed inventory.
2. **Dapper & Debonair Framing:** Frames bulk liquidation and low prices not as a cheap discount store, but as a confident, direct cargo pipeline ("Clear Freight", "Direct Trade") and a smart choice for savvy buyers ("smart savings").
3. **High Performance:** Standard static text swap preserves LCP speed and eliminates public Firestore configuration document reads during initial page rendering.

---

## Compliance Notes

- **Zero Hardcoded Styles:** Kept all CSS classes (`.pawn-hero-content` staggered animation, inline spacing tokens) intact.
- **Accessibility:** Touch target sizes remained at 48px, and the primary CTA continues to target `#masonry-section` with smooth scrolling.
- **Linguistic Gate:** No Kanien'kéha language changes were introduced.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/pawn/PawnHero.tsx` | Updated headline, subheading, and primary button text. |
| `docs/plans/E102_PAWN_HERO_COPY_UPDATE_PLAN.md` | Created the project plan for the update. |
| `docs/decisions/0048-e102-pawn-hero-copy-update.md` | Created this decision record. |

---

*The Pawn Shop · docs/decisions/0048-e102-pawn-hero-copy-update.md · 2026-07-08*
