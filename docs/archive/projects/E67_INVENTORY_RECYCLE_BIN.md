# Project E67: Inventory Recycle Bin

**Status:** Closed
**Epic:** E67
**Primary Persona:** Staff, Admin

## Objective
Implement a soft-delete "Recycle Bin" for inventory items to prevent accidental data loss. Items should be retained for 30 days before permanent automated deletion, with an manual override for Admins to empty the bin instantly.

## Requirements
- **Soft Delete:** When a staff member deletes an item, its status should change to `deleted` and a `deletedAt` timestamp must be appended.
- **Recycle Bin UI:** Add a "Recycle Bin" tab to the Admin Inventory Dashboard. This tab should be visible to all staff members.
- **Restoration:** Staff members must be able to click a "Restore" button to return a deleted item to `draft` status.
- **Admin Override:** Provide an "Empty Recycle Bin" button exclusively visible to Admins that triggers a Cloud Function to permanently delete all items in the bin immediately.
- **Automated Purge:** A scheduled Cloud Function must automatically permanently delete any items that have been in the `deleted` state for more than 30 days.
