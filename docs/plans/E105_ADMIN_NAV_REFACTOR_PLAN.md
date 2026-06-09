# E105 — Admin Nav Refactor · Plan
**Epic:** E105 · **Status:** AWAITING APPROVAL · **Cycle:** 32

---

## Current State Audit

**`src/components/layout/AdminSidebar.tsx`**

| Issue | Detail |
|-------|--------|
| Width | 54px icon-only strip |
| Items | 20 nav items across 6 groups |
| Overflow | 20 × 48px = 960px + dividers + padding ≈ 1024px → overflows on any window < ~1080p |
| Group visibility | Groups separated by 0.5px dividers only — labels not visible |
| Redundant item | `/admin/intake` (➕ Intake) duplicates the Add button in `InventoryPage.tsx` (line 524) |
| Token violations | `#161000`, `#7a5e0a`, `#5a4508`, `#2e2200`, `#2a1f00`, `18px`, `8px`, `2px` |

**After removing Intake:** 19 items across 6 groups:
- Operations: Overview, Inventory (2)
- Customer: Pawn Inbox, Loans, Reservations, Preorders, Disputes (5)
- People: Staff, Scheduling, Customers, Documents (4)
- Content: Staff Picks, Campaigns, Articles, FAQs, Social Media (5)
- Config: Store Hours, Blacklist (2)
- Support: User Guide (1)

---

## Persona Gate

| Persona | Test |
|---------|------|
| **Staff (Primary)** | All 19 nav items reachable in ≤2 clicks; no mandatory scrolling with sensible default collapse state; section membership is immediately obvious from heading labels |
| **Makoonsii** | Every nav link: `min-height: 48px`, `aria-label`, keyboard navigable. Collapse toggle buttons: ≥48px, `aria-expanded` |

---

## Schema Audit

No Firestore reads or writes. No schema changes. No Cloud Function involvement. Pure UI refactor.

---

## Token Map (violations → fixes)

| Hardcoded value | Token replacement |
|-----------------|-------------------|
| `backgroundColor: '#161000'` | `var(--color-bg)` |
| `backgroundColor: '#2a1f00'` (divider) | `var(--color-border)` |
| `backgroundColor: '#2e2200'` (active bg) | `color-mix(in srgb, var(--color-primary) 12%, transparent)` |
| `color: '#7a5e0a'` (inactive icon) | `color-mix(in srgb, var(--color-primary) 45%, transparent)` |
| `color: '#5a4508'` (inactive label) | `var(--color-text-muted)` |
| `fontSize: '18px'` (icon) | `var(--text-body)` (16px) |
| `fontSize: '8px'` (label) | `var(--text-xs)` (12px) — only applies to icon-only narrow variant |
| `marginTop: '2px'` | Remove; use flexbox `gap: var(--space-1)` |

---

## Three Strategies

---

### Strategy A — Wider Labeled Sidebar (210px, no collapse)

**Approach:** Remove Intake item. Expand sidebar from 54px to 210px. Show group section headings (small-caps, `--text-xs`, `--color-text-muted`). Show icon + full label per item. Fix all token violations.

**Architecture:**
- `AdminSidebar.tsx`: Width → 210px; group headings as `<div>` labels above items; full label text; token fixes
- `AdminLayout.tsx`: `gridTemplateColumns: '54px 1fr'` → `'210px 1fr'`

**Sidebar height calculation:**
```
Padding (top + bottom):       32px
6 group headings × 20px:     120px
5 dividers × 8px:             40px
19 items × 48px:             912px
Total:                      1104px
Available at 1080p:         1042px → overflows by 62px
```

**Staff experience:** Still requires ~62px scroll at 1080p. Groups are visually clear with headings. Items are self-labeling (no tooltip needed). Same navigation pattern as most enterprise admin tools.

**Anti-regression:**
- ✅ No hex values; all replaced with tokens
- ✅ Intake link removed; route still exists in router
- ✅ 48px item height preserved
- ⚠️ Does NOT fully achieve "fits on a single window" — still scrolls ~62px at 1080p with group headings

**Trade-offs:**
- ✅ Simplest implementation — no state management
- ✅ Most readable and self-documenting of the three
- ✅ Standard admin sidebar pattern (VS Code, Vercel, Supabase)
- ❌ Does not completely eliminate scrolling — fails the "fit on single window" requirement at 1080p with headings
- ❌ Less content area (156px narrower content column)

**Estimated Scope:** Small · 2 files · ~60 lines changed

---

### Strategy B — Collapsible Icon-Only Groups (keep 54px)

**Approach:** Keep 54px icon-only format. Remove Intake. Add a clickable group summary row (group icon + tooltip) above each group's items. Collapsed groups hide their items. Default: all groups expanded.

**Architecture:**
- `AdminSidebar.tsx`: Add `useState<Set<string>>` for collapsed groups; each group header is a button; items conditionally rendered
- No `AdminLayout.tsx` change needed

**Sidebar height when all collapsed:**
```
6 group summary rows × 48px = 288px → fits at any viewport
```

**Sidebar height when all expanded:**
```
Same as current (~1024px) → same overflow as today
```

**Staff experience:** Staff must know which group a nav item belongs to. Groups collapse/expand with one click. The icon-only format is still opaque — "Social" vs "Staff Picks" are distinguishable only by icon.

**Anti-regression:**
- ✅ No hex values; all replaced with tokens
- ✅ Intake link removed
- ✅ 48px item height preserved
- ✅ No content area impact
- ⚠️ Navigation items still icon-only (discoverability unchanged)

**Trade-offs:**
- ✅ Zero content area impact — most space-efficient
- ✅ Collapse state definitively solves overflow
- ✅ Minimal implementation
- ❌ Icon-only sidebar still requires hovering/remembering which section contains each item
- ❌ Group row needs a distinct icon/label — adds another level of "what does this icon mean?"

**Estimated Scope:** Small · 1 file · ~40 lines changed

---

### Strategy C — Wider Labeled Sidebar + Collapsible Groups (210px + accordion) ⭐ RECOMMENDED

**Approach:** Remove Intake. Expand to 210px. Each group has a clickable labeled header that collapses/expands the group's items. Smart defaults: Operations, Customer, People open; Content, Config, Support collapsed. Fix all token violations.

**Architecture:**
- `AdminSidebar.tsx`: Width → 210px; `useState<Set<string>>` for collapsed groups; group headers are accessible `<button>` elements with `aria-expanded`; items conditionally rendered; all tokens fixed
- `AdminLayout.tsx`: `gridTemplateColumns: '54px 1fr'` → `'210px 1fr'`

**Layout sketch:**
```
┌────────────────────────────┐
│ ▼ OPERATIONS               │  ← clickable, aria-expanded=true
│   📊  Overview             │
│   🏷️  Inventory            │
│──────────────────────────── │
│ ▼ CUSTOMER                 │  ← expanded
│   📥  Pawn Inbox           │
│   💸  Loans                │
│   📅  Reservations         │
│   📦  Preorders            │
│   ⚠️  Disputes             │
│──────────────────────────── │
│ ▼ PEOPLE                   │  ← expanded
│   👥  Staff                │
│   🗓️  Scheduling           │
│   👥  Customers            │
│   📑  Documents            │
│──────────────────────────── │
│ ▶ CONTENT                  │  ← collapsed by default
│──────────────────────────── │
│ ▶ CONFIG                   │  ← collapsed by default
│──────────────────────────── │
│ ▶ SUPPORT                  │  ← collapsed by default
└────────────────────────────┘
```

**Sidebar height with defaults (3 open, 3 collapsed):**
```
Padding:                      32px
Operations (heading + 2 items):  20 + 2×48 = 116px
Divider:                       8px
Customer (heading + 5 items):  20 + 5×48 = 260px
Divider:                       8px
People (heading + 4 items):    20 + 4×48 = 212px
Divider:                       8px
Content (heading only):        20px
Divider:                       8px
Config (heading only):         20px
Divider:                       8px
Support (heading only):        20px
Total:                        720px → fits on 1080p (1042px available) ✅
```

**All groups expanded:**
```
Headings (6 × 20px):          120px
Dividers (5 × 8px):            40px
19 items (× 48px):            912px
Padding:                       32px
Total:                        1104px → scrolls 62px at 1080p
```
With all groups expanded, sidebar scrolls slightly — but this is by staff choice. Default state fits.

**Collapse toggle behaviour:**
- Click group header → toggle that group collapsed/expanded
- State is component-local (`useState`) — resets on page refresh
- `aria-expanded` on each toggle button
- Chevron (▶ / ▼) rotates via CSS `transform: rotate()` using `var(--motion-speed-fast)`

**Token compliance:**
All hardcoded hex and font sizes replaced per the token map above. Group heading uses `var(--text-xs)` + `letter-spacing: 0.08em` (CSS inline, not a token) for small-caps effect.

**Anti-regression:**
- ✅ No hex values anywhere
- ✅ Intake link removed; `/admin/intake` route untouched in router
- ✅ 48px items preserved
- ✅ Group headers are `<button>` with `aria-expanded`, keyboard nav maintained
- ✅ `AdminMobileNav.tsx` untouched (mobile staff still has "Add Item" tab for camera intake)
- ✅ No Firestore reads/writes introduced

**Trade-offs:**
- ✅ Default state fits comfortably on 1080p without scrolling
- ✅ Labeled items are self-documenting — no tooltip needed
- ✅ Collapsible groups reduce clutter on demand
- ✅ Full token compliance achieved
- ⚠️ Content area loses 156px width — at 1440px+ this is negligible; at 1280px content area becomes 1070px (still fine vs 1280px maxWidth)
- ⚠️ Slight more implementation than A or B (~80 lines changed)

**Estimated Scope:** Small · 2 files · ~80 lines changed

---

## Recommendation

**Strategy C.** It is the only strategy that both:
1. Visually communicates group membership with labeled headers (solves clutter)
2. Fits on a standard 1080p desktop by default (solves overflow)

Strategy A solves readability but still scrolls at 1080p with headings. Strategy B solves overflow but keeps icon-only discoverability problem. Strategy C solves both and matches the pattern seen in mature admin dashboards (GitHub, Vercel, Supabase sidebar with collapsible sections).

---

## Anti-Regression Checklist

| Check | Notes |
|-------|-------|
| `/admin/intake` route preserved in router | Nav link removed; URL still routable directly |
| `AdminMobileNav.tsx` untouched | "Add Item" tab retained for mobile camera intake |
| `AdminLayout.tsx` only gridTemplateColumns change | No other component reads the column width directly |
| 48px touch targets on all nav items | Item height stays `min-height: 48px` |
| 48px touch targets on collapse toggles | Group header buttons: `min-height: 48px` |
| `aria-label` on all nav links | Preserved from existing pattern |
| `aria-expanded` on collapse buttons | New requirement — Strategy C specific |
| No Firestore changes | Pure UI refactor |
| No AI keys involved | Not applicable |
| No age gates introduced at component level | Not applicable |
| No motion violations | Chevron rotation uses `var(--motion-speed-fast)` only |

---

*The Pawn Shop · docs/plans/E105_ADMIN_NAV_REFACTOR_PLAN.md · Awaiting strategy approval*
