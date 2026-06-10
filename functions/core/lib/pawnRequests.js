"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePawnRequestStatus = exports.submitPawnRequest = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const VALID_PAWN_REQUEST_STATUSES = ['pending', 'reviewed', 'quoted', 'declined', 'completed'];
// Callable — any user (authenticated or guest). uid is null for guest submissions.
// Blacklist check always runs before the document is written to Firestore, ensuring
// serialBlacklistHit is set before staff can read the request (compliance requirement).
exports.submitPawnRequest = (0, https_1.onCall)({ cors: true }, async (request) => {
    const { name, email, phone, itemDescription, serialNumber, imageUrls } = request.data;
    if (!name?.trim())
        throw new https_1.HttpsError('invalid-argument', 'Your name is required');
    if (!email?.trim())
        throw new https_1.HttpsError('invalid-argument', 'Your email address is required');
    if (!itemDescription?.trim())
        throw new https_1.HttpsError('invalid-argument', 'Please describe the item');
    if (!Array.isArray(imageUrls))
        throw new https_1.HttpsError('invalid-argument', 'imageUrls must be an array');
    const db = (0, firestore_1.getFirestore)();
    const uid = request.auth?.uid ?? null;
    // Serial blacklist check — runs regardless of whether a serial was provided.
    // Empty serial → no match possible → serialBlacklistHit: false.
    let serialBlacklistHit = false;
    const trimmedSerial = serialNumber?.trim() ?? '';
    if (trimmedSerial) {
        const snap = await db
            .collection('serialBlacklist')
            .where('serialNumber', '==', trimmedSerial)
            .limit(1)
            .get();
        serialBlacklistHit = !snap.empty;
    }
    const now = firestore_1.FieldValue.serverTimestamp();
    const docData = {
        uid,
        name: name.trim(),
        email: email.trim(),
        itemDescription: itemDescription.trim(),
        images: imageUrls,
        status: 'pending',
        serialBlacklistHit,
        createdAt: now,
    };
    if (phone?.trim())
        docData['phone'] = phone.trim();
    if (trimmedSerial)
        docData['serialNumber'] = trimmedSerial;
    // Admin SDK write bypasses Firestore rules — serialBlacklistHit is always set
    // before any staff read, satisfying the E07 compliance requirement.
    const ref = await db.collection('pawnRequests').add(docData);
    // E15: Update customer inquiry history if signed in
    if (uid) {
        await db.collection('users').doc(uid).update({
            inquiryHistory: firestore_1.FieldValue.arrayUnion(ref.id),
            updatedAt: now,
        });
    }
    // Audit: submission — no PII in details
    await db.collection('auditLogs').add({
        eventType: 'pawn_request_submit',
        uid,
        targetId: ref.id,
        details: { requestId: ref.id, viewTag: 'pawn' },
        createdAt: now,
    });
    if (serialBlacklistHit) {
        await db.collection('auditLogs').add({
            eventType: 'serial_blacklist_hit',
            uid,
            targetId: ref.id,
            details: { requestId: ref.id, serialNumber: trimmedSerial },
            createdAt: now,
        });
        // E12 will replace this stub with real email dispatch via SendGrid
        console.info(`[Admin alert] serial_blacklist_hit — requestId=${ref.id}`);
    }
    return { success: true, requestId: ref.id };
});
// Callable — admin/manager/inventory_staff only.
// Replaces direct client updateDoc on pawnRequests to ensure every status
// transition is audited via the Admin SDK.
exports.updatePawnRequestStatus = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth?.token.admin && !request.auth?.token.manager && !request.auth?.token.inventory_staff) {
        throw new https_1.HttpsError('permission-denied', 'Only staff can update pawn request status');
    }
    const { pawnRequestId, status, staffNotes } = request.data;
    if (!pawnRequestId)
        throw new https_1.HttpsError('invalid-argument', 'pawnRequestId required');
    if (!VALID_PAWN_REQUEST_STATUSES.includes(status)) {
        throw new https_1.HttpsError('invalid-argument', `Invalid status. Must be one of: ${VALID_PAWN_REQUEST_STATUSES.join(', ')}`);
    }
    const db = (0, firestore_1.getFirestore)();
    const ref = db.collection('pawnRequests').doc(pawnRequestId);
    const snap = await ref.get();
    if (!snap.exists)
        throw new https_1.HttpsError('not-found', 'Pawn request not found');
    const now = firestore_1.FieldValue.serverTimestamp();
    const updates = { status, updatedAt: now };
    if (staffNotes !== undefined)
        updates['staffNotes'] = staffNotes;
    await ref.update(updates);
    await db.collection('auditLogs').add({
        eventType: 'pawn_request_status_updated',
        uid: request.auth.uid,
        targetId: pawnRequestId,
        details: { pawnRequestId, status },
        createdAt: now,
    });
    return { success: true };
});
//# sourceMappingURL=pawnRequests.js.map