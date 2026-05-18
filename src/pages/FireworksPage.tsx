import { useState, useEffect } from 'react'
import CountdownTimer from '../components/fireworks/CountdownTimer'
import BundleCard from '../components/fireworks/BundleCard'
import UrgencyBadge from '../components/fireworks/UrgencyBadge'
import ClickCollectModal from '../components/pawn/ClickCollectModal'
import { useItems } from '../hooks/useItems'
import type { Item } from '../lib/types'
import { Analytics } from '../lib/analytics'

// Hardcoded fallback — E14 will wire this to campaigns/{id}.endDate
const CANADA_DAY_2026 = new Date('2026-07-01T00:00:00')

export default function FireworksPage() {
  const { items, loading, error } = useItems('fireworks')
  const [collectItem, setCollectItem] = useState<Item | null>(null)

  useEffect(() => {
    Analytics.pageView({ view: 'fireworks', page_path: '/fireworks' })
  }, [])

  return (
    <div>
      {/* Countdown hero — full-width event focus (Tanya persona) */}
      <section
        aria-label="Countdown to next event"
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-24) var(--space-6)',
          textAlign: 'center',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 'var(--space-4)',
        }}>
          The Pawn Shop
        </p>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-hero)',
          color: 'var(--color-text)',
          letterSpacing: '0.04em',
          marginBottom: 'var(--space-6)',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          Fireworks
        </h1>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lead)',
          color: 'var(--color-text-muted)',
          marginBottom: 'var(--space-12)',
          maxWidth: '480px',
        }}>
          Celebrate the moment properly.
        </p>

        <CountdownTimer targetDate={CANADA_DAY_2026} label="Until Canada Day" />
      </section>

      {/* Bundle showcase */}
      <section
        aria-labelledby="bundles-heading"
        style={{ padding: 'var(--space-12) var(--space-6)', maxWidth: '1280px', margin: '0 auto' }}
      >
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
                {/* Seasonal urgency badge overlay — isSeasonalItem flag from staff */}
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
                  title={item.title}
                  price={item.price}
                  itemCount={item.bundleIds?.length ?? 1}
                  imageUrl={item.images[0]}
                  isAvailable={item.status === 'active'}
                  onClick={item.status === 'active' && !item.policeHold ? () => setCollectItem(item) : undefined}
                />
              </div>
            ))}
          </div>
        )}
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
          All orders are pickup only. Select your bundle and choose a pickup window — we will confirm by SMS within 60 minutes.
        </p>
      </section>

      {collectItem && (
        <ClickCollectModal
          item={collectItem}
          onClose={() => setCollectItem(null)}
        />
      )}
    </div>
  )
}
