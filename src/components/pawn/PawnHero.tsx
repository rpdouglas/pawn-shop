import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'

export default function PawnHero() {
  const navigate = useNavigate()

  const scrollToDiscovery = () => {
    document.getElementById('masonry-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      aria-label="Pawn Shop — find your next discovery"
      style={{
        position: 'relative',
        minHeight: '50vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-12) var(--space-8)',
        backgroundColor: 'var(--color-bg)',
        overflow: 'hidden',
        textAlign: 'center'
      }}
    >
      {/* Decorative gold rule — art deco motif */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(to right, transparent, var(--color-primary), transparent)',
        }}
      />

      {/* Content — staggered text reveal (approved cinematic reveal pattern) */}
      <div
        className="pawn-hero-content"
        style={{ position: 'relative', maxWidth: '720px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          color: 'var(--color-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          marginBottom: 'var(--space-4)',
          fontStyle: 'italic',
        }}>
          Cornwall Island · Akwesasne
        </p>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(var(--text-heading), 6vw, var(--text-hero))',
          fontWeight: 700,
          color: 'var(--color-primary)',
          lineHeight: 1.05,
          letterSpacing: '-0.01em',
          marginBottom: 'var(--space-6)',
        }}>
          Quiet confidence. Curated objects of distinction.
        </h1>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lead)',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
          lineHeight: 1.6,
          marginBottom: 'var(--space-8)',
          maxWidth: '540px',
          margin: '0 auto var(--space-8) auto'
        }}>
          An uncompromising collection of timepieces, instruments, and heirlooms—presented with editorial precision.
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', width: '100%', maxWidth: '380px', margin: '0 auto' }}>
          <Button variant="primary" onClick={scrollToDiscovery} style={{ flex: 1, paddingLeft: 0, paddingRight: 0, whiteSpace: 'nowrap' }}>
            Browse Inventory
          </Button>
          <Button variant="secondary" onClick={() => navigate('/pawn/sell')} style={{ flex: 1, paddingLeft: 0, paddingRight: 0, whiteSpace: 'nowrap' }}>
            Pawn or Sell
          </Button>
        </div>
      </div>

      {/* Bottom gold rule */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          backgroundColor: 'var(--color-border)',
        }}
      />
    </section>
  )
}
