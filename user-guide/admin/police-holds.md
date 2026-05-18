# Police Holds

The **Police Hold** is a master safety override for all inventory items.

## Purpose
A Police Hold is used when an item is under legal investigation, reported stolen, or requires immediate removal from public visibility for security reasons.

## How it Works
1.  **Staff Activation:** Authorized staff can toggle the `Police Hold` flag on any item document.
2.  **Instant Removal:** Once active, the item is immediately hidden from all customer-facing storefronts, discovery grids, and search results.
3.  **Override Status:** The hold overrides any other status. Even if an item is `Active` or `Reserved`, it will be unreachable by the public.

## Security Controls
- **Admin Only:** Only Managers and Admins can lift a Police Hold.
- **Audit Trace:** Every hold placed or lifted is automatically recorded in the **Audit Logs** with a timestamp and the UID of the staff member responsible.
