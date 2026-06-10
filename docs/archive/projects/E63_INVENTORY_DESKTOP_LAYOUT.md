# Project E63: Inventory Desktop Layout Overhaul

**Status:** Closed
**Epic:** E63 — Admin UI Overhaul
**Primary Persona:** Staff (Tanya, Dale, Marc)

## Objective
Fix the horizontal scrolling issue on the Desktop Admin Inventory view by replacing the clunky table with a responsive grid of cards. Move search and filtering tools to a global top bar. Group items visually by Store View (Pawn, Cannabis, Fireworks).

## Requirements
- Move Search Bar and Status Filters out of the mobile-only block so they work on desktop.
- Replace the desktop `<table>` with a CSS Grid of product cards.
- Group the cards into sections by `viewTag`.
- When an item is clicked, open the AI Assistant in a right-side drawer instead of squishing the grid.
