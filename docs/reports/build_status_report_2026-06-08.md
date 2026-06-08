# The Pawn Shop — Build Status Report
**Cornwall Island · Akwesasne**
*Generated: 2026-06-08 · Cycle 32 · Model: Claude Sonnet 4.6 (Thinking)*

---

## Executive Summary

The platform is in a **strong pre-production state** — all foundational epics (Phases 1–13) are closed, the AI pipeline is rebuilt and hardened, the pawn loan lifecycle is live, and the test suite is fully operational. The current build is a feature-complete MVP ready for staged production rollout, pending resolution of five documented pre-launch blockers.

**32 sprints completed. ~50+ epics closed.**

---

## 🟢 Completed Phases

### Phase 1 — Foundation ✅
| Epic | Description | Status |
|------|-------------|--------|
| E01 | Dev Environment Setup | ✅ CLOSED |
| E02 | Three-View Design System (Pawn / Cannabis / Fireworks) | ✅ CLOSED |
| E21 | Vitest Unit Testing | ✅ CLOSED |
| E03 | Auth & Staff Roles (5-role system, MFA stub) | ✅ CLOSED |

### Phase 2 — Core Product ✅
| Epic | Description | Status |
|------|-------------|--------|
| E04 | Inventory Schema & Intake | ✅ CLOSED |
| E05 | Three-View Storefronts (Pawn / Cannabis / Fireworks) | ✅ CLOSED |
| E07 | Pawn Form & Inbox | ✅ CLOSED |
| E08 | Click & Collect / Contact | ✅ CLOSED |

### Phase 3 — Discovery & Merchandising ✅
| Epic | Description | Status |
|------|-------------|--------|
| E39 | Cannabis Storefront Enhancement (filter panel, layout toggle) | ✅ CLOSED |
| E13 | Merchandising Engine (staff picks, trending, quick-view) | ✅ CLOSED |
| E59 | Pawn Page Multiple Views (masonry, grid3, list) | ✅ CLOSED |
| E53 | Native Web Share | ✅ CLOSED |
| E54 | Dedicated Item Landing Pages | ✅ CLOSED |
| E06 | eBay Cross-Posting | ✅ CLOSED |

### Phase 4 — Conversion & Admin Intelligence ✅
| Epic | Description | Status |
|------|-------------|--------|
| E09 | Quality, Security & Accessibility (WCAG AA, axe-core clean) | ✅ CLOSED |
| E10 | Analytics, Feature Flags & Admin Dashboard | ✅ CLOSED |
| E20 | Staff Management, Scheduling & HR Data | ✅ CLOSED |
| E17 | Conversion Optimisation (recently sold, live feed, trust badges) | ✅ CLOSED |
| E14 | Seasonal Campaign Scheduler | ✅ CLOSED |
| E11 | Compliance Programme | ✅ CLOSED |

### Phase 5 — Retention & Post-Sale ✅
| Epic | Description | Status |
|------|-------------|--------|
| E15 | CRM & Retention (VIP tiers, engagement scoring) | ✅ CLOSED |
| E12 | Alerts & Notifications (saved searches, 60s SLA) | ✅ CLOSED |
| E16 | Post-Sale Operations (disputes, eBay disputes) | ✅ CLOSED |

### Phase 6 — AI & Editorial ✅
| Epic | Description | Status |
|------|-------------|--------|
| E18 | AI Assistant Staff-Facing (Gemini, staff review gate) | ✅ CLOSED |
| E19 | Editorial CMS & Brand Narrative (Akwesasne identity, articles) | ✅ CLOSED |

### Phases 7–9 — App Shell, Infrastructure, Prod Readiness ✅
| Epic | Description | Status |
|------|-------------|--------|
| E23 | Unified Global Header | ✅ CLOSED |
| E24 | CI/CD Pipeline Strategy | ✅ CLOSED |
| E44 | CI/CD Testing Pipeline (Lint/Unit/A11y/LHCI gates) | ✅ CLOSED |
| E26 | Versioning Strategy (CalVer + Git SHA) | ✅ CLOSED |
| E49 | Mobile Intake Image Job Tracker | ✅ CLOSED |
| E51 | Photo Upload Compression & Resilience | ✅ CLOSED |
| E52 | Inventory Management CRUD | ✅ CLOSED |
| E55 | Edit Inventory Item | ✅ CLOSED |
| E67 | Inventory Recycle Bin (soft delete, 30-day purge) | ✅ CLOSED |

