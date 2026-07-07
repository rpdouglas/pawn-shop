# E127 — Shop Menu Parameters Update · Plan

**Status:** AWAITING STRATEGY APPROVAL  
**Feature:** Update script parameters in `ShopMenu.tsx` to scope by revenue center, category, and theme.  
**Spec:** `docs/projects/E127_BROTHER_POS_EMBED.md`  
**Author:** Antigravity · 2026-07-07  

---

## Step 1 — State Read Summary

### Current Script Embedding in `ShopMenu.tsx`
Currently, `ShopMenu.tsx` initializes the script as:
```tsx
const s = document.createElement('script')
s.src = 'https://thepawnshop.trafficstores.ca/shop/embed.js'
s.async = true
s.dataset.mode = 'menu'
container.appendChild(s)
```
Only `data-mode` is supplied.

### New Required Script Parameters
We need to add:
1. `data-revenue-center="44"`
2. `data-category="1804"`
3. `data-theme="clean"` (corrected from typo `data-heme="clean"` based on `embed.js` source inspection).

---

## Step 2 — Persona Gate

| Persona | Test | Strategy A | Strategy B | Strategy C |
|---|---|---|---|---|
| **Dale** (Primary) | Direct accurate view of current shop stock | ⚠️ Risks missing scoped filters if attributes are misconfigured | ✅ Always loads correctly with exact category & revenue center scoping | ✅ Always loads correctly with exact category & revenue center scoping |
| **Sandra** (Primary) | Visual discovery with clean theme integration | ⚠️ Fails to apply theme clean style if typo `data-heme` is kept | ✅ Clean styling theme applies perfectly | ✅ Clean styling theme applies perfectly |
| **Jordan** (Secondary) | Editorial quality and no layout/console errors | ❌ Hardcoded typo in script attributes | ✅ Correct HTML5 dataset property usage | ✅ Proper dataset property usage + environment fallback |

---

## Step 3 — Schema Audit

No Firestore schema modifications are required for this parameter addition, as the parameters are hardcoded per the user's explicit preference.

---

## Step 4 — Three Strategies

### Strategy A: Literal Element Attribute Injection (Minimal)
**Scope:** Small · Modify `ShopMenu.tsx`
**Approach:** Sets attributes literally using `.setAttribute()`.
*   **Implementation:**
    ```tsx
    const s = document.createElement('script')
    s.src = 'https://thepawnshop.trafficstores.ca/shop/embed.js'
    s.async = true
    s.setAttribute('data-mode', 'menu')
    s.setAttribute('data-revenue-center', '44')
    s.setAttribute('data-category', '1804')
    s.setAttribute('data-theme', 'clean')
    ```
*   **Pros:** Very straightforward.
*   **Cons:** Bypasses idiomatic React dataset properties.

---

### Strategy B: Idiomatic Dataset Property Injection (Recommended)
**Scope:** Small · Modify `ShopMenu.tsx`
**Approach:** Uses `HTMLElement.dataset` properties, converting kebab-case data-attributes into camelCase keys (`dataset.revenueCenter`, `dataset.category`, `dataset.theme`).
*   **Implementation:**
    ```tsx
    const s = document.createElement('script')
    s.src = 'https://thepawnshop.trafficstores.ca/shop/embed.js'
    s.async = true
    s.dataset.mode = 'menu'
    s.dataset.revenueCenter = '44'
    s.dataset.category = '1804'
    s.dataset.theme = 'clean'
    ```
*   **Pros:** Idiomatic JavaScript/TypeScript. Avoids string manipulation of attributes.
*   **Cons:** Hardcoded constants inside the component (selected by user).

---

### Strategy C: Config-Driven Parameter Injection (Robust)
**Scope:** Medium · Modify `ShopMenu.tsx`
**Approach:** Maps parameters from a local configuration object or runtime environment configuration to dataset properties with fallbacks.
*   **Implementation:**
    Iterates over a settings object or environment configuration to populate datasets dynamically.
*   **Pros:** Clean decoupling of configuration from script loading code.
*   **Cons:** Overly complex for static parameters hardcoded per preference.

---

## Step 5 — Anti-Regression Check

*   **Hardcoded hex values:** None.
*   **A11y:** The target element remains `#brotherpos-shop` which is already excluded from Axe scans.
*   **TypeScript & Linting:** Using camelCase dataset property mapping ensures clean compiler checks.

---

## Recommendation

**Strategy B** is recommended as it uses idiomatic DOM manipulation standards (`HTMLElement.dataset`) and fulfills all requirements cleanly.
