import { useState } from 'react'
import { useAllLoanTickets, useProcessExtension } from '../../lib/useLoanTickets'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { formatPrice, formatDate } from '../../lib/format'
import type { LoanTicket } from '../../lib/types'
import Modal from '../../components/ui/Modal'

export default function LoanTicketsAdminPage() {
  const { data: tickets, isLoading, error } = useAllLoanTickets()
  const { mutateAsync: processExtension } = useProcessExtension()
  const [processingTicket, setProcessingTicket] = useState<LoanTicket | null>(null)
  const [newDueDate, setNewDueDate] = useState('')

  if (isLoading) return <div className="p-8 text-stone-500">Loading loans...</div>
  if (error) return <div className="p-8 text-red-600">Error: {(error as Error).message}</div>

  const handleProcess = async (approved: boolean) => {
    if (!processingTicket) return
    try {
      await processExtension({
        loanTicketId: processingTicket.id,
        approved,
        newDueDate: approved ? newDueDate : undefined
      })
      setProcessingTicket(null)
      setNewDueDate('')
    } catch (err) {
      alert((err as Error).message)
    }
  }

  const columns = [
    { key: 'itemDescription' as const, header: 'Item' },
    { key: 'loanAmount' as const, header: 'Amount', render: (row: LoanTicket) => formatPrice(row.loanAmount) },
    { key: 'dueDate' as const, header: 'Due Date', render: (row: LoanTicket) => formatDate(row.dueDate) },
    { key: 'status' as const, header: 'Status', render: (row: LoanTicket) => (
      <Badge variant={row.status}>
        {row.status}
      </Badge>
    )},
    { key: 'id' as const, header: 'Actions', render: (row: LoanTicket) => (
      row.status === 'extension_requested' ? (
        <Button size="sm" onClick={() => setProcessingTicket(row)}>
          Review
        </Button>
      ) : null
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

      <Modal isOpen={!!processingTicket} onClose={() => setProcessingTicket(null)} title="Review Extension">
        {processingTicket && (
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
      </Modal>
    </div>
  )
}
