# Secrets Setup — The Pawn Shop

> Complete this once before the first `deploy-dev.yml` run and before opening any Codespace.
> All values come from the Firebase console — no values are stored in this file.

---

## Overview

Two sets of secrets are required:

| Set | Where to set | Used by |
|---|---|---|
| **GitHub Actions Secrets** (14) | GitHub repo → Settings → Secrets and variables → Actions | CI/CD deploy workflows |
| **GitHub Codespaces Secrets** (6) | GitHub → Settings → Codespaces (scoped to this repo) | `.env.local` in Codespace |

---

## Step 1 — Get Values from Firebase Console

You need values from two Firebase projects.

### For `nats-rack` (dev)

1. Open [Firebase Console](https://console.firebase.google.com) → select **rpd-pawn-shop-dev** (project ID: `nats-rack`)
2. Click the gear icon → **Project settings** → **General** tab
3. Scroll to **Your apps** → find the web app → click **Config**
4. Copy these values:

```
apiKey            → DEV_FIREBASE_API_KEY
authDomain        → DEV_FIREBASE_AUTH_DOMAIN
projectId         → nats-rack (hardcoded — verify it matches)
storageBucket     → DEV_FIREBASE_STORAGE_BUCKET
messagingSenderId → DEV_FIREBASE_MESSAGING_SENDER_ID
appId             → DEV_FIREBASE_APP_ID
```

### For `the-addicts-agenda` (prod)

1. Switch to **rpd-pawn-shop-prod** (project ID: `the-addicts-agenda`)
2. Same steps as above — copy the prod values:

```
apiKey            → PROD_FIREBASE_API_KEY
authDomain        → PROD_FIREBASE_AUTH_DOMAIN
projectId         → the-addicts-agenda (hardcoded — verify it matches)
storageBucket     → PROD_FIREBASE_STORAGE_BUCKET
messagingSenderId → PROD_FIREBASE_MESSAGING_SENDER_ID
appId             → PROD_FIREBASE_APP_ID
```

### Service Account Keys

Required for GitHub Actions to deploy to Firebase Hosting.

**For dev (`nats-rack`):**
1. Firebase Console → rpd-pawn-shop-dev → Project settings → **Service accounts** tab
2. Click **Generate new private key** → download the JSON file
3. Copy the entire JSON content → this is `FIREBASE_SERVICE_ACCOUNT_DEV`

**For prod (`the-addicts-agenda`):**
1. Same steps on rpd-pawn-shop-prod
2. Copy entire JSON content → this is `FIREBASE_SERVICE_ACCOUNT_PROD`

---

## Step 2 — Set GitHub Actions Secrets

Navigate to: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

Set each of these 14 secrets:

| Secret name | Value source |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_DEV` | Full JSON from nats-rack service account |
| `FIREBASE_SERVICE_ACCOUNT_PROD` | Full JSON from the-addicts-agenda service account |
| `DEV_FIREBASE_API_KEY` | nats-rack web app config |
| `DEV_FIREBASE_AUTH_DOMAIN` | nats-rack web app config |
| `DEV_FIREBASE_PROJECT_ID` | `nats-rack` |
| `DEV_FIREBASE_STORAGE_BUCKET` | nats-rack web app config |
| `DEV_FIREBASE_MESSAGING_SENDER_ID` | nats-rack web app config |
| `DEV_FIREBASE_APP_ID` | nats-rack web app config |
| `PROD_FIREBASE_API_KEY` | the-addicts-agenda web app config |
| `PROD_FIREBASE_AUTH_DOMAIN` | the-addicts-agenda web app config |
| `PROD_FIREBASE_PROJECT_ID` | `the-addicts-agenda` |
| `PROD_FIREBASE_STORAGE_BUCKET` | the-addicts-agenda web app config |
| `PROD_FIREBASE_MESSAGING_SENDER_ID` | the-addicts-agenda web app config |
| `PROD_FIREBASE_APP_ID` | the-addicts-agenda web app config |

- [ ] All 14 secrets set

---

## Step 3 — Set GitHub Codespaces Secrets

Navigate to: **GitHub → Settings → Codespaces → New secret** (scope to the `pawn-shop` repo)

These 6 secrets populate `.env.local` automatically when a Codespace opens:

| Secret name | Value source |
|---|---|
| `VITE_FIREBASE_API_KEY` | Same as `DEV_FIREBASE_API_KEY` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Same as `DEV_FIREBASE_AUTH_DOMAIN` |
| `VITE_FIREBASE_PROJECT_ID` | `nats-rack` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Same as `DEV_FIREBASE_STORAGE_BUCKET` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Same as `DEV_FIREBASE_MESSAGING_SENDER_ID` |
| `VITE_FIREBASE_APP_ID` | Same as `DEV_FIREBASE_APP_ID` |

> Note: `VITE_USE_EMULATORS` defaults to `true` in `.env.example` — no secret needed.

- [ ] All 6 Codespaces secrets set

---

## Step 4 — Create `.env.local` in Codespace

In the Codespace terminal:

```bash
cp .env.example .env.local
```

Then fill in the values from the nats-rack Firebase project (same as the Codespaces secrets above). If Codespaces secrets are set, the values may already be available as environment variables — check with `echo $VITE_FIREBASE_API_KEY`.

Verify it's gitignored:
```bash
git status  # .env.local must NOT appear here
```

- [ ] `.env.local` exists and is not tracked by git

---

## Step 5 — Deploy Firestore Rules and Indexes

After secrets are in place and Firebase CLI is authenticated:

```bash
# Confirm CLI is authenticated
firebase login --no-localhost   # or: firebase login (if browser is available)

# Deploy to dev
firebase deploy --only firestore:rules,firestore:indexes --project nats-rack

# Deploy to prod
firebase deploy --only firestore:rules,firestore:indexes --project the-addicts-agenda
```

- [ ] Rules deployed to nats-rack — exits 0
- [ ] Rules deployed to the-addicts-agenda — exits 0

---

## Step 6 — Cloud Functions Environment Variables

Cloud Functions read environment variables from `functions/.env` (dev) and `functions/.env.prod` (prod). These are **not** Firebase Secrets — they are plain env files deployed alongside the functions.

Create `functions/.env` for the dev environment:

```
SENDGRID_API_KEY=<your SendGrid API key>
SENDGRID_FROM_EMAIL=<verified sender email, e.g. hello@thepawnshop.ca>
TWILIO_ACCOUNT_SID=<your Twilio Account SID>
TWILIO_AUTH_TOKEN=<your Twilio Auth Token>
TWILIO_FROM_NUMBER=<your Twilio phone number, e.g. +16135550123>
SITE_URL=https://nats-rack.web.app
```

Create `functions/.env.prod` for the production environment:

```
SENDGRID_API_KEY=<prod SendGrid API key>
SENDGRID_FROM_EMAIL=<prod verified sender email>
TWILIO_ACCOUNT_SID=<prod Twilio Account SID>
TWILIO_AUTH_TOKEN=<prod Twilio Auth Token>
TWILIO_FROM_NUMBER=<prod Twilio phone number>
SITE_URL=https://thepawnshop.ca
```

> `SITE_URL` is used by `sendWeeklyDigest` (E12) to build item links in the digest email. Dev points to nats-rack.web.app; prod will point to the eventual custom domain.

Both `.env` files are gitignored. Add both to Codespaces secrets or a local password manager.

- [ ] `functions/.env` created with all 6 values (dev)
- [ ] `functions/.env.prod` created with all 6 values (prod)

---

## Step 7 — Install Playwright Browser Binary

After running `npm install`, install the Chromium browser binary for Playwright and Lighthouse CI:

```bash
npx playwright install chromium
```

This is required to run `npm run test:a11y` (axe-core) and `npm run test:lhci` (Lighthouse CI) locally.

- [ ] `npx playwright install chromium` completed ✅

---

## Verification Checklist

- [ ] All 14 GitHub Actions secrets set
- [ ] All 6 Codespaces secrets set
- [ ] `.env.local` created and gitignored
- [ ] `functions/.env` created with 6 values (dev)
- [ ] `functions/.env.prod` created with 6 values (prod)
- [ ] Firestore rules deployed to nats-rack
- [ ] Firestore rules deployed to the-addicts-agenda
- [ ] `deploy-dev.yml` triggered by a push and passed ✅
- [ ] `npx playwright install chromium` completed ✅

---

*The Pawn Shop · docs/SECRETS_SETUP.md · v1.1*
