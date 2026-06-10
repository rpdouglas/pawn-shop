# E107 — Pawn Ticket Generation & Digital Signature (POS)
## Phase A Plan — Three Strategies

**Date:** 2026-06-10  
**Author:** Claude Code (Phase A Planning Gate)  
**Status:** AWAITING APPROVAL

---

## Context & System Deep-Dive

### Current Pawn Flow (as-built)

```
Customer (online) → SellPage → submitPawnRequest CF → pawnRequests/{id}
                                                              ↓
                         Staff → PawnInbox → Reviews request, sets status
                                            → "quoted" state unlocks "Issue Loan" button
                                            → IssueLoanModal → createLoanTicket CF
                                                                → loanTickets/{id}
                                                                → LoanTicketsAdminPage
```

**Gaps identified for in-store POS use:**
1. No signature capture — customer does not sign the agreement
2. No printable ticket — staff have no document to hand to the customer
3. No human-readable ticket number — staff can only reference by Firestore doc ID
4. No in-person walk-in workflow — current flow requires an online pawnRequest first
5. `loanTickets` lacks `ticketNumber`, `signatureUrl`, `signedAt`, `agreementVersion`, `customerName`

### Android Tablet POS Constraints

- Browser: Chrome on Android (Samsung Galaxy Tab or equivalent)
- Input: Stylus or finger for signature
- Print: USB or network-connected printer accessible from Chrome (standard `window.print()`)
- Connection: In-store WiFi (Firebase realtime connection assumed)
- Screen: ~10–12 inch, landscape or portrait

### Schema Changes Pre-approved (Decision 0020)

All three strategies share the same schema additions:

```
loanTickets/{id}:
  ticketNumber      string         — 'PLT-20260610-A3F2'
  signatureUrl      string|null    — Storage PNG URL
  signedAt          timestamp|null — Server timestamp
  agreementVersion  string|null    — e.g. 'v1.0'
  customerName      string         — Name at time of signing

auditLogs.eventType: adds 'pawn_agreement_signed'
```

---

## Persona Gate

| Persona | Test | Acceptance Criterion |
|---|---|---|
| **Staff (primary)** | Loan issuance flow | Signature + print adds ≤2 taps after "Issue Loan". No extra login. |
| **Makoonsii (secondary)** | Agreement legibility | Plain language. Font size ≥16px. Signature canvas ≥120px tall. 48px+ touch targets. |
| **Marcus (brand)** | Printed ticket | Shop name, gold accent, serif font. Not a generic blank form. |
| **Compliance** | Audit trail | `pawn_agreement_signed` in `auditLogs`. No PII in log details. Signature stored server-side. |

---

## Strategy A — In-Modal Canvas Signature + Print CSS (Recommended)

### Architecture

**Signature capture:**
- Add `signature_pad` (Szimek — 13KB gzip, no deps, MIT) to the project. It is the de-facto standard for stylus/touch signature on HTML Canvas and handles pressure variation, undo, and clear natively.
- Embed the canvas directly inside `IssueLoanModal` as a new "Step 2: Sign Agreement" screen (step pattern: Terms → Sign → Success).
- On submit: `canvas.toDataURL('image/png')` → pass to new `signPawnAgreement` Cloud Function as base64 data URL.

**Cloud Function — `signPawnAgreement`:**
- Located in `functions/core/src/pawnAgreement.ts`
- Receives: `{ loanTicketId, signatureDataUrl, customerName, agreementVersion }`
- Auth gate: `admin | manager | inventory_staff`
- Steps:
  1. Decode base64 PNG
  2. Upload to `tickets/{loanTicketId}/signature.png` in Firebase Storage via Admin SDK
  3. Update `loanTickets/{id}` with `signatureUrl`, `signedAt`, `customerName`, `agreementVersion`
  4. Write `auditLogs` event `pawn_agreement_signed` (details: `{ loanTicketId, agreementVersion }` — no PII)
- Returns: `{ signatureUrl: string }`

**Ticket number generation:**
- Extend `createLoanTicket` CF: after `db.collection('loanTickets').add(docData)`, derive `ticketNumber = 'PLT-' + YYYYMMDD + '-' + ref.id.slice(0, 4).toUpperCase()` and update the document.
- Human-readable, collision-free, no distributed counter needed.

**Printable ticket:**
- New component: `src/components/admin/PrintableTicket.tsx`
- Renders the complete agreement (item, amount, rate, due date, ticket number, terms, signature image, shop name + address)
- Hidden from normal view with `@media screen { display: none }` — only visible on print
- Injected into DOM when staff clicks "Print Ticket" — triggers `window.print()`
- No iframe, no library — standard browser print API
- Print CSS in `src/styles/print.css` — imported globally in `main.tsx`

**UI changes to `IssueLoanModal`:**
- Step 1 (existing): Loan terms (amount, rate, term days)
- Step 2 (new): Agreement display + signature canvas + customer name input
- Step 3 (existing success screen): Shows ticket ID + "Print Ticket" button

**UI changes to `LoanTicketsAdminPage`:**
- Add "Print" button to active loan rows (opens `PrintableTicket` view)
- Show signed/unsigned badge in the table

### Persona Lens

- **Staff:** Signing is embedded in the existing modal — zero navigation change. The "Print" button is a single tap on the success screen.
- **Makoonsii:** Agreement terms are rendered in plain language, `var(--font-body)` at `var(--text-base)`. Signature canvas is clearly labeled with `aria-label="Sign here with your finger or stylus"`.
- **Marcus:** Printed ticket uses `var(--font-display)` for the shop header, gold accent for the logo line, clean typographic hierarchy.

### Compliance

- Signature image stored server-side (Storage) immediately — not lost if browser closes
- `signedAt` is a server timestamp — client cannot forge
- `agreementVersion` enables re-consent enforcement if terms change
- `pawn_agreement_signed` in `auditLogs` — no PII, recoverable via `loanTickets/{id}.uid`
- No AI keys on client
- No age gate needed (staff-only admin route)
- No hardcoded hex — all `var(--color-*)` tokens
- `policeHold` unaffected

### Trade-offs

| Benefit | Cost |
|---|---|
| No new backend dependency (signature data via CF, no PDF library) | Print quality depends on browser/printer — no pixel-perfect control |
| Signature capture works offline (canvas renders before network) | `signature_pad` is a new npm dependency (~13KB) |
| Signing embedded in existing modal — no new route or page | No permanent PDF archive (signature image + print CSS only) |
| Fastest to implement | Upgrade to Strategy B needed for full PDF archival |

**Estimated scope:** Medium — ~10 files new/changed  
```
functions/core/src/pawnAgreement.ts  (new CF)
functions/core/src/loanTickets.ts    (extend createLoanTicket with ticketNumber)
functions/core/src/index.ts          (export new CF)
src/components/admin/IssueLoanModal.tsx   (step 2 sign + step 3 print button)
src/components/admin/PrintableTicket.tsx  (new, print-only)
src/styles/print.css                      (new)
src/pages/admin/LoanTicketsAdminPage.tsx  (print action + signed badge)
src/lib/useLoanTickets.ts                 (useSignPawnAgreement hook)
src/lib/types.ts                          (extend LoanTicket interface)
docs/firestore-schema.md                  (already updated)
```

---

## Strategy B — Server-Side PDF Generation + Canvas Signature

### Architecture

**Signature capture:** Identical to Strategy A — `signature_pad` canvas in `IssueLoanModal`.

**Cloud Function — `generatePawnTicketPdf`:**
- Located in `functions/operations/src/pawnTicket.ts`
- Library: `pdf-lib` (pure JS, no native deps, 400KB uncompressed — acceptable in a CF)
- Steps:
  1. Reads complete `loanTickets/{id}` document from Firestore
  2. Fetches signature PNG from Firebase Storage (as `Uint8Array`)
  3. Builds PDF: shop logo (text-based), loan terms table, agreement text block, signature image embedded, QR code linking to `/admin/loans` (optional)
  4. Saves PDF to `tickets/{loanTicketId}/agreement.pdf` in Firebase Storage
  5. Returns a 15-minute signed URL for direct download/print
- New Firestore field: `ticketPdfUrl` (signed URL, expires — not stored permanently)

**Print:** Staff clicks "Print Ticket" → CF returns signed URL → `window.open(url)` opens PDF in new tab → Chrome's built-in PDF viewer → Ctrl+P / share to printer

**`signPawnAgreement` CF:** Same as Strategy A (still needed to record the signature).

### Persona Lens

- **Staff:** Print is a PDF in a new browser tab — identical to any document workflow they already use
- **Marcus (brand):** Full typographic control in the PDF — consistent regardless of browser or printer driver
- **Compliance:** PDF is an immutable artifact — the exact document the customer signed is preserved in Storage

### Compliance

All the same as Strategy A, plus:
- PDF stored in Firebase Storage is the permanent record (not just a signature PNG)
- `ticketPdfUrl` is ephemeral (signed URL) — no long-lived public link

### Trade-offs

| Benefit | Cost |
|---|---|
| Professional, consistently-formatted PDF | `pdf-lib` adds ~400KB to operations CF bundle |
| Immutable document archive (the signed agreement as a PDF) | CF cold start adds 1–3 second latency at the POS moment |
| Consistent rendering regardless of browser/printer | More complex — CF must fetch blob from Storage |
| Better for regulatory inspection (paper-equivalent PDF) | Requires network at print time (no offline print) |

**Estimated scope:** Large — ~13 files new/changed  
Adds `pawnTicket.ts` in operations, `pdf-lib` dependency, Storage rules for `tickets/` path

---

## Strategy C — Dedicated Tablet POS Route

### Architecture

**New admin route: `/admin/pos`** — full-screen tablet-optimized POS mode:

```
/admin/pos
  → CustomerLookup (search existing users by name/phone, or create guest)
  → PawnTicketForm (item description, photos, loan terms — bypasses online pawnRequest)
  → SignaturePanel (full-screen landscape signature canvas, ≥300px tall)
  → PrintPreview (renders PrintableTicket, triggers print)
  → Success (ticket number displayed, return to dashboard)
```

**New CF: `createPawnTicketFromPos`:**
- Auth: `admin | manager | inventory_staff`
- Atomically creates `pawnRequests/{id}` (status: `completed`) + `loanTickets/{id}` (status: `active`, `ticketNumber` generated) in a Firestore batch write
- Bypasses the online pawnRequest review cycle — staff have already verified the item in person

**Signature:** Same `signature_pad` canvas, but rendered full-screen in a dedicated step component with landscape-optimized layout.

**Print:** Either Strategy A (print CSS) or Strategy B (PDF) — orthogonal choice.

### Persona Lens

- **Staff:** Fastest walk-in workflow — no pawn request creation step, no filter navigation. POS mode is context-switch-free.
- **Makoonsii:** Dedicated mode with a focused UI tailored to the in-person interaction; staff attention is not split between PawnInbox and the customer
- **Marcus:** The physical ticket can have a consistent, premium layout because it is always generated from the POS mode (not a bolted-on print action)

### Compliance

Same as Strategy A/B, plus:
- `createPawnTicketFromPos` is a dedicated CF — the atomic batch write ensures `pawnRequest` + `loanTicket` are always created together, preventing orphaned records
- Full age gate bypassed correctly (staff-only `/admin/pos` route behind `ProtectedRoute staffOnly`)

### Trade-offs

| Benefit | Cost |
|---|---|
| Purpose-built for walk-in POS — cleanest UX | Largest scope (2× a new page, new CF, tablet CSS) |
| Atomic creation (no orphaned pawnRequests) | Duplicates some logic from PawnInbox / IssueLoanModal |
| Separates online and in-person workflows cleanly | Requires careful tablet viewport/breakpoint CSS |
| Best long-term foundation for full POS expansion | Not backward-compatible with existing pawnRequest history |

**Estimated scope:** Large — ~18 files new/changed  
New page (`PosPage.tsx`), new CF (`createPawnTicketFromPos`), 4+ new components, tablet CSS

---

## Anti-Regression Checklist (All Strategies)

| Rule | All Strategies |
|---|---|
| No hardcoded hex | ✅ All colours via `var(--color-*)` |
| No invented Firestore fields | ✅ Schema updated in Decision 0020 first |
| No AI keys on client | ✅ Signature CF runs on Admin SDK, no AI involved |
| No `rare-find`/`limited-edition` algorithmic tags | ✅ N/A to this feature |
| No PII in auditLogs | ✅ `pawn_agreement_signed` details contain only `loanTicketId` + `agreementVersion` |
| Age gates at router level only | ✅ `/admin/*` is behind `ProtectedRoute staffOnly` — no new age gate needed |
| No bounce/particle/constant animations | ✅ No motion features planned |

---

## Recommendation

**Strategy A** — In-Modal Canvas Signature + Print CSS.

**Rationale:**
1. **Builds on existing flow.** The `IssueLoanModal` already collects loan terms and shows a success screen. Adding "Sign Agreement" as Step 2 requires zero new routes and zero new admin navigation.
2. **Fastest time-to-value.** Staff can go from "Issue Loan" → signed ticket → printed receipt in a single modal flow within days of this shipping.
3. **Android tablet compatible.** `signature_pad` is specifically optimized for touch/stylus on Chrome. It handles palm rejection and pressure variation that raw Canvas does not.
4. **Compliance without PDF library weight.** Storing the signature PNG + server timestamp satisfies the audit requirement. A PDF is a format preference, not a legal requirement at this stage.
5. **Clear upgrade path.** Strategy B (server-side PDF) can be added as E108 once Strategy A is validated in production — they are not mutually exclusive. The `signPawnAgreement` CF and `PrintableTicket` component from Strategy A remain valid in a PDF world.

Strategy C is the right long-term destination for a full walk-in POS experience, but it duplicates `IssueLoanModal` logic and introduces a new page that would need thorough QA before the shop can rely on it at the counter.

---

## Estimated File Count

| Strategy | New Files | Modified Files | Total |
|---|---|---|---|
| A (Recommended) | 5 | 5 | ~10 |
| B | 7 | 6 | ~13 |
| C | 10 | 8 | ~18 |

---

*The Pawn Shop · docs/plans/E107_PAWN_TICKET_DIGITAL_SIGNATURE_PLAN.md · 2026-06-10*
