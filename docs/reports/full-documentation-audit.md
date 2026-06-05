# Comprehensive Documentation Audit Report

**Date:** 2026-06-05  
**Auditor:** Documentation_Specialist Subagent  
**Scope:** `/workspaces/pawn-shop/docs/` (Internal Dev Documentation) & `/workspaces/pawn-shop/user-guide/` (Staff & Customer Manual) vs. Codebase (`src/`, `functions/`).

---

## Executive Summary

A comprehensive audit was performed across the internal `docs` directory and the Vitepress `user-guide` directory to identify documentation drift related to recent architectural changes. The primary areas evaluated were:
1. Modular Cloud Functions Architecture.
2. AI Intake Pipeline Optimizations.
3. Firebase App Check integration.

Overall, the internal documentation (`docs/`) is remarkably synchronized with the codebase, largely due to automated project close-out steps logging to `DECISIONS.md` and `EPICS.md`. However, minor documentation drift was identified within the staff-facing `user-guide/`, specifically regarding the multi-stage nature of the newly optimized AI Intake process.

---

## 1. Modular Cloud Functions Architecture

**Codebase Reality:** 
The monolithic `functions/` directory was refactored (Epic E34, Strategy B) into multiple independent node workspaces (`core`, `operations`, and `shared`), defined in `firebase.json`. 

**Internal Documentation (`docs/`):**
- **Status:** **Synchronized**
- Files such as `DECISIONS.md`, `EPICS.md`, `CONTEXT.md`, and `subagents/QA_Engineer.md` have been updated to reflect the `core` and `operations` boundaries. Old workflows that assumed a single directory have been appropriately deprecated.

**Staff Manual (`user-guide/`):**
- **Status:** **Synchronized**
- `user-guide/admin/developer-deployments.md` accurately describes the modular division, noting that `core` contains lightweight auth/role features and `operations` handles heavy ML/image processing (`sharp`, `@google/generative-ai`).

---

## 2. AI Intake Optimization & Architecture

**Codebase Reality:** 
The AI intake relies on a 3-stage pipeline (detailed in `ai_intake_report.md`):
1. **Extraction (`extractIntakeData`)**: Watermarks, compresses, and generates baseline fields (including a baseline description and preliminary market pricing).
2. **Description Generation (`generateAIDescription`)**: A secondary callable that drafts high-quality, persona-driven descriptions saved to a restricted subcollection (`items/{id}/internal/ai`). Staff must explicitly **promote** this draft to public visibility.
3. **Pricing Analysis (`suggestAiPrice`)**: A standalone callable for market research pricing ranges, stored internally as guidance.

**Internal Documentation (`docs/`):**
- **Status:** **Synchronized**
- `docs/reports/ai_intake_report.md` and `docs/firestore-schema.md` meticulously explain this 3-stage pipeline and the `items/{id}/internal/ai` schema structure, including the Staff-in-the-Loop constraints.

**Staff Manual (`user-guide/`):**
- **Status:** **Drift Detected**
- `user-guide/inventory/intake.md` and `user-guide/inventory/mobile-intake.md` describe the process as a single automated sweep: *"The AI automatically extracts product details (Title, Description, Category...) and deep-dives pricing data, hydrating the form fields."*
- **The Gap:** The user guide fails to mention the Staff-in-the-Loop promotion workflow for high-quality descriptions (Stage 2) and treats the pricing deep-dive as a form hydration rather than internal guidance (Stage 3). Staff reading the user guide will not know they must explicitly "promote" the AI Description draft or where to trigger the advanced pricing analysis.

---

## 3. Firebase AppCheck Status

**Codebase Reality:** 
In `src/lib/firebase-core.ts`, `initializeAppCheck` and `ReCaptchaEnterpriseProvider` have been temporarily commented out due to local development friction with ReCaptcha tokens.

**Internal Documentation (`docs/`):**
- **Status:** **Synchronized**
- `docs/DECISIONS.md` explicitly states: *"Temporarily disabled Firebase AppCheck initialization in frontend (`firebase-core.ts`) due to development environment friction with ReCaptcha tokens."*
- `docs/EPICS.md` accurately tracks the pending action `[PENDING SECURITY]` to re-enable it before the production launch.

**Staff Manual (`user-guide/`):**
- **Status:** **Synchronized / N/A**
- AppCheck is a transparent security layer and its temporary dev disablement does not affect customer workflows or staff operations. Therefore, its absence from the `user-guide` is correct.

---

## Action Items & Recommendations

1. **Update `user-guide/inventory/intake.md` and `mobile-intake.md`:** 
   Revise the "Automated Image Processing & AI Extraction" sections to reflect the 3-stage AI process. Clearly document the UI steps required for staff to generate, review, and **promote** an AI draft description to the live item, ensuring the "Staff-in-the-Loop" policy is understood at the operational level.
2. **Close Security Gap (Pre-Launch):** Ensure the `[PENDING SECURITY]` task in E77 (Re-enabling AppCheck) is executed before the main production cutover, as documented in `EPICS.md`.

*Audit completed autonomously.*
