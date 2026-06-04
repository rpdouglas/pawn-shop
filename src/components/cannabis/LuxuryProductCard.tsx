import { formatPrice } from '../../lib/format'
import TagBadge from './TagBadge'
import type { MoodCategory, MerchandisingTag } from '../../lib/types'
import type { LayoutMode } from '../ui/LayoutToggle'

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
  merchandisingTags?: MerchandisingTag[]
  layoutMode?: LayoutMode
  onClick?: () => void
}

export default function LuxuryProductCard({
  title,
  price,
  description,
  imageUrl,
  mood,
  merchandisingTags = [],
  layoutMode = 'grid3',
  onClick,
}: LuxuryProductCardProps) {
  const isInteractive = onClick !== undefined
  const isList = layoutMode === 'list'

  const containerBase: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    cursor: isInteractive ? 'pointer' : 'default',
    transition: 'border-color var(--motion-speed-fast) var(--motion-easing)',
  }

  if (isList) {
    return (
      <div
        onClick={onClick}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        onKeyDown={isInteractive ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
        aria-label={`${title} — ${formatPrice(price)}`}
        className={isInteractive ? 'interactive-surface' : undefined}
        style={{ ...containerBase, display: 'flex', gap: 'var(--space-4)' }}
      >
        {/* Square thumbnail */}
        <div style={{
          flexShrink: 0,
          width: 'var(--space-24)',
          aspectRatio: '1/1',
          backgroundColor: 'var(--color-bg)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {imageUrl
            ? <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>No image</span>
          }
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 'var(--space-4) var(--space-4) var(--space-4) 0', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-1)' }}>
          {mood && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              margin: 0,
            }}>
              {MOOD_LABELS[mood]}
            </p>
          )}
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-subheading)',
            fontWeight: 400,
            color: 'var(--color-text)',
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}>
            {title}
          </h3>
          {merchandisingTags.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
              {merchandisingTags.map(tag => <TagBadge key={tag} tag={tag} />)}
            </div>
          )}
        </div>

        {/* Price — right-aligned */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          padding: 'var(--space-4)',
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-lead)',
          color: 'var(--color-text)',
          letterSpacing: '0.02em',
        }}>
          {formatPrice(price)}
        </div>
      </div>
    )
  }

  // Card layout (grid2, grid3, magazine)
  return (
    <div
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
      aria-label={`${title} — ${formatPrice(price)}`}
      className={isInteractive ? 'interactive-surface' : undefined}
      style={containerBase}
    >
      {/* Full-bleed image */}
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
          : <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>No image</span>
        }
        {merchandisingTags.length > 0 && (
          <div style={{ position: 'absolute', top: 'var(--space-2)', left: 'var(--space-2)', display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
            {merchandisingTags.map(tag => <TagBadge key={tag} tag={tag} />)}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 'var(--space-6)' }}>
        {mood && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-2)',
            marginTop: 0,
          }}>
            {MOOD_LABELS[mood]}
          </p>
        )}
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-subheading)',
          fontWeight: 400,
          color: 'var(--color-text)',
          margin: '0 0 var(--space-2)',
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
        }}>
          {title}
        </h3>
        {description && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.55,
            margin: '0 0 var(--space-4)',
          }}>
            {description}
          </p>
        )}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-lead)',
          color: 'var(--color-text)',
          letterSpacing: '0.02em',
        }}>
          {formatPrice(price)}
        </div>
      </div>
    </div>
  )
}
