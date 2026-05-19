import { Link } from 'react-router-dom'
import { useView } from '../context/ViewContext'

export default function HomePage() {
  const { view } = useView()

  return (
    <div className={`view-${view}`} style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
      <section style={{ 
        padding: 'var(--space-20) var(--space-6)', 
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 'clamp(3rem, 10vw, 6rem)', 
          color: 'var(--color-text)',
          margin: '0 0 var(--space-4) 0',
          lineHeight: 1
        }}>
          The Pawn Shop
        </h1>
        <p style={{ 
          fontSize: 'var(--text-lead)', 
          color: 'var(--color-primary)', 
          textTransform: 'uppercase', 
          letterSpacing: '0.3em',
          marginBottom: 'var(--space-12)'
        }}>
          Cornwall Island, Akwesasne
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 'var(--space-8)',
          marginTop: 'var(--space-12)'
        }}>
          <Link to="/pawn" style={cardStyle}>
            <h2 style={cardTitleStyle}>Pawn & Resale</h2>
            <p style={cardDescStyle}>Verified deals, transparent valuation, and community trust.</p>
          </Link>

          <Link to="/cannabis" style={cardStyle}>
            <h2 style={cardTitleStyle}>Cannabis</h2>
            <p style={cardDescStyle}>Premium wellness selections for the discerning connoisseur.</p>
          </Link>

          <Link to="/fireworks" style={cardStyle}>
            <h2 style={cardTitleStyle}>Fireworks</h2>
            <p style={cardDescStyle}>Celebrate the season with high-energy displays and bundles.</p>
          </Link>
        </div>
      </section>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  padding: 'var(--space-12) var(--space-8)',
  borderRadius: 'var(--radius-lg)',
  textDecoration: 'none',
  transition: 'transform 0.2s ease-in-out, border-color 0.2s ease-in-out',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '240px'
}

const cardTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '2rem',
  color: 'var(--color-text)',
  marginBottom: 'var(--space-4)'
}

const cardDescStyle: React.CSSProperties = {
  color: 'var(--color-text-muted)',
  lineHeight: 1.6,
  fontSize: 'var(--text-body)'
}
