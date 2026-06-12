# E117 — Inventory Photo Management Plan (Revised)

**Spec:** `docs/projects/E117_PHOTO_MANAGEMENT.md`
**Cycle:** 33
**Status:** Awaiting approval — revised to address mobile-first path

---

## Step 1 — Personas Served

**Primary: Marcus** — The Dapper Connoisseur  
Marcus applies the Photography Test. A blurry or poorly-composed photo blocks publication. Currently the only recourse is to delete the entire item and start over, losing all draft data. Marcus needs per-photo delete and the ability to promote a better shot to cover position.

**Primary: Staff (operational)**  
Staff use both desktop (`IntakeForm`) and mobile (`MobileIntakePage`). On desktop they sometimes need to take a better photo with their phone. On mobile they need to delete and replace a bad capture without losing the draft.

**Supporting: Jordan** — Brand quality. `images[0]` is the hero on `ItemDetailPage` and card thumbnails. Staff must control which photo leads.

**Makoonsii standard applied to staff tools:** All action buttons ≥44px touch targets. Controls must be reachable one-handed in portrait mode on mobile.

---

## Step 2 — Current State

### Two distinct upload paths (critical architectural fact)

| Path | Component | Upload Logic | Photo Thumbnails |
|---|---|---|---|
| **Desktop** | `IntakeForm.tsx` | Delegates to `ImageUploadZone.tsx` | Rendered by `ImageUploadZone` — zero controls |
| **Mobile** | `MobileIntakePage.tsx` | **Custom inline logic** (own file inputs, own upload task, own progress state) | Custom 72×72 thumbnail grid in the `capture` step — zero controls |

`MobileIntakePage` does **not** use `ImageUploadZone`. It has its own:
- `cameraRef` / `galleryRef` file inputs with `capture="environment"`
- `uploadFile` callback with its own progress tracking and `processUploadedImageFn` call
- `images` state via `onSnapshot` on `items/{id}`
- 72×72 thumbnail grid rendered at lines 820–837 with no controls

The mobile capture step's thumbnail grid and the desktop `ImageUploadZone` are entirely separate rendering paths. Any photo management work must address both.

### What exists in Storage

- Temp upload path: `items/{itemId}/uploads/{key}` — deleted by CF after processing  
- Final processed path: `items/{itemId}/images/{key}.webp` — public, watermarked WebP
- `items/{id}.images[]` — array of public Storage URLs. Index 0 = cover/hero.

### What's missing

- No `removeItemImage` CF — no way to delete a Storage file and remove its URL from `images[]`
- No `reorderItemImages` CF — no way to change the order of `images[]`
- No photo-level controls in any UI

---

## Step 3 — Schema Audit

| Collection | Op | Field | Existing? |
|---|---|---|---|
| `items/{id}` | Read | `images` array\<string\> | ✅ |
| `items/{id}` | Write | `images` (arrayRemove + full replace) | ✅ |
| `auditLogs` | Create | `item_photo_removed`, `item_photos_reordered` event types | ✅ (create-only append pattern) |

**No new Firestore fields required.**

---

## Step 4 — Competitor Research: Photo Management on Mobile

| System | Mobile Delete | Mobile Reorder | Mobile Camera Bridge |
|---|---|---|---|
| **Shopify** | Tap → × in photo grid | Drag (clunky on mobile) | Shopify app (separate native app) |
| **Square POS** | × per thumbnail in mobile app | Tap to reorder | Native iOS/Android app |
| **Poshmark** | Long-press → delete | Tap to promote as cover | Already mobile-first |
| **Depop** | × per thumbnail | Tap slot to replace | Already mobile-first |
| **eBay Seller** | × per thumbnail in mobile site | Limited drag | No bridge; just mobile site |
| **Mercari** | × per thumbnail | First slot = cover | Mobile-first only |

**Mobile UX pattern consensus:** On mobile, drag-to-reorder is frustrating (fat finger problem). The better pattern is: **× to delete, ★ to promote to cover**. Add more photos via existing camera/gallery buttons. This is what Poshmark, Depop, and Mercari all do.

**Desktop-to-phone bridge:** Not common in mobile-native systems. Google Forms and some document tools use this for users at a desktop who want to capture something with their phone. For a brick-and-mortar POS context (item on counter, staff at desktop), it's genuinely useful.

---

## Step 5 — Three-Strategy Proposal

---

### Strategy A: Additive Photo Controls, Both Paths (No QR Bridge) · Small

