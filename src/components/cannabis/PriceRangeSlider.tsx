import { formatPrice } from '../../lib/format'

export interface PriceRangeSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}

export default function PriceRangeSlider({ min, max, value: [low, high], onChange }: PriceRangeSliderProps) {
  const range = max - min || 1
  const lowPct  = ((low  - min) / range) * 100
  const highPct = ((high - min) / range) * 100
  // Elevate the low handle when it's near the top so it can still be grabbed
  const lowZ = low > max - range * 0.1 ? 5 : 3

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
          {formatPrice(low)}
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
          {formatPrice(high)}
        </span>
      </div>

      {/* Full-height container — transparent inputs fill it for Makoonsii touch-target compliance */}
      <div style={{ position: 'relative', height: 'var(--space-12)' }}>
        {/* Visual track */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '4px',
          transform: 'translateY(-50%)',
          background: 'var(--color-border)',
          borderRadius: '2px',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute',
            left: `${lowPct}%`,
            right: `${100 - highPct}%`,
            height: '100%',
            background: 'var(--color-primary)',
            borderRadius: '2px',
          }} />
        </div>

        {/* Visual thumbs */}
        {[lowPct, highPct].map((pct, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: `${pct}%`,
              width: 'var(--space-4)',
              height: 'var(--space-4)',
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'var(--color-primary)',
              border: '2px solid var(--color-surface)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Low handle — transparent, full-height for touch */}
        <input
          type="range"
          min={min}
          max={max}
          value={low}
          onChange={e => onChange([Math.min(Number(e.target.value), high), high])}
          aria-label="Minimum price"
          aria-valuetext={formatPrice(low)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
            zIndex: lowZ,
          }}
        />

        {/* High handle — transparent, full-height for touch */}
        <input
          type="range"
          min={min}
          max={max}
          value={high}
          onChange={e => onChange([low, Math.max(Number(e.target.value), low)])}
          aria-label="Maximum price"
          aria-valuetext={formatPrice(high)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
            zIndex: 4,
          }}
        />
      </div>
    </div>
  )
}
