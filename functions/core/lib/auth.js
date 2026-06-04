"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaffMembers = exports.recordMfaEnrolled = exports.recordLogout = exports.recordLogin = exports.inviteEmployee = exports.assignRole = void 0;
const authHelpers_1 = require("@pawn-shop/shared/lib/authHelpers");
const https_1 = require("firebase-functions/v2/https");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const node_crypto_1 = require("node:crypto");
const VALID_ROLES = [
    'admin', 'manager', 'inventory_staff', 'marketing_staff', 'customer',
];
function hashIp(rawIp) {
    return (0, node_crypto_1.createHash)('sha256').update(rawIp).digest('hex');
}
// Assigns or changes a user's role. Admin-only. Writes role_change auditLog.
exports.assignRole = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth || request.auth.token['admin'] !== true) {
        throw new https_1.HttpsError('permission-denied', 'Admin role required');
    }
    (0, authHelpers_1.assertMfaEnrolled)(request);
    const { uid, role } = request.data;
    if (!VALID_ROLES.includes(role)) {
        throw new https_1.HttpsError('invalid-argument', `Invalid role: ${role}`);
    }
    // Set exactly one role claim true; clear all others
    const claims = Object.fromEntries(VALID_ROLES.map((r) => [r, r === role]));
    await (0, auth_1.getAuth)().setCustomUserClaims(uid, claims);
    await (0, firestore_1.getFirestore)().collection('users').doc(uid).update({ role });
    await (0, firestore_1.getFirestore)().collection('auditLogs').add({
        eventType: 'role_change',
        uid: request.auth.uid,
        targetId: uid,
        details: { newRole: role },
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
exports.inviteEmployee = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth || request.auth.token['admin'] !== true) {
        throw new https_1.HttpsError('permission-denied', 'Admin role required');
    }
    (0, authHelpers_1.assertMfaEnrolled)(request);
    const { email, displayName, role } = request.data;
    if (!VALID_ROLES.includes(role)) {
        throw new https_1.HttpsError('invalid-argument', `Invalid role: ${role}`);
    }
    if (!email) {
        throw new https_1.HttpsError('invalid-argument', 'Email is required');
    }
    try {
        const userRecord = await (0, auth_1.getAuth)().createUser({
            email,
            displayName,
            emailVerified: true
        });
        const claims = Object.fromEntries(VALID_ROLES.map((r) => [r, r === role]));
        await (0, auth_1.getAuth)().setCustomUserClaims(userRecord.uid, claims);
        await (0, firestore_1.getFirestore)().collection('users').doc(userRecord.uid).set({
            email,
            displayName,
            role,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            lifetimeValue: 0
        });
        const resetLink = await (0, auth_1.getAuth)().generatePasswordResetLink(email);
        await (0, firestore_1.getFirestore)().collection('auditLogs').add({
            eventType: 'role_change',
            uid: request.auth.uid,
            targetId: userRecord.uid,
            details: { email, role, action: 'invite' },
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return { success: true, uid: userRecord.uid, resetLink };
    }
    catch (error) {
        throw new https_1.HttpsError('internal', error instanceof Error ? error.message : 'Failed to invite employee');
    }
});
// Called by the client after every successful sign-in.
// Creates users/{uid} on first login. Hashes IP before writing. Writes login auditLog.
exports.recordLogin = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Sign in required');
    }
    const { method } = request.data;
    const uid = request.auth.uid;
    // IP extraction — x-forwarded-for is preferred when behind a proxy
    const headers = request.rawRequest.headers;
    const rawIp = String(headers['x-forwarded-for'] || request.rawRequest.ip || 'unknown')
        .split(',')[0]
        .trim();
    const hashedIp = hashIp(rawIp);
    const db = (0, firestore_1.getFirestore)();
    const userRef = db.collection('users').doc(uid);
    const snap = await userRef.get();
    const now = firestore_1.FieldValue.serverTimestamp();
    if (!snap.exists) {
        const firebaseUser = await (0, auth_1.getAuth)().getUser(uid);
        const mfaEnrolled = (firebaseUser.multiFactor?.enrolledFactors?.length ?? 0) > 0;
        // Derive role from custom claims so staff accounts get the correct role on first login
        const existingClaims = (firebaseUser.customClaims ?? {});
        const role = VALID_ROLES.find((r) => existingClaims[r] === true) ?? 'customer';
        await userRef.set({
            email: firebaseUser.email ?? '',
            displayName: firebaseUser.displayName ?? '',
            role,
            mfaEnrolled,
            lifetimeValue: 0,
            lastLoginAt: now,
            lastLoginIp: hashedIp,
            createdAt: now,
        });
    }
    else {
        await userRef.update({ lastLoginAt: now, lastLoginIp: hashedIp });
    }
    await db.collection('auditLogs').add({
        eventType: 'login',
        uid,
        details: { method },
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
// Called by the client before signOut(). Writes logout auditLog.
exports.recordLogout = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Sign in required');
    }
    await (0, firestore_1.getFirestore)().collection('auditLogs').add({
        eventType: 'logout',
        uid: request.auth.uid,
        details: {},
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
// Called by the client after successful TOTP enrollment.
// Sets users/{uid}.mfaEnrolled = true and writes mfa_enrolled auditLog.
exports.recordMfaEnrolled = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Sign in required');
    }
    const uid = request.auth.uid;
    const db = (0, firestore_1.getFirestore)();
    await db.collection('users').doc(uid).update({ mfaEnrolled: true });
    await db.collection('auditLogs').add({
        eventType: 'mfa_enrolled',
        uid,
        details: {},
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
// New callable: getStaffMembers. Admin/Manager only.
exports.getStaffMembers = (0, https_1.onCall)({ cors: true }, async (request) => {
    const token = request.auth?.token;
    if (!request.auth || (token?.['admin'] !== true && token?.['manager'] !== true)) {
        throw new https_1.HttpsError('permission-denied', 'Admin or Manager role required');
    }
    (0, authHelpers_1.assertMfaEnrolled)(request);
    const db = (0, firestore_1.getFirestore)();
    const snap = await db.collection('users')
        .where('role', 'in', ['admin', 'manager', 'inventory_staff', 'marketing_staff'])
        .get();
    const staff = snap.docs.map(doc => {
        const data = doc.data();
        return {
            uid: doc.id,
            email: data['email'],
            displayName: data['displayName'],
            role: data['role'],
            mfaEnrolled: data['mfaEnrolled'],
            phoneNumber: data['phoneNumber'],
            lastLoginAt: data['lastLoginAt']?.toDate()?.toISOString(),
            createdAt: data['createdAt']?.toDate()?.toISOString(),
        };
    });
    return { staff };
});
//# sourceMappingURL=auth.js.map