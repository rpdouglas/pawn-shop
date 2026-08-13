# E128 Plan — Design Token & Type-Safety Cleanup

**Spec:** `docs/projects/E128_DESIGN_TOKEN_CLEANUP.md`
**State read:** `docs/ACTIVE_CYCLE.md`, `docs/EPICS.md`, `docs/firestore-schema.md`, `src/index.css`, `docs/decisions/0042-*.md` (2026-08-13)

---

## Persona Gate

- **Jordan (Primary):** Editorial brand quality. Scattered hardcoded hex and `var(--x, #fallback)` patterns that mask *undefined* tokens are exactly the quiet inconsistency Jordan's quality bar exists to catch — a "gold" that's really `#7A6030` in one file and `var(--color-primary)` in another drifts silently.
- **Compliance:** `CLAUDE.md` guardrails — "Never hardcode hex," "No `any` types," "Never hardcode spacing/font-size" — are explicit non-negotiables this epic exists to restore.
- **Makoonsii / All:** No user-facing behavior change intended. Risk profile is regression (visual diff), not persona harm — QA gate must confirm zero visual diff on affected views.

## Schema Audit

**No Firestore collections read or written.** This is a pure CSS-token / TypeScript-type change confined to `src/**` (components, pages, `index.css`) and `functions` type-safety is out of scope (the audit found no `any` in `functions/`). No `firestore-schema.md` update, no new field, no `DECISIONS.md` entry required *for schema* — a decision entry is still warranted for the CSS-token additions and the `any`-type fix approach (project convention, see Decision 0042 precedent).

## Findings (verified this session, supersedes the raw audit grep)

**Hex — 10 files, ~14 occurrences, three real categories:**

| File:Line | Value | Category |
|---|---|---|
| `InventoryTable/columns.tsx:603` | `var(--color-success, #4caf50)` | **Stale fallback** — `--color-success: #16a34a` already exists in `:root`; fallback is dead *and* wrong |
| `IssueLoanModal.tsx:633` | `background: '#fff'` | **Real violation** — no token reference at all |
| `QRLabel.tsx:21` | `{ dark: '#080706', light: '#F5F0E8' }` | **Structural exception candidate** — QR code generator needs literal contrast values for scan reliability, not CSS |
| `SerialBlacklistManager.tsx:125` | `"case #12345"` | **False positive** — placeholder copy, not a color |
| `YouTubeFacade.tsx:40-41` | `fill="#f00"`, `fill="#fff"` | **Structural exception candidate** — YouTube brand-mark SVG, must stay YouTube red/white regardless of view theme |
| `ItemQuickView.tsx:175,193` | `&#8592;`/`&#8594;` | **False positive** — HTML entities (arrows), not colors |
| `ViewLayout.tsx:7-9,38` | `THEME_COLORS` map + meta fallback | **Structural exception candidate** — `<meta name="theme-color">` requires a literal string, can't consume `var()` |
| `LuxuryProductCard.tsx:121,150,228,264` | `var(--color-primary-dim, #7A6030)` ×2, raw `#5a9e6a` ×2 | **Missing-token violation** — `--color-primary-dim` and a "lab-verified" green were never added to `:root` |
| `TerpeneProfile.tsx:41,55,64,66,82` | `var(--color-border-subtle, #333)`, `var(--color-primary, #7B4FA0)`, `var(--color-text-muted, #aaa)` | **Mixed** — `--color-primary`/`--color-text-muted` already exist (fallback is dead weight); `--color-border-subtle` does not exist (missing-token violation) |
| `CannabisPage.tsx:174` | `var(--color-primary-dim, #7A6030)` | Same missing-token violation as above |

**Bonus finding (not in original audit — found during state-read):** `src/index.css` itself has two non-token literals: `.portal-logo-wrap { width: 340px }` and `.portal-subtitle { font-size: 21px }` (the latter isn't even on the `--text-*` scale). Also: `--container-max-width: 1200px` in code vs. `1280px` specified in `docs/design-system.md` §7.4 — a pre-existing doc/code drift, unrelated to this epic's hex/any scope but worth a one-line note in the decision log.

**`any` types — 2 files, 3 occurrences, both root-caused:**

1. `AcknowledgmentWall.tsx:19` — `(window as any).__PLAYWRIGHT_MOCK_USER__`. Fix: a `declare global { interface Window { __PLAYWRIGHT_MOCK_USER__?: boolean } }` augmentation (test-support file) or an inline `(window as unknown as { __PLAYWRIGHT_MOCK_USER__?: boolean })` cast.
2. `LoanTicketsAdminPage.tsx:132,134` — root cause confirmed: `src/components/ui/Table.tsx`'s `TableProps<T extends Record<string, unknown>>` constraint rejects `LoanTicket` (a plain interface with no index signature) at the generic-instantiation level, which is *why* `any` was used as an escape hatch. Two fix options, compared below.

**`px` — 97 files flagged, triage sample confirms mostly non-violations:** a full-codebase sample shows the top counts are `1px` (220 — hairline borders), `48px`/`44px` (113 combined — WCAG touch-target constants explicitly specified as literal in `design-system.md` §9.1, not on the `--space-*` scale), and `24/32/16/8/4px` (56 combined — these **do** map 1:1 to `--space-6/8/4/2/1` and are real violations). The remainder (`1280/480/400/320/120/80px`, etc.) are one-off component dimensions (modal widths, image sizes) that are not spacing-scale values and are typically acceptable as component-specific constants. **Full per-file triage is execution-phase work**, not planning-phase — sizing below reflects that.

## Anti-Regression Check (all three strategies)

- ✅ No new Firestore fields — schema untouched.
- ✅ No AI API keys touched.
- ✅ No `rare-find`/`limited-edition`/`staff-pick` auto-tagging logic touched.
- ✅ No PII in logs/analytics — not in scope.
- ✅ Age gates untouched — this epic doesn't touch `AgeGate.tsx` or `main.tsx` routing.
- ✅ No motion patterns introduced or changed.
- ⚠️ Every strategy below must still individually verify it does not *introduce* a new hardcoded hex while fixing others (e.g., don't hardcode `#16a34a` as a "fix" for the `columns.tsx` fallback — reference `var(--color-success)` with no fallback, since the real token is always defined at `:root`).

---

## Strategy A — Full Token Formalization

**Architecture:** Add the two missing tokens (`--color-primary-dim`, `--color-border-subtle`) to `:root` in `src/index.css`, plus a semantic `--color-verified` (or reuse `--color-success`) for the lab-check green in `LuxuryProductCard.tsx`. Remove every hex fallback now that the real token exists. For the three structural-exception cases (`QRLabel`, `YouTubeFacade`, `ViewLayout` meta tag), leave the literals in place but add an inline comment citing the guardrail exception reason, and log all three in `DECISIONS.md`. Fix `columns.tsx`'s stale/wrong fallback by removing it. Fix the 2 `any` types via the `Table.tsx` generic-relax approach (change `T extends Record<string, unknown>` → `T extends object`) since it's the more correct root-cause fix and benefits any future caller with a plain-interface type. Triage all 97 `px`-flagged files; convert every `--space-*`/`--text-*`-matching value; leave WCAG 44/48px touch targets and non-scale component dimensions as accepted, documented in a triage table committed to the PR.

**Persona Lens:** Jordan gets a fully consistent token system, zero drift. Makoonsii's 44/48px touch-target standard is explicitly preserved (not accidentally "fixed" into a `--space-*` token it doesn't belong to).

**Compliance:** Full guardrail closure — the only "violations" remaining are the three structural exceptions, each documented per-instance and in `DECISIONS.md`.

**Trade-offs:** Most thorough and durable; sets up the token system correctly for future cannabis-view work if E123 ever reverses. Cost: touches a shared UI primitive (`Table.tsx`), which — while low-risk since it only *relaxes* a constraint — needs a check that no other `Table` caller relies on the `Record<string, unknown>` bound. Largest of the three in file count and review surface.

**Estimated Scope:** Medium-Large — ~14 files (10 hex + `index.css` + `Table.tsx` + 2 `any`-fix files) plus px triage (unknown final count until executed, estimate 15-30 real fixes out of the 97 flagged) + `design-system.md` token table update + 1 decision log entry.

---

## Strategy B — Minimal Fallback-Removal Pass

**Architecture:** Fix only what's fixable *without* adding new tokens: `columns.tsx` (real token already exists), the two already-defined-token fallbacks inside `TerpeneProfile.tsx` (`--color-primary`, `--color-text-muted`). Leave `LuxuryProductCard.tsx` (×2) and `CannabisPage.tsx`'s `--color-primary-dim` fallback, `TerpeneProfile.tsx`'s `--color-border-subtle` fallback, `IssueLoanModal.tsx`'s raw `#fff`, and the three structural-exception files as-is, each logged as an accepted exception in `DECISIONS.md` with a linked follow-up ticket for a future cycle. For the `any` types, use a local `unknown`-cast at the call site in `LoanTicketsAdminPage.tsx` (`columns as unknown as Column<LoanTicket>[]`) instead of touching the shared `Table.tsx` primitive — zero blast radius beyond the one file. `px` triage limited to a smaller, high-confidence subset (component files already being touched for other reasons); the bulk of the 97-file px sweep is deferred to a follow-up epic.

**Persona Lens:** Jordan gets partial closure now, full closure deferred — acceptable since none of the deferred items are customer-visible drift (they're all internal/`.dim` accent values or structural exceptions).

**Compliance:** Does not fully close the guardrail — 6 files remain with unresolved hex, documented as accepted debt rather than fixed. This is the weakest option against the literal text of "never hardcode hex."

**Trade-offs:** Fastest, safest, zero shared-component risk. Cost: leaves real guardrail violations in place, just formally acknowledged instead of silently existing. Kicks the harder token-definition work (and the full px triage) down the road.

**Estimated Scope:** Small — ~4 files touched + 1 decision log entry documenting 6 accepted exceptions + deferred px-triage ticket.

---

## Strategy C — Hybrid: CSS Tokens for CSS Contexts, Audited Constants Module for Literal-Required Contexts (Recommended)

**Architecture:** Same token additions as Strategy A (`--color-primary-dim`, `--color-border-subtle`, reuse `--color-success`) for every case that's genuinely inside a CSS/style context — this closes `LuxuryProductCard.tsx`, `TerpeneProfile.tsx`, `CannabisPage.tsx`, and `columns.tsx` completely. For the three cases that are *not* CSS contexts and structurally cannot consume a `var()` (SVG `fill` on a third-party brand mark, a `<meta content>` attribute, a QR-code library's literal color option) — `YouTubeFacade.tsx`, `ViewLayout.tsx`, `QRLabel.tsx` — introduce one new file, `src/lib/theme-colors.ts`, exporting a single typed, commented constant per case (e.g., `export const PAWN_VIEW_META_COLORS = {...}` sourced by reading the same values already in `index.css`, kept in sync via a comment pointing at the CSS file). This turns "10 files with scattered magic hex" into "7 files with correct tokens + 1 audited file holding the 3 legitimately-literal values," which is easy to grep and review going forward, and matches the project's existing precedent (Decision 0042's additive, non-bleeding namespace pattern) of consolidating exceptions rather than leaving them scattered. `IssueLoanModal.tsx`'s `#fff` gets fixed to a real token (it's a genuine oversight, not a structural exception — likely wants `var(--color-on-primary)` or a new `--color-print-bg`, TBD at execution based on visual context). `any` types fixed via the `Table.tsx` generic relax (same as Strategy A — it's the correct fix regardless of which hex strategy is chosen, and is a 1-line, well-understood change). Full `px` triage as in Strategy A.

**Persona Lens:** Same as Strategy A for Jordan (full closure), with a cleaner long-term shape — future contributors have one obvious place (`theme-colors.ts`) to look for "why is this hex here" instead of hunting through SVGs and meta-tag code.

**Compliance:** Full guardrail closure, same as A, but the 3 structural exceptions are now centralized and auditable in one file instead of documented-in-place across three unrelated files — easier for a future compliance pass to verify nothing new snuck in.

**Trade-offs:** Same file-touch cost as Strategy A plus one new file; marginally more upfront design (deciding the constants-module shape) but pays down faster in future epics since "is this an approved exception" becomes a one-file check instead of a codebase grep.

**Estimated Scope:** Medium-Large — ~15 files (10 hex + `index.css` + `Table.tsx` + 2 `any`-fix files + new `theme-colors.ts`) + px triage + `design-system.md` update + 1 decision log entry.

---

## Recommendation

**Strategy C.** It closes the guardrail as completely as Strategy A, costs almost nothing extra over A (one small new file), and leaves the codebase in a better state for the *next* person who has to answer "is this hardcoded color allowed" — which, given this project's history of repeat hex/token QA passes (Cycle 24, E125, now E128), is a recurring question worth answering once, centrally, rather than a fourth time in a future cycle.
