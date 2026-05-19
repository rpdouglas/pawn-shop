# Getting Started

Welcome to The Pawn Shop — a multi-vertical retail platform serving Cornwall Island, Akwesasne across three distinct storefronts. This page orients you to the platform shell before you dive into any specific workflow.

---

## The Three Views

The platform operates three independent storefronts under one roof, each with its own aesthetic and compliance requirements.

| View | Path | Notes |
|---|---|---|
| **Pawn & Resale** | `/pawn` | Open to all visitors |
| **Cannabis Wellness** | `/cannabis` | 19+ age verification required |
| **Fireworks** | `/fireworks` | 18+ age verification required |

Each view has its own colour palette, typography, and editorial voice — but shares the same inventory engine, notification system, and staff tooling.

---

## The Global Header

Every page on the platform shares the same persistent header. It contains two elements:

### Navigation Menu (☰)

The hamburger icon in the top-left corner opens the navigation drawer. It contains:

- **Home** — the platform landing page
- **Pawn**, **Cannabis**, **Fireworks** — the three storefronts
- **Tobacco** — coming soon
- **Admin Dashboard** — visible only to staff accounts

The page title to the right of the icon always reflects your current location — for example, **The Pawn Shop · Cannabis** — so you always know which view you are in.

### Account Menu

The circle in the top-right corner is your account control:

- **Not signed in:** tap to sign in or create an account
- **Signed in:** tap to access your profile or sign out
- Staff accounts will also see a notification bell alongside the circle

---

## Accessing the Admin Area

All staff tools are accessible from a single entry point: the navigation drawer.

1. Tap **☰** in the top-left corner of any page
2. Select **Admin Dashboard** at the foot of the drawer
3. From the dashboard, use the sidebar or Quick Actions to navigate to any admin tool

> The Admin Dashboard link is only shown to accounts with a staff role (`admin`, `manager`, `inventory_staff`, or `marketing_staff`). If you do not see it, contact your Admin.

---

## Age Verification

The Cannabis and Fireworks storefronts require age confirmation before any content is displayed. The gate is enforced at the router level — it cannot be bypassed by navigating directly to a product URL.

- Every pass and fail is logged to the audit trail for compliance purposes
- Verification is session-scoped: re-opening the browser will prompt again
- No personal data is collected during the gate

See [Age Verification](/compliance/age-gates) for full details.

---

## Where to Go Next

| I want to… | Go to |
|---|---|
| Receive and publish a new item | [Intake Process](/inventory/intake) |
| Manage customer profiles and VIPs | [CRM Dashboard](/admin/crm) |
| Create editorial content | [Editorial CMS](/admin/editorial-cms) |
| See live inventory and stats | [Admin Dashboard](/admin/dashboard) |
| Review incoming pawn enquiries | [Pawn Inbox](/admin/pawn-inbox) |
| Manage my shift schedule | [My Schedule](/staff/personal-schedule) |
| Set up a saved search alert | [Alerts & Notifications](/pawn/alerts-notifications) |
