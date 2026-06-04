"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveAndSchedulePost = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const authHelpers_1 = require("@pawn-shop/shared/lib/authHelpers");
exports.approveAndSchedulePost = (0, https_1.onCall)({ cors: true }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'Sign in required');
    }
    const token = request.auth.token;
    const isAdminOrManager = token['admin'] === true || token['manager'] === true;
    if (!isAdminOrManager) {
        throw new https_1.HttpsError('permission-denied', 'Admin or Manager role required to approve social media posts.');
    }
    (0, authHelpers_1.assertMfaEnrolled)(request);
    const { postId } = request.data;
    if (!postId) {
        throw new https_1.HttpsError('invalid-argument', 'Post ID is required');
    }
    const db = (0, firestore_1.getFirestore)();
    const postRef = db.collection('socialPosts').doc(postId);
    try {
        const postSnap = await postRef.get();
        if (!postSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Post not found');
        }
        const postData = postSnap.data();
        if (postData?.status !== 'pending_review') {
            throw new https_1.HttpsError('failed-precondition', 'Post must be in pending_review status to be approved.');
        }
        // STUB: Connect to Ayrshare or Buffer API here
        // Example: 
        // const ayrshareResponse = await fetch('https://app.ayrshare.com/api/post', {
        //   method: 'POST',
        //   headers: { 'Authorization': `Bearer ${process.env.AYRSHARE_API_KEY}`, 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     post: postData.content,
        //     platforms: postData.platforms,
        //     mediaUrls: postData.mediaUrls,
        //     scheduleDate: postData.scheduledFor ? postData.scheduledFor.toDate().toISOString() : undefined
        //   })
        // })
        // We simulate a successful API response with a dummy ID
        const dummyApiResponseId = `mock_ayrshare_${Date.now()}`;
        // Update document
        await postRef.update({
            status: 'approved',
            reviewerUid: request.auth.uid,
            apiResponseId: dummyApiResponseId,
            updatedAt: firestore_1.FieldValue.serverTimestamp()
        });
        // Optionally write to auditLogs
        await db.collection('auditLogs').add({
            eventType: 'social_post_approved',
            uid: request.auth.uid,
            targetId: postId,
            details: { platforms: postData?.platforms },
            createdAt: firestore_1.FieldValue.serverTimestamp()
        });
        return { success: true, apiResponseId: dummyApiResponseId };
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to approve and schedule post';
        throw new https_1.HttpsError('internal', msg);
    }
});
//# sourceMappingURL=social.js.map