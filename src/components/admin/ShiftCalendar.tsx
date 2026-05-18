import { useState, useEffect } from 'react'
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { db, functions } from '../../lib/firebase'
import type { Shift, StaffMember, ViewType } from '../../lib/types'
import Button from '../ui/Button'
import Input from '../ui/Input'

const createShiftFn = httpsCallable<{ staffUid: string; startTime: string; endTime: string; viewTag: string; notes?: string }, { success: boolean }>(functions, 'createShift')
const deleteShiftFn = httpsCallable<{ shiftId: string }, { success: boolean }>(functions, 'deleteShift')
const getStaffMembersFn = httpsCallable<unknown, { staff: StaffMember[] }>(functions, 'getStaffMembers')

export default function ShiftCalendar() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newShift, setNewShift] = useState({
    staffUid: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    viewTag: 'all' as ViewType | 'all',
    notes: '',
  })

  useEffect(() => {
    getStaffMembersFn().then(res => setStaff(res.data.staff))

    const q = query(collection(db, 'shifts'), orderBy('startTime', 'asc'))
    const unsubscribe = onSnapshot(q, (snap) => {
      setShifts(snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: (doc.data().startTime as Timestamp).toDate(),
        endTime: (doc.data().endTime as Timestamp).toDate(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
        updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
      } as Shift)))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleAddShift = async () => {
    if (!newShift.staffUid) return
    try {
      const start = new Date(`${newShift.date}T${newShift.startTime}`)
      const end = new Date(`${newShift.date}T${newShift.endTime}`)
      await createShiftFn({
        staffUid: newShift.staffUid,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        viewTag: newShift.viewTag,
        notes: newShift.notes,
      })
      setIsAdding(false)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add shift')
    }
  }

  const handleDeleteShift = async (shiftId: string) => {
    if (!confirm('Delete this shift?')) return
    try {
      await deleteShiftFn({ shiftId })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete shift')
    }
  }

  if (loading) return <p style={{ padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>Loading schedule...</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : 'Add Shift'}
        </Button>
      </div>

      {isAdding && (
        <div style={{
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          display: 'grid',
          gap: 'var(--space-4)',
          maxWidth: '500px'
        }}>
          <div className="input-wrapper">
            <label className="input-label">Staff Member</label>
            <select
              style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-2)',
                width: '100%'
              }}
              value={newShift.staffUid}
              onChange={(e) => setNewShift({ ...newShift, staffUid: e.target.value })}
            >
              <option value="">Select staff...</option>
              {staff.map(s => (
                <option key={s.uid} value={s.uid}>{s.displayName || s.email}</option>
              ))}
            </select>
          </div>

          <Input
            id="shift-date"
            label="Date"
            type="date"
            value={newShift.date}
            onChange={(val) => setNewShift({ ...newShift, date: val })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <Input
              id="shift-start"
              label="Start Time"
              type="time"
              value={newShift.startTime}
              onChange={(val) => setNewShift({ ...newShift, startTime: val })}
            />
            <Input
              id="shift-end"
              label="End Time"
              type="time"
              value={newShift.endTime}
              onChange={(val) => setNewShift({ ...newShift, endTime: val })}
            />
          </div>

          <div className="input-wrapper">
            <label className="input-label">View Assignment</label>
            <select
              style={{
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-2)',
                width: '100%'
              }}
              value={newShift.viewTag}
              onChange={(e) => setNewShift({ ...newShift, viewTag: e.target.value as ViewType | 'all' })}
            >
              <option value="all">All / Floating</option>
              <option value="pawn">Pawn</option>
              <option value="cannabis">Cannabis</option>
              <option value="fireworks">Fireworks</option>
            </select>
          </div>

          <Input
            id="shift-notes"
            label="Notes"
            value={newShift.notes}
            onChange={(val) => setNewShift({ ...newShift, notes: val })}
          />

          <Button onClick={handleAddShift} disabled={!newShift.staffUid}>Save Shift</Button>
        </div>
      )}

      <div style={{ overflowX: 'auto', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
              {['Staff', 'Date', 'Time', 'Assignment', 'Actions'].map((col) => (
                <th key={col} style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shifts.map((shift) => {
              const staffMember = staff.find(s => s.uid === shift.staffUid)
              return (
                <tr key={shift.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-body)' }}>
                    {staffMember?.displayName || staffMember?.email || 'Unknown'}
                  </td>
                  <td style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-body)' }}>
                    {shift.startTime.toLocaleDateString()}
                  </td>
                  <td style={{ padding: 'var(--space-4)', fontFamily: 'var(--font-body)' }}>
                    {shift.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {shift.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: 'var(--space-4)', textTransform: 'capitalize' }}>
                    <span className={`view-${shift.viewTag === 'all' ? 'pawn' : shift.viewTag}`} style={{
                      padding: 'var(--space-1) var(--space-2)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-bg)'
                    }}>
                      {shift.viewTag}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-4)' }}>
                    <button
                      onClick={() => handleDeleteShift(shift.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: 'var(--text-small)' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
