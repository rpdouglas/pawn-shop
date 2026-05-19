import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../lib/firebase'
import Button from '../ui/Button'
import type { RefundMethod } from '../../lib/types'

interface RestockActionProps {
  disputeId: string
  onComplete: () => void
}

export default function RestockAction({ disputeId, onComplete }: RestockActionProps) {
  const [loading, setLoading] = useState(false)
  const [staffNotes, setStaffNotes] = useState('')
  const [refundAmount, setRefundAmount] = useState<number>(0)
  const [refundMethod, setRefundMethod] = useState<RefundMethod>('store-credit')
  const [restockItem, setRestockItem] = useState(true)

  const resolveDisputeFn = httpsCallable<{
    disputeId: string
    status: string
    refundAmount: number
    refundMethod: string
    staffNotes: string
    restockItem: boolean
  }, { success: boolean }>(functions, 'resolveDispute')

  const handleResolve = async () => {
    setLoading(true)
    try {
      await resolveDisputeFn({
        disputeId,
        status: 'resolved',
        refundAmount,
        refundMethod,
        staffNotes,
        restockItem
      })
      onComplete()
    } catch (err) {
      console.error('Error resolving dispute:', err)
      alert('Failed to resolve dispute. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
      <h4 style={{ margin: '0 0 var(--space-4) 0', fontFamily: 'var(--font-display)', fontSize: 'var(--text-small)' }}>Resolve & Restock</h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-1)' }}>Staff Notes</label>
          <textarea 
            value={staffNotes} 
            onChange={(e) => setStaffNotes(e.target.value)}
            style={{ width: '100%', padding: 'var(--space-2)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontSize: 'var(--text-small)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-1)' }}>Refund Amount (cents)</label>
            <input 
              type="number" 
              value={refundAmount} 
              onChange={(e) => setRefundAmount(parseInt(e.target.value) || 0)}
              style={{ width: '100%', padding: 'var(--space-2)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontSize: 'var(--text-small)' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-1)' }}>Method</label>
            <select 
              value={refundMethod} 
              onChange={(e) => setRefundMethod(e.target.value as RefundMethod)}
              style={{ width: '100%', padding: 'var(--space-2)', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontSize: 'var(--text-small)' }}
            >
              <option value="store-credit">Store Credit</option>
              <option value="etransfer">E-Transfer</option>
              <option value="cash">Cash</option>
            </select>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={restockItem} 
            onChange={(e) => setRestockItem(e.target.checked)}
          />
          <span style={{ fontSize: 'var(--text-small)' }}>Restock item (set status to active)</span>
        </label>

        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleResolve} 
          disabled={loading}
        >
          {loading ? 'Resolving...' : 'Confirm Resolution'}
        </Button>
      </div>
    </div>
  )
}
