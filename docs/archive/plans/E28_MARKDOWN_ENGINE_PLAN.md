# E28: Algorithmic Markdown Engine (Dutch Auction) — Implementation Plan

## Overview
This document outlines three potential strategies for implementing the Algorithmic Markdown Engine (E28). The engine automates price drops on aging inventory based on a configured cadence until a designated floor price is reached.

---

## Strategy A: Minimal (Cron-Only, No Config UI)
**Approach:** 
Deploy a single scheduled Cloud Function (`applyMarkdownDrops`) that runs daily. It queries all items where `markdownEnabled` is true and `lastMarkdownAt` has exceeded `markdownPeriodDays`. It drops the price by `markdownRate` stopping at `floorPrice`. Staff must configure these fields manually via the Firebase Console (no Admin UI built). No automated CASL alerts are integrated.

- **Persona Impact Statement:** 
  - **Dale:** Highly frustrated; lacks a user-friendly way to configure floors safely, increasing the risk of typos in raw database edits.
  - **Sandra:** Satisfied; the `MerchandisingBadge` will still show up when `originalPrice` differs from `price`.
  - **Kevin:** Disappointed; alerts are not wired up, meaning customers won't know when prices drop.
- **Compliance Checklist:**
  - [x] Logs `price_override` to `auditLogs`.
  - [ ] CASL opt-in alert integration (Skipped).
- **Schema Audit:** 
  - Adds `floorPrice`, `markdownRate`, `markdownPeriodDays`, `markdownEnabled`, `lastMarkdownAt`, `originalPrice` to `items/{id}`.

---

## Strategy B: Recommended (Full Spec Compliance)
**Approach:** 
Builds the complete suite requested in the epic. Features a daily scheduled Cloud Function (`applyMarkdownDrops`) executing the logic in the `operations` module. Implements secure callable functions (`enableMarkdown`, `disableMarkdown`) with Manager+ RBAC. Builds a dedicated configuration panel in `InventoryPage.tsx` for easy staff control. Integrates `sendMarkdownAlert` into the notification pipeline, alerting users with saved searches that match the discounted item.

- **Persona Impact Statement:** 
  - **Dale (Authenticity Test):** Passes. Managers securely control floors and cadence. Exempt tags (`rare-find`, `limited-edition`) are filtered out.
  - **Kevin (Alert Accuracy):** Passes. Alerts are dispatched to opted-in users immediately after the batch price drop.
  - **Marie (Discretion Test):** Passes. SMS alerts are generic ("An item you're watching has dropped in price") without sensitive pricing details.
  - **Sandra:** Passes. The "Price Dropped" merchandising badge appears smoothly in the masonry grid without intrusive animations.
- **Compliance Checklist:**
  - [x] Logs `price_override` to `auditLogs` for every automated drop.
  - [x] CASL opt-in explicitly checked before `sendMarkdownAlert`.
  - [x] Sensitive pricing details omitted from SMS payloads.
  - [x] Manager+ RBAC enforced on configuration callables.
- **Schema Audit:** 
  - Adds `floorPrice`, `markdownRate`, `markdownPeriodDays`, `markdownEnabled`, `lastMarkdownAt`, `originalPrice` to `items/{id}`.

---

## Strategy C: Robust (Cloud Tasks + Analytics)
**Approach:** 
Builds upon Strategy B but replaces the bulk daily Cron job with precision Google Cloud Tasks. When an item is enabled for markdown, a specific Cloud Task is queued for the exact second the period expires. Additionally, builds a dedicated `MarkdownAnalytics` dashboard panel to track the correlation between price drops and conversion velocities.

- **Persona Impact Statement:** 
  - **Staff:** Loves the deep analytics but might find debugging individual Cloud Tasks more complex than a predictable daily batch run.
  - **Jordan (Operations):** Slightly concerned about the increased architectural complexity and potential enqueue limits.
- **Compliance Checklist:**
  - [x] Logs `price_override` to `auditLogs`.
  - [x] CASL opt-in explicitly checked.
  - [x] Sensitive pricing details omitted from SMS payloads.
  - [x] Manager+ RBAC enforced.
- **Schema Audit:** 
  - Adds `floorPrice`, `markdownRate`, `markdownPeriodDays`, `markdownEnabled`, `lastMarkdownAt`, `originalPrice` to `items/{id}`.
  - Adds new `markdownAnalytics` sub-collection for tracking conversion impacts.

---

## Recommendation
**Strategy B** is highly recommended. It fulfills all persona constraints and compliance requirements safely without introducing the architectural overhead of Strategy C's Cloud Tasks. The daily cron job is predictable, easily monitored, and perfectly fits the rhythm of a retail pawn shop.
