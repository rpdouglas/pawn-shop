import twilio from 'twilio'
import { twilioAccountSid, twilioAuthToken, twilioFromNumber } from './secrets'

export async function dispatchSms(to: string, body: string): Promise<boolean> {
  const accountSid = twilioAccountSid.value()
  const authToken = twilioAuthToken.value()
  const fromNumber = twilioFromNumber.value()
  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[SMS] Twilio credentials not configured — skipping')
    return false
  }
  const client = twilio(accountSid, authToken)
  await client.messages.create({ body, from: fromNumber, to })
  return true
}
