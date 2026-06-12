# E118 — Header Title Cleanup (Mobile Overflow Fix)
**Status:** 🔄 IN PROGRESS
**Priority:** LOW
**Effort:** TBD
**Cycle:** 33

---

## Problem

The `GlobalHeader` displays the current page title via `getPageTitle()` in `NavigationDrawer.tsx`. On vertical pages, the titles are:

- `/pawn` → `"The Pawn Shop - Pawn & Resale"`
- `/cannabis` → `"The Pawn Shop - Cannabis"`
- `/fireworks` → `"The Pawn Shop - Fireworks"`
- `/tobacco` → `"The Pawn Shop - Tobacco"`

On mobile viewports (≤375px), the hamburger button + long title + user avatar compete for horizontal space. The title truncates mid-brand-name or overflows. The result looks broken and off-brand — a direct failure against the Makoonsii trust standard.

## Planned Solution

Remove "The Pawn Shop - " prefix from vertical page titles in `getPageTitle()`. Leave only the vertical name: `"Pawn & Resale"`, `"Cannabis"`, `"Fireworks"`, `"Tobacco"`. The homepage (`/`) and admin (`/admin`) entries are addressed per the chosen strategy.

---

*The Pawn Shop · docs/projects/E118_HEADER_TITLE_CLEANUP.md · 2026-06-12*
