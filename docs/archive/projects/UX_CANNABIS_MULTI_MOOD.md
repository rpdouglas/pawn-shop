# Project Spec: Cannabis Multiselect Mood Filter

## Epic
UX Refinements (Cannabis Vertical)

## Description
The user requested changing the mood filtering behavior on the Cannabis view. Currently, only a single mood can be selected, and there is an explicit "All" pill. The new requirements are:
1. Remove the "All" pill from `MoodPillStrip`.
2. Allow selecting multiple mood pills simultaneously (multiselect).
3. When zero pills are selected, default to showing all items.
4. Filter the product list to include items matching *any* of the selected moods (OR logic).

## Scope
- Update `FilterState` in `src/components/cannabis/FilterPanel.tsx` to use `moods: MoodCategory[]` instead of `mood: MoodCategory | null`.
- Refactor `src/pages/CannabisPage.tsx` filtering logic to handle an array of moods.
- Refactor `MoodPillStrip` to accept an array of active moods and toggle them on click. Remove the "All" hardcoded pill.
- Refactor `MoodCard` interactions to support toggling within the multiselect array.

## Persona Impact
Impacts **Marie (The Wellness Seeker)** by allowing more flexible browsing (e.g., looking for both "Relax" and "Ceremony" items simultaneously) while keeping the interface uncluttered (by removing the redundant "All" pill).

## Compliance & Security
- Age Gate: No changes to the existing cannabis age gate.
- Audit Logs: No impact.
- PII / Police Hold: N/A
- Schema: No impact on Firestore schema.

## Acceptance Criteria
- [ ] `MoodPillStrip` no longer has an "All" pill.
- [ ] Clicking a pill toggles its active state without deselecting others.
- [ ] Product list shows items matching any selected mood.
- [ ] Deselecting all pills shows all items.
- [ ] Builds without TypeScript errors.
