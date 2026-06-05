# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cannabis.spec.ts >> Cannabis Persona (Marie) >> encounters age gate, accepts, browses to cannabis item
- Location: e2e/cannabis.spec.ts:30:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/item\/test-cannabis-123/
Received string:  "http://localhost:5173/cannabis"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "http://localhost:5173/cannabis"

```

```yaml
- banner "Site header":
  - link "Skip to main content":
    - /url: "#main-content"
  - button "Toggle navigation menu"
  - text: The Pawn Shop - Cannabis
  - navigation "Account":
    - button "User profile menu":
      - img
- main:
  - heading "Wellness, curated." [level=1]
  - paragraph: Premium cannabis for every intention — sourced with care, presented with discretion.
  - region "Shop by mood":
    - heading "Shop by mood" [level=2]
    - button "Relax collection — 0 items":
      - heading "Relax" [level=3]
      - paragraph: Unwind and find your calm
      - paragraph: 0 items
    - button "Focus collection — 0 items":
      - heading "Focus" [level=3]
      - paragraph: Clarity and creative flow
      - paragraph: 0 items
    - button "Social collection — 0 items":
      - heading "Social" [level=3]
      - paragraph: Connection and celebration
      - paragraph: 0 items
    - button "Ceremony collection — 0 items":
      - heading "Ceremony" [level=3]
      - paragraph: Ritual and reflection
      - paragraph: 0 items
    - region "Featured products":
      - heading "Featured products" [level=2]
      - group "Layout":
        - button "Two columns"
        - button "Three columns" [pressed]
        - button "List"
        - button "Magazine"
      - button "Filters"
      - button "Organic Blue Dream 3.5g — $35.00 CAD":
        - text: No image
        - heading "Organic Blue Dream 3.5g" [level=3]
        - paragraph: Premium Sativa dominant hybrid.
        - text: $35.00 CAD
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
- dialog "Organic Blue Dream 3.5g":
  - button "Close quick view": ✕
  - text: No image available
  - heading "Organic Blue Dream 3.5g" [level=2]
  - text: $35.00 CAD
  - paragraph: Premium Sativa dominant hybrid.
  - button "Enquire about this item"
  - button "Share this item": ➦
  - button "Close"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { clearFirestore, seedFirestore } from './test-helpers'
  3  | 
  4  | const CANNABIS_ITEM_ID = 'test-cannabis-123'
  5  | const CANNABIS_ITEM_DATA = {
  6  |   title: 'Organic Blue Dream 3.5g',
  7  |   description: 'Premium Sativa dominant hybrid.',
  8  |   category: 'Dried Flower',
  9  |   viewTag: 'cannabis',
  10 |   status: 'active',
  11 |   policeHold: false,
  12 |   price: 3500,
  13 |   brand: 'Simply Bare',
  14 |   strainType: 'sativa',
  15 |   thcMin: '22',
  16 |   thcMax: '28',
  17 |   terpenes: 'Myrcene, Pinene',
  18 |   weight: '3.5g',
  19 |   cannabinoidUnit: '%',
  20 |   format: 'Dried Flower',
  21 |   createdAt: new Date(),
  22 | }
  23 | 
  24 | test.describe('Cannabis Persona (Marie)', () => {
  25 |   test.beforeAll(async () => {
  26 |     await clearFirestore()
  27 |     await seedFirestore('items', CANNABIS_ITEM_ID, CANNABIS_ITEM_DATA)
  28 |   })
  29 | 
  30 |   test('encounters age gate, accepts, browses to cannabis item', async ({ page }) => {
  31 |     // 1. Navigate to the Cannabis homepage (or an item directly)
  32 |     await page.goto('/cannabis')
  33 |     
  34 |     // 2. Expect the AgeGate to appear
  35 |     const ageGateHeading = page.locator('h1', { hasText: 'Age Verification' })
  36 |     await expect(ageGateHeading).toBeVisible()
  37 | 
  38 |     // 3. Reject age gate (redirects to safety)
  39 |     const noBtn = page.locator('button', { hasText: 'I am under 19' })
  40 |     await noBtn.click()
  41 | 
  42 |     // Assuming we redirect somewhere safe like root or pawn, let's verify url changed to pawn or we show an error.
  43 |     // The current AgeGate implementation sets location.href = '/' or '/pawn'. Let's check URL.
  44 |     await expect(page).toHaveURL(/.*/) // Just wait for nav
  45 | 
  46 |     // 4. Try again, but accept
  47 |     await page.goto('/cannabis')
  48 |     await expect(ageGateHeading).toBeVisible()
  49 |     const yesBtn = page.locator('button', { hasText: 'I am 19 or older' })
  50 |     await yesBtn.click()
  51 | 
  52 |     // AgeGate should close, we should see the cannabis view.
  53 |     await expect(ageGateHeading).not.toBeVisible()
  54 | 
  55 |     // 5. Look for the product and verify Cannabis specific details render
  56 |     const itemCard = page.locator('text="Organic Blue Dream 3.5g"').first()
  57 |     await expect(itemCard).toBeVisible()
  58 |     
  59 |     await itemCard.click()
  60 |     
> 61 |     await expect(page).toHaveURL(new RegExp(`/item/${CANNABIS_ITEM_ID}`))
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  62 |     await expect(page.locator('h1', { hasText: 'Organic Blue Dream 3.5g' })).toBeVisible()
  63 |     
  64 |     // Check for wellness profile / AI generated panels
  65 |     await expect(page.locator('text="Simply Bare"')).toBeVisible()
  66 |     await expect(page.locator('text="sativa"')).toBeVisible()
  67 |     await expect(page.locator('text="22"')).toBeVisible()
  68 |     await expect(page.locator('text="Myrcene, Pinene"')).toBeVisible()
  69 |   })
  70 | })
  71 | 
```