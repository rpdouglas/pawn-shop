# E38 · Admin Desktop Portal

> **Persona Gate — E38:**
> - **Staff (Primary):** Persistent sidebar + topbar on desktop (≥1024px) allows for rapid navigation between 18+ admin pages without re-opening a hamburger menu.
> - **Jordan:** PWA quality maintained. Zero impact on mobile customer performance or visual layout.
> - **Compliance:** Role-gated. Only staff with `isStaff` claims see the admin shell.

- [x] Create `AdminShellContext` for desktop admin detection `[Staff]`
- [x] Create `AdminTopbar` (slim 38px, brand + user context) `[Staff]`
- [x] Create `AdminSidebar` (fixed 54px icon rail, 16 nav items in 5 groups) `[Staff]`
- [x] Create `AdminLayout` nested router wrapper `[Staff]`
- [x] Integrate `AdminLayout` as parent for all `/admin` routes in `main.tsx` `[Staff]`
- [x] Add media query overrides in `index.css` for admin shell `[Staff]`
- [x] Suppress `GlobalHeader` on desktop admin views via context `[Staff]`
- [x] Verify mobile experience remains 100% unchanged `[All]`
