import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { assertMfaEnrolled } from './auth'

interface ApprovePostData {
  postId: string
}

export const approveAndSchedulePost = onCall<ApprovePostData>({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in required')
  }

  const token = request.auth.token as Record<string, unknown>
  const isAdminOrManager = token['admin'] === true || token['manager'] === true
  
  if (!isAdminOrManager) {
    throw new HttpsError('permission-denied', 'Admin or Manager role required to approve social media posts.')
  }
  
  assertMfaEnrolled(request)

  const { postId } = request.data
  if (!postId) {
    throw new HttpsError('invalid-argument', 'Post ID is required')
  }

  const db = getFirestore()
  const postRef = db.collection('socialPosts').doc(postId)
  
  try {
    const postSnap = await postRef.get()
    if (!postSnap.exists) {
      throw new HttpsError('not-found', 'Post not found')
    }

    const postData = postSnap.data()
    if (postData?.status !== 'pending_review') {
      throw new HttpsError('failed-precondition', 'Post must be in pending_review status to be approved.')
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
    const dummyApiResponseId = `mock_ayrshare_${Date.now()}`

    // Update document
    await postRef.update({
      status: 'approved',
      reviewerUid: request.auth.uid,
      apiResponseId: dummyApiResponseId,
      updatedAt: FieldValue.serverTimestamp()
    })

    // Optionally write to auditLogs
    await db.collection('auditLogs').add({
      eventType: 'social_post_approved',
      uid: request.auth.uid,
      targetId: postId,
      details: { platforms: postData?.platforms },
      createdAt: FieldValue.serverTimestamp()
    })

    return { success: true, apiResponseId: dummyApiResponseId }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to approve and schedule post'
    throw new HttpsError('internal', msg)
  }
})
