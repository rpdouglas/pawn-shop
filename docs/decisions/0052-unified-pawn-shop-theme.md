# Decision 0052 — Unified Pawn Shop Theme Across All Verticals

**Date:** 2026-08-13
**Epic:** E129 (closed as non-bug) — follow-up to E128
**Cycle:** 34
**Status:** Documented (product decision predates this entry; this decision records it and corrects the docs)

---

## Context

E128's Gate 2 verification found that `--color-primary`, `--color-bg`, and
the other per-view design tokens are defined exactly once, in `:root`, with
the Pawn Shop gold/black/Playfair-Lora values — and that no
`.view-cannabis`/`.view-fireworks` CSS override block exists anywhere to
remap them to the Cannabis purple or Fireworks red palettes described in
`docs/design-system.md` §1 and `CLAUDE.md`'s original Three-View Architecture
table. This was flagged as a potential bug (tentatively "E129") pending
confirmation, since Fireworks is a live, non-suspended view.

**Confirmed: not a bug.** The distinct per-view palette was designed
(reflected in the original `ThePawnShop-DesignSystem-v1.0.docx` and its
`docs/design-system.md` extract) but the product direction changed — all
verticals now share one unified Pawn Shop visual identity. The three-palette
system was never fully implemented and was subsequently dropped in favor of
consistency, rather than left as an unfinished implementation gap.

## Decision

**One visual theme for all three storefronts:** `#C8A14A` Gold on `#080706`
Near-black, Playfair Display (display) / Lora (body), the single
`--motion-speed-standard` (400ms) timing. This is already what
`src/index.css` implements today — no code change was required, only
correcting the documentation that still described the abandoned three-palette
design.

**What still differs per view:**
- Route (`/pawn`, `/cannabis`, `/fireworks`)
- Age gate (none / 19+ / 18+)
- Content, copy, and category-specific data (`cannabisProfile`, `fireworksProfile`)
- The `.view-*` CSS class is still applied per view (structural/JS hook — e.g. `ViewContext`-driven conditionals, testing selectors) even though it no longer carries different color/font/motion token values

**What no longer differs:** color palette, typography, motion timing.

## Rationale (as relayed by the product owner)

Brand consistency across verticals — a single "Dapper. Debonair. Distinctly
Akwesasne." identity presented uniformly, rather than three visually distinct
sub-brands. This also matches the current suspension of Cannabis (E123) —
when/if it's reactivated, it will use the same unified gold theme, not a
separate purple palette.

## Consequences for E128's Deferred Scope — Completed Same Day

E128 excluded `TerpeneProfile.tsx`, `LuxuryProductCard.tsx`, and
`CannabisPage.tsx` from its hex cleanup because their `var(--x, #hex)`
fallbacks (`#7B4FA0`, `#7A6030`, `#5a9e6a`) appeared load-bearing pending
resolution of the per-view token question. With that question resolved, the
follow-up was completed immediately:

- `TerpeneProfile.tsx` — dead fallbacks removed (`--color-primary`,
  `--color-text-muted` were already defined at `:root`); the never-defined
  `--color-border-subtle` replaced with the existing `--color-border` token.
- `LuxuryProductCard.tsx` and `CannabisPage.tsx` — `var(--color-primary-dim, #7A6030)`
  replaced with the existing `--color-accent` token (`#B8963E`, already
  documented as "Brass / muted bronze" — the semantically correct match, no
  new token needed). The raw `#5a9e6a` savings-green replaced with the
  existing `--color-success` token.
- `src/lib/theme-colors.ts`'s `VIEW_META_THEME_COLORS` per-view map
  (`cannabis: '#7B4FA0'`, `fireworks: '#C0392B'`) collapsed to a single
  `META_THEME_COLOR` constant — the `<meta name="theme-color">` tag no longer
  needs a per-view lookup either.

Zero non-Pawn hex values remain anywhere in `src/`. Verified: `npm run build`,
`npm run lint`, `npm run test` (29/29), `npx tsc -b` (functions) all pass.

## Documentation Corrected

- `CLAUDE.md` — Three-View Architecture table: removed per-view Primary/Font columns, added a note pointing here. Removed the now-obsolete Cannabis-purple-contrast guardrail bullet (`--color-primary` on `--color-bg` is 2.8:1 in cannabis) since Cannabis no longer uses purple.
- `docs/design-system.md` — added a superseded-notice banner above §1–4 pointing here; historical DOCX-sourced tables left in place for reference, marked as not reflecting live token values.

## Not Changed

`src/index.css`, `firestore.rules`, any component logic — the code already
matched this decision; only the docs were stale.

---

*The Pawn Shop · docs/decisions/0052-unified-pawn-shop-theme.md · 2026-08-13*
