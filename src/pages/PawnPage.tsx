import { useState, useRef, useCallback, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import PawnHero from '../components/pawn/PawnHero'
import FeaturedItems from '../components/pawn/FeaturedItems'
import MasonryGrid from '../components/pawn/MasonryGrid'
import ItemQuickView from '../components/pawn/ItemQuickView'
import ClickCollectModal from '../components/pawn/ClickCollectModal'
import StaffPicksSection from '../components/StaffPicksSection'
import RecentlySoldStrip from '../components/pawn/RecentlySoldStrip'
import YearsInBusinessBadge from '../components/pawn/YearsInBusinessBadge'
// import TestimonialsModule from '../components/pawn/TestimonialsModule'
import ActivityFeed from '../components/pawn/ActivityFeed'
import CampaignBanner from '../components/CampaignBanner'
import LayoutToggle, { type LayoutMode } from '../components/ui/LayoutToggle'
import LuxuryProductCard from '../components/cannabis/LuxuryProductCard'
import ArticleSection from '../components/ArticleSection'
import Input from '../components/ui/Input'
import SaveSearchButton from '../components/pawn/SaveSearchButton'
import { useItemSearch } from '../hooks/useItemSearch'
import { docToItem } from '../hooks/useItems'
import type { Item } from '../lib/types'
import { Analytics, toGA4Item } from '../lib/analytics'
import { useFeatureFlags } from '../lib/featureFlags'

export default function PawnPage() {
  const { items, loading, hasMore, loadMore, searchValue, setSearchValue } = useItemSearch('pawn')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [collectItem, setCollectItem]   = useState<Item | null>(null)
  const [layoutMode, setLayoutMode]     = useState<LayoutMode>('masonry')
  const { showStaffPicks, showRelatedItems } = useFeatureFlags()

  useEffect(() => {
    Analytics.pageView({ view: 'pawn', page_path: '/pawn' })
  }, [])

  // Fire view_item_list whenever the displayed result set changes
  const lastListKeyRef = useRef('')
  useEffect(() => {
    if (loading || items.length === 0) return
    const listName = searchValue ? 'search_results' : 'pawn_discover'
    const key = `${searchValue}:${items.length}`
    if (lastListKeyRef.current === key) return
    lastListKeyRef.current = key
    Analytics.viewItemList({
      item_list_name: listName,
      view: 'pawn',
      items: items.slice(0, 10).map(i => toGA4Item(i, listName)),
    })
  }, [items, loading, searchValue])

  // Fire search event when search term settles (500ms debounce)
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => {
    if (!searchValue) return
    clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      Analytics.search({ search_term: searchValue, view: 'pawn' })
    }, 500)
    return () => clearTimeout(searchDebounceRef.current)
  }, [searchValue])

  // Pre-fetch cache: hover triggers getDoc so click opens modal with fresh data
  const prefetchCache = useRef<Map<string, Item>>(new Map())

  const handleItemHover = useCallback((item: Item) => {
    if (prefetchCache.current.has(item.id)) return
    getDoc(doc(db, 'items', item.id))
      .then((snap) => {
        if (snap.exists()) prefetchCache.current.set(item.id, docToItem(snap))
      })
      .catch(() => { /* silent — fall back to in-state item on click */ })
  }, [])

  const handleItemSelect = useCallback((item: Item) => {
    setSelectedItem(prefetchCache.current.get(item.id) ?? item)
  }, [])

  return (
    <div>
      <PawnHero />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>



        {/* Recently sold strip — real sold data only (Dale persona) */}
        {!searchValue && <RecentlySoldStrip />}

        {/* Privacy-safe live activity feed (Sandra persona) */}
        {!searchValue && <ActivityFeed />}

        {/* Campaign banner — any active pawn promotion */}
        {!searchValue && <CampaignBanner />}

        {/* Prefix search bar — Dale and Kevin requirement */}
        <section aria-label="Search inventory" style={{ marginBottom: 'var(--space-12)' }}>
          <Input
            id="pawn-search"
            label="Search inventory"
            value={searchValue}
            onChange={setSearchValue}
            placeholder="guitar, camera, watch…"
            type="search"
          />
        </section>

        {/* Staff Picks — editorial curation by staff (Sandra persona) */}
        {!searchValue && showStaffPicks && (
          <StaffPicksSection onItemSelect={handleItemSelect} />
        )}

        {/* Featured inventory — only visible when no search is active */}
        {!searchValue && (
          <section aria-labelledby="featured-heading" style={{ marginBottom: 'var(--space-12)' }}>
            <h2
              id="featured-heading"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-heading)',
                color: 'var(--color-text)',
                marginBottom: 'var(--space-6)',
              }}
            >
              Featured
            </h2>
            <FeaturedItems onItemSelect={setSelectedItem} />
          </section>
        )}

        {/* Masonry discovery grid — Sandra's primary experience */}
        <section id="masonry-section" aria-labelledby="discover-heading">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)' 
          }}>
            <h2
              id="discover-heading"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-heading)',
                color: 'var(--color-text)',
                margin: 0,
              }}
            >
              {searchValue
                ? `Results for "${searchValue}"`
                : 'Discover'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <LayoutToggle 
                mode={layoutMode} 
                onChange={setLayoutMode} 
                allowedModes={['masonry', 'grid3', 'list']}
              />
              {searchValue && (
                <SaveSearchButton query={searchValue} viewTag="pawn" />
              )}
            </div>
          </div>

          {layoutMode === 'masonry' ? (
            <MasonryGrid
              items={items}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onItemSelect={handleItemSelect}
              onItemHover={handleItemHover}
            />
          ) : (
            <div>
              {!loading && items.length === 0 ? (
                <p style={{
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--text-body)',
                  fontStyle: 'italic',
                  padding: 'var(--space-12) 0',
                }}>
                  No items found. Try a different search.
                </p>
              ) : (
                <div style={{
                  display: layoutMode === 'list' ? 'flex' : 'grid',
                  flexDirection: layoutMode === 'list' ? 'column' : undefined,
                  gridTemplateColumns: layoutMode === 'list' ? undefined : 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: 'var(--space-6)'
                }}>
                  {items.map(item => (
                    <div key={item.id} onMouseEnter={() => handleItemHover(item)}>
                      <LuxuryProductCard
                        title={item.title}
                        price={item.price}
                        description={item.description}
                        imageUrl={item.images[0]}
                        merchandisingTags={item.merchandisingTags}
                        layoutMode={layoutMode}
                        onClick={() => handleItemSelect(item)}
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {hasMore && (
                <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
                  <button 
                    onClick={loadMore} 
                    style={{
                      background: 'var(--color-surface)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                      padding: 'var(--space-3) var(--space-6)',
                      borderRadius: 'var(--radius-full)',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-small)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all var(--motion-speed-fast) var(--motion-easing)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                    }}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
              {loading && !hasMore && items.length > 0 && (
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
            </div>
          )}
        </section>

        {/* Narrative & Stories — E19 Akwesasne identity foundation */}
        {!searchValue && <ArticleSection viewTag="pawn" title="Akwesasne Narrative" />}

        {/* Community testimonials — Makoonsii trust signal */}
        {/* HIDDEN PENDING REAL STORIES: {!searchValue && <TestimonialsModule />} */}

        {/* Trust strip — years in business (Makoonsii + Dale) */}
        {!searchValue && (
          <section
            aria-label="Store trust signals"
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 'var(--space-16)',
              marginBottom: 'var(--space-8)',
            }}
          >
            <YearsInBusinessBadge />
          </section>
        )}
      </div>

      {/* Quick-view modal — data pre-fetched on hover; opens in < 200ms */}
      {selectedItem && (
        <ItemQuickView
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onCollect={() => {
            setCollectItem(selectedItem)
            setSelectedItem(null)
          }}
          onSelectRelated={showRelatedItems ? handleItemSelect : undefined}
        />
      )}

      {collectItem && (
        <ClickCollectModal
          item={collectItem}
          onClose={() => setCollectItem(null)}
        />
      )}
    </div>
  )
}
