# Plan: E67_INVENTORY_RECYCLE_BIN_PLAN

## Persona Impact Statement
- **Staff:** Gains a safety net against accidental deletions without needing to involve developers for database restoration.
- **Admin:** Maintains ultimate control over storage and data lifecycle by being able to clear the bin on demand.

## Compliance Checklist
- **Firebase Rules:** Ensure `status == 'deleted'` items are entirely inaccessible via public queries. Only staff roles should have read access.

## Schema Audit
- **items:** Update `ItemStatus` union type in `src/lib/types.ts` to include `'deleted'`. Add `deletedAt: timestamp | null` to the schema. Update `docs/firestore-schema.md`.

## Strategies

### Strategy A: Minimal
- Client-side soft delete only. No manual "Empty Bin" button, relying purely on a 30-day cron job.

### Strategy B: Recommended
- Full Soft Delete implementation.
- Add "Recycle Bin" tab alongside "Active" and "Drafts" in `/admin/inventory`.
- Create a new Cloud Function `clearRecycleBin` callable only by Admins.
- Add `purgeRecycledItems` to the existing daily scheduled functions to handle the 30-day cutoff.

### Strategy C: Robust
- Strategy B + Activity Feed logging of who deleted and who restored the item, and email alerts to Admins whenever the bin is cleared. (Deemed unnecessary overhead for this iteration).
