// Cloud Functions are added per epic:
// E05 — onPawnRequestCreate (serial blacklist check, auditLog write)
// E08 — onReservationCreate, expireReservations (scheduled)
// E12 — dispatchSavedSearchAlerts (scheduled, CASL-gated)
// E18 — generateAIDescription, generateEbayTitle, generatePriceSuggestion,
//         suggestItemTags, checkDuplicateItem (Gemini-powered, staff auth required)
// E03 — enforceStaffMFA (auth trigger)
// E15 — purgeExpiredData (scheduled, PIPEDA compliance)

export {};
