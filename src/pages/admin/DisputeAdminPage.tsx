import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, doc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import Table from '../../components/ui/Table'
import Badge from '../../components/ui/Badge'
import RestockAction from '../../components/admin/RestockAction'
import type { Dispute, Item } from '../../lib/types'
import { formatPrice } from '../../lib/format'

export default function DisputeAdminPage() {
  const { user } = useAuth()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null)
  const [itemContext, setItemContext] = useState<Record<string, Item>>({})

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'disputes'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, async (snap) => {
      const data = snap.docs.map(doc => {
        const d = doc.data() as Record<string, unknown>
        return {
          id: doc.id,
          ...d,
          createdAt: (d.createdAt as Timestamp)?.toDate?.() || d.createdAt,
          resolvedAt: (d.resolvedAt as Timestamp)?.toDate?.() || d.resolvedAt
        }
      }) as unknown as Dispute[]
      setDisputes(data)
      setLoading(false)

      // Fetch item titles for context
      const itemIds = Array.from(new Set(data.map(d => d.itemId)))
      const newItemContext = { ...itemContext }
      for (const id of itemIds) {
        if (!newItemContext[id]) {
          const itemSnap = await getDoc(doc(db, 'items', id))
          if (itemSnap.exists()) {
            newItemContext[id] = { id: itemSnap.id, ...(itemSnap.data() as Record<string, unknown>) } as unknown as Item
          }
        }
      }
      setItemContext(newItemContext)
    }, (err) => {
      console.error('Error fetching disputes:', err)
      setLoading(false)
    })

    return unsubscribe
  }, [user, itemContext])

  const columns = [
    { 
      key: 'createdAt' as keyof Dispute, 
      header: 'Created', 
      render: (d: Dispute) => d.createdAt instanceof Date ? d.createdAt.toLocaleString() : '—' 
    },
    { 
      key: 'type' as keyof Dispute, 
      header: 'Type', 
      render: (d: Dispute) => (
        <Badge variant={d.type}>{d.type.toUpperCase()}</Badge>
      )
    },
    { 
      key: 'status' as keyof Dispute, 
      header: 'Status', 
      render: (d: Dispute) => (
        <Badge variant={d.status}>{d.status.toUpperCase()}</Badge>
      )
    },
    { 
      key: 'itemId' as keyof Dispute, 
      header: 'Item', 
      render: (d: Dispute) => itemContext[d.itemId]?.title || d.itemId 
    },
    { 
      key: 'refundAmount' as keyof Dispute, 
      header: 'Refund', 
      render: (d: Dispute) => d.refundAmount ? formatPrice(d.refundAmount) : '—' 
    },
    { 
      key: 'id' as keyof Dispute, 
      header: 'Actions', 
      render: (d: Dispute) => (
        d.status !== 'resolved' && (
          <button 
            onClick={() => setSelectedDisputeId(selectedDisputeId === d.id ? null : d.id)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--color-primary)', 
              cursor: 'pointer', 
              fontSize: 'var(--text-small)', 
              padding: 'var(--space-2) var(--space-4)',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {selectedDisputeId === d.id ? 'Cancel' : 'Manage'}
          </button>
        )
      )
    }
  ]

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <header style={{ marginBottom: 'var(--space-12)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', color: 'var(--color-text)', margin: 0 }}>
          Returns & Disputes
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
          Manage customer returns, eBay disputes, and inventory restocks.
        </p>
      </header>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading tickets...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <Table 
            columns={columns as unknown as { key: string; header: string; render?: (row: Record<string, unknown>) => React.ReactNode }[]} 
            data={disputes as unknown as Record<string, unknown>[]} 
          />

          {selectedDisputeId && (
            <div style={{ maxWidth: '600px' }}>
              <RestockAction 
                disputeId={selectedDisputeId} 
                onComplete={() => setSelectedDisputeId(null)} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
