# E52_INVENTORY_MANAGEMENT_PLAN

## Phase 1 — Persona & Compliance Gate
- **Primary Persona:** Staff (Marie / Kevin). They need immediate, mobile-friendly control over the inventory while walking the floor.
- **Compliance Audit:** Hard deleting an item must trigger an `auditLogs` event (`item_deleted`). It must be protected via backend custom claims (manager/admin only) so a compromised regular staff account cannot wipe the database. Any images in Firebase Storage must be deleted to prevent unbounded storage costs and orphan data.

## Phase 2 — Schema Audit
- **Collections Impacted:** `items/{id}`, `items/{id}/internal/*`, `auditLogs`. 
- **Storage Impacted:** `items/{id}/uploads/*`.

## Phase 3 — Three-Strategy Proposal

### Strategy A: Minimal (Client-Side Deletion)
Add a "Delete" button that calls `deleteDoc(doc(db, 'items', id))` directly from the frontend.
* **Persona:** Unblocks Staff quickly.
* **Compliance:** Fails. Leaves orphaned images in Storage and orphaned internal subcollections. Does not guarantee an audit log entry.

### Strategy B: Recommended (Cloud Function Deletion)
Create a `deleteInventoryItem` HTTPS Callable Cloud Function. It verifies `manager` or `admin` role, recursively deletes the item document and its `internal/` subcollections, deletes the corresponding `items/{id}/` prefix in Firebase Storage, and writes to `auditLogs`. Add an action menu (Edit/Archive/Delete) to the mobile cards and desktop table.
* **Persona:** Staff get a safe, clean deletion mechanism from any device.
* **Compliance:** Passes. Storage is cleaned, roles are enforced, and an audit log is guaranteed.
* **Scope:** Medium. Requires 1 new Cloud Function and UI updates to `InventoryPage`.

### Strategy C: Robust (Soft-Delete with TTL Purge)
UI triggers a status change to `status: 'pending_deletion'`. A scheduled Cloud Function purges these items 30 days later, cleaning up Storage and foreign keys (`reservations`, `savedSearches`).
* **Persona:** Slower feedback loop, but safer against accidental clicks.
* **Compliance:** Excellent, but over-engineered for the user's explicit request to "delete not archive".

**Recommendation:** Strategy B. It directly satisfies the user's request for a true hard-delete while securely handling the cleanup logic on the backend.

## Phase 4 — Anti-Regression Protocol
- No PII involved in inventory deletion.
- No brand voice violations.
- Age gates are not impacted.
- Explicitly avoiding Strategy A to prevent Firebase Storage orphan bloat.
