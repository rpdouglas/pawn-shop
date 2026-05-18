# Discovery & Search

To provide a high-speed, "instant" discovery experience for customers (especially the **Kevin** persona), The Pawn Shop uses a custom-built prefix-search engine powered by Firestore.

## Prefix-Search Logic
Standard database searches can be slow or limited. Our system uses **Search Tokens** to enable real-time results as you type.

### Token Generation
When a staff member **Publishes** an item, a Cloud Function automatically triggers to:
1.  Take the item's **Title** and **Category**.
2.  Break them down into prefix tokens.
    - *Example:* "Gold Watch" → `g`, `go`, `gol`, `gold`, `w`, `wa`, `wat`, `watc`, `watch`.
3.  Store these tokens in an array on the item document.

## User Experience
- **Real-time Results:** As a customer types in the search bar, the app queries the `searchTokens` array. Results appear in under 300ms.
- **Debouncing:** The search bar waits for a 300ms pause in typing before firing the query to reduce database load and flicker.
- **View Scoping:** Search results are always automatically scoped to the current storefront (e.g., searching for "drill" in the Cannabis view will return zero results, even if we have drills in the Pawn view).
