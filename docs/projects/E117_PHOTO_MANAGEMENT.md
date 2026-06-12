# E117 — Inventory Photo Management
**Status:** ✅ CLOSED — 2026-06-12
**Priority:** MEDIUM
**Effort:** TBD
**Cycle:** 33

---

## Problem

Once a photo is uploaded to an inventory item, there is no way to:
- Remove an individual photo that is blurry, poorly lit, or incorrect
- Set a primary "cover" photo (first image in the array is the hero, but cannot be changed)
- Replace a photo without deleting the entire item and starting over
- Upload a new photo via phone camera when staff are at a desktop workstation

The `ImageUploadZone` component shows uploaded photos as thumbnails but exposes zero controls on them — no delete, no reorder, no cover selection.

## Solution — Strategy B (Implemented)

Three strategies proposed in `docs/plans/E117_PHOTO_MANAGEMENT_PLAN.md`. Strategy B approved and implemented.

### Delivered

**Cloud Functions** (`functions/operations/src/inventory.ts`):
- `removeItemImage` — staff+, deletes Storage file + `arrayRemove` from `items/{id}.images`, audit log
- `reorderItemImages` — staff+, validates URL set membership, full array write, audit log

**Desktop** (`ImageUploadZone.tsx`):
- Cover badge on first image, ★ set-cover on remaining images, × delete on all
- Loading state (`isPhotoOp`) dims thumbnails during CF calls
- `QRUploadBridge` shown below thumbnails (desktop-only, hidden on mobile)

**QR Bridge** (`QRUploadBridge.tsx`):
- "📱 Upload from Phone" button generates QR code pointing to `/admin/item-photo/{itemId}`
- Auto-closes when desktop detects a new photo via real-time `onSnapshot`

**ItemPhotoPage** (`src/pages/admin/ItemPhotoPage.tsx`):
- QR bridge destination — `ProtectedRoute staffOnly`, real-time `onSnapshot` for item
- Renders `ImageUploadZone` with `extractData=false`
- Success banner: "Photo saved — you can close this tab"

**Mobile** (`MobileIntakePage.tsx`):
- Cover badge on first thumbnail, ★ set-cover on remaining, × delete on all
- No QR bridge (already have a camera)

**Route** (`main.tsx`):
- `/admin/item-photo/:itemId` → `ItemPhotoPage` (lazy-loaded)

---

## Gate Results

| Gate | Result |
|------|--------|
| `npm run build` | ✅ PASS — Zero TypeScript errors |
| `npm run lint` | ✅ PASS — Zero ESLint errors/warnings |
| `npm run test` | ✅ PASS — 29/29 tests |
| `npx tsc -b` (functions/) | ✅ PASS — Zero errors |
| Schema sync | ✅ Two new `auditLogs.eventType` values registered |
| QA blocking fix | ✅ Mobile buttons raised from 34px → `var(--space-12)` (48px) |
| Compliance | ✅ All requirements met |

---

*The Pawn Shop · docs/projects/E117_PHOTO_MANAGEMENT.md · 2026-06-12*
