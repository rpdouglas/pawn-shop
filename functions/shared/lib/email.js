"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dispatchEmail = dispatchEmail;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const secrets_1 = require("./secrets");
async function dispatchEmail(to, subject, html) {
    const apiKey = secrets_1.sendgridApiKey.value();
    const from = secrets_1.sendgridFromEmail.value();
    if (!apiKey || !from || apiKey === 'dummy' || from === 'dummy') {
        console.warn('[Email] SendGrid credentials not configured — skipping');
        return false;
    }
    mail_1.default.setApiKey(apiKey);
    await mail_1.default.send({ to, from, subject, html });
    return true;
}
//# sourceMappingURL=email.js.map