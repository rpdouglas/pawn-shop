import CountdownTimer from '../components/fireworks/CountdownTimer'
import BundleCard from '../components/fireworks/BundleCard'
import UrgencyBadge from '../components/fireworks/UrgencyBadge'

const CANADA_DAY_2026 = new Date('2026-07-01T00:00:00')

const DEMO_BUNDLES = [
  { id: '1', title: 'The Patriot Pack',   price: 14900, itemCount: 12, isAvailable: true  },
  { id: '2', title: 'Family Celebration', price:  8900, itemCount:  8, isAvailable: true  },
  { id: '3', title: 'Grand Finale',       price: 29900, itemCount: 24, isAvailable: false },
]

export default function FireworksPage() {
  return (
    <div style={{ padding: '48px 32px', maxWidth: '1024px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '64px', letterSpacing: '0.02em', marginBottom: '8px', textTransform: 'uppercase' }}>
        Fireworks
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '48px' }}>
        E02 component scaffold — Fireworks view
      </p>

      {/* Countdown */}
      <section style={{ marginBottom: '56px' }}>
        <h2 style={{ marginBottom: '24px', fontSize: '18px', fontFamily: 'var(--font-body)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Canada Day countdown
        </h2>
        <CountdownTimer targetDate={CANADA_DAY_2026} label="Until July 1st" />
      </section>

      {/* Urgency badges */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '18px', fontFamily: 'var(--font-body)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Urgency badges
        </h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <UrgencyBadge type="low-stock"   label="Low stock" />
          <UrgencyBadge type="last-chance" label="Last chance" />
          <UrgencyBadge type="seasonal"    label="Canada Day special" />
        </div>
      </section>

      {/* Bundle cards */}
      <section>
        <h2 style={{ marginBottom: '24px', fontSize: '18px', fontFamily: 'var(--font-body)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Season bundles
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {DEMO_BUNDLES.map((bundle) => (
            <BundleCard
              key={bundle.id}
              title={bundle.title}
              price={bundle.price}
              itemCount={bundle.itemCount}
              isAvailable={bundle.isAvailable}
              onClick={bundle.isAvailable ? () => {} : undefined}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