The simplest possible fix: add delete + cover controls to both the desktop and mobile thumbnail grids. No new routes, no QR bridge.

**Architecture:**

*Shared Cloud Functions (new, in `functions/operations/src/inventory.ts`):*
- `removeItemImage` callable — staff+, accepts `{ itemId, imageUrl }`, calls `deleteObject` on Storage, calls `arrayRemove` on `items/{id}.images`, writes `item_photo_removed` audit log
- `reorderItemImages` callable — staff+, accepts `{ itemId, images: string[] }`, validates all URLs start with `items/{itemId}/images/`, writes new `images[]` array wholesale, writes `item_photos_reordered` audit log

*Desktop (`ImageUploadZone.tsx`):*
- Add ×/delete button and ↑/↓ arrows to each image in the `uploaded-images-list` section
- "★ Cover" moves URL to index 0 via `reorderItemImages`
- ×/delete calls `removeItemImage`

*Mobile (`MobileIntakePage.tsx`):*
- Add ×/delete and "★ Cover" buttons to the 72×72 thumbnail grid (capture step, lines 820–837)
- Same two CF calls
- No ↑/↓ arrows on mobile — cover star is sufficient for most cases

**Persona Lens:**
- Marcus: can delete bad shots on either device, promote the best to cover
- Staff: works in the workflow they're already in (no new routes or context switches)
- Makoonsii: 44px tap targets on mobile controls

**Compliance:**
- All mutations through Cloud Functions — no client-side Storage/Firestore writes
- Audit log events on every photo removal and reorder
- No PII in logs

**Trade-offs:**
- ✅ Smallest scope; touches only existing UI components + adds CFs
- ✅ No regression risk to the core upload flows (additive only)
- ✅ No new routes, no new auth surface
- ❌ Desktop staff still can't take a quick phone photo when at a workstation
- ❌ Two separate rendering paths maintain slight logic duplication

**Estimated Scope:** Small — 3 files (`ImageUploadZone.tsx`, `MobileIntakePage.tsx`, `inventory.ts`) + audit log enum update. ~1 developer-day.

---

### Strategy B: Additive Controls + QR Desktop Bridge · Medium ⭐ RECOMMENDED

Everything in Strategy A, plus a QR-code-initiated phone upload session from the desktop. Mobile gets the same direct controls as Strategy A.

**Architecture additions over Strategy A:**

*QR Bridge component (`src/components/admin/QRUploadBridge.tsx`):*
- Accepts `itemId`, `images` (to detect when a new photo arrives and auto-close)
- Generates QR using existing `qrcode` package pointing to `/admin/item-photo/{itemId}`
- Renders as a popover triggered by a "📱 Upload from Phone" button in `ImageUploadZone` (desktop view only — hidden on mobile via the existing `isMobile` state)
- Auto-closes when `images.length` increases (parent passes it via props — same pattern used elsewhere)

*New route + page (`src/pages/admin/ItemPhotoPage.tsx` + route in `main.tsx`):*
- `ProtectedRoute staffOnly` — staff must be signed in on their phone (Firebase Auth persists)
- Reads `items/{id}` for title + `viewTag` context
- Renders existing `ImageUploadZone` in "append mode": `extractData=false`, `itemId` pre-set from URL param
- Shows current item photos with delete/cover controls (same controls added to `ImageUploadZone` in Strategy A)
- Success state: "Photo saved — you can close this tab" (shown after `images.length` increases)
- Auth fallback: if not signed in, `ProtectedRoute` redirects to `/login?redirect=/admin/item-photo/{itemId}` — existing redirect pattern

*Mobile (`MobileIntakePage.tsx`):*
- Same additive controls as Strategy A (× delete + ★ cover)
- **No QR bridge on mobile** — they already have a camera. The existing "📷 Take Photo" / "Choose from Library" buttons handle adding more photos.

**Device matrix:**

