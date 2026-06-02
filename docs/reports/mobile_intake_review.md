# Mobile Item Intake Form Review

**Component:** `MobileIntakePage.tsx`
**Route:** `/admin/mobile-intake`
**Access:** Gated behind `ProtectedRoute` with `staffOnly` requirement.

## 1. Functional Architecture

The mobile intake form operates as a stateful, four-step wizard designed specifically for on-the-floor staff mobility. It handles the transition from a "Draft" to an "Active" item via Cloud Functions.

### The 4-Step Flow:
1. **Step 1: Capture (Photo First)**
   - Requires the staff member to input the **Item Name** and **View** (Pawn/Cannabis/Fireworks) before proceeding.
   - **Camera vs. Library:** Utilizes dual hidden file inputs. The camera input uses `capture="environment"` (forcing the rear camera on mobile devices without OS-level popups), while the gallery input allows multiple file selection.
   - **Draft Creation:** Tapping either photo CTA automatically triggers the `createDraftItem` Cloud Function. This creates the Firestore document *before* the image is uploaded so the image has a valid destination path.
   - **Upload & Processing:** Uses `uploadBytesResumable` for direct-to-Storage uploads. An `onSnapshot` listener subscribes to the draft item; once the `processImageUpload` Cloud Function creates watermarked/compressed WebP versions, the UI reacts in real-time to replace the "Processing..." state with thumbnails.
2. **Step 2: Details**
   - Captures metadata: Category, Description, Sale Price, Condition, and Initial Stock (defaults to 1).
   - Also includes an optional **Cost Price** field.
   - **Data Handling:** Prices are parsed securely into CAD cents (integers) to prevent floating-point drift. The Cost Price is strategically saved to an `internal/staff` subcollection to ensure it is absolutely hidden from public reads.
3. **Step 3: Review**
   - Displays a summary dictionary list (`<dl>`) of all inputs and the primary photo.
   - Clarifies to the staff member that the item is currently a **Draft**.
   - **Publishing:** Triggers the `publishItem` Cloud Function, which formally activates the item for public listing, fires analytics, and trips the webhooks/alerts engine.
4. **Step 4: Published**
   - A success state confirming the publish event, with a 56px CTA to immediately reset state and "Add Another Item".

---

## 2. Styling & UX Design

The styling for this page notably diverges from standard CSS classes, employing **strict inline CSS configuration objects**.

### Token-Driven Inline Styles
All styling relies 100% on the global CSS custom properties defined in the platform's design system (`src/index.css`), ensuring it shifts natively if the theme updates:
- **Spatial:** `var(--space-2)`, `var(--space-6)`
- **Typography:** `var(--text-heading)`, `var(--text-small)`, `var(--font-body)`
- **Palette:** `var(--color-surface)`, `var(--color-primary)`, `var(--color-error)`

### Touch & Accessibility Standards (Makoonsii Compliant)
- **Container:** Constrained to `maxWidth: 480px` and centered, mimicking a native app modal.
- **Inputs:** All text inputs and dropdowns (`INPUT`) are set to a minimum height of **48px**, guaranteeing easy tapping without zooming.
- **Primary CTAs:** Buttons like "Take Photo" and "Next" (`BTN_PRIMARY`) are explicitly pushed to **56px minimum height** with 100% width, making them impossible to miss.
- **Secondary Actions:** The Cancel/Back buttons (`BTN_SECONDARY`) are strictly **44px minimum height**, passing WCAG 2.5.5 touch target minimums.
- **Aria Validations:** The form is heavily annotated with `aria-invalid` and `aria-describedby` pointing to error spans to support screen readers if invalid data is submitted.

### Summary
The component is an excellent example of purpose-built, mobile-first design. By splitting the intake away from the dense desktop `IntakeForm.tsx`, it allows staff to securely input items on the shop floor utilizing native device cameras, without fighting desktop-oriented table views or dense data grids.
