import { useParams, Link } from 'react-router-dom'
import LuxuryProductCard from '../../components/cannabis/LuxuryProductCard'
import { useItems } from '../../hooks/useItems'
import type { MoodCategory } from '../../lib/types'

// Maps mood slug to the Firestore category value used in cannabis inventory
const MOOD_CATEGORY: Record<MoodCategory, string> = {
  relax:    'flower',
  focus:    'concentrates',
  social:   'edibles',
  ceremony: 'topicals',
}

const MOOD_LABELS: Record<MoodCategory, string> = {
  relax:    'Relax',
  focus:    'Focus',
  social:   'Social',
  ceremony: 'Ceremony',
}

const MOOD_DESCRIPTIONS: Record<MoodCategory, string> = {
  relax:    'Unwind and settle into the moment.',
  focus:    'Clarity and intention for every task.',
  social:   'Share something worth sharing.',
  ceremony: 'Reserve for the moments that deserve presence.',
}

const ALL_MOODS: MoodCategory[] = ['relax', 'focus', 'social', 'ceremony']

function isMoodCategory(slug: string): slug is MoodCategory {
  return Object.keys(MOOD_CATEGORY).includes(slug)
}

export default function MoodCollectionPage() {
  const { mood: moodSlug } = useParams<{ mood: string }>()
  const { items, loading, error } = useItems('cannabis')

  if (!moodSlug || !isMoodCategory(moodSlug)) {
    return (
      <main id="main-content" style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
          Collection not found.
        </p>
      </main>
    )
  }

  const mood = moodSlug
  const category = MOOD_CATEGORY[mood]
  const filteredItems = items.filter((i) => i.category === category)

  return (
    <main id="main-content">
      {/* Mood navigation strip */}
      <nav
        aria-label="Mood collections"
        style={{
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-4) var(--space-6)',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{ display: 'inline-flex', gap: 'var(--space-4)', maxWidth: '1280px', margin: '0 auto' }}>
          {ALL_MOODS.map((m) => (
            <Link
              key={m}
              to={`/cannabis/collections/${m}`}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-small)',
                color: m === mood ? 'var(--color-text)' : 'var(--color-text-muted)',
                textDecoration: m === mood ? 'underline' : 'none',
                textUnderlineOffset: '3px',
                letterSpacing: '0.05em',
                padding: 'var(--space-2) 0',
                minHeight: '48px',
                display: 'inline-flex',
                alignItems: 'center',
              }}
              aria-current={m === mood ? 'page' : undefined}
            >
              {MOOD_LABELS[m]}
            </Link>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
        <header style={{ marginBottom: 'var(--space-8)' }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 'var(--space-2)',
          }}>
            Collection
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display)',
            color: 'var(--color-text)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            marginBottom: 'var(--space-4)',
          }}>
            {MOOD_LABELS[mood]}
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-lead)',
            color: 'var(--color-text-muted)',
            maxWidth: '560px',
            lineHeight: 1.6,
          }}>
            {MOOD_DESCRIPTIONS[mood]}
          </p>
        </header>

        {error && (
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
            Unable to load collection.
          </p>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-6)' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                aria-hidden="true"
                style={{
                  backgroundColor: 'var(--color-surface)',
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
            New arrivals for this collection coming soon.
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

        <div style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--color-border)' }}>
          <Link
            to="/cannabis"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-small)',
              color: 'var(--color-text-muted)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            ← All collections
          </Link>
        </div>
      </div>
    </main>
  )
}
