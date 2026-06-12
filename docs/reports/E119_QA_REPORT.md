# QA Report — E119 · Edit Item Page (Single-Page Edit Flow)

**Date:** 2026-06-12
**Cycle:** 33
**Status:** ✅ PASSED — Ready to merge

---

## Compiler & Lint Gates

| Gate | Result | Notes |
|------|--------|-------|
| `npm run build` (tsc -b + vite build) | ✅ PASS | Zero TypeScript errors. |
| `npm run lint` | ✅ PASS | Zero ESLint errors and zero warnings. |
| `npm run test` | ✅ PASS | 29/29 tests pass. |
| `npx tsc -b` (functions/) | ✅ PASS | Zero errors. |

---

## Schema Audit

No new Firestore fields. No new Cloud Functions. No schema changes.

| Collection | Operation | Fields |
|---|---|---|
| `items/{id}` | read on mount + `onSnapshot` for images | All existing fields |
| `items/{id}` | `updateDoc` on save | `title`, `description`, `category`, `viewTag`, `price`, `condition`, `quantity`, `serialNumber`, `provenanceNotes`, `merchandisingTags`, `cannabisProfile`, `fireworksProfile`, `status`, `updatedAt` |
| `items/{id}/internal/staff` | `setDoc({ merge: true })` | `cost` |

**Schema sync: complete — no changes to `docs/firestore-schema.md` required.**

---

## Feature Smoke Tests

### Navigation

| Test | Result |
|------|--------|
| "Full Edit" button on `InventoryCard` routes to `/admin/item/:id/edit` | ✅ |
| Page loads item data on mount for an existing item | ✅ |
| "Back to Inventory" link returns to `/admin/inventory` | ✅ |
| Page is `ProtectedRoute staffOnly` — unauthenticated users redirected | ✅ |

### Photos Section

| Test | Result |
|------|--------|
| `images[0]` shows "Cover" badge | ✅ |
| ★ set-cover button visible on `images[1+]`, hidden on `images[0]` | ✅ |
| × delete button visible on all thumbnails | ✅ |
| × calls `removeItemImage` CF; `onSnapshot` removes thumbnail | ✅ |
| ★ calls `reorderItemImages` CF; `onSnapshot` reflects new cover order | ✅ |
| Photo op disabled state: thumbnails dimmed, ★/× disabled during in-flight call | ✅ |
| "Add Photo" button opens file picker; new photo uploaded via `processUploadedImage` CF with `extractData: false` | ✅ |
| Upload progress bar visible during upload | ✅ |

### Form Fields

| Test | Result |
|------|--------|
| Title, description, category, viewTag populated from Firestore on load | ✅ |
| Price and quantity populated; price displayed in dollars, saved in CAD cents | ✅ |
| Condition rendered as `<select>` dropdown (New / Like New / Good / Fair / Poor) | ✅ |
| Serial number and provenance notes fields present | ✅ |
| Cannabis Profile section visible only when `viewTag === 'cannabis'` | ✅ |
| Fireworks Profile section visible only when `viewTag === 'fireworks'` | ✅ |

### Save Action

| Test | Result |
|------|--------|
| "Save Changes" button calls `updateDoc` on `items/{id}` | ✅ |
| `cost` written to `items/{id}/internal/staff` via `setDoc({ merge: true })` | ✅ |
| "Saved!" confirmation appears after successful save, auto-clears after 3 seconds | ✅ |
| Save button shows "Saving…" and is disabled during in-flight mutation | ✅ |
| Error message shown on save failure | ✅ |

---

## Persona Compliance Tests

### Marcus (primary)
- Photos section is the first section on the page — above the fold on mobile. ✅
- ★ cover promotion and × delete controls present with the same CF-backed logic as E117. ✅
- New photo uploads always use `extractData: false` — existing staff-written data is never overwritten. ✅

### Staff / Inventory (primary)
- Changing a price, condition, or description requires zero wizard navigation — everything is on one scrollable page. ✅
- "Save Changes" CTA is unambiguous — no confusion with "Publish Item". ✅

### Makoonsii (secondary)
- All interactive controls meet the 48px touch target minimum (`minHeight: 48px` on inputs, buttons). ✅
- Condition dropdown is a single tap — no card-grid selector. ✅
- Single-column layout; no horizontal scrolling required. ✅

---

## Compliance Checklist

| Requirement | Status |
|-------------|--------|
| No hardcoded hex in new code | ✅ |
| No `any` types — Firestore data typed as `Record<string, unknown>` | ✅ |
| No `console.log` in new files | ✅ |
| No unused imports or variables | ✅ |
| No new Firestore fields (schema unchanged) | ✅ |
| `auditLogs` written via CF Admin SDK only (existing CFs handle audit events) | ✅ |
| No PII in logs | ✅ |
| `processUploadedImage` called with `extractData: false` in edit mode | ✅ |
| `aiDescription` never surfaced in edit UI | ✅ |
| `policeHold` not exposed in edit form (managed via inventory table) | ✅ |
| `rare-find` / `limited-edition` not auto-applied | ✅ |
| AI API keys in Cloud Functions only | ✅ |
| Age gates at router level only — `ProtectedRoute staffOnly` is not an age gate | ✅ |
| No motion violations (bounce, particle, constant animation) | ✅ |
| Prices stored as CAD cents (integer) | ✅ |

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/admin/EditItemPage.tsx` | Created — single-page edit form (~380 lines) |
| `src/main.tsx` | Added `/admin/item/:id/edit` lazy route |
| `src/components/admin/InventoryCard.tsx` | "Full Edit" link updated to `/admin/item/${item.id}/edit` |
| `docs/projects/E119_EDIT_ITEM_PAGE.md` | Status → CLOSED |
| `docs/decisions/0036-e119-edit-item-page.md` | Decision log created |
| `user-guide/admin/inventory.md` | "Full Edit" button description updated to reflect new route |

---

## Sign-Off

All compiler gates pass. All persona smoke tests pass. All compliance requirements met. No new schema fields, no new Cloud Functions, no new dependencies.

**QA PASSED. E119 ready to merge.**

---

*The Pawn Shop · docs/reports/E119_QA_REPORT.md · 2026-06-12*
