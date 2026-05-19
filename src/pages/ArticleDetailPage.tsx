import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { collection, query, where, getDocs, limit, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Article } from '../lib/types'
import { useView } from '../context/ViewContext'

export default function ArticleDetailPage() {
  const { slug } = useParams()
  const { view } = useView()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    const fetchArticle = async () => {
      const q = query(
        collection(db, 'articles'),
        where('slug', '==', slug),
        where('status', '==', 'published'),
        limit(1)
      )
      const snap = await getDocs(q)
      if (!snap.empty) {
        const d = snap.docs[0].data() as Record<string, unknown>
        setArticle({
          id: snap.docs[0].id,
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
      }
      setLoading(false)
    }

    fetchArticle()
  }, [slug])

  if (loading) return <div style={{ padding: 'var(--space-20)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading story...</div>
  if (!article) return <div style={{ padding: 'var(--space-20)', textAlign: 'center', color: 'var(--color-text-muted)' }}>Story not found.</div>

  return (
    <div className={`view-${view}`} style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
        <header style={{ marginBottom: 'var(--space-12)', textAlign: 'center' }}>
          <div style={{ 
            fontSize: 'var(--text-xs)', 
            textTransform: 'uppercase', 
            color: 'var(--color-primary)', 
            letterSpacing: '0.2em',
            marginBottom: 'var(--space-4)'
          }}>
            {article.viewTag === 'all' ? 'The Pawn Shop Narrative' : `${article.viewTag} Stories`}
          </div>
          
          <h1 style={{ 
            fontFamily: 'var(--font-display)', 
            fontSize: '3.5rem', 
            color: 'var(--color-text)',
            margin: '0 0 var(--space-6) 0',
            lineHeight: 1.1
          }}>
            {article.title}
          </h1>

          <div style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
            <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}</span>
            {article.indigenousLanguageReviewed && (
              <span style={{ color: 'var(--color-accent)' }}>Authentic Akwesasne Identity</span>
            )}
          </div>
        </header>

        <div 
          style={{ 
            fontFamily: 'var(--font-body)', 
            fontSize: 'var(--text-body)', 
            color: 'var(--color-text)', 
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap' // Simple markdown rendering for MVP
          }}
        >
          {article.body}
        </div>

        <footer style={{ marginTop: 'var(--space-20)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-8)', textAlign: 'center' }}>
          <Link to="/" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Back to Storefront
          </Link>
        </footer>
      </article>
    </div>
  )
}