# E127 — Shop Menu Component Refactor · Plan

**Status:** AWAITING STRATEGY APPROVAL  
**Feature:** Refactor static Brother POS script embed to a React-friendly dynamic loading component  
**Spec:** `docs/projects/E127_BROTHER_POS_EMBED.md`  
**Author:** Antigravity · 2026-07-06  

---

## Step 1 — State Read Summary

### Current Script Embedding in `PawnPage.tsx`
Currently, `PawnPage.tsx` uses a static `<script>` tag within the JSX returned by the component:
```tsx
<div id="brotherpos-shop">
  <script
    src="https://thepawnshop.trafficstores.ca/shop/embed.js"
    data-mode="menu"
    async
  />
</div>
```
This is a standard React anti-pattern:
1. Static script tags inside JSX do not run/load reliably during client-side navigation.
2. React's virtual DOM reconciliation might bypass executing dynamic scripts when rendering client-side.
3. If navigation happens away and back to the page, multiple script executions or state collisions can happen without cleanup.

---

## Step 2 — Persona Gate

| Persona | Test | Strategy A | Strategy B | Strategy C |
|---|---|---|---|---|
| **Sandra** (Primary) | Smooth navigation, no widget flickering or duplicate renders | ❌ Flickering/fails on client navigation | ✅ Smooth load & cleanup | ✅ Smooth load, loading spinner, error feedback |
| **Dale** (Primary) | Direct accurate view of current shop stock | ⚠️ Fails to load on back-and-forth navigations | ✅ Always loads correctly | ✅ Always loads correctly |
| **Jordan** (Secondary) | Consistent UI experience and zero layout crashes | ❌ Visual bugs/duplicate widgets | ✅ Clean DOM on navigate-out | ✅ Clean DOM + loading visual feedback |

---

## Step 3 — Schema Audit

No Firestore schema modifications are required for this refactor.

---

## Step 4 — Three Strategies

### Strategy A: Inline `useEffect` Loading (Minimal)
**Scope:** Small · Modify 1 file (`PawnPage.tsx`)
**Approach:** Inlines script creation inside `useEffect` directly inside `PawnPage.tsx`.

*   **Implementation:**
    ```tsx
    useEffect(() => {
      const s = document.createElement("script");
      s.src = "https://thepawnshop.trafficstores.ca/shop/embed.js";
      s.async = true;
      s.dataset.mode = "menu";
      document.getElementById("brotherpos-shop")?.appendChild(s);
    }, []);
    ```
*   **Pros:** Minimal changes, fits in single file.
*   **Cons:** No script cleanup on page unmount (script remains in DOM, leading to potential duplicate tags or widget state leakage when returning to `/pawn`), and direct global DOM manipulation using `document.getElementById` which is non-idiomatic React.

---

### Strategy B: Dedicated `ShopMenu` Component with Ref & Cleanup (Recommended)
**Scope:** Medium · Modify `PawnPage.tsx`, Create `src/components/pawn/ShopMenu.tsx`
**Approach:** Creates a reusable `ShopMenu.tsx` component that uses React `useRef` to manage mounting and provides cleanup handlers on unmount.

*   **Implementation:**
    ```tsx
    import { useEffect, useRef } from 'react';

    export default function ShopMenu() {
      const containerRef = useRef<HTMLDivElement>(null);

      useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Prevent duplicate script injection
        const existingScript = container.querySelector('script[src*="embed.js"]');
        if (existingScript) return;

        const s = document.createElement('script');
        s.src = 'https://thepawnshop.trafficstores.ca/shop/embed.js';
        s.async = true;
        s.dataset.mode = 'menu';
        container.appendChild(s);

        return () => {
          s.remove();
          container.innerHTML = '';
        };
      }, []);

      return <div id="brotherpos-shop" ref={containerRef} />;
    }
    ```
*   **Pros:** Highly modular. Avoids global DOM queries via `useRef`. Safely prevents duplicate script instances. Removes the script tag and clears the container inner HTML completely on unmount.
*   **Cons:** Needs a new component file.

---

### Strategy C: Robust `ShopMenu` with Loading State & Error Boundary (Robust)
**Scope:** Large · Modify `PawnPage.tsx`, Create `src/components/pawn/ShopMenu.tsx`
**Approach:** Extends Strategy B by adding a loading visual state and handling script loading errors (e.g., if the CDN/script goes down or fails with a 404).

*   **Implementation:**
    Adds a `loading` state, `onerror` listener on the script, and renders a loading spinner or a fallback message if the script fails to load.
*   **Pros:** Best user experience; prevents blank screens if script is offline (which occurred during earlier phases).
*   **Cons:** More complex code, requires styling local loading states.

---

## Step 5 — Anti-Regression Check

*   **Hardcoded hex values:** None introduced. All styled elements (if any) will use standard css tokens (e.g. `var(--color-primary)`).
*   **A11y:** The container will preserve proper accessibility attributes.
*   **TypeScript & Linting:** Full compliance.

---

## Recommendation

**Strategy B** is recommended as it provides the optimal balance of React best practices (no global DOM lookups, proper unmount cleanup) and simplicity. If the user wishes to have fallback/error screens, Strategy C is preferred.
