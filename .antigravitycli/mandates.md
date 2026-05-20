# Antigravity Mandates — The Pawn Shop

This document serves as the high-fidelity operational context for Antigravity. It is derived from `GEMINI.md` and `docs/firestore-schema.md`.

## Core Architectural Guardrails

### 1. Persona Alignment
- **Agent Attribution:** Log all subagent decisions in `docs/DECISIONS.md` with an `(Agent)` suffix.
- **Verification Proofs:** Attach Lighthouse and Playwright results to every `walkthrough.md`.
- **Policy-as-Code:** Subagents must strictly enforce the policies in `docs/policies/`.
- **Makoonsii (Owner):** Visual excellence, brand integrity, cultural grounding.
- **Marie (Compliance):** Age gates, audit logs, PII protection, Police Hold.
- **Kevin (Customer):** Premium UX, accessibility, transparency.

### 2. Design System & UX
**Policy:** [docs/policies/design.md](file:///workspaces/pawn-shop/docs/policies/design.md)
- **Token Integrity:** Use CSS variables only. Zero hardcoded hex/px/ms.
- **Motion:** Respect view-scoped `--motion-speed` and `--motion-easing`.
- **Verification Thresholds:** Lighthouse A11y ≥ 0.90, SEO ≥ 0.95.

### 3. Data, Compliance & Security
**Policies:** [compliance.md](file:///workspaces/pawn-shop/docs/policies/compliance.md) | [firebase.md](file:///workspaces/pawn-shop/docs/policies/firebase.md) | [cultural.md](file:///workspaces/pawn-shop/docs/policies/cultural.md)
- **Age Gates:** Mandatory at router level for Cannabis (19+) and Fireworks (18+).
- **Strict Typing:** No `as any` on Firestore data.
- **PII:** Zero PII in `auditLogs` or console.
- **Cultural Rule:** AI must NEVER generate Kanien'kéha. Refer to [CULTURAL_LOG.md](file:///workspaces/pawn-shop/docs/CULTURAL_LOG.md).

## Compressed Schema Reference

### Core Collections
- `items`: Primary inventory. `category`, `viewTag`, `status` (`draft`|`active`|`sold`), `price` (cents).
- `auditLogs`: Immutable event stream. `eventType`, `uid`, `details` (No PII).
- `users`: `role` (mirrors custom claims), `consentAcceptedAt`, `mfaEnrolled`.
- `reservations`: `status` (`pending`|`confirmed`|`completed`), `pickupWindow`.
- `pawnRequests`: Customer intake for quotes. `status` (`pending`|`reviewed`).

## Developer Workflow
1. **Research:** Verify current state of Firestore/Context/Hooks.
2. **Strategy:** Propose 3 strategies (Minimal, Recommended, Robust) with Persona Impact.
3. **Execution:** Surgical changes + Linter/Tests.
4. **Close:** Update schema docs and decisions.
