# E118 — Header Title Cleanup Plan

**Spec:** `docs/projects/E118_HEADER_TITLE_CLEANUP.md`
**Cycle:** 33
**Status:** Awaiting approval

---

## Step 1 — Personas Served

**Primary: Makoonsii** — The Reserve Regular  
Header overflow / truncation makes the site look broken. Makoonsii does not give second chances to platforms that feel imported or unpolished. A clean, readable header on her phone is a basic trust signal.

**Supporting: Sandra** — The Impulse Browser  
Sandra browses on mobile. A crowded, truncating header degrades the discovery experience and reflects poorly on brand quality.

**Supporting: Jordan** — The Lifestyle Curator  
Jordan holds the brand to editorial standard. `"The Pawn Shop - Pawn & Resale"` truncating to `"The Pawn Shop - Pawn…"` on a 375px screen fails the dark-luxury presentation bar.

---

## Step 2 — Current State

`src/components/layout/NavigationDrawer.tsx` — `getPageTitle()` (lines 38–47):

```ts
const getPageTitle = () => {
  const path = location.pathname
  if (path === '/') return 'The Pawn Shop'
  if (path.startsWith('/pawn')) return 'The Pawn Shop - Pawn & Resale'
  if (path.startsWith('/cannabis')) return 'The Pawn Shop - Cannabis'
  if (path.startsWith('/fireworks')) return 'The Pawn Shop - Fireworks'
  if (path.startsWith('/tobacco')) return 'The Pawn Shop - Tobacco'
  if (path.startsWith('/admin')) return 'The Pawn Shop - Admin'
  return 'The Pawn Shop'
}
```

The return value is rendered in a `<span>` with `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` and `fontSize: var(--text-lead)` (20px). On a 375px phone the hamburger (48px) + gap (16px) + title + gap + user avatar compete for ~310px — too narrow for the current strings.

**SEO titles are separate** — `document.title` and `<meta>` tags are managed by `ViewLayout.tsx`. `getPageTitle()` only affects the visual header `<span>`. No SEO impact from any strategy.

---

## Step 3 — Schema Audit

No Firestore reads or writes. No schema impact.

---

## Step 4 — Three-Strategy Proposal

---

### Strategy A: Surgical String Strip · Tiny ⭐ RECOMMENDED

Remove `"The Pawn Shop - "` prefix from every vertical entry in `getPageTitle()`. Keep `"The Pawn Shop"` only on the home route (`/`) where it is the brand identity, not a page name.

**Before → After:**

| Route | Before | After |
|---|---|---|
| `/` | `"The Pawn Shop"` | `"The Pawn Shop"` (unchanged) |
| `/pawn*` | `"The Pawn Shop - Pawn & Resale"` | `"Pawn & Resale"` |
| `/cannabis*` | `"The Pawn Shop - Cannabis"` | `"Cannabis"` |
| `/fireworks*` | `"The Pawn Shop - Fireworks"` | `"Fireworks"` |
| `/tobacco*` | `"The Pawn Shop - Tobacco"` | `"Tobacco"` |
| `/admin*` | `"The Pawn Shop - Admin"` | `"Admin"` |
| fallback | `"The Pawn Shop"` | `"The Pawn Shop"` (unchanged) |

**Architecture:** One function in one file. Zero new dependencies, zero Firestore ops.

**Persona Lens:**
- Makoonsii: shortest title fits comfortably at 375px alongside hamburger + avatar.
- Sandra/Jordan: clean, intentional brand signal. Each vertical has its own clear name.

**Compliance:** No audit log, no age gate, no PII. No impact.

**Trade-offs:**
- ✅ Smallest possible change — surgical, zero risk
- ✅ Brand name not lost — still in `document.title` (SEO) and `/` header
- ✅ `/admin` is also fixed (nice side-effect — no user-visible admin page change)
- ❌ The header no longer always says "The Pawn Shop" — users who land directly on `/pawn` won't see the brand name in the header. (They will still see it in the browser tab via `document.title`.)

**Estimated Scope:** Tiny — 1 file, 6 string literals.

---

### Strategy B: Typed Lookup Map with Explicit Short Labels · Tiny

Same outcome as A but refactors `getPageTitle()` from a chain of `if` statements to a typed lookup object keyed by path prefix. Slightly more maintainable if new verticals are added.

```ts
const PAGE_LABELS: { prefix: string; label: string }[] = [
  { prefix: '/pawn',      label: 'Pawn & Resale' },
  { prefix: '/cannabis',  label: 'Cannabis' },
  { prefix: '/fireworks', label: 'Fireworks' },
  { prefix: '/tobacco',   label: 'Tobacco' },
  { prefix: '/admin',     label: 'Admin' },
]

const getPageTitle = () => {
  if (location.pathname === '/') return 'The Pawn Shop'
  const match = PAGE_LABELS.find(({ prefix }) => location.pathname.startsWith(prefix))
  return match?.label ?? 'The Pawn Shop'
}
```

**Trade-offs:**
- ✅ Same visual outcome as A
- ✅ Type-safe, easier to extend for new verticals
- ✅ Removes the explicit `/admin` string literal (uses the array instead)
- ❌ More code than the problem warrants — the if-chain is readable and the array is premature abstraction for 5 entries
- ❌ Adds a module-level constant that wasn't there before

**Estimated Scope:** Tiny — 1 file, ~10 lines changed.

---

### Strategy C: Split Brand + Section Header · Small

Restructure the header span into two elements: a compact "The Pawn Shop" wordmark (links to `/`) and a muted section name below it (or to its right), always visible.

```
☰   The Pawn Shop     🔵 user
        Pawn & Resale
```

Or a horizontal two-part layout:
```
☰   THE PAWN SHOP  ·  PAWN & RESALE     🔵
```

**Architecture:** Modify `NavigationDrawer.tsx` header span into two `<span>` elements with a separator. Adjust layout padding/font sizes to fit both on mobile.

**Trade-offs:**
- ✅ Brand name always visible — never disappears on vertical pages
- ✅ Clearer information hierarchy (brand → section)
- ❌ Layout change with risk of introducing new overflow at narrow viewports
- ❌ Disproportionate complexity vs. the problem: the user asked to *remove* "The Pawn Shop", not preserve it in a different form
- ❌ Requires testing across all viewport widths and all four verticals
- ❌ Touch on both `NavigationDrawer.tsx` and potentially `GlobalHeader.tsx` layout

**Estimated Scope:** Small — 1–2 files, ~20 lines changed + responsive testing.

---

## Step 5 — Anti-Regression Check

| Check | A | B | C |
|---|---|---|---|
| No hardcoded hex | ✅ | ✅ | ✅ |
| No invented Firestore fields | ✅ | ✅ | ✅ |
| AI keys not on client | ✅ | ✅ | ✅ |
| No scarcity tag automation | ✅ | ✅ | ✅ |
| No PII in logs | ✅ | ✅ | ✅ |
| Age gates at router only | ✅ | ✅ | ✅ |
| No prohibited motion | ✅ | ✅ | ✅ |
| No regression to upload flows | ✅ | ✅ | ✅ |

---

## Step 6 — Recommendation

**Strategy A** is recommended.

The user explicitly asked to *remove* "The Pawn Shop" from the vertical page headers, leaving the page name. A does exactly that in six string literals. B is a valid refactor but premature for five entries. C misunderstands the request.

The only caveat (acknowledged): `"The Pawn Shop"` will no longer appear in the sticky header when users are on a vertical page. It remains in `document.title` (browser tab) and on the homepage header. This is the correct behaviour — the brand name in the header is most meaningful on the home route where there is no other context.

---

## Step 7 — Implementation (Strategy A, if approved)

**One file:** `src/components/layout/NavigationDrawer.tsx`

Change `getPageTitle()` at lines 38–47:

```ts
const getPageTitle = () => {
  const path = location.pathname
  if (path === '/') return 'The Pawn Shop'
  if (path.startsWith('/pawn')) return 'Pawn & Resale'
  if (path.startsWith('/cannabis')) return 'Cannabis'
  if (path.startsWith('/fireworks')) return 'Fireworks'
  if (path.startsWith('/tobacco')) return 'Tobacco'
  if (path.startsWith('/admin')) return 'Admin'
  return 'The Pawn Shop'
}
```

Then run: `npm run build && npm run lint && npm run test`

---

*The Pawn Shop · docs/plans/E118_HEADER_TITLE_CLEANUP_PLAN.md · 2026-06-12*
