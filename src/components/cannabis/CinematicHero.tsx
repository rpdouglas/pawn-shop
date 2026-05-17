import Button from '../ui/Button'

interface CinematicHeroProps {
  heading: string
  subheading?: string
  imageUrl?: string
  ctaLabel?: string
  onCtaClick?: () => void
}

export default function CinematicHero({
  heading,
  subheading,
  imageUrl,
  ctaLabel,
  onCtaClick,
}: CinematicHeroProps) {
  const hasCta = ctaLabel !== undefined && onCtaClick !== undefined

  return (
    <section style={{
      position: 'relative',
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'flex-end',
      padding: '64px 32px',
      backgroundColor: 'var(--color-bg)',
      overflow: 'hidden',
    }}>
      {/* Background image — dark background frames photography (Marcus Photography Test) */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.35,
          }}
        />
      )}

      {/* Gradient overlay from bg at bottom */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, var(--color-bg) 0%, transparent 65%)',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', maxWidth: '720px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(40px, 6vw, 80px)',
          fontWeight: 300,
          color: 'var(--color-text)',
          lineHeight: 1.08,
          marginBottom: subheading || hasCta ? '20px' : 0,
          letterSpacing: '-0.02em',
        }}>
          {heading}
        </h1>

        {subheading && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '18px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
            marginBottom: hasCta ? '32px' : 0,
          }}>
            {subheading}
          </p>
        )}

        {hasCta && (
          <Button variant="primary" size="lg" onClick={onCtaClick}>
            {ctaLabel}
          </Button>
        )}
      </div>
    </section>
  )
}
