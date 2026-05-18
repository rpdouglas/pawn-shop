import { useEffect, useRef } from 'react'
import Badge from '../ui/Badge'
import MerchandisingBadge from '../MerchandisingBadge'
import { formatPrice } from '../../lib/format'
import type { Item, ConditionGrade } from '../../lib/types'

const CONDITION_LABELS: Record<ConditionGrade, string> = {
  'new':      'New',
  'like-new': 'Like New',
  'good':     'Good',
  'fair':     'Fair',
  'poor':     'Poor',
}

interface MasonryCardProps {
  item: Item
  index: number
  onClick: () => void
  onHover?: () => void
}

function MasonryCard({ item, index, onClick, onHover }: MasonryCardProps) {
  const staggerDelay = Math.min(index * 50, 600)

  return (
    <article
      className="masonry-item"
      style={{ '--masonry-delay': `${staggerDelay}ms` } as React.CSSProperties}
      onClick={onClick}
      onMouseEnter={onHover}
      onFocus={onHover}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      role="button"
      tabIndex={0}
      aria-label={`${item.title} — ${formatPrice(item.price)}`}
    >
      {/* Image — natural aspect ratio, never cropped (Marcus Photography Test) */}
      <div style={{
        position: 'relative',
        backgroundColor: 'var(--color-bg)',
        overflow: 'hidden',
        borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
      }}>
        {item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.title}
            loading="lazy"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%',
            aspectRatio: '4/3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>No image</span>
          </div>
        )}

        {/* Merchandising tag overlay */}
        {item.merchandisingTags && item.merchandisingTags.length > 0 && (
          <div style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-2)', display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
            {item.merchandisingTags.map((tag) => (
              <MerchandisingBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </div>

      {/* Card content */}
      <div style={{
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '0 0 var(--radius-md) var(--radius-md)',
      }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-body)',
          fontWeight: 600,
          color: 'var(--color-text)',
          margin: '0 0 var(--space-2)',
          lineHeight: 1.3,
        }}>
          {item.title}
        </h3>

        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lead)',
          fontWeight: 700,
          color: 'var(--color-primary)',
          marginBottom: 'var(--space-2)',
        }}>
          {formatPrice(item.price)}
        </div>

        <Badge
          variant={`condition-${item.condition}`}
          label={CONDITION_LABELS[item.condition]}
        />
      </div>
    </article>
  )
}

interface MasonryGridProps {
  items: Item[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onItemSelect: (item: Item) => void
  onItemHover?: (item: Item) => void
}

export default function MasonryGrid({
  items,
  loading,
  hasMore,
  onLoadMore,
  onItemSelect,
  onItemHover,
}: MasonryGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Infinite scroll — trigger at 80% viewport (threshold 0.1 on sentinel below the fold)
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loading) {
          onLoadMore()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, onLoadMore])

  if (!loading && items.length === 0) {
    return (
      <p style={{
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text-muted)',
        fontSize: 'var(--text-body)',
        fontStyle: 'italic',
        padding: 'var(--space-12) 0',
      }}>
        No items found. Try a different search.
      </p>
    )
  }

  return (
    <div>
      <div className="masonry-grid" aria-label="Inventory discovery grid">
        {items.map((item, index) => (
          <MasonryCard
            key={item.id}
            item={item}
            index={index}
            onClick={() => onItemSelect(item)}
            onHover={onItemHover ? () => onItemHover(item) : undefined}
          />
        ))}
      </div>

      {/* Sentinel — IntersectionObserver target for infinite scroll */}
      <div ref={sentinelRef} aria-hidden="true" style={{ height: '1px' }} />

      {loading && (
        <p style={{
          textAlign: 'center',
          padding: 'var(--space-8)',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-small)',
        }}>
          Loading more…
        </p>
      )}

      {!hasMore && items.length > 0 && (
        <p style={{
          textAlign: 'center',
          padding: 'var(--space-8)',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-small)',
          fontStyle: 'italic',
        }}>
          All {items.length} items shown
        </p>
      )}
    </div>
  )
}
