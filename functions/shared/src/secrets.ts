import { defineSecret, defineString, defineInt } from 'firebase-functions/params'

// SendGrid
export const sendgridApiKey = defineSecret('SENDGRID_API_KEY')
export const sendgridFromEmail = defineString('SENDGRID_FROM_EMAIL')
export const staffContactEmail = defineString('STAFF_CONTACT_EMAIL')

// Twilio
export const twilioAccountSid = defineSecret('TWILIO_ACCOUNT_SID')
export const twilioAuthToken = defineSecret('TWILIO_AUTH_TOKEN')
export const twilioFromNumber = defineString('TWILIO_FROM_NUMBER')

// eBay
export const ebayUserToken = defineSecret('EBAY_USER_TOKEN')
export const ebaySandbox = defineString('EBAY_SANDBOX')
export const ebayLocationKey = defineString('EBAY_MERCHANT_LOCATION_KEY')
export const ebayVerificationToken = defineSecret('EBAY_VERIFICATION_TOKEN')
export const ebayWebhookUrl = defineString('EBAY_WEBHOOK_URL')

// Brother POS
export const brotherPosHmacSecret = defineSecret('BROTHER_POS_HMAC_SECRET')

// Misc
export const siteUrl = defineString('SITE_URL')
export const purgeRetentionDays = defineInt('PURGE_RETENTION_DAYS', { default: 730 })

// Backups
export const backupBucketName = defineString('BACKUP_BUCKET_NAME')
