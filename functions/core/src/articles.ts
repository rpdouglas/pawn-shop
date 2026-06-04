import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { assertStaff } from '@pawn-shop/shared/lib/authHelpers'

const db = getFirestore()

interface CreateArticleData {
  title: string
  slug: string
  viewTag: string
}

export const createArticle = onCall<CreateArticleData>({ cors: true }, async (request) => {
  const { uid } = assertStaff(request)
  const { title, slug, viewTag } = request.data

  if (!title || !slug || !viewTag) {
    throw new HttpsError('invalid-argument', 'Missing required fields')
  }

  // Check if slug is unique
  const existing = await db.collection('articles').where('slug', '==', slug).get()
  if (!existing.empty) {
    throw new HttpsError('already-exists', 'Slug already in use')
  }

  const now = FieldValue.serverTimestamp()
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
  })

  return { success: true, articleId: ref.id }
})

interface PublishArticleData {
  articleId: string
}

export const publishArticle = onCall<PublishArticleData>({ cors: true }, async (request) => {
  const { uid } = assertStaff(request)
  const { articleId } = request.data

  const articleRef = db.collection('articles').doc(articleId)
  const snap = await articleRef.get()

  if (!snap.exists) {
    throw new HttpsError('not-found', 'Article not found')
  }

  const article = snap.data() as Record<string, unknown>
  
  // Compliance Gate: blocked if Kanien'kéha rule not met (simulated by checking the flag)
  // In a real scenario, we might scan the body for Kanien'kéha tags/keywords
  // For E19, we rely on the manual staff flag as the gate.
  
  if (String(article['body'] ?? '').includes('[mohawk]') && !article['indigenousLanguageReviewed']) {
     throw new HttpsError('failed-precondition', 'Indigenous language review required before publishing content with [mohawk] tags.')
  }

  await articleRef.update({
    status: 'published',
    publishedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  })

  await db.collection('auditLogs').add({
    eventType: 'article_published',
    uid,
    targetId: articleId,
    details: { slug: article['slug'], viewTag: article['viewTag'] },
    createdAt: FieldValue.serverTimestamp()
  })

  return { success: true }
})
