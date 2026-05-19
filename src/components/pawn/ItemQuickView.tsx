import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { httpsCallable } from 'firebase/functions'
import { useView } from '../../context/ViewContext'
import { useAuth } from '../../context/AuthContext'
import { useFavourites } from '../../hooks/useFavourites'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import MerchandisingBadge from '../MerchandisingBadge'
import RelatedItems from '../RelatedItems'
import HoldCountdownBadge from './HoldCountdownBadge'
import { formatPrice } from '../../lib/format'
import type { Item, ConditionGrade, ViewType } from '../../lib/types'
import { Analytics } from '../../lib/analytics'
import { functions } from '../../lib/firebase'

const logActivityFn = httpsCallable<{ viewTag: ViewType }, { success: boolean }>(functions, 'logActivity')

const CONDITION_LABELS: Record<ConditionGrade, string> = {
  'new':      'New',
  'like-new': 'Like New',
  'good':     'Good',
  'fair':     'Fair',
  'poor':     'Poor',
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

interface ItemQuickViewProps {
  item: Item
  onClose: () => void
  onCollect?: () => void
  onSelectRelated?: (item: Item) => void
}

export default function ItemQuickView({ item, onClose, onCollect, onSelectRelated }: ItemQuickViewProps) {
  const { view } = useView()
  const { user } = useAuth()
  const { isFavourite, toggleFavourite } = useFavourites()
  const panelRef = useRef<HTMLDivElement>(null)
  const [imageIndex, setImageIndex] = useState(0)

  // Fires once per item open — item_id is pseudonymous Firestore doc ID, not PII
  useEffect(() => {
    Analytics.itemView({ item_id: item.id, view: item.viewTag, category: item.category })
    void logActivityFn({ viewTag: item.viewTag })
  }, [item.id, item.viewTag, item.category])

  // Body scroll lock
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Focus trap
  useEffect(() => {
    if (!panelRef.current) return
    const elements = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
    elements[0]?.focus()

    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || elements.length === 0) return
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onTab)
    return () => document.removeEventListener('keydown', onTab)
  }, [])

  const images = item.images
  const hasPrev = imageIndex > 0
  const hasNext = imageIndex < images.length - 1

  return createPortal(
    <div className={`view-${view}`}>
      <div
        className="item-qv-overlay"
        onClick={onClose}
        role="presentation"
      >
        <div
          ref={panelRef}
          className="item-qv-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qv-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close quick view"
            style={{ position: 'absolute', top: 'var(--space-4)', right: 'var(--space-4)', zIndex: 1 }}
          >
            &#x2715;
          </button>

          {/* Image gallery */}
          <div style={{
            position: 'relative',
            backgroundColor: 'var(--color-bg)',
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
            overflow: 'hidden',
          }}>
            {images.length > 0 ? (
              <img
                src={images[imageIndex]}
                alt={`${item.title} — image ${imageIndex + 1} of ${images.length}`}
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '340px', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '220px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-small)',
                fontFamily: 'var(--font-body)',
              }}>
                No image available
              </div>
            )}

            {/* Gallery navigation — only when multiple images */}
            {images.length > 1 && (
              <div style={{
                position: 'absolute',
                bottom: 'var(--space-4)',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                padding: '0 var(--space-4)',
              }}>
                <button
                  onClick={() => setImageIndex((i) => i - 1)}
                  disabled={!hasPrev}
                  aria-label="Previous image"
                  className="modal-close"
                  style={{ opacity: hasPrev ? 1 : 0.3 }}
                >
                  &#8592;
                </button>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {imageIndex + 1} / {images.length}
                </span>
                <button
                  onClick={() => setImageIndex((i) => i + 1)}
                  disabled={!hasNext}
                  aria-label="Next image"
                  className="modal-close"
                  style={{ opacity: hasNext ? 1 : 0.3 }}
                >
                  &#8594;
                </button>
              </div>
            )}
          </div>

          {/* Item details */}
          <div style={{ padding: 'var(--space-6)' }}>
            <h2
              id="qv-title"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-heading)',
                color: 'var(--color-text)',
                margin: '0 0 var(--space-2)',
                lineHeight: 1.2,
              }}
            >
              {item.title}
            </h2>

            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-subheading)',
              color: 'var(--color-primary)',
              marginBottom: 'var(--space-4)',
              fontWeight: 700,
            }}>
              {formatPrice(item.price)}
            </div>

            {/* Badges */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              <Badge
                variant={`condition-${item.condition}`}
                label={CONDITION_LABELS[item.condition]}
              />
              {item.merchandisingTags?.map((tag) => (
                <MerchandisingBadge key={tag} tag={tag} />
              ))}
              {item.status === 'reserved' && item.holdExpiresAt && (
                <HoldCountdownBadge holdExpiresAt={item.holdExpiresAt} />
              )}
            </div>

            {/* Description */}
            {item.description && (
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-body)',
                color: 'var(--color-text-muted)',
                fontStyle: 'italic',
                lineHeight: 1.6,
                margin: '0 0 var(--space-4)',
              }}>
                {item.description}
              </p>
            )}

            {/* Provenance notes — staff-written cultural/historical context */}
            {item.provenanceNotes && (
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--color-primary)',
                marginBottom: 'var(--space-4)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 'var(--space-1)',
                }}>
                  Provenance
                </p>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontStyle: 'italic',
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-text)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {item.provenanceNotes}
                </p>
              </div>
            )}

            {/* Staff curator note — only visible when staff-pick tag is set */}
            {item.staffPickNote && item.merchandisingTags?.includes('staff-pick') && (
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--color-primary)',
                marginBottom: 'var(--space-4)',
              }}>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 'var(--space-1)',
                }}>
                  ★ Staff Pick
                </p>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontStyle: 'italic',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-text)',
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {item.staffPickNote}
                </p>
              </div>
            )}

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button variant="primary" size="lg" style={{ flex: 1 }}>
                  Enquire about this item
                </Button>
                {user && (
                  <button
                    onClick={() => toggleFavourite(item.id)}
                    aria-label={isFavourite(item.id) ? 'Remove from favourites' : 'Add to favourites'}
                    style={{
                      background: 'none',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: 'var(--text-heading)',
                      color: isFavourite(item.id) ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {isFavourite(item.id) ? '♥' : '♡'}
                  </button>
                )}
              </div>
              {onCollect && item.status === 'active' && item.viewTag !== 'cannabis' && !item.policeHold && (
                <Button variant="secondary" size="md" onClick={() => { onClose(); onCollect() }}>
                  Reserve for Collection
                </Button>
              )}
              <Button variant="ghost" size="md" onClick={onClose}>
                Close
              </Button>
            </div>

            {/* Related items by trending score — same category + view */}
            {onSelectRelated && (
              <RelatedItems currentItem={item} onSelect={onSelectRelated} />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
