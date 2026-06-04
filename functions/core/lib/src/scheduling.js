"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShift = exports.updateShift = exports.createShift = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
function isManagerOrAdmin(token) {
    return token['admin'] === true || token['manager'] === true;
}
exports.createShift = (0, https_1.onCall)({ cors: true }, async (request) => {
    const token = request.auth?.token;
    if (!request.auth || !token || !isManagerOrAdmin(token)) {
        throw new https_1.HttpsError('permission-denied', 'Manager or Admin role required');
    }
    const { staffUid, startTime, endTime, viewTag, notes } = request.data;
    if (!staffUid || !startTime || !endTime || !viewTag) {
        throw new https_1.HttpsError('invalid-argument', 'Missing required fields');
    }
    const db = (0, firestore_1.getFirestore)();
    const now = firestore_1.FieldValue.serverTimestamp();
    const ref = await db.collection('shifts').add({
        staffUid,
        startTime: firestore_1.Timestamp.fromDate(new Date(startTime)),
        endTime: firestore_1.Timestamp.fromDate(new Date(endTime)),
        viewTag,
        notes: notes || '',
        createdBy: request.auth.uid,
        createdAt: now,
        updatedAt: now,
    });
    await db.collection('auditLogs').add({
        eventType: 'shift_created',
        uid: request.auth.uid,
        targetId: ref.id,
        details: { staffUid, viewTag },
        createdAt: now,
    });
    return { success: true, shiftId: ref.id };
});
exports.updateShift = (0, https_1.onCall)({ cors: true }, async (request) => {
    const token = request.auth?.token;
    if (!request.auth || !token || !isManagerOrAdmin(token)) {
        throw new https_1.HttpsError('permission-denied', 'Manager or Admin role required');
    }
    const { shiftId, ...updates } = request.data;
    if (!shiftId)
        throw new https_1.HttpsError('invalid-argument', 'shiftId is required');
    const db = (0, firestore_1.getFirestore)();
    const shiftRef = db.collection('shifts').doc(shiftId);
    const payload = {
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    };
    if (updates.startTime)
        payload.startTime = firestore_1.Timestamp.fromDate(new Date(updates.startTime));
    if (updates.endTime)
        payload.endTime = firestore_1.Timestamp.fromDate(new Date(updates.endTime));
    if (updates.viewTag)
        payload.viewTag = updates.viewTag;
    if (updates.notes !== undefined)
        payload.notes = updates.notes;
    if (updates.staffUid)
        payload.staffUid = updates.staffUid;
    await shiftRef.update(payload);
    await db.collection('auditLogs').add({
        eventType: 'shift_updated',
        uid: request.auth.uid,
        targetId: shiftId,
        details: { updatedFields: Object.keys(updates) },
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
exports.deleteShift = (0, https_1.onCall)({ cors: true }, async (request) => {
    const token = request.auth?.token;
    if (!request.auth || !token || !isManagerOrAdmin(token)) {
        throw new https_1.HttpsError('permission-denied', 'Manager or Admin role required');
    }
    const { shiftId } = request.data;
    if (!shiftId)
        throw new https_1.HttpsError('invalid-argument', 'shiftId is required');
    const db = (0, firestore_1.getFirestore)();
    await db.collection('shifts').doc(shiftId).delete();
    await db.collection('auditLogs').add({
        eventType: 'shift_deleted',
        uid: request.auth.uid,
        targetId: shiftId,
        details: {},
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
//# sourceMappingURL=scheduling.js.map