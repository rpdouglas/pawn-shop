import twilio from 'twilio'

export async function dispatchSms(to: string, body: string): Promise<boolean> {
  const accountSid = process.env['TWILIO_ACCOUNT_SID']
  const authToken = process.env['TWILIO_AUTH_TOKEN']
  const fromNumber = process.env['TWILIO_FROM_NUMBER']
  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[SMS] Twilio credentials not configured — skipping')
    return false
  }
  const client = twilio(accountSid, authToken)
  await client.messages.create({ body, from: fromNumber, to })
  return true
}
