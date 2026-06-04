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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.receivePosWebhook = void 0;
const https_1 = require("firebase-functions/v2/https");
const crypto = __importStar(require("crypto"));
const secrets_1 = require("@pawn-shop/shared/lib/secrets");
const firestore_1 = require("firebase-admin/firestore");
// ── receivePosWebhook ─────────────────────────────────────────────────────────
// Brother POS webhook receiver stub (E42).
// Validates the HMAC-SHA256 signature, parses the event payload, and transitions
// posSyncStatus → 'pending' on the matched item. No live processing until
// Brother POS API credentials are configured and the integration is activated.
//
// Required environment variable (Secret Manager or .env):
//   BROTHER_POS_HMAC_SECRET — shared secret agreed with Brother POS
//
// Brother POS must POST to this function's deployed URL and include:
//   X-Brother-POS-Signature: hex(HMAC-SHA256(body, secret))
exports.receivePosWebhook = (0, https_1.onRequest)({ secrets: [secrets_1.brotherPosHmacSecret] }, async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    // ── HMAC verification (skipped if secret not yet configured) ──────────────
    const secret = secrets_1.brotherPosHmacSecret.value();
    if (secret && secret !== 'dummy') {
        const signature = req.headers['x-brother-pos-signature'];
        if (typeof signature !== 'string') {
            res.status(401).json({ error: 'Missing X-Brother-POS-Signature header' });
            return;
        }
        const expected = crypto.createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');
        if (signature !== expected) {
            res.status(401).json({ error: 'Invalid signature' });
            return;
        }
    }
    const payload = req.body;
    const posId = typeof payload['itemId'] === 'string' ? payload['itemId'] : undefined;
    const eventType = typeof payload['event'] === 'string' ? payload['event'] : 'unknown';
    // ── Stub processing: mark matched item as pending sync ────────────────────
    if (posId) {
        try {
            const db = (0, firestore_1.getFirestore)();
            const snap = await db.collection('items')
                .where('posId', '==', posId)
                .limit(1)
                .get();
            if (!snap.empty) {
                await snap.docs[0].ref.update({
                    posSyncStatus: 'pending',
                    updatedAt: firestore_1.FieldValue.serverTimestamp(),
                });
            }
        }
        catch (err) {
            console.error('[POS Webhook] Firestore update failed', err);
        }
    }
    console.info(`[POS Webhook] received event=${eventType} posId=${posId ?? 'none'}`);
    res.status(200).json({ received: true });
});
//# sourceMappingURL=pos.js.map