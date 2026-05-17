# Inventory Overview

The Pawn Shop's inventory system is designed to manage diverse product lines across three distinct storefronts while maintaining strict compliance and luxury standards.

## The Three Views

Every item in the system is assigned to a primary **View**, which determines which storefront it appears in:

- **Pawn:** Traditional and high-value items (Jewellery, Watches, Electronics). Uses an "Art Deco" discovery aesthetic.
- **Cannabis:** Premium wellness products. Requires an age gate (19+) and prioritizes discretion.
- **Fireworks:** Event-based products. Requires an age gate (18+) and emphasizes seasonal urgency.

## Key Item Attributes

- **Price:** All prices are stored and managed in CAD cents to ensure precision.
- **Condition:** Every item is graded from `New` to `Poor`.
- **Images:** High-quality photography is required. All images are automatically watermarked and converted to WebP for performance.
- **Merchandising Tags:** Staff can apply tags like `Just Arrived` or `Staff Pick` to highlight items.
- **Police Hold:** A critical safety feature that allows staff to immediately hide an item from public view for legal or security reasons.

## Searching and Discovery

The system uses a custom prefix-search engine. When an item is published, the system automatically generates search tokens from its title and category, enabling fast, real-time discovery for customers.
