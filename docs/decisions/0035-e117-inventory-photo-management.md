# Decision 0035 — E117 Inventory Photo Management: Strategy B (Additive Controls + QR Desktop Bridge)

**Date:** 2026-06-12
**Epic:** E117 · Inventory Photo Management
**Cycle:** 33
**Status:** Implemented & Closed

---

## Context

Once a photo was uploaded to an inventory item, staff had no way to:
- Remove an individual photo without deleting the entire item
- Promote a better photo to the cover position (`images[0]` is the hero)
- Take a new photo using a phone camera when working at a desktop workstation

Three strategies were evaluated (see `docs/plans/E117_PHOTO_MANAGEMENT_PLAN.md`):
- **A:** Additive controls only (no QR bridge)
- **B:** Additive controls + QR desktop bridge + `ItemPhotoPage` destination
- **C:** Extracted `PhotoControls` shared component + QR bridge (refactor of both upload paths)

---

## Decision

**Strategy B: Additive Controls + QR Desktop Bridge.**

---

## Rationale

### 1. Strategy B over Strategy C — no refactor risk on working upload paths

`MobileIntakePage.tsx` has its own complete upload implementation separate from `ImageUploadZone.tsx`. Extracting a shared `PhotoControls` component (Strategy C) would require careful prop threading across two independently maintained upload state machines. Both paths are live and correct. The forcing function for that refactor belongs in the E73 Architecture Modernization backlog, not here.

Strategy B is purely additive to both rendering paths — no existing logic is moved or restructured.

### 2. QR bridge via `imageCount` prop — no polling

The QR popover auto-closes when a new photo lands on the desktop without any polling or extra Firestore listener. The parent `IntakeForm.tsx` already holds an `onSnapshot` on `items/{id}` to drive the `images[]` prop on `ImageUploadZone`. When that array grows, `imageCount` changes, and `QRUploadBridge` detects the delta via `useRef`. Zero additional subscriptions.

### 3. URL injection prevention — server-side set membership check

`reorderItemImages` reads the current `images[]` from Firestore before writing the new order. It validates:
1. `newImages.length === currentImages.length` — cannot add photos via reorder
2. Every URL in `newImages` exists in the current set — cannot inject cross-item or foreign URLs

This prevents a compromised staff client from promoting arbitrary Storage URLs into an item's photo array.

### 4. `extractData=false` on `ItemPhotoPage`

When staff use the QR bridge to add a replacement photo from their phone, AI extraction is disabled (`extractData={false}`). The item's title, description, and price were already set during the original intake — running AI extraction on a replacement shot would overwrite that work silently.

### 5. No new Firestore fields

All operations use the existing `items/{id}.images[]` field. `arrayRemove` handles individual removal; a full array write handles reorder. Two new `auditLogs.eventType` values were registered in `docs/firestore-schema.md`.

---

## Alternatives Rejected

| Option | Rejection Reason |
|--------|-----------------|
| Strategy A (no QR bridge) | Leaves the desk-to-phone photo gap open — Marcus standard cannot be met when staff only have their desktop and need a better camera shot |
| Strategy C (shared PhotoControls) | Refactors two working upload paths for architectural tidiness without a forcing function; regression risk against live intake flows |

---

## Compliance Notes

- `removeItemImage` and `reorderItemImages` are both `onCall` with `isStaffToken` guard — no client-side Firestore/Storage writes
- `item_photo_removed` and `item_photos_reordered` audit log events contain only `uid` + `itemId` — no PII
- `/admin/item-photo/:itemId` is `ProtectedRoute staffOnly` at the component level (staff-only route — no age gate required)
- QR URL contains only `itemId` — no session tokens, no sensitive data
- `extractData=false` on `ItemPhotoPage` — AI key routing unchanged, no new Gemini calls triggered by photo replacement

---

## New Dependencies

None. `qrcode` package was already installed (used by `QRLabel.tsx`).

---

## Files Introduced

- `src/components/admin/QRUploadBridge.tsx`
- `src/pages/admin/ItemPhotoPage.tsx`
- `functions/operations/src/inventory.ts` — `removeItemImage` + `reorderItemImages` appended

## Files Modified

- `src/components/admin/ImageUploadZone.tsx` — photo controls + QR bridge integration
- `src/pages/admin/MobileIntakePage.tsx` — photo controls on mobile thumbnail grid
- `src/main.tsx` — `/admin/item-photo/:itemId` route
- `docs/firestore-schema.md` — `item_photo_removed` + `item_photos_reordered` event types

---

*The Pawn Shop · docs/decisions/0035-e117-inventory-photo-management.md · 2026-06-12*
