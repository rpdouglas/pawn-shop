import PawnEnquiryForm from '../../components/pawn/PawnEnquiryForm'
import { useFeatureFlags } from '../../lib/featureFlags'

export default function SellPage() {
  const { pawnFormEnabled } = useFeatureFlags()

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          color: 'var(--color-primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          fontStyle: 'italic',
          marginBottom: 'var(--space-4)',
        }}>
          The Pawn Shop · Cornwall Island
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-display)',
          color: 'var(--color-primary)',
          marginBottom: 'var(--space-4)',
        }}>
          Sell or trade your item.
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-lead)',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
          lineHeight: 1.6,
        }}>
          Tell us about what you have. We'll review your enquiry and get back to you within 24 hours with a fair quote.
        </p>
      </header>

      {pawnFormEnabled ? (
        <PawnEnquiryForm />
      ) : (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-body)',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
          lineHeight: 1.6,
        }}>
          Online enquiries are temporarily unavailable. Please call us directly to arrange an appraisal.
        </p>
      )}
    </div>
  )
}
