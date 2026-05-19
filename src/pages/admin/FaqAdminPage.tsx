import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import Table from '../../components/ui/Table'
import Button from '../../components/ui/Button'
import type { Faq } from '../../lib/types'
import ProtectedRoute from '../../components/auth/ProtectedRoute'

export default function FaqAdminPage() {
  const { user } = useAuth()
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setSelectedId] = useState<string | null>(null)

  // Form state
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [category, setCategory] = useState<Faq['category']>('general')
  const [order, setOrder] = useState(0)

  useEffect(() => {
    if (!user) return

    const q = query(collection(db, 'faqs'), orderBy('order', 'asc'))
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => {
        const d = doc.data() as Record<string, unknown>
        return {
          id: doc.id,
          question: d.question as string,
          answer: d.answer as string,
          category: d.category as Faq['category'],
          order: d.order as number,
          createdAt: (d.createdAt as Timestamp)?.toDate?.() || new Date(),
          updatedAt: (d.updatedAt as Timestamp)?.toDate?.() || new Date()
        }
      })
      setFaqs(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  const resetForm = () => {
    setQuestion('')
    setAnswer('')
    setCategory('general')
    setOrder(0)
    setSelectedId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date()
    try {
      if (editingId) {
        await updateDoc(doc(db, 'faqs', editingId), {
          question,
          answer,
          category,
          order: Number(order),
          updatedAt: now
        })
        const logFn = httpsCallable(functions, 'logFaqAction')
        await logFn({ action: 'faq_updated', faqId: editingId, details: { category } })
      } else {
        const ref = await addDoc(collection(db, 'faqs'), {
          question,
          answer,
          category,
          order: Number(order),
          createdAt: now,
          updatedAt: now
        })
        const logFn = httpsCallable(functions, 'logFaqAction')
        await logFn({ action: 'faq_created', faqId: ref.id, details: { category } })
      }
      resetForm()
    } catch {
      alert('Failed to save FAQ.')
    }
  }

  const handleEdit = (faq: Faq) => {
    setQuestion(faq.question)
    setAnswer(faq.answer)
    setCategory(faq.category)
    setOrder(faq.order)
    setSelectedId(faq.id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    try {
      await deleteDoc(doc(db, 'faqs', id))
      const logFn = httpsCallable(functions, 'logFaqAction')
      await logFn({ action: 'faq_deleted', faqId: id })
    } catch {
      alert('Failed to delete.')
    }
  }

  const columns = [
    { key: 'order' as keyof Faq, header: 'Order' },
    { key: 'category' as keyof Faq, header: 'Category' },
    { key: 'question' as keyof Faq, header: 'Question' },
    { 
      key: 'id' as keyof Faq, 
      header: 'Actions',
      render: (f: Record<string, unknown>) => {
        const row = f as unknown as Faq
        return (
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <button onClick={() => handleEdit(row)} style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', minHeight: '48px' }}>Edit</button>
            <button onClick={() => handleDelete(row.id)} style={{ color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', minHeight: '48px' }}>Delete</button>
          </div>
        )
      }
    }
  ]

  return (
    <ProtectedRoute staffOnly>
      <div style={{ padding: 'var(--space-8)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', marginBottom: 'var(--space-8)' }}>FAQ Management</h2>

        <form onSubmit={handleSubmit} style={{ 
          backgroundColor: 'var(--color-surface)', 
          padding: 'var(--space-6)', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--color-border)',
          marginBottom: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: 'var(--space-4)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>QUESTION</label>
              <input type="text" value={question} onChange={e => setQuestion(e.target.value)} required style={{ width: '100%', padding: 'var(--space-2)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>CATEGORY</label>
              <select value={category} onChange={e => setCategory(e.target.value as Faq['category'])} style={{ width: '100%', padding: 'var(--space-2)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                <option value="general">General</option>
                <option value="pawn">Pawn</option>
                <option value="cannabis">Cannabis</option>
                <option value="fireworks">Fireworks</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>ORDER</label>
              <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} style={{ width: '100%', padding: 'var(--space-2)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>ANSWER</label>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} required rows={4} style={{ width: '100%', padding: 'var(--space-2)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <Button type="submit" size="sm" style={{ minWidth: '120px' }}>{editingId ? 'Update' : 'Add FAQ'}</Button>
            {editingId && <Button type="button" variant="secondary" size="sm" onClick={resetForm}>Cancel</Button>}
          </div>
        </form>

        {loading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Loading FAQs...</p>
        ) : (
          <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
            <Table 
              columns={columns as unknown as { key: string; header: string; render?: (row: Record<string, unknown>) => React.ReactNode }[]} 
              data={faqs as unknown as Record<string, unknown>[]} 
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
