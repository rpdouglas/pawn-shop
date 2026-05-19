import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth'
import type { AuthError } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, functions } from '../../lib/firebase-core'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

const CONSENT_VERSION = '2026-05-01'

interface RecordLoginData { method: 'email' | 'google' }

const recordLoginFn = httpsCallable<RecordLoginData, void>(functions, 'recordLogin')

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    default:
      return 'Account creation failed. Please try again.'
  }
}

export default function SignUpPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [consentChecked, setConsentChecked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect already-authenticated users
  useEffect(() => {
    if (!loading && user) navigate('/pawn', { replace: true })
  }, [user, loading, navigate])

  function validate(): string | null {
    if (!name.trim()) return 'Enter your name.'
    if (password.length < 6) return 'Password must be at least 6 characters.'
    if (password !== confirm) return 'Passwords do not match.'
    if (!consentChecked) return 'You must agree to the Privacy Policy and Terms of Use to create an account.'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }
    setSubmitting(true)
    setError(null)
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(credential.user, { displayName: name.trim() })
      try {
        await recordLoginFn({ method: 'email' })
      } catch {
        // Non-fatal — audit log failure is logged server-side
      }
      // Write PIPEDA consent after recordLoginFn creates the users/{uid} document
      try {
        await setDoc(
          doc(db, 'users', credential.user.uid),
          { consentAcceptedAt: serverTimestamp(), consentVersion: CONSENT_VERSION },
          { merge: true },
        )
      } catch {
        // Non-fatal — ConsentBanner will prompt on next session if this write fails
      }
      navigate('/pawn', { replace: true })
    } catch (err) {
      setError(friendlyError((err as AuthError).code))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={headingStyle}>Create account</h1>
        <form onSubmit={handleSubmit} style={formStyle}>
          <Input
            id="name"
            label="Your name"
            value={name}
            onChange={setName}
            type="text"
            autoComplete="name"
            placeholder="Your name"
            disabled={submitting}
            autoFocus
          />
          <Input
            id="email"
            label="Email address"
            value={email}
            onChange={setEmail}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={submitting}
          />
          <Input
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            disabled={submitting}
          />
          <Input
            id="confirm"
            label="Confirm password"
            value={confirm}
            onChange={setConfirm}
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            error={error ?? undefined}
            disabled={submitting}
          />
          <label style={consentLabelStyle}>
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              disabled={submitting}
              style={{ width: '20px', height: '20px', flexShrink: 0, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              I have read and agree to the{' '}
              <Link to="/privacy" style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}>Privacy Policy</Link>
              {' '}and{' '}
              <Link to="/terms" style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}>Terms of Use</Link>.
            </span>
          </label>
          <Button
            type="submit"
            size="lg"
            disabled={submitting || !name || !email || !password || !confirm || !consentChecked}
            style={fullWidth}
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
        <p style={footerStyle}>
          Already have an account?{' '}
          <Link to="/login" style={linkStyle}>
            Sign in
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

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
}

const fullWidth: React.CSSProperties = { width: '100%' }

const consentLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 'var(--space-3)',
  cursor: 'pointer',
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
