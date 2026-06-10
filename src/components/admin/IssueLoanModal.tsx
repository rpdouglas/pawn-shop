import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import { useIssueLoanTicket } from '../../lib/useLoanTickets'

interface IssueLoanModalProps {
  isOpen: boolean
  onClose: () => void
  pawnRequestId: string | null
  itemDescription: string
}

export default function IssueLoanModal({ isOpen, onClose, pawnRequestId, itemDescription }: IssueLoanModalProps) {
  const { mutateAsync: issueLoan } = useIssueLoanTicket()

  const [loanAmountDollars, setLoanAmountDollars] = useState('')
  const [periodDays, setPeriodDays] = useState('30')
  const [interestRatePct, setInterestRatePct] = useState('5')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [issuedTicketId, setIssuedTicketId] = useState<string | null>(null)

  const handleClose = () => {
    setLoanAmountDollars('')
    setPeriodDays('30')
    setInterestRatePct('5')
    setLoading(false)
    setError('')
    setIssuedTicketId(null)
    onClose()
  }

  const handleSubmit = async () => {
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
      const result = await issueLoan({
        pawnRequestId,
        loanAmount: amountCents,
        periodDays: days,
        interestRate: ratePct / 100,
      })
      setIssuedTicketId(result.loanTicketId)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (!pawnRequestId) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Issue Pawn Loan">
      {issuedTicketId ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text)' }}>
            Loan issued successfully.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Ticket ID: <strong>{issuedTicketId}</strong>
          </p>
          <Button onClick={handleClose} style={{ minHeight: '48px' }}>
            Done
          </Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-base)', color: 'var(--color-text-muted)' }}>
            Issuing loan for: <strong style={{ color: 'var(--color-text)' }}>{itemDescription}</strong>
          </p>

          <div className="input-wrapper">
            <label className="input-label" htmlFor="issue-loan-amount">
              Loan Amount (CAD $)
            </label>
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
            <label className="input-label" htmlFor="issue-loan-term">
              Loan Term (days)
            </label>
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
            <label className="input-label" htmlFor="issue-loan-rate">
              Interest Rate (%)
            </label>
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

          {error && (
            <p className="input-error" role="alert">{error}</p>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-4)', paddingTop: 'var(--space-2)' }}>
            <Button
              variant="secondary"
              onClick={handleClose}
              style={{ flex: 1, minHeight: '48px' }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              style={{ flex: 1, minHeight: '48px' }}
              disabled={loading}
            >
              {loading ? 'Issuing…' : 'Issue Loan'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
