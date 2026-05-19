import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import ArticleEditor from '../../components/admin/ArticleEditor'
import type { Article } from '../../lib/types'
import ProtectedRoute from '../../components/auth/ProtectedRoute'

export default function ArticleEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !user) return

    const fetchArticle = async () => {
      const snap = await getDoc(doc(db, 'articles', id))
      if (snap.exists()) {
        const d = snap.data() as Record<string, unknown>
        setArticle({
          id: snap.id,
          title: d.title as string,
          slug: d.slug as string,
          body: d.body as string,
          viewTag: d.viewTag as Article['viewTag'],
          status: d.status as Article['status'],
          seoMeta: d.seoMeta as Article['seoMeta'],
          publishedAt: (d.publishedAt as Timestamp)?.toDate?.() || null,
          authorUid: d.authorUid as string,
          indigenousLanguageReviewed: d.indigenousLanguageReviewed as boolean,
          createdAt: (d.createdAt as Timestamp)?.toDate?.() || new Date(),
          updatedAt: (d.updatedAt as Timestamp)?.toDate?.() || new Date()
        })
      } else {
        navigate('/admin/articles')
      }
      setLoading(false)
    }

    fetchArticle()
  }, [id, user, navigate])

  return (
    <ProtectedRoute staffOnly>
      <div style={{ padding: 'var(--space-8)' }}>
        <header style={{ marginBottom: 'var(--space-8)' }}>
          <Link to="/admin/articles" style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 'var(--text-xs)', textTransform: 'uppercase', marginBottom: 'var(--space-2)', display: 'block' }}>
            ← Back to Articles
          </Link>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', margin: 0 }}>
            {article ? `Editing: ${article.title}` : 'Loading Article...'}
          </h2>
        </header>

        {loading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Loading editor...</p>
        ) : article ? (
          <ArticleEditor 
            article={article} 
            onSave={() => {
              // Refresh or handle post-save
            }} 
          />
        ) : null}
      </div>
    </ProtectedRoute>
  )
}