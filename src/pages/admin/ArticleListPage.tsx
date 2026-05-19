import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import type { Article } from '../../lib/types'
import ProtectedRoute from '../../components/auth/ProtectedRoute'

export default function ArticleListPage() {
  const { user } = useAuth()
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'articles'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => {
        const d = doc.data() as Record<string, unknown>
        return {
          id: doc.id,
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
        }
      })
      setArticles(data)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  const handleCreate = async () => {
    const title = prompt('Enter article title:')
    if (!title) return
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const viewTag = prompt('Enter view tag (pawn/cannabis/fireworks/all):', 'pawn') || 'pawn'

    try {
      const fn = httpsCallable(functions, 'createArticle')
      const result = await fn({ title, slug, viewTag })
      const data = result.data as { articleId: string }
      window.location.href = `/admin/articles/${data.articleId}/edit`
    } catch (err: unknown) {
      const error = err as { message?: string }
      alert(error.message || 'Failed to create article.')
    }
  }

  const columns = [
    { key: 'title' as keyof Article, header: 'Title' },
    { 
      key: 'status' as keyof Article, 
      header: 'Status',
      render: (a: Article) => <Badge variant={a.status === 'published' ? 'active' : 'draft'} label={a.status} />
    },
    { key: 'viewTag' as keyof Article, header: 'View' },
    { 
      key: 'indigenousLanguageReviewed' as keyof Article, 
      header: 'Reviewed',
      render: (a: Article) => a.indigenousLanguageReviewed ? '✅' : '—'
    },
    { 
      key: 'id' as keyof Article, 
      header: 'Actions',
      render: (a: Article) => (
        <Link 
          to={`/admin/articles/${a.id}/edit`} 
          style={{ color: 'var(--color-primary)', textDecoration: 'none', fontSize: 'var(--text-small)', minHeight: '48px', display: 'flex', alignItems: 'center' }}
        >
          Edit
        </Link>
      )
    }
  ]

  return (
    <ProtectedRoute staffOnly>
      <div style={{ padding: 'var(--space-8)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-8)' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', margin: 0 }}>Editorial CMS</h2>
            <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>Manage brand narrative and community stories.</p>
          </div>
          <Button variant="primary" onClick={handleCreate}>New Article</Button>
        </header>

        {loading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Loading articles...</p>
        ) : (
          <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <Table 
              columns={columns as unknown as { key: string; header: string; render?: (row: Record<string, unknown>) => React.ReactNode }[]} 
              data={articles as unknown as Record<string, unknown>[]} 
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
  }