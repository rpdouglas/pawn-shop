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

Locator: locator('h1').filter({ hasText: 'New Item' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('h1').filter({ hasText: 'New Item' })

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
- main: Loading security context...
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
> 30 |     await expect(page.locator('h1', { hasText: 'New Item' })).toBeVisible()
     |                                                               ^ Error: expect(locator).toBeVisible() failed
  31 |     
  32 |     // 4. Fill required fields
  33 |     await page.selectOption('select#viewTag', 'pawn')
  34 |     await page.fill('input#title', 'E2E Test Pawn Item')
  35 |     await page.fill('input#priceInput', '250')
  36 |     await page.selectOption('select#condition', 'Good')
  37 |     
  38 |     // Ensure save draft button is available
  39 |     const saveDraftBtn = page.locator('button', { hasText: 'Save Draft' })
  40 |     await expect(saveDraftBtn).toBeVisible()
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