# QA Report — E124 · Site Analytics: GA4 Activation & Enhanced Event Tracking

**Date:** 2026-06-13
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

E124 is entirely client-side — the Firebase Analytics SDK sends events to GA4 over HTTPS.
No Firestore collections are read or written by the analytics layer.

**Schema sync: complete — no changes to `docs/firestore-schema.md` required.**

---

## Token Compliance Audit

| Category | Rule | Result |
|----------|------|--------|
| Colours | No hardcoded hex in new code | ✅ No new UI components added |
| Spacing | No hardcoded px/spacing values | ✅ No new inline styles |
| Font sizes | No hardcoded px font sizes | ✅ No new inline styles |
| Motion | No unapproved motion patterns | ✅ No animation added |
| `any` types | None | ✅ All GA4 params are typed via interfaces |
| `console.log` | None | ✅ Fire failures are silently caught (non-fatal) |
| Unused imports | None | ✅ All imports consumed |

---

## PII Compliance Audit

| Parameter | Present in any event? | Result |
|-----------|----------------------|--------|
| UID | No | ✅ |
| Email address | No | ✅ |
| Phone number | No | ✅ |
| Display name | No | ✅ |
| `view: 'cannabis'` in public HTML | No — internal GA4 dimension only | ✅ Marie Discretion Test PASS |

User properties set: `is_staff` (boolean string), `preferred_view` (ViewType string).
Both are non-PII — no user-identifiable information.

---

## Event Coverage Verification

| GA4 Event | Trigger Location | Status |
|-----------|-----------------|--------|
| `page_view` | `HomePage.tsx`, `PawnPage.tsx` (on mount) | ✅ |
| `view_item_list` | `PawnPage.tsx` (on items/search change, deduped by key), `FireworksPage.tsx` (once per load) | ✅ |
| `select_item` | `ItemQuickView.tsx` (on item open) | ✅ |
| `view_item` | `ItemDetailPage.tsx` (on item load) | ✅ |
| `generate_lead` | `ClickCollectModal.tsx`, `PreorderModal.tsx`, `PawnEnquiryForm.tsx` (on submit) | ✅ |
| `search` | `PawnPage.tsx` (500ms debounce) | ✅ |
| `age_gate_event` | Pre-existing, retained | ✅ |
| `campaign_view` | `CampaignBanner.tsx` (on campaign load) | ✅ |
| `add_to_wishlist` | `ItemQuickView.tsx` (toggle add path) | ✅ |
| `remove_from_wishlist` | `ItemQuickView.tsx` (toggle remove path) | ✅ |

---

## UTM Passthrough Verification

`getUtm()` is called inside the `fire()` closure in `src/lib/analytics.ts` on every event.
UTM params captured by `captureUtm()` in `utm.ts` are now forwarded to GA4 on every call.
Previously orphaned — now fully wired.

---

## User Properties Verification

| Property | Set in | Value |
|----------|--------|-------|
| `is_staff` | `AuthContext.tsx` — on every auth state change | `'true'` or `'false'` |
| `preferred_view` | `ViewContext.tsx` — on every view change | `ViewType` string |

---

## Key Fixes Verified

| Root Cause | Fix | File |
|-----------|-----|------|
| `VITE_FIREBASE_MEASUREMENT_ID` missing from `.env.example` | Added | `.env.example` |
| `getUtm()` never called in analytics layer | Merged into `fire()` | `src/lib/analytics.ts` |
| No homepage pageView event | Added `useEffect` | `src/pages/HomePage.tsx` |
| `useRef<T>()` TypeScript overload error | Changed to `useRef<T | undefined>(undefined)` | `src/pages/PawnPage.tsx` |
| `useEffect` missing `item` dependency in `ItemQuickView` | Changed to `[item]` | `src/components/pawn/ItemQuickView.tsx` |

---

## Persona Compliance Tests

### Jordan (Primary — Analytics & Brand Quality)
- GA4 recommended event names unlock standard Item Performance, Lead Generation, and Site Search reports. ✅
- No `aiDescription` content exposed. ✅
- Lighthouse target unaffected — zero new npm dependencies added. ✅

