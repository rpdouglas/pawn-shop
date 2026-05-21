import { useState, useMemo } from 'react'
import PriceRangeSlider from './PriceRangeSlider'
import type { Item, MoodCategory } from '../../lib/types'

export type SortMode = 'newest' | 'trending' | 'price-asc' | 'price-desc'

export interface FilterState {
  mood: MoodCategory | null
  category: string | null
  priceRange: [number, number]
  sort: SortMode
}

interface FilterPanelProps {
  items: Item[]
  filters: FilterState
  onChange: (filters: FilterState) => void
}

const MOOD_LABELS: Record<MoodCategory, string> = {
  relax:    'Relax',
  focus:    'Focus',
  social:   'Social',
  ceremony: 'Ceremony',
}

const SORT_LABELS: Record<SortMode, string> = {
  newest:       'Newest arrivals',
  trending:     'Trending',
  'price-asc':  'Price: low to high',
  'price-desc': 'Price: high to low',
}

const ALL_MOODS: MoodCategory[] = ['relax', 'focus', 'social', 'ceremony']

function chipStyle(isActive: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--text-small)',
    fontWeight: isActive ? 600 : 400,
    padding: 'var(--space-2) var(--space-4)',
    minHeight: 'var(--space-12)',
    border: `1px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    background: isActive ? 'color-mix(in srgb, var(--color-accent) 15%, transparent)' : 'transparent',
    color: 'var(--color-text)',
    cursor: 'pointer',
    transition: 'border-color var(--motion-speed-fast) var(--motion-easing), background var(--motion-speed-fast) var(--motion-easing)',
    whiteSpace: 'nowrap' as const,
  }
}

export default function FilterPanel({ items, filters, onChange }: FilterPanelProps) {
  const [open, setOpen] = useState(false)

  const priceMin = useMemo(() => (items.length ? Math.min(...items.map(i => i.price)) : 0), [items])
  const priceMax = useMemo(() => (items.length ? Math.max(...items.map(i => i.price)) : 10000), [items])

  const categories = useMemo(() => (
    [...new Set(items.map(i => i.category))].sort()
  ), [items])

  const activeFilterCount = [
    filters.mood,
    filters.category,
    filters.priceRange[0] > priceMin || filters.priceRange[1] < priceMax,
    filters.sort !== 'newest',
  ].filter(Boolean).length

  function clearAll() {
    onChange({ mood: null, category: null, priceRange: [priceMin, priceMax], sort: 'newest' })
  }

  const effectivePriceRange: [number, number] = [
    filters.priceRange[0] === 0 && filters.priceRange[1] === Infinity
      ? priceMin
      : filters.priceRange[0],
    filters.priceRange[0] === 0 && filters.priceRange[1] === Infinity
      ? priceMax
      : filters.priceRange[1],
  ]

  return (
    <div>
      {/* Toggle bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: open ? 'var(--space-4)' : 0 }}>
        <button
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-controls="cannabis-filter-panel"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text)',
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-4)',
            minHeight: 'var(--space-12)',
            cursor: 'pointer',
            transition: 'border-color var(--motion-speed-fast) var(--motion-easing)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <line x1="1" y1="3"  x2="13" y2="3"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3" y1="7"  x2="11" y2="7"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="5" y1="11" x2="9"  y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              background: 'var(--color-accent)',
              color: 'var(--color-bg)',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              minHeight: 'var(--space-12)',
              textDecoration: 'underline',
            }}
          >
            Clear all
          </button>
        )}

        {/* Active chips — mood and category */}
        {filters.mood && (
          <span style={{ ...chipStyle(true), display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            {MOOD_LABELS[filters.mood]}
            <button
              onClick={() => onChange({ ...filters, mood: null })}
              aria-label={`Remove ${MOOD_LABELS[filters.mood!]} filter`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1, fontSize: 'var(--text-body)' }}
            >
              ×
            </button>
          </span>
        )}
        {filters.category && (
          <span style={{ ...chipStyle(true), display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            {filters.category.replace(/-/g, ' ')}
            <button
              onClick={() => onChange({ ...filters, category: null })}
              aria-label={`Remove ${filters.category} filter`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1, fontSize: 'var(--text-body)' }}
            >
              ×
            </button>
          </span>
        )}
      </div>

      {/* Collapsible body */}
      {open && (
        <div
          id="cannabis-filter-panel"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-6)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {/* Mood */}
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-4)',
              display: 'block',
            }}>
              Mood
            </legend>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-2)' }}>
              {ALL_MOODS.map(mood => (
                <button
                  key={mood}
                  onClick={() => onChange({ ...filters, mood: filters.mood === mood ? null : mood })}
                  aria-pressed={filters.mood === mood}
                  style={chipStyle(filters.mood === mood)}
                >
                  {MOOD_LABELS[mood]}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Category */}
          {categories.length > 1 && (
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-small)',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-4)',
                display: 'block',
              }}>
                Category
              </legend>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-2)' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => onChange({ ...filters, category: filters.category === cat ? null : cat })}
                    aria-pressed={filters.category === cat}
                    style={chipStyle(filters.category === cat)}
                  >
                    {cat.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {/* Price range */}
          {priceMax > priceMin && (
            <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
              <legend style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-small)',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-4)',
                display: 'block',
              }}>
                Price range
              </legend>
              <PriceRangeSlider
                min={priceMin}
                max={priceMax}
                value={effectivePriceRange}
                onChange={range => onChange({ ...filters, priceRange: range })}
              />
            </fieldset>
          )}

          {/* Sort */}
          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-4)',
              display: 'block',
            }}>
              Sort by
            </legend>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-2)' }}>
              {(Object.keys(SORT_LABELS) as SortMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => onChange({ ...filters, sort: mode })}
                  aria-pressed={filters.sort === mode}
                  style={chipStyle(filters.sort === mode)}
                >
                  {SORT_LABELS[mode]}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  )
}
