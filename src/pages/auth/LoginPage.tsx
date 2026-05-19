import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  getMultiFactorResolver,
  TotpMultiFactorGenerator,
} from 'firebase/auth'
import type { AuthError, MultiFactorError, MultiFactorResolver } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { auth, functions } from '../../lib/firebase-core'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

type LoginStep = 'credentials' | 'mfa-challenge'

interface RecordLoginData { method: 'email' | 'google' }

const recordLoginFn = httpsCallable<RecordLoginData, void>(functions, 'recordLogin')

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.'
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts. Try again later.'
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.'
    case 'auth/invalid-verification-code':
      return 'Incorrect code. Check your authenticator app and try again.'
    default:
      return 'Sign in failed. Please try again.'
  }
}

export default function LoginPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/pawn'

  const [step, setStep] = useState<LoginStep>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null)
  const [loginMethod, setLoginMethod] = useState<'email' | 'google'>('email')

  // Redirect already-authenticated users
  useEffect(() => {
    if (!loading && user) navigate(from, { replace: true })
  }, [user, loading, navigate, from])

  async function afterSignIn(method: 'email' | 'google') {
    try {
      await recordLoginFn({ method })
    } catch {
      // Non-fatal — sign-in already succeeded; audit log failure is logged server-side
    }
    navigate(from, { replace: true })
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      await afterSignIn('email')
    } catch (err) {
      const authErr = err as AuthError
      if (authErr.code === 'auth/multi-factor-auth-required') {
        setLoginMethod('email')
        setMfaResolver(getMultiFactorResolver(auth, err as MultiFactorError))
        setStep('mfa-challenge')
      } else {
        setError(friendlyError(authErr.code))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleSignIn() {
    setSubmitting(true)
    setError(null)
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      await afterSignIn('google')
    } catch (err) {
      const authErr = err as AuthError
      if (authErr.code === 'auth/multi-factor-auth-required') {
        setLoginMethod('google')
        setMfaResolver(getMultiFactorResolver(auth, err as MultiFactorError))
        setStep('mfa-challenge')
      } else if (authErr.code !== 'auth/popup-closed-by-user') {
        setError(friendlyError(authErr.code))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!mfaResolver) return
    setSubmitting(true)
    setError(null)
    try {
      const totpHint = mfaResolver.hints.find(
        (h) => h.factorId === TotpMultiFactorGenerator.FACTOR_ID,
      )
      if (!totpHint) {
        setError('No authenticator factor found. Contact support.')
        return
      }
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(totpHint.uid, totpCode)
      await mfaResolver.resolveSignIn(assertion)
      await afterSignIn(loginMethod)
    } catch (err) {
      setError(friendlyError((err as AuthError).code))
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'mfa-challenge') {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h1 style={headingStyle}>Two-step verification</h1>
          <p style={subtextStyle}>
            Open your authenticator app and enter the 6-digit code.
          </p>
          <form onSubmit={handleMfaSubmit} style={formStyle}>
            <Input
              id="totp-code"
              label="Verification code"
              value={totpCode}
              onChange={setTotpCode}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              maxLength={6}
              error={error ?? undefined}
              disabled={submitting}
              autoFocus
            />
            <Button type="submit" size="lg" disabled={submitting || totpCode.length < 6} style={fullWidth}>
              {submitting ? 'Verifying…' : 'Verify'}
            </Button>
          </form>
          <button
            onClick={() => { setStep('credentials'); setError(null); setTotpCode('') }}
            style={backLinkStyle}
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Sign in</h1>
        <form onSubmit={handleEmailSignIn} style={formStyle}>
          <Input
            id="email"
            label="Email address"
            value={email}
            onChange={setEmail}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={submitting}
            autoFocus
          />
          <Input
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={error ?? undefined}
            disabled={submitting}
          />
          <Button type="submit" size="lg" disabled={submitting || !email || !password} style={fullWidth}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <div style={dividerStyle}>
          <span style={dividerTextStyle}>or</span>
        </div>
        <Button
          variant="secondary"
          size="lg"
          onClick={handleGoogleSignIn}
          disabled={submitting}
          style={fullWidth}
        >
          Continue with Google
        </Button>
        <p style={footerStyle}>
          No account?{' '}
          <Link to="/signup" style={linkStyle}>
            Create one
          </Link>
        </p>
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
  maxWidth: '400px',
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: '40px 32px',
}

const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: '28px',
  color: 'var(--color-text)',
  marginBottom: '24px',
}

const subtextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '15px',
  color: 'var(--color-text-muted)',
  marginBottom: '24px',
  lineHeight: 1.6,
}

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
}

const fullWidth: React.CSSProperties = { width: '100%' }

const dividerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  margin: '24px 0',
  gap: '12px',
}

const dividerTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'var(--color-text-muted)',
  flexShrink: 0,
}

const footerStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  color: 'var(--color-text-muted)',
  textAlign: 'center',
  marginTop: '24px',
}

const linkStyle: React.CSSProperties = {
  color: 'var(--color-primary)',
  textDecoration: 'none',
}

const backLinkStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-text-muted)',
  fontFamily: 'var(--font-body)',
  fontSize: '14px',
  cursor: 'pointer',
  padding: '12px 0',
  display: 'block',
  marginTop: '8px',
  minHeight: '48px',
  textAlign: 'left',
}