### Phases 10–13 — Intelligence, AI Intake, Pawn Loans, CF Refactor ✅
| Epic | Description | Status |
|------|-------------|--------|
| E29 | Cannabis Product Intelligence (terpene spider chart) | ✅ CLOSED |
| E56 | Cannabis Data Model (subcategories, servings, strain types) | ✅ CLOSED |
| E57 | AI-First Inventory Intake (photo-first Gemini hydration) | ✅ CLOSED |
| E58 | Desktop Photo First | ✅ CLOSED |
| E78 | AI Pipeline Precision & Reliability | ✅ CLOSED |
| E31 | Pawn Loan Management Portal | ✅ CLOSED |
| E81 | Pawn Loan Lifecycle UI (issue / redeem / forfeit / SMS reminders) | ✅ CLOSED |
| E34 | Cloud Functions Modular Refactor (core / operations split) | ✅ CLOSED |

### Phases 14–22 — Innovation, Staff Ops, QA, Governance ✅
| Epic | Description | Status |
|------|-------------|--------|
| E40 | Cannabis Mobile Mood Pills | ✅ CLOSED |
| E41 | Mobile Staff Inventory | ✅ CLOSED |
| E42 | Inventory Cost, Quantity & POS Integration (stub) | ✅ CLOSED |
| E43 | Image Upload Performance | ✅ CLOSED |
| E60 | AI Governance Subagents | ✅ CLOSED |
| E61 | Mobile Intake UX Refinement | ✅ CLOSED |
| E62 | User Role Management | ✅ CLOSED |
| E63 | Inventory Desktop Layout | ✅ CLOSED |
| E64 | Profile & Customers | ✅ CLOSED |
| E65 | Frontend Optimizations | ✅ CLOSED |
| E66 | Backend Optimizations (CF v2, high concurrency) | ✅ CLOSED |
| E69 | Onboarding & SOP Management | ✅ CLOSED |
| E70 | Social Media Campaign Management | ✅ CLOSED |
| E71 | State Management Refactor (TanStack React Query) | ✅ CLOSED |
| E72 | Comprehensive QA & Testing Gap Closure (4 phases) | ✅ CLOSED |
| E76 | Extended Autonomous Subagents | ✅ CLOSED |
| E73 | AI Fallback (graceful degradation, model upgrade) | ✅ CLOSED |
| E28 | Algorithmic Markdown Engine (Dutch auction) | ✅ CLOSED |
| E82 | Cannabis Storefront Hybrid Rebuild | ✅ CLOSED |

---

## 🔴 Pre-Launch Blockers

> [!CAUTION]
> All five must be resolved before any public production traffic.

| # | Blocker | Urgency |
|---|---------|---------|
| 1 | **Identity Platform upgrade** — MFA bypass (`assertMfaEnrolled` disabled). Compliance risk for all staff operations. | 🔴 CRITICAL |
| 2 | **App Check re-enable** — disabled since June 5. Backend exposed to unauthenticated CF calls and billing abuse. | 🔴 CRITICAL |
| 3 | **Legal page copy** — Privacy Policy & Terms contain `[LEGAL REVIEW REQUIRED]` placeholders throughout. | 🔴 CRITICAL |
| 4 | **Fireworks age gate discrepancy** — EPICS.md says 18+, design-system.md says 19+. Business owner must confirm. | 🔴 CRITICAL |
| 5 | **Production secrets** — SendGrid, Twilio, eBay, Brother POS all using dummy keys in Firebase Secret Manager. | 🔴 CRITICAL |

---

## 🟡 Open / Deferred Items

| Epic | Description | Blocked By |
|------|-------------|------------|
| E03-QA | MFA bypass confirmation | Identity Platform upgrade (console operation) |
| E06-QA | eBay Webhook production credentials | Requires eBay seller + developer account |
| E68-QA | Secret Manager production provisioning | Live API credentials from vendors |
| E09-QA | Lighthouse Performance decision gate | SSR needed for ≥0.90 — deferred to E83 |
| E32 | Digital Pawn Wallets | Apple Developer + Google Wallet Console credentials |
| E33 | Staff Pick-Path Optimizer | Not started |
| E30 | Gemini Vision Appraisal Engine (customer-facing) | Not started |
| E35 | Store Mode Geo-Fencing | Not started |
| E36 | Authenticated Trust Ledgers | Not started |
| E77 | Deferred Design & Content (App Check, testimonials, video) | Content / security dependencies |

---

## 🔵 Future Roadmap Queue

### Phase 23 — Revenue Enablement 🔴 NEXT UP
| Epic | Description | Priority | Effort |
|------|-------------|----------|--------|
| E79 | **Stripe Integration** — zero online revenue without this | 🔴 CRITICAL | 10–12 days |
| E80 | Brother POS Live Integration | 🔴 HIGH | 6–8 days |

### Phase 24 — Acquisition & SEO
| Epic | Description | Priority | Effort |
|------|-------------|----------|--------|
| E82-GBP | Google Business Profile API | 🟠 HIGH | 8–10 days |
| E83 | SSR / Vite (Lighthouse ≥0.90) | 🟠 HIGH | 12–16 days |
| E84 | Algolia Search Integration | 🟡 MEDIUM | 6–8 days |
| E85 | Review & Reputation Management | 🟡 MEDIUM | 5–6 days |

### Phase 25 — Retention & Loyalty
| Epic | Description | Priority | Effort |
|------|-------------|----------|--------|
| E86 | Loyalty Points Economy | 🟡 MEDIUM | 10–12 days |
| E87 | Web Push Notifications (FCM) | 🟡 MEDIUM | 6–8 days |
| E88 | Internal Analytics Dashboard | 🟡 MEDIUM | 8–10 days |
| E89 | Tax Calculation & Receipts | 🟡 MEDIUM | 4–5 days |

### Phase 26 — Operations & Scale
| Epic | Description | Priority | Effort |
|------|-------------|----------|--------|
| E90 | Inventory Forecasting | 🟢 LOW-MED | 8–10 days |
| E91 | Advanced Search (Voice + Visual) | 🟢 LOW-MED | 6–8 days |
| E92 | Staff Training / LMS | 🟢 LOW | 8–10 days |
| E93 | Multi-Location Preparation | 🟢 LOW | 5–6 days |

**Total remaining estimated effort: ~120–145 developer-days across ~20 weeks**

---

## Open Decisions Needed

| Question | Context | Urgency |
|----------|---------|---------|
| Fireworks age gate: 18+ or 19+? | Discrepancy between EPICS.md and design-system.md | 🔴 Before prod |
| Legal counsel engagement | Cannabis/fireworks regulation, First Nations tax exemption (E89) | 🔴 Before prod |
| Stripe account setup | Blocks all online payment flows | 🔴 Phase 23 gate |
| eBay developer account & webhook URL | Blocks live eBay status sync | Before E06 prod deploy |

---

## Cycle 32 — What's Next

The "In Progress" table is empty. The recommended next moves are:

1. **🔴 Clear all 5 pre-launch blockers** — Identity Platform, App Check, legal copy, age gate confirmation, production secrets
2. **🔴 Open E79 (Stripe)** — the platform cannot generate a single dollar of online revenue without it; this is the highest-value unbuilt feature
3. **🟠 E80 (Brother POS)** — bidirectional sync to prevent inventory phantom listings
4. **🟡 E73 (Architecture Modernization)** — react-hook-form, manualChunks, withConverter — technical debt cleanup before revenue phase

---

*The Pawn Shop · docs/reports/ · Build Status 2026-06-08 · Cycle 32*
*Dapper. Debonair. Distinctly Akwesasne.*
