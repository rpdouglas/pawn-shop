import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { dispatchSms } from '@pawn-shop/shared/lib/sms'
import { dispatchEmail } from '@pawn-shop/shared/lib/email'
import { twilioAccountSid, twilioAuthToken, sendgridApiKey, siteUrl } from '@pawn-shop/shared/lib/secrets'

// ── Helpers ───────────────────────────────────────────────────────────────────

// Returns true when the pickup window start time falls within [from, to].
// pickupWindow format: "YYYY-MM-DD HH:MM–HH:MM"
function pickupWindowStartsInRange(pickupWindow: string, from: Date, to: Date): boolean {
  const match = pickupWindow.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})/)
  if (!match) return false
  const windowStart = new Date(`${match[1]}T${match[2]}:00`)
  return windowStart >= from && windowStart <= to
}

function formatPriceCad(cents: number): string {
  return `$${(cents / 100).toFixed(2)} CAD`
}

interface DigestItem {
  title: string
  condition: string
  price: number
  link: string
}

// Dark-luxury HTML email. Subject is always "The Pawn Shop Update" — no view
// or category words appear anywhere (Marie Discretion Test: passed by design).
function buildDigestHtml(items: DigestItem[]): string {
  const rows = items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #2a2a2a;">
        <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:16px;color:#C8A14A;">${item.title}</p>
        <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:13px;color:#aaa;">
          ${item.condition.charAt(0).toUpperCase() + item.condition.slice(1)} &mdash; ${formatPriceCad(item.price)}
        </p>
        <a href="${item.link}" style="font-family:Arial,sans-serif;font-size:13px;color:#C8A14A;text-decoration:none;">View in shop &rarr;</a>
      </td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>The Pawn Shop Update</title>
</head>
<body style="background:#080706;margin:0;padding:0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080706;">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="padding-bottom:24px;border-bottom:1px solid #2a2a2a;">
            <p style="margin:0;font-family:Georgia,serif;font-size:22px;color:#C8A14A;letter-spacing:0.04em;">The Pawn Shop</p>
            <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#aaa;letter-spacing:0.08em;text-transform:uppercase;">Cornwall Island &middot; Akwesasne</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 0 8px;">
            <p style="margin:0;font-family:Georgia,serif;font-size:18px;color:#e8e0d0;">This week&rsquo;s featured finds</p>
          </td>
        </tr>
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
          </td>
        </tr>
        <tr>
          <td style="padding-top:24px;">
            <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:#666;">
              You are receiving this because you opted in to updates from The Pawn Shop.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── sendSeasonalReminders ─────────────────────────────────────────────────────
// Hourly. For each active campaign targeting fireworks or all views where
// reminderSentAt is null, sends an SMS to every CASL-opted-in user with a
// phone number. Sets reminderSentAt after the batch — prevents duplicate sends.
// SMS body uses no category words (Tanya / Marie Discretion Test).

export const sendSeasonalReminders = onSchedule({ schedule: '0 * * * *', secrets: [twilioAccountSid, twilioAuthToken] }, async () => {
  const db = getFirestore()

  const campaignSnap = await db.collection('campaigns')
    .where('active', '==', true)
    .get()

  const eligible = campaignSnap.docs.filter((d) => {
    const data = d.data() as Record<string, unknown>
    const tag = String(data['viewTag'] ?? '')
    return (tag === 'fireworks' || tag === 'all') && data['reminderSentAt'] == null
  })

  if (eligible.length === 0) return

  const usersSnap = await db.collection('users')
    .where('alertOptIn', '==', true)
    .get()

  const phoneRecipients = usersSnap.docs.filter((d) => {
    const phone = (d.data() as Record<string, unknown>)['phoneNumber']
    return typeof phone === 'string' && phone.length > 0
  })

  if (phoneRecipients.length === 0) return

  const smsBody = 'The Pawn Shop Update — our seasonal collection is now available. Visit us before selections sell out.'

  for (const campaign of eligible) {
    const viewTag = String((campaign.data() as Record<string, unknown>)['viewTag'] ?? '')
    let successCount = 0

    for (const user of phoneRecipients) {
      try {
        const sent = await dispatchSms(String((user.data() as Record<string, unknown>)['phoneNumber']), smsBody)
        if (sent) successCount++
      } catch (err) {
        console.error(`[sendSeasonalReminders] SMS failed for user ${user.id}:`, (err as Error).message)
      }
    }

    await campaign.ref.update({ reminderSentAt: FieldValue.serverTimestamp() })

    await db.collection('auditLogs').add({
      eventType: 'seasonal_reminder_sent',
      uid: 'system',
      targetId: campaign.id,
      details: { campaignId: campaign.id, viewTag, recipientCount: successCount },
      createdAt: FieldValue.serverTimestamp(),
    })
  }
})

// ── sendPickupReminders ───────────────────────────────────────────────────────
// Hourly. Finds confirmed reservations and confirmed/ready preorders whose
// pickup window opens in 20–28 hours. Sends a day-before reminder SMS with the
// specific pickup window — no category words. Idempotency via pickupReminderSentAt.

export const sendPickupReminders = onSchedule({ schedule: '0 * * * *', secrets: [twilioAccountSid, twilioAuthToken] }, async () => {
  const db   = getFirestore()
  const now  = new Date()
  const from = new Date(now.getTime() + 20 * 60 * 60 * 1000)
  const to   = new Date(now.getTime() + 28 * 60 * 60 * 1000)

  // ── Reservations ─────────────────────────────────────────────────────────
  const resSnap = await db.collection('reservations')
    .where('status', '==', 'confirmed')
    .get()

  for (const doc of resSnap.docs) {
    const data = doc.data() as Record<string, unknown>
    if (data['pickupReminderSentAt'] != null) continue

    const pickupWindow = String(data['pickupWindow'] ?? '')
    if (!pickupWindowStartsInRange(pickupWindow, from, to)) continue

    const phone = String(data['customerPhone'] ?? '')
    if (!phone) continue

    const uid = String(data['uid'] ?? '')
    if (uid) {
      const userSnap = await db.collection('users').doc(uid).get()
      if (!userSnap.exists || (userSnap.data() as Record<string, unknown> | undefined)?.['alertOptIn'] !== true) continue
    }

    const body = `The Pawn Shop — reminder: your pickup is tomorrow. Window: ${pickupWindow}. We look forward to seeing you.`
    try {
      const sent = await dispatchSms(phone, body)
      if (sent) {
        await doc.ref.update({ pickupReminderSentAt: Timestamp.now() })
        await db.collection('auditLogs').add({
          eventType: 'pickup_reminder_sent',
          uid: 'system',
          targetId: doc.id,
          details: { reservationId: doc.id, viewTag: String(data['viewTag'] ?? '') },
          createdAt: FieldValue.serverTimestamp(),
        })
      }
    } catch (err) {
      console.error(`[sendPickupReminders] Reservation ${doc.id} SMS failed:`, (err as Error).message)
    }
  }

  // ── Preorders ─────────────────────────────────────────────────────────────
  // pickupWindow is set on confirmed → ready transition; skip docs where it is absent.
  const preSnap = await db.collection('preorders')
    .where('status', 'in', ['confirmed', 'ready'])
    .get()

  for (const doc of preSnap.docs) {
    const data = doc.data() as Record<string, unknown>
    if (data['pickupReminderSentAt'] != null) continue

    const pickupWindow = String(data['pickupWindow'] ?? '')
    if (!pickupWindow || !pickupWindowStartsInRange(pickupWindow, from, to)) continue

    const phone = String(data['customerPhone'] ?? '')
    if (!phone) continue

    const uid = String(data['uid'] ?? '')
    if (uid) {
      const userSnap = await db.collection('users').doc(uid).get()
      if (!userSnap.exists || (userSnap.data() as Record<string, unknown> | undefined)?.['alertOptIn'] !== true) continue
    }

    const body = `The Pawn Shop — reminder: your pickup is tomorrow. Window: ${pickupWindow}. We look forward to seeing you.`
    try {
      const sent = await dispatchSms(phone, body)
      if (sent) {
        await doc.ref.update({ pickupReminderSentAt: Timestamp.now() })
        await db.collection('auditLogs').add({
          eventType: 'pickup_reminder_sent',
          uid: 'system',
          targetId: doc.id,
          details: { preorderId: doc.id, viewTag: String(data['viewTag'] ?? '') },
          createdAt: FieldValue.serverTimestamp(),
        })
      }
    } catch (err) {
      console.error(`[sendPickupReminders] Preorder ${doc.id} SMS failed:`, (err as Error).message)
    }
  }
})

// ── sendWeeklyDigest ──────────────────────────────────────────────────────────
// Every Monday at 14:00 UTC (≈ 09:00 ET / Cornwall Island local time).
// Fetches top 5 trending active items across all views and sends an HTML email
// to all CASL-opted-in users with an address on file.
// Subject is hard-coded "The Pawn Shop Update" — Marie Discretion Test passed
// by design. No category words appear in subject, preheader, or email body.

export const sendWeeklyDigest = onSchedule({ schedule: '0 14 * * 1', secrets: [sendgridApiKey] }, async () => {
  const db      = getFirestore()
  const siteUrlStr = siteUrl.value() || 'https://thepawnshop.ca'

  // Pawn items only — cannabis/fireworks viewTags would expose category in the
  // item URL path, violating the Marie Discretion Test. Uses composite index:
  // (status ASC, trendingScore DESC). policeHold filtered in JS after fetch.
  const itemSnap = await db.collection('items')
    .where('status', '==', 'active')
    .orderBy('trendingScore', 'desc')
    .limit(20)
    .get()

  const digestItems: DigestItem[] = itemSnap.docs
    .filter((d) => {
      const data = d.data() as Record<string, unknown>
      return data['policeHold'] !== true && data['viewTag'] === 'pawn'
    })
    .slice(0, 5)
    .map((d) => {
      const data = d.data() as Record<string, unknown>
      return {
        title:     String(data['title'] ?? ''),
        condition: String(data['condition'] ?? ''),
        price:     Number(data['price'] ?? 0),
        link:      `${siteUrlStr}/pawn/item/${d.id}`,
      }
    })

  if (digestItems.length === 0) {
    console.info('[sendWeeklyDigest] No active items — skipping')
    return
  }

  const html    = buildDigestHtml(digestItems)
  const subject = 'The Pawn Shop Update'

  const usersSnap = await db.collection('users')
    .where('alertOptIn', '==', true)
    .get()

  const emailRecipients = usersSnap.docs.filter((d) => {
    const email = (d.data() as Record<string, unknown>)['email']
    return typeof email === 'string' && email.length > 0
  })

  let successCount = 0
  for (const user of emailRecipients) {
    try {
      const sent = await dispatchEmail(String((user.data() as Record<string, unknown>)['email']), subject, html)
      if (sent) successCount++
    } catch (err) {
      console.error(`[sendWeeklyDigest] Email failed for user ${user.id}:`, (err as Error).message)
    }
  }

  await db.collection('auditLogs').add({
    eventType: 'weekly_digest_sent',
    uid: 'system',
    details: { viewTag: 'all', recipientCount: successCount },
    createdAt: FieldValue.serverTimestamp(),
  })
})
