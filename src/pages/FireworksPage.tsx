import { useState, useEffect } from 'react'
import FireworksHero from '../components/fireworks/FireworksHero'
import BundleCard from '../components/fireworks/BundleCard'
import UrgencyBadge from '../components/fireworks/UrgencyBadge'
import CampaignBanner from '../components/CampaignBanner'
import PreorderModal from '../components/fireworks/PreorderModal'
import ArticleSection from '../components/ArticleSection'
import { useItems } from '../hooks/useItems'
import type { Item } from '../lib/types'
import { Analytics } from '../lib/analytics'

export default function FireworksPage() {
  const { items, loading, error } = useItems('fireworks')
  const [preorderItem, setPreorderItem] = useState<Item | null>(null)

  useEffect(() => {
    Analytics.pageView({ view: 'fireworks', page_path: '/fireworks' })
  }, [])

  return (
    <div>
      <FireworksHero />

      {/* Bundle showcase */}
      <section
        aria-labelledby="bundles-heading"
        style={{ padding: 'var(--space-12) var(--space-6)', maxWidth: '1280px', margin: '0 auto' }}
      >
        <CampaignBanner />

        <h2
          id="bundles-heading"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-heading)',
            color: 'var(--color-text)',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            marginBottom: 'var(--space-8)',
          }}
        >
          Season Bundles
        </h2>

        {error && (
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
            Unable to load bundles.
          </p>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  aspectRatio: '16/9',
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
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
            {items.map((item) => (
              <div key={item.id} style={{ position: 'relative' }}>
                {item.isSeasonalItem && (
                  <div style={{
                    position: 'absolute',
                    top: 'var(--space-2)',
                    right: 'var(--space-2)',
                    zIndex: 1,
                  }}>
                    <UrgencyBadge type="seasonal" label="Seasonal" />
                  </div>
                )}
                <BundleCard
                  itemId={item.id}
                  title={item.title}
                  price={item.price}
                  itemCount={item.bundleIds?.length ?? 1}
                  imageUrl={item.images[0]}
                  isAvailable={item.status === 'active'}
                  onClick={item.status === 'active' && !item.policeHold ? () => setPreorderItem(item) : undefined}
                />
              </div>
            ))}
          </div>
        )}

        {/* Fireworks Stories — E19 editorial integration */}
        <ArticleSection viewTag="fireworks" title="Seasonal Stories" />
      </section>

      {/* Pickup information */}
      <section
        aria-label="Pickup information"
        style={{
          padding: 'var(--space-12) var(--space-6)',
          textAlign: 'center',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-body)',
          color: 'var(--color-text-muted)',
          maxWidth: '480px',
          margin: '0 auto',
          lineHeight: 1.6,
        }}>
          All orders are pickup only. Place your pre-order and we'll confirm by SMS — your pickup window will be set when your order is ready.
        </p>
      </section>

      {preorderItem && (
        <PreorderModal
          item={preorderItem}
          onClose={() => setPreorderItem(null)}
        />
      )}
    </div>
  )
}
