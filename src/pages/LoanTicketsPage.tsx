import { useState } from 'react'
import { useCustomerLoanTickets } from '../lib/useLoanTickets'
import type { LoanTicket } from '../lib/types'
import LoanTicketCard from '../components/pawn/LoanTicketCard'
import ExtensionRequestModal from '../components/pawn/ExtensionRequestModal'
import ProtectedRoute from '../components/auth/ProtectedRoute'

export default function LoanTicketsPage() {
  const { data: tickets, isLoading, error } = useCustomerLoanTickets()
  const [selectedTicket, setSelectedTicket] = useState<LoanTicket | null>(null)

  return (
    <ProtectedRoute>
      <LoanTicketsPageContent
        tickets={tickets}
        isLoading={isLoading}
        error={error}
        selectedTicket={selectedTicket}
        setSelectedTicket={setSelectedTicket}
      />
    </ProtectedRoute>
  )
}

interface LoanTicketsPageContentProps {
  tickets: LoanTicket[] | undefined
  isLoading: boolean
  error: unknown
  selectedTicket: LoanTicket | null
  setSelectedTicket: (ticket: LoanTicket | null) => void
}

function LoanTicketsPageContent({ tickets, isLoading, error, selectedTicket, setSelectedTicket }: LoanTicketsPageContentProps) {

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif text-stone-900 mb-8">My Pawn Loans</h1>
        <p className="text-stone-600">Loading your loans...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif text-stone-900 mb-8">My Pawn Loans</h1>
        <p className="text-red-600">Error loading loans: {(error as Error).message}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif text-stone-900 mb-8">My Pawn Loans</h1>
      
      {!tickets || tickets.length === 0 ? (
        <p className="text-stone-600">You do not have any active or past pawn loans.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tickets.map((ticket: LoanTicket) => (
            <LoanTicketCard 
              key={ticket.id} 
              ticket={ticket} 
              onRequestExtension={() => setSelectedTicket(ticket)}
            />
          ))}
        </div>
      )}

      <ExtensionRequestModal 
        isOpen={!!selectedTicket} 
        onClose={() => setSelectedTicket(null)} 
        ticket={selectedTicket} 
      />
    </div>
  )
}
