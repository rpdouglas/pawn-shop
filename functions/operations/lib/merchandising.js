"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeJustArrivedTags = exports.calculateTrendingScore = exports.updateMerchandisingTags = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
const VALID_TAGS = ['staff-pick', 'rare-find', 'limited-edition', 'just-arrived'];
function isStaffToken(token) {
    return token['admin'] === true || token['manager'] === true || token['inventory_staff'] === true;
}
function isManagerOrAbove(token) {
    return token['admin'] === true || token['manager'] === true;
}
exports.updateMerchandisingTags = (0, https_1.onCall)({ cors: true }, async (request) => {
    const token = (request.auth?.token ?? {});
    if (!isStaffToken(token)) {
        throw new https_1.HttpsError('permission-denied', 'Staff role required');
    }
    const { itemId, tag, action, curatorNote } = request.data;
    if (!itemId?.trim())
        throw new https_1.HttpsError('invalid-argument', 'itemId is required');
    if (!VALID_TAGS.includes(tag)) {
        throw new https_1.HttpsError('invalid-argument', `tag must be one of: ${VALID_TAGS.join(', ')}`);
    }
    if (action !== 'add' && action !== 'remove') {
        throw new https_1.HttpsError('invalid-argument', 'action must be add or remove');
    }
    if ((tag === 'rare-find' || tag === 'limited-edition') && !isManagerOrAbove(token)) {
        throw new https_1.HttpsError('permission-denied', 'rare-find and limited-edition require manager or admin role');
    }
    const db = (0, firestore_1.getFirestore)();
    const itemRef = db.collection('items').doc(itemId.trim());
    const snap = await itemRef.get();
    if (!snap.exists)
        throw new https_1.HttpsError('not-found', `Item ${itemId} not found`);
    const updatePayload = {
        merchandisingTags: action === 'add'
            ? firestore_1.FieldValue.arrayUnion(tag)
            : firestore_1.FieldValue.arrayRemove(tag),
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    };
    if (tag === 'staff-pick') {
        if (action === 'add' && curatorNote?.trim()) {
            updatePayload['staffPickNote'] = curatorNote.trim().slice(0, 280);
        }
        else if (action === 'remove') {
            updatePayload['staffPickNote'] = firestore_1.FieldValue.delete();
        }
    }
    await itemRef.update(updatePayload);
    if (tag === 'staff-pick') {
        const item = snap.data();
        await db.collection('auditLogs').add({
            eventType: action === 'add' ? 'staff_pick_set' : 'staff_pick_removed',
            uid: request.auth.uid,
            targetId: itemId.trim(),
            details: { itemId: itemId.trim(), viewTag: item['viewTag'] },
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    return { success: true };
});
// ── calculateTrendingScore ────────────────────────────────────────────────────
// Scheduled every 30 minutes. Recomputes trendingScore for all active items.
// Formula: viewCount + (enquiryCount * 5). No time decay at current inventory scale.
const BATCH_LIMIT = 500;
exports.calculateTrendingScore = (0, scheduler_1.onSchedule)('every 30 minutes', async () => {
    const db = (0, firestore_1.getFirestore)();
    const snap = await db.collection('items')
        .where('status', '==', 'active')
        .where('policeHold', '==', false)
        .get();
    if (snap.empty)
        return;
    const batches = [];
    let currentBatch = db.batch();
    let count = 0;
    for (const doc of snap.docs) {
        const d = doc.data();
        const viewCount = Number(d['viewCount'] ?? 0);
        const enquiryCount = Number(d['enquiryCount'] ?? 0);
        const score = viewCount + enquiryCount * 5;
        currentBatch.update(doc.ref, {
            trendingScore: score,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        count++;
        if (count % BATCH_LIMIT === 0) {
            batches.push(currentBatch);
            currentBatch = db.batch();
        }
    }
    if (count % BATCH_LIMIT !== 0)
        batches.push(currentBatch);
    await Promise.all(batches.map((b) => b.commit()));
});
// ── removeJustArrivedTags ─────────────────────────────────────────────────────
// Scheduled every 30 minutes. Removes just-arrived from items older than 48 hours.
// Queries by array-contains only; filters by createdAt in memory to avoid extra index.
const JUST_ARRIVED_HOURS = 48;
exports.removeJustArrivedTags = (0, scheduler_1.onSchedule)('every 30 minutes', async () => {
    const db = (0, firestore_1.getFirestore)();
    const snap = await db.collection('items')
        .where('merchandisingTags', 'array-contains', 'just-arrived')
        .get();
    if (snap.empty)
        return;
    const cutoffMs = Date.now() - JUST_ARRIVED_HOURS * 60 * 60 * 1000;
    const toUpdate = snap.docs.filter((doc) => {
        const createdAt = doc.data()['createdAt'];
        return createdAt != null && createdAt.toMillis() < cutoffMs;
    });
    if (toUpdate.length === 0)
        return;
    const batches = [];
    let currentBatch = db.batch();
    let count = 0;
    for (const doc of toUpdate) {
        currentBatch.update(doc.ref, {
            merchandisingTags: firestore_1.FieldValue.arrayRemove('just-arrived'),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        count++;
        if (count % BATCH_LIMIT === 0) {
            batches.push(currentBatch);
            currentBatch = db.batch();
        }
    }
    if (count % BATCH_LIMIT !== 0)
        batches.push(currentBatch);
    await Promise.all(batches.map((b) => b.commit()));
});
//# sourceMappingURL=merchandising.js.map