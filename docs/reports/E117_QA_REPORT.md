# QA Report — E117 · Inventory Photo Management

**Date:** 2026-06-12
**Cycle:** 33
**Status:** ✅ PASSED — Ready to merge

---

## Compiler & Lint Gates

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc -b + vite build) | ✅ PASS | Zero TypeScript errors. Built in 3.60s. |
| `npm run lint` | ✅ PASS | Zero ESLint errors and zero warnings. |
| `npm run test` | ✅ PASS | 29/29 tests pass. |
| `npx tsc -b` (functions/) | ✅ PASS | Zero errors. |

---

## Schema Audit

Two new `auditLogs.eventType` values registered:

| Event | Written by |
|-------|-----------|
| `item_photo_removed` | `removeItemImage` CF |
| `item_photos_reordered` | `reorderItemImages` CF |

**Schema sync: complete — `docs/firestore-schema.md` updated.**

No new Firestore fields. All operations use existing `items/{id}.images[]`.

---

## QA Blocking Issue Found & Fixed

**Makoonsii — touch target size:** Mobile thumbnail control buttons were initially coded at `34px` — below the 48px minimum. Fixed to `var(--space-12)` (48px) on both ★ and × controls.

**Token violations fixed:** `'9px'`, `'14px'`, `'16px'` font sizes replaced with `var(--text-xs)`, `var(--text-small)`, `var(--text-body)`. Hardcoded `'2px'` gaps/positions replaced with `var(--space-1)`. Transition replaced with `var(--motion-speed-fast) var(--motion-easing)`.

**Acceptable deviation:** `style={{ width: 200, height: 200 }}` on the QR code placeholder div. Content-driven — must match the `QRCode.toDataURL({ width: 200 })` canvas size exactly. No `--space-*` token exists for 200px. Staff-only surface.

---

## Feature Smoke Tests

### Desktop — `ImageUploadZone` photo controls

| Test | Result |
|------|--------|
| "Cover" badge appears on `images[0]` thumbnail | ✅ |
| ★ button visible on `images[1+]` thumbnails, hidden on index 0 | ✅ |
| × button visible on all thumbnails | ✅ |
| Clicking × calls `removeItemImage` CF and Firestore `arrayRemove` updates thumbnail list via `onSnapshot` | ✅ |
| Clicking ★ calls `reorderItemImages` with URL moved to front; `onSnapshot` reflects new cover order | ✅ |
| Both buttons disabled + thumbnails dimmed (opacity 0.5) during in-flight CF call (`isPhotoOp: true`) | ✅ |
| `photoOpError` shown below grid on CF failure | ✅ |
| "📱 Upload from Phone" button hidden when `isMobile === true` | ✅ |

### Desktop — QR Upload Bridge

| Test | Result |
|------|--------|
| "📱 Upload from Phone" button visible on desktop (≥768px) | ✅ |
| Clicking button generates QR code pointing to `/admin/item-photo/{itemId}` | ✅ |
| QR panel has close button (✕) | ✅ |
| Panel auto-closes when `imageCount` increases (new photo detected via `onSnapshot`) | ✅ |
| URL shown below QR code for manual copy | ✅ |

### QR Destination — `ItemPhotoPage`

| Test | Result |
|------|--------|
| Route `/admin/item-photo/:itemId` is `ProtectedRoute staffOnly` | ✅ |
| Page shows item title from `onSnapshot` | ✅ |
| `ImageUploadZone` renders in append mode (`extractData={false}`) | ✅ |
| Success banner "Photo saved — you can close this tab" appears after `images.length` increases | ✅ |
| Success banner replaces upload zone (not shown alongside it) | ✅ |

### Mobile — `MobileIntakePage` thumbnail grid

| Test | Result |
|------|--------|
| "Cover" badge on `images[0]` thumbnail | ✅ |
| ★ button (48×48px) visible on `images[1+]`, hidden on index 0 | ✅ |
| × button (48×48px) visible on all thumbnails | ✅ |
| Clicking × calls `removeItemImage` via `itemIdRef.current` | ✅ |
| Clicking ★ calls `reorderItemImages` with URL moved to front | ✅ |
| Thumbnails dimmed during in-flight call (`photoOpsLoading: true`) | ✅ |
| `photoOpsError` alert shown below grid on failure | ✅ |
| No QR bridge shown (mobile already has a camera) | ✅ |

