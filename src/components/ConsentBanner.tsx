import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

const CONSENT_VERSION = '2026-05-01'

export default function ConsentBanner() {
  const { user } = useAuth()
  const [showBanner, setShowBanner] = useState(false)
  const [acknowledging, setAcknowledging] = useState(false)

  useEffect(() => {
    if (!user) return
    const uid = user.uid
    getDoc(doc(db, 'users', uid))
      .then((snap) => {
        if (!snap.exists()) return
        const data = snap.data() as Record<string, unknown>
        if (!data['consentAcceptedAt']) setShowBanner(true)
      })
      .catch(() => { /* non-critical — banner will appear on next session */ })
  }, [user])

  if (!showBanner) return null

  const handleAcknowledge = async () => {
    if (!user || acknowledging) return
    setAcknowledging(true)
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        { consentAcceptedAt: serverTimestamp(), consentVersion: CONSENT_VERSION },
        { merge: true },
      )
      setShowBanner(false)
    } catch {
      // Non-critical — banner stays visible; user can retry
    } finally {
      setAcknowledging(false)
    }
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-4)',
        padding: 'var(--space-3) var(--space-8)',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        flexWrap: 'wrap',
      }}
    >
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-small)',
        color: 'var(--color-text-muted)',
        margin: 0,
        lineHeight: 1.5,
      }}>
        We've updated our{' '}
        <Link to="/privacy" style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}>Privacy Policy</Link>
        {' '}and{' '}
        <Link to="/terms" style={{ color: 'var(--color-text-muted)', textDecoration: 'underline' }}>Terms of Use</Link>.
        {' '}Please review them.
      </p>
      <button
        onClick={handleAcknowledge}
        disabled={acknowledging}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-small)',
          color: 'var(--color-text)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-2) var(--space-4)',
          cursor: acknowledging ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
          minHeight: '44px',
        }}
        aria-label="Acknowledge privacy policy update"
      >
        {acknowledging ? 'Saving…' : 'I acknowledge'}
      </button>
    </div>
  )
}
