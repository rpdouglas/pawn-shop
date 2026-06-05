# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: docs-screenshots.spec.ts >> Automated Documentation Screenshots >> Capture all User Guide screenshots
- Location: e2e/docs-screenshots.spec.ts:17:3

# Error details

```
Error: page.goto: Page crashed
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Test source

```ts
  1  | import { test } from '@playwright/test'
  2  | 
  3  | // Mock manager user to bypass login for staff screens
  4  | const mockManager = {
  5  |   uid: 'mgr123',
  6  |   email: 'manager@thepawnshop.ca',
  7  |   displayName: 'Manager',
  8  |   role: 'manager',
  9  |   isMfaEnrolled: true,
  10 |   isStaff: true,
  11 |   isAdmin: false,
  12 | }
  13 | 
  14 | test.describe('Automated Documentation Screenshots', () => {
  15 |   test.use({ viewport: { width: 1280, height: 800 } })
  16 | 
  17 |   test('Capture all User Guide screenshots', async ({ page }) => {
  18 |     
  19 |     // Inject mock user to act as a logged-in manager
  20 |     await page.addInitScript((mock) => {
  21 |       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  22 |       ;(window as any).__PLAYWRIGHT_MOCK_USER__ = mock
  23 |     }, mockManager)
  24 | 
  25 |     // --- 1. Getting Started: Home Page ---
> 26 |     await page.goto('/')
     |                ^ Error: page.goto: Page crashed
  27 |     // Wait for the app to settle
  28 |     await page.waitForTimeout(1000)
  29 |     await page.screenshot({ path: 'user-guide/public/screenshots/home-page.png' })
  30 | 
  31 |     // --- 2. Admin Dashboard ---
  32 |     await page.goto('/admin/dashboard')
  33 |     await page.waitForTimeout(1000)
  34 |     await page.screenshot({ path: 'user-guide/public/screenshots/admin-dashboard.png' })
  35 | 
  36 |     // --- 3. Intake Form ---
  37 |     await page.goto('/admin/inventory/intake')
  38 |     await page.waitForTimeout(1000)
  39 |     await page.screenshot({ path: 'user-guide/public/screenshots/admin-intake-form.png', fullPage: true })
  40 | 
  41 |     // --- 4. Inventory List (to show AI Assistant access point) ---
  42 |     await page.goto('/admin/inventory')
  43 |     await page.waitForTimeout(1000)
  44 |     await page.screenshot({ path: 'user-guide/public/screenshots/admin-inventory-list.png', fullPage: true })
  45 | 
  46 |     // --- 5. Customer Profiles (CRM) ---
  47 |     await page.goto('/admin/customers')
  48 |     await page.waitForTimeout(1000)
  49 |     await page.screenshot({ path: 'user-guide/public/screenshots/admin-customers-crm.png', fullPage: true })
  50 | 
  51 |   })
  52 | })
  53 | 
```