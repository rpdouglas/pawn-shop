import { Link } from 'react-router-dom'
import type { Article } from '../../lib/types'

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link 
      to={`/articles/${article.slug}`}
      style={{ 
        display: 'block',
        textDecoration: 'none',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        transition: 'transform 0.2s ease-in-out, border-color 0.2s ease-in-out'
      }}
      className="article-card"
    >
      <div style={{ padding: 'var(--space-6)' }}>
        <div style={{ 
          fontSize: 'var(--text-xs)', 
          textTransform: 'uppercase', 
          color: 'var(--color-primary)',
          letterSpacing: '0.1em',
          marginBottom: 'var(--space-2)'
        }}>
          {article.viewTag === 'all' ? 'Featured' : article.viewTag}
        </div>
        
        <h3 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 'var(--text-lead)',
          color: 'var(--color-text)',
          margin: '0 0 var(--space-3) 0',
          lineHeight: 1.2
        }}>
          {article.title}
        </h3>

        <p style={{ 
          fontSize: 'var(--text-small)', 
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {article.seoMeta.description || 'Read more about the Akwesasne story and our dapper finds.'}
        </p>

        <div style={{ 
          marginTop: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)'
        }}>
          <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'Draft'}</span>
          {article.indigenousLanguageReviewed && (
            <span style={{ 
              backgroundColor: 'var(--color-highlight)', 
              color: 'var(--color-accent)', 
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)'
            }}>
              Authentic Akwesasne
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
