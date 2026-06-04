"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelPreorder = exports.collectPreorder = exports.markPreorderReady = exports.confirmPreorder = exports.createPreorder = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const sms_1 = require("@pawn-shop/shared/lib/sms");
const secrets_1 = require("@pawn-shop/shared/lib/secrets");
function isStaffToken(token) {
    return token['admin'] === true || token['manager'] === true || token['inventory_staff'] === true;
}
exports.createPreorder = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in to pre-order');
    const { itemId, customerName, customerPhone, quantity, campaignId } = request.data;
    if (!itemId?.trim())
        throw new https_1.HttpsError('invalid-argument', 'itemId is required');
    if (!customerName?.trim())
        throw new https_1.HttpsError('invalid-argument', 'Your name is required');
    if (!customerPhone?.trim())
        throw new https_1.HttpsError('invalid-argument', 'Your phone number is required');
    if (!quantity || quantity < 1)
        throw new https_1.HttpsError('invalid-argument', 'Quantity must be at least 1');
    const db = (0, firestore_1.getFirestore)();
    const uid = request.auth.uid;
    const itemSnap = await db.collection('items').doc(itemId.trim()).get();
    if (!itemSnap.exists)
        throw new https_1.HttpsError('not-found', 'Item not found');
    const itemData = itemSnap.data();
    if (itemData['policeHold'] === true) {
        throw new https_1.HttpsError('failed-precondition', 'This item is not available');
    }
    if (itemData['status'] !== 'active') {
        throw new https_1.HttpsError('failed-precondition', 'This item is not currently available for pre-order');
    }
    if (itemData['viewTag'] !== 'fireworks') {
        throw new https_1.HttpsError('invalid-argument', 'Pre-orders are available for fireworks items only');
    }
    const now = firestore_1.FieldValue.serverTimestamp();
    const preorderPayload = {
        uid,
        itemId: itemId.trim(),
        status: 'pending',
        quantity,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        viewTag: 'fireworks',
        smsDeliveredAt: null,
        createdAt: now,
    };
    if (campaignId?.trim())
        preorderPayload['campaignId'] = campaignId.trim();
    const preorderRef = await db.collection('preorders').add(preorderPayload);
    await db.collection('auditLogs').add({
        eventType: 'preorder_created',
        uid,
        targetId: preorderRef.id,
        details: { preorderId: preorderRef.id, viewTag: 'fireworks' },
        createdAt: now,
    });
    return { success: true, preorderId: preorderRef.id };
});
exports.confirmPreorder = (0, https_1.onCall)({ cors: true, secrets: [secrets_1.twilioAccountSid, secrets_1.twilioAuthToken] }, async (request) => {
    const token = (request.auth?.token ?? {});
    if (!request.auth || !isStaffToken(token)) {
        throw new https_1.HttpsError('permission-denied', 'Staff access required');
    }
    const { preorderId, staffNotes } = request.data;
    if (!preorderId?.trim())
        throw new https_1.HttpsError('invalid-argument', 'preorderId is required');
    const db = (0, firestore_1.getFirestore)();
    const preorderRef = db.collection('preorders').doc(preorderId.trim());
    const snap = await preorderRef.get();
    if (!snap.exists)
        throw new https_1.HttpsError('not-found', 'Pre-order not found');
    const data = snap.data();
    if (data['status'] !== 'pending') {
        throw new https_1.HttpsError('failed-precondition', 'Only pending pre-orders can be confirmed');
    }
    const now = firestore_1.FieldValue.serverTimestamp();
    const updatePayload = { status: 'confirmed', updatedAt: now };
    if (staffNotes?.trim())
        updatePayload['staffNotes'] = staffNotes.trim();
    await preorderRef.update(updatePayload);
    await db.collection('auditLogs').add({
        eventType: 'preorder_confirmed',
        uid: request.auth.uid,
        targetId: preorderId.trim(),
        details: { preorderId: preorderId.trim(), viewTag: 'fireworks' },
        createdAt: now,
    });
    // Inline SMS dispatch — guarantees 60-second SLA (E14 Tanya requirement)
    const customerName = String(data['customerName'] ?? '');
    const customerPhone = String(data['customerPhone'] ?? '');
    const body = `The Pawn Shop · Hi ${customerName}, your fireworks pre-order has been confirmed. We'll reach out once it's ready for pickup.`;
    try {
        const sent = await (0, sms_1.dispatchSms)(customerPhone, body);
        if (sent)
            await preorderRef.update({ smsDeliveredAt: firestore_1.Timestamp.now() });
    }
    catch (err) {
        console.error('[confirmPreorder] SMS failed:', err.message);
        await preorderRef.update({ staffNotes: (staffNotes?.trim() ? staffNotes.trim() + ' — ' : '') + 'SMS failed on confirm — resend manually' });
    }
    return { success: true };
});
exports.markPreorderReady = (0, https_1.onCall)({ cors: true, secrets: [secrets_1.twilioAccountSid, secrets_1.twilioAuthToken] }, async (request) => {
    const token = (request.auth?.token ?? {});
    if (!request.auth || !isStaffToken(token)) {
        throw new https_1.HttpsError('permission-denied', 'Staff access required');
    }
    const { preorderId, pickupWindow, staffNotes } = request.data;
    if (!preorderId?.trim())
        throw new https_1.HttpsError('invalid-argument', 'preorderId is required');
    if (!pickupWindow?.trim())
        throw new https_1.HttpsError('invalid-argument', 'pickupWindow is required');
    const db = (0, firestore_1.getFirestore)();
    const preorderRef = db.collection('preorders').doc(preorderId.trim());
    const snap = await preorderRef.get();
    if (!snap.exists)
        throw new https_1.HttpsError('not-found', 'Pre-order not found');
    const data = snap.data();
    if (data['status'] !== 'confirmed') {
        throw new https_1.HttpsError('failed-precondition', 'Only confirmed pre-orders can be marked ready');
    }
    const now = firestore_1.FieldValue.serverTimestamp();
    const updatePayload = {
        status: 'ready',
        pickupWindow: pickupWindow.trim(),
        updatedAt: now,
    };
    if (staffNotes?.trim())
        updatePayload['staffNotes'] = staffNotes.trim();
    await preorderRef.update(updatePayload);
    await db.collection('auditLogs').add({
        eventType: 'preorder_ready',
        uid: request.auth.uid,
        targetId: preorderId.trim(),
        details: { preorderId: preorderId.trim(), viewTag: 'fireworks' },
        createdAt: now,
    });
    const customerName = String(data['customerName'] ?? '');
    const customerPhone = String(data['customerPhone'] ?? '');
    const body = `The Pawn Shop · Hi ${customerName}, your fireworks order is ready for pickup. Your window: ${pickupWindow.trim()}. See you soon!`;
    try {
        const sent = await (0, sms_1.dispatchSms)(customerPhone, body);
        if (sent)
            await preorderRef.update({ smsDeliveredAt: firestore_1.Timestamp.now() });
    }
    catch (err) {
        console.error('[markPreorderReady] SMS failed:', err.message);
        await preorderRef.update({ staffNotes: (staffNotes?.trim() ? staffNotes.trim() + ' — ' : '') + 'SMS failed on ready — resend manually' });
    }
    return { success: true };
});
exports.collectPreorder = (0, https_1.onCall)({ cors: true }, async (request) => {
    const token = (request.auth?.token ?? {});
    if (!request.auth || !isStaffToken(token)) {
        throw new https_1.HttpsError('permission-denied', 'Staff access required');
    }
    const { preorderId } = request.data;
    if (!preorderId?.trim())
        throw new https_1.HttpsError('invalid-argument', 'preorderId is required');
    const db = (0, firestore_1.getFirestore)();
    const preorderRef = db.collection('preorders').doc(preorderId.trim());
    const snap = await preorderRef.get();
    if (!snap.exists)
        throw new https_1.HttpsError('not-found', 'Pre-order not found');
    const data = snap.data();
    if (data['status'] !== 'ready') {
        throw new https_1.HttpsError('failed-precondition', 'Only ready pre-orders can be marked collected');
    }
    const now = firestore_1.FieldValue.serverTimestamp();
    await preorderRef.update({ status: 'collected', updatedAt: now });
    await db.collection('auditLogs').add({
        eventType: 'preorder_collected',
        uid: request.auth.uid,
        targetId: preorderId.trim(),
        details: { preorderId: preorderId.trim(), viewTag: 'fireworks' },
        createdAt: now,
    });
    return { success: true };
});
exports.cancelPreorder = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in to cancel');
    const { preorderId } = request.data;
    if (!preorderId?.trim())
        throw new https_1.HttpsError('invalid-argument', 'preorderId is required');
    const db = (0, firestore_1.getFirestore)();
    const uid = request.auth.uid;
    const token = (request.auth.token ?? {});
    const preorderRef = db.collection('preorders').doc(preorderId.trim());
    const snap = await preorderRef.get();
    if (!snap.exists)
        throw new https_1.HttpsError('not-found', 'Pre-order not found');
    const data = snap.data();
    // Owner or staff can cancel; staff can cancel any, owner only their own
    const isOwner = data['uid'] === uid;
    if (!isOwner && !isStaffToken(token)) {
        throw new https_1.HttpsError('permission-denied', 'You can only cancel your own pre-orders');
    }
    const terminalStatuses = ['collected', 'cancelled'];
    if (terminalStatuses.includes(String(data['status']))) {
        throw new https_1.HttpsError('failed-precondition', 'This pre-order cannot be cancelled');
    }
    const now = firestore_1.FieldValue.serverTimestamp();
    await preorderRef.update({ status: 'cancelled', updatedAt: now });
    await db.collection('auditLogs').add({
        eventType: 'preorder_cancelled',
        uid,
        targetId: preorderId.trim(),
        details: { preorderId: preorderId.trim(), viewTag: 'fireworks' },
        createdAt: now,
    });
    return { success: true };
});
//# sourceMappingURL=preorders.js.map