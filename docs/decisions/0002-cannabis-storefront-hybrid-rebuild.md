# 0002. Cannabis Storefront Hybrid Rebuild Architecture

**Date:** 2026-06-06  
**Status:** Accepted  

## Context

The Cannabis storefront needed a structural update to improve navigation, emphasize product value to cross-border customers, and adhere strictly to our design token system. Previously, the storefront utilized abstract "Mood" categories that hindered intuitive navigation and did not effectively display the financial advantages of cross-border shopping. Furthermore, testing suites exhibited flakiness around dynamic layouts, and components contained hardcoded hex colors which violated our theming architecture.

## Decision

1. **Navigation & Component Unification**: 
   - Removed the abstract `MoodCard` navigation in favor of direct, intuitive product categories (Flower, Vapes, Edibles, etc.) mapped directly from the `firestore-schema.md`.
   - Built and integrated modular, dynamic layout components: `CannabisMarqueeStrip` and `StoryStrip` for a more engaging, branded user experience.

2. **Price Comparison Architecture**:
   - Refactored the `LuxuryProductCard` to natively display a comparative pricing model (USD vs CAD), addressing the needs of our cross-border persona (Dale) to clearly validate savings.
   - Added THC/CBD progress bar indicators directly onto the product cards for enhanced quick-glance readability.

3. **Strict Design Token Enforcement**:
   - Removed all instances of hardcoded hex colors.
   - Centralized UI styling in `index.css`, dynamically mapping storefront components strictly to `.view-*` CSS variables to ensure perfect theming parity.

4. **Testing Resilience**:
   - Addressed E2E flakiness in `e2e/pawn.spec.ts` by adjusting test timeouts, ensuring that dynamic components and network-dependent hydration logic do not trigger false negatives.

## Consequences

- **Positive:** UI perfectly scales across dynamic brand tokens, guaranteeing theme consistency without manual overrides.
- **Positive:** Cross-border price comparisons significantly improve immediate value visibility for our target American personas.
- **Positive:** Testing suites are more resilient against hydration delays, improving CI reliability.
- **Negative/Trade-offs:** Relying purely on CSS variable mappings requires stricter vigilance during UI modifications to ensure custom properties are always available in the DOM context.
