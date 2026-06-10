# E55 Project Spec: Edit Inventory Item

**Status:** Done — 2026-06-03

## Overview
Currently, the admin portal (`InventoryPage.tsx`) provides actions for Archive, Delete, and AI Help, but lacks a standard "Edit" function to manually update an item's details (such as price, condition, or description) after it has been published. Staff need a way to edit existing inventory items from both the desktop and mobile views.

## Requirements
1. **Routing:** Add an edit route for inventory items (e.g., `/admin/inventory/edit/:id`).
2. **Edit Interface:** Create or adapt an interface that loads an existing item's data and allows staff to modify its fields (Title, Category, View, Description, Price, Stock, Condition, Merchandising Tags).
3. **Inventory Page Integration:** Add an "Edit" button to both the mobile cards and the desktop table in `InventoryPage.tsx`.

## Persona Impact
- **Staff (Sandra/Dale/Admin):** Crucial for daily operations. If a price changes, a typo was made in a description, or an item's condition degrades, staff must be able to update the listing without deleting and recreating the item from scratch.

## Compliance
- Editing an item must trigger a Firestore update operation that is appropriately authenticated (Staff only).
- Changes to age-gated items (Cannabis/Fireworks) must not inadvertently clear compliance fields.