---

## Persona Compliance Tests

### Marcus (primary)
- Per-photo × delete: available on desktop and mobile. Staff can remove blurry or poorly-lit shots without deleting the entire item. ✅
- ★ cover promotion: `images[0]` is the hero on `ItemDetailPage` and card thumbnails. Staff can promote the best shot. ✅
- QR bridge: desktop staff can use their phone camera for the better shot, then return to desktop seamlessly. ✅
- `extractData=false` on `ItemPhotoPage` — replacement photo does not overwrite existing description/price. ✅

### Makoonsii (staff operations)
- All mobile controls: `var(--space-12)` = 48px touch targets. Reachable one-handed in portrait mode. ✅
- Desktop controls: `minHeight: 44px` via `PHOTO_BTN` constant. ✅
- Loading state prevents double-taps causing race conditions. ✅

### Jordan (brand quality)
- Cover selection is intentional staff action — not algorithmic. ✅
- `aiDescription` not written or exposed by any E117 code path. ✅

---

## Compliance Checklist

| Requirement | Status |
|-------------|--------|
| No hardcoded hex in new code | ✅ |
| No `any` types — Firestore data typed as `Record<string, unknown>` | ✅ |
| No `console.log` in new files | ✅ |
| No unused imports or variables | ✅ |
| No new Firestore fields (schema unchanged) | ✅ |
| `auditLogs` written via CF Admin SDK only | ✅ |
| No PII in `auditLogs.details` | ✅ (`details: { itemId }` only) |
| New `eventType` values registered in `firestore-schema.md` | ✅ |
| `removeItemImage` + `reorderItemImages`: `isStaffToken` guard | ✅ |
| URL injection prevention in `reorderItemImages` (server-side set membership) | ✅ |
| `/admin/item-photo/:itemId` is `ProtectedRoute staffOnly` | ✅ |
| QR URL contains only `itemId` — no tokens, no PII | ✅ |
| `extractData={false}` on `ItemPhotoPage` — no unintended AI extraction | ✅ |
| `rare-find` / `limited-edition` not auto-applied | ✅ |
| AI API keys in Cloud Functions only | ✅ |
| Age gates at router level only | ✅ |
| `policeHold` not touched | ✅ |
| No motion violations (bounce, particle, constant animation) | ✅ |

---

## Files Changed

| File | Change |
|------|--------|
| `functions/operations/src/inventory.ts` | Added `removeItemImage` + `reorderItemImages` onCall CFs |
| `src/components/admin/ImageUploadZone.tsx` | Added photo controls (Cover badge, ★, ×), `isPhotoOp` state, `QRUploadBridge` integration |
| `src/components/admin/QRUploadBridge.tsx` | Created — QR code popover for desktop phone bridge |
| `src/pages/admin/ItemPhotoPage.tsx` | Created — QR bridge destination with `ProtectedRoute staffOnly` |
| `src/pages/admin/MobileIntakePage.tsx` | Added photo controls to capture-step thumbnail grid |
| `src/main.tsx` | Added `/admin/item-photo/:itemId` route |
| `docs/firestore-schema.md` | Added `item_photo_removed` + `item_photos_reordered` to `auditLogs.eventType` |
| `docs/projects/E117_PHOTO_MANAGEMENT.md` | Status → CLOSED |
| `docs/decisions/0035-e117-inventory-photo-management.md` | Decision log created |
| `user-guide/inventory/intake.md` | Photo management section added |
| `user-guide/inventory/mobile-intake.md` | Photo management section added |

---

## Sign-Off

All compiler gates pass. All persona smoke tests pass. All compliance requirements met. QA blocking issue (34px touch targets) found and fixed before close. Schema doc updated with new event types.

**QA PASSED. E117 ready to merge.**

---

*The Pawn Shop · docs/reports/E117_QA_REPORT.md · 2026-06-12*
