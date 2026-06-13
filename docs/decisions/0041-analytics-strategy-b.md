# Decision 0041 — E124 Analytics: GA4 Enhanced Event Catalog (Strategy B)

**Date:** 2026-06-13
**Epic:** E124 · Site Analytics
**Status:** Accepted

## Decision

Activate Firebase Analytics (GA4) using Strategy B: migrate to GA4's recommended ecommerce
event schema with item-level parameters, UTM passthrough, user properties, and campaign/wishlist
tracking. Zero new npm dependencies.

## Context

Firebase Analytics was integrated but inactive — `VITE_FIREBASE_MEASUREMENT_ID` was never set
in any environment. All `Analytics.*` calls silently no-oped. UTM params were captured into
`sessionStorage` but never forwarded to GA4. The existing 5-event catalog used custom event
names that don't map to any GA4 standard report.

## Chosen Approach

**Strategy B** — GA4 recommended event schema + UTM passthrough + user properties.

Event migration:
| Old event | New GA4 event | Report unlocked |
|---|---|---|
| `item_view` (custom) | `view_item_list` + `select_item` + `view_item` | Item Performance report |
| `enquiry_submit` (custom) | `generate_lead` | Lead gen funnel |
| `pawn_form_submit` (custom) | `generate_lead` | Lead gen funnel |
| *(none)* | `search` | Site search report |
| *(none)* | `campaign_view` | Campaign tracking |
| *(none)* | `add_to_wishlist` / `remove_from_wishlist` | Wishlist engagement |

User properties added: `is_staff` (boolean string), `preferred_view` (ViewType string).
Both are non-PII — no uid, email, or name.

UTM passthrough: `getUtm()` merged into every `fire()` call so all conversion events carry
source/medium/campaign attribution.

## Alternatives Rejected

**Strategy A (thin):** Would activate GA4 but keep custom event names — no standard GA4
reports unlocked. Too thin to answer persona questions.

**Strategy C (PostHog):** Session replay requires PIPEDA/DPA review and PII masking work
before it can be enabled. posthog-js (~50KB) adds bundle risk for Jordan's Lighthouse
performance target. Deferred to a future cycle when a specific UX hypothesis warrants it.

## Compliance

- No PII in any event parameter — enforced by typed interfaces
- `view: 'cannabis'` is an internal GA4 custom dimension — never rendered to public HTML
- No Firestore reads or writes in analytics layer
- No AI API keys involved
- No age gate changes
