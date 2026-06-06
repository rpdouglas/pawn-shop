import type { ConditionGrade, ItemStatus } from '../../lib/types'
import { formatPrice } from '../../lib/format'
import Badge from './Badge'

const CONDITION_LABELS: Record<ConditionGrade, string> = {
  'new':       'New',
  'like-new':  'Like New',
  'good':      'Good',
  'fair':      'Fair',
  'poor':      'Poor',
}

const STATUS_LABELS: Record<ItemStatus, string> = {
  draft:    'Draft',
  active:   'Available',
  reserved: 'Reserved',
  sold:     'Sold',
  archived: 'Archived',
  deleted:  'Deleted',
}

interface CardProps {
  title: string
  price: number
  originalPrice?: number
  condition: ConditionGrade
  status: ItemStatus
  imageUrl?: string
  merchandisingTags?: string[]
  onClick?: () => void
}

export default function Card({
  title,
  price,
  originalPrice,
  condition,
  status,
  imageUrl,
  merchandisingTags = [],
  onClick,
}: CardProps) {
  const isInteractive = onClick !== undefined
  
  // E28 Markdown Dutch Auction logic
  const isPriceDropped = originalPrice !== undefined && price < originalPrice
  const displayTags = [...merchandisingTags]
  if (isPriceDropped) displayTags.push('price-dropped')

  return (
    <div
      className={`card${isInteractive ? ' cursor-pointer' : ''}`}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive
        ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }
        : undefined
      }
      aria-label={`${title} — ${formatPrice(price)}`}
    >
      {/* Image area — CSS class handles aspect ratio, dark bg, and hover scale */}
      <div className="card-image">
        {imageUrl
          ? <img src={imageUrl} alt={title} />
          : <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>No image</span>
        }
        {displayTags.length > 0 && (
          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {displayTags.map((tag) => (
              <Badge key={tag} variant="tag" label={tag.replace(/-/g, ' ')} />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '16px',
          fontWeight: 600,
          color: 'var(--color-text)',
          margin: '0 0 6px',
          lineHeight: 1.3,
        }}>
          {title}
        </h3>

        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lead)',
          fontWeight: 700,
          color: 'var(--color-primary)',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {formatPrice(price)}
          {isPriceDropped && (
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge variant={`condition-${condition}`} label={CONDITION_LABELS[condition]} />
          {status !== 'active' && (
            <Badge variant={status} label={STATUS_LABELS[status]} />
          )}
        </div>
      </div>
    </div>
  )
}
