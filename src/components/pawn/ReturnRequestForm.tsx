import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'
import type { Item, DisputeType } from '../../lib/types'

interface ReturnRequestFormProps {
  item: Item
  onClose: () => void
  onSuccess: () => void
}

export default function ReturnRequestForm({ item, onClose, onSuccess }: ReturnRequestFormProps) {
  const { user } = useAuth()
  const [description, setDescription] = useState('')
  const [type, setType] = useState<DisputeType>('return')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createDisputeFn = httpsCallable<{
    itemId: string
    type: string
    description: string
  }, { disputeId: string; success: boolean }>(functions, 'createDispute')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!description.trim()) {
      setError('Please tell us a bit more about the issue.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await createDisputeFn({
        itemId: item.id,
        type,
        description: description.trim()
      })
      onSuccess()
    } catch (err: unknown) {
      console.error('Error submitting return request:', err)
      setError('Something went wrong. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      <header style={{ marginBottom: 'var(--space-8)' }}>
        <h3 style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 'var(--text-heading-sm)', 
          color: 'var(--color-text)',
          margin: 0
        }}>
          Report an issue
        </h3>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
          We're sorry something wasn't right with your {item.title}. Let us help you fix it.
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{ 
            display: 'block', 
            fontFamily: 'var(--font-body)', 
            fontSize: 'var(--text-small)', 
            color: 'var(--color-text)',
            marginBottom: 'var(--space-2)'
          }}>
            What's the reason?
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-2)', 
              cursor: 'pointer',
              minHeight: '48px',
              padding: '0 var(--space-2)'
            }}>
              <input 
                type="radio" 
                name="type" 
                value="return" 
                checked={type === 'return'} 
                onChange={() => setType('return')} 
                style={{ width: 'var(--space-6)', height: 'var(--space-6)' }}
              />
              <span style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}>Returning an item</span>
            </label>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-2)', 
              cursor: 'pointer',
              minHeight: '48px',
              padding: '0 var(--space-2)'
            }}>
              <input 
                type="radio" 
                name="type" 
                value="dispute" 
                checked={type === 'dispute'} 
                onChange={() => setType('dispute')} 
                style={{ width: 'var(--space-6)', height: 'var(--space-6)' }}
              />
              <span style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}>Disputing a charge</span>
            </label>
          </div>
        </div>

        <div style={{ marginBottom: 'var(--space-8)' }}>
          <label htmlFor="description" style={{ 
            display: 'block', 
            fontFamily: 'var(--font-body)', 
            fontSize: 'var(--text-small)', 
            color: 'var(--color-text)',
            marginBottom: 'var(--space-2)'
          }}>
            Tell us more
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. The item arrived damaged or wasn't as described..."
            rows={4}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-body)',
              resize: 'vertical',
              minHeight: '120px'
            }}
          />
          {error && (
            <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-2)' }}>
              {error}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" disabled={loading} style={{ minWidth: '140px' }}>
            {loading ? 'Sending...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </div>
  )
}
