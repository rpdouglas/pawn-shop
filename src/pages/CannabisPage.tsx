import { useState, useEffect, useMemo } from 'react'
import CinematicHero from '../components/cannabis/CinematicHero'
import CannabisMarqueeStrip from '../components/cannabis/CannabisMarqueeStrip'
import LuxuryProductCard from '../components/cannabis/LuxuryProductCard'
import FilterPanel, { type FilterState } from '../components/cannabis/FilterPanel'
import LayoutToggle, { type LayoutMode } from '../components/ui/LayoutToggle'
import Button from '../components/ui/Button'
import CampaignBanner from '../components/CampaignBanner'
import ArticleSection from '../components/ArticleSection'
import ItemQuickView from '../components/pawn/ItemQuickView'
import StoryStrip from '../components/cannabis/StoryStrip'
import { useItems } from '../hooks/useItems'
import type { Item, ShopInfo, CannabisCategory } from '../lib/types'
import { Analytics } from '../lib/analytics'
import { useStoreConfig } from '../lib/useStoreConfig'

const ALL_CATEGORIES: { id: 'all' | CannabisCategory; label: string; desc: string }[] = [
  { id: 'all', label: 'All Products', desc: 'Every American import we carry, in stock today.' },
  { id: 'flower', label: '🌿 Flower', desc: 'Hand-selected indoor cuts from California, Nevada, and Michigan genetics houses.' },
  { id: 'vapes', label: '💨 Vapes', desc: 'Cartridges, pods, and all-in-ones from the leading US hardware and extraction brands.' },
  { id: 'prerolls', label: '🔥 Pre-Rolls', desc: 'Classic joints, infused cones, and hash holes — ready to go.' },
  { id: 'edibles', label: '🍬 Edibles', desc: 'Nano-emulsified, precise, and actually delicious. American edibles are a different tier.' },
  { id: 'concentrates', label: '💎 Concentrates', desc: 'Badder, rosin, and diamonds from boutique extraction houses.' },
  { id: 'tinctures', label: '🧪 Tinctures', desc: 'Full-spectrum oils and rare cannabinoid formulas unavailable in Canada.' },
]

const DEFAULT_FILTERS: FilterState = {
  category: null,
  priceRange: [0, Infinity],
  sort: 'newest',
}

export default function CannabisPage() {
  const { items, loading, error } = useItems('cannabis')
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid3')
  const [activeTab, setActiveTab] = useState<'all' | CannabisCategory>('all')
  const { data: config } = useStoreConfig('shopInfo')
  const shopInfo = config as ShopInfo | undefined
  const whatsappHref = shopInfo?.phoneNumber ? `https://wa.me/${shopInfo.phoneNumber}` : null

  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  useEffect(() => {
    Analytics.pageView({ view: 'cannabis', page_path: '/cannabis' })
  }, [])

  const priceMin = useMemo(() => (items.length ? Math.min(...items.map(i => i.price)) : 0), [items])
  const priceMax = useMemo(() => (items.length ? Math.max(...items.map(i => i.price)) : Infinity), [items])

  // Filter + sort pipeline
  const displayItems = useMemo(() => {
    let result = [...items]

    if (activeTab !== 'all') {
      result = result.filter(i => i.category === activeTab)
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
  }, [items, filters, activeTab, priceMin, priceMax])

  const gridStyle: React.CSSProperties = useMemo(() => {
    switch (layoutMode) {
      case 'grid2':    return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',                          gap: 'var(--space-6)' }
      case 'grid3':    return { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',   gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)' }
      case 'list':     return { display: 'flex', flexDirection: 'column',                                        gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)' }
      case 'magazine': return { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',                          gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)' }
      default:         return { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',   gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)' }
    }
  }, [layoutMode])

  const activeCategoryMeta = ALL_CATEGORIES.find(c => c.id === activeTab)!

  return (
    <div>
      <CinematicHero />

      <CannabisMarqueeStrip />

      {/* Category Tabs */}
      <div style={{
        position: 'sticky',
        top: '56px', // Account for GlobalHeader approx height
        zIndex: 150,
        background: 'rgba(13,11,8,0.97)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          padding: '0 var(--space-6)',
          maxWidth: '1280px',
          margin: '0 auto',
        }}>
          {ALL_CATEGORIES.map(cat => {
            const count = cat.id === 'all' ? items.length : items.filter(i => i.category === cat.id).length
            const isActive = activeTab === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                style={{
                  flexShrink: 0,
                  padding: '0 1.6rem',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  borderBottom: `2px solid ${isActive ? 'var(--color-primary)' : 'transparent'}`,
                  transition: 'color 0.2s, border-color 0.2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat.label}
                <span style={{
                  background: isActive ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)' : 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '2px',
                  padding: '0.1rem 0.4rem',
                  fontSize: '0.52rem',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                }}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <section
        id="cannabis-collections"
        style={{ padding: '0 0 var(--space-12)' }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-6)' }}>
          <CampaignBanner />

          {/* Results Bar / Filters */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              // NOTE (E128/E129): fallback is load-bearing — --color-primary-dim is undefined
              // and there is no .view-cannabis CSS override. See E129.
              color: 'var(--color-primary-dim, #7A6030)',
            }}>
              <span style={{ color: 'var(--color-primary)' }}>{displayItems.length}</span> products
            </div>
            <LayoutToggle mode={layoutMode} onChange={setLayoutMode} />
          </div>

          <FilterPanel items={items} filters={filters} onChange={setFilters} />

          {/* Category Heading above grid */}
          <div style={{
            padding: '2rem 0 1rem',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: '1rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
              fontWeight: 700,
              color: 'var(--color-text)',
              margin: 0,
            }}>
              {activeCategoryMeta.label.replace(/[^a-zA-Z -]/g, '')}
            </h2>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.58rem',
              letterSpacing: '0.12em',
              color: 'var(--color-text-muted)',
              maxWidth: '350px',
              textAlign: 'right',
              lineHeight: 1.7,
            }}>
              {activeCategoryMeta.desc}
            </div>
          </div>

          {error && (
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
              Unable to load products.
            </p>
          )}

          {loading ? (
            <div style={gridStyle}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    aspectRatio: layoutMode === 'list' ? undefined : '3/4',
                    height: layoutMode === 'list' ? 'var(--space-24)' : undefined,
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
          ) : displayItems.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: '1.3rem',
                color: 'var(--color-text-muted)',
              }}>
                {filters.category
                  ? 'No items match these filters.'
                  : 'No products available at this time.'}
              </p>
            </div>
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
                      category={item.category}
                      merchandisingTags={item.merchandisingTags}
                      layoutMode={layoutMode}
                      cannabisProfile={item.cannabisProfile}
                      onClick={() => setSelectedItem(item)}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <StoryStrip />

        {selectedItem && (
          <ItemQuickView
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onSelectRelated={(item) => setSelectedItem(item)}
          />
        )}

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-6)' }}>
          <ArticleSection viewTag="cannabis" title="Cannabis Stories" />
        </div>
      </section>

      {whatsappHref && (
        <section
          aria-label="Anonymous enquiry"
          style={{
            padding: 'var(--space-16) var(--space-6)',
            textAlign: 'center',
            borderTop: '1px solid var(--color-border)',
            maxWidth: '1280px',
            margin: '0 auto',
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
