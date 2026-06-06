import { useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import type { Item } from '../../lib/types'

interface MarkdownConfigPanelProps {
  item: Item
  onConfigured: () => void
}

export default function MarkdownConfigPanel({ item, onConfigured }: MarkdownConfigPanelProps) {
  const { user } = useAuth()
  const isManager = user?.role === 'admin' || user?.role === 'manager'

  const [floorPrice, setFloorPrice] = useState(String((item.floorPrice || 0) / 100))
  const [markdownRate, setMarkdownRate] = useState(String(item.markdownRate || 10))
  const [markdownPeriodDays, setMarkdownPeriodDays] = useState(String(item.markdownPeriodDays || 7))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isManager) {
    return null
  }

  const handleEnable = async () => {
    try {
      setLoading(true)
      setError(null)
      const enableFn = httpsCallable(functions, 'enableMarkdown')
      await enableFn({
        itemId: item.id,
        floorPrice: Math.round(parseFloat(floorPrice) * 100),
        markdownRate: parseFloat(markdownRate),
        markdownPeriodDays: parseInt(markdownPeriodDays, 10)
      })
      onConfigured()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enable markdown')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    try {
      setLoading(true)
      setError(null)
      const disableFn = httpsCallable(functions, 'disableMarkdown')
      await disableFn({ itemId: item.id })
      onConfigured()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable markdown')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', backgroundColor: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
      <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', marginBottom: 'var(--space-3)' }}>Dutch Auction Markdown</h3>
      
      {error && <p style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)' }}>{error}</p>}
      
      <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-1)' }}>Floor Price (CAD)</label>
          <input 
            type="number" 
            className="input" 
            value={floorPrice} 
            onChange={(e) => setFloorPrice(e.target.value)}
            disabled={item.markdownEnabled || loading}
            step="0.01"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-1)' }}>Markdown Rate (% or fixed CAD cents)</label>
          <input 
            type="number" 
            className="input" 
            value={markdownRate} 
            onChange={(e) => setMarkdownRate(e.target.value)}
            disabled={item.markdownEnabled || loading}
            step="1"
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-1)' }}>Cadence (Days)</label>
          <input 
            type="number" 
            className="input" 
            value={markdownPeriodDays} 
            onChange={(e) => setMarkdownPeriodDays(e.target.value)}
            disabled={item.markdownEnabled || loading}
            min="1"
          />
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          {item.markdownEnabled ? (
            <button 
              className="btn btn-secondary" 
              onClick={handleDisable} 
              disabled={loading}
              style={{ width: '100%', color: 'var(--color-error)' }}
            >
              {loading ? 'Disabling...' : 'Disable Markdown'}
            </button>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={handleEnable} 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Enabling...' : 'Enable Markdown'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
