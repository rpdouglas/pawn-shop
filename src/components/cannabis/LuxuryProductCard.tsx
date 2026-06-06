import { formatPrice } from '../../lib/format'
import TagBadge from './TagBadge'
import type { MerchandisingTag, CannabisProfile } from '../../lib/types'
import type { LayoutMode } from '../ui/LayoutToggle'

interface LuxuryProductCardProps {
  title: string
  price: number
  description?: string
  imageUrl?: string
  category?: string
  merchandisingTags?: MerchandisingTag[]
  layoutMode?: LayoutMode
  cannabisProfile?: CannabisProfile
  onClick?: () => void
}

export default function LuxuryProductCard({
  title,
  price,
  description,
  imageUrl,
  category,
  merchandisingTags = [],
  layoutMode = 'grid3',
  cannabisProfile,
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

  // Rough exchange rate for UI display (1 USD = 1.37 CAD)
  const usdPriceEstimate = Math.round(price / 1.37)
  const compareUsdPrice = Math.round(usdPriceEstimate * 1.25)
  const actualSavingsCad = Math.round((compareUsdPrice * 1.37) - price)

  const thcVal = cannabisProfile?.thcMax || 0
  const thcPct = Math.min(thcVal, 100)
  const thcLabel = cannabisProfile?.cannabinoidUnit === 'mg' ? `${thcVal}mg THC` : `${thcVal}% THC`
  const cbdVal = cannabisProfile?.cbdMax || 0
  const cbdLabel = cbdVal > 0 ? ` · ${cbdVal}${cannabisProfile?.cannabinoidUnit || '%'} CBD` : ''

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
          {category && (
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--color-primary)',
              margin: 0,
            }}>
              {category}
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
          {cannabisProfile && (
            <div style={{ marginTop: '0.5rem', maxWidth: '200px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--color-text-muted)', marginBottom: '0.3rem'
              }}>
                <span>THC / CBD</span>
                <span style={{ color: 'var(--color-text)' }}>{thcLabel}{cbdLabel}</span>
              </div>
              <div style={{ height: '3px', background: 'rgba(200,161,74,0.12)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-primary-dim, #7A6030), var(--color-primary))', width: `${thcPct}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Price — right-aligned */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: 'var(--space-4)',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>CAD</div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lead)',
            color: 'var(--color-text)',
            letterSpacing: '0.02em',
            lineHeight: 1,
            marginBottom: '0.3rem'
          }}>
            {formatPrice(price)}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
            ~${(compareUsdPrice / 100).toFixed(2)} USD across the border
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#5a9e6a', textTransform: 'uppercase', marginTop: '0.1rem' }}>
            Save ~${(actualSavingsCad / 100).toFixed(2)} CAD
          </div>
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
      style={{ ...containerBase, display: 'flex', flexDirection: 'column' }}
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
      <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {category && (
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--color-primary)',
            marginBottom: '0.2rem',
            marginTop: 0,
          }}>
            {category}
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
        
        {cannabisProfile && (
          <div style={{ marginBottom: '0.85rem' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.12em', color: 'var(--color-text-muted)', marginBottom: '0.3rem'
            }}>
              <span>THC / CBD</span>
              <span style={{ color: 'var(--color-text)' }}>{thcLabel}{cbdLabel}</span>
            </div>
            <div style={{ height: '3px', background: 'rgba(200,161,74,0.12)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-primary-dim, #7A6030), var(--color-primary))', width: `${thcPct}%` }} />
            </div>
          </div>
        )}

        {description && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
            lineHeight: 1.55,
            margin: '0 0 var(--space-4)',
            flex: 1,
          }}>
            {description}
          </p>
        )}

        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          borderTop: '1px solid var(--color-border)', paddingTop: '0.8rem', marginTop: 'auto'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', letterSpacing: '0.2em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>CAD</div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              color: 'var(--color-text)',
              lineHeight: 1,
              marginBottom: '0.2rem'
            }}>
              {formatPrice(price)}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
              ~${(compareUsdPrice / 100).toFixed(2)} USD across the border
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#5a9e6a', textTransform: 'uppercase', marginTop: '0.1rem' }}>
              Save ~${(actualSavingsCad / 100).toFixed(2)} CAD
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
