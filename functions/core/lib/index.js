"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase-admin/app");
const v2_1 = require("firebase-functions/v2");
(0, app_1.initializeApp)();
(0, v2_1.setGlobalOptions)({
    maxInstances: 10,
    concurrency: 80,
    minInstances: 0,
    enforceAppCheck: false
});
__exportStar(require("./auth"), exports);
__exportStar(require("./crm"), exports);
__exportStar(require("./ageGate"), exports);
__exportStar(require("./storeHours"), exports);
__exportStar(require("./serialBlacklist"), exports);
__exportStar(require("./purgeExpiredData"), exports);
__exportStar(require("./activity"), exports);
__exportStar(require("./backup"), exports);
__exportStar(require("./loanTickets"), exports);
__exportStar(require("./pawnAgreement"), exports);
__exportStar(require("./pawnRequests"), exports);
__exportStar(require("./reservations"), exports);
__exportStar(require("./preorders"), exports);
__exportStar(require("./campaigns"), exports);
__exportStar(require("./disputes"), exports);
__exportStar(require("./articles"), exports);
__exportStar(require("./faqs"), exports);
__exportStar(require("./scheduling"), exports);
__exportStar(require("./notifications"), exports);
__exportStar(require("./social"), exports);
//# sourceMappingURL=index.js.map