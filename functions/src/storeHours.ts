import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import sgMail from '@sendgrid/mail'
import { sendgridApiKey, staffContactEmail } from './lib/secrets'

// ── updateStoreHours ─────────────────────────────────────────────────────────

const DAY_FIELDS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
const TIME_RE = /^\d{2}:\d{2}$/

interface DayHoursInput {
  open: string
  close: string
  closed: boolean
}

interface UpdateStoreHoursData {
  monday:    DayHoursInput
  tuesday:   DayHoursInput
  wednesday: DayHoursInput
  thursday:  DayHoursInput
  friday:    DayHoursInput
  saturday:  DayHoursInput
  sunday:    DayHoursInput
}

function validateDay(day: DayHoursInput, name: string): void {
  if (typeof day?.closed !== 'boolean') {
    throw new HttpsError('invalid-argument', `${name}.closed must be boolean`)
  }
  if (!TIME_RE.test(day.open))  throw new HttpsError('invalid-argument', `${name}.open must be HH:MM`)
  if (!TIME_RE.test(day.close)) throw new HttpsError('invalid-argument', `${name}.close must be HH:MM`)
  if (!day.closed) {
    const [oh, om] = day.open.split(':').map(Number)
    const [ch, cm] = day.close.split(':').map(Number)
    if (oh * 60 + om >= ch * 60 + cm) {
      throw new HttpsError('invalid-argument', `${name}: open time must be before close time`)
    }
  }
}

export const updateStoreHours = onCall<UpdateStoreHoursData>({ cors: true }, async (request) => {
  if (!request.auth?.token?.['admin']) {
    throw new HttpsError('permission-denied', 'Admin access required')
  }

  const data = request.data
  for (const day of DAY_FIELDS) validateDay(data[day], day)

  const db = getFirestore()
  const uid = request.auth.uid
  const now = FieldValue.serverTimestamp()

  const docData: Record<string, unknown> = { updatedBy: uid, updatedAt: now }
  for (const day of DAY_FIELDS) {
    docData[day] = { open: data[day].open, close: data[day].close, closed: data[day].closed }
  }

  await db.collection('config').doc('storeHours').set(docData, { merge: true })

  await db.collection('auditLogs').add({
    eventType: 'store_hours_updated',
    uid,
    targetId: 'config/storeHours',
    details: { daysModified: DAY_FIELDS.filter(d => !data[d].closed) },
    createdAt: now,
  })

  return { success: true }
})

// ── sendContactEmail ─────────────────────────────────────────────────────────

interface SendContactEmailData {
  name: string
  email: string
  message: string
}

export const sendContactEmail = onCall<SendContactEmailData>({ cors: true, secrets: [sendgridApiKey] }, async (request) => {
  const { name, email, message } = request.data

  if (!name?.trim()    || name.length > 100)    throw new HttpsError('invalid-argument', 'Name is required (max 100 characters)')
  if (!email?.trim()   || email.length > 200)   throw new HttpsError('invalid-argument', 'Email is required (max 200 characters)')
  if (!message?.trim() || message.length > 2000) throw new HttpsError('invalid-argument', 'Message is required (max 2000 characters)')

  const apiKey = sendgridApiKey.value()
  const staffEmail = staffContactEmail.value()

  if (apiKey && staffEmail) {
    sgMail.setApiKey(apiKey)
    try {
      await sgMail.send({
        to: staffEmail,
        from: staffEmail,
        replyTo: email.trim(),
        subject: 'The Pawn Shop — Contact Form',
        text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\nMessage:\n${message.trim()}`,
      })
    } catch (err) {
      console.error('[sendContactEmail] SendGrid error:', (err as Error).message)
      throw new HttpsError('internal', 'Failed to send — please try again or call us directly')
    }
  } else {
    console.warn('[sendContactEmail] SendGrid credentials not configured — skipping')
  }

  return { success: true }
})
