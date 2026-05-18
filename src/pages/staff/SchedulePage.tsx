import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../../context/AuthContext'
import type { Shift } from '../../lib/types'
import ProtectedRoute from '../../components/auth/ProtectedRoute'

export default function SchedulePage() {
  const { user } = useAuth()
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'shifts'),
      where('staffUid', '==', user.uid),
      orderBy('startTime', 'asc')
    )
    const unsubscribe = onSnapshot(q, (snap) => {
      setShifts(snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: (doc.data().startTime as Timestamp).toDate(),
        endTime: (doc.data().endTime as Timestamp).toDate(),
      } as Shift)))
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  return (
    <ProtectedRoute staffOnly>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-8) var(--space-6)' }}>
        <header style={{ marginBottom: 'var(--space-12)' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-display)',
            color: 'var(--color-text)',
            marginBottom: 'var(--space-2)',
          }}>
            My Schedule
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-text-muted)',
          }}>
            Upcoming shifts and assignments
          </p>
        </header>

        {loading ? (
          <p style={{ color: 'var(--color-text-muted)' }}>Loading shifts...</p>
        ) : shifts.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No upcoming shifts scheduled.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {shifts.map(shift => (
              <div key={shift.id} style={{
                padding: 'var(--space-6)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 'var(--text-lead)' }}>
                    {shift.startTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)' }}>
                    {shift.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {shift.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {shift.notes && (
                    <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
                      Note: {shift.notes}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                   <span className={`view-${shift.viewTag === 'all' ? 'pawn' : shift.viewTag}`} style={{
                      padding: 'var(--space-1) var(--space-3)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--text-xs)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-bg)'
                    }}>
                      {shift.viewTag}
                    </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
