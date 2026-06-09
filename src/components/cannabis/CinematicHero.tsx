import { useHeroMedia } from '../../hooks/useHeroMedia'
import { ImageCarousel } from '../ui/ImageCarousel'
import { YouTubeFacade } from '../ui/YouTubeFacade'

export default function CinematicHero() {
  const heroMedia = useHeroMedia('cannabis')

  return (
    <section
      aria-label="Cannabis Wellness — boutique craft cannabis"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-8)',
        backgroundColor: 'var(--color-bg)',
        overflow: 'hidden',
      }}
    >
      {/* Optional media background — async, does not block LCP */}
      {heroMedia && heroMedia.mediaType === 'carousel' && heroMedia.carouselImages && heroMedia.carouselImages.length > 0 && (
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0 }}
        >
          <ImageCarousel images={heroMedia.carouselImages} />
        </div>
      )}

      {/* Gradient overlay — dark background frames photography (Marcus Photography Test) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, var(--color-bg) 40%, transparent 100%)',
          zIndex: 1,
        }}
      />

      {/* Content — fade-up uses view-scoped --motion-speed (600ms cannabis) */}
      <div
        className="cinematic-hero-content"
        style={{ position: 'relative', zIndex: 2, maxWidth: '620px' }}
      >
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(var(--text-heading), 6vw, var(--text-hero))',
          fontWeight: 300,
          color: 'var(--color-text)',
          lineHeight: 1.08,
          marginBottom: 'var(--space-5)',
          letterSpacing: '-0.02em',
        }}>
          American Craft. Canadian Prices.
        </h1>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lead)',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
          marginBottom: 'var(--space-8)',
          maxWidth: '480px',
        }}>
          Curated wellness essentials from artisan producers. Every product selected for purity, provenance, and effect.
        </p>

        <a
          href="#inventory"
          onClick={e => {
            e.preventDefault()
            document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: 'var(--space-4) var(--space-8)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-subheading)',
            textDecoration: 'none',
            borderRadius: 'var(--radius-sm)',
            minHeight: '48px',
            lineHeight: 1,
          }}
        >
          Browse Products
        </a>

        {/* YouTube media — placed below CTA, below fold */}
        {heroMedia && heroMedia.mediaType === 'youtube' && heroMedia.youtubeId && (
          <div
            style={{
              width: '100%',
              maxWidth: '540px',
              marginTop: 'var(--space-10)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              aspectRatio: '16 / 9',
            }}
          >
            <YouTubeFacade
              videoId={heroMedia.youtubeId}
              title="Cannabis Wellness — The Pawn Shop"
            />
          </div>
        )}
      </div>
    </section>
  )
}
