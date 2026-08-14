# E130 Plan — Raw `px` Value Triage

**Spec:** `docs/projects/E130_PX_TRIAGE.md`
**State read:** `docs/ACTIVE_CYCLE.md`, `docs/EPICS.md`, `src/index.css` (token scale), Decisions 0051/0052 (precedent for reuse-over-invention and exact-match-only substitution)

---

## Persona Gate

- **Jordan (Primary):** Token consistency, continuing E128.
- **Makoonsii:** WCAG 44/48px touch targets must not be miscategorized as spacing-scale values and "fixed" into something that breaks the touch-target guarantee.
- **Compliance:** `CLAUDE.md` guardrail restoration.

## Schema Audit

No Firestore collections involved — pure CSS/inline-style value substitution.

## Triage Method

For every `px` literal in the 97 flagged files, read the surrounding CSS
property. Classify:
- **Real violation:** the value sits in a spacing property (`padding`,
  `margin`/`marginTop`/etc., `gap`), a sizing property being used spacing-like
  (`minHeight`/`minWidth`/`width`/`height` on non-touch-target UI elements —
  precedent: `LuxuryProductCard.tsx` already uses `var(--space-24)` for a
  thumbnail width), a `borderRadius` matching a `--radius-*` step, or
  `fontSize` — **and** the literal value exactly equals a `--space-*`,
  `--text-*`, or `--radius-*` token.
- **Accepted exception:** border widths (1–3px — this codebase's established
  pattern is `border: '1px solid var(--color-x)'`, unflagged in every prior
  QA pass), WCAG 44/48px touch targets (`minHeight`/`minWidth` on interactive
  elements, or Tailwind `min-h-[48px]`), `box-shadow` offset/blur values,
  `blur()` filter values, one-off component/layout dimensions with no scale
  match (icon sizes like `20px`, `18px`; container widths like `1280px`,
  `400px`), and any value with **no exact token match** — converting those
  would silently change the rendered size, which is a regression, not a
  cleanup (same principle established in Decision 0051/0052: don't
  approximate).

**Verification queries run to rule out surprises:**
- `44px` — 100% `minHeight`/`minWidth` on interactive elements. No violations.
- `48px` — 100% touch-target context (props, Tailwind classes, comments, test names). No violations.
- Padding/margin/gap with `px` values in the 3-digit range (`1280px`, `400px`, etc.) — **zero matches**. Confirms large values are never used as spacing, only as one-off layout dimensions (already-accepted category).
- `14px` in `fontSize` context — 4 real matches to `--text-small`, added to the fix list.

## Findings — Real Violations (51 property-level fixes, 15 files)

| File | Fixes |
|---|---|
| `src/pages/auth/MfaEnrollPage.tsx` | 11 — `padding`, `marginBottom` ×3, `fontSize` ×3, `gap` |
| `src/pages/auth/LoginPage.tsx` | 9 — `padding` ×2 (partial), `marginTop` ×2, `marginBottom` ×2, `margin`, `fontSize` ×2 |
| `src/pages/auth/SignUpPage.tsx` | 5 — `padding` ×2 (partial), `marginBottom`, `marginTop`, `fontSize` |
| `src/components/fireworks/BundleCard.tsx` | 4 — `gap`, `margin`, `fontSize` ×2 |
| `src/components/pawn/ReturnRequestForm.tsx` | 4 — `width`/`height` ×2 instances |
| `src/pages/admin/InventoryTable/columns.tsx` | 4 — `minHeight`/`minWidth` ×2 pairs |
| `src/components/cannabis/MoodCard.tsx` | 3 — `marginBottom`, `marginTop`, `padding` (both parts) |
| `src/components/ui/Card.tsx` | 3 — `gap`, `padding`, `fontSize` |
| `src/pages/admin/social/SocialDashboardPage.tsx` | 3 — `gap` ×2, `borderRadius` |
| `src/components/admin/InventoryTable/CellEditors.tsx` | 2 — `minHeight` ×2 |
| `src/pages/admin/social/SocialComposerPage.tsx` | 2 — `width`/`height` |
| `src/components/fireworks/UrgencyBadge.tsx` | 1 (partial — `4px` of `'4px 12px'`; `12px` has no scale match, left as literal) |
| `src/components/admin/InventoryTable.tsx` | 1 — `minHeight` |
| `src/components/admin/IntakeForm.tsx` | 1 — `height` |
| `src/pages/admin/MobileIntakePage.tsx` | 1 — `height` |

All target tokens already exist (`--space-1/2/4/6/8`, `--text-xs/small/body/lead/subheading`, `--radius-sm`) — no new tokens needed.

## Findings — Accepted Exceptions (no change)

- **220** hairline border widths (1–3px) — established pattern throughout the codebase.
- **113** WCAG 44/48px touch targets — explicit literal requirement per `design-system.md` §9.1, not a `--space-*` concept.
- **~150** one-off component/layout dimensions with no scale match (icon sizes, modal/container widths, thumbnail sizes) — e.g. `20px`/`18px` icon squares, `1280px` content container, `400px` modal widths.
- Values with no exact token match in a spacing-shaped property (e.g. `12px` gap/padding, `2px`/`6px` in `ArticleCard.tsx`) — left as literal rather than rounded to a nearby token, to avoid a silent visual size change.
- `box-shadow` offset/blur/spread values and `blur()` filter values — not a spacing concept.

## Anti-Regression Check

- ✅ No new Firestore fields, no schema touched.
- ✅ No hex/color values touched (that was E128's scope, already closed).
- ✅ Every fix is an exact-value substitution — zero computed-value change, zero visual regression by construction.
- ✅ WCAG 44/48px touch targets explicitly excluded from the fix list — Makoonsii's hard requirement is preserved untouched.
- ✅ No motion/age-gate/PII/AI-key guardrails touched — out of scope for this epic.

---

## Strategy A — Fix All 51 Identified Violations, Document the Rest (Recommended)

**Architecture:** Apply all 51 property-level substitutions identified above across 15 files, using only existing tokens (no new tokens needed). Commit the accepted-exceptions reasoning (border/touch-target/no-match categories) as the triage record in the decision log — future audits can point at this instead of re-deriving it.

**Persona Lens:** Jordan gets full, verified closure of the spacing/font-size guardrail for every case where a real token match exists. Makoonsii's touch targets are untouched by construction (excluded, not "fixed").

**Compliance:** Closes the guardrail as completely as is truthful — the remaining raw `px` values are either not a spacing concept (borders, shadows) or have no lossless token equivalent, both documented, not silent.

**Trade-offs:** Touches 15 files in one pass — larger diff than E128's per-file approach, but each change is a single-line, single-value substitution with a build/lint/test-verified zero-visual-diff guarantee. Low review risk despite the file count.

**Estimated Scope:** Medium — 15 files, 51 single-value edits, zero new tokens, zero new dependencies.

---

## Strategy B — Fix Only the Highest-Traffic Files Now, Defer the Rest

**Architecture:** Fix only the 3 auth pages (`LoginPage.tsx`, `MfaEnrollPage.tsx`, `SignUpPage.tsx` — 25 of the 51 fixes, customer-facing, highest visibility) this pass. Defer the remaining 12 files (mostly admin-internal: `InventoryTable`, `CellEditors`, `columns.tsx`, `SocialDashboardPage`, `SocialComposerPage`, plus a few storefront components) to a follow-up.

**Persona Lens:** Prioritizes Jordan's customer-facing quality bar over admin-internal consistency.

**Compliance:** Partial closure — technically still leaves 26 identified violations unfixed, just in lower-visibility files. Weaker than Strategy A against the letter of the guardrail for no real risk-reduction benefit (all 51 fixes carry the same low risk profile).

**Trade-offs:** Smaller single diff, but manufactures a second follow-up pass for work that's already fully scoped and equally low-risk — pure schedule-slicing with no technical justification, unlike E128's Cannabis-file exclusion (which was risk-driven, not arbitrary).

**Estimated Scope:** Small this pass (3 files, 25 fixes) + a deferred Medium pass later.

---

## Strategy C — Fix All 51 + Round the No-Match Values to Nearest Token

**Architecture:** Same as Strategy A, plus additionally round every "no exact match" value (e.g. `12px` gap → nearest `--space-2` (8px) or `--space-4` (16px), `20px` icon → `--space-6` sacrificing exactness, `2px` → drop or round to `--space-1`) to fully eliminate every raw `px` value in the 97 files, not just the exact matches.

**Persona Lens:** Jordan gets the most visually consistent spacing scale end-state. Makoonsii/Dale/Sandra risk: every rounded value is a small but real visual size change across dozens of components (icon sizes shrinking/growing 2-4px, gaps tightening/loosening) with no design review — exactly the kind of unreviewed drift Decision 0051/0052 explicitly rejected ("don't approximate").

**Compliance:** Most complete on paper, but violates this project's own established precedent of exact-match-only substitution, and turns a zero-risk cleanup into a visual-regression risk needing a full design QA pass on ~40 additional components before it could safely ship.

**Trade-offs:** Not recommended — trades a real, unforced regression risk for a marginal completeness gain on values that were never actually guardrail violations (a `20px` icon was never meant to be a spacing-scale value; it's just 20px).

**Estimated Scope:** Large — same 15 files as Strategy A plus ~25-30 additional files with approximated (not exact) substitutions, plus a required visual QA pass.

---

## Recommendation

**Strategy A.** It's the only strategy that closes the guardrail completely and truthfully without inventing risk that wasn't there. The 51 fixes are all mechanical, exact-value substitutions against tokens that already exist — there's no reason to slice them across two passes (Strategy B) or degrade them into approximations (Strategy C).
