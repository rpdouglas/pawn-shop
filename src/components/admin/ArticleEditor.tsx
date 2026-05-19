import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { updateDoc, doc } from 'firebase/firestore'
import { db, functions } from '../../lib/firebase'
import Button from '../ui/Button'
import type { Article, ViewType } from '../../lib/types'

interface ArticleEditorProps {
  article: Article
  onSave?: () => void
}

export default function ArticleEditor({ article, onSave }: ArticleEditorProps) {
  const [title, setTitle] = useState(article.title)
  const [body, setBody] = useState(article.body)
  const [viewTag, setViewTag] = useState(article.viewTag)
  const [seoTitle, setSeoTitle] = useState(article.seoMeta.title)
  const [seoDescription, setSeoDescription] = useState(article.seoMeta.description)
  const [indigenousLanguageReviewed, setIndigenousLanguageReviewed] = useState(article.indigenousLanguageReviewed)
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleUpdate = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const articleRef = doc(db, 'articles', article.id)
      await updateDoc(articleRef, {
        title,
        body,
        viewTag,
        seoMeta: {
          title: seoTitle,
          description: seoDescription
        },
        indigenousLanguageReviewed,
        updatedAt: new Date()
      })
      setMessage('Article updated successfully.')
      onSave?.()
    } catch {
      setMessage('Failed to update article.')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const fn = httpsCallable(functions, 'publishArticle')
      await fn({ articleId: article.id })
      setMessage('Article published!')
      onSave?.()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setMessage(error.message || 'Failed to publish.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-8)' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
              ARTICLE TITLE
            </label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              style={{ 
                width: '100%', 
                padding: 'var(--space-3)', 
                backgroundColor: 'var(--color-surface)', 
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-lead)'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)' }}>
              BODY (Markdown Supported)
            </label>
            <textarea 
              value={body} 
              onChange={(e) => setBody(e.target.value)}
              rows={15}
              style={{ 
                width: '100%', 
                padding: 'var(--space-4)', 
                backgroundColor: 'var(--color-surface)', 
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                lineHeight: 1.6
              }}
            />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <h4 style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
              Publishing Gate
            </h4>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-2)', 
              cursor: 'pointer',
              minHeight: '48px',
              fontSize: 'var(--text-small)'
            }}>
              <input 
                type="checkbox" 
                checked={indigenousLanguageReviewed} 
                onChange={(e) => setIndigenousLanguageReviewed(e.target.checked)}
                style={{ width: '20px', height: '20px' }}
              />
              Kanien'kéha Reviewed
            </label>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
              Mandatory if the article contains Mohawk language content.
            </p>

            <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <Button 
                variant="secondary" 
                fullWidth 
                onClick={handleUpdate} 
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button 
                variant="primary" 
                fullWidth 
                onClick={handlePublish} 
                disabled={loading || article.status === 'published'}
              >
                {article.status === 'published' ? 'Published' : 'Publish Now'}
              </Button>
            </div>
            {message && <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>{message}</p>}
          </div>

          <div style={{ padding: 'var(--space-6)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <h4 style={{ margin: '0 0 var(--space-4) 0', fontSize: 'var(--text-xs)', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
              Settings
            </h4>
            
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>
              Target View
            </label>
            <select 
              value={viewTag} 
              onChange={(e) => setViewTag(e.target.value as ViewType | 'all')}
              style={{ width: '100%', padding: 'var(--space-2)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            >
              <option value="pawn">Pawn</option>
              <option value="cannabis">Cannabis</option>
              <option value="fireworks">Fireworks</option>
              <option value="all">Featured (All)</option>
            </select>

            <div style={{ marginTop: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>
                SEO Title
              </label>
              <input 
                type="text" 
                value={seoTitle} 
                onChange={(e) => setSeoTitle(e.target.value)}
                style={{ width: '100%', padding: 'var(--space-2)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              />
            </div>

            <div style={{ marginTop: 'var(--space-4)' }}>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)' }}>
                SEO Description
              </label>
              <textarea 
                value={seoDescription} 
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: 'var(--space-2)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
