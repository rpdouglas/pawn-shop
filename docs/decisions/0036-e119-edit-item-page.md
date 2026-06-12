---
id: "0036"
title: Dedicated single-page edit route instead of wizard fork
date: 2026-06-12
epic: E119
status: accepted
---

## Context

Editing an existing inventory item on mobile routed through `MobileIntakePage.tsx` — a 1,234-line three-step wizard (`capture → details → review → published`). When `initialItemId` was set the wizard jumped to step 2 (details), but photos were only shown on step 1, condition used a card-grid selector, and the final CTA read "Publish Item" rather than "Save Changes". Desktop edit via `IntakePage.tsx` was a separate, inconsistent code path.

## Decision

Create a new dedicated route `/admin/item/:id/edit` with its own page component (`EditItemPage.tsx`). The page is a single scrollable form — no step state machine — with sections for Photos (add / delete / promote to cover), Item Details, Pricing & Stock, Condition & Details, Cannabis Profile, Fireworks Profile, and Actions. Condition is rendered as a `<select>` dropdown instead of the `ConditionSelector` card-button grid, saving vertical space. Both old wizard-based edit routes (`/admin/intake/edit/:id`, `/admin/mobile-intake/edit/:id`) remain intact for backward compatibility but `InventoryCard.tsx` now links to the new route.

## Alternatives Considered

**Strategy B — isEditMode branch inside MobileIntakePage:** Zero new files but makes an already 1,234-line component harder to read; semantic mismatch (the page is for "intake", not "editing"); desktop inconsistency not resolved.

**Strategy C — shared ItemAttributesForm component:** Extracts reusable form logic into a shared component. Over-engineered relative to the current ask; E73 already owns the shared form refactor; extraction risk on a 1,234-line file was not warranted for this scope.

## Consequences

- `EditItemPage.tsx` (~380 lines) is the only new file to maintain. Upload logic is partially duplicated from `MobileIntakePage` — acceptable given scope; a future E73 extraction pass can unify them.
- `extractData: false` is always passed to `processUploadedImage` when adding photos in edit mode — the item already has staff-written data and AI extraction must not overwrite it.
- Both old wizard edit routes remain accessible; no redirects needed.
- The edit experience is now identical on mobile and desktop.

---

*The Pawn Shop · docs/decisions/0036-e119-edit-item-page.md · 2026-06-12*
