# Finding — Per-View CSS Token Overrides Are Missing (2026-08-13)

**Discovered during:** E128 (Design Token & Type-Safety Cleanup), Gate 2 verification
**Severity:** ~~High~~ **RESOLVED — not a bug.** See update below.
**Status:** ✅ Closed as non-bug 2026-08-13. Confirmed by product owner: the
three-vertical palette was designed but never implemented, and the product
direction has since moved to one unified Pawn Shop theme across all views on
purpose. See `docs/decisions/0052-unified-pawn-shop-theme.md`.

---

## Summary

`docs/design-system.md` §1 and `CLAUDE.md`'s guardrails describe a three-view CSS
custom property system: `--color-primary`, `--color-bg`, `--color-accent`, etc.
are supposed to resolve differently depending on whether the `.view-pawn`,
`.view-cannabis`, or `.view-fireworks` class is present on the DOM (injected by
`ViewContext`/`ViewLayout.tsx`).

**That CSS override does not exist anywhere in the codebase.** `src/index.css`
defines these tokens exactly once, inside a bare `:root { ... }` block, with the
Pawn palette (`--color-primary: #C8A14A`, `--color-bg: #080706`, etc.). There is
no `.view-cannabis { ... }` or `.view-fireworks { ... }` block remapping them, no
Tailwind v4 `@theme` per-view variant, and no JS-side `style.setProperty()` call
that would inject per-view values at runtime.

## Evidence

- `grep -rn "\.view-cannabis\|\.view-fireworks\|\.view-pawn" src --include="*.css"` returns zero matches across `index.css`, `admin.css`, `print.css`, `App.css`.
- No `@theme` directive exists in any CSS file (Tailwind v4's CSS-first per-view theming was never wired up).
- `ViewLayout.tsx` does apply `className={\`view-${view}\`}` to the DOM as expected — the class is present, nothing in CSS listens for it on the color tokens.
- `var(--color-primary)` is referenced roughly 150 times across the codebase, including in **live, non-suspended** Fireworks components: `CountdownTimer.tsx`, `BundleCard.tsx`, `UrgencyBadge.tsx`, `PreorderModal.tsx`, `FireworksHero.tsx` (indirectly). All of these currently resolve to Pawn gold (`#C8A14A`), not Fireworks red (`#C0392B`), because `--color-primary` is never remapped.
- The only reason any Cannabis-specific component still renders purple-ish is that a handful of files hardcode a `var(--color-primary, #7B4FA0)`-style fallback — which only works because the real token is *undefined* for those specific undefined tokens (`--color-primary-dim`), or is coincidentally unreachable dead code for tokens that *are* defined at `:root` (`--color-primary` itself, which is always gold, fallback or not). Cannabis is currently suspended (E123) so this isn't customer-visible today, but Fireworks is live.

## Why This Wasn't Caught By E128's Original Scope

E128's plan assumed the `var(--token, #hex)` fallback pattern found in
`TerpeneProfile.tsx` / `LuxuryProductCard.tsx` / `CannabisPage.tsx` was dead-weight
left over from before the token was formally defined, and planned to strip the
fallbacks now that (in the plan's understanding) the "real" per-view token would
resolve correctly. That assumption was wrong — verified by reading the full
`index.css` and grepping for the override blocks during Gate 2. Those three files
were pulled out of E128's execution scope as a result; see the code comments left
in each file.

## Resolution (2026-08-13)

Confirmed by the product owner: the distinct per-view palette (Cannabis
purple, Fireworks red) was designed but the product direction changed to a
single unified Pawn Shop theme (gold/black/Playfair/Lora) across all three
verticals, on purpose. The code already correctly implements this — `:root`
defining the tokens once, with no per-view override, is not a gap, it's the
intended architecture for a one-theme product. No code fix needed.

**Follow-up:** this unblocks finishing E128's deferred scope — the hex left
in `TerpeneProfile.tsx`, `LuxuryProductCard.tsx`, and `CannabisPage.tsx` was
excluded because it looked load-bearing pending this exact question. Now that
there's no future divergent palette to protect, those fallbacks can be
formalized/removed as a small follow-up. See
`docs/decisions/0052-unified-pawn-shop-theme.md`.

---

*The Pawn Shop · docs/reports/FINDING_2026-08-13_VIEW_TOKEN_CSS_GAP.md · 2026-08-13*
