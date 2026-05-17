import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../lib/firebase'
import Button from '../ui/Button'

interface LogAgeGateData {
  eventType: 'age_gate_pass' | 'age_gate_fail'
  viewTag: 'cannabis' | 'fireworks'
  policyVersion: string
}

const logAgeGateFn = httpsCallable<LogAgeGateData, { success: boolean }>(functions, 'logAgeGate')

const POLICY_VERSION = '1.0'

interface AgeGateProps {
  minAge: 18 | 19
  viewTag: 'cannabis' | 'fireworks'
  children: ReactNode
}

type GateState = 'pending' | 'passed' | 'denied'

function storageKey(v: string): string {
  return `age-gate-${v}`
}

export default function AgeGate({ minAge, viewTag, children }: AgeGateProps) {
  const [gateState, setGateState] = useState<GateState>(() => {
    try {
      return sessionStorage.getItem(storageKey(viewTag)) === 'passed' ? 'passed' : 'pending'
    } catch {
      return 'pending'
    }
  })
  const [processing, setProcessing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Focus the primary button when gate is visible
  useEffect(() => {
    if (gateState === 'pending' || gateState === 'denied') {
      const first = containerRef.current?.querySelector<HTMLButtonElement>('button:not([disabled]), a')
      first?.focus()
    }
  }, [gateState])

  if (gateState === 'passed') {
    return <>{children}</>
  }

  const handleConfirm = async () => {
    setProcessing(true)
    try {
      await logAgeGateFn({ eventType: 'age_gate_pass', viewTag, policyVersion: POLICY_VERSION })
    } catch {
      // Best-effort audit log — never block the user due to a CF failure
    }
    try {
      sessionStorage.setItem(storageKey(viewTag), 'passed')
    } catch {
      // sessionStorage may be blocked in some private browsers — proceed anyway
    }
    setGateState('passed')
    setProcessing(false)
  }

  const handleDeny = async () => {
    setProcessing(true)
    try {
      await logAgeGateFn({ eventType: 'age_gate_fail', viewTag, policyVersion: POLICY_VERSION })
    } catch {
      // Best-effort
    }
    setGateState('denied')
    setProcessing(false)
  }

  return (
    <div
      ref={containerRef}
      className="age-gate-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      {gateState === 'pending' ? (
        <>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 'var(--space-4)',
            margin: `0 0 var(--space-4)`,
          }}>
            The Pawn Shop
          </p>

          <h1
            id="age-gate-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-display)',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-4)',
              fontWeight: 400,
            }}
          >
            Age Verification
          </h1>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body)',
            color: 'var(--color-text-muted)',
            maxWidth: '400px',
            margin: `0 0 var(--space-8)`,
            lineHeight: 1.6,
          }}>
            You must be {minAge} or older to enter this section.
            Please confirm your age to continue.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            width: '100%',
            maxWidth: '320px',
          }}>
            <Button
              variant="primary"
              size="lg"
              onClick={handleConfirm}
              disabled={processing}
              aria-label={`I confirm I am ${minAge} or older`}
            >
              {processing ? 'Verifying…' : `I am ${minAge} or older`}
            </Button>
            <button
              className="btn btn-md"
              onClick={handleDeny}
              disabled={processing}
              aria-label={`I am under ${minAge}`}
              style={{ color: 'var(--color-text-muted)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              I am under {minAge}
            </button>
          </div>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-12)',
            maxWidth: '400px',
            lineHeight: 1.5,
          }}>
            Built with Canadian privacy standards. Your response is session-scoped and not stored beyond this visit.
          </p>
        </>
      ) : (
        <>
          <h1
            id="age-gate-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-heading)',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-4)',
              fontWeight: 400,
            }}
          >
            Access Restricted
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body)',
            color: 'var(--color-text-muted)',
            maxWidth: '360px',
            margin: `0 0 var(--space-8)`,
            lineHeight: 1.6,
          }}>
            This section is not available to you. You may continue browsing our other collections.
          </p>
          <Link to="/pawn" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="md">Return to main store</Button>
          </Link>
        </>
      )}
    </div>
  )
}
