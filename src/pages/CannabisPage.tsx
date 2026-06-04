import { useState, useEffect, useMemo } from 'react'
import CinematicHero from '../components/cannabis/CinematicHero'
import MoodCard from '../components/cannabis/MoodCard'
import LuxuryProductCard from '../components/cannabis/LuxuryProductCard'
import MoodPillStrip from '../components/cannabis/MoodPillStrip'
import FilterPanel, { type FilterState } from '../components/cannabis/FilterPanel'
import LayoutToggle, { type LayoutMode } from '../components/ui/LayoutToggle'
import Button from '../components/ui/Button'
import CampaignBanner from '../components/CampaignBanner'
import ArticleSection from '../components/ArticleSection'
import ItemQuickView from '../components/pawn/ItemQuickView'
import { useItems } from '../hooks/useItems'
import type { Item, MoodCategory, ShopInfo } from '../lib/types'
import { Analytics } from '../lib/analytics'
import { useStoreConfig } from '../lib/useStoreConfig'

const MOOD_CATEGORY: Record<MoodCategory, string> = {
  relax:    'flower',
  focus:    'concentrates',
  social:   'edibles',
  ceremony: 'topicals',
}

const ALL_MOODS: MoodCategory[] = ['relax', 'focus', 'social', 'ceremony']

const DEFAULT_FILTERS: FilterState = {
  moods: [],
  category: null,
  priceRange: [0, Infinity],
  sort: 'newest',
}

export default function CannabisPage() {
  const { items, loading, error } = useItems('cannabis')
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid3')
  const { data: config } = useStoreConfig('shopInfo')
  const shopInfo = config as ShopInfo | undefined
  const whatsappHref = shopInfo?.phoneNumber ? `https://wa.me/${shopInfo.phoneNumber}` : null



  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  useEffect(() => {
    Analytics.pageView({ view: 'cannabis', page_path: '/cannabis' })
  }, [])

  // Per-mood item counts (no extra Firestore queries)
  const moodCounts: Record<MoodCategory, number> = useMemo(() => ({
    relax:    items.filter(i => i.category === MOOD_CATEGORY.relax).length,
    focus:    items.filter(i => i.category === MOOD_CATEGORY.focus).length,
    social:   items.filter(i => i.category === MOOD_CATEGORY.social).length,
    ceremony: items.filter(i => i.category === MOOD_CATEGORY.ceremony).length,
  }), [items])

  const priceMin = useMemo(() => (items.length ? Math.min(...items.map(i => i.price)) : 0), [items])
  const priceMax = useMemo(() => (items.length ? Math.max(...items.map(i => i.price)) : Infinity), [items])

  // Filter + sort pipeline — all client-side against loaded items
  const displayItems = useMemo(() => {
    let result = [...items]

    if (filters.moods.length > 0) {
      result = result.filter(i => 
        filters.moods.some(mood => MOOD_CATEGORY[mood] === i.category)
      )
    }
    if (filters.category) {
      result = result.filter(i => i.category === filters.category)
    }

    const [low, high] = filters.priceRange
    const effectiveLow  = low  === 0        ? priceMin : low
    const effectiveHigh = high === Infinity  ? priceMax : high
    result = result.filter(i => i.price >= effectiveLow && i.price <= effectiveHigh)

    switch (filters.sort) {
      case 'price-asc':  result.sort((a, b) => a.price - b.price); break
      case 'price-desc': result.sort((a, b) => b.price - a.price); break
      case 'trending':   result.sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0)); break
      case 'newest':
        result.sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
        break
    }

    return result
  }, [items, filters, priceMin, priceMax])

  // Grid container style based on layout mode
  const gridStyle: React.CSSProperties = useMemo(() => {
    switch (layoutMode) {
      case 'grid2':    return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',                          gap: 'var(--space-6)' }
      case 'grid3':    return { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',   gap: 'var(--space-6)' }
      case 'list':     return { display: 'flex', flexDirection: 'column',                                        gap: 'var(--space-4)' }
      case 'magazine': return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',                          gap: 'var(--space-6)' }
      default:         return { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',   gap: 'var(--space-6)' }
    }
  }, [layoutMode])

  return (
    <div>
      <CinematicHero
        heading="Wellness, curated."
        subheading="Premium cannabis for every intention — sourced with care, presented with discretion."
      />

      <section
        id="cannabis-collections"
        aria-labelledby="mood-heading"
        style={{ padding: 'var(--space-4) var(--space-6) var(--space-12)', maxWidth: '1280px', margin: '0 auto' }}
      >
        <CampaignBanner />

        <h2
          id="mood-heading"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-heading)',
            color: 'var(--color-text)',
            fontWeight: 300,
            letterSpacing: '-0.01em',
            marginBottom: 'var(--space-2)',
          }}
        >
          Shop by mood
        </h2>

        <div className="mood-pills">
          <MoodPillStrip
            activeMoods={filters.moods}
            onChange={moods => setFilters(f => ({ ...f, moods }))}
          />
        </div>

        {/* MoodCards — clicking sets filters.mood */}
        <div className="mood-cards">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-12)',
          }}>
            {ALL_MOODS.map(mood => (
              <MoodCard
                key={mood}
                mood={mood}
                itemCount={moodCounts[mood]}
                onClick={() => setFilters(f => {
                  const newMoods = f.moods.includes(mood)
                    ? f.moods.filter(m => m !== mood)
                    : [...f.moods, mood]
                  return { ...f, moods: newMoods }
                })}
              />
            ))}
          </div>
        </div>

        {/* Product section */}
        <section aria-labelledby="products-heading">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <h2
              id="products-heading"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-heading)',
                color: 'var(--color-text)',
                fontWeight: 300,
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              {filters.moods.length === 1
                ? `${filters.moods[0].charAt(0).toUpperCase() + filters.moods[0].slice(1)} collection`
                : filters.moods.length > 1
                  ? 'Curated wellness collection'
                  : 'Featured products'}
            </h2>

            <LayoutToggle mode={layoutMode} onChange={setLayoutMode} />
          </div>

          <FilterPanel items={items} filters={filters} onChange={setFilters} />

          {error && (
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
              Unable to load products.
            </p>
          )}

          {loading ? (
            <div style={gridStyle}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    aspectRatio: layoutMode === 'list' ? undefined : '3/4',
                    height: layoutMode === 'list' ? 'var(--space-24)' : undefined,
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
          ) : displayItems.length === 0 ? (
            <p style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-muted)',
              fontStyle: 'italic',
              fontSize: 'var(--text-body)',
            }}>
              {filters.moods.length > 0 || filters.category
                ? 'No items match these filters.'
                : 'No products available at this time.'}
            </p>
          ) : (
            <div style={gridStyle}>
              {displayItems.map((item, index) => {
                const isMagazineHero = layoutMode === 'magazine' && index === 0
                return (
                  <div
                    key={item.id}
                    style={isMagazineHero ? { gridColumn: 'span 2' } : undefined}
                  >
                    <LuxuryProductCard
                      title={item.title}
                      price={item.price}
                      description={item.description || undefined}
                      imageUrl={item.images[0]}
                      merchandisingTags={item.merchandisingTags}
                      layoutMode={layoutMode}
                      onClick={() => setSelectedItem(item)}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {selectedItem && (
          <ItemQuickView
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onSelectRelated={(item) => setSelectedItem(item)}
          />
        )}

        <ArticleSection viewTag="cannabis" title="Cannabis Stories" />
      </section>

      {/* Anonymous WhatsApp enquiry — hidden until config/shopInfo.phoneNumber is set */}
      {whatsappHref && (
        <section
          aria-label="Anonymous enquiry"
          style={{
            padding: 'var(--space-16) var(--space-6)',
            textAlign: 'center',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-subheading)',
            color: 'var(--color-text)',
            fontWeight: 300,
            marginBottom: 'var(--space-4)',
          }}>
            Prefer a private conversation?
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body)',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-6)',
          }}>
            Reach us on WhatsApp — no account required.
          </p>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="lg">Enquire on WhatsApp</Button>
          </a>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-12)',
          }}>
            Built with Canadian privacy standards.
          </p>
        </section>
      )}
    </div>
  )
}
