"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactEmail = exports.updateStoreHours = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const mail_1 = __importDefault(require("@sendgrid/mail"));
const secrets_1 = require("@pawn-shop/shared/lib/secrets");
// ── updateStoreHours ─────────────────────────────────────────────────────────
const DAY_FIELDS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const TIME_RE = /^\d{2}:\d{2}$/;
function validateDay(day, name) {
    if (typeof day?.closed !== 'boolean') {
        throw new https_1.HttpsError('invalid-argument', `${name}.closed must be boolean`);
    }
    if (!TIME_RE.test(day.open))
        throw new https_1.HttpsError('invalid-argument', `${name}.open must be HH:MM`);
    if (!TIME_RE.test(day.close))
        throw new https_1.HttpsError('invalid-argument', `${name}.close must be HH:MM`);
    if (!day.closed) {
        const [oh, om] = day.open.split(':').map(Number);
        const [ch, cm] = day.close.split(':').map(Number);
        if (oh * 60 + om >= ch * 60 + cm) {
            throw new https_1.HttpsError('invalid-argument', `${name}: open time must be before close time`);
        }
    }
}
exports.updateStoreHours = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth?.token?.['admin']) {
        throw new https_1.HttpsError('permission-denied', 'Admin access required');
    }
    const data = request.data;
    for (const day of DAY_FIELDS)
        validateDay(data[day], day);
    const db = (0, firestore_1.getFirestore)();
    const uid = request.auth.uid;
    const now = firestore_1.FieldValue.serverTimestamp();
    const docData = { updatedBy: uid, updatedAt: now };
    for (const day of DAY_FIELDS) {
        docData[day] = { open: data[day].open, close: data[day].close, closed: data[day].closed };
    }
    await db.collection('config').doc('storeHours').set(docData, { merge: true });
    await db.collection('auditLogs').add({
        eventType: 'store_hours_updated',
        uid,
        targetId: 'config/storeHours',
        details: { daysModified: DAY_FIELDS.filter(d => !data[d].closed) },
        createdAt: now,
    });
    return { success: true };
});
exports.sendContactEmail = (0, https_1.onCall)({ cors: true, secrets: [secrets_1.sendgridApiKey] }, async (request) => {
    const { name, email, message } = request.data;
    if (!name?.trim() || name.length > 100)
        throw new https_1.HttpsError('invalid-argument', 'Name is required (max 100 characters)');
    if (!email?.trim() || email.length > 200)
        throw new https_1.HttpsError('invalid-argument', 'Email is required (max 200 characters)');
    if (!message?.trim() || message.length > 2000)
        throw new https_1.HttpsError('invalid-argument', 'Message is required (max 2000 characters)');
    const apiKey = secrets_1.sendgridApiKey.value();
    const staffEmail = secrets_1.staffContactEmail.value();
    if (apiKey && staffEmail) {
        mail_1.default.setApiKey(apiKey);
        try {
            await mail_1.default.send({
                to: staffEmail,
                from: staffEmail,
                replyTo: email.trim(),
                subject: 'The Pawn Shop — Contact Form',
                text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\nMessage:\n${message.trim()}`,
            });
        }
        catch (err) {
            console.error('[sendContactEmail] SendGrid error:', err.message);
            throw new https_1.HttpsError('internal', 'Failed to send — please try again or call us directly');
        }
    }
    else {
        console.warn('[sendContactEmail] SendGrid credentials not configured — skipping');
    }
    return { success: true };
});
//# sourceMappingURL=storeHours.js.map