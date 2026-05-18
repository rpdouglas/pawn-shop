import { useState } from 'react'
import CinematicHero from '../components/cannabis/CinematicHero'
import MoodCard from '../components/cannabis/MoodCard'
import LuxuryProductCard from '../components/cannabis/LuxuryProductCard'
import Button from '../components/ui/Button'
import { useItems } from '../hooks/useItems'
import type { MoodCategory } from '../lib/types'

// Category values that map to each mood in inventory
const MOOD_CATEGORY: Record<MoodCategory, string> = {
  relax:    'flower',
  focus:    'concentrates',
  social:   'edibles',
  ceremony: 'topicals',
}

const ALL_MOODS: MoodCategory[] = ['relax', 'focus', 'social', 'ceremony']

// WhatsApp deep-link — no account required (Marie Discretion Test)
// VITE_WHATSAPP_NUMBER must be set in .env.local before launch
const WHATSAPP_HREF = `https://wa.me/${import.meta.env['VITE_WHATSAPP_NUMBER'] ?? ''}`

export default function CannabisPage() {
  const { items, loading, error } = useItems('cannabis')
  const [selectedMood, setSelectedMood] = useState<MoodCategory | null>(null)

  const scrollToCollections = () => {
    document.getElementById('cannabis-collections')?.scrollIntoView({ behavior: 'smooth' })
  }

  // Client-side mood filter (cannabis inventory is small; avoids composite index on category)
  const filteredItems = selectedMood
    ? items.filter((i) => i.category === MOOD_CATEGORY[selectedMood])
    : items

  // Per-mood item counts (derived from loaded items — no extra Firestore queries)
  const moodCounts: Record<MoodCategory, number> = {
    relax:    items.filter((i) => i.category === MOOD_CATEGORY.relax).length,
    focus:    items.filter((i) => i.category === MOOD_CATEGORY.focus).length,
    social:   items.filter((i) => i.category === MOOD_CATEGORY.social).length,
    ceremony: items.filter((i) => i.category === MOOD_CATEGORY.ceremony).length,
  }

  return (
    <div>
      {/* Cinematic hero — no hard sell, Cormorant Garamond, single CTA */}
      <CinematicHero
        heading="Wellness, curated."
        subheading="Premium cannabis for every intention — sourced with care, presented with discretion."
        ctaLabel="Explore collections"
        onCtaClick={scrollToCollections}
      />

      {/* Mood collections */}
      <section
        id="cannabis-collections"
        aria-labelledby="mood-heading"
        style={{ padding: 'var(--space-12) var(--space-6)', maxWidth: '1280px', margin: '0 auto' }}
      >
        <h2
          id="mood-heading"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-heading)',
            color: 'var(--color-text)',
            fontWeight: 300,
            letterSpacing: '-0.01em',
            marginBottom: 'var(--space-2)',
          }}
        >
          Shop by mood
        </h2>
        {selectedMood && (
          <button
            onClick={() => setSelectedMood(null)}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginBottom: 'var(--space-6)',
              textDecoration: 'underline',
            }}
          >
            Clear filter
          </button>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-12)',
        }}>
          {ALL_MOODS.map((mood) => (
            <MoodCard
              key={mood}
              mood={mood}
              itemCount={moodCounts[mood]}
              onClick={() => setSelectedMood(mood === selectedMood ? null : mood)}
            />
          ))}
        </div>

        {/* Product grid */}
        <section aria-labelledby="products-heading">
          <h2
            id="products-heading"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-heading)',
              color: 'var(--color-text)',
              fontWeight: 300,
              letterSpacing: '-0.01em',
              marginBottom: 'var(--space-8)',
            }}
          >
            {selectedMood
              ? `${selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)} collection`
              : 'Featured products'}
          </h2>

          {error && (
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
              Unable to load products.
            </p>
          )}

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    aspectRatio: '3/4',
                    opacity: 0.5,
                  }}
                />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <p style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--color-text-muted)',
              fontStyle: 'italic',
              fontSize: 'var(--text-body)',
            }}>
              {selectedMood ? 'No items in this collection yet.' : 'No products available at this time.'}
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 'var(--space-6)',
            }}>
              {filteredItems.map((item) => (
                <LuxuryProductCard
                  key={item.id}
                  title={item.title}
                  price={item.price}
                  description={item.description || undefined}
                  imageUrl={item.images[0]}
                  merchandisingTags={item.merchandisingTags}
                />
              ))}
            </div>
          )}
        </section>
      </section>

      {/* Anonymous WhatsApp enquiry — no account required (Marie Discretion Test) */}
      <section
        aria-label="Anonymous enquiry"
        style={{
          padding: 'var(--space-16) var(--space-6)',
          textAlign: 'center',
          borderTop: '1px solid var(--color-border)',
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
        <a
          href={WHATSAPP_HREF}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <Button variant="secondary" size="lg">Enquire on WhatsApp</Button>
        </a>

        {/* Privacy footer — approved design element */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          marginTop: 'var(--space-12)',
        }}>
          Built with Canadian privacy standards.
        </p>
      </section>
    </div>
  )
}
