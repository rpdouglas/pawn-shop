"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateCampaigns = exports.activateCampaigns = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
// ── activateCampaigns ────────────────────────────────────────────────────────
// Scheduled every 5 min. Sets active: true on campaigns whose startDate has
// passed and endDate has not yet passed. Writes campaign_activated auditLog.
exports.activateCampaigns = (0, scheduler_1.onSchedule)('every 5 minutes', async () => {
    const db = (0, firestore_1.getFirestore)();
    const now = firestore_1.Timestamp.now();
    // Query inactive campaigns that haven't expired; filter startDate in JS to
    // avoid a three-field composite index (active + startDate + endDate).
    const snap = await db.collection('campaigns')
        .where('active', '==', false)
        .where('endDate', '>=', now)
        .get();
    const toActivate = snap.docs.filter((d) => {
        const startDate = d.data()['startDate'];
        return startDate != null && startDate.toMillis() <= now.toMillis();
    });
    if (toActivate.length === 0)
        return;
    const batch = db.batch();
    for (const d of toActivate) {
        batch.update(d.ref, { active: true, updatedAt: firestore_1.FieldValue.serverTimestamp() });
        const auditRef = db.collection('auditLogs').doc();
        batch.set(auditRef, {
            eventType: 'campaign_activated',
            uid: 'system',
            targetId: d.id,
            details: { campaignId: d.id, viewTag: String(d.data()['viewTag'] ?? '') },
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    await batch.commit();
});
// ── deactivateCampaigns ──────────────────────────────────────────────────────
// Scheduled every 5 min. Sets active: false on campaigns whose endDate has
// passed. Writes campaign_deactivated auditLog.
exports.deactivateCampaigns = (0, scheduler_1.onSchedule)('every 5 minutes', async () => {
    const db = (0, firestore_1.getFirestore)();
    const now = firestore_1.Timestamp.now();
    const snap = await db.collection('campaigns')
        .where('active', '==', true)
        .where('endDate', '<', now)
        .get();
    if (snap.empty)
        return;
    const batch = db.batch();
    for (const d of snap.docs) {
        batch.update(d.ref, { active: false, updatedAt: firestore_1.FieldValue.serverTimestamp() });
        const auditRef = db.collection('auditLogs').doc();
        batch.set(auditRef, {
            eventType: 'campaign_deactivated',
            uid: 'system',
            targetId: d.id,
            details: { campaignId: d.id, viewTag: String(d.data()['viewTag'] ?? '') },
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    await batch.commit();
});
//# sourceMappingURL=campaigns.js.map