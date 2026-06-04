import React, { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import type { HRProfile, SchedulePreferences } from '../../lib/types'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface Props {
  uid: string
  isAdminView?: boolean
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export default function HRTab({ uid }: Props) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Local state for editing
  const [legalName, setLegalName] = useState('')
  const [sinNumber, setSinNumber] = useState('')
  const [statusCardNumber, setStatusCardNumber] = useState('')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyRelation, setEmergencyRelation] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [bankInstitution, setBankInstitution] = useState('')
  const [bankTransit, setBankTransit] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [maxHours, setMaxHours] = useState<number | ''>('')
  
  const [schedule, setSchedule] = useState<SchedulePreferences>({})

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'users', uid, 'hrData', 'profile'))
        if (docSnap.exists()) {
          const data = docSnap.data() as HRProfile
          setLegalName(data.legalName || '')
          setSinNumber(data.sinNumber || '')
          setStatusCardNumber(data.statusCardNumber || '')
          setEmergencyName(data.emergencyContact?.name || '')
          setEmergencyRelation(data.emergencyContact?.relationship || '')
          setEmergencyPhone(data.emergencyContact?.phone || '')
          setBankInstitution(data.bankingDetails?.institution || '')
          setBankTransit(data.bankingDetails?.transit || '')
          setBankAccount(data.bankingDetails?.account || '')
          setMaxHours(data.schedulePreferences?.maxHoursPerWeek || '')
          setSchedule(data.schedulePreferences || {})
        }
      } catch (err) {
        console.error('Failed to load HR profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [uid])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updateData: HRProfile = {
        legalName: legalName.trim(),
        sinNumber: sinNumber.trim(),
        statusCardNumber: statusCardNumber.trim(),
        emergencyContact: {
          name: emergencyName.trim(),
          relationship: emergencyRelation.trim(),
          phone: emergencyPhone.trim()
        },
        bankingDetails: {
          institution: bankInstitution.trim(),
          transit: bankTransit.trim(),
          account: bankAccount.trim()
        },
        schedulePreferences: {
          ...schedule,
          maxHoursPerWeek: maxHours === '' ? undefined : Number(maxHours)
        },
        updatedAt: serverTimestamp() as unknown as Date
      }

      await setDoc(doc(db, 'users', uid, 'hrData', 'profile'), updateData, { merge: true })
      alert('HR Profile saved successfully.')
    } catch (err) {
      console.error('Failed to save HR profile:', err)
      alert('Failed to save. You may lack permissions.')
    } finally {
      setSaving(false)
    }
  }

  const updateDaySchedule = (day: typeof DAYS[number], field: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || { start: '', end: '' }),
        [field]: value
      }
    }))
  }

  if (loading) return <div style={{ padding: 'var(--space-4)' }}>Loading secure HR data...</div>

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Warning Banner */}
      <div style={{ padding: 'var(--space-4)', background: 'rgba(200,161,74,0.1)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-md)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
          🔒 Secure HR Profile
        </h3>
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
          This information is stored in an encrypted vault. Only you and authorized administrators can view this data.
        </p>
      </div>

      {/* PII Section */}
      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>Personal & Tax Info</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <Input id="hr-legal-name" label="Legal Name" value={legalName} onChange={setLegalName} required />
          <Input id="hr-sin" label="SIN Number" type="password" value={sinNumber} onChange={setSinNumber} required />
          <Input id="hr-status-card" label="Status Card / Registry #" value={statusCardNumber} onChange={setStatusCardNumber} placeholder="Required for Sec 87 Tax Exemption" />
        </div>
      </section>

      {/* Emergency Contact */}
      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>Emergency Contact</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
          <Input id="hr-emerg-name" label="Contact Name" value={emergencyName} onChange={setEmergencyName} required />
          <Input id="hr-emerg-rel" label="Relationship" value={emergencyRelation} onChange={setEmergencyRelation} required />
          <Input id="hr-emerg-phone" label="Phone Number" value={emergencyPhone} onChange={setEmergencyPhone} required />
        </div>
      </section>

      {/* Banking */}
      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>Direct Deposit Details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 'var(--space-4)' }}>
          <Input id="hr-bank-inst" label="Institution (3 digits)" value={bankInstitution} onChange={setBankInstitution} maxLength={3} required />
          <Input id="hr-bank-transit" label="Transit (5 digits)" value={bankTransit} onChange={setBankTransit} maxLength={5} required />
          <Input id="hr-bank-acct" label="Account Number" value={bankAccount} onChange={setBankAccount} required />
        </div>
      </section>

      {/* Scheduling */}
      <section>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>Schedule Preferences</h2>
        <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>Specify the hours you are available to work. Leave blank if unavailable.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          {DAYS.map(day => (
            <div key={day} style={{ display: 'grid', gridTemplateColumns: '120px 150px 150px', alignItems: 'center', gap: 'var(--space-4)' }}>
              <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{day}</span>
              <Input id={`hr-sched-${day}-start`} label="Start Time" type="time" value={schedule[day]?.start || ''} onChange={(val) => updateDaySchedule(day, 'start', val)} />
              <Input id={`hr-sched-${day}-end`} label="End Time" type="time" value={schedule[day]?.end || ''} onChange={(val) => updateDaySchedule(day, 'end', val)} />
            </div>
          ))}
        </div>

        <div style={{ width: '200px' }}>
          <Input id="hr-max-hours" label="Max Hours / Week" type="number" min="0" max="80" value={maxHours.toString()} onChange={(val) => setMaxHours(val ? Number(val) : '')} />
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save HR Profile'}
        </Button>
      </div>
    </form>
  )
}
