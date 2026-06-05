# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pawn.spec.ts >> Pawn Persona (Makoonsii) >> browse item and submit click-and-collect reservation
- Location: e2e/pawn.spec.ts:24:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text="Vintage Rolex Submariner"')
Expected: visible
Error: strict mode violation: locator('text="Vintage Rolex Submariner"') resolved to 2 elements:
    1) <h3>Vintage Rolex Submariner</h3> aka getByRole('region', { name: 'Featured' }).getByLabel('Vintage Rolex Submariner — $')
    2) <h3>Vintage Rolex Submariner</h3> aka getByRole('region', { name: 'Inventory discovery grid' }).getByLabel('Vintage Rolex Submariner — $')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text="Vintage Rolex Submariner"')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner "Site header" [ref=e4]:
      - link "Skip to main content" [ref=e5] [cursor=pointer]:
        - /url: "#main-content"
      - generic [ref=e6]:
        - button "Toggle navigation menu" [ref=e7] [cursor=pointer]
        - generic [ref=e11]: The Pawn Shop - Pawn & Resale
      - navigation "Account" [ref=e12]:
        - button "User profile menu" [ref=e15] [cursor=pointer]:
          - img [ref=e16]
    - generic [ref=e19]:
      - main [ref=e20]:
        - generic [ref=e21]:
          - region "Pawn Shop — find your next discovery" [ref=e22]:
            - generic [ref=e24]:
              - paragraph [ref=e25]: Cornwall Island · Akwesasne
              - heading "Quiet confidence. Curated objects of distinction." [level=1] [ref=e26]
              - paragraph [ref=e27]: An uncompromising collection of timepieces, instruments, and heirlooms—presented with editorial precision.
              - generic [ref=e28]:
                - button "Browse Inventory" [ref=e29] [cursor=pointer]
                - button "Pawn or Sell" [ref=e30] [cursor=pointer]
          - generic [ref=e32]:
            - region "Search inventory" [ref=e33]:
              - generic [ref=e34]:
                - generic [ref=e35]: Search inventory
                - searchbox "Search inventory" [ref=e36]
            - region "Featured" [ref=e37]:
              - heading "Featured" [level=2] [ref=e38]
              - button "Vintage Rolex Submariner — $8500.00 CAD" [ref=e40] [cursor=pointer]:
                - img "Vintage Rolex Submariner" [ref=e42]
                - generic [ref=e43]:
                  - heading "Vintage Rolex Submariner" [level=3] [ref=e44]
                  - generic [ref=e45]: $8500.00 CAD
            - region "Discover" [ref=e48]:
              - generic [ref=e49]:
                - heading "Discover" [level=2] [ref=e50]
                - group "Layout" [ref=e52]:
                  - button "Masonry" [pressed] [ref=e53] [cursor=pointer]:
                    - img [ref=e54]
                  - button "Three columns" [ref=e59] [cursor=pointer]:
                    - img [ref=e60]
                  - button "List" [ref=e64] [cursor=pointer]:
                    - img [ref=e65]
              - generic [ref=e69]:
                - region "Inventory discovery grid" [ref=e70]:
                  - button "Vintage Rolex Submariner — $8500.00 CAD" [ref=e71] [cursor=pointer]:
                    - img "Vintage Rolex Submariner" [ref=e73]
                    - generic [ref=e74]:
                      - heading "Vintage Rolex Submariner" [level=3] [ref=e75]
                      - generic [ref=e76]: $8500.00 CAD
                - paragraph [ref=e79]: All 1 items shown
            - region "Store trust signals"
      - contentinfo [ref=e80]:
        - navigation "Footer navigation" [ref=e81]:
          - link "Contact" [ref=e82] [cursor=pointer]:
            - /url: /contact
          - link "Accessibility" [ref=e83] [cursor=pointer]:
            - /url: /accessibility
          - link "Privacy Policy" [ref=e84] [cursor=pointer]:
            - /url: /privacy
          - link "Terms of Use" [ref=e85] [cursor=pointer]:
            - /url: /terms
        - paragraph [ref=e86]: © 2026 The Pawn Shop · Cornwall Island, Akwesasne · v0.0.0-local
  - generic [ref=e87]:
    - img [ref=e89]
    - button "Open Tanstack query devtools" [ref=e137] [cursor=pointer]:
      - img [ref=e138]
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
  29 |     const itemCard = page.locator('text="Vintage Rolex Submariner"')
> 30 |     await expect(itemCard).toBeVisible()
     |                            ^ Error: expect(locator).toBeVisible() failed
  31 | 
  32 |     // 3. Click to view details
  33 |     await itemCard.click()
  34 |     
  35 |     // Expect the URL to match the item
  36 |     await expect(page).toHaveURL(new RegExp(`/item/${PAWN_ITEM_ID}`))
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