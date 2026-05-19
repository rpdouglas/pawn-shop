import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Faq } from '../lib/types'
import { useView } from '../context/ViewContext'

export default function FaqPage() {
  const { view } = useView()
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
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
  }, [])

  const filteredFaqs = faqs.filter(f => f.category === 'general' || f.category === view)

  return (
    <div className={`view-${view}`} style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: 'var(--space-12) var(--space-6)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: 'var(--color-text)', margin: 0 }}>
            Common Questions
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            Everything you need to know about The Pawn Shop.
          </p>
        </header>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Gathering answers...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {filteredFaqs.map((faq) => (
              <div 
                key={faq.id} 
                style={{ 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface)',
                  overflow: 'hidden'
                }}
              >
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  style={{
                    width: '100%',
                    padding: 'var(--space-6)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    minHeight: '48px'
                  }}
                  aria-expanded={openId === faq.id}
                >
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lead)' }}>
                    {faq.question}
                  </span>
                  <span style={{ 
                    fontSize: '1.5rem', 
                    color: 'var(--color-primary)',
                    transform: openId === faq.id ? 'rotate(45deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease-in-out'
                  }}>
                    +
                  </span>
                </button>
                
                {openId === faq.id && (
                  <div style={{ 
                    padding: '0 var(--space-6) var(--space-6) var(--space-6)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.6,
                    fontSize: 'var(--text-body)',
                    fontFamily: 'var(--font-body)'
                  }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
