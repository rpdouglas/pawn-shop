import { useState, useEffect } from 'react'
import { collection, query, where, limit, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import CountdownTimer from '../components/fireworks/CountdownTimer'
import BundleCard from '../components/fireworks/BundleCard'
import UrgencyBadge from '../components/fireworks/UrgencyBadge'
import CampaignBanner from '../components/CampaignBanner'
import PreorderModal from '../components/fireworks/PreorderModal'
import ArticleSection from '../components/ArticleSection'
import { useItems } from '../hooks/useItems'
import type { Item, Campaign, CampaignViewTag } from '../lib/types'
import { Analytics } from '../lib/analytics'

function docToCampaign(doc: { id: string; data: () => Record<string, unknown> }): Campaign {
  const d = doc.data()
  return {
    id: doc.id,
    title:            String(d['title'] ?? ''),
    viewTag:          (d['viewTag'] as CampaignViewTag) ?? 'fireworks',
    startDate:        (d['startDate'] as { toDate(): Date }).toDate(),
    endDate:          (d['endDate'] as { toDate(): Date }).toDate(),
    active:           Boolean(d['active']),
    discountRule:     (d['discountRule'] as Campaign['discountRule']) ?? { type: 'fixed', value: 0 },
    bannerCopy:       String(d['bannerCopy'] ?? ''),
    countdownEnabled: Boolean(d['countdownEnabled']),
    createdBy:        d['createdBy'] != null ? String(d['createdBy']) : undefined,
    updatedAt:        d['updatedAt'] != null ? (d['updatedAt'] as { toDate(): Date }).toDate() : undefined,
    createdAt:        (d['createdAt'] as { toDate(): Date }).toDate(),
  }
}

export default function FireworksPage() {
  const { items, loading, error } = useItems('fireworks')
  const [preorderItem, setPreorderItem] = useState<Item | null>(null)
  // undefined = loading, null = no active countdown campaign, Campaign = found
  const [countdownCampaign, setCountdownCampaign] = useState<Campaign | null | undefined>(undefined)

  useEffect(() => {
    Analytics.pageView({ view: 'fireworks', page_path: '/fireworks' })
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, 'campaigns'),
      where('active', '==', true),
      limit(20),
    )
    getDocs(q)
      .then((snap) => {
        const match = snap.docs
          .map(docToCampaign)
          .find((c) => (c.viewTag === 'fireworks' || c.viewTag === 'all') && c.countdownEnabled)
        setCountdownCampaign(match ?? null)
      })
      .catch(() => { setCountdownCampaign(null) })
  }, [])

  const showCountdown = countdownCampaign != null

  return (
    <div>
      {/* Countdown hero — real campaign endDate only (Tanya persona) */}
      <section
        aria-label="Countdown to next event"
        style={{
          minHeight: '30vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-12) var(--space-6)',
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
          marginBottom: showCountdown ? 'var(--space-12)' : 0,
          maxWidth: '480px',
        }}>
          Celebrate the moment properly.
        </p>

        {showCountdown && countdownCampaign && (
          <CountdownTimer
            targetDate={countdownCampaign.endDate}
            label={countdownCampaign.title}
          />
        )}
      </section>

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
