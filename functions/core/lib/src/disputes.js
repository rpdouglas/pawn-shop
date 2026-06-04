"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDispute = exports.resolveDispute = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const authHelpers_1 = require("@pawn-shop/shared/authHelpers");
/**
 * Resolves a dispute or return request.
 * Staff-only. Ensures atomic status changes and audit log integrity.
 */
exports.resolveDispute = (0, https_1.onCall)({ cors: true }, async (request) => {
    // Staff check
    if (!request.auth || !(request.auth.token['admin'] || request.auth.token['manager'] || request.auth.token['inventory_staff'])) {
        throw new https_1.HttpsError('permission-denied', 'Staff role required');
    }
    // MFA check for resolving disputes (compliance requirement)
    await (0, authHelpers_1.assertMfaEnrolled)(request);
    const { disputeId, status, refundAmount, refundMethod, staffNotes, restockItem } = request.data;
    if (!disputeId)
        throw new https_1.HttpsError('invalid-argument', 'disputeId is required');
    const db = (0, firestore_1.getFirestore)();
    const disputeRef = db.collection('disputes').doc(disputeId);
    const disputeSnap = await disputeRef.get();
    if (!disputeSnap.exists) {
        throw new https_1.HttpsError('not-found', 'Dispute not found');
    }
    const dispute = disputeSnap.data();
    const itemId = dispute['itemId'];
    await db.runTransaction(async (transaction) => {
        // 1. Update Dispute
        transaction.update(disputeRef, {
            status,
            refundAmount: refundAmount ?? null,
            refundMethod: refundMethod ?? null,
            staffNotes: staffNotes ?? null,
            resolvedAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp()
        });
        // 2. Optional Restock
        if (restockItem && itemId) {
            const itemRef = db.collection('items').doc(itemId);
            const itemSnap = await transaction.get(itemRef);
            if (itemSnap.exists) {
                const item = itemSnap.data();
                // Safety: only restock if not on police hold
                if (item['policeHold'] !== true) {
                    transaction.update(itemRef, {
                        status: 'active',
                        updatedAt: firestore_1.FieldValue.serverTimestamp()
                    });
                    // Audit restock
                    transaction.set(db.collection('auditLogs').doc(), {
                        eventType: 'item_restocked',
                        uid: request.auth.uid,
                        targetId: itemId,
                        details: { disputeId, previousStatus: item['status'] },
                        createdAt: firestore_1.FieldValue.serverTimestamp()
                    });
                }
            }
        }
        // 3. Audit Resolution
        transaction.set(db.collection('auditLogs').doc(), {
            eventType: 'dispute_resolved',
            uid: request.auth.uid,
            targetId: disputeId,
            details: { itemId, refundAmount, restockItem },
            createdAt: firestore_1.FieldValue.serverTimestamp()
        });
    });
    return { success: true };
});
/**
 * Creates a new dispute or return request.
 * Ensures consistent audit logging and server-side validation.
 */
exports.createDispute = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Sign in required');
    }
    const { itemId, type, description } = request.data;
    if (!itemId || !type || !description) {
        throw new https_1.HttpsError('invalid-argument', 'itemId, type, and description are required');
    }
    const db = (0, firestore_1.getFirestore)();
    // Verify item exists
    const itemSnap = await db.collection('items').doc(itemId).get();
    if (!itemSnap.exists) {
        throw new https_1.HttpsError('not-found', 'Item not found');
    }
    const disputeRef = db.collection('disputes').doc();
    const disputeId = disputeRef.id;
    await db.runTransaction(async (transaction) => {
        // 1. Create Dispute
        transaction.set(disputeRef, {
            uid: request.auth.uid,
            itemId,
            type,
            status: 'open',
            description,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp()
        });
        // 2. Audit Creation
        transaction.set(db.collection('auditLogs').doc(), {
            eventType: 'dispute_created',
            uid: request.auth.uid,
            targetId: disputeId,
            details: { itemId, type },
            createdAt: firestore_1.FieldValue.serverTimestamp()
        });
    });
    return { disputeId, success: true };
});
//# sourceMappingURL=disputes.js.map