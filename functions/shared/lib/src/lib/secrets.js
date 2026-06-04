"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backupBucketName = exports.purgeRetentionDays = exports.siteUrl = exports.brotherPosHmacSecret = exports.ebayWebhookUrl = exports.ebayVerificationToken = exports.ebayLocationKey = exports.ebaySandbox = exports.ebayUserToken = exports.twilioFromNumber = exports.twilioAuthToken = exports.twilioAccountSid = exports.staffContactEmail = exports.sendgridFromEmail = exports.sendgridApiKey = void 0;
const params_1 = require("firebase-functions/params");
// SendGrid
exports.sendgridApiKey = (0, params_1.defineSecret)('SENDGRID_API_KEY');
exports.sendgridFromEmail = (0, params_1.defineString)('SENDGRID_FROM_EMAIL');
exports.staffContactEmail = (0, params_1.defineString)('STAFF_CONTACT_EMAIL');
// Twilio
exports.twilioAccountSid = (0, params_1.defineSecret)('TWILIO_ACCOUNT_SID');
exports.twilioAuthToken = (0, params_1.defineSecret)('TWILIO_AUTH_TOKEN');
exports.twilioFromNumber = (0, params_1.defineString)('TWILIO_FROM_NUMBER');
// eBay
exports.ebayUserToken = (0, params_1.defineSecret)('EBAY_USER_TOKEN');
exports.ebaySandbox = (0, params_1.defineString)('EBAY_SANDBOX');
exports.ebayLocationKey = (0, params_1.defineString)('EBAY_MERCHANT_LOCATION_KEY');
exports.ebayVerificationToken = (0, params_1.defineSecret)('EBAY_VERIFICATION_TOKEN');
exports.ebayWebhookUrl = (0, params_1.defineString)('EBAY_WEBHOOK_URL');
// Brother POS
exports.brotherPosHmacSecret = (0, params_1.defineSecret)('BROTHER_POS_HMAC_SECRET');
// Misc
exports.siteUrl = (0, params_1.defineString)('SITE_URL');
exports.purgeRetentionDays = (0, params_1.defineInt)('PURGE_RETENTION_DAYS', { default: 730 });
// Backups
exports.backupBucketName = (0, params_1.defineString)('BACKUP_BUCKET_NAME');
//# sourceMappingURL=secrets.js.map