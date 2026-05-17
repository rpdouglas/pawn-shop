import { formatPrice } from '../../lib/format'
import Button from '../ui/Button'

interface BundleCardProps {
  title: string
  price: number
  itemCount: number
  imageUrl?: string
  isAvailable: boolean
  onClick?: () => void
}

export default function BundleCard({
  title,
  price,
  itemCount,
  imageUrl,
  isAvailable,
  onClick,
}: BundleCardProps) {
  return (
    <article
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        opacity: isAvailable ? 1 : 0.6,
        transition: 'border-color var(--motion-speed-fast) var(--motion-easing)',
      }}
    >
      {/* Image */}
      <div style={{
        backgroundColor: 'var(--color-bg)',
        aspectRatio: '16/9',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {imageUrl
          ? <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No image</span>
        }
        {!isAvailable && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              color: 'var(--color-text)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          fontWeight: 400,
          color: 'var(--color-text)',
          margin: '0 0 6px',
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
        }}>
          {title}
        </h3>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--color-text-muted)',
          margin: '0 0 16px',
        }}>
          {itemCount} {itemCount === 1 ? 'item' : 'items'} included
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            color: 'var(--color-primary)',
            letterSpacing: '0.02em',
          }}>
            {formatPrice(price)}
          </span>
          {isAvailable && onClick && (
            <Button variant="primary" size="md" onClick={onClick}>
              Reserve
            </Button>
          )}
        </div>
      </div>
    </article>
  )
}
