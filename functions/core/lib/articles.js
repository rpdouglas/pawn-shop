"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishArticle = exports.createArticle = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const authHelpers_1 = require("@pawn-shop/shared/lib/authHelpers");
exports.createArticle = (0, https_1.onCall)({ cors: true }, async (request) => {
    const db = (0, firestore_1.getFirestore)();
    const { uid } = (0, authHelpers_1.assertStaff)(request);
    const { title, slug, viewTag } = request.data;
    if (!title || !slug || !viewTag) {
        throw new https_1.HttpsError('invalid-argument', 'Missing required fields');
    }
    // Check if slug is unique
    const existing = await db.collection('articles').where('slug', '==', slug).get();
    if (!existing.empty) {
        throw new https_1.HttpsError('already-exists', 'Slug already in use');
    }
    const now = firestore_1.FieldValue.serverTimestamp();
    const ref = await db.collection('articles').add({
        title,
        slug,
        body: '',
        viewTag,
        status: 'draft',
        seoMeta: {
            title: title,
            description: ''
        },
        authorUid: uid,
        indigenousLanguageReviewed: false,
        createdAt: now,
        updatedAt: now
    });
    return { success: true, articleId: ref.id };
});
exports.publishArticle = (0, https_1.onCall)({ cors: true }, async (request) => {
    const db = (0, firestore_1.getFirestore)();
    const { uid } = (0, authHelpers_1.assertStaff)(request);
    const { articleId } = request.data;
    const articleRef = db.collection('articles').doc(articleId);
    const snap = await articleRef.get();
    if (!snap.exists) {
        throw new https_1.HttpsError('not-found', 'Article not found');
    }
    const article = snap.data();
    // Compliance Gate: blocked if Kanien'kéha rule not met (simulated by checking the flag)
    // In a real scenario, we might scan the body for Kanien'kéha tags/keywords
    // For E19, we rely on the manual staff flag as the gate.
    if (String(article['body'] ?? '').includes('[mohawk]') && !article['indigenousLanguageReviewed']) {
        throw new https_1.HttpsError('failed-precondition', 'Indigenous language review required before publishing content with [mohawk] tags.');
    }
    await articleRef.update({
        status: 'published',
        publishedAt: firestore_1.FieldValue.serverTimestamp(),
        updatedAt: firestore_1.FieldValue.serverTimestamp()
    });
    await db.collection('auditLogs').add({
        eventType: 'article_published',
        uid,
        targetId: articleId,
        details: { slug: article['slug'], viewTag: article['viewTag'] },
        createdAt: firestore_1.FieldValue.serverTimestamp()
    });
    return { success: true };
});
//# sourceMappingURL=articles.js.map