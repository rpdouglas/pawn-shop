import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { db } from '../lib/firebase'
import { auth } from '../lib/firebase-core'
import { useAuth } from '../context/AuthContext'
import type { AuthUser, Reservation, Preorder, PawnRequest } from '../lib/types'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth()
  
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [preorders, setPreorders] = useState<Preorder[]>([])
  const [pawnRequests, setPawnRequests] = useState<PawnRequest[]>([])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'activity'>('info')

  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [alertOptIn, setAlertOptIn] = useState(false)

  useEffect(() => {
    if (!user) return

    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as AuthUser
        setPhoneNumber(data.phoneNumber || '')
        setAlertOptIn(data.alertOptIn || false)
      }
    })

    // Fetch activity
    Promise.all([
      getDocs(query(collection(db, 'reservations'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'preorders'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, 'pawnRequests'), where('uid', '==', user.uid), orderBy('createdAt', 'desc')))
    ]).then(([resSnap, preSnap, pawnSnap]) => {
      setReservations(resSnap.docs.map(d => ({ id: d.id, ...d.data() } as Reservation)))
      setPreorders(preSnap.docs.map(d => ({ id: d.id, ...d.data() } as Preorder)))
      setPawnRequests(pawnSnap.docs.map(d => ({ id: d.id, ...d.data() } as PawnRequest)))
      setLoading(false)
    }).catch(err => {
      console.error('Error fetching activity:', err)
      setLoading(false)
    })

    return unsub
  }, [user])

  if (!user) return <Navigate to="/login" />

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (auth.currentUser && displayName !== user.displayName) {
        await updateProfile(auth.currentUser, { displayName })
        await refreshUser()
      }
      await updateDoc(doc(db, 'users', user.uid), {
        phoneNumber,
        alertOptIn
      })
      alert('Profile updated successfully.')
    } catch (err) {
      console.error('Error updating profile:', err)
      alert('Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const tabStyle = (isActive: boolean) => ({
    padding: 'var(--space-2) var(--space-4)',
    borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
    color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-body)',
    cursor: 'pointer',
    background: 'none',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
  })

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-8)' }} className="animate-fade-up">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', color: 'var(--color-primary)', marginBottom: 'var(--space-6)' }}>
        My Profile
      </h1>

      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-8)', borderBottom: '1px solid var(--color-border)' }}>
        <button onClick={() => setActiveTab('info')} style={tabStyle(activeTab === 'info')}>Account Info</button>
        <button onClick={() => setActiveTab('activity')} style={tabStyle(activeTab === 'activity')}>Activity History</button>
      </div>

      {activeTab === 'info' && (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <Input id="profile-email" label="Email Address" type="email" value={user.email || ''} onChange={() => {}} disabled style={{ opacity: 0.5 }} />
            </div>
            <div>
              <Input id="profile-name" label="Display Name" type="text" value={displayName} onChange={setDisplayName} />
            </div>
            <div>
              <Input id="profile-phone" label="Phone Number" type="tel" value={phoneNumber} onChange={setPhoneNumber} placeholder="+1 (555) 000-0000" />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer', marginTop: 'var(--space-4)' }}>
            <input 
              type="checkbox" 
              checked={alertOptIn} 
              onChange={e => setAlertOptIn(e.target.checked)}
              style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--color-primary)' }}
            />
            <div>
              <span style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 'var(--text-small)', color: 'var(--color-text)' }}>
                Receive SMS / Email Alerts
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Opt-in to notifications for saved searches and weekly digests.
              </span>
            </div>
          </label>

          <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      )}

      {activeTab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          {loading ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Loading history...</p>
          ) : (
            <>
              <section>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>Pawn Requests</h2>
                {pawnRequests.length === 0 ? <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>No pawn requests found.</p> : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {pawnRequests.map(req => (
                      <li key={req.id} style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p style={{ fontWeight: 600, color: 'var(--color-text)', margin: '0 0 var(--space-1) 0' }}>{req.itemDescription}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: 0 }}>Submitted on {new Date(req.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span style={{ textTransform: 'uppercase', fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)' }}>
                            {req.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>Reservations</h2>
                {reservations.length === 0 ? <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>No reservations found.</p> : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {reservations.map(res => (
                      <li key={res.id} style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-1) 0' }}>Item ID: {res.itemId}</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', margin: 0 }}>Pickup: {res.pickupWindow}</p>
                          </div>
                          <span style={{ textTransform: 'uppercase', fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)' }}>
                            {res.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-heading)', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>Preorders</h2>
                {preorders.length === 0 ? <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>No preorders found.</p> : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {preorders.map(pre => (
                      <li key={pre.id} style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', margin: '0 0 var(--space-1) 0' }}>Item ID: {pre.itemId} (Qty: {pre.quantity})</p>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text)', margin: 0 }}>View: {pre.viewTag}</p>
                          </div>
                          <span style={{ textTransform: 'uppercase', fontSize: 'var(--text-xs)', padding: 'var(--space-1) var(--space-2)', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-sm)', color: 'var(--color-primary)' }}>
                            {pre.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default ProfilePage
