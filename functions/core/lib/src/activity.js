"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const VALID_VIEW_TAGS = new Set(['pawn', 'cannabis', 'fireworks']);
const RATE_LIMIT_SECONDS = 30;
const PURGE_AFTER_HOURS = 24;
exports.logActivity = (0, https_1.onCall)({ cors: true }, async (request) => {
    const { viewTag } = request.data;
    if (!viewTag || !VALID_VIEW_TAGS.has(viewTag)) {
        throw new https_1.HttpsError('invalid-argument', 'viewTag must be pawn, cannabis, or fireworks');
    }
    const db = (0, firestore_1.getFirestore)();
    const now = firestore_1.Timestamp.now();
    const rateLimitCutoff = firestore_1.Timestamp.fromMillis(now.toMillis() - RATE_LIMIT_SECONDS * 1000);
    // Rate-limit: skip write if same viewTag was written in the last 30 seconds
    const recentSnap = await db.collection('activityFeed')
        .where('viewTag', '==', viewTag)
        .where('createdAt', '>=', rateLimitCutoff)
        .limit(1)
        .get();
    if (!recentSnap.empty) {
        return { success: true, skipped: true };
    }
    await db.collection('activityFeed').add({
        viewTag,
        action: 'browsing',
        displayCity: 'Cornwall Island',
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    // Non-blocking purge of entries older than 24 hours
    const purgeCutoff = firestore_1.Timestamp.fromMillis(now.toMillis() - PURGE_AFTER_HOURS * 60 * 60 * 1000);
    void db.collection('activityFeed')
        .where('createdAt', '<', purgeCutoff)
        .limit(50)
        .get()
        .then((staleSnap) => {
        if (staleSnap.empty)
            return;
        const batch = db.batch();
        staleSnap.docs.forEach((d) => batch.delete(d.ref));
        return batch.commit();
    })
        .catch(() => { });
    return { success: true, skipped: false };
});
//# sourceMappingURL=activity.js.map