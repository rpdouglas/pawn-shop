"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ebayWebhook = exports.pushToEbay = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const node_crypto_1 = require("node:crypto");
const secrets_1 = require("@pawn-shop/shared/lib/secrets");
// ── Category & condition maps ─────────────────────────────────────────────────
const EBAY_CATEGORY_MAP = {
    electronics: '293',
    jewellery: '281',
    tools: '631',
    collectibles: '1',
    clothing: '11450',
};
// Maps our condition grades to eBay condition IDs
const EBAY_CONDITION_MAP = {
    new: 1000,
    'like-new': 1500,
    good: 3000,
    fair: 5000,
    poor: 7000,
};
const EBAY_DEFAULT_CONDITION = 3000; // Used - Good
// ── Helpers ───────────────────────────────────────────────────────────────────
function isStaffToken(token) {
    return token['admin'] === true || token['manager'] === true;
}
function getEbayBase() {
    return secrets_1.ebaySandbox.value() === 'true'
        ? 'https://api.sandbox.ebay.com'
        : 'https://api.ebay.com';
}
// Node 20 native fetch — no additional dependencies required
async function ebayRequest(method, path, body) {
    const token = secrets_1.ebayUserToken.value();
    if (!token || token === 'dummy')
        throw new https_1.HttpsError('internal', 'EBAY_USER_TOKEN not configured');
    const res = await fetch(`${getEbayBase()}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_CA',
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    // PUT /inventory_item returns 204 No Content on success — no body to parse
    if (res.status === 204)
        return { ok: true, status: 204, data: null };
    let data = null;
    try {
        data = await res.json();
    }
    catch {
        // empty body on unexpected non-204 response
    }
    return { ok: res.ok, status: res.status, data };
}
exports.pushToEbay = (0, https_1.onCall)({ cors: true, secrets: [secrets_1.ebayUserToken] }, async (request) => {
    if (!request.auth || !isStaffToken(request.auth.token)) {
        throw new https_1.HttpsError('permission-denied', 'Admin or manager role required');
    }
    const { itemId } = request.data;
    if (!itemId)
        throw new https_1.HttpsError('invalid-argument', 'itemId is required');
    const db = (0, firestore_1.getFirestore)();
    const itemRef = db.collection('items').doc(itemId);
    const snap = await itemRef.get();
    if (!snap.exists)
        throw new https_1.HttpsError('not-found', `Item ${itemId} not found`);
    const item = snap.data();
    if (item['status'] !== 'active') {
        throw new https_1.HttpsError('failed-precondition', `Item must be active to push to eBay (current: ${String(item['status'])})`);
    }
    if (item['policeHold'] === true) {
        throw new https_1.HttpsError('failed-precondition', 'Item is on police hold and cannot be listed');
    }
    if (item['viewTag'] !== 'pawn') {
        throw new https_1.HttpsError('failed-precondition', 'Only pawn items can be listed on eBay — cannabis and fireworks are prohibited on eBay');
    }
    if (typeof item['ebayListingId'] === 'string' && item['ebayListingId']) {
        throw new https_1.HttpsError('already-exists', `Item is already listed on eBay (ID: ${item['ebayListingId']})`);
    }
    const title = String(item['title'] ?? '');
    const description = String(item['description'] ?? '');
    const category = String(item['category'] ?? '').toLowerCase().trim();
    const condition = String(item['condition'] ?? 'good');
    const priceCents = Number(item['price']);
    const images = item['images'] ?? [];
    const locationKey = secrets_1.ebayLocationKey.value() || 'main_store';
    const sku = itemId;
    // Step 1: Create/update inventory item
    const inventoryResult = await ebayRequest('PUT', `/sell/inventory/v1/inventory_item/${encodeURIComponent(sku)}`, {
        availability: { shipToLocationAvailability: { quantity: 1 } },
        condition: EBAY_CONDITION_MAP[condition] ?? EBAY_DEFAULT_CONDITION,
        product: {
            title,
            description,
            imageUrls: images.slice(0, 12), // eBay maximum 12 images per listing
        },
    });
    if (!inventoryResult.ok) {
        throw new https_1.HttpsError('internal', 'Failed to create eBay inventory item');
    }
    // Step 2: Create offer
    const offerResult = await ebayRequest('POST', '/sell/inventory/v1/offer', {
        sku,
        marketplaceId: 'EBAY_CA',
        format: 'FIXED_PRICE',
        availableQuantity: 1,
        categoryId: EBAY_CATEGORY_MAP[category] ?? '99',
        pricingSummary: {
            price: { value: (priceCents / 100).toFixed(2), currency: 'CAD' },
        },
        listingDescription: description,
        merchantLocationKey: locationKey,
    });
    if (!offerResult.ok || typeof offerResult.data !== 'object' || !offerResult.data) {
        throw new https_1.HttpsError('internal', 'Failed to create eBay offer');
    }
    const offerId = offerResult.data['offerId'];
    if (typeof offerId !== 'string') {
        throw new https_1.HttpsError('internal', 'eBay offer response missing offerId');
    }
    // Step 3: Publish offer → listingId
    const publishResult = await ebayRequest('POST', `/sell/inventory/v1/offer/${encodeURIComponent(offerId)}/publish`, {});
    if (!publishResult.ok || typeof publishResult.data !== 'object' || !publishResult.data) {
        throw new https_1.HttpsError('internal', 'Failed to publish eBay offer');
    }
    const listingId = publishResult.data['listingId'];
    if (typeof listingId !== 'string') {
        throw new https_1.HttpsError('internal', 'eBay publish response missing listingId');
    }
    await itemRef.update({
        ebayListingId: listingId,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    await db.collection('auditLogs').add({
        eventType: 'ebay_push',
        uid: request.auth.uid,
        targetId: itemId,
        details: { itemId, ebayListingId: listingId, viewTag: item['viewTag'] },
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return { success: true, ebayListingId: listingId };
});
exports.ebayWebhook = (0, https_1.onRequest)({ secrets: [secrets_1.ebayVerificationToken] }, async (req, res) => {
    if (req.method === 'GET') {
        const challengeCode = typeof req.query['challenge_code'] === 'string' ? req.query['challenge_code'] : null;
        if (!challengeCode) {
            res.status(400).json({ error: 'challenge_code required' });
            return;
        }
        const verificationToken = secrets_1.ebayVerificationToken.value();
        const endpointUrl = secrets_1.ebayWebhookUrl.value();
        if (!verificationToken || !endpointUrl) {
            res.status(500).json({ error: 'Webhook environment not configured' });
            return;
        }
        const challengeResponse = (0, node_crypto_1.createHash)('sha256')
            .update(challengeCode + verificationToken + endpointUrl)
            .digest('hex');
        res.status(200).json({ challengeResponse });
        return;
    }
    if (req.method !== 'POST') {
        res.status(405).end();
        return;
    }
    const verificationToken = secrets_1.ebayVerificationToken.value();
    if (!verificationToken) {
        res.status(500).json({ error: 'Webhook environment not configured' });
        return;
    }
    const signature = req.headers['x-ebay-signature'];
    if (typeof signature !== 'string') {
        res.status(403).json({ error: 'Missing x-ebay-signature header' });
        return;
    }
    // Firebase Functions preserves the raw body as req.rawBody (Buffer)
    const rawBody = req.rawBody?.toString('utf8') ??
        JSON.stringify(req.body);
    const expectedSignature = (0, node_crypto_1.createHash)('sha256')
        .update(rawBody + verificationToken)
        .digest('base64');
    if (signature !== expectedSignature) {
        res.status(403).json({ error: 'Signature mismatch' });
        return;
    }
    // Respond within eBay's 3-second acknowledgment window; process asynchronously
    res.status(200).json({ success: true });
    try {
        await processEbayNotification(req.body);
    }
    catch (err) {
        console.error('[ebayWebhook] notification processing error:', err);
    }
});
async function processEbayNotification(payload) {
    if (typeof payload !== 'object' || payload === null)
        return;
    const n = payload;
    const topic = n.metadata?.topic ?? '';
    if (!topic.toLowerCase().includes('item_sold'))
        return;
    const data = n.notification?.data;
    if (!data)
        return;
    // eBay may use listingId or itemId depending on notification topic version
    const listingId = String(data['listingId'] ?? data['itemId'] ?? '').trim();
    if (!listingId)
        return;
    const db = (0, firestore_1.getFirestore)();
    const snap = await db.collection('items')
        .where('ebayListingId', '==', listingId)
        .limit(1)
        .get();
    if (snap.empty)
        return;
    const itemDoc = snap.docs[0];
    if (itemDoc.data()['status'] === 'sold')
        return; // Idempotent — already synced
    await itemDoc.ref.update({
        status: 'sold',
        soldAt: firestore_1.FieldValue.serverTimestamp(),
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    await db.collection('auditLogs').add({
        eventType: 'ebay_sync_sold',
        uid: 'ebay_webhook',
        targetId: itemDoc.id,
        details: { itemId: itemDoc.id, ebayListingId: listingId },
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
}
//# sourceMappingURL=ebay.js.map