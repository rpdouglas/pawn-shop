import { useState, useCallback } from 'react'
import { useAllLoanTickets, useProcessExtension, useRedeemLoan, useForfeitLoan } from '../../lib/useLoanTickets'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { formatPrice, formatDate } from '../../lib/format'
import type { LoanTicket, PrintTicketData } from '../../lib/types'
import Modal from '../../components/ui/Modal'
import PrintableTicket from '../../components/admin/PrintableTicket'

export default function LoanTicketsAdminPage() {
  const { data: tickets, isLoading, error } = useAllLoanTickets()
  const { mutateAsync: processExtension } = useProcessExtension()
  const { mutateAsync: redeemLoan } = useRedeemLoan()
  const { mutateAsync: forfeitLoan } = useForfeitLoan()

  const [processingTicket, setProcessingTicket] = useState<LoanTicket | null>(null)
  const [actionType, setActionType] = useState<'extension' | 'redeem' | 'forfeit' | null>(null)
  const [newDueDate, setNewDueDate] = useState('')
  const [printTicket, setPrintTicket] = useState<PrintTicketData | null>(null)

  const handlePrint = useCallback((ticket: LoanTicket) => {
    if (!ticket.signatureUrl || !ticket.ticketNumber || !ticket.customerName) return
    setPrintTicket({
      ticketNumber: ticket.ticketNumber,
      itemDescription: ticket.itemDescription,
      loanAmountCents: ticket.loanAmount,
      interestRate: ticket.interestRate,
      periodDays: ticket.periodDays,
      dueDate: ticket.dueDate,
      customerName: ticket.customerName,
      signatureUrl: ticket.signatureUrl,
      issuedAt: ticket.createdAt,
    })
  }, [])


  if (isLoading) return <div className="p-8 text-stone-500">Loading loans...</div>
  if (error) return <div className="p-8 text-red-600">Error: {(error as Error).message}</div>

  const handleProcess = async (approved: boolean) => {
    if (!processingTicket || actionType !== 'extension') return
    try {
      await processExtension({
        loanTicketId: processingTicket.id,
        approved,
        newDueDate: approved ? newDueDate : undefined
      })
      setProcessingTicket(null)
      setActionType(null)
      setNewDueDate('')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleRedeem = async () => {
    if (!processingTicket || actionType !== 'redeem') return
    try {
      const redemptionAmount = Math.round(processingTicket.loanAmount * (1 + processingTicket.interestRate))
      await redeemLoan({ loanTicketId: processingTicket.id, redemptionAmount })
      setProcessingTicket(null)
      setActionType(null)
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const handleForfeit = async () => {
    if (!processingTicket || actionType !== 'forfeit') return
    try {
      await forfeitLoan(processingTicket.id)
      setProcessingTicket(null)
      setActionType(null)
    } catch (err) {
      alert((err as Error).message)
    }
  }


  const columns = [
    { key: 'itemDescription' as const, header: 'Item' },
    { key: 'loanAmount' as const, header: 'Amount', render: (row: LoanTicket) => formatPrice(row.loanAmount) },
    { key: 'dueDate' as const, header: 'Due Date', render: (row: LoanTicket) => formatDate(row.dueDate) },
    { key: 'status' as const, header: 'Status', render: (row: LoanTicket) => (
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
        <Badge variant={row.status}>
          {row.status}
        </Badge>
        {row.signatureUrl
          ? <span className="badge badge-condition-new">Signed</span>
          : <span className="badge badge-tag">Unsigned</span>
        }
      </div>
    )},
    { key: 'id' as const, header: 'Actions', render: (row: LoanTicket) => (
      <div className="flex gap-2">
        {row.status === 'extension_requested' && (
          <Button size="sm" onClick={() => { setProcessingTicket(row); setActionType('extension'); }}>
            Review
          </Button>
        )}
        {row.status === 'active' && (
          <>
            <Button size="sm" variant="secondary" onClick={() => { setProcessingTicket(row); setActionType('redeem'); }}>
              Redeem
            </Button>
            <Button size="sm" variant="secondary" className="!border-red-600 !text-red-600 hover:!bg-red-50" onClick={() => { setProcessingTicket(row); setActionType('forfeit'); }}>
              Forfeit
            </Button>
          </>
        )}
        {row.signatureUrl && row.ticketNumber && (
          <Button size="sm" variant="secondary" onClick={() => handlePrint(row)}>
            Print
          </Button>
        )}
      </div>
    )}
  ]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableColumns: any = columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableData: any = tickets

  return (
    <div className="p-8">
      <h1 className="text-3xl font-serif text-stone-900 mb-8">Pawn Loans</h1>

      {(!tickets || tickets.length === 0) ? (
        <p className="text-stone-500">No active loans.</p>
      ) : (
        <Table columns={tableColumns} data={tableData} />
      )}

      <PrintableTicket data={printTicket} />

      <Modal
        isOpen={!!processingTicket && !!actionType}
        onClose={() => { setProcessingTicket(null); setActionType(null); }}
        title={
          actionType === 'extension' ? "Review Extension" :
          actionType === 'redeem' ? "Redeem Loan" :
          "Forfeit Loan"
        }
      >
        {processingTicket && actionType === 'extension' && (
          <div className="space-y-4">
            <p>Reviewing extension for: <strong>{processingTicket.itemDescription}</strong></p>
            <p>Current Due Date: <strong>{formatDate(processingTicket.dueDate)}</strong></p>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">New Due Date (if approved)</label>
              <input 
                type="date" 
                className="input w-full"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="secondary" onClick={() => handleProcess(false)} className="flex-1">
                Decline
              </Button>
              <Button onClick={() => handleProcess(true)} className="flex-1" disabled={!newDueDate}>
                Approve
              </Button>
            </div>
          </div>
        )}

        {processingTicket && actionType === 'redeem' && (
          <div className="space-y-4">
            <p>Process redemption for: <strong>{processingTicket.itemDescription}</strong></p>
            <p>Amount to Collect: <strong>{formatPrice(processingTicket.loanAmount * (1 + processingTicket.interestRate))}</strong></p>
            <p className="text-sm text-stone-500">Stripe integration pending (E79). This will mark the loan as redeemed manually.</p>
            <div className="flex gap-4 pt-4">
              <Button onClick={handleRedeem} className="w-full">
                Confirm Redemption
              </Button>
            </div>
          </div>
        )}

        {processingTicket && actionType === 'forfeit' && (
          <div className="space-y-4">
            <p>Forfeit loan for: <strong>{processingTicket.itemDescription}</strong></p>
            <p className="text-sm text-red-600">This will transition the item to active (shop-owned) and close the loan. This action cannot be undone.</p>
            <div className="flex gap-4 pt-4">
              <Button variant="secondary" className="w-full !border-red-600 !text-red-600 hover:!bg-red-50" onClick={handleForfeit}>
                Confirm Forfeiture
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
