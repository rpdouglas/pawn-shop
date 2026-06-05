import { useState } from 'react'
import { formatPrice, formatDate } from '../../lib/format'
import type { LoanTicket } from '../../lib/types'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

interface LoanTicketCardProps {
  ticket: LoanTicket
  onRequestExtension?: () => void
}

export default function LoanTicketCard({ ticket, onRequestExtension }: LoanTicketCardProps) {
  const [now] = useState(() => Date.now())
  const isOverdue = ticket.dueDate.getTime() < now
  const canExtend = ticket.status === 'active'

  return (
    <div className="card p-6 min-h-[48px]">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-sans text-xl font-medium text-stone-900">{ticket.itemDescription}</h3>
        <Badge variant={ticket.status === 'active' && isOverdue ? 'error' : ticket.status}>
          {ticket.status === 'extension_requested' ? 'Pending' : ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
        </Badge>
      </div>

      <div className="space-y-2 text-stone-600 mb-6">
        <div className="flex justify-between">
          <span>Loan Amount</span>
          <span className="font-medium text-stone-900">{formatPrice(ticket.loanAmount)}</span>
        </div>
        <div className="flex justify-between">
          <span>Due Date</span>
          <span className={`font-medium ${isOverdue && ticket.status === 'active' ? 'text-red-700' : 'text-stone-900'}`}>
            {formatDate(ticket.dueDate)}
          </span>
        </div>
      </div>

      {onRequestExtension && (
        <Button 
          variant="secondary" 
          className="w-full min-h-[48px]" 
          onClick={onRequestExtension}
          disabled={!canExtend}
        >
          {canExtend ? 'Request Extension' : 'Extension Unavailable'}
        </Button>
      )}
    </div>
  )
}
