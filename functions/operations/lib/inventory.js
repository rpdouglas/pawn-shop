"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.purgeRecycledItems = exports.clearRecycleBin = exports.deleteInventoryItem = exports.processUploadedImage = exports.resetExpiredHolds = exports.adjustInventory = exports.setPoliceHold = exports.setHold = exports.publishItem = exports.createDraftItem = exports.onItemPublished = void 0;
const https_1 = require("firebase-functions/v2/https");
const authHelpers_1 = require("@pawn-shop/shared/lib/authHelpers");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_2 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const sharp_1 = __importDefault(require("sharp"));
const path = __importStar(require("node:path"));
const sms_1 = require("@pawn-shop/shared/lib/sms");
const secrets_1 = require("@pawn-shop/shared/lib/secrets");
const ai_1 = require("./ai");
// ── Helpers ───────────────────────────────────────────────────────────────────
function isStaffToken(token) {
    return token['admin'] === true || token['manager'] === true || token['inventory_staff'] === true;
}
// Generates prefix-search tokens from title and category (Dale + Kevin requirement).
// "Gold Watch" → ['g','go','gol','gold','w','wa','wat','watc','watch'], plus category tokens.
function buildSearchTokens(title, category) {
    const text = `${title} ${category}`.toLowerCase();
    const words = text.split(/\s+/).filter(Boolean);
    const tokens = new Set();
    for (const word of words) {
        for (let i = 1; i <= word.length; i++) {
            tokens.add(word.slice(0, i));
        }
    }
    return Array.from(tokens);
}
// ── Alerts & Notifications (E12) ──────────────────────────────────────────────
/**
 * Triggered whenever an item is updated.
 * If status transitions to 'active' and policeHold is false, dispatches alerts.
 */
exports.onItemPublished = (0, firestore_1.onDocumentUpdated)({ document: 'items/{itemId}', secrets: [secrets_1.twilioAccountSid, secrets_1.twilioAuthToken] }, async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!after)
        return;
    if (before?.['status'] === 'active')
        return; // Only trigger on transition to active
    if (after['status'] !== 'active')
        return;
    if (after['policeHold'] === true)
        return; // Never alert on police hold items
    const db = (0, firestore_2.getFirestore)();
    const itemId = event.params.itemId;
    const viewTag = after['viewTag'];
    const title = after['title'];
    const searchTokens = new Set(after['searchTokens'] ?? []);
    const searchesSnap = await db.collection('savedSearches')
        .where('active', '==', true)
        .where('viewTag', '==', viewTag)
        .get();
    if (searchesSnap.empty)
        return;
    const notifications = searchesSnap.docs.map(async (doc) => {
        const savedSearch = doc.data();
        const queryStr = String(savedSearch['query'] ?? '').toLowerCase().trim();
        // Exact match on one of the search tokens
        if (!searchTokens.has(queryStr))
            return;
        const userSnap = await db.collection('users').doc(String(savedSearch['uid'])).get();
        if (!userSnap.exists)
            return;
        const user = userSnap.data();
        if (user['alertOptIn'] !== true)
            return;
        const alerts = [];
        // 1. In-app notification
        alerts.push(db.collection('users').doc(userSnap.id).collection('notifications').add({
            title: 'New Item Match!',
            body: `A new item matching "${queryStr}" is now available.`,
            link: `/pawn/item/${itemId}`, // Assuming path structure
            read: false,
            createdAt: firestore_2.FieldValue.serverTimestamp()
        }));
        // 2. External Alert (SMS/Email)
        const alertMethod = user['alertMethod'];
        if (alertMethod === 'sms' && user['phoneNumber']) {
            // Discretion: generic branding for cannabis/fireworks
            const body = viewTag === 'pawn'
                ? `[The Pawn Shop] Match found: ${title}. View: https://pawn.shop/item/${itemId}`
                : `[The Pawn Shop Update] A new item matching your search is available. View: https://pawn.shop/item/${itemId}`;
            alerts.push((0, sms_1.dispatchSms)(user['phoneNumber'], body));
        }
        else if (alertMethod === 'email' && user['email']) {
            // Email dispatch would go here (SendGrid)
            // For now, logging email intent as SendGrid helper is internal to storeHours.ts
            console.info(`[Email Alert] uid=${userSnap.id} subject="New Match Found"`);
        }
        return Promise.all(alerts);
    });
    await Promise.all(notifications.filter(Boolean));
});
exports.createDraftItem = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth || !isStaffToken(request.auth.token)) {
        throw new https_1.HttpsError('permission-denied', 'Staff role required');
    }
    const { title, category, viewTag } = request.data;
    if (!title)
        throw new https_1.HttpsError('invalid-argument', 'title is required');
    if (!category)
        throw new https_1.HttpsError('invalid-argument', 'category is required');
    if (!viewTag)
        throw new https_1.HttpsError('invalid-argument', 'viewTag is required');
    const now = firestore_2.FieldValue.serverTimestamp();
    const ref = await (0, firestore_2.getFirestore)().collection('items').add({
        title,
        category,
        viewTag,
        status: 'draft',
        policeHold: false,
        images: [],
        searchTokens: [],
        createdAt: now,
        updatedAt: now,
    });
    return { success: true, itemId: ref.id };
});
// ── processImageUpload ────────────────────────────────────────────────────────
// Storage trigger. Staff uploads to items/{itemId}/uploads/{filename}.
// This function watermarks → converts to WebP → writes final URL to items/{id}.images[]
// → deletes the temp original.
const WATERMARK_SVG = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="260" height="36">
    <text x="6" y="26" font-family="sans-serif" font-size="16"
          fill="white" fill-opacity="0.60" font-weight="bold">© The Pawn Shop</text>
  </svg>`);
exports.publishItem = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth || !isStaffToken(request.auth.token)) {
        throw new https_1.HttpsError('permission-denied', 'Staff role required');
    }
    const { itemId } = request.data;
    if (!itemId)
        throw new https_1.HttpsError('invalid-argument', 'itemId is required');
    const db = (0, firestore_2.getFirestore)();
    const itemRef = db.collection('items').doc(itemId);
    const snap = await itemRef.get();
    if (!snap.exists)
        throw new https_1.HttpsError('not-found', `Item ${itemId} not found`);
    const item = snap.data();
    if (item['status'] !== 'draft') {
        throw new https_1.HttpsError('failed-precondition', `Item must be in draft status, current: ${item['status']}`);
    }
    if (!item['title'])
        throw new https_1.HttpsError('invalid-argument', 'title is required');
    if (!item['description'])
        throw new https_1.HttpsError('invalid-argument', 'description is required');
    if (!item['category'])
        throw new https_1.HttpsError('invalid-argument', 'category is required');
    if (!item['viewTag'])
        throw new https_1.HttpsError('invalid-argument', 'viewTag is required');
    if (typeof item['price'] !== 'number' || item['price'] <= 0) {
        throw new https_1.HttpsError('invalid-argument', 'price must be a positive integer (CAD cents)');
    }
    if (!item['condition'])
        throw new https_1.HttpsError('invalid-argument', 'condition is required');
    if (!Array.isArray(item['images']) || item['images'].length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'At least one image is required before publishing');
    }
    const searchTokens = buildSearchTokens(String(item['title']), String(item['category']));
    await itemRef.update({
        status: 'active',
        policeHold: item['policeHold'] ?? false,
        searchTokens,
        publishedBy: request.auth.uid,
        merchandisingTags: firestore_2.FieldValue.arrayUnion('just-arrived'),
        updatedAt: firestore_2.FieldValue.serverTimestamp(),
    });
    await db.collection('auditLogs').add({
        eventType: 'item_published',
        uid: request.auth.uid,
        targetId: itemId,
        details: { itemId, fromStatus: 'draft', toStatus: 'active' },
        createdAt: firestore_2.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
const HOLD_DURATION_MS = 48 * 60 * 60 * 1000;
exports.setHold = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Sign in required');
    }
    const { itemId } = request.data;
    if (!itemId)
        throw new https_1.HttpsError('invalid-argument', 'itemId is required');
    const db = (0, firestore_2.getFirestore)();
    const itemRef = db.collection('items').doc(itemId);
    const snap = await itemRef.get();
    if (!snap.exists)
        throw new https_1.HttpsError('not-found', `Item ${itemId} not found`);
    const item = snap.data();
    if (item['status'] !== 'active') {
        throw new https_1.HttpsError('failed-precondition', `Item is not available for hold, current status: ${item['status']}`);
    }
    const holdExpiresAt = firestore_2.Timestamp.fromMillis(Date.now() + HOLD_DURATION_MS);
    await itemRef.update({
        status: 'reserved',
        holdExpiresAt,
        updatedAt: firestore_2.FieldValue.serverTimestamp(),
    });
    await db.collection('auditLogs').add({
        eventType: 'hold_set',
        uid: request.auth.uid,
        targetId: itemId,
        details: { itemId, fromStatus: 'active', toStatus: 'reserved' },
        createdAt: firestore_2.FieldValue.serverTimestamp(),
    });
    return { success: true, holdExpiresAt: holdExpiresAt.toDate().toISOString() };
});
exports.setPoliceHold = (0, https_1.onCall)({ cors: true }, async (request) => {
    const token = request.auth?.token;
    if (!request.auth || token?.['admin'] !== true) {
        throw new https_1.HttpsError('permission-denied', 'Admin role required');
    }
    (0, authHelpers_1.assertMfaEnrolled)(request);
    const { itemId, hold } = request.data;
    if (!itemId)
        throw new https_1.HttpsError('invalid-argument', 'itemId is required');
    if (typeof hold !== 'boolean')
        throw new https_1.HttpsError('invalid-argument', 'hold must be boolean');
    const db = (0, firestore_2.getFirestore)();
    const itemRef = db.collection('items').doc(itemId);
    const snap = await itemRef.get();
    if (!snap.exists)
        throw new https_1.HttpsError('not-found', `Item ${itemId} not found`);
    const previousValue = snap.data()['policeHold'] ?? false;
    await itemRef.update({
        policeHold: hold,
        updatedAt: firestore_2.FieldValue.serverTimestamp(),
    });
    await db.collection('auditLogs').add({
        eventType: 'police_hold_set',
        uid: request.auth.uid,
        targetId: itemId,
        details: { itemId, previousValue, newValue: hold },
        createdAt: firestore_2.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
exports.adjustInventory = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth || !isStaffToken(request.auth.token)) {
        throw new https_1.HttpsError('permission-denied', 'Staff role required');
    }
    const { itemId, delta, reason } = request.data;
    if (!itemId)
        throw new https_1.HttpsError('invalid-argument', 'itemId is required');
    if (typeof delta !== 'number' || !Number.isInteger(delta) || delta === 0) {
        throw new https_1.HttpsError('invalid-argument', 'delta must be a non-zero integer');
    }
    const db = (0, firestore_2.getFirestore)();
    const itemRef = db.collection('items').doc(itemId);
    const snap = await itemRef.get();
    if (!snap.exists)
        throw new https_1.HttpsError('not-found', `Item ${itemId} not found`);
    const item = snap.data();
    const currentQuantity = typeof item['quantity'] === 'number' ? item['quantity'] : 0;
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 0) {
        throw new https_1.HttpsError('failed-precondition', `Cannot reduce quantity below 0 (current: ${currentQuantity}, delta: ${delta})`);
    }
    await itemRef.update({
        quantity: newQuantity,
        updatedAt: firestore_2.FieldValue.serverTimestamp(),
    });
    await db.collection('auditLogs').add({
        eventType: 'inventory_quantity_adjusted',
        uid: request.auth.uid,
        targetId: itemId,
        details: { delta, newQuantity, reason: reason ?? null },
        createdAt: firestore_2.FieldValue.serverTimestamp(),
    });
    return { success: true, newQuantity };
});
// ── resetExpiredHolds ─────────────────────────────────────────────────────────
// Scheduled every 30 minutes. Resets any reserved items whose holdExpiresAt has passed.
exports.resetExpiredHolds = (0, scheduler_1.onSchedule)('every 30 minutes', async () => {
    const db = (0, firestore_2.getFirestore)();
    const now = firestore_2.Timestamp.now();
    const expired = await db.collection('items')
        .where('status', '==', 'reserved')
        .where('holdExpiresAt', '<', now)
        .get();
    if (expired.empty)
        return;
    await Promise.all(expired.docs.map(async (doc) => {
        await doc.ref.update({
            status: 'active',
            holdExpiresAt: firestore_2.FieldValue.delete(),
            updatedAt: firestore_2.FieldValue.serverTimestamp(),
        });
        await db.collection('auditLogs').add({
            eventType: 'hold_expired',
            uid: 'system',
            targetId: doc.id,
            details: { itemId: doc.id, fromStatus: 'reserved', toStatus: 'active' },
            createdAt: firestore_2.FieldValue.serverTimestamp(),
        });
    }));
});
// ── processUploadedImage ──────────────────────────────────────────────────────
// Callable CF. Called by MobileIntakePage after successful storage upload.
// Manually kicks off the image processing pipeline.
exports.processUploadedImage = (0, https_1.onCall)({ cors: true, memory: '1GiB', timeoutSeconds: 120, secrets: [ai_1.geminiApiKey] }, async (request) => {
    if (!request.auth || !isStaffToken(request.auth.token)) {
        throw new https_1.HttpsError('permission-denied', 'Staff role required');
    }
    const { filePath, extractData, viewTag } = request.data;
    if (!filePath)
        throw new https_1.HttpsError('invalid-argument', 'filePath is required');
    const match = filePath.match(/^items\/([^/]+)\/uploads\/([^/]+)$/);
    if (!match)
        throw new https_1.HttpsError('invalid-argument', 'Invalid filePath format');
    const [, itemId, filename] = match;
    const db = (0, firestore_2.getFirestore)();
    const bucket = (0, storage_1.getStorage)().bucket();
    const tempFile = bucket.file(filePath);
    const jobRef = db.collection("items").doc(itemId).collection("imageJobs").doc(filename);
    try {
        const jobSnap = await jobRef.get();
        const attempt = jobSnap.exists ? (jobSnap.data()?.attempt || 1) + 1 : 2;
        await jobRef.set({
            fileName: filename,
            status: 'retrying',
            attempt,
            updatedAt: firestore_2.FieldValue.serverTimestamp()
        }, { merge: true });
        const [exists] = await tempFile.exists();
        if (!exists)
            throw new https_1.HttpsError('not-found', 'Temporary image file not found');
        const [buffer] = await tempFile.download();
        const image = (0, sharp_1.default)(buffer);
        const metadata = await image.metadata();
        const canWatermark = (metadata.width && metadata.width >= 260) && (metadata.height && metadata.height >= 36);
        const watermarked = await (canWatermark ? image.composite([{ input: WATERMARK_SVG, gravity: "southeast" }]) : image)
            .webp({ quality: 85 })
            .toBuffer();
        const finalPath = `items/${itemId}/images/${path.parse(filename).name}.webp`;
        const finalFile = bucket.file(finalPath);
        await finalFile.save(watermarked, {
            contentType: "image/webp",
            public: true,
        });
        const finalUrl = finalFile.publicUrl();
        await db.collection("items").doc(itemId).update({
            images: firestore_2.FieldValue.arrayUnion(finalUrl),
            updatedAt: firestore_2.FieldValue.serverTimestamp(),
        });
        if (extractData && viewTag) {
            await jobRef.update({ status: 'analyzing' });
            const [meta] = await tempFile.getMetadata();
            const mimeType = meta.contentType || 'image/jpeg';
            const aiResult = await (0, ai_1.extractIntakeData)(buffer, mimeType, viewTag);
            if (aiResult && aiResult.error) {
                // Graceful degradation: log the error but don't fail the upload
                await jobRef.update({
                    status: 'completed',
                    aiError: aiResult.error,
                    updatedAt: firestore_2.FieldValue.serverTimestamp()
                });
                await tempFile.delete();
                return { success: true, url: finalUrl, aiFailed: true, aiError: aiResult.error };
            }
            else if (aiResult) {
                await db.collection("items").doc(itemId).collection("internal").doc("ai").set({
                    intakeExtraction: {
                        ...aiResult,
                        marketPricing: {
                            ...aiResult.marketPricing,
                            retrievedAt: firestore_2.FieldValue.serverTimestamp()
                        }
                    },
                    updatedAt: firestore_2.FieldValue.serverTimestamp(),
                    generatedBy: request.auth.uid
                }, { merge: true });
            }
        }
        await tempFile.delete();
        await jobRef.update({
            status: 'completed',
            updatedAt: firestore_2.FieldValue.serverTimestamp()
        });
        return { success: true, url: finalUrl };
    }
    catch (e) {
        await jobRef.update({
            status: 'failed',
            error: e instanceof Error ? e.message : 'Unknown error during retry',
            updatedAt: firestore_2.FieldValue.serverTimestamp()
        }).catch(() => { });
        throw new https_1.HttpsError('internal', `Retry failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
});
exports.deleteInventoryItem = (0, https_1.onCall)({ cors: true }, async (request) => {
    const token = request.auth?.token;
    if (!request.auth || (token?.['admin'] !== true && token?.['manager'] !== true)) {
        throw new https_1.HttpsError('permission-denied', 'Admin or Manager role required to delete');
    }
    (0, authHelpers_1.assertMfaEnrolled)(request);
    const { itemId } = request.data;
    if (!itemId)
        throw new https_1.HttpsError('invalid-argument', 'itemId is required');
    const db = (0, firestore_2.getFirestore)();
    const itemRef = db.collection('items').doc(itemId);
    const snap = await itemRef.get();
    if (!snap.exists)
        throw new https_1.HttpsError('not-found', `Item ${itemId} not found`);
    const itemData = snap.data();
    // 1. Delete internal subcollections
    const internalStaff = await itemRef.collection('internal').doc('staff').get();
    const internalAi = await itemRef.collection('internal').doc('ai').get();
    if (internalStaff.exists)
        await internalStaff.ref.delete();
    if (internalAi.exists)
        await internalAi.ref.delete();
    // 2. Delete Storage folder (images and uploads)
    const bucket = (0, storage_1.getStorage)().bucket();
    try {
        await bucket.deleteFiles({ prefix: `items/${itemId}/` });
    }
    catch (e) {
        console.warn(`Storage deletion failed or no files found for items/${itemId}/`, e);
    }
    // 3. Delete item doc
    await itemRef.delete();
    // 4. Audit Log
    await db.collection('auditLogs').add({
        eventType: 'item_deleted',
        uid: request.auth.uid,
        targetId: itemId,
        details: { itemId, title: itemData['title'] ?? 'Unknown' },
        createdAt: firestore_2.FieldValue.serverTimestamp(),
    });
    return { success: true };
});
// ── clearRecycleBin ───────────────────────────────────────────────────────────
// Hard deletes all items with status = 'deleted'. Admin only.
exports.clearRecycleBin = (0, https_1.onCall)({ cors: true, timeoutSeconds: 300 }, async (request) => {
    const token = request.auth?.token;
    if (!request.auth || token?.['admin'] !== true) {
        throw new https_1.HttpsError('permission-denied', 'Admin role required to clear recycle bin');
    }
    (0, authHelpers_1.assertMfaEnrolled)(request);
    const db = (0, firestore_2.getFirestore)();
    const snap = await db.collection('items').where('status', '==', 'deleted').get();
    if (snap.empty)
        return { success: true, deletedCount: 0 };
    const bucket = (0, storage_1.getStorage)().bucket();
    let deletedCount = 0;
    for (const doc of snap.docs) {
        const itemId = doc.id;
        await doc.ref.collection('internal').doc('staff').delete().catch(() => { });
        await doc.ref.collection('internal').doc('ai').delete().catch(() => { });
        try {
            await bucket.deleteFiles({ prefix: `items/${itemId}/` });
        }
        catch (e) {
            console.warn(`Storage deletion failed for items/${itemId}/`, e);
        }
        await doc.ref.delete();
        deletedCount++;
    }
    await db.collection('auditLogs').add({
        eventType: 'data_purged',
        uid: request.auth.uid,
        targetId: 'items',
        details: { collection: 'items', recordsDeleted: deletedCount, action: 'clearRecycleBin' },
        createdAt: firestore_2.FieldValue.serverTimestamp(),
    });
    return { success: true, deletedCount };
});
// ── purgeRecycledItems ────────────────────────────────────────────────────────
// Scheduled daily. Hard deletes items that have been in the recycle bin > 30 days.
exports.purgeRecycledItems = (0, scheduler_1.onSchedule)('every day 03:00', async () => {
    const db = (0, firestore_2.getFirestore)();
    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const cutoff = firestore_2.Timestamp.fromMillis(now - thirtyDaysMs);
    const snap = await db.collection('items')
        .where('status', '==', 'deleted')
        .where('deletedAt', '<', cutoff)
        .limit(500)
        .get();
    if (snap.empty)
        return;
    const bucket = (0, storage_1.getStorage)().bucket();
    let deletedCount = 0;
    for (const doc of snap.docs) {
        const itemId = doc.id;
        await doc.ref.collection('internal').doc('staff').delete().catch(() => { });
        await doc.ref.collection('internal').doc('ai').delete().catch(() => { });
        try {
            await bucket.deleteFiles({ prefix: `items/${itemId}/` });
        }
        catch {
            // Ignore storage deletion errors
        }
        await doc.ref.delete();
        deletedCount++;
    }
    await db.collection('auditLogs').add({
        eventType: 'data_purged',
        uid: 'system',
        targetId: 'items',
        details: { collection: 'items', recordsDeleted: deletedCount, reason: '30_day_recycle_bin_purge' },
        createdAt: firestore_2.FieldValue.serverTimestamp(),
    });
});
//# sourceMappingURL=inventory.js.map