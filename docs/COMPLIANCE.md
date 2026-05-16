# Compliance

> Non-negotiable rules. Read before touching cannabis, fireworks, pawn intake, or any customer data.

---

## Age Gates

| View | Required Age | Gate Location |
|------|-------------|---------------|
| `/cannabis` | 19+ | Route level — before any cannabis data renders |
| `/fireworks` | 18+ | Route level — before any fireworks data renders |

Rules:
- Enforced at the **router level**, not just on individual components
- Every gate pass/fail written to `auditLogs/{id}` (`eventType: 'age_gate_pass'` or `'age_gate_fail'`)
- Not bypassable by direct URL navigation
- Session-scoped only — do not persist age gate status

---

## PIPEDA (Canada's Privacy Law)

- **No PII in logs** — names, emails, phone numbers, IDs must never appear in Analytics, console, or `auditLogs.details`
- **Retain only what's needed** — pawn request data: business relationship duration + 1 year; age verification: compliance audit period only
- **`purgeExpiredData` Cloud Function** must enforce retention on a schedule (document in `DECISIONS.md` when implemented)
- **No third-party data sharing** without explicit consent

---

## Police Holds

When a serial number is flagged by law enforcement:
1. Set `items/{id}.policeHold = true` (admin-only write — enforced by Firestore rule)
2. Item disappears from all public views immediately
3. Item cannot be archived or deleted while `policeHold == true`
4. `auditLogs` entry written: `eventType: 'police_hold_set'`
5. Admin email alert fires via Cloud Function

---

## Serial Blacklist

- `serialBlacklist/{id}` stores flagged serials
- Checked on every pawn form submit (`onPawnRequestCreate` Cloud Function)
- Checked on every item intake in admin form
- A match sets `serialBlacklistFlag: true` and triggers admin alert
- Admin writes, staff reads only

---

## Scarcity Signals

- `rare-find` and `limited-edition` tags are staff-set only (Firestore security rule enforced)
- Manufactured urgency is prohibited — every signal must reflect reality

---

## Kanien'keha Language (Mohawk)

- AI assistants must **never** generate Kanien'keha copy
- All indigenous language content requires community review before publication
- `articles/{id}.indigenousLanguageReviewed` must be `true` before publishing any article with Kanien'keha

---

## AI-Generated Content

- `aiDescription` is a draft field — never shown to customers
- Staff must explicitly move AI content to `description` before it becomes public
- AI price suggestions are guidance only — never a published price
- All AI API calls go through Cloud Functions — API keys never on the client

---

## Audit Logs

- `auditLogs/{id}` is immutable — no update, no delete, ever
- Written via Firebase Admin SDK in Cloud Functions only
- Admin-only read
- Required events: `login` `logout` `role_change` `mfa_enrolled` `age_gate_pass` `age_gate_fail` `police_hold_set` `item_published` `price_override`

---

## Jurisdiction Note

The Pawn Shop operates on Akwesasne — federal, provincial (Ontario/Quebec), and Mohawk Nation jurisdictions overlap.
Get legal counsel review before launch for: cannabis retail licensing, fireworks regulations, indigenous business law, PIPEDA vs. provincial privacy law overlap.
Note the outcome in `DECISIONS.md`.
