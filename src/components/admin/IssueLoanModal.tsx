import { useState, useRef, useEffect, useCallback } from 'react'
import SignaturePad from 'signature_pad'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useIssueLoanTicket, useSignPawnAgreement } from '../../lib/useLoanTickets'
import { formatPrice, formatDate } from '../../lib/format'
import type { PrintTicketData } from '../../lib/types'

const AGREEMENT_VERSION = 'v1.0'

type Step = 'terms' | 'sign' | 'done'

interface IssuedLoanData {
  loanTicketId: string
  ticketNumber: string
  loanAmountCents: number
  interestRate: number
  periodDays: number
  dueDate: Date
}

interface IssueLoanModalProps {
  isOpen: boolean
  onClose: () => void
  pawnRequestId: string | null
  itemDescription: string
  onReadyToPrint?: (data: PrintTicketData) => void
}

export default function IssueLoanModal({
  isOpen,
  onClose,
  pawnRequestId,
  itemDescription,
  onReadyToPrint,
}: IssueLoanModalProps) {
  const { mutateAsync: issueLoan } = useIssueLoanTicket()
  const { mutateAsync: signAgreement } = useSignPawnAgreement()

  const [step, setStep] = useState<Step>('terms')
  const [loanAmountDollars, setLoanAmountDollars] = useState('')
  const [periodDays, setPeriodDays] = useState('30')
  const [interestRatePct, setInterestRatePct] = useState('5')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [issuedData, setIssuedData] = useState<IssuedLoanData | null>(null)
  const [customerName, setCustomerName] = useState('')
  const [signatureEmpty, setSignatureEmpty] = useState(true)
  const [signatureUrl, setSignatureUrl] = useState('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const padRef = useRef<SignaturePad | null>(null)

  useEffect(() => {
    if (step !== 'sign') return

    const frame = requestAnimationFrame(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(ratio, ratio)

      const pad = new SignaturePad(canvas, { backgroundColor: 'rgb(255, 255, 255)' })
      pad.addEventListener('endStroke', () => setSignatureEmpty(pad.isEmpty()))
      padRef.current = pad
      setSignatureEmpty(true)
    })

    return () => {
      cancelAnimationFrame(frame)
      padRef.current?.off()
      padRef.current = null
    }
  }, [step])

  const resetState = useCallback(() => {
    setStep('terms')
    setIssuedData(null)
    setLoanAmountDollars('')
    setPeriodDays('30')
    setInterestRatePct('5')
    setLoading(false)
    setError('')
    setCustomerName('')
    setSignatureEmpty(true)
    setSignatureUrl('')
    padRef.current?.clear()
  }, [])

  const handleClose = useCallback(() => {
    resetState()
    onClose()
  }, [resetState, onClose])

  const handleIssueLoan = async () => {
    if (!pawnRequestId) return
    const amountCents = Math.round(parseFloat(loanAmountDollars) * 100)
    const days = parseInt(periodDays, 10)
    const ratePct = parseFloat(interestRatePct)

    if (!loanAmountDollars || isNaN(amountCents) || amountCents <= 0) {
      setError('Enter a valid loan amount')
      return
    }
    if (isNaN(days) || days <= 0) {
      setError('Enter a valid term in days')
      return
    }
    if (isNaN(ratePct) || ratePct < 0) {
      setError('Enter a valid interest rate')
      return
    }

    setLoading(true)
    setError('')
    try {
      const result = await issueLoan({ pawnRequestId, loanAmount: amountCents, periodDays: days, interestRate: ratePct / 100 })
      setIssuedData({
        loanTicketId: result.loanTicketId,
        ticketNumber: result.ticketNumber,
        loanAmountCents: amountCents,
        interestRate: ratePct / 100,
        periodDays: days,
        dueDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      })
      setStep('sign')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSign = async () => {
    if (!issuedData || !padRef.current) return
    if (padRef.current.isEmpty()) {
      setError('Please sign before submitting')
      return
    }
    if (!customerName.trim()) {
      setError('Please enter the customer name')
      return
    }

    setLoading(true)
    setError('')
    try {
      const dataUrl = padRef.current.toDataURL('image/png')
      const result = await signAgreement({
        loanTicketId: issuedData.loanTicketId,
        signatureDataUrl: dataUrl,
        customerName: customerName.trim(),
        agreementVersion: AGREEMENT_VERSION,
      })
      setSignatureUrl(result.signatureUrl)
      setStep('done')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = useCallback(() => {
    if (!issuedData || !onReadyToPrint) return
    onReadyToPrint({
      ticketNumber: issuedData.ticketNumber,
      itemDescription,
      loanAmountCents: issuedData.loanAmountCents,
      interestRate: issuedData.interestRate,
      periodDays: issuedData.periodDays,
      dueDate: issuedData.dueDate,
      customerName,
      signatureUrl,
      issuedAt: new Date(),
    })
  }, [issuedData, itemDescription, customerName, signatureUrl, onReadyToPrint])

  if (!pawnRequestId) return null

  const redemptionCents = issuedData
    ? Math.round(issuedData.loanAmountCents * (1 + issuedData.interestRate))
    : 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 'terms' ? 'Issue Pawn Loan' :
        step === 'sign'  ? 'Sign Agreement' :
        'Loan Issued'
      }
    >
      {/* ── Step 1: Loan terms ───────────────────────────────────────────── */}
      {step === 'terms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
            Issuing loan for: <strong style={{ color: 'var(--color-text)' }}>{itemDescription}</strong>
          </p>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="issue-loan-amount">Loan Amount (CAD $)</label>
            <input
              id="issue-loan-amount"
              type="number"
              min="0"
              step="0.01"
              className="input-field"
              style={{ minHeight: '48px' }}
              value={loanAmountDollars}
              onChange={e => setLoanAmountDollars(e.target.value)}
              placeholder="e.g. 150.00"
              disabled={loading}
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="issue-loan-term">Loan Term (days)</label>
            <input
              id="issue-loan-term"
              type="number"
              min="1"
              className="input-field"
              style={{ minHeight: '48px' }}
              value={periodDays}
              onChange={e => setPeriodDays(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="issue-loan-rate">Interest Rate (%)</label>
            <input
              id="issue-loan-rate"
              type="number"
              min="0"
              step="0.1"
              className="input-field"
              style={{ minHeight: '48px' }}
              value={interestRatePct}
              onChange={e => setInterestRatePct(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && <p className="input-error" role="alert">{error}</p>}

          <div style={{ display: 'flex', gap: 'var(--space-4)', paddingTop: 'var(--space-2)' }}>
            <Button variant="secondary" onClick={handleClose} style={{ flex: 1, minHeight: '48px' }} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleIssueLoan} style={{ flex: 1, minHeight: '48px' }} disabled={loading}>
              {loading ? 'Issuing…' : 'Issue Loan'}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Sign agreement ───────────────────────────────────────── */}
      {step === 'sign' && issuedData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--space-1)',
            padding: 'var(--space-3)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text)',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>Loan Summary</div>
            <div>Item: {itemDescription}</div>
            <div>Amount: {formatPrice(issuedData.loanAmountCents)} · Rate: {(issuedData.interestRate * 100).toFixed(1)}% · Term: {issuedData.periodDays} days</div>
            <div>Due: {formatDate(issuedData.dueDate)} · Redemption: {formatPrice(redemptionCents)}</div>
          </div>

          <div style={{
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
          }}>
            <p style={{ margin: 0, marginBottom: 'var(--space-2)' }}>
              By signing, the customer agrees to leave the above item as security for this loan. The item will be returned upon full repayment of the redemption amount by the due date. Failure to redeem by the due date will result in the item becoming the property of The Pawn Shop.
            </p>
            <p style={{ margin: 0 }}>
              Ticket No. {issuedData.ticketNumber} is proof of this agreement and must be presented for redemption.
            </p>
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="sign-customer-name">Customer Full Name</label>
            <input
              id="sign-customer-name"
              type="text"
              className="input-field"
              style={{ minHeight: '48px' }}
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Full name as it appears on ID"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label" id="sig-label">Customer Signature</label>
            <canvas
              ref={canvasRef}
              aria-labelledby="sig-label"
              aria-label="Sign here with your finger or stylus"
              style={{
                width: '100%',
                height: '160px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--space-1)',
                cursor: 'crosshair',
                touchAction: 'none',
                display: 'block',
                background: '#fff',
              }}
            />
            <button
              type="button"
              onClick={() => { padRef.current?.clear(); setSignatureEmpty(true) }}
              style={{
                marginTop: 'var(--space-1)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                minHeight: '44px',
              }}
              disabled={loading}
            >
              Clear signature
            </button>
          </div>

          {error && <p className="input-error" role="alert">{error}</p>}

          <div style={{ display: 'flex', gap: 'var(--space-4)', paddingTop: 'var(--space-2)' }}>
            <Button variant="secondary" onClick={handleClose} style={{ flex: 1, minHeight: '48px' }} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSign}
              style={{ flex: 1, minHeight: '48px' }}
              disabled={loading || signatureEmpty || !customerName.trim()}
            >
              {loading ? 'Saving…' : 'Submit Signature'}
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Done ────────────────────────────────────────────────── */}
      {step === 'done' && issuedData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text)' }}>
            Agreement signed. Loan issued successfully.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Ticket No: <strong style={{ color: 'var(--color-text)' }}>{issuedData.ticketNumber}</strong>
          </p>
          {onReadyToPrint && (
            <Button onClick={handlePrint} style={{ minHeight: '48px' }}>
              Print Ticket
            </Button>
          )}
          <Button variant="secondary" onClick={handleClose} style={{ minHeight: '48px' }}>
            Done
          </Button>
        </div>
      )}
    </Modal>
  )
}
