"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logFaqAction = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const authHelpers_1 = require("@pawn-shop/shared/authHelpers");
const db = (0, firestore_1.getFirestore)();
exports.logFaqAction = (0, https_1.onCall)({ cors: true }, async (request) => {
    const { uid } = (0, authHelpers_1.assertStaff)(request);
    const { action, faqId, details } = request.data;
    if (!action || !faqId) {
        throw new https_1.HttpsError('invalid-argument', 'Missing required fields');
    }
    await db.collection('auditLogs').add({
        eventType: action,
        uid,
        targetId: faqId,
        details: details || {},
        createdAt: firestore_1.FieldValue.serverTimestamp()
    });
    return { success: true };
});
//# sourceMappingURL=faqs.js.map