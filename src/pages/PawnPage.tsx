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
import TestimonialsModule from '../components/pawn/TestimonialsModule'
import ActivityFeed from '../components/pawn/ActivityFeed'
import CampaignBanner from '../components/CampaignBanner'
import Input from '../components/ui/Input'
import SaveSearchButton from '../components/pawn/SaveSearchButton'
import { useItemSearch } from '../hooks/useItemSearch'
import { docToItem } from '../hooks/useItems'
import type { Item } from '../lib/types'
import { Analytics } from '../lib/analytics'
import { useFeatureFlags } from '../lib/featureFlags'

export default function PawnPage() {
  const { items, loading, hasMore, loadMore, searchValue, setSearchValue } = useItemSearch('pawn')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [collectItem, setCollectItem]   = useState<Item | null>(null)
  const { showStaffPicks, showRelatedItems } = useFeatureFlags()

  useEffect(() => {
    Analytics.pageView({ view: 'pawn', page_path: '/pawn' })
  }, [])

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

        {/* Trust strip — years in business + recently sold (Makoonsii + Dale) */}
        {!searchValue && (
          <section
            aria-label="Store trust signals"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-8)',
              flexWrap: 'wrap',
              marginBottom: 'var(--space-12)',
            }}
          >
            <YearsInBusinessBadge />
          </section>
        )}

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
            {searchValue && (
              <SaveSearchButton query={searchValue} viewTag="pawn" />
            )}
          </div>

          <MasonryGrid
            items={items}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onItemSelect={handleItemSelect}
            onItemHover={handleItemHover}
          />
        </section>

        {/* Community testimonials — Makoonsii trust signal */}
        {!searchValue && <TestimonialsModule />}
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
