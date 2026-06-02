# E52 Project Spec: Inventory Management CRUD

**Status:** Done — 2026-06-02

## Overview
Staff currently have no mechanism in the `/admin/inventory` UI (especially on mobile) to edit an existing item's details or delete it. While the `status: 'archived'` state exists, staff explicitly require the ability to permanently hard-delete items (especially accidental drafts or test items) to keep the database clean.

## Requirements
1. **Mobile & Desktop UI:** Add "Edit", "Archive", and "Delete" actions to the inventory items on both the mobile card view and desktop table view.
2. **Hard Deletion:** Deleting an item must permanently remove the document from Firestore, not just change its status. It must also clean up associated images in Firebase Storage to prevent orphaned blobs.
3. **Editing:** Staff should be able to update title, category, price, condition, etc.

## Persona Impact
- **Staff (Marie/Kevin):** Unblocks basic operational tasks. Gives them full control over their catalogue from their mobile devices while on the shop floor.

## Compliance
- Hard deletes should be restricted to `admin` or `manager` roles.
- `auditLogs` must capture the deletion event (`item_deleted`).
- Associated Storage files must be deleted to comply with data minimization principles.