| Device | Delete | Set Cover | Add More Photos | Phone Bridge |
|---|---|---|---|---|
| Desktop (`IntakeForm`) | ✅ × per thumbnail | ✅ ★ promote | ✅ Drop zone / file picker | ✅ QR code |
| Mobile (`MobileIntakePage`) | ✅ × per thumbnail | ✅ ★ promote | ✅ Take Photo / Library buttons | — (not needed) |
| Phone via QR (`ItemPhotoPage`) | ✅ × per thumbnail | ✅ ★ promote | ✅ Camera / Library via `ImageUploadZone` | — (you're already here) |

**Persona Lens:**
- Marcus: best photo UX on any device — delete bad shots, promote cover, use phone camera for better quality when at desk
- Staff: zero workflow disruption. Controls appear inline where staff already are.
- Jordan: cover photo selection is intentional — brand quality maintained

**Compliance:**
- `/admin/item-photo/:itemId` is `ProtectedRoute staffOnly` — router-level auth gate
- No new Firestore fields, no PII in logs
- All mutations via Cloud Functions
- QR URL contains only itemId — no tokens, no sensitive data

**Trade-offs:**
- ✅ Closes both the delete/cover gap AND the desk-to-phone photo gap
- ✅ `qrcode` already installed — zero new npm dependencies
- ✅ Real-time update means desktop auto-reflects new phone photo (existing `onSnapshot`)
- ✅ Mobile path is explicitly designed for one-handed use — no QR distraction for mobile users
- ❌ Requires staff to be signed in on their phone to use the QR bridge
- ❌ Slightly more scope than Strategy A (~5 files vs ~3)
- ❌ `ItemPhotoPage` is thin but still a new surface to test

**Estimated Scope:** Medium — ~5 files (`ImageUploadZone.tsx`, `MobileIntakePage.tsx`, `QRUploadBridge.tsx`, `ItemPhotoPage.tsx`, `inventory.ts`) + route addition in `main.tsx`. ~1.5–2 developer-days.

---

### Strategy C: Extracted PhotoControls Component + QR Bridge · Medium-Large

An architecturally cleaner version of Strategy B that extracts a shared `PhotoControls` component to eliminate the duplication between `ImageUploadZone` and `MobileIntakePage`. This is the right long-term architecture but carries refactor risk against two working paths.

**Architecture:**

*New `src/components/admin/PhotoControls.tsx`:*
- Accepts `images: string[]`, `onRemove(url)`, `onSetCover(url)`, `onMoveUp(url)`, `onMoveDown(url)`
- Renders the thumbnail grid with all controls
- Used in both `ImageUploadZone` (replacing `uploaded-images-list` section) and `MobileIntakePage` (replacing the capture-step thumbnail grid)
- Same component, adapts controls to context via props (`showReorder?: boolean`, `thumbnailSize?: number`)

*`ImageUploadZone.tsx`:*
- Replaces `uploaded-images-list` section with `<PhotoControls>` component
- Adds "📱 Upload from Phone" button with `QRUploadBridge`
- Adds `onRemoveImage` / `onReorderImages` CF callables

*`MobileIntakePage.tsx`:*
- Replaces the 72×72 thumbnail grid with `<PhotoControls thumbnailSize={72} showReorder={false} />`
- CF calls routed through same hooks

*Shared CFs:* Same `removeItemImage` + `reorderItemImages` as Strategy A/B.

**Persona Lens:** Same as Strategy B.

**Compliance:** Same as Strategy B.

**Trade-offs:**
- ✅ Single source of truth for photo controls — future changes maintained in one place
- ✅ Consistent UX between desktop and mobile (renders identically, just different sizes)
- ✅ Easier to add features later (e.g., lightbox on tap, bulk select)
- ❌ Extracting logic from two separate working upload flows carries refactor risk
- ❌ `MobileIntakePage`'s thumbnail grid is tightly coupled to its upload state management — extracting requires careful prop threading
- ❌ More scope than the immediate need warrants (this aligns better with E73 Architecture Modernization backlog item)

**Estimated Scope:** Medium-Large — ~6 files (`PhotoControls.tsx`, `ImageUploadZone.tsx`, `MobileIntakePage.tsx`, `QRUploadBridge.tsx`, `ItemPhotoPage.tsx`, `inventory.ts`) + route in `main.tsx`. ~2.5 developer-days.

---

## Step 6 — Anti-Regression Check

| Check | A | B | C |
|---|---|---|---|
| No hardcoded hex | ✅ | ✅ | ✅ |
| No invented Firestore fields | ✅ | ✅ | ✅ |
| AI keys never on client | ✅ | ✅ | ✅ |
| No auto-applied scarcity tags | ✅ | ✅ | ✅ |
| No PII in logs | ✅ | ✅ | ✅ |
| Age gates at router level only | ✅ | ✅ | ✅ |
| No prohibited motion | ✅ | ✅ | ✅ |
| No regression to mobile upload core flow | ✅ additive | ✅ additive | ⚠️ extracts from working paths — regression risk |

**Strategy B additional checks:**
- `/admin/item-photo/:itemId` must be `ProtectedRoute staffOnly` (router level) ✅
- QR URL contains only `itemId` (no session tokens, no PII) ✅
- `ItemPhotoPage` calls same `processUploadedImage` CF as all other paths ✅

---

## Step 7 — Recommendation

**Strategy B** is recommended.

The additive approach (A + desktop QR bridge) closes both gaps without touching the working upload core logic in `MobileIntakePage`. Mobile users get the direct controls they need (× delete, ★ cover) without any change to the established camera flow. Desktop users get the same controls plus the ability to use their phone camera when they're at a workstation. `ItemPhotoPage` is a thin, purpose-built page that re-uses `ImageUploadZone` — it's a small surface with clear scope.

Strategy C is the architecturally superior long-term choice, but refactoring two working upload paths without a strong forcing function is premature given the E73 modernization work already in the backlog.

---

## Step 8 — Implementation Tasks (Strategy B, if approved)

### Phase 1: Cloud Functions
1. `removeItemImage` callable CF in `functions/operations/src/inventory.ts`
   - Staff+ role check
   - Extract Storage path from URL (parse `items/{itemId}/images/{file}` from the public URL)
   - `deleteObject(storageRef)` — graceful if file already gone
   - `FieldValue.arrayRemove(imageUrl)` on `items/{id}.images`
   - `item_photo_removed` audit log (itemId + uid, no PII)
2. `reorderItemImages` callable CF in `functions/operations/src/inventory.ts`
   - Staff+ role check
   - Validate: `images` array length ≤ existing `images[]` length (no injecting new URLs)
   - Validate: every URL starts with `items/{itemId}/images/` (no cross-item URL injection)
   - `update({ images: payload.images, updatedAt: serverTimestamp() })`
   - `item_photos_reordered` audit log

### Phase 2: Desktop Controls (ImageUploadZone)
3. Update `ImageUploadZone.tsx` — `uploaded-images-list` section:
   - × delete button per image (calls `removeItemImage`, then removes from parent state)
   - ↑/↓ buttons per image (calls `reorderItemImages` with new order)
   - "★ Cover" button on images that are not index 0 (calls `reorderItemImages` with URL moved to front)
   - Desktop-only: "📱 Upload from Phone" button (renders `QRUploadBridge` inline)
   - All buttons `minHeight: 44px`, all design tokens, no hardcoded values

### Phase 3: Desktop QR Bridge
4. Create `src/components/admin/QRUploadBridge.tsx`:
   - Props: `itemId: string`, `imageCount: number`
   - Generates QR URL: `${window.location.origin}/admin/item-photo/${itemId}`
   - Shows QR code in a small inline popover card (not a full Modal)
   - Instruction copy: "Scan with your phone — must be signed in to staff account"
   - Auto-closes when `imageCount` increases (parent watches `images.length`)
   - Dismiss button (×) with `minHeight: 44px`

### Phase 4: ItemPhotoPage (QR destination)
5. Create `src/pages/admin/ItemPhotoPage.tsx`:
   - `ProtectedRoute staffOnly`
   - Reads `itemId` from URL params
   - `onSnapshot(items/{itemId})` for `images[]` (same real-time pattern as `MobileIntakePage`)
   - Renders item title + "Adding photo to: {title}" header
   - `ImageUploadZone` with `itemId`, `images`, `extractData=false` (replacement photo — no AI)
   - Success banner: "Photo saved — you can close this tab" (shown after `images.length` increases above initial value)
6. Add `/admin/item-photo/:itemId` route to `main.tsx` (after other admin routes)

### Phase 5: Mobile Controls (MobileIntakePage)
7. Update `MobileIntakePage.tsx` — capture step thumbnail grid (lines 820–837):
   - Wrap each thumbnail `<li>` in a position-relative container
   - Add × delete button (top-right corner, 44×44px, calls `removeItemImage`)
   - Add "★" cover button (bottom-left, 44×44px, visible only on images not at index 0, calls `reorderItemImages`)
   - No ↑/↓ arrows on mobile — cover star is sufficient
   - Import and wire `removeItemImageFn` + `reorderItemImagesFn` callables (same as desktop)

### Phase 6: Compiler Gate
8. Run `npm run build` + `npx tsc -b` — zero errors/warnings gate

---

*The Pawn Shop · docs/plans/E117_PHOTO_MANAGEMENT_PLAN.md · 2026-06-12 (revised)*
