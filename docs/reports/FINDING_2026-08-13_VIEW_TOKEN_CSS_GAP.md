# Finding — Per-View CSS Token Overrides Are Missing (2026-08-13)

**Discovered during:** E128 (Design Token & Type-Safety Cleanup), Gate 2 verification
**Severity:** High — potentially affects live, non-suspended production views
**Status:** Flagged, not yet fixed or scoped as its own epic

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

## Suggested Next Step (not decided — flagging for prioritization)

1. Confirm empirically whether `/fireworks` in the deployed dev environment
   (`nats-rack.web.app/fireworks`) actually renders red/amber or gold — this
   determines urgency. If it's rendering gold, this is a visible production bug
   on a live, unsuspended view and should likely jump the queue.
2. If confirmed, the fix is architectural: add `.view-cannabis { --color-primary: ...; --color-bg: ...; ... }` and `.view-fireworks { ... }` override blocks to `src/index.css`, remapping every per-view token in `docs/design-system.md` §1's table. This is a meaningfully sized change (touches the core theming file, needs a visual regression pass on all three views) and should go through the project's normal spec-first workflow as its own epic (tentatively E129) rather than being folded into E128's cleanup scope.
3. Once the real override exists, the fallback hex in `TerpeneProfile.tsx` / `LuxuryProductCard.tsx` / `CannabisPage.tsx` (and the `--color-primary-dim` / `--color-border-subtle` tokens they're waiting on) can be safely formalized — that remaining piece of E128 becomes trivial once E129 lands.

---

*The Pawn Shop · docs/reports/FINDING_2026-08-13_VIEW_TOKEN_CSS_GAP.md · 2026-08-13*
