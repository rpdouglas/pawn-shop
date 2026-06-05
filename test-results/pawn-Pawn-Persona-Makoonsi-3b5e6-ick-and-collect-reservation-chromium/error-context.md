# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pawn.spec.ts >> Pawn Persona (Makoonsii) >> browse item and submit click-and-collect reservation
- Location: e2e/pawn.spec.ts:24:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/item\/test-pawn-item-123/
Received string:  "http://localhost:5173/pawn"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    5 × unexpected value "http://localhost:5173/pawn"

```

```yaml
- banner "Site header":
  - link "Skip to main content":
    - /url: "#main-content"
  - button "Toggle navigation menu"
  - text: The Pawn Shop - Pawn & Resale
  - navigation "Account":
    - button "User profile menu":
      - img
- main:
  - region "Pawn Shop — find your next discovery":
    - paragraph: Cornwall Island · Akwesasne
    - heading "Quiet confidence. Curated objects of distinction." [level=1]
    - paragraph: An uncompromising collection of timepieces, instruments, and heirlooms—presented with editorial precision.
    - button "Browse Inventory"
    - button "Pawn or Sell"
  - region "Search inventory":
    - text: Search inventory
    - searchbox "Search inventory"
  - region "Featured":
    - heading "Featured" [level=2]
    - button "Vintage Rolex Submariner — $8500.00 CAD":
      - img "Vintage Rolex Submariner"
      - heading "Vintage Rolex Submariner" [level=3]
      - text: $8500.00 CAD
  - region "Discover":
    - heading "Discover" [level=2]
    - group "Layout":
      - button "Masonry" [pressed]
      - button "Three columns"
      - button "List"
    - region "Inventory discovery grid":
      - button "Vintage Rolex Submariner — $8500.00 CAD":
        - img "Vintage Rolex Submariner"
        - heading "Vintage Rolex Submariner" [level=3]
        - text: $8500.00 CAD
    - paragraph: All 1 items shown
  - region "Store trust signals"
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
- dialog "Vintage Rolex Submariner":
  - button "Close quick view": ✕
  - img "Vintage Rolex Submariner — image 1 of 1"
  - heading "Vintage Rolex Submariner" [level=2]
  - text: $8500.00 CAD
  - paragraph: A classic 1980s Rolex.
  - button "Enquire about this item"
  - button "Share this item": ➦
  - button "Reserve for Collection"
  - button "Close"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { clearFirestore, seedFirestore } from './test-helpers'
  3  | 
  4  | const PAWN_ITEM_ID = 'test-pawn-item-123'
  5  | const PAWN_ITEM_DATA = {
  6  |   title: 'Vintage Rolex Submariner',
  7  |   description: 'A classic 1980s Rolex.',
  8  |   category: 'Watches',
  9  |   viewTag: 'pawn',
  10 |   status: 'active',
  11 |   policeHold: false,
  12 |   price: 850000,
  13 |   condition: 'Good',
  14 |   images: ['https://example.com/rolex.jpg'],
  15 |   createdAt: new Date(),
  16 | }
  17 | 
  18 | test.describe('Pawn Persona (Makoonsii)', () => {
  19 |   test.beforeAll(async () => {
  20 |     await clearFirestore()
  21 |     await seedFirestore('items', PAWN_ITEM_ID, PAWN_ITEM_DATA)
  22 |   })
  23 | 
  24 |   test('browse item and submit click-and-collect reservation', async ({ page }) => {
  25 |     // 1. Navigate to the Pawn homepage
  26 |     await page.goto('/pawn')
  27 |     
  28 |     // 2. See the item in the inventory feed
  29 |     const itemCard = page.locator('text="Vintage Rolex Submariner"').first()
  30 |     await expect(itemCard).toBeVisible()
  31 | 
  32 |     // 3. Click to view details
  33 |     await itemCard.click()
  34 |     
  35 |     // Expect the URL to match the item
> 36 |     await expect(page).toHaveURL(new RegExp(`/item/${PAWN_ITEM_ID}`))
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  37 |     await expect(page.locator('h1', { hasText: 'Vintage Rolex Submariner' })).toBeVisible()
  38 |     await expect(page.locator('text="$8,500"')).toBeVisible()
  39 | 
  40 |     // 4. Click the Click & Collect button
  41 |     const clickCollectBtn = page.locator('button', { hasText: 'Click & Collect' })
  42 |     await clickCollectBtn.click()
  43 | 
  44 |     // 5. Fill out the reservation form
  45 |     const modal = page.locator('dialog')
  46 |     await expect(modal).toBeVisible()
  47 |     
  48 |     await page.fill('input[name="firstName"]', 'Makoonsii')
  49 |     await page.fill('input[name="lastName"]', 'Bear')
  50 |     await page.fill('input[name="phone"]', '5551234567')
  51 | 
  52 |     // Note: Due to Playwright's lack of mock for the callable function unless we stub it or have the emulator running,
  53 |     // and since the emulator IS running, this will actually call the confirmReservation/createReservation callable!
  54 |     // But wait! `createReservation` requires Twilio which we mocked out in Cloud Functions testing, but the running emulator
  55 |     // will execute the actual CF. 
  56 |     // In our local dev setup, Twilio fails gracefully if keys are missing (or we can just submit).
  57 |     // Let's just submit the form.
  58 |     const submitBtn = page.locator('button', { hasText: 'Reserve' })
  59 |     await submitBtn.click()
  60 | 
  61 |     // The form should show a success state or close
  62 |     await expect(page.locator('text="Reservation Confirmed"')).toBeVisible({ timeout: 10000 })
  63 |   })
  64 | })
  65 | 
```