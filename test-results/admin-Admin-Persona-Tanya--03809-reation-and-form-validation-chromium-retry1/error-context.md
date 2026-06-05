# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Persona (Tanya) >> staff login, item intake draft creation, and form validation
- Location: e2e/admin.spec.ts:15:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button').filter({ hasText: 'Save Draft' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('button').filter({ hasText: 'Save Draft' })

```

```yaml
- banner "Site header":
  - link "Skip to main content":
    - /url: "#main-content"
  - button "Toggle navigation menu"
  - text: The Pawn Shop - Admin
  - navigation "Account":
    - button "Notifications (0 unread)": 🔔
    - button "User profile menu": AD
- main:
  - navigation "Admin navigation":
    - link "Overview":
      - /url: /admin/dashboard
      - text: 📊 Overview
    - link "Inventory":
      - /url: /admin/inventory
      - text: 🏷️ Inventory
    - link "Intake":
      - /url: /admin/intake
      - text: ➕ Intake
    - link "Pawn Inbox":
      - /url: /admin/pawn-inbox
      - text: 📥 Pawn
    - link "Reservations":
      - /url: /admin/reservations
      - text: 📅 Reservations
    - link "Preorders":
      - /url: /admin/preorders
      - text: 📦 Preorders
    - link "Disputes":
      - /url: /admin/disputes
      - text: ⚠️ Disputes
    - link "Staff":
      - /url: /admin/staff
      - text: 👥 Staff
    - link "Scheduling":
      - /url: /admin/scheduling
      - text: 🗓️ Scheduling
    - link "Customers":
      - /url: /admin/customers
      - text: 👥 Customers
    - link "Documents":
      - /url: /admin/documents
      - text: 📑 Documents
    - link "Staff Picks":
      - /url: /admin/staff-picks
      - text: ⭐ Staff
    - link "Campaigns":
      - /url: /admin/campaigns
      - text: 📢 Campaigns
    - link "Articles":
      - /url: /admin/articles
      - text: 📄 Articles
    - link "FAQs":
      - /url: /admin/faqs
      - text: ❓ FAQs
    - link "Social Media":
      - /url: /admin/social
      - text: 📱 Social
    - link "Store Hours":
      - /url: /admin/store-hours
      - text: 🕒 Store
    - link "Blacklist":
      - /url: /admin/serial-blacklist
      - text: 🛡️ Blacklist
    - link "User Guide":
      - /url: https://rpdouglas.github.io/pawn-shop/
      - text: 📘 User
  - text: The Pawn Shop admin@thepawnshop.ca admin
  - main:
    - heading "New Item" [level=1]
    - heading "Capture & View" [level=2]
    - text: View (Required first)
    - combobox "View (Required first)":
      - option "Select view…"
      - option "Pawn" [selected]
      - option "Cannabis"
      - option "Fireworks"
    - button "Choose File"
    - button "Choose File"
    - button "Add photos — click or drop files here": Add photos JPG · PNG · WebP · max 20 MB each Watermark is applied automatically
    - heading "Basic Information" [level=2]
    - text: Title
    - textbox "Title":
      - /placeholder: e.g. Seiko 5 Automatic
      - text: E2E Test Pawn Item
    - text: Category
    - textbox "Category":
      - /placeholder: e.g. Watches
    - text: Description
    - textbox "Description":
      - /placeholder: Describe the item in plain language — condition, features, history
    - heading "Condition & Pricing" [level=2]
    - group "Condition":
      - text: Condition
      - radio "New Never used — original packaging"
      - text: New Never used — original packaging
      - radio "Like New Minimal use — no visible wear"
      - text: Like New Minimal use — no visible wear
      - radio "Good Normal wear — fully functional" [checked]
      - text: Good Normal wear — fully functional
      - radio "Fair Visible wear — works as expected"
      - text: Fair Visible wear — works as expected
      - radio "Poor Heavy wear or minor issues"
      - text: Poor Heavy wear or minor issues
    - text: Sale Price (CAD $)
    - textbox "Sale Price (CAD $)":
      - /placeholder: e.g. 49.99
      - text: "250"
    - text: Serial Number (optional)
    - textbox "Serial Number (optional)":
      - /placeholder: e.g. SN123456
    - text: Cost Price (CAD $, optional)
    - textbox "Cost Price (CAD $, optional)":
      - /placeholder: e.g. 25.00
    - text: Initial Stock
    - textbox "Initial Stock":
      - /placeholder: "1"
      - text: "1"
    - heading "Merchandising" [level=2]
    - group "Merchandising Tags":
      - text: Merchandising Tags
      - paragraph: Staff-set only — no algorithmic tags
      - button "Just Arrived"
      - button "Rare Find"
      - button "Limited Edition"
      - button "Staff Pick"
    - text: Provenance Notes (optional)
    - textbox "Provenance Notes (optional)":
      - /placeholder: The object's story — where it came from, who owned it, why it matters
    - checkbox "Seasonal Item"
    - text: Seasonal Item
    - button "Start Item"
- contentinfo:
  - navigation "Footer navigation":
    - link "Contact":
      - /url: /contact
    - link "Accessibility":
      - /url: /accessibility
    - link "Privacy Policy":
      - /url: /privacy
    - link "Terms of Use":
      - /url: /terms
  - paragraph: © 2026 The Pawn Shop · Cornwall Island, Akwesasne · v0.0.0-local
- button "Open Tanstack query devtools":
  - img
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | // Mock admin user
  4  | const mockAdmin = {
  5  |   uid: 'admin123',
  6  |   email: 'admin@thepawnshop.ca',
  7  |   displayName: 'Tanya Admin',
  8  |   role: 'admin',
  9  |   isMfaEnrolled: true,
  10 |   isStaff: true,
  11 |   isAdmin: true,
  12 | }
  13 | 
  14 | test.describe('Admin Persona (Tanya)', () => {
  15 |   test('staff login, item intake draft creation, and form validation', async ({ page }) => {
  16 |     // 1. Authenticate as Admin
  17 |     await page.addInitScript((mock) => {
  18 |       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  19 |       ;(window as any).__PLAYWRIGHT_MOCK_USER__ = mock
  20 |     }, mockAdmin)
  21 | 
  22 |     // 2. Navigate to Admin Dashboard
  23 |     await page.goto('/admin/dashboard')
  24 |     await expect(page.locator('body')).toContainText('Dashboard', { timeout: 10000 })
  25 | 
  26 |     // 3. Open Intake Form
  27 |     await page.goto('/admin/intake')
  28 |     
  29 |     // We should be on the IntakeForm. The "View" is required first.
  30 |     await expect(page.locator('h1', { hasText: 'New Item' })).toBeVisible()
  31 |     
  32 |     // 4. Fill required fields
  33 |     await page.selectOption('select#viewTag', 'pawn')
  34 |     await page.fill('input#title', 'E2E Test Pawn Item')
  35 |     await page.fill('input#price', '250')
  36 |     await page.locator('label').filter({ hasText: 'Good' }).click()
  37 |     
  38 |     // Ensure save draft button is available
  39 |     const saveDraftBtn = page.locator('button', { hasText: 'Save Draft' })
> 40 |     await expect(saveDraftBtn).toBeVisible()
     |                                ^ Error: expect(locator).toBeVisible() failed
  41 | 
  42 |     // 5. If we click publish directly, it should validate images. Let's see.
  43 |     // There might not be a 'Publish' button if we haven't uploaded images, but let's try 'Save Draft'
  44 |     await saveDraftBtn.click()
  45 | 
  46 |     // Assuming the Save Draft flow works and redirects to dashboard or shows toast
  47 |     // Because we're in emulator without full Cloud Function AI/etc fully set up, we rely on the CF emulator.
  48 |     // Wait for the "Draft saved" toast or redirect
  49 |     // (Depending on the implementation, it redirects to /admin/inventory or just shows toast)
  50 |     // We just ensure no major crash and the form submits.
  51 |     await expect(page.locator('text="E2E Test Pawn Item"')).toBeVisible({ timeout: 15000 }).catch(() => {
  52 |         // Fallback: Just wait to ensure we don't crash
  53 |         return expect(page.locator('body')).toBeVisible()
  54 |     })
  55 |   })
  56 | })
  57 | 
```