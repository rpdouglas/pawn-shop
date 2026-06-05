import Modal from '../ui/Modal'
import Button from '../ui/Button'
import type { LoanTicket } from '../../lib/types'
import { formatPrice } from '../../lib/format'
import { useRequestExtension } from '../../lib/useLoanTickets'
import { useState } from 'react'

interface ExtensionRequestModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: LoanTicket | null
}

export default function ExtensionRequestModal({ isOpen, onClose, ticket }: ExtensionRequestModalProps) {
  const { mutateAsync: requestExtension } = useRequestExtension()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!ticket) return null

  const handleConfirm = async () => {
    setLoading(true)
    setError('')
    try {
      await requestExtension(ticket.id)
      onClose()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Loan Extension">
      <div className="space-y-4">
        <p className="text-stone-600">
          You are requesting an extension for your pawn loan on <strong>{ticket.itemDescription}</strong>.
        </p>
        <p className="text-stone-600">
          Our staff will review your request and get back to you shortly. You may need to visit the store to pay the interest fee of <strong>{formatPrice(Math.round(ticket.loanAmount * ticket.interestRate))}</strong>.
        </p>
        
        {error && <p className="text-red-600">{error}</p>}
        
        <div className="flex gap-4 pt-4">
          <Button variant="secondary" onClick={onClose} className="flex-1 min-h-[48px]" disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} className="flex-1 min-h-[48px]" disabled={loading}>
            {loading ? 'Requesting...' : 'Confirm Request'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
