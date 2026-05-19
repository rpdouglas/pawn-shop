import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  multiFactor,
  TotpMultiFactorGenerator,
} from 'firebase/auth'
import type { AuthError, TotpSecret } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '../../lib/firebase-core'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

type EnrollStep = 'loading' | 'show-key' | 'verify' | 'error'

const recordMfaEnrolledFn = httpsCallable(functions, 'recordMfaEnrolled')

export default function MfaEnrollPage() {
  const { user, loading, refreshUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/pawn'

  const [step, setStep] = useState<EnrollStep>('loading')
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null)
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Non-staff or already-enrolled users should not be here
  useEffect(() => {
    if (loading) return
    if (!user) { navigate('/login', { replace: true }); return }
    if (!user.isStaff) { navigate('/pawn', { replace: true }); return }
    if (user.isMfaEnrolled) { navigate(from, { replace: true }); return }
  }, [user, loading, navigate, from])

  // Generate TOTP secret on mount (requires Identity Platform on production)
  useEffect(() => {
    if (loading || !user?.isStaff || user.isMfaEnrolled) return

    const firebaseUser = auth.currentUser
    if (!firebaseUser) return

    multiFactor(firebaseUser)
      .getSession()
      .then((session) => TotpMultiFactorGenerator.generateSecret(session))
      .then((secret) => {
        setTotpSecret(secret)
        setOtpauthUrl(
          secret.generateQrCodeUrl(firebaseUser.email ?? 'Staff', 'The Pawn Shop'),
        )
        setStep('show-key')
      })
      .catch(() => {
        setError(
          'Could not start MFA setup. Make sure Firebase Identity Platform is enabled for this project.',
        )
        setStep('error')
      })
  }, [loading, user])

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault()
    if (!totpSecret || !auth.currentUser) return
    setSubmitting(true)
    setError(null)
    try {
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
        totpSecret,
        verificationCode,
      )
      await multiFactor(auth.currentUser).enroll(assertion, 'The Pawn Shop Staff TOTP')
      await recordMfaEnrolledFn({})
      await refreshUser()
      navigate(from, { replace: true })
    } catch (err) {
      const code = (err as AuthError).code
      if (code === 'auth/invalid-verification-code') {
        setError('Incorrect code. Check your authenticator app and try again.')
      } else {
        setError('Enrollment failed. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || step === 'loading') {
    return (
      <div style={pageStyle}>
        <p style={mutedText}>Setting up two-factor authentication…</p>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={headingStyle}>Setup unavailable</h1>
          <p style={subtextStyle}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Set up two-factor authentication</h1>
        <p style={subtextStyle}>
          Staff accounts require a time-based one-time password (TOTP). Open your
          authenticator app — Google Authenticator, Authy, or 1Password — and add a
          new account manually using the key below.
        </p>

        {step === 'show-key' && totpSecret && (
          <>
            <div style={keyBoxStyle}>
              <span style={keyLabelStyle}>Secret key</span>
              <code style={keyTextStyle}>{totpSecret.secretKey}</code>
            </div>

            {otpauthUrl && (
              <p style={linkHintStyle}>
                Or open this link directly in your authenticator app:{' '}
                <a href={otpauthUrl} style={otpauthLinkStyle}>
                  otpauth link
                </a>
              </p>
            )}

            <Button
              variant="secondary"
              size="md"
              style={{ width: '100%', marginBottom: '24px' }}
              onClick={() => setStep('verify')}
            >
              I have added the key — continue
            </Button>
          </>
        )}

        {step === 'verify' && (
          <form onSubmit={handleEnroll} style={formStyle}>
            <Input
              id="totp-code"
              label="Enter the 6-digit code from your app"
              value={verificationCode}
              onChange={setVerificationCode}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              error={error ?? undefined}
              disabled={submitting}
              autoFocus
            />
            <Button
              type="submit"
              size="lg"
              disabled={submitting || verificationCode.length < 6}
              style={{ width: '100%' }}
            >
              {submitting ? 'Verifying…' : 'Confirm and activate'}
            </Button>
            <button
              type="button"
              onClick={() => { setStep('show-key'); setError(null); setVerificationCode('') }}
              style={backLinkStyle}
            >
              Back to key
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 16px',
}

const cardStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '480px',
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: '40px 32px',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '24px',
  color: 'var(--color-text)',
  marginBottom: '16px',
}

const subtextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '15px',
  color: 'var(--color-text-muted)',
  marginBottom: '28px',
  lineHeight: 1.6,
}

const mutedText: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '15px',
  color: 'var(--color-text-muted)',
}

const keyBoxStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  padding: '16px',
  marginBottom: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

const keyLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const keyTextStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '16px',
  color: 'var(--color-primary)',
  wordBreak: 'break-all',
  userSelect: 'all',
}

const linkHintStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  marginBottom: '20px',
}

const otpauthLinkStyle: React.CSSProperties = {
  color: 'var(--color-primary)',
  textDecoration: 'none',
}

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
}

const backLinkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  cursor: 'pointer',
  padding: '12px 0',
  textAlign: 'left',
  minHeight: '48px',
}
