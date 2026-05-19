// [LEGAL REVIEW REQUIRED] — Content below is a structural placeholder only.
// Replace all body copy with counsel-approved text before any production deploy.

import { Link } from 'react-router-dom'

export default function PrivacyPage() {
  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <p style={eyebrowStyle}>The Pawn Shop · Cornwall Island, Akwesasne</p>

        <h1 style={headingStyle}>Privacy Policy</h1>

        <p style={metaStyle}>
          Effective date: May 1, 2026 · Version 2026-05-01
        </p>

        <div style={noticeStyle} role="note" aria-label="Legal review notice">
          <p style={noticeTextStyle}>
            This page contains placeholder content pending legal counsel review.
            It is not a final or enforceable privacy policy. Replace before production deploy.
          </p>
        </div>

        <section aria-labelledby="collection-heading" style={sectionStyle}>
          <h2 id="collection-heading" style={subheadingStyle}>Information We Collect</h2>
          <p style={bodyStyle}>
            [LEGAL REVIEW REQUIRED — describe what personal information is collected,
            why it is collected, and the legal basis for collection under PIPEDA.]
          </p>
        </section>

        <section aria-labelledby="use-heading" style={sectionStyle}>
          <h2 id="use-heading" style={subheadingStyle}>How We Use Your Information</h2>
          <p style={bodyStyle}>
            [LEGAL REVIEW REQUIRED — describe how collected information is used,
            including any third-party services (Firebase, Twilio, SendGrid).]
          </p>
        </section>

        <section aria-labelledby="retention-heading" style={sectionStyle}>
          <h2 id="retention-heading" style={subheadingStyle}>Data Retention</h2>
          <p style={bodyStyle}>
            Pawn enquiry and reservation records with a completed or declined status are
            retained for two years in accordance with PIPEDA requirements, then permanently
            deleted. Audit logs are retained indefinitely as a compliance record.
          </p>
        </section>

        <section aria-labelledby="rights-heading" style={sectionStyle}>
          <h2 id="rights-heading" style={subheadingStyle}>Your Rights</h2>
          <p style={bodyStyle}>
            [LEGAL REVIEW REQUIRED — describe rights to access, correct, and delete
            personal information, and how to exercise them.]
          </p>
        </section>

        <section aria-labelledby="contact-heading" style={sectionStyle}>
          <h2 id="contact-heading" style={subheadingStyle}>Contact Us</h2>
          <p style={bodyStyle}>
            Questions about this policy?{' '}
            <Link to="/contact" style={linkStyle}>Contact The Pawn Shop</Link>.
          </p>
        </section>

        <p style={footerStyle}>
          <Link to="/terms" style={linkStyle}>Terms of Use</Link>
          {' · '}
          <Link to="/accessibility" style={linkStyle}>Accessibility</Link>
        </p>
      </div>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '60vh',
  padding: 'var(--space-16) var(--space-6)',
}

const contentStyle: React.CSSProperties = {
  maxWidth: '680px',
  margin: '0 auto',
}

const eyebrowStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  marginBottom: 'var(--space-4)',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-display)',
  color: 'var(--color-text)',
  fontWeight: 400,
  marginBottom: 'var(--space-2)',
}

const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  color: 'var(--color-text-muted)',
  marginBottom: 'var(--space-10)',
}

const noticeStyle: React.CSSProperties = {
  padding: 'var(--space-4) var(--space-6)',
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  marginBottom: 'var(--space-10)',
}

const noticeTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  color: 'var(--color-text-muted)',
  margin: 0,
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 'var(--space-10)',
}

const subheadingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--text-subheading)',
  color: 'var(--color-text)',
  fontWeight: 400,
  marginBottom: 'var(--space-4)',
}

const bodyStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-body)',
  color: 'var(--color-text-muted)',
  lineHeight: 1.7,
}

const footerStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-small)',
  color: 'var(--color-text-muted)',
  marginTop: 'var(--space-16)',
  paddingTop: 'var(--space-6)',
  borderTop: '1px solid var(--color-border)',
}

const linkStyle: React.CSSProperties = {
  color: 'var(--color-text-muted)',
  textDecoration: 'underline',
}
