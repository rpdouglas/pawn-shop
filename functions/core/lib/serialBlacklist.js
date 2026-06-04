"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSerialFromBlacklist = exports.addSerialToBlacklist = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const authHelpers_1 = require("@pawn-shop/shared/lib/authHelpers");
exports.addSerialToBlacklist = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth?.token?.['admin']) {
        throw new https_1.HttpsError('permission-denied', 'Admin access required');
    }
    (0, authHelpers_1.assertMfaEnrolled)(request);
    const { serialNumber, reason } = request.data;
    if (!serialNumber?.trim() || serialNumber.length > 100) {
        throw new https_1.HttpsError('invalid-argument', 'Serial number is required (max 100 characters)');
    }
    if (!reason?.trim() || reason.length > 500) {
        throw new https_1.HttpsError('invalid-argument', 'Reason is required (max 500 characters)');
    }
    const db = (0, firestore_1.getFirestore)();
    const uid = request.auth.uid;
    const now = firestore_1.FieldValue.serverTimestamp();
    // Idempotency: check if serial already exists
    const existing = await db.collection('serialBlacklist')
        .where('serialNumber', '==', serialNumber.trim().toUpperCase())
        .limit(1)
        .get();
    if (!existing.empty) {
        throw new https_1.HttpsError('already-exists', 'This serial number is already on the blacklist');
    }
    const docRef = await db.collection('serialBlacklist').add({
        serialNumber: serialNumber.trim().toUpperCase(),
        reason: reason.trim(),
        addedBy: uid,
        createdAt: now,
    });
    await db.collection('auditLogs').add({
        eventType: 'serial_blacklist_add',
        uid,
        targetId: docRef.id,
        details: { serialNumber: serialNumber.trim().toUpperCase() },
        createdAt: now,
    });
    return { success: true, id: docRef.id };
});
exports.removeSerialFromBlacklist = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth?.token?.['admin']) {
        throw new https_1.HttpsError('permission-denied', 'Admin access required');
    }
    (0, authHelpers_1.assertMfaEnrolled)(request);
    const { blacklistId } = request.data;
    if (!blacklistId?.trim()) {
        throw new https_1.HttpsError('invalid-argument', 'blacklistId is required');
    }
    const db = (0, firestore_1.getFirestore)();
    const uid = request.auth.uid;
    const now = firestore_1.FieldValue.serverTimestamp();
    const ref = db.collection('serialBlacklist').doc(blacklistId.trim());
    const snap = await ref.get();
    if (!snap.exists) {
        throw new https_1.HttpsError('not-found', 'Blacklist entry not found');
    }
    const serialNumber = snap.data()['serialNumber'];
    await ref.delete();
    await db.collection('auditLogs').add({
        eventType: 'serial_blacklist_remove',
        uid,
        targetId: blacklistId.trim(),
        details: { serialNumber },
        createdAt: now,
    });
    return { success: true };
});
//# sourceMappingURL=serialBlacklist.js.map