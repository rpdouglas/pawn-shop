import sgMail from '@sendgrid/mail'
import { sendgridApiKey, sendgridFromEmail } from './secrets'

export async function dispatchEmail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const apiKey = sendgridApiKey.value()
  const from   = sendgridFromEmail.value()
  if (!apiKey || !from) {
    console.warn('[Email] SendGrid credentials not configured — skipping')
    return false
  }
  sgMail.setApiKey(apiKey)
  await sgMail.send({ to, from, subject, html })
  return true
}
