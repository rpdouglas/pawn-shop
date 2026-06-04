"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purgeExpiredData = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
const secrets_1 = require("@pawn-shop/shared/lib/secrets");
const TERMINAL_STATUSES = ['declined', 'completed'];
const BATCH_SIZE = 500;
// Default 730 days (2 years) — configurable via environment variable
function retentionDays() {
    const val = secrets_1.purgeRetentionDays.value();
    return isNaN(val) || val < 1 ? 730 : val;
}
function cutoffTimestamp(days) {
    const ms = Date.now() - days * 24 * 60 * 60 * 1000;
    return firestore_1.Timestamp.fromMillis(ms);
}
async function purgeCollection(db, collectionName, cutoff) {
    let totalDeleted = 0;
    while (true) {
        const snap = await db.collection(collectionName)
            .where('status', 'in', TERMINAL_STATUSES)
            .where('createdAt', '<', cutoff)
            .limit(BATCH_SIZE)
            .get();
        if (snap.empty)
            break;
        const batch = db.batch();
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
        totalDeleted += snap.size;
        // If fewer than BATCH_SIZE docs returned, we're done
        if (snap.size < BATCH_SIZE)
            break;
    }
    return totalDeleted;
}
// Runs every Sunday at 02:00 UTC
exports.purgeExpiredData = (0, scheduler_1.onSchedule)('every sunday 02:00', async () => {
    const db = (0, firestore_1.getFirestore)();
    const days = retentionDays();
    const cutoff = cutoffTimestamp(days);
    const now = firestore_1.FieldValue.serverTimestamp();
    const collections = ['pawnRequests', 'reservations'];
    for (const col of collections) {
        let deleted = 0;
        try {
            deleted = await purgeCollection(db, col, cutoff);
        }
        catch (err) {
            console.error(`[purgeExpiredData] Error purging ${col}:`, err.message);
        }
        if (deleted > 0) {
            await db.collection('auditLogs').add({
                eventType: 'data_purged',
                uid: 'system',
                targetId: col,
                details: { collection: col, recordsDeleted: deleted, retentionDays: days },
                createdAt: now,
            });
        }
    }
});
//# sourceMappingURL=purgeExpiredData.js.map