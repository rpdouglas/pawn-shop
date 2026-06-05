# Epic E70: Social Media Campaign Management

## Business Objective
Provide an integrated admin tool for `marketing_staff` to draft, schedule, and publish content to Facebook, Instagram, X (Twitter), and TikTok. Ensure all content undergoes a mandatory Manager/Admin approval cycle before being broadcasted.

---

## The 3 Architectural Approaches

### Strategy A: Manual Posting with Workflow Tracker (Lightweight)
- **Concept:** We build a `socialPosts` collection in Firestore. Marketing staff upload their Canva files and write copy. The post sits in a "Pending Review" queue.
- **Approval:** A Manager clicks "Approve". 
- **Publishing:** The Marketing Staff manually opens the native TikTok/Instagram/X apps, downloads the approved media/copy, and posts it manually.
- **Pros:** Zero third-party API costs. Allows perfect utilization of native app features (trending audio on TikTok, X threads).
- **Cons:** Highly manual; breaks the illusion of a fully automated software platform.

### Strategy B: Unified Aggregator API — Ayrshare / Buffer (Recommended & Selected)
- **Concept:** We build the approval workflow natively in the Admin UI. When a Manager clicks "Approve", a Cloud Function securely pushes the payload (text, media URLs, target platforms, and scheduled date) to a unified API like Ayrshare.
- **Canva:** Staff export designs from Canva and upload them via a standard drag-and-drop zone.
- **Scheduling:** Fully supported. Ayrshare/Buffer holds the post until the exact timestamp.
- **Pros:** Saves literally hundreds of hours of managing distinct OAuth flows, refresh tokens, and shifting API deprecations for Meta, X, and TikTok.
- **Cons:** Relies on a third-party aggregator subscription.

### Strategy C: Fully Native Integrations (Heavyweight)
- **Concept:** We implement direct API calls to the Meta Graph API, Twitter API v2, and TikTok API from our Cloud Functions.
- **Pros:** No third-party middleman costs. Maximum possible control over platform-specific features (like tagging products natively in Instagram).
- **Cons:** Extremely high maintenance burden. Social media APIs are notoriously volatile and require constant upkeep and re-authentication.

---

## Technical Spec (Executing Strategy B)

### 1. Schema: `socialPosts/{id}`
| Field | Type | Notes |
|---|---|---|
| `content` | string | Post copy (max 2200 chars for IG, 280 for X, etc.) |
| `mediaUrls` | array | Links to Firebase Storage assets (images/videos) |
| `platforms` | array | e.g., `['facebook', 'instagram', 'twitter', 'tiktok']` |
| `status` | string | `draft` \| `pending_review` \| `approved` \| `published` \| `failed` |
| `authorUid` | string | Staff who created the draft |
| `reviewerUid` | string | Manager/Admin who approved |
| `scheduledFor` | timestamp | Date/Time to publish |
| `publishedAt` | timestamp | Actual publish time |
| `apiResponseId` | string | External ID from Ayrshare/Buffer for tracking |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### 2. Cloud Functions
- `submitPostForReview(postId)`: Changes status to `pending_review`.
- `approveAndSchedulePost(postId)`: Admin-only. Sets status to `approved`. Invokes the Ayrshare/Buffer REST API with the `scheduledFor` date and `mediaUrls`.
- `socialWebhookReceiver(req, res)`: HTTP endpoint. Ayrshare calls this when a scheduled post successfully goes live (or fails). Updates the Firestore `status` to `published` or `failed`.

### 3. Frontend Architecture
- **Role:** We utilize the existing `marketing_staff` role. No new role needed.
- **Pages:**
  - `/admin/social`: Main dashboard. Tabbed view for: Drafts, Pending Review, Scheduled, and Published.
  - `/admin/social/composer`: The post creator. Includes a preview pane simulating how the text/media will look on a mobile screen.
- **Canva Integration:** A simple drag-and-drop file uploader configured to accept `.png`, `.jpg`, and `.mp4`.

---

## Compliance & Persona Validation
- **Marie (Compliance):** Posts must remain in `draft` or `pending_review` until a user with the `admin` or `manager` custom claim explicitly approves them. The `marketing_staff` claim cannot trigger the unified API publish endpoint.
- **Kevin:** Allows the team to schedule campaigns (e.g., 4/20 promos) weeks in advance to align with in-store inventory readiness.
- **Makoonsii:** Clean composer UI. Immediate visual feedback via a simulated mobile preview before submission.
## Implementation Status\n\n**STATUS: CLOSED (2026-06-04)**\nImplemented Strategy B end-to-end. Built SocialDashboardPage, SocialComposerPage, approveAndSchedulePost Cloud Function, and updated schema/rules.
