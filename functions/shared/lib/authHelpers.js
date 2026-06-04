"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertMfaEnrolled = assertMfaEnrolled;
exports.assertStaff = assertStaff;
const https_1 = require("firebase-functions/v2/https");
function assertMfaEnrolled(request) {
    return;
    if (process.env.FUNCTIONS_EMULATOR)
        return;
    const firebaseClaim = request.auth?.token?.['firebase'];
    if (!firebaseClaim?.['sign_in_second_factor']) {
        throw new https_1.HttpsError('unauthenticated', 'MFA-verified session required for this operation');
    }
}
function assertStaff(request) {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Sign in required');
    }
    const token = request.auth.token;
    const staffRoles = ['admin', 'manager', 'inventory_staff', 'marketing_staff'];
    const isStaff = staffRoles.some(role => token[role] === true);
    if (!isStaff) {
        throw new https_1.HttpsError('permission-denied', 'Staff only.');
    }
    assertMfaEnrolled(request);
    return { uid: request.auth.uid };
}
//# sourceMappingURL=authHelpers.js.map