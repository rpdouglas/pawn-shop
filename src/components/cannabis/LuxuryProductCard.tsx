import { formatPrice } from '../../lib/format'
import Badge from '../ui/Badge'
import type { MoodCategory } from '../../lib/types'

const MOOD_LABELS: Record<MoodCategory, string> = {
  relax:    'Relax',
  focus:    'Focus',
  social:   'Social',
  ceremony: 'Ceremony',
}

interface LuxuryProductCardProps {
  title: string
  price: number
  description?: string
  imageUrl?: string
  mood?: MoodCategory
  merchandisingTags?: string[]
  onClick?: () => void
}

export default function LuxuryProductCard({
  title,
  price,
  description,
  imageUrl,
  mood,
  merchandisingTags = [],
  onClick,
}: LuxuryProductCardProps) {
  const isInteractive = onClick !== undefined

  return (
    <article
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive
        ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }
        : undefined
      }
      aria-label={`${title} — ${formatPrice(price)}`}
      className={isInteractive ? 'interactive-surface' : undefined}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        cursor: isInteractive ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease',
      }}
    >
      {/* Full-bleed image — dark bg for dark luxury standard */}
      <div style={{
        backgroundColor: 'var(--color-bg)',
        aspectRatio: '3/4',
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
        {merchandisingTags.length > 0 && (
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {merchandisingTags.map((tag) => (
              <Badge key={tag} variant="tag" label={tag.replace(/-/g, ' ')} />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {mood && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-primary)',
            marginBottom: '8px',
          }}>
            {MOOD_LABELS[mood]}
          </p>
        )}
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          fontWeight: 400,
          color: 'var(--color-text)',
          margin: '0 0 8px',
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
        }}>
          {title}
        </h3>
        {description && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.55,
            margin: '0 0 16px',
          }}>
            {description}
          </p>
        )}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '18px',
          color: 'var(--color-text)',
          letterSpacing: '0.02em',
        }}>
          {formatPrice(price)}
        </div>
      </div>
    </article>
  )
}
