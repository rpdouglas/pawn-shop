# Decision 0050 — FIX: Pawn Hero Dead Space (80vh Floor Removal)

**Date:** 2026-07-08
**Epic:** E102 · Vertical Hero Sections (follow-up to Decisions 0048 and 0049)
**Cycle:** 33
**Status:** Implemented & Closed

---

## Context

After Decisions 0048 (headline copy) and 0049 (single-line fit), user-supplied screenshots showed large empty gaps above the "Cornwall Island · Akwesasne" eyebrow text and below the CTA buttons on `/pawn`, immediately before the "Liquidation Items" (Brother POS embed, `ShopMenu.tsx`) heading.

`PawnHero.tsx`'s outer `<section>` carried `minHeight: '80vh'` with `justifyContent: 'center'` — a layout designed for the hero's original spec (E102), where the text block sat above an optional image carousel or video (`useHeroMedia`) that filled out the remaining height. Since E127 replaced the Firestore-driven discovery grid with the Brother POS widget, and no `heroData.pawn` is currently configured in Firestore, `useHeroMedia` resolves to `null` and the media block never renders. With no media to fill the box, flexbox centers the short text-only content inside the artificial 80vh floor, producing large symmetric empty gaps above and below it.

## Decision

Removed `minHeight: '80vh'` from the `PawnHero.tsx` section style. The section now sizes to its actual content (padding + text + buttons) instead of a fixed viewport-height floor. `justifyContent: 'center'` was left in place — it is a no-op once box height equals content height, and keeps things centered if a media block is configured later.

## Rationale

- **Content-driven height, not a fixed viewport assumption.** The 80vh floor was calibrated to a hero that always had a media block. That assumption no longer holds now that Brother POS is the primary above-the-fold discovery surface (per E127); the hero's job is now a short brand/CTA banner, not a full-screen moment.
- **Forward-compatible.** If `heroData.pawn` is configured with a carousel/video in the future, that block's own dimensions (aspect-ratio, up to 900px wide) will naturally give the hero a taller, appropriate height — no artificial floor is needed either way.
- **Verified empirically**, not estimated: confirmed in a headless Chromium pass against the running dev server that the gap above the eyebrow text and below the CTA buttons now matches the section's intentional padding (48px) plus the page wrapper's 32px section spacing, not a near-viewport-height gap.

## Compliance Notes

- No Firestore fields, Cloud Functions, or auth changes.
- No hardcoded hex/px values introduced — the only change is the removal of one inline style property.
- No motion changes — the existing `.pawn-hero-content` cinematic fade-up (§4.2) animation is untouched.

## Files Changed

| File | Change |
|------|--------|
| `src/components/pawn/PawnHero.tsx` | Removed `minHeight: '80vh'` from the outer `<section>` style |

---

*The Pawn Shop · docs/decisions/0050-fix-pawn-hero-dead-space.md · 2026-07-08*
