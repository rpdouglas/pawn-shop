import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { StaffDocument } from '../../lib/types'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'

export default function DocumentsPage() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<StaffDocument[]>([])
  const [loading, setLoading] = useState(true)
  
  const [editingDoc, setEditingDoc] = useState<Partial<StaffDocument> | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snap) => {
      setDocuments(snap.docs.map(d => {
        const data = d.data()
        return {
          ...data,
          id: d.id,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as StaffDocument
      }))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDoc || !user) return
    setSaving(true)
    try {
      const docRef = editingDoc.id ? doc(db, 'documents', editingDoc.id) : doc(collection(db, 'documents'))
      await setDoc(docRef, {
        ...editingDoc,
        updatedAt: serverTimestamp(),
        ...(editingDoc.id ? {} : { createdAt: serverTimestamp(), createdBy: user.uid })
      }, { merge: true })
      setEditingDoc(null)
    } catch (err) {
      alert('Failed to save document')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document forever?')) return
    try {
      await deleteDoc(doc(db, 'documents', id))
    } catch (err) {
      alert('Failed to delete')
      console.error(err)
    }
  }

  if (loading) return <p style={{ padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>Loading documents...</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>SOPs & Contracts</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>Manage staff procedures and compliance documents.</p>
        </div>
        {user?.isAdmin && (
          <Button variant="primary" onClick={() => setEditingDoc({ title: '', content: '', type: 'sop', version: 'v1.0', isRequired: true })}>
            Create Document
          </Button>
        )}
      </header>

      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {documents.map(doc => (
          <div key={doc.id} style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 'var(--text-lg)', fontWeight: 500, color: 'var(--color-text)' }}>{doc.title}</span>
                <Badge variant={doc.type === 'sop' ? 'active' : 'archived'} label={doc.type.toUpperCase()} />
                <Badge variant="tag" label={doc.version} />
                {doc.isRequired && <Badge variant="error" label="Required Reading" />}
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Last updated: {doc.updatedAt?.toLocaleDateString() ?? 'Unknown'}
              </p>
            </div>
            {user?.isAdmin && (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Button variant="secondary" onClick={() => setEditingDoc(doc)}>Edit</Button>
                <Button variant="secondary" onClick={() => handleDelete(doc.id)}>Delete</Button>
              </div>
            )}
          </div>
        ))}
        {documents.length === 0 && (
          <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--space-6)' }}>No documents found.</p>
        )}
      </div>

      {editingDoc && (
        <Modal isOpen={true} onClose={() => setEditingDoc(null)} title={editingDoc.id ? 'Edit Document' : 'New Document'}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Title</label>
                <input required type="text" value={editingDoc.title || ''} onChange={e => setEditingDoc({ ...editingDoc, title: e.target.value })} style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Type</label>
                <select value={editingDoc.type || 'sop'} onChange={e => setEditingDoc({ ...editingDoc, type: e.target.value as 'sop' | 'contract' })} style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
                  <option value="sop">SOP</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Version</label>
                <input required type="text" value={editingDoc.version || ''} onChange={e => setEditingDoc({ ...editingDoc, version: e.target.value })} style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }} placeholder="v1.0" />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--color-text)', fontSize: 'var(--text-sm)' }}>
              <input type="checkbox" checked={editingDoc.isRequired || false} onChange={e => setEditingDoc({ ...editingDoc, isRequired: e.target.checked })} />
              Block staff from POS until acknowledged? (Required Reading)
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>Content (Markdown)</label>
              <textarea
                required
                rows={15}
                value={editingDoc.content || ''}
                onChange={e => setEditingDoc({ ...editingDoc, content: e.target.value })}
                style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', fontFamily: 'monospace', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <Button type="button" variant="secondary" onClick={() => setEditingDoc(null)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Document'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
