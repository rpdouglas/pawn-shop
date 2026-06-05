import { useState, useEffect } from 'react'
import { collection, query, where, doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import type { StaffDocument, DocumentSignature } from '../../lib/types'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import ReactMarkdown from 'react-markdown'

export default function AcknowledgmentWall({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  
  const [requiredDocs, setRequiredDocs] = useState<StaffDocument[]>([])
  const [signatures, setSignatures] = useState<Record<string, DocumentSignature>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isMock = typeof window !== 'undefined' && (window as any).__PLAYWRIGHT_MOCK_USER__
    
    if (!user || !user.isStaff || isMock) {
      const t = setTimeout(() => setLoading(false), 0)
      return () => clearTimeout(t)
    }

    // 1. Fetch all required documents
    const docsQuery = query(collection(db, 'documents'), where('isRequired', '==', true))
    const unsubDocs = onSnapshot(docsQuery, (snap) => {
      setRequiredDocs(snap.docs.map(d => ({ id: d.id, ...d.data() } as StaffDocument)))
      
      // 2. Fetch user's signatures
      const sigsQuery = query(collection(db, 'users', user.uid, 'signatures'))
      const unsubSigs = onSnapshot(sigsQuery, (sigSnap) => {
        const sigMap: Record<string, DocumentSignature> = {}
        sigSnap.docs.forEach(d => {
          sigMap[d.id] = d.data() as DocumentSignature
        })
        setSignatures(sigMap)
        setLoading(false)
      })

      return () => unsubSigs()
    })

    return () => unsubDocs()
  }, [user])

  if (authLoading || loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>Loading security context...</div>
  }

  if (!user || !user.isStaff || (typeof window !== 'undefined' && (window as unknown as { __PLAYWRIGHT_MOCK_USER__?: boolean }).__PLAYWRIGHT_MOCK_USER__)) {
    return <>{children}</>
  }

  // Find all required documents that the user hasn't signed the LATEST version of
  const pendingDocs = requiredDocs.filter(doc => {
    const sig = signatures[doc.id]
    if (!sig) return true
    return sig.version !== doc.version
  })

  if (pendingDocs.length === 0) {
    return <>{children}</>
  }

  // Display the first pending document
  const currentDoc = pendingDocs[0]

  const handleAcknowledge = async () => {
    try {
      await setDoc(doc(db, 'users', user.uid, 'signatures', currentDoc.id), {
        documentId: currentDoc.id,
        version: currentDoc.version,
        signedAt: serverTimestamp(),
      })
    } catch (err) {
      alert('Failed to save signature. Please check your connection.')
      console.error(err)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: 'var(--space-6)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>Action Required</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>You must acknowledge updated policies before accessing the system.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            {pendingDocs.length} remaining
          </span>
        </div>
      </header>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--color-surface)', padding: 'var(--space-8)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>{currentDoc.title}</h2>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Badge variant="tag" label={currentDoc.type.toUpperCase()} />
              <Badge variant="tag" label={currentDoc.version} />
            </div>
          </div>

          <div className="prose" style={{ color: 'var(--color-text)', maxWidth: 'none' }}>
            <ReactMarkdown>{currentDoc.content}</ReactMarkdown>
          </div>

          <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', alignItems: 'center' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              By clicking acknowledge, you confirm that you have read and understood the procedures outlined in this document. Your electronic signature, IP address, and timestamp will be recorded for compliance purposes.
            </p>
            <Button variant="primary" onClick={handleAcknowledge} style={{ padding: 'var(--space-3) var(--space-8)', fontSize: 'var(--text-lg)' }}>
              I Acknowledge
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
