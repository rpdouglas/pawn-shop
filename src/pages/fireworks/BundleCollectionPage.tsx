import { Link } from 'react-router-dom'
import BundleCard from '../../components/fireworks/BundleCard'
import ClickCollectModal from '../../components/pawn/ClickCollectModal'
import { useItems } from '../../hooks/useItems'
import { useState } from 'react'
import type { Item } from '../../lib/types'

export default function BundleCollectionPage() {
  const { items, loading, error } = useItems('fireworks')
  const [collectItem, setCollectItem] = useState<Item | null>(null)

  // Bundles: items with bundleIds array OR limited-edition tag
  const bundles = items.filter(
    (i) => (i.bundleIds && i.bundleIds.length > 0) || i.merchandisingTags?.includes('limited-edition'),
  )

  return (
    <main id="main-content">
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
        <header style={{ marginBottom: 'var(--space-8)' }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 'var(--space-2)',
          }}>
            Fireworks
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display)',
            color: 'var(--color-text)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-4)',
            lineHeight: 1,
          }}>
            Season Bundles
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-lead)',
            color: 'var(--color-text-muted)',
            maxWidth: '480px',
            lineHeight: 1.6,
          }}>
            Curated for your celebration — every bundle includes everything you need.
          </p>
        </header>

        {error && (
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
            Unable to load bundles.
          </p>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-md)',
                  aspectRatio: '16/9',
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
        ) : bundles.length === 0 ? (
          <p style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
            fontSize: 'var(--text-body)',
          }}>
            New bundles arriving for the season.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            {bundles.map((item) => (
              <BundleCard
                key={item.id}
                title={item.title}
                price={item.price}
                itemCount={item.bundleIds?.length ?? 1}
                imageUrl={item.images[0]}
                isAvailable={item.status === 'active'}
                onClick={item.status === 'active' && !item.policeHold ? () => setCollectItem(item) : undefined}
              />
            ))}
          </div>
        )}

        <div style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--color-border)' }}>
          <Link
            to="/fireworks"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-muted)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            ← Back to Fireworks
          </Link>
        </div>
      </div>

      {collectItem && (
        <ClickCollectModal item={collectItem} onClose={() => setCollectItem(null)} />
      )}
    </main>
  )
}
