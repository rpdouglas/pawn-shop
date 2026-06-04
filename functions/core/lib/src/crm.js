"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crmDailyReminders = exports.updateResellerTier = exports.assignVipStatus = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
const sms_1 = require("@pawn-shop/shared/lib/sms");
const secrets_1 = require("@pawn-shop/shared/lib/secrets");
exports.assignVipStatus = (0, https_1.onCall)({ cors: true }, async (request) => {
    const token = (request.auth?.token ?? {});
    if (!token['admin'] && !token['manager']) {
        throw new https_1.HttpsError('permission-denied', 'Manager access required');
    }
    const { targetUid, vipFlag } = request.data;
    if (!targetUid?.trim())
        throw new https_1.HttpsError('invalid-argument', 'targetUid is required');
    const db = (0, firestore_1.getFirestore)();
    const uid = request.auth.uid;
    await db.collection('users').doc(targetUid.trim()).update({
        vipFlag,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    await db.collection('auditLogs').add({
        eventType: 'vip_status_change',
        uid,
        targetId: targetUid.trim(),
        details: { vipFlag },
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
exports.updateResellerTier = (0, https_1.onCall)({ cors: true }, async (request) => {
    const token = (request.auth?.token ?? {});
    if (!token['admin'] && !token['manager']) {
        throw new https_1.HttpsError('permission-denied', 'Manager access required');
    }
    const { targetUid, tier } = request.data;
    if (!targetUid?.trim())
        throw new https_1.HttpsError('invalid-argument', 'targetUid is required');
    const db = (0, firestore_1.getFirestore)();
    const uid = request.auth.uid;
    await db.collection('users').doc(targetUid.trim()).update({
        resellerTier: tier,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    await db.collection('auditLogs').add({
        eventType: 'reseller_tier_change',
        uid,
        targetId: targetUid.trim(),
        details: { tier },
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
// ── crmDailyReminders ────────────────────────────────────────────────────────
// Scheduled task to run daily at 09:00 Cornwall Island time (approx 14:00 UTC)
exports.crmDailyReminders = (0, scheduler_1.onSchedule)({ schedule: 'every day 09:00', secrets: [secrets_1.twilioAccountSid, secrets_1.twilioAuthToken] }, async () => {
    const db = (0, firestore_1.getFirestore)();
    const now = new Date();
    // 1. Staff Reminders: Pending pawn requests > 48h
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const pendingPawnRequests = await db.collection('pawnRequests')
        .where('status', '==', 'pending')
        .where('createdAt', '<=', fortyEightHoursAgo)
        .get();
    if (!pendingPawnRequests.empty) {
        console.info(`[CRM] Found ${pendingPawnRequests.size} pending pawn requests > 48h. Notifying staff...`);
        // In a real scenario, we'd send an email to the staff mailing list.
        // For now, we log the event.
        await db.collection('auditLogs').add({
            eventType: 'crm_followup_sent',
            uid: 'system',
            details: { type: 'staff_pawn_reminder', count: pendingPawnRequests.size },
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    // 2. Customer Follow-ups: Quoted pawn requests > 72h
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    const quotedPawnRequests = await db.collection('pawnRequests')
        .where('status', '==', 'quoted')
        .where('createdAt', '<=', seventyTwoHoursAgo)
        .get();
    for (const doc of quotedPawnRequests.docs) {
        const data = doc.data();
        const userUid = data['uid'];
        if (userUid) {
            const userSnap = await db.collection('users').doc(userUid).get();
            const userData = userSnap.data();
            // Marie Discretion Test & CASL Compliance
            if (userData?.['alertOptIn'] === true && userData['phoneNumber']) {
                const body = `The Pawn Shop Update — checking in on your recent enquiry. If you have questions, we are here to help.`;
                try {
                    const sent = await (0, sms_1.dispatchSms)(userData['phoneNumber'], body);
                    if (sent) {
                        await db.collection('auditLogs').add({
                            eventType: 'crm_followup_sent',
                            uid: 'system',
                            targetId: userUid,
                            details: { type: 'customer_pawn_followup', requestId: doc.id },
                            createdAt: firestore_1.FieldValue.serverTimestamp(),
                        });
                    }
                }
                catch (err) {
                    console.error(`[CRM] Failed to send follow-up to ${userUid}:`, err.message);
                }
            }
        }
    }
});
//# sourceMappingURL=crm.js.map