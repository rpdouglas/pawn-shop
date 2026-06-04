# Epic E71: State Management Refactor (TanStack Query)

## Business Objective
Improve application performance, reduce Google Cloud Platform (GCP) billing costs, and eliminate loading spinners by implementing `@tanstack/react-query`. This refactor will cache expensive network requests, deduplicate parallel database reads, and modernize component-level data fetching without disrupting existing real-time `onSnapshot` flows.

---

## Technical Strategy

We will adopt TanStack Query incrementally to minimize risk, focusing first on the highest-impact bottlenecks: Cloud Function cold-starts and heavy aggregation queries.

### Phase 1: Infrastructure & Provider Setup
- Install `@tanstack/react-query` and `@tanstack/react-query-devtools`.
- Create a centralized `queryClient` in `src/lib/queryClient.ts` configured with conservative default `staleTime` (e.g., 5 minutes) and retry logic.
- Wrap the main application tree in `<QueryClientProvider>` inside `src/main.tsx`.

### Phase 2: High-Cost Endpoint Caching
Refactor static and heavy queries to use `useQuery`:
- **Admin Dashboard:** Refactor `DashboardPage.tsx` to cache the expensive `getDocs` aggregation queries. Admin users navigating between the dashboard and other pages will no longer re-trigger hundreds of document reads.
- **Staff Roster:** Wrap the `getStaffMembers` HTTPS callable in `useQuery` within `StaffList.tsx` and `ShiftCalendar.tsx`. This eliminates redundant Cloud Function invocations and cold-start delays.
- **Global Configs:** Refactor `storeHours` and `shopInfo` fetches. Components like `ClickCollectModal`, `CannabisPage`, and `YearsInBusinessBadge` will read from the global cache instead of making duplicate network requests.

### Phase 3: Mutation Boilerplate Reduction
Refactor write operations to use `useMutation`:
- Strip out manual `loading`, `error`, and `success` `useState` hooks across admin forms (e.g., `IntakeForm`, `PoliceHoldManager`, `SerialBlacklistManager`).
- Integrate `useMutation` to handle loading states natively and leverage `onSuccess` callbacks to invalidate related `useQuery` caches automatically.

### Phase 4: Hybrid Real-Time Integration
- Leave all core `onSnapshot` real-time listeners (e.g., live inventory grid, pawn inbox) intact.
- *Optional Future Enhancement:* Connect `onSnapshot` updates to the Query Cache directly to unify the state architecture, allowing non-real-time components to read the latest real-time data from the cache without establishing new listeners.

---

## Implementation Steps

- [x] `npm install @tanstack/react-query`
- [x] Configure `QueryClientProvider` in `main.tsx`.
- [x] Refactor `DashboardPage.tsx` to use `useQuery` for metrics.
- [x] Create `useStaffMembers` custom hook wrapping the `getStaffMembers` Cloud Function.
- [x] Create `useStoreConfig` custom hook for caching `storeHours` and `shopInfo`.
- [x] Refactor `StaffList` and `ShiftCalendar` to use the new hooks.
- [ ] Refactor one major mutation (e.g., `IntakeForm` publishing) to `useMutation` as a pattern template.
- [ ] Review performance gains via React Query Devtools.

---

## Persona Impact & Validation
- **Makoonsii (Customer Experience):** Interactions like opening the `ClickCollectModal` are instantaneous because store hours are fetched globally on app load and cached.
- **Admin/Manager:** The Dashboard and Staff scheduling pages feel significantly snappier. Navigating back and forth no longer shows loading spinners.
- **Developer (Staff):** Elimination of verbose `useEffect` and `useState` fetching boilerplate makes the codebase cleaner and easier to maintain.
