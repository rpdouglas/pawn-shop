#!/usr/bin/env python3
"""
The Pawn Shop — Scaffold Script
================================
Run this in a fresh GitHub Codespace terminal to create the entire
project structure: Firebase config, security rules, GitHub Actions
workflows, devcontainer, and all docs.

Usage:
    python3 scaffold.py

The script is safe to re-run — it will not overwrite files that already exist.
"""

import os
import sys

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

def write(path, content):
    """Write content to path, creating parent dirs. Skips if file exists."""
    if os.path.exists(path):
        print(f"  {YELLOW}skip{RESET}  {path}  (already exists)")
        return
    os.makedirs(os.path.dirname(path) if os.path.dirname(path) else ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  {GREEN}create{RESET} {path}")

def header(title):
    print(f"\n{BOLD}── {title}{RESET}")

# ─────────────────────────────────────────────────────────────────────────────
# File contents
# ─────────────────────────────────────────────────────────────────────────────

FILES = {}

# ── .devcontainer/devcontainer.json ──────────────────────────────────────────
FILES[".devcontainer/devcontainer.json"] = """\
{
  "name": "The Pawn Shop — Dev",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",

  "features": {
    "ghcr.io/devcontainers/features/java:1": {
      "version": "17"
    }
  },

  "forwardPorts": [5173, 9099, 8080, 9199, 5001, 4000],

  "portsAttributes": {
    "5173": { "label": "Vite Dev Server",        "onAutoForward": "openBrowserOnce" },
    "4000": { "label": "Firebase Emulator UI",   "onAutoForward": "notify" },
    "8080": { "label": "Firestore Emulator",     "onAutoForward": "silent" },
    "9099": { "label": "Auth Emulator",          "onAutoForward": "silent" },
    "9199": { "label": "Storage Emulator",       "onAutoForward": "silent" },
    "5001": { "label": "Functions Emulator",     "onAutoForward": "silent" }
  },

  "postCreateCommand": "npm install -g firebase-tools@latest",

  "customizations": {
    "vscode": {
      "extensions": [
        "firebase.vscode-firebase-tools",
        "GoogleCloudTools.cloudcode",
        "esbenp.prettier-vscode",
        "dbaeumer.vscode-eslint",
        "bradlc.vscode-tailwindcss",
        "christian-kohler.path-intellisense",
        "formulahendry.auto-rename-tag",
        "ms-vscode.vscode-typescript-next",
        "GitHub.vscode-pull-request-github",
        "google.geminicodeassist"
      ],
      "settings": {
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "typescript.preferences.importModuleSpecifier": "relative"
      }
    }
  },

  "remoteEnv": {
    "FIREBASE_PROJECT": "nats-rack"
  }
}
"""

# ── .firebaserc ───────────────────────────────────────────────────────────────
FILES[".firebaserc"] = """\
{
  "projects": {
    "default": "nats-rack",
    "dev":     "nats-rack",
    "prod":    "the-addicts-agenda"
  }
}
"""

# ── firebase.json ─────────────────────────────────────────────────────────────
FILES["firebase.json"] = """\
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }],
    "headers": [{
      "source": "**/*.@(js|css)",
      "headers": [{ "key": "Cache-Control", "value": "max-age=31536000" }]
    }]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": [{
    "source": "functions",
    "codebase": "default",
    "ignore": ["node_modules", ".git", "firebase-debug.log", "firebase-debug.*.log"],
    "predeploy": ["npm --prefix \\"$RESOURCE_DIR\\" run build"]
  }],
  "emulators": {
    "auth":      { "host": "0.0.0.0", "port": 9099 },
    "firestore": { "host": "0.0.0.0", "port": 8080 },
    "storage":   { "host": "0.0.0.0", "port": 9199 },
    "functions": { "host": "0.0.0.0", "port": 5001 },
    "hosting":   { "host": "0.0.0.0", "port": 5002 },
    "ui":        { "host": "0.0.0.0", "port": 4000, "enabled": true },
    "singleProjectMode": true
  }
}
"""

# ── firestore.rules ───────────────────────────────────────────────────────────
FILES["firestore.rules"] = """\
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ── Helpers ──────────────────────────────────────────────────────────────

    function isSignedIn() {
      return request.auth != null;
    }

    function hasRole(role) {
      return isSignedIn() && request.auth.token[role] == true;
    }

    function isStaff() {
      return hasRole('admin') || hasRole('manager') || hasRole('inventory_staff');
    }

    function isAdmin() {
      return hasRole('admin');
    }

    function isOwner(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }

    // ── items/{id} ────────────────────────────────────────────────────────────
    // Public read when active and no police hold. Staff write. Admin for sensitive fields.

    match /items/{itemId} {
      allow read: if resource.data.status == 'active'
                     && resource.data.policeHold != true;
      allow read: if isStaff();
      allow create, update: if isStaff()
                               && !request.resource.data.diff(resource.data).affectedKeys()
                                   .hasAny(['policeHold', 'serialBlacklistFlag'])
                            || isAdmin();
      allow delete: if isAdmin();
      // aiDescription is never readable by customers
      allow read: if isStaff() || resource.data.keys().hasAll(['aiDescription']) == false;
    }

    // ── pawnRequests/{id} ─────────────────────────────────────────────────────
    match /pawnRequests/{reqId} {
      allow create: if isSignedIn();
      allow read, update: if isStaff();
      allow delete: if isAdmin();
    }

    // ── reservations/{id} ────────────────────────────────────────────────────
    match /reservations/{resId} {
      allow create: if isSignedIn();
      allow read, update: if isStaff() || isOwner(resource.data.uid);
      allow delete: if isAdmin();
    }

    // ── users/{uid} ──────────────────────────────────────────────────────────
    match /users/{uid} {
      allow read: if isOwner(uid) || isAdmin();
      allow create: if isOwner(uid);
      allow update: if isOwner(uid)
                       && !request.resource.data.diff(resource.data).affectedKeys()
                           .hasAny(['role', 'vipFlag', 'resellerTier', 'lifetimeValue'])
                    || isAdmin();
    }

    // ── auditLogs/{id} — immutable, no delete ever ───────────────────────────
    match /auditLogs/{logId} {
      allow create: if isSignedIn();
      allow read: if isAdmin();
      allow update, delete: if false;
    }

    // ── serialBlacklist/{id} ─────────────────────────────────────────────────
    match /serialBlacklist/{serialId} {
      allow read: if isStaff();
      allow write: if isAdmin();
    }

    // ── campaigns/{id} ───────────────────────────────────────────────────────
    match /campaigns/{campaignId} {
      allow read: if true;
      allow write: if isStaff();
    }

    // ── savedSearches/{id} ───────────────────────────────────────────────────
    match /savedSearches/{searchId} {
      allow read, write: if isOwner(resource.data.uid);
      allow read: if isStaff();
    }

    // ── disputes/{id} ────────────────────────────────────────────────────────
    match /disputes/{disputeId} {
      allow create: if isSignedIn();
      allow read, update: if isStaff() || isOwner(resource.data.uid);
      allow delete: if isAdmin();
    }

    // ── articles/{id} ────────────────────────────────────────────────────────
    match /articles/{articleId} {
      allow read: if resource.data.status == 'published';
      allow read: if isStaff() || hasRole('marketing_staff');
      allow write: if isAdmin() || hasRole('marketing_staff');
    }

    // ── preorders/{id} ───────────────────────────────────────────────────────
    match /preorders/{preorderId} {
      allow create: if isSignedIn();
      allow read, update: if isStaff() || isOwner(resource.data.uid);
      allow delete: if isAdmin();
    }

    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
"""

# ── firestore.indexes.json ────────────────────────────────────────────────────
FILES["firestore.indexes.json"] = """\
{
  "indexes": [
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "viewTag",    "order": "ASCENDING" },
        { "fieldPath": "status",     "order": "ASCENDING" },
        { "fieldPath": "createdAt",  "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "viewTag",        "order": "ASCENDING" },
        { "fieldPath": "status",         "order": "ASCENDING" },
        { "fieldPath": "trendingScore",  "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "searchTokens", "arrayConfig": "CONTAINS" },
        { "fieldPath": "status",       "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "items",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "policeHold", "order": "ASCENDING" },
        { "fieldPath": "status",     "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "pawnRequests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status",    "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "auditLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "eventType", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "savedSearches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "viewTag", "order": "ASCENDING" },
        { "fieldPath": "active",  "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
"""

# ── storage.rules ─────────────────────────────────────────────────────────────
FILES["storage.rules"] = """\
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    // Item images — public read, staff write
    match /items/{itemId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && (request.auth.token.admin == true
                    || request.auth.token.manager == true
                    || request.auth.token.inventory_staff == true);
    }

    // Pawn request attachments — authenticated read/write
    match /pawn-requests/{requestId}/{allPaths=**} {
      allow read:  if request.auth != null;
      allow write: if request.auth != null;
    }

    // Deny everything else
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
"""

# ── .gitignore ────────────────────────────────────────────────────────────────
FILES[".gitignore"] = """\
# Dependencies
node_modules/
functions/node_modules/

# Build output
dist/
functions/lib/

# Environment files — never commit these
.env
.env.local
.env.production
.env.*.local
*.env

# Firebase
.firebase/
firebase-debug.log
firestore-debug.log
ui-debug.log
storage-debug.log
functions-debug.log
.firestore-data/

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/settings.json
*.swp
*.swo

# TypeScript
*.tsbuildinfo

# Logs
*.log
npm-debug.log*
"""

# ── .env.example ─────────────────────────────────────────────────────────────
FILES[".env.example"] = """\
# The Pawn Shop — Environment Variables
# These are populated automatically in Codespaces via Codespaces Secrets.
# For local dev (if ever needed): copy to .env.local and fill in values.
# NEVER commit .env.local to git.

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_USE_EMULATORS=true
"""

# ── .github/workflows/deploy-dev.yml ─────────────────────────────────────────
FILES[".github/workflows/deploy-dev.yml"] = """\
name: Deploy → Dev

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'public/**'
      - 'package.json'
      - 'vite.config.ts'
      - 'index.html'
      - 'firebase.json'
      - 'firestore.rules'
      - 'firestore.indexes.json'
      - 'storage.rules'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check package.json exists
        id: check
        run: |
          if [ ! -f package.json ]; then
            echo "skip=true" >> $GITHUB_OUTPUT
            echo "No package.json yet — skipping. Scaffold the Vite app first."
          else
            echo "skip=false" >> $GITHUB_OUTPUT
          fi

      - name: Setup Node 20
        if: steps.check.outputs.skip != 'true'
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        if: steps.check.outputs.skip != 'true'
        run: npm ci

      - name: Build
        if: steps.check.outputs.skip != 'true'
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY:            ${{ secrets.DEV_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN:        ${{ secrets.DEV_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID:         ${{ secrets.DEV_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET:     ${{ secrets.DEV_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.DEV_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID:             ${{ secrets.DEV_FIREBASE_APP_ID }}

      - name: Deploy to Firebase Dev
        if: steps.check.outputs.skip != 'true'
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_DEV }}
          projectId: nats-rack
          channelId: live
"""

# ── .github/workflows/deploy-prod.yml ────────────────────────────────────────
FILES[".github/workflows/deploy-prod.yml"] = """\
name: Deploy → Prod

on:
  workflow_dispatch:
    inputs:
      confirm:
        description: 'Type DEPLOY to confirm production deployment'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: ${{ github.event.inputs.confirm == 'DEPLOY' }}
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node 20
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY:            ${{ secrets.PROD_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN:        ${{ secrets.PROD_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID:         ${{ secrets.PROD_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET:     ${{ secrets.PROD_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.PROD_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID:             ${{ secrets.PROD_FIREBASE_APP_ID }}

      - name: Deploy to Firebase Prod
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_PROD }}
          projectId: the-addicts-agenda
          channelId: live
"""

# ── README.md ─────────────────────────────────────────────────────────────────
FILES["README.md"] = """\
# The Pawn Shop

Multi-vertical retail platform — **Pawn · Cannabis · Fireworks**
Cornwall Island, Akwesasne · *"Dapper. Debonair. Distinctly Akwesasne."*

---

## Development environment

This project runs entirely in **GitHub Codespaces**. No local setup required.

Open the Codespace → two terminal tabs:

```bash
# Tab 1 — Firebase emulators
firebase emulators:start --project nats-rack

# Tab 2 — Vite dev server
npm run dev
```

Then open the **Ports** panel and click the link for port 5173.

---

## Environments

| | Firebase project | Deploy trigger |
|---|---|---|
| **Dev** | `nats-rack` | Auto on push to `main` |
| **Prod** | `the-addicts-agenda` | Actions → Deploy → Prod → type `DEPLOY` |

---

## Project structure

```
/
├── src/                     React app
├── functions/               Cloud Functions (TypeScript)
├── docs/
│   ├── CONTEXT.md           Paste at the start of every AI session
│   ├── EPICS.md             Build roadmap — 19 epics as checklists
│   ├── firestore-schema.md  Canonical schema — never invent fields
│   ├── COMPLIANCE.md        Age gates, PIPEDA, police holds
│   └── DECISIONS.md         Rolling tech decision log
├── .devcontainer/           Codespaces config
├── .github/workflows/       deploy-dev.yml + deploy-prod.yml
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
└── storage.rules
```

---

## AI assistant sessions

Start every session by pasting `docs/CONTEXT.md`.

Rules: no inventing schema fields · CSS tokens for theming · AI API keys via Cloud Functions only · compliance features need human review before prod deploy.

---

*The Pawn Shop · Cornwall Island, Akwesasne*
"""

# ── docs/CONTEXT.md ───────────────────────────────────────────────────────────
FILES["docs/CONTEXT.md"] = """\
# The Pawn Shop — Context

> **Paste this file at the start of every AI coding session.**
> Keep it short. Update it when things change.

---

## What This Is

A multi-vertical retail website for **The Pawn Shop**, Cornwall Island, Akwesasne.
Three distinct business lines share one codebase:

| View | Route | Age Gate | Theme Class |
|------|-------|----------|-------------|
| Pawn | `/pawn` | None | `.view-pawn` |
| Cannabis | `/cannabis` | **19+** | `.view-cannabis` |
| Fireworks | `/fireworks` | **18+** | `.view-fireworks` |

Brand voice: **"Dapper. Debonair. Distinctly Akwesasne."**

---

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind v4
- **Database:** Cloud Firestore (`nats-rack` / `the-addicts-agenda`)
- **Auth:** Firebase Auth (email/password + Google SSO)
- **Functions:** Cloud Functions v2 (Node/TypeScript) in `/functions`
- **Hosting:** Firebase Hosting
- **Storage:** Firebase Storage (item images, pawn attachments)
- **Dev environment:** GitHub Codespaces + Firebase Emulator Suite

---

## Design Tokens (Tailwind v4 `@theme`)

```css
.view-pawn      { --color-primary: #C8A14A; --color-bg: #080706; }
.view-cannabis  { --color-primary: #7B4FA0; --color-bg: #1A0D2E; }
.view-fireworks { --color-primary: #C0392B; --color-bg: #1A0A0A; }
```

Fonts — Pawn: Playfair Display / IM Fell English
        Cannabis: Cormorant Garamond / DM Sans
        Fireworks: Bebas Neue / Oswald

**Rule:** Never hardcode hex values. Always use `var(--color-primary)`.
**Rule:** Never use JS conditionals for theming. Use the `.view-*` CSS class from ViewContext.

---

## Firestore Collections (never invent fields — see `firestore-schema.md`)

| Collection | Purpose |
|---|---|
| `items/{id}` | All inventory across all views |
| `pawnRequests/{id}` | Customer pawn enquiry submissions |
| `reservations/{id}` | Click-and-collect |
| `users/{uid}` | Customer profiles + CRM |
| `auditLogs/{id}` | Immutable event log |
| `campaigns/{id}` | Seasonal campaign scheduler |
| `serialBlacklist/{id}` | Flagged serial numbers |
| `savedSearches/{id}` | Customer saved searches + alert subscriptions |
| `disputes/{id}` | Returns + post-sale disputes |
| `articles/{id}` | Editorial CMS |
| `preorders/{id}` | Fireworks pre-orders |

---

## Roles (Firebase Auth custom claims)

`admin` · `manager` · `inventory_staff` · `marketing_staff` · `customer`

Staff = admin | manager | inventory_staff. MFA mandatory for all staff roles.

---

## Compliance — Non-Negotiable

1. **Age gates** at route level. Every pass/fail logged to `auditLogs`.
2. **No PII** in analytics, console logs, or Firestore logs.
3. **`policeHold: true`** hides item from public immediately. Admin-only write.
4. **Serial blacklist** checked on every pawn form submit and item intake.
5. **`rare-find` / `limited-edition`** staff-set only. No manufactured scarcity.
6. **Kanien'keha language** — AI must never generate it. Community review required.
7. **`aiDescription`** is a draft — never readable by customers.
8. **`auditLogs`** — no delete, ever. Create-only via Cloud Functions.
9. All AI API keys (Claude, Gemini) go through Cloud Functions. Never on the client.

---

## AI Assistant Rules

- Schema is in `docs/firestore-schema.md`. Do not invent fields.
- Styling uses CSS tokens. Do not use inline JS conditionals for view theming.
- Note tech choices in `docs/DECISIONS.md` when a decision is made.
- Flag compliance-sensitive features for human review before deploying to prod.
"""

# ── docs/COMPLIANCE.md ────────────────────────────────────────────────────────
FILES["docs/COMPLIANCE.md"] = """\
# Compliance

> Non-negotiable rules. Read before touching cannabis, fireworks, pawn intake, or any customer data.

---

## Age Gates

| View | Required Age | Gate Location |
|------|-------------|---------------|
| `/cannabis` | 19+ | Route level — before any cannabis data renders |
| `/fireworks` | 18+ | Route level — before any fireworks data renders |

Rules:
- Enforced at the **router level**, not just on individual components
- Every gate pass/fail written to `auditLogs/{id}` (`eventType: 'age_gate_pass'` or `'age_gate_fail'`)
- Not bypassable by direct URL navigation
- Session-scoped only — do not persist age gate status

---

## PIPEDA (Canada's Privacy Law)

- **No PII in logs** — names, emails, phone numbers, IDs must never appear in Analytics, console, or `auditLogs.details`
- **Retain only what's needed** — pawn request data: business relationship duration + 1 year; age verification: compliance audit period only
- **`purgeExpiredData` Cloud Function** must enforce retention on a schedule (document in `DECISIONS.md` when implemented)
- **No third-party data sharing** without explicit consent

---

## Police Holds

When a serial number is flagged by law enforcement:
1. Set `items/{id}.policeHold = true` (admin-only write — enforced by Firestore rule)
2. Item disappears from all public views immediately
3. Item cannot be archived or deleted while `policeHold == true`
4. `auditLogs` entry written: `eventType: 'police_hold_set'`
5. Admin email alert fires via Cloud Function

---

## Serial Blacklist

- `serialBlacklist/{id}` stores flagged serials
- Checked on every pawn form submit (`onPawnRequestCreate` Cloud Function)
- Checked on every item intake in admin form
- A match sets `serialBlacklistFlag: true` and triggers admin alert
- Admin writes, staff reads only

---

## Scarcity Signals

- `rare-find` and `limited-edition` tags are staff-set only (Firestore security rule enforced)
- Manufactured urgency is prohibited — every signal must reflect reality

---

## Kanien'keha Language (Mohawk)

- AI assistants must **never** generate Kanien'keha copy
- All indigenous language content requires community review before publication
- `articles/{id}.indigenousLanguageReviewed` must be `true` before publishing any article with Kanien'keha

---

## AI-Generated Content

- `aiDescription` is a draft field — never shown to customers
- Staff must explicitly move AI content to `description` before it becomes public
- AI price suggestions are guidance only — never a published price
- All AI API calls go through Cloud Functions — API keys never on the client

---

## Audit Logs

- `auditLogs/{id}` is immutable — no update, no delete, ever
- Written via Firebase Admin SDK in Cloud Functions only
- Admin-only read
- Required events: `login` `logout` `role_change` `mfa_enrolled` `age_gate_pass` `age_gate_fail` `police_hold_set` `item_published` `price_override`

---

## Jurisdiction Note

The Pawn Shop operates on Akwesasne — federal, provincial (Ontario/Quebec), and Mohawk Nation jurisdictions overlap.
Get legal counsel review before launch for: cannabis retail licensing, fireworks regulations, indigenous business law, PIPEDA vs. provincial privacy law overlap.
Note the outcome in `DECISIONS.md`.
"""

# ── docs/DECISIONS.md ─────────────────────────────────────────────────────────
FILES["docs/DECISIONS.md"] = """\
# Decisions

> One-liner log of technical and architectural decisions.
> Add a line whenever you make a meaningful choice. Date it. That's it.
> Replaces formal ADR documents.

---

## Format

```
YYYY-MM-DD — Decision. Brief reason.
```

---

## Log

2026-05-16 — Primary dev environment is GitHub Codespaces. No local setup required or assumed.

2026-05-16 — Firestore prefix tokens (`searchTokens[]`) for search instead of Algolia. Revisit if search UX becomes a problem.

2026-05-16 — Two Firebase projects: `nats-rack` (dev) and `the-addicts-agenda` (prod). No staging — overkill for one developer.

2026-05-16 — GitHub Issues as a simple numbered task list. No labels, no milestones, no Projects board.

2026-05-16 — No Storybook. Build components in context, iterate in the app.

2026-05-16 — `deploy-prod.yml` requires typing "DEPLOY" as confirmation. Intentional friction — prod deploys should be deliberate.

2026-05-16 — `aiDescription` is draft-only, never customer-facing, enforced by Firestore security rules. Staff must promote to `description` before publishing.

2026-05-16 — All AI API calls (Claude/Gemini) go through Cloud Functions. API keys never on the client.

2026-05-16 — Prices stored in CAD cents (integer) to avoid floating-point errors.

2026-05-16 — firebase.json emulators bound to `0.0.0.0` so they are reachable from Codespaces port forwarding.

---

*Add new entries above this line.*
"""

# ── docs/EPICS.md ─────────────────────────────────────────────────────────────
FILES["docs/EPICS.md"] = """\
# Epics

> Build roadmap. Work top to bottom — each phase unblocks the next.
> Tick tasks as you go. Open a GitHub Issue when you start each epic.

---

## Phase 1 — Foundation

### E01 · Dev Environment Setup
- [ ] Codespace opens and Firebase CLI is available (`firebase --version`)
- [ ] Firebase Emulator Suite starts without errors
- [ ] Vite dev server starts and app loads on port 5173
- [ ] `deploy-dev.yml` triggers on push and deploys to `nats-rack`
- [ ] GitHub Secrets set (14 Actions secrets + 6 Codespaces secrets)
- [ ] `.env.local` populated from Codespaces Secrets and excluded from git
- [ ] Firestore rules and indexes deployed to both projects

### E02 · Three-View Design System
- [ ] Tailwind v4 `@theme` tokens — Pawn (`#C8A14A` / `#080706`)
- [ ] Tailwind v4 `@theme` tokens — Cannabis (`#7B4FA0` / `#1A0D2E`)
- [ ] Tailwind v4 `@theme` tokens — Fireworks (`#C0392B` / `#1A0A0A`)
- [ ] `ViewContext` provider reads URL prefix, injects `.view-*` CSS class on root
- [ ] Core components: Button, Badge, Card, Modal, Input, Table (Pawn base)
- [ ] Cannabis component variants (cinematic hero, mood card, luxury product card)
- [ ] Fireworks component variants (countdown timer, bundle card, urgency badge)
- [ ] WCAG AA contrast passes on all three palettes (run axe-core in browser)
- [ ] PWA manifest configured (per-view icons + theme colours)

### E03 · Auth & Staff Roles
- [ ] Firebase Auth: email/password + Google SSO
- [ ] Five custom claims: `admin` `manager` `inventory_staff` `marketing_staff` `customer`
- [ ] Cloud Function to assign/revoke roles
- [ ] `AuthContext` and `ProtectedRoute` components
- [ ] MFA enforced for all staff — TOTP mandatory (**hard compliance requirement**)
- [ ] MFA bypass tested and confirmed impossible
- [ ] `auditLogs` writing: `login` `logout` `role_change` `mfa_enrolled`

---

## Phase 2 — Core Product

### E04 · Inventory Schema & Intake
- [ ] `items/{id}` v3 schema documented in `firestore-schema.md` (update file first)
- [ ] Admin intake form: receive → condition grade → photo upload → pricing → publish
- [ ] Multi-image upload to Firebase Storage (watermark via Cloud Function, not client-side)
- [ ] Hold system: status → `reserved` + `holdExpiresAt`
- [ ] `resetExpiredHolds` Cloud Function (scheduled, every 30 min)
- [ ] QR label generation per item
- [ ] `searchTokens[]` array built from title + category on every write
- [ ] Firestore rules: public read only when `status == 'active'` and `policeHold != true`

### E05 · Three-View Storefronts
- [ ] `/pawn` `/cannabis` `/fireworks` routes with correct ViewContext theme
- [ ] Homepage per view: hero, featured items, search bar
- [ ] Shop/listing page with prefix search (via `searchTokens`)
- [ ] Item detail page: image gallery, condition, price, enquiry CTA
- [ ] Age gate at route level: `/cannabis` (19+) `/fireworks` (18+)
- [ ] Every age gate pass/fail logged to `auditLogs`
- [ ] Mobile-responsive across all three views

### E07 · Pawn Form & Inbox
- [ ] Customer pawn enquiry form (item description, photos, contact info)
- [ ] `onPawnRequestCreate` Cloud Function: serial blacklist check, police hold flag if match, admin alert
- [ ] `pawnRequests/{id}` collection written on submit
- [ ] Staff admin inbox: view requests, update status, add notes

### E08 · Click & Collect / Contact
- [ ] Click-and-collect request form on item detail pages
- [ ] `reservations/{id}` collection + status flow (pending → confirmed → completed)
- [ ] Staff confirms/declines pickup window
- [ ] Contact page with form routing to staff email
- [ ] Google Maps embed (store location)

---

## Phase 3 — Discovery & Merchandising

### E13 · Merchandising Engine
- [ ] Staff picks admin UI
- [ ] `calculateTrendingScore` Cloud Function (view + save + enquiry count)
- [ ] Auto-tagging: `just-arrived` (< 48h), `rare-find` (staff-set only)
- [ ] Collection pages per view (Cannabis: Relax/Focus/Social/Ceremony; Fireworks: bundles)
- [ ] Quick-view modal (pre-fetch on hover)
- [ ] Related items on detail page (same category + view, sorted by trending score)
- [ ] Masonry grid on Pawn homepage; vertical video on Cannabis + Fireworks pages
- [ ] Search decision: keep Firestore prefix tokens or add Algolia — log in `DECISIONS.md`

### E06 · eBay Cross-Posting
- [ ] Push item to eBay from admin (Cloud Function — API key never on client)
- [ ] `ebayListingId` stored on `items/{id}`
- [ ] Status sync: sold on eBay → item sold in Firestore
- [ ] Basic eBay category mapping per `viewTag`

### E09 · Quality, Security & Accessibility
- [ ] Firestore security rules audit (all collections)
- [ ] `purgeExpiredData` Cloud Function — PIPEDA retention schedule
- [ ] Serial blacklist admin management UI
- [ ] Keyboard navigability audit across all three views
- [ ] axe-core clean (no failures in browser dev tools)
- [ ] `/accessibility` page live
- [ ] Lighthouse: ≥90 performance, ≥90 accessibility, ≥95 SEO (run in Codespace browser)
- [ ] Kanien'keha copy community-reviewed before any publication

---

## Phase 4 — Conversion & Admin Intelligence

### E10 · Analytics, Feature Flags & Admin Dashboard
- [ ] GA4 custom events: page views per view, item views, enquiry submits, age-gate events, pawn form submits
- [ ] Firebase Remote Config for feature flags
- [ ] Admin dashboard: inventory counts by status + view, pawn request volume, top items
- [ ] `policeHold` flag management in admin (admin-only)
- [ ] UTM parameters captured per session

### E17 · Conversion Optimisation
- [ ] Recently sold strip on homepage (sourced from `onItemSold` Firestore events)
- [ ] Years in business badge + testimonials module
- [ ] Privacy-safe live activity feed (city-level only, rate-limited, no PII)
- [ ] `limited-edition` / `rare-find` display (staff-set only — never manufactured)
- [ ] Hold countdown badge on reserved items

### E14 · Seasonal Campaign Scheduler
- [ ] `campaigns/{id}` collection
- [ ] `activateCampaign` + `deactivateCampaign` Cloud Functions (scheduled)
- [ ] Admin campaign calendar UI
- [ ] Countdown timer component for active campaigns
- [ ] Fireworks pre-order: `preorders/{id}`, payment-on-pickup flow

### E11 · Compliance Programme
- [ ] Age gate audit log entries confirmed working for all gate events
- [ ] `purgeExpiredData` schedule documented in `DECISIONS.md`
- [ ] Jurisdiction legal review scheduled (get counsel before launch)
- [ ] NVDA + VoiceOver spot-check on all three storefronts
- [ ] `/accessibility` page confirmed live

---

## Phase 5 — Retention & Post-Sale

### E15 · CRM & Retention
- [ ] `users/{uid}` CRM fields: `purchaseHistory[]` `inquiryHistory[]` `lifetimeValue` `segments[]`
- [ ] VIP flag + reseller tiers (bronze/silver/gold) — staff-set only
- [ ] Automated follow-ups: 48h staff reminder on pending pawn requests; 72h customer follow-up on quoted items
- [ ] `/admin/crm` dashboard: customer profile view, engagement score
- [ ] Cross-view browsing flag (`crossViewFlag`) tracking

### E12 · Alerts & Notifications
- [ ] `savedSearches/{id}` collection + customer UI to save searches
- [ ] Favourites/wishlist on item detail pages
- [ ] `onItemCreated` Cloud Function: match saved searches, dispatch SMS (Twilio) or email (SendGrid) within 60s
- [ ] In-app notification centre (mark as read)
- [ ] Seasonal reminders + pickup confirmation SMS
- [ ] CASL: `alertOptIn == true` checked before every send
- [ ] Weekly digest email per view

### E16 · Post-Sale Operations
- [ ] Return/dispute ticket form (customer or staff)
- [ ] `disputes/{id}` collection: status, refund log, staff notes
- [ ] eBay disputes pulled from API and manageable in admin
- [ ] Resolving a return updates `items/{id}.status` if item is restocked

---

## Phase 6 — AI & Editorial

### E18 · AI Assistant (Staff-Facing)
- [ ] `generateAIDescription` Cloud Function (callable, Claude or Gemini, staff review gate — no auto-publish)
  - High-value items: prompt includes provenance, cultural context, scarcity
  - Draft saved to `aiDescription` only — Firestore rule prevents customer read
- [ ] eBay title optimiser (AI suggests, staff accepts/edits)
- [ ] Auto-tagging: min 3 suggestions per item, staff confirms
- [ ] Price suggestion: eBay sold comps range, guidance only, never a published price
- [ ] Duplicate detection: alert before publishing if similar item exists

### E19 · Editorial CMS & Brand Narrative
- [ ] `articles/{id}` collection + admin editor + public article pages per view
- [ ] About page + founder story + Akwesasne identity section
- [ ] Warriors of Akwesasne series — first edition
  - **Kanien'keha phrases: community review required — no AI generation**
- [ ] Finds of the Week — first edition, templated for non-technical staff
- [ ] Local SEO landing pages (≥6) with JSON-LD LocalBusiness schema
- [ ] FAQ engine — admin-editable Q&A

---

*The Pawn Shop · Cornwall Island, Akwesasne*
"""

# ── docs/firestore-schema.md ──────────────────────────────────────────────────
FILES["docs/firestore-schema.md"] = """\
# Firestore Schema

> **The only source of truth for field names.**
> No developer or AI assistant may add, rename, or remove a field without updating this file first.
> Schema changes require a one-liner in `DECISIONS.md`.

---

## `items/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | Display title |
| `description` | string | Staff-written, customer-visible |
| `aiDescription` | string | AI draft — **never show to customers** |
| `category` | string | e.g. `electronics`, `jewellery`, `cannabis-flower` |
| `viewTag` | string | Primary view: `pawn` \\| `cannabis` \\| `fireworks` |
| `viewTags` | array\\<string\\> | Multi-view items |
| `status` | string | `active` \\| `reserved` \\| `sold` \\| `archived` |
| `price` | number | CAD cents (e.g. 1999 = $19.99) |
| `condition` | string | `new` \\| `like-new` \\| `good` \\| `fair` \\| `poor` |
| `images` | array\\<string\\> | Firebase Storage URLs (WebP/AVIF, watermarked) |
| `videoUrl` | string | Optional. Cannabis/Fireworks item pages |
| `searchTokens` | array\\<string\\> | Prefix tokens from title + category |
| `serialNumber` | string | Optional |
| `serialBlacklistFlag` | boolean | Admin-only write |
| `policeHold` | boolean | Admin-only write. Hides from public immediately |
| `holdExpiresAt` | timestamp | Set when status = `reserved` |
| `locationId` | string | For future multi-location |
| `isSeasonalItem` | boolean | Ties to campaign scheduler |
| `bundleIds` | array\\<string\\> | Related `items/{id}` for bundles |
| `merchandisingTags` | array\\<string\\> | `just-arrived` \\| `rare-find` \\| `limited-edition` \\| `staff-pick` |
| `provenanceNotes` | string | Cultural/historical context for high-value items |
| `aiPriceSuggestion` | map | `{ low: number, high: number, source: string }` |
| `trendingScore` | number | Computed by Cloud Function |
| `viewCount` | number | Incremented server-side |
| `ebayListingId` | string | Set when pushed to eBay |
| `createdAt` | timestamp | Server timestamp |
| `updatedAt` | timestamp | Server timestamp |
| `publishedBy` | string | UID of staff who published |

---

## `pawnRequests/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `uid` | string | Customer UID (null for guest) |
| `name` | string | |
| `email` | string | |
| `phone` | string | Optional |
| `itemDescription` | string | |
| `serialNumber` | string | Optional |
| `images` | array\\<string\\> | Storage URLs |
| `status` | string | `pending` \\| `reviewed` \\| `quoted` \\| `declined` \\| `completed` |
| `staffNotes` | string | Internal — never show to customer |
| `serialBlacklistHit` | boolean | Set by Cloud Function on create |
| `createdAt` | timestamp | |

---

## `reservations/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `uid` | string | Customer UID |
| `itemId` | string | Reference to `items/{id}` |
| `status` | string | `pending` \\| `confirmed` \\| `declined` \\| `completed` |
| `pickupWindow` | string | e.g. `"2026-06-01 14:00-16:00"` |
| `staffNotes` | string | Internal |
| `createdAt` | timestamp | |

---

## `users/{uid}`

| Field | Type | Notes |
|-------|------|-------|
| `email` | string | |
| `displayName` | string | |
| `role` | string | Mirrors custom claim. Admin-only write |
| `mfaEnrolled` | boolean | |
| `lastLoginAt` | timestamp | |
| `lastLoginIp` | string | Hashed — not plain text |
| `purchaseHistory` | array\\<string\\> | `items/{id}` references |
| `inquiryHistory` | array\\<string\\> | `pawnRequests/{id}` references |
| `lifetimeValue` | number | CAD cents |
| `segments` | array\\<string\\> | e.g. `['vip', 'collector']` |
| `vipFlag` | boolean | Staff-set only |
| `resellerTier` | string | `bronze` \\| `silver` \\| `gold` |
| `alertMethod` | string | `sms` \\| `email` \\| `none` |
| `alertOptIn` | boolean | CASL — must be true before sending alerts |
| `crossViewFlag` | boolean | Browsed multiple views in one session |
| `createdAt` | timestamp | |

---

## `auditLogs/{id}` — immutable, no delete ever

| Field | Type | Notes |
|-------|------|-------|
| `eventType` | string | `login` `logout` `role_change` `mfa_enrolled` `age_gate_pass` `age_gate_fail` `police_hold_set` `item_published` `price_override` |
| `uid` | string | Actor UID |
| `targetId` | string | Optional — item/user being acted on |
| `details` | map | Context. **Never include PII** |
| `createdAt` | timestamp | Server timestamp |

---

## `serialBlacklist/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `serialNumber` | string | The flagged serial |
| `reason` | string | e.g. `"Reported stolen — case #12345"` |
| `addedBy` | string | Admin UID |
| `createdAt` | timestamp | |

---

## `campaigns/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | |
| `viewTag` | string | `pawn` \\| `cannabis` \\| `fireworks` \\| `all` |
| `startDate` | timestamp | |
| `endDate` | timestamp | |
| `active` | boolean | Managed by Cloud Function |
| `discountRule` | map | `{ type: 'percent'\\|'fixed', value: number }` |
| `bannerCopy` | string | |
| `countdownEnabled` | boolean | |
| `createdAt` | timestamp | |

---

## `savedSearches/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `uid` | string | |
| `query` | string | |
| `viewTag` | string | |
| `category` | string | Optional |
| `active` | boolean | Must be true to receive alerts |
| `alertMethod` | string | `sms` \\| `email` |
| `createdAt` | timestamp | |

---

## `disputes/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `uid` | string | |
| `itemId` | string | |
| `type` | string | `return` \\| `dispute` |
| `status` | string | `open` \\| `investigating` \\| `resolved` |
| `description` | string | Customer-written |
| `refundAmount` | number | CAD cents |
| `refundMethod` | string | `cash` \\| `etransfer` \\| `store-credit` |
| `staffNotes` | string | Internal — never surface to customer |
| `ebayDisputeId` | string | If sourced from eBay |
| `createdAt` | timestamp | |
| `resolvedAt` | timestamp | |

---

## `articles/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `title` | string | |
| `slug` | string | URL-safe, unique |
| `body` | string | Rich text |
| `viewTag` | string | |
| `status` | string | `draft` \\| `published` |
| `seoMeta` | map | `{ title: string, description: string }` |
| `publishedAt` | timestamp | |
| `authorUid` | string | |
| `indigenousLanguageReviewed` | boolean | Must be true before publishing Kanien'keha content |

---

## `preorders/{id}`

| Field | Type | Notes |
|-------|------|-------|
| `uid` | string | |
| `itemId` | string | |
| `status` | string | `pending` \\| `confirmed` \\| `ready` \\| `collected` \\| `cancelled` |
| `quantity` | number | |
| `staffNotes` | string | |
| `createdAt` | timestamp | |
"""

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print(f"\n{BOLD}The Pawn Shop — Scaffold{RESET}")
    print("Creating project structure for pawn shop...\n")

    # Confirm we're in the right place (repo root should have .git or be empty)
    cwd = os.getcwd()
    is_git_repo = os.path.isdir(".git")

    if not is_git_repo:
        print(f"{YELLOW}Warning: no .git directory found in {cwd}{RESET}")
        print("Make sure you're running this from the root of your cloned repo.")
        answer = input("Continue anyway? [y/N] ").strip().lower()
        if answer != "y":
            print("Aborted.")
            sys.exit(1)

    # Write all files
    groups = {
        "Devcontainer":      [f for f in FILES if f.startswith(".devcontainer")],
        "GitHub Actions":    [f for f in FILES if f.startswith(".github")],
        "Firebase config":   ["firebase.json", ".firebaserc", "firestore.rules",
                              "firestore.indexes.json", "storage.rules"],
        "Root files":        [".gitignore", ".env.example", "README.md"],
        "Docs":              [f for f in FILES if f.startswith("docs/")],
    }

    written = 0
    skipped = 0

    for group_name, paths in groups.items():
        header(group_name)
        for path in paths:
            if path in FILES:
                existed = os.path.exists(path)
                write(path, FILES[path])
                if existed:
                    skipped += 1
                else:
                    written += 1

    # Summary
    print(f"\n{BOLD}Done.{RESET}")
    print(f"  {GREEN}{written} files created{RESET}")
    if skipped:
        print(f"  {YELLOW}{skipped} files skipped (already existed){RESET}")

    print(f"""
{BOLD}Next steps (run these in the Codespace terminal):{RESET}

  1. Authenticate Firebase:
     {GREEN}firebase login --no-localhost{RESET}

  2. Scaffold the React app:
     {GREEN}npm create vite@latest . -- --template react-ts{RESET}
     (choose "Ignore files and continue" when prompted)

  3. Install all dependencies:
     {GREEN}npm install{RESET}
     {GREEN}npm install firebase{RESET}
     {GREEN}npm install -D tailwindcss @tailwindcss/vite{RESET}

  4. Initialise Cloud Functions:
     {GREEN}firebase init functions{RESET}
     (TypeScript · No ESLint · Yes install deps)

  5. Create .env.local from your Codespaces Secrets:
     {GREEN}cat > .env.local << EOF
VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
VITE_USE_EMULATORS=true
EOF{RESET}

  6. Commit and push everything:
     {GREEN}git add .{RESET}
     {GREEN}git commit -m "init: The Pawn Shop scaffold"{RESET}
     {GREEN}git push{RESET}

  See SETUP-GUIDE.md for the full walkthrough.
""")


if __name__ == "__main__":
    main()