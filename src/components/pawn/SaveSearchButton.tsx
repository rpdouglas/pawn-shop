import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSavedSearches } from '../../hooks/useSavedSearches'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import type { ViewType } from '../../lib/types'

interface SaveSearchButtonProps {
  query: string
  viewTag: ViewType
}

export default function SaveSearchButton({ query, viewTag }: SaveSearchButtonProps) {
  const { user } = useAuth()
  const { saveSearch } = useSavedSearches()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [alertMethod, setAlertMethod] = useState<'sms' | 'email'>('email')
  const [loading, setLoading] = useState(false)

  if (!user || !query) return null

  const handleSave = async () => {
    if (!user.alertOptIn) {
      alert('Please opt-in to alerts in your profile settings to receive notifications.')
      return
    }

    setLoading(true)
    try {
      await saveSearch({
        query,
        viewTag,
        active: true,
        alertMethod
      })
      setIsModalOpen(false)
    } catch (err) {
      console.error('Error saving search:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(true)} style={{ border: '1px solid var(--color-border)' }}>
        Save this search
      </Button>

      <Modal
        isOpen={isModalOpen}
        title="Save Search"
        onClose={() => setIsModalOpen(false)}
      >
        <div style={{ padding: 'var(--space-4)' }}>
          <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
            Get notified when new items matching "<strong>{query}</strong>" arrive.
          </p>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{ 
              display: 'block', 
              fontFamily: 'var(--font-body)', 
              fontSize: 'var(--text-small)', 
              color: 'var(--color-text)',
              marginBottom: 'var(--space-2)'
            }}>
              Alert Method
            </label>
            <select
              value={alertMethod}
              onChange={(e) => setAlertMethod(e.target.value as 'sms' | 'email')}
              style={{
                width: '100%',
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)'
              }}
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Search'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
