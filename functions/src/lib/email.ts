import sgMail from '@sendgrid/mail'

export async function dispatchEmail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const apiKey = process.env['SENDGRID_API_KEY']
  const from   = process.env['SENDGRID_FROM_EMAIL']
  if (!apiKey || !from) {
    console.warn('[Email] SendGrid credentials not configured — skipping')
    return false
  }
  sgMail.setApiKey(apiKey)
  await sgMail.send({ to, from, subject, html })
  return true
}
