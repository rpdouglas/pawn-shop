import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { Link } from 'react-router-dom'
import { db, functions } from '../../../lib/firebase'
import { useAuth } from '../../../context/AuthContext'
import type { SocialPost, SocialPlatform } from '../../../lib/types'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import ReactMarkdown from 'react-markdown'

export default function SocialDashboardPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending_review' | 'approved' | 'published'>('all')

  useEffect(() => {
    const q = query(collection(db, 'socialPosts'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map(d => {
        const data = d.data()
        return {
          ...data,
          id: d.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          scheduledFor: data.scheduledFor?.toDate(),
          publishedAt: data.publishedAt?.toDate()
        } as SocialPost
      }))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleApprove = async (postId: string) => {
    if (!confirm('Approve and schedule this post?')) return
    try {
      const approveFn = httpsCallable(functions, 'approveAndSchedulePost')
      await approveFn({ postId })
      alert('Post approved and scheduled via Ayrshare API!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      alert(`Approval failed: ${msg}`)
    }
  }

  const filteredPosts = posts.filter(p => filter === 'all' ? true : p.status === filter)

  if (loading) return <p style={{ padding: 'var(--space-6)' }}>Loading campaigns...</p>

  const canApprove = user?.isAdmin || user?.role === 'manager'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Social Media Campaigns</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Manage and schedule posts across Facebook, Instagram, Twitter, and TikTok.</p>
        </div>
        <Link to="/admin/social/compose">
          <Button variant="primary">Create Post</Button>
        </Link>
      </header>

      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        {['all', 'pending_review', 'approved', 'published'].map(f => (
          <Button 
            key={f} 
            variant={filter === f ? 'primary' : 'secondary'} 
            onClick={() => setFilter(f as typeof filter)}
          >
            {f.replace('_', ' ').toUpperCase()}
          </Button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-4)', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {filteredPosts.map(post => (
          <div key={post.id} style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Badge 
                variant={post.status === 'published' ? 'active' : post.status === 'approved' ? 'tag' : post.status === 'pending_review' ? 'error' : 'archived'} 
                label={post.status.replace('_', ' ').toUpperCase()} 
              />
              <div style={{ display: 'flex', gap: '4px' }}>
                {post.platforms.map((plat: SocialPlatform) => (
                  <Badge key={plat} variant="tag" label={plat} />
                ))}
              </div>
            </div>

            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text)', maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
                {post.mediaUrls.map((url, i) => (
                  <img key={i} src={url} alt="media preview" style={{ height: '60px', width: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                ))}
              </div>
            )}

            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '2px', marginTop: 'auto', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border)' }}>
              <span>Created: {post.createdAt?.toLocaleDateString()}</span>
              {post.scheduledFor && <span>Scheduled: {post.scheduledFor.toLocaleString()}</span>}
            </div>

            {post.status === 'pending_review' && canApprove && (
              <Button variant="primary" onClick={() => handleApprove(post.id)}>
                Approve & Schedule
              </Button>
            )}
          </div>
        ))}
        {filteredPosts.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)' }}>No posts found.</p>
        )}
      </div>
    </div>
  )
}
