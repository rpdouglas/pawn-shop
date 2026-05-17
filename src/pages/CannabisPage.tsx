import CinematicHero from '../components/cannabis/CinematicHero'
import MoodCard from '../components/cannabis/MoodCard'
import LuxuryProductCard from '../components/cannabis/LuxuryProductCard'
import type { MoodCategory } from '../lib/types'

const MOODS: { mood: MoodCategory; itemCount: number }[] = [
  { mood: 'relax',    itemCount: 8  },
  { mood: 'focus',    itemCount: 5  },
  { mood: 'social',   itemCount: 11 },
  { mood: 'ceremony', itemCount: 4  },
]

const DEMO_PRODUCTS = [
  { id: '1', title: 'Reserve Flower — Indica', price: 4500, description: 'A deeply relaxing cultivar with earthy, pine notes.', mood: 'relax' as MoodCategory, merchandisingTags: ['staff-pick'] },
  { id: '2', title: 'Live Resin Cartridge',   price: 6500, description: 'Full-spectrum extraction for an elevated experience.',  mood: 'focus' as MoodCategory },
  { id: '3', title: 'Ceremony Bundle',        price: 12000, description: 'Thoughtfully curated for ritual and reflection.',       mood: 'ceremony' as MoodCategory, merchandisingTags: ['limited-edition'] },
]

export default function CannabisPage() {
  return (
    <div>
      {/* Hero */}
      <CinematicHero
        heading="Wellness, curated."
        subheading="Premium cannabis for every intention — sourced with care, presented with discretion."
        ctaLabel="Explore collections"
        onCtaClick={() => {}}
      />

      {/* Mood collections */}
      <section style={{ padding: '48px 32px', maxWidth: '1024px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '8px', fontSize: '32px', fontWeight: 300, letterSpacing: '-0.01em' }}>
          Shop by mood
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '15px' }}>
          E02 component scaffold — Cannabis view
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          {MOODS.map(({ mood, itemCount }) => (
            <MoodCard key={mood} mood={mood} itemCount={itemCount} />
          ))}
        </div>

        {/* Product cards */}
        <h2 style={{ marginBottom: '32px', fontSize: '32px', fontWeight: 300, letterSpacing: '-0.01em' }}>
          Featured products
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {DEMO_PRODUCTS.map((product) => (
            <LuxuryProductCard
              key={product.id}
              title={product.title}
              price={product.price}
              description={product.description}
              mood={product.mood}
              merchandisingTags={product.merchandisingTags}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