### Sandra (Primary — Discovery & Conversion)
- `view_item_list` fires on search result changes. ✅
- `add_to_wishlist` / `remove_from_wishlist` tracks wishlist engagement. ✅
- `select_item` fires when quick view opens. ✅

### Dale (Secondary — Pricing Transparency)
- `search` event with `search_term` fires 500ms after the user stops typing. ✅
- No price data exposed in any PII-restricted way. ✅

### Marie (Compliance Anchor — Discretion Test)
- `view: 'cannabis'` is passed as an internal GA4 custom dimension — never rendered to public HTML. ✅
- No cannabis-specific data in any customer-visible string. ✅
- Cannabis vertical still suspended — no cannabis events fire for unauthenticated users. ✅

### Makoonsii (Compliance — No Friction)
- Analytics calls are all non-fatal `try/catch` — no analytics failure can surface to the user. ✅
- No new interactive elements introduced. ✅

---

## Compliance Checklist

| Requirement | Status |
|-------------|--------|
| No PII in any analytics event parameter | ✅ |
| `view: 'cannabis'` internal dimension only — never public HTML | ✅ |
| No Firestore reads or writes in analytics layer | ✅ |
| No AI API keys on client | ✅ |
| No age gate changes | ✅ |
| All AI calls still routed through Cloud Functions | ✅ |
| `auditLogs` not modified | ✅ |
| No hardcoded hex/px/spacing values introduced | ✅ |
| No `any` types introduced | ✅ |
| No new Firestore fields | ✅ |
| `policeHold` behaviour unaffected | ✅ |
| `rare-find` / `limited-edition` unaffected | ✅ |
| `aiDescription` unaffected | ✅ |

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/analytics.ts` | Complete rewrite — GA4 recommended event catalog, `GA4Item` interface, `toGA4Item()`, `setAnalyticsUserProperties()`, `fire()` with UTM merge |
| `src/context/AuthContext.tsx` | Sets `is_staff` user property on auth state change |
| `src/context/ViewContext.tsx` | Sets `preferred_view` user property on view change |
| `src/pages/HomePage.tsx` | Added `pageView` on mount |
| `src/pages/PawnPage.tsx` | Added `pageView`, `viewItemList` (deduped), `search` (debounced) |
| `src/pages/FireworksPage.tsx` | Added `viewItemList` on items load (once per page) |
| `src/pages/ItemDetailPage.tsx` | `itemView` → `viewItem` with `GA4Item` |
| `src/components/pawn/ItemQuickView.tsx` | `itemView` → `selectItem` with `GA4Item`; wishlist add/remove events |
| `src/components/pawn/ClickCollectModal.tsx` | `enquirySubmit` → `generateLead` with item + value |
| `src/components/fireworks/PreorderModal.tsx` | `enquirySubmit` → `generateLead` with item + value |
| `src/components/pawn/PawnEnquiryForm.tsx` | `pawnFormSubmit` → `generateLead` |
| `src/components/CampaignBanner.tsx` | Added `campaignView` on campaign load |
| `.env.example` | Added `VITE_FIREBASE_MEASUREMENT_ID=` line |
| `docs/decisions/0041-analytics-strategy-b.md` | Decision log — Strategy B |
| `docs/projects/E124_SITE_ANALYTICS.md` | Status → CLOSED |
| `docs/EPICS.md` | E124 entry added and CLOSED |
| `docs/ACTIVE_CYCLE.md` | E124 rows added to Completed This Cycle |
| `user-guide/admin/dashboard.md` | Updated View Performance section |

---

## Post-Deploy Action Required (User)

`VITE_FIREBASE_MEASUREMENT_ID` must be added to Codespaces Secrets (for dev) and GitHub Actions Secrets (for prod) before analytics events will flow to GA4. The actual Measurement ID (`G-XXXXXXXXXX`) is found in the Firebase Console → Analytics → Data Streams.

---

## Sign-Off

All compiler gates pass. Zero PII. Zero hardcoded tokens. GA4 recommended event catalog fully wired. UTM passthrough confirmed. User properties set (no PII). Marie Discretion Test passes.

**QA PASSED. E124 ready to merge.**

---

*The Pawn Shop · docs/reports/E124_QA_REPORT.md · 2026-06-13*
