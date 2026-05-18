import { useState } from 'react'
import PawnHero from '../components/pawn/PawnHero'
import FeaturedItems from '../components/pawn/FeaturedItems'
import MasonryGrid from '../components/pawn/MasonryGrid'
import ItemQuickView from '../components/pawn/ItemQuickView'
import ClickCollectModal from '../components/pawn/ClickCollectModal'
import Input from '../components/ui/Input'
import { useItemSearch } from '../hooks/useItemSearch'
import type { Item } from '../lib/types'

export default function PawnPage() {
  const { items, loading, hasMore, loadMore, searchValue, setSearchValue } = useItemSearch('pawn')
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [collectItem, setCollectItem]   = useState<Item | null>(null)

  return (
    <div>
      <PawnHero />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
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
          <h2
            id="discover-heading"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-heading)',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-6)',
            }}
          >
            {searchValue
              ? `Results for "${searchValue}"`
              : 'Discover'}
          </h2>

          <MasonryGrid
            items={items}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={loadMore}
            onItemSelect={setSelectedItem}
          />
        </section>
      </div>

      {/* Quick-view modal — opens in < 200ms (no network request, data already in state) */}
      {selectedItem && (
        <ItemQuickView
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onCollect={() => {
            setCollectItem(selectedItem)
            setSelectedItem(null)
          }}
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
