"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchSms = dispatchSms;
const twilio_1 = __importDefault(require("twilio"));
const secrets_1 = require("./secrets");
async function dispatchSms(to, body) {
    const accountSid = secrets_1.twilioAccountSid.value();
    const authToken = secrets_1.twilioAuthToken.value();
    const fromNumber = secrets_1.twilioFromNumber.value();
    if (!accountSid || !authToken || !fromNumber || accountSid === 'dummy') {
        console.warn('[SMS] Twilio credentials not configured — skipping');
        return false;
    }
    const client = (0, twilio_1.default)(accountSid, authToken);
    await client.messages.create({ body, from: fromNumber, to });
    return true;
}
//# sourceMappingURL=sms.js.map