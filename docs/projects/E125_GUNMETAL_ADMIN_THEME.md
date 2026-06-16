# E125 — Gunmetal Club Admin Theme
**Status:** ✅ CLOSED — 2026-06-16
**Priority:** MEDIUM
**Effort:** Medium (7 files)
**Cycle:** 33

---

## Problem

The current admin portal shell — particularly on mobile — uses the consumer-facing Pawn palette (`#080706` black background, Playfair Display, warm `#1A1714` surfaces). On an operational admin tool this reads as too dark and editorial rather than functional. The `AdminTopbar` has a hardcoded hex (`#1c1400`) that violates the design-token rule. The mobile bottom nav, inventory cards, and stat cards lack the legible, layered Gunmetal aesthetic that the `GunmetalClubAdmin.jsx` reference design demonstrates.

## Goal

Bring the admin portal — specifically the inventory view on mobile, and the overall shell — in line with the Gunmetal Club design token system documented in `docs/reports/gunmetal-club-design-tokens.md`, using `docs/reports/GunmetalClubAdmin.jsx` as the structural and visual reference.

## Personas Served

| Persona | Relevance |
|---|---|
| **Staff (all roles)** | Primary users of the admin interface. Cleaner operational palette improves scan speed on shop floor. |
| **Jordan** | Brand quality extends to internal tools. "Dapper. Debonair." standard must hold in the admin shell. |
| **Marcus** | Visual integrity of the admin reflects the premium positioning of the storefront. |

## Scope

- Mobile admin shell: top bar, bottom nav, inventory view (cards + toolbar)
- Desktop admin shell: stat cards on Dashboard, AdminTopbar (remove hardcoded hex)
- No changes to routing, Firestore reads/writes, Cloud Functions, or age gates

## Files Changed

| File | Change |
|------|--------|
| `src/styles/admin.css` | **NEW** — `--gmc-*` token namespace scoped to `.gmc-admin`; project token remapping within scope; `--color-error` gap closed |
| `src/components/layout/AdminLayout.tsx` | Import `admin.css`; add `gmc-admin` class to mobile and desktop containers; add `AdminTopbar` to mobile path |
| `src/components/layout/AdminTopbar.tsx` | Remove hardcoded `#1c1400`; 48px height; gold rule + wordmark; live dot + role badge + avatar initials |
| `src/components/layout/AdminMobileNav.tsx` | Slate background; `env(safe-area-inset-bottom)` bottom padding; gold active state; bold active labels |
| `src/components/admin/InventoryCard.tsx` | Hover lift (bg/border/shadow); Georgia price always gold; uppercase EDIT/ARCHIVE/DELETE/RESTORE; `var(--text-body)` token fix |
| `src/pages/admin/InventoryPage.tsx` | 4-cell stat strip; 🔍 icon search; status filter chips; section accent bar (3px gold rule + filtered count) |
| `src/pages/admin/DashboardPage.tsx` | `StatCard` compact: `--text-subheading` (24px), conditional gold on `value > 0`, `--space-3 --space-2` padding |

## Docs Updated

| Doc | Change |
|-----|--------|
| `docs/EPICS.md` | E125 tasks all ticked; CLOSED entry added |
| `docs/ACTIVE_CYCLE.md` | E125 row added to Completed This Cycle; Cycle Goal updated; footer timestamp updated |
| `docs/decisions/0042-gunmetal-club-admin-css-namespace.md` | Decision log — additive CSS namespace pattern |
| `docs/plans/E125_GUNMETAL_ADMIN_THEME_PLAN.md` | Full 3-strategy plan |
| `user-guide/admin/portal.md` | Topbar height + avatar; mobile nav GMC palette |
| `user-guide/admin/inventory.md` | Stat strip; icon search; accent bar; uppercase action labels |
| `user-guide/admin/dashboard.md` | Compact StatCard behaviour |

## Gate Results

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc -b + vite build) | ✅ PASS | Zero TypeScript errors. 474 modules transformed. |
| `npm run lint` | ✅ PASS | Zero ESLint errors and zero warnings. |
| `npm run test` | ✅ PASS | 29/29 tests pass. |
| `npx tsc -b` (functions/) | ✅ PASS | Zero errors. |
| Hardcoded hex audit | ✅ PASS | `#1c1400` removed from `AdminTopbar.tsx`. All new colour refs use `var(--gmc-*)` or `var(--color-*)`. |
| PII in logs audit | ✅ PASS | Avatar initials derived from `user.email.split('@')[0]` — never logged, never written to Firestore. |

---

*The Pawn Shop · docs/projects/E125_GUNMETAL_ADMIN_THEME.md · 2026-06-16*
