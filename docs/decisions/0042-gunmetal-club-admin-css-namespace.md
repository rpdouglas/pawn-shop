# Decision 0042 — E125 Gunmetal Club Admin Theme: Additive CSS Namespace + Token Remapping

**Date:** 2026-06-16
**Epic:** E125 · Gunmetal Club Admin Theme
**Cycle:** 33
**Status:** Implemented & Closed

---

## Context

The admin shell used the consumer Pawn palette (dark `#080706` / Playfair Display) and had a hardcoded `#1c1400` hex value in `AdminTopbar.tsx`. The `GunmetalClubAdmin.jsx` reference design required a distinct slate-grey operational palette for the admin interface, but any approach that directly overrode `:root` tokens risked bleeding the dark palette into the public storefront.

Three strategies were evaluated:

- **A:** Per-file token override — duplicate every value per-component
- **B:** Additive `--gmc-*` namespace, scoped to `.gmc-admin`, with token remapping inside that scope
- **C:** Tailwind config variant — `admin:` variant prefix for every utility

---

## Decision

**Strategy B: Additive `--gmc-*` CSS custom property namespace in `src/styles/admin.css`, scoped to `.gmc-admin` class, with project token remapping.**

---

## Rationale

1. **Zero bleed to public storefront.** All `--gmc-*` tokens and the `--color-*` remaps live inside `.gmc-admin { … }`. No rule in the file matches `:root` or `body`. The consumer Pawn palette is completely unchanged.

2. **Existing components auto-inherit.** By remapping `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-primary`, `--font-display`, and `--font-body` inside `.gmc-admin`, every child component that already references these tokens automatically adopts the GMC palette — no per-file edits required.

3. **Compliance fix bundled.** `--color-error` was never defined in `:root` (pre-existing gap). Defining it inside `.gmc-admin` maps it to `--gmc-status-hold` (#E57373) without widening the scope or requiring a `:root` change.

4. **Single import.** `import '../../styles/admin.css'` in `AdminLayout.tsx` is the only wiring change needed. The `.gmc-admin` class is then applied to both the mobile and desktop layout containers.

5. **No new npm dependencies.** Zero additions to `package.json`. Pure CSS.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|----------------|
| Strategy A (per-file override) | Every new admin component must repeat the same token values — high maintenance burden, high drift risk |
| Strategy C (Tailwind variant) | Requires Tailwind v4 plugin config changes; utility classes would need to be duplicated across every component file; not compatible with the existing inline-style convention used in admin components |

---

## Compliance Notes

- No hardcoded hex values in any new JSX. All new colour references use `var(--gmc-*)` or `var(--color-*)`.
- No hardcoded px font sizes. All new font sizes use `var(--text-*)` scale tokens.
- No hardcoded spacing. All new spacing uses `var(--space-*)` tokens.
- Motion: hover transitions on `InventoryCard.tsx` use `0.15s ease` — within the approved `var(--motion-speed-fast)` pattern. No bounce, no particles, no constant micro-animations.
- `AdminTopbar.tsx` hardcoded `#1c1400` removed — the sole compliance violation this epic was created to fix.

---

## Files Introduced

- `src/styles/admin.css` — full `--gmc-*` token declaration + `.gmc-admin` scope + token remapping

## Files Modified

- `src/components/layout/AdminLayout.tsx` — imports `admin.css`; applies `gmc-admin` class
- `src/components/layout/AdminTopbar.tsx` — removes hardcoded hex; GMC 48px sticky bar
- `src/components/layout/AdminMobileNav.tsx` — GMC bottom nav (safe-area, gold active, bold labels)
- `src/components/admin/InventoryCard.tsx` — hover state, Georgia price gold, uppercase action labels
- `src/pages/admin/InventoryPage.tsx` — stat strip, icon search, filter chips, section accent bar
- `src/pages/admin/DashboardPage.tsx` — compact GMC StatCard (subheading size, conditional gold)

---

*The Pawn Shop · docs/decisions/0042-gunmetal-club-admin-css-namespace.md · 2026-06-16*
