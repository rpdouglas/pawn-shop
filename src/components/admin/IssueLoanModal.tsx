import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import SignaturePad from 'signature_pad'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useIssueLoanTicket, useSignPawnAgreement } from '../../lib/useLoanTickets'
import { useAuth } from '../../context/AuthContext'
import { formatPrice, formatDate } from '../../lib/format'
import type { PrintTicketData } from '../../lib/types'

const AGREEMENT_VERSION = 'v2.0'

// Applicable rate caps for Akwesasne (Ontario side).
// Loans under $1,000 CAD: max 48% APR. Loans $1,000 and over: max 35% APR.
const APR_CAP_UNDER_1000 = 0.48
const APR_CAP_OVER_1000  = 0.35
const LOAN_THRESHOLD_CENTS = 100_000 // $1,000.00

function calcMaxRatePct(amountCents: number, days: number): number {
  if (amountCents <= 0 || days <= 0) return 0
  const aprCap = amountCents < LOAN_THRESHOLD_CENTS ? APR_CAP_UNDER_1000 : APR_CAP_OVER_1000
  return parseFloat((aprCap * (days / 365) * 100).toFixed(2))
}

type Step = 'terms' | 'sign' | 'done'

interface IssuedLoanData {
  loanTicketId: string
  ticketNumber: string
  loanAmountCents: number
  interestRate: number
  periodDays: number
  dueDate: Date
  agreedItemValueCents: number
}

interface IssueLoanModalProps {
  isOpen: boolean
  onClose: () => void
  pawnRequestId: string | null
  itemDescription: string
  serialNumber?: string
  itemCategory?: string
  itemMake?: string
  itemModel?: string
  itemColour?: string
  condition?: string
  notableMarkings?: string
  onReadyToPrint?: (data: PrintTicketData) => void
}

export default function IssueLoanModal({
  isOpen,
  onClose,
  pawnRequestId,
  itemDescription,
  serialNumber,
  itemCategory,
  itemMake,
  itemModel,
  itemColour,
  condition,
  notableMarkings,
  onReadyToPrint,
}: IssueLoanModalProps) {
  const { mutateAsync: issueLoan } = useIssueLoanTicket()
  const { mutateAsync: signAgreement } = useSignPawnAgreement()
  const { user } = useAuth()

  const [step, setStep] = useState<Step>('terms')
  const [loanAmountDollars, setLoanAmountDollars] = useState('')
  const [periodDays, setPeriodDays] = useState('30')
  const [interestRatePct, setInterestRatePct] = useState('')
  const [agreedItemValueDollars, setAgreedItemValueDollars] = useState('')
  const [idType, setIdType] = useState('')
  const [idVerified, setIdVerified] = useState(false)
  const [itemReceived, setItemReceived] = useState(false)
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
    setInterestRatePct('')
    setAgreedItemValueDollars('')
    setIdType('')
    setIdVerified(false)
    setItemReceived(false)
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
    const agreedValueCents = Math.round(parseFloat(agreedItemValueDollars) * 100)

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
    const maxRate = calcMaxRatePct(amountCents, days)
    if (maxRate > 0 && ratePct > maxRate) {
      const aprLabel = amountCents < LOAN_THRESHOLD_CENTS ? '48% APR — loans under $1,000' : '35% APR — loans $1,000 and over'
      setError(`Rate exceeds the legal maximum of ${maxRate}% (${aprLabel})`)
      return
    }
    if (!agreedItemValueDollars || isNaN(agreedValueCents) || agreedValueCents <= 0) {
      setError('Enter the agreed item value')
      return
    }
    if (!idVerified) {
      setError("Confirm you have verified the customer's government-issued photo ID")
      return
    }
    if (!itemReceived) {
      setError('Confirm the item has been physically received and is in the shop\'s possession')
      return
    }

    setLoading(true)
    setError('')
    try {
      const result = await issueLoan({
        pawnRequestId,
        loanAmount: amountCents,
        periodDays: days,
        interestRate: ratePct / 100,
        agreedItemValue: agreedValueCents,
        idType: idType || undefined,
        idVerified: true,
      })
      setIssuedData({
        loanTicketId: result.loanTicketId,
        ticketNumber: result.ticketNumber,
        loanAmountCents: amountCents,
        interestRate: ratePct / 100,
        periodDays: days,
        dueDate: new Date(result.dueDate),
        agreedItemValueCents: agreedValueCents,
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
      staffName: user?.displayName ?? undefined,
      serialNumber,
      agreedItemValueCents: issuedData.agreedItemValueCents,
      itemCategory,
      itemMake,
      itemModel,
      itemColour,
      condition,
      notableMarkings,
    })
  }, [issuedData, itemDescription, customerName, signatureUrl, onReadyToPrint, user, serialNumber, itemCategory, itemMake, itemModel, itemColour, condition, notableMarkings])

  const capLabel = useMemo(() => {
    const amountCents = Math.round(parseFloat(loanAmountDollars) * 100)
    const days = parseInt(periodDays, 10)
    const max = calcMaxRatePct(amountCents, days)
    if (max <= 0) return null
    const aprPct = amountCents < LOAN_THRESHOLD_CENTS ? 48 : 35
    return `Max for this loan: ${max}% (${aprPct}% APR)`
  }, [loanAmountDollars, periodDays])

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
              onChange={e => {
                setLoanAmountDollars(e.target.value)
                const max = calcMaxRatePct(Math.round(parseFloat(e.target.value) * 100), parseInt(periodDays, 10))
                if (max > 0) setInterestRatePct(String(max))
              }}
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
              onChange={e => {
                setPeriodDays(e.target.value)
                const max = calcMaxRatePct(Math.round(parseFloat(loanAmountDollars) * 100), parseInt(e.target.value, 10))
                if (max > 0) setInterestRatePct(String(max))
              }}
              disabled={loading}
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="issue-loan-rate">Interest Rate — per loan period (%)</label>
            <input
              id="issue-loan-rate"
              type="number"
              min="0"
              step="0.01"
              className="input-field"
              style={{ minHeight: '48px' }}
              value={interestRatePct}
              onChange={e => setInterestRatePct(e.target.value)}
              disabled={loading}
              placeholder="Enter amount and term to calculate"
            />
            {capLabel && (
              <p style={{
                marginTop: 'var(--space-1)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
              }}>
                {capLabel}
              </p>
            )}
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="issue-loan-agreed-value">Agreed Item Value (CAD $) *</label>
            <input
              id="issue-loan-agreed-value"
              type="number"
              min="0"
              step="0.01"
              className="input-field"
              style={{ minHeight: '48px' }}
              value={agreedItemValueDollars}
              onChange={e => setAgreedItemValueDollars(e.target.value)}
              placeholder="Appraised / agreed value"
              disabled={loading}
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="issue-loan-id-type">ID Type Verified</label>
            <select
              id="issue-loan-id-type"
              className="input-field input-field-select"
              style={{ minHeight: '48px' }}
              value={idType}
              onChange={e => setIdType(e.target.value)}
              disabled={loading}
            >
              <option value="">Select ID type…</option>
              <option value="drivers_licence">Driver&apos;s Licence</option>
              <option value="status_card">Status Card</option>
              <option value="passport">Passport</option>
              <option value="other">Other Government ID</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minHeight: '48px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
              <input
                type="checkbox"
                checked={idVerified}
                onChange={e => setIdVerified(e.target.checked)}
                disabled={loading}
                style={{ width: '20px', height: '20px', flexShrink: 0 }}
              />
              I have verified the customer&apos;s government-issued photo ID *
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minHeight: '48px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
              <input
                type="checkbox"
                checked={itemReceived}
                onChange={e => setItemReceived(e.target.checked)}
                disabled={loading}
                style={{ width: '20px', height: '20px', flexShrink: 0 }}
              />
              The item is physically in the shop&apos;s possession *
            </label>
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
            <div>Amount: {formatPrice(issuedData.loanAmountCents)} · Rate: {(issuedData.interestRate * 100).toFixed(2)}% · Term: {issuedData.periodDays} days</div>
            <div>Due: {formatDate(issuedData.dueDate)} · Redemption: {formatPrice(redemptionCents)}</div>
            <div>Agreed Value: {formatPrice(issuedData.agreedItemValueCents)}</div>
          </div>

          <div style={{
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
          }}>
            <p style={{ margin: 0, marginBottom: 'var(--space-2)' }}>
              By signing, the customer confirms they are 18 or older, the lawful owner of the item, and not under the influence of alcohol or drugs. The item is left as security for this loan and will be returned on full repayment. In the event of default, the lender&apos;s only remedy is seizure of the pledged item — no further legal action will be pursued.
            </p>
            <p style={{ margin: 0 }}>
              Ticket No. {issuedData.ticketNumber} is proof of this agreement and must be presented with valid photo ID for redemption.
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
