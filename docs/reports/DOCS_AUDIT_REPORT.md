# Documentation Audit & Update Plan

**Date:** 2026-06-03

---

## Phase 1 — Technical Deep Dive (Codebase Inventory)

### 1.1 Routes & Views
We analyzed `src/main.tsx` and mapped out the current React Router v7 structure:
- **Public Views:** Pawn, Cannabis (Age-gated 19+), Fireworks (Age-gated 18+), Tobacco (Age-gated 19+).
- **Admin Views (`/admin/*`):** Intake, Mobile Intake, Inventory, Pawn Inbox, Reservations, Store Hours, Serial Blacklist, Staff Picks, Staff Management, Scheduling, Dashboard, CRM, Preorders, Campaigns, Disputes, Articles, FAQs.
- **Staff Views (`/staff/*`):** Personal Schedule.
- **Customer Views:** Favourites, Login, Signup, MFA Enroll, Articles, FAQ, Legal.

### 1.2 Roles & Permissions
- **Admin/Manager:** Full access to all `/admin` routes.
- **Staff:** Restricted access primarily to CRM, Inbox, and Staff operations.
- **Customer:** Authenticated access to Favourites, Preorders, and Account.

### 1.3 Core Workflows
- **Inventory Intake:** Uses an advanced AI Extraction flow (`processUploadedImage` CF) which attempts to automatically extract category, condition, and market pricing.
- **Errors & Edge Cases:** If the Gemini API fails (e.g. 429 Prepayment Depleted), the backend now surfaces the exact `HttpsError` to the UI.

---

## Phase 2 — User Guide Audit (Gap Analysis)

Comparing the code findings against the `/user-guide/` VitePress structure:

### 2.1 File Tree Analysis
The `user-guide` repository is incredibly robust. Every major admin feature (Campaigns, CRM, Disputes, Preorders, Serial Blacklist, Intake) has a corresponding Markdown file mapping directly to the UI.

### 2.2 Drift Detection
- **Missing Features:** 
  - **AI Error Handling:** The application now explicitly returns and displays Gemini API failures (like billing limits or unsupported formats) to the user directly on the intake and inventory screens. The documentation in `user-guide/admin/ai-assistant.md` does not currently explain what to do when an "AI Extraction Failed" message appears.
- **Outdated Steps:** None. All documentation accurately reflects the React component tree.
- **Brand Voice Alignment:** Perfect. "Dapper, Debonair, Distinctly Akwesasne" is maintained throughout.

---

## Phase 3 — The Action Plan

### 3.1 Documentation Drift Report
| Feature / Area | Code Status | Documentation Status | Drift |
| :--- | :--- | :--- | :--- |
| Gemini API Error Handling | UI displays `AI Extraction Failed: <reason>` | Not mentioned. | Minor gap. |

### 3.2 Prioritized Update List
- **Update:** `user-guide/admin/ai-assistant.md`
  - **Action:** Add a "Troubleshooting Errors" section detailing what `429 Too Many Requests` or `AI Extraction Failed` means, and reminding staff to check their Google Cloud Secret Manager billing status for `GEMINI_API_KEY`.

### 3.3 Persona Impact
- **Marie (Manager) & Kevin (Admin):** When the AI suddenly stops extracting data for Intake, Marie or Kevin will consult the User Guide. By documenting the AI error states, they will know immediately if it's a transient glitch or a Google Cloud billing limit that requires action, saving hours of developer debugging.

---

> **STOP.** Awaiting user approval to apply the proposed update to `user-guide/admin/ai-assistant.md`.
