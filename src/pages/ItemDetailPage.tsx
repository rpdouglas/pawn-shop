import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { docToItem } from '../hooks/useItems'
import type { Item, ConditionGrade } from '../lib/types'
import { ViewContext } from '../context/ViewContext'
import AgeGate from '../components/age-gate/AgeGate'
import { formatPrice } from '../lib/format'
import Badge from '../components/ui/Badge'
import ShareButton from '../components/ui/ShareButton'
import Button from '../components/ui/Button'
import MerchandisingBadge from '../components/MerchandisingBadge'
import HoldCountdownBadge from '../components/pawn/HoldCountdownBadge'
import { useAuth } from '../context/AuthContext'
import CannabisProductData from '../components/cannabis/CannabisProductData'
import { Analytics, toGA4Item } from '../lib/analytics'

const CONDITION_LABELS: Record<ConditionGrade, string> = {
  'new':      'New',
  'like-new': 'Like New',
  'good':     'Good',
  'fair':     'Fair',
  'poor':     'Poor',
}

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [item, setItem] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageIndex, setImageIndex] = useState(0)

  useEffect(() => {
    if (!id) return
    let active = true
    getDoc(doc(db, 'items', id))
      .then((snap) => {
        if (!active) return
        if (snap.exists()) {
          const fetched = docToItem(snap)
          // Hide police hold items from public
          if (fetched.policeHold && !user?.isStaff) {
            setItem(null)
          } else {
            setItem(fetched)
          }
        }
      })
      .catch(() => setItem(null))
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [id, user?.isStaff])

  useEffect(() => {
    if (item) {
      document.title = `${item.title} — The Pawn Shop`
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', item.description || `Buy ${item.title} at The Pawn Shop.`)
      
      Analytics.viewItem({ view: item.viewTag, items: [toGA4Item(item, 'item_detail')] })
    }
    return () => {
      document.title = 'The Pawn Shop'
    }
  }, [item])

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>Loading...</div>
  }

  if (!item) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center', padding: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display)', color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>Not Found</h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lead)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-8)' }}>This item may have been removed or sold.</p>
        <Link to="/" className="btn btn-secondary btn-md">Return Home</Link>
      </div>
    )
  }

  const content = (
    <div className={`view-${item.viewTag}`} style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: 'var(--space-8) var(--space-6)' }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
        
        {/* Navigation / Header */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <Link to={`/${item.viewTag === 'pawn' ? '' : item.viewTag}`} style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}>
            &larr; Back to {item.viewTag === 'pawn' ? 'Discover' : item.viewTag}
          </Link>
        </div>

        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-12)' }}>
          
          {/* Images */}
          <div>
            <div style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              aspectRatio: '4/3',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-border)',
            }}>
              {item.images.length > 0 ? (
                <img
                  src={item.images[imageIndex]}
                  alt={`${item.title} — image ${imageIndex + 1} of ${item.images.length}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>No image available</span>
              )}
            </div>

            {item.images.length > 1 && (
              <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-4)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
                {item.images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    style={{
                      width: '80px',
                      height: '80px',
                      flexShrink: 0,
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      border: i === imageIndex ? '2px solid var(--color-primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <img src={url} alt={`Thumbnail ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-display)',
              color: 'var(--color-text)',
              lineHeight: 1.1,
              margin: '0 0 var(--space-4)',
              letterSpacing: '0.02em',
            }}>
              {item.title}
            </h1>
            
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-hero)',
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-6)',
              fontWeight: 400,
            }}>
              {formatPrice(item.price)}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
              <Badge variant={`condition-${item.condition}`} label={CONDITION_LABELS[item.condition]} />
              {item.merchandisingTags?.map((tag) => (
                <MerchandisingBadge key={tag} tag={tag} />
              ))}
              {item.status === 'reserved' && item.holdExpiresAt && (
                <HoldCountdownBadge holdExpiresAt={item.holdExpiresAt} />
              )}
            </div>

            {item.description && (
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-lead)',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
                margin: '0 0 var(--space-8)',
              }}>
                {item.description}
              </p>
            )}

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
              <Button variant="primary" size="lg" style={{ flex: 1 }}>
                Enquire about this item
              </Button>
              <ShareButton 
                title={item.title} 
                url={window.location.href} 
                variant="icon" 
                style={{ flexShrink: 0 }}
              />
            </div>

            {item.viewTag === 'cannabis' && item.cannabisProfile && (
              <div style={{ marginTop: 'var(--space-8)' }}>
                <CannabisProductData profile={item.cannabisProfile} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const wrapped = (
    <ViewContext.Provider value={{ view: item.viewTag }}>
      {content}
    </ViewContext.Provider>
  )

  if (item.viewTag === 'cannabis' || item.viewTag === 'tobacco') {
    return <AgeGate minAge={19} viewTag={item.viewTag}>{wrapped}</AgeGate>
  }
  if (item.viewTag === 'fireworks') {
    return <AgeGate minAge={18} viewTag="fireworks">{wrapped}</AgeGate>
  }

  return wrapped
}
