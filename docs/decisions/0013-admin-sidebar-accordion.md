# Decision 0013 — E105 Admin Nav Refactor: Collapsible Labeled Sidebar (Strategy C)

**Date:** 2026-06-09
**Epic:** E105 · Admin Nav Refactor
**Cycle:** 32
**Status:** Implemented & Closed

---

## Context

The admin desktop sidebar (`AdminSidebar.tsx`) had three compounding problems:

1. **54px icon-only strip** — group membership was not visible without hovering; first-word-only labels (`Social` instead of `Social Media`) were opaque.
2. **Overflow at 1080p** — 20 items × 48px ≈ 960px + dividers + padding ≈ 1024px; exceeded available height on most desktop windows.
3. **Redundant "Intake" entry** — `/admin/intake` was duplicated in the sidebar while `InventoryPage` already provides a fixed "Add Item" button.

Three strategies were evaluated:

- **A:** Wider labeled sidebar (210px) — no collapse; still overflowed 62px at 1080p with group headings
- **B:** Collapsible icon-only groups — kept 54px strip; discoverability unchanged
- **C:** Wider labeled sidebar + collapsible groups — solved both problems

---

## Decision

**Strategy C: 210px labeled sidebar with collapsible accordion groups.**

---

## Rationale

1. **Labeled items eliminate tooltip dependency.** With a 210px sidebar, every item shows its full label at all times. Staff don't need to hover to know what "📱" means — "Social Media" is always visible.

2. **Smart defaults fit 1080p without scrolling.** Operations, Customer, and People open by default (11 items = 720px total including headers and dividers). Content, Config, and Support collapse to their header rows only. The default state fits inside 1042px (1080p − 38px topbar).

3. **Collapsibility is staff-controlled.** Any group expands or collapses in one click. Staff who use Content frequently can keep it open; others don't pay the vertical cost.

4. **Token compliance achieved as part of the refactor.** All five hardcoded hex values (`#161000`, `#7a5e0a`, `#5a4508`, `#2e2200`, `#2a1f00`) and three hardcoded font/spacing values replaced with `var(--color-*)` and `var(--text-*)` tokens.

5. **`color-mix()` for derived muted-gold tones.** Where the design system lacks an explicit "muted primary" token, `color-mix(in srgb, var(--color-primary) 50%, transparent)` produces the correct visual weight without introducing new hardcoded values.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|-----------------|
| Strategy A (labeled, no collapse) | Labeled headings add ~120px to total height; sidebar still overflows ~62px at 1080p |
| Strategy B (collapsible icon-only) | Retains the discoverability problem — staff still must know which group a screen belongs to by icon alone |

---

## Accessibility Notes

- Group header buttons carry `aria-expanded={true | false}` and `aria-label` describing section name and state.
- All nav links retain `aria-label` with the full item name.
- All interactive elements maintain `minHeight: var(--space-12)` (48px) touch targets.
- Chevron rotation uses `transform` with `var(--motion-speed-fast)` — approved motion pattern.

---

## Files Changed

- `src/components/layout/AdminSidebar.tsx` — complete rewrite with accordion state, token fixes, labeled items
- `src/components/layout/AdminLayout.tsx` — `gridTemplateColumns` updated from `54px 1fr` to `210px 1fr`

---

*The Pawn Shop · docs/decisions/0013-admin-sidebar-accordion.md · 2026-06-09*
