# E53 Project Spec: Native Web Share

**Status:** Done — 2026-06-02

## Overview
We need to allow users to easily share products from our storefronts (Pawn, Cannabis, Tobacco, and Fireworks) using their device's native sharing capabilities (e.g., iOS/Android share sheets). This drives organic traffic and leverages existing customer networks.

## Requirements
1. **Share Button:** Add a prominent "Share" button to the item detail pages (or product cards) across all views.
2. **Native API:** The button should trigger the `navigator.share()` API where supported (mostly mobile and some modern desktop browsers).
3. **Fallback:** If `navigator.share()` is unsupported, it should fall back to a "Copy Link" action.
4. **Content:** The shared payload should include the item title and the direct URL to the item page.

## Persona Impact
- **Sandra / Dale / Tanya:** Makes it easy to text a cool pawn find or coordinate fireworks bundles with friends.
- **Marie (Cannabis):** Word-of-mouth recommendations without relying on heavily restricted social media ads.

## Compliance
- Shared links for Cannabis, Tobacco, and Fireworks will naturally be protected by the existing router-level age gates when the recipient opens the link.
- No PII is included in the share payload.
