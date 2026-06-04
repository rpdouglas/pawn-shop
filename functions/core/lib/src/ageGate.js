"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAgeGate = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const VALID_EVENTS = ['age_gate_pass', 'age_gate_fail'];
const VALID_VIEWS = ['cannabis', 'fireworks', 'tobacco'];
// Public invoker — anonymous users must be able to log age gate events without signing in.
// Admin SDK write bypasses Firestore rules (auditLogs allow create: isSignedIn() is for clients only).
exports.logAgeGate = (0, https_1.onCall)({ invoker: 'public', cors: true }, async (request) => {
    const { eventType, viewTag, policyVersion } = request.data;
    if (!VALID_EVENTS.includes(eventType)) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid eventType');
    }
    if (!VALID_VIEWS.includes(viewTag)) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid viewTag');
    }
    if (typeof policyVersion !== 'string' || policyVersion.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'policyVersion required');
    }
    await (0, firestore_1.getFirestore)().collection('auditLogs').add({
        eventType,
        uid: request.auth?.uid ?? 'anonymous',
        targetId: null,
        details: { viewTag, policyVersion },
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
//# sourceMappingURL=ageGate.js.map