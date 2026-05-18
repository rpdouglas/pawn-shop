import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="view-pawn" style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 'var(--space-12) var(--space-6)',
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text)',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(3rem, 10vw, 6rem)',
        color: 'var(--color-primary)',
        lineHeight: 1,
        marginBottom: 'var(--space-4)',
      }}>
        404
      </h1>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-subheading)',
        maxWidth: '24ch',
        margin: '0 auto var(--space-12)',
        color: 'var(--color-text-muted)',
      }}>
        This path has gone astray. The object you seek is not in our current collection.
      </p>
      
      <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
        <Link to="/">
          <Button variant="primary">Return Home</Button>
        </Link>
        <Link to="/contact">
          <Button variant="secondary">Inquire with Staff</Button>
        </Link>
      </div>

      <div style={{
        marginTop: 'var(--space-20)',
        borderTop: '1px solid var(--color-border)',
        paddingTop: 'var(--space-8)',
        width: '100%',
        maxWidth: '400px',
        opacity: 0.6,
      }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          The Pawn Shop · Akwesasne
        </p>
      </div>
    </div>
  )
}
