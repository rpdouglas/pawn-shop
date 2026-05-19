import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Article, ViewType } from '../lib/types'
import ArticleCard from '../components/ui/ArticleCard'

interface ArticleSectionProps {
  viewTag: ViewType
  title?: string
}

export default function ArticleSection({ viewTag, title = 'Stories & Narrative' }: ArticleSectionProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Query articles for this view or 'all'
    const q = query(
      collection(db, 'articles'),
      where('status', '==', 'published'),
      where('viewTag', 'in', [viewTag, 'all']),
      orderBy('publishedAt', 'desc'),
      limit(3)
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        publishedAt: (doc.data()['publishedAt'] as Timestamp)?.toDate?.() || doc.data()['publishedAt']
      })) as unknown as Article[]
      setArticles(data)
      setLoading(false)
    })

    return unsubscribe
  }, [viewTag])

  if (loading || articles.length === 0) return null

  return (
    <section style={{ padding: 'var(--space-20) 0' }}>
      <header style={{ marginBottom: 'var(--space-10)', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--color-text)', margin: 0 }}>
          {title}
        </h2>
        <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--color-primary)', margin: 'var(--space-4) auto' }} />
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: 'var(--space-8)' 
      }}>
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  )
}
