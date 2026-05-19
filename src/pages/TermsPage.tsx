// [LEGAL REVIEW REQUIRED] — Content below is a structural placeholder only.
// Replace all body copy with counsel-approved text before any production deploy.

import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        <p style={eyebrowStyle}>The Pawn Shop · Cornwall Island, Akwesasne</p>

        <h1 style={headingStyle}>Terms of Use</h1>

        <p style={metaStyle}>
          Effective date: May 1, 2026 · Version 2026-05-01
        </p>

        <div style={noticeStyle} role="note" aria-label="Legal review notice">
          <p style={noticeTextStyle}>
            This page contains placeholder content pending legal counsel review.
            It is not a final or enforceable terms of use document. Replace before production deploy.
          </p>
        </div>

        <section aria-labelledby="use-heading" style={sectionStyle}>
          <h2 id="use-heading" style={subheadingStyle}>Use of This Site</h2>
          <p style={bodyStyle}>
            [LEGAL REVIEW REQUIRED — describe permitted use of the platform,
            prohibited conduct, and account responsibilities.]
          </p>
        </section>

        <section aria-labelledby="age-heading" style={sectionStyle}>
          <h2 id="age-heading" style={subheadingStyle}>Age Requirements</h2>
          <p style={bodyStyle}>
            Access to the cannabis wellness section requires confirmation that you are 19 years
            of age or older. Access to the fireworks section requires confirmation that you are
            18 years of age or older. These confirmations are session-scoped and logged for
            compliance purposes.
          </p>
        </section>

        <section aria-labelledby="content-heading" style={sectionStyle}>
          <h2 id="content-heading" style={subheadingStyle}>Content & Inventory</h2>
          <p style={bodyStyle}>
            [LEGAL REVIEW REQUIRED — describe limitations on item descriptions,
            pricing accuracy, and product availability.]
          </p>
        </section>

        <section aria-labelledby="liability-heading" style={sectionStyle}>
          <h2 id="liability-heading" style={subheadingStyle}>Limitation of Liability</h2>
          <p style={bodyStyle}>
            [LEGAL REVIEW REQUIRED — describe limitation of liability and disclaimer of warranties.]
          </p>
        </section>

        <section aria-labelledby="contact-heading" style={sectionStyle}>
          <h2 id="contact-heading" style={subheadingStyle}>Contact Us</h2>
          <p style={bodyStyle}>
            Questions about these terms?{' '}
            <Link to="/contact" style={linkStyle}>Contact The Pawn Shop</Link>.
          </p>
        </section>

        <p style={footerStyle}>
          <Link to="/privacy" style={linkStyle}>Privacy Policy</Link>
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
