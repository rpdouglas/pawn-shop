# E105 — Admin Nav Refactor
**Status:** ✅ CLOSED — 2026-06-09
**Priority:** MEDIUM
**Effort:** Small — 2 files
**Cycle:** 32

---

## Problem

The desktop admin sidebar (`AdminSidebar.tsx`) is too cluttered to fit on a standard desktop window without scrolling. Specific issues:

1. **Overflow:** 20 nav items × 48px = 960px. With padding and dividers this exceeds 1042px (available height at 1080p minus 38px topbar). Items are cut off at the bottom.
2. **No visual grouping:** 6 groups separated only by thin 0.5px divider lines — groups are not visually distinct or self-labeling.
3. **Redundant "Intake" entry:** The ➕ Intake nav item links to `/admin/intake`, which duplicates the "Add new item" button already present in the Inventory view. Staff do not need a nav-level shortcut.
4. **Token violations:** Multiple hardcoded hex values (`#161000`, `#7a5e0a`, `#5a4508`, `#2e2200`, `#2a1f00`) and hardcoded font sizes (`18px`, `8px`) violate the design system rules.

## Goal

- Remove the redundant Intake (Add Item) nav entry.
- Make group structure visually clear with labeled headings.
- Allow sections to collapse so the nav fits on a standard desktop window without scrolling.
- Fix all token violations in the process.

## Personas Served

| Persona | Relevance |
|---------|-----------|
| **Staff (Primary)** | Admin dashboard must be navigable efficiently — scannable sections, no mandatory scrolling |
| **Makoonsii** | 48px touch targets maintained; keyboard navigation preserved |

## Out of Scope

- `AdminMobileNav.tsx` — mobile nav has its own compact structure; no change needed
- `AdminTopbar.tsx` — out of scope for this epic (separate token violations there)
- Route changes — `/admin/intake` route remains in router; only the nav link is removed

---

## Gate Results

| Check | Result |
|-------|--------|
| `npm run build` (frontend Vite + tsc) | ✅ PASS — built in 5.10s |
| `npx tsc -b` (functions) | ✅ PASS — zero errors |
| `npm run lint` (frontend ESLint) | ✅ PASS — zero errors, zero warnings |
| `npm run test` (frontend Vitest) | ✅ PASS — 29/29 tests, 8 test files |
| No hardcoded hex values | ✅ PASS — all 5 violations replaced with `var(--color-*)` and `color-mix()` |
| No hardcoded font sizes | ✅ PASS — `var(--text-body)`, `var(--text-small)`, `var(--text-xs)` used throughout |
| No hardcoded spacing | ✅ PASS — `var(--space-*)` tokens; `1px` divider lines are border treatments not spacing |
| 48px touch targets | ✅ PASS — `minHeight: var(--space-12)` on all nav items and group header buttons |
| `aria-expanded` on collapse toggles | ✅ PASS — each group button carries `aria-expanded` and descriptive `aria-label` |
| `/admin/intake` route preserved | ✅ PASS — only nav link removed; route still routable directly |
| `AdminMobileNav.tsx` untouched | ✅ PASS — mobile "Add Item" tab preserved |
| Decision logged | ✅ PASS — `docs/decisions/0013-admin-sidebar-accordion.md` |
| User guide updated | ✅ PASS — `user-guide/admin/portal.md` updated with new sidebar structure |
