# 3-Strategy Plan: Cannabis Multiselect Mood Filter

## Context
The user wants to remove the "All" option from the mood pills and enable selecting multiple moods at once. If no pills are selected, all products should be displayed. This requires changing the filter state from a single value to an array.

---

### Strategy A: Full Multiselect Refactor (Recommended)
Refactor `FilterState` to replace `mood: MoodCategory | null` with `moods: MoodCategory[]`.
Update `CannabisPage.tsx`, `FilterPanel.tsx`, and `MoodPillStrip.tsx` to handle array toggling. Clicking a `MoodCard` will also toggle that mood in the array. 
- **Persona Impact:** Gives Marie complete flexibility to browse overlapping wellness intentions.
- **Compliance/Schema:** Zero impact.

### Strategy B: Hybrid Multiselect (Pills = Multi, Cards = Single)
Update `FilterState` to `moods: MoodCategory[]`. `MoodPillStrip` acts as a multiselect, but clicking a large `MoodCard` (which represents entering a specific collection) clears other filters and selects *only* that mood.
- **Persona Impact:** Differentiates the UI paradigms. Cards act as strict navigation ("take me to the Relax collection"), while pills act as granular filters.
- **Compliance/Schema:** Zero impact.

### Strategy C: Add "Clear All" Visual Indicator
Implement Strategy A's data model, but instead of just having zero pills selected to show everything, add a dynamic "Clear Filters" or "Reset" button that only appears when 1 or more pills are active, ensuring users know how to return to the "All" state without having to manually deselect every active pill.
- **Persona Impact:** Adds a slight bit of UI convenience but may clutter the minimalist aesthetic Marie prefers.
- **Compliance/Schema:** Zero impact.

---

**Approval Required:** Please confirm if we should proceed with **Strategy A** (consistent toggle everywhere), **Strategy B** (Cards act as single-select overrides), or **Strategy C** (Strategy A + a clear button).
