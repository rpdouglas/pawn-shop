# E63 Inventory Desktop Layout Plan

Based on the `/grill-me` interview, here are the execution strategies:

## Strategy A: Minimal Grid Fix
- **Implementation:** Extract the existing mobile card HTML and map it into a 3-column CSS Grid for desktop. Add the search bar to the top. Do not group items.
- **Pros:** Fast implementation.
- **Cons:** Fails the user's specific request for visual "grouping".

## Strategy B: Grouped Masonry Grid (Recommended)
- **Implementation:** 
  1. Move the search bar and status chips to a persistent global header.
  2. Map the `filteredItems` array into three distinct buckets based on `viewTag` ('pawn', 'cannabis', 'fireworks').
  3. Render each bucket as a section with a distinct header and a responsive `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` layout.
  4. Convert the `AiAssistantPanel` into a fixed right-side Drawer (using CSS transform translation) that overlays the screen slightly rather than squishing the main grid.
- **Pros:** Completely eliminates horizontal scroll, meets the grouping requirement, and drastically improves visual hierarchy.

## Strategy C: Grouped Grid + Virtualization
- **Implementation:** Implement Strategy B, but integrate a virtualization library (like `react-window`) to handle thousands of cards without DOM bloat.
- **Pros:** Extreme performance.
- **Cons:** Overkill for the current 50-item limit query in `InventoryPage.tsx` and requires introducing a new npm dependency.

### Compliance Checklist (All Strategies)
- **Persona:** Staff need high-density data without horizontal scrolling. Grouping by view tag aligns with their workflow.
- **Security Rules:** No schema changes; purely UI layer.
- **Aesthetics:** Use `var(--color-surface)` and `var(--radius-md)` for premium card styling.
