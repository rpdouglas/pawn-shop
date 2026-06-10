---
status: accepted
date: 2026-06-10
epic: FIX_PRINT_TICKET_BUGS
---

# 0026 — Print Ticket: Signature Image Preload & Due Date Defensive Fallback

## Context

Two bugs were reported after E110 shipped:

1. **Invalid Date on the printed ticket.** The `dueDate` field was `undefined` when the deployed Cloud Function had not yet been redeployed with the E110 changes (old CF does not return `dueDate` in its response). `new Date(undefined)` produces `Invalid Date`, which `toLocaleDateString` renders as the string "Invalid Date".

2. **Signature image missing from printed ticket.** `window.print()` was called inside a `useEffect` that fires after React's DOM commit. React has committed the portal markup at that point, but the browser has not yet fetched the remote Firebase Storage URL for the signature PNG. The print dialog captures the DOM synchronously — before the image bytes arrive — so the `<img>` tag renders blank.

## Decisions

### 1 — Due Date Defensive Fallback

`IssueLoanModal.tsx` now uses:
```typescript
dueDate: result.dueDate ? new Date(result.dueDate) : new Date(Date.now() + days * 24 * 60 * 60 * 1000),
```

The server-side value is preferred (canonical, drift-free). The client-side fallback fires only when the CF response does not include `dueDate` (pre-E110 CF build). This keeps the UI functional during rolling deploys where the frontend ships before the function build.

### 2 — Signature Image Preload Before `window.print()`

`PrintableTicket.tsx` now preloads the signature URL via a hidden `Image()` object before calling `window.print()`:
```typescript
useEffect(() => {
  if (!data) return
  const img = new window.Image()
  img.onload = () => window.print()
  img.onerror = () => window.print()
  img.src = data.signatureUrl
}, [data])
```

Creating an `Image()` with the same `src` forces the browser to fetch and cache the resource. When `window.print()` then fires from `onload`, the image is already in cache and the print engine can render it. The `onerror` handler ensures `window.print()` is still called even if the image fails to load, preserving the existing fallback behaviour.

## Alternatives Considered

- **`onLoad` event on the rendered `<img>` tag:** Requires managing a "ready" boolean across the `useEffect` and render path, and is fragile when `data` changes (stale state from prior print job). The hidden `Image()` approach is self-contained.
- **`setTimeout` delay before `window.print()`:** Brittle — adds arbitrary delay, still fails on slow connections.

## Consequences

- Print trigger is slightly delayed (network round-trip for the signature image) — this is imperceptible in practice since the image is small (<50 KB) and the user has already seen it during signing.
- If the signature storage URL ever becomes inaccessible, `onerror` still triggers print so staff can at least print the ticket without the signature image.

---

*The Pawn Shop · docs/decisions/0026-print-ticket-image-preload-and-duedate-fallback.md · 2026-06-10*
