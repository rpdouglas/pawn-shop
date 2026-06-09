"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchProcessItems = exports.suggestAiTags = exports.suggestAiPrice = exports.generateAIDescription = exports.geminiApiKey = void 0;
exports.extractIntakeData = extractIntakeData;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const generative_ai_1 = require("@google/generative-ai");
const params_1 = require("firebase-functions/params");
const authHelpers_1 = require("@pawn-shop/shared/lib/authHelpers");
const ebay_1 = require("./ebay");
exports.geminiApiKey = (0, params_1.defineSecret)('GEMINI_API_KEY');
function getModels(schema) {
    const genAI = new generative_ai_1.GoogleGenerativeAI(exports.geminiApiKey.value());
    const config = schema ? { generationConfig: { responseMimeType: "application/json", responseSchema: schema } } : {};
    return {
        model: genAI.getGenerativeModel({ model: 'gemini-2.5-pro', ...config }),
        flashModel: genAI.getGenerativeModel({ model: 'gemini-3.5-flash', ...config }),
        liteModel: genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite', ...config })
    };
}
/**
 * Generate AI Description Draft
 */
exports.generateAIDescription = (0, https_1.onCall)({ secrets: [exports.geminiApiKey] }, async (request) => {
    const db = (0, firestore_1.getFirestore)();
    const { uid } = await (0, authHelpers_1.assertStaff)(request);
    const { itemId, title, category, viewTag, condition, provenanceNotes, serialNumber, staffNotes, images } = request.data;
    if (!itemId || !title) {
        throw new https_1.HttpsError('invalid-argument', 'Missing itemId or title.');
    }
    const systemPrompt = `
    You are an expert product copywriter for The Pawn Shop — a premium, dapper, and distinctly Akwesasne retail platform on Cornwall Island. The brand voice is: quiet confidence, editorial precision, occasionally witty. Never shout. Curate.
    Your output is a DRAFT for staff review. It will never be shown to customers until a staff member explicitly approves and promotes it.
    HARD RULES:
    - Never generate Kanien'kéha language. Flag cultural context for staff.
    - Never invent condition grades or specifications. Use only the data provided.
    - Never use scarcity language unless the item data explicitly supports it.
    - Use Canadian English spelling.
    - Cannabis items: boutique wellness framing only. No slang.
  `;
    const userPrompt = `
    Analyse the item image (if provided) and the metadata below. Write in the brand voice of The Pawn Shop: dapper, precise, editorial.

    ITEM DATA:
    - Current Title: ${title}
    - Current Category: ${category}
    - View: ${viewTag}
    - Condition: ${condition}
    - Provenance Notes: ${provenanceNotes || 'None'}
    - Serial Number: ${serialNumber || 'N/A'}
    - Staff Notes: ${staffNotes || 'None'}

    OUTPUT FORMAT (JSON):
    {
      "title": "Concise, accurate product title based on the image/data (max 80 chars)",
      "category": "Specific product category (e.g. Electric Guitar, Vintage Watch, Flower, Pre-Roll Pack)",
      "draft": "150–250 word editorial description in the dapper brand voice",
      "suggestedTags": ["tag1", "tag2"],
      "provenanceFlag": true | false,
      "culturalNote": "Optional note for staff about cultural significance"
    }
  `;
    const schema = {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            title: { type: generative_ai_1.SchemaType.STRING, description: "Concise product title (max 80 chars)" },
            category: { type: generative_ai_1.SchemaType.STRING, description: "Specific product category" },
            draft: { type: generative_ai_1.SchemaType.STRING, description: "150–250 word editorial description" },
            suggestedTags: { type: generative_ai_1.SchemaType.ARRAY, items: { type: generative_ai_1.SchemaType.STRING } },
            provenanceFlag: { type: generative_ai_1.SchemaType.BOOLEAN },
            culturalNote: { type: generative_ai_1.SchemaType.STRING }
        },
        required: ["title", "category", "draft", "suggestedTags", "provenanceFlag", "culturalNote"]
    };
    try {
        const { model, flashModel, liteModel } = getModels(schema);
        const promptParts = [systemPrompt, userPrompt];
        if (images && Array.isArray(images) && images.length > 0) {
            try {
                const imgRes = await fetch(images[0]);
                if (imgRes.ok) {
                    const arrayBuffer = await imgRes.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const mimeType = imgRes.headers.get('content-type') || 'image/jpeg';
                    promptParts.push({
                        inlineData: {
                            data: buffer.toString('base64'),
                            mimeType
                        }
                    });
                }
            }
            catch (err) {
                console.warn('Failed to fetch image for AI description context:', err);
            }
        }
        let result;
        try {
            result = await model.generateContent(promptParts);
        }
        catch (error) {
            const err = error;
            if (err?.message?.includes('429') || err?.status === 429 || err?.message?.includes('503') || err?.status === 503) {
                console.warn('Gemini Pro unavailable (Quota/503), falling back to Flash model...');
                try {
                    result = await flashModel.generateContent(promptParts);
                }
                catch (flashError) {
                    const fe = flashError;
                    if (fe?.message?.includes('429') || fe?.status === 429 || fe?.message?.includes('503') || fe?.status === 503) {
                        console.warn('Gemini Flash unavailable (Quota/503), falling back to Lite model...');
                        result = await liteModel.generateContent(promptParts);
                    }
                    else {
                        throw flashError;
                    }
                }
            }
            else {
                throw err;
            }
        }
        const response = result.response;
        const text = response.text();
        // Clean JSON if needed
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        const aiRef = db.collection('items').doc(itemId).collection('internal').doc('ai');
        await aiRef.set({
            aiTitle: parsed.title || null,
            aiCategory: parsed.category || null,
            aiDescription: parsed.draft,
            aiTagSuggestions: parsed.suggestedTags || [],
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            generatedBy: uid
        }, { merge: true });
        await db.collection('auditLogs').add({
            eventType: 'ai_description_generated',
            uid,
            targetId: itemId,
            details: { model: 'gemini-2.5-pro' },
            createdAt: firestore_1.FieldValue.serverTimestamp()
        });
        return { success: true, ...parsed };
    }
    catch (err) {
        console.error('Gemini Error:', err);
        throw new https_1.HttpsError('internal', 'Failed to generate AI description.');
    }
});
/**
 * Suggest AI Pricing
 */
exports.suggestAiPrice = (0, https_1.onCall)({ secrets: [exports.geminiApiKey] }, async (request) => {
    const db = (0, firestore_1.getFirestore)();
    const { uid } = await (0, authHelpers_1.assertStaff)(request);
    const { itemId, title, category, condition, brandModel, staffNotes, aiDescription } = request.data;
    if (!itemId || !title) {
        throw new https_1.HttpsError('invalid-argument', 'Missing itemId or title.');
    }
    // Fetch eBay comps
    let ebayContext = 'No recent eBay comps found.';
    try {
        const comps = await (0, ebay_1.searchEbayComps)(title);
        if (comps && comps.length > 0) {
            ebayContext = 'RECENT EBAY COMPS:\n' + comps.map(c => {
                const price = c['price'];
                return `- ${String(c['title'] ?? '')}: ${price?.value ?? ''} ${price?.currency ?? ''}`;
            }).join('\n');
        }
    }
    catch (err) {
        console.warn('eBay comps failed, proceeding without them', err);
    }
    const systemPrompt = `
    You are a pricing analyst for a pawn shop. Analyse eBay sold listings to provide a price range recommendation. This is GUIDANCE ONLY — it is never a final price.
    RULES:
    - Always frame output as a range, never a single price.
    - Always state the basis for your recommendation using the provided comps.
    - Prices are in CAD cents (integer).
    - Never frame the suggestion as the "correct" or "recommended" price.
  `;
    const userPrompt = `
    Suggest a pricing range for the following item:
    - Title: ${title}
    - Category: ${category}
    - Condition: ${condition}
    - Brand/Model: ${brandModel || 'Unknown'}
    - Staff Notes: ${staffNotes || 'None'}
    ${aiDescription ? `- Item Description: ${aiDescription}` : ''}

    ${ebayContext}

    OUTPUT FORMAT (JSON):
    {
      "low": 0,
      "high": 0,
      "source": "basis for recommendation",
      "confidenceLevel": "high | medium | low",
      "note": "Guidance only."
    }
  `;
    const schema = {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            low: { type: generative_ai_1.SchemaType.INTEGER },
            high: { type: generative_ai_1.SchemaType.INTEGER },
            source: { type: generative_ai_1.SchemaType.STRING },
            confidenceLevel: { type: generative_ai_1.SchemaType.STRING },
            note: { type: generative_ai_1.SchemaType.STRING }
        },
        required: ["low", "high", "source", "confidenceLevel", "note"]
    };
    try {
        const { model, flashModel, liteModel } = getModels(schema);
        let result;
        try {
            result = await model.generateContent([systemPrompt, userPrompt]);
        }
        catch (error) {
            const err = error;
            if (err?.message?.includes('429') || err?.status === 429 || err?.message?.includes('503') || err?.status === 503) {
                console.warn('Gemini Pro unavailable (Quota/503), falling back to Flash model...');
                try {
                    result = await flashModel.generateContent([systemPrompt, userPrompt]);
                }
                catch (flashError) {
                    const fe = flashError;
                    if (fe?.message?.includes('429') || fe?.status === 429 || fe?.message?.includes('503') || fe?.status === 503) {
                        console.warn('Gemini Flash unavailable (Quota/503), falling back to Lite model...');
                        result = await liteModel.generateContent([systemPrompt, userPrompt]);
                    }
                    else {
                        throw flashError;
                    }
                }
            }
            else {
                throw err;
            }
        }
        const jsonStr = result.response.text().replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        const aiRef = db.collection('items').doc(itemId).collection('internal').doc('ai');
        await aiRef.set({
            aiPriceSuggestion: parsed,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            generatedBy: uid
        }, { merge: true });
        await db.collection('auditLogs').add({
            eventType: 'ai_price_suggested',
            uid,
            targetId: itemId,
            details: { low: parsed.low, high: parsed.high },
            createdAt: firestore_1.FieldValue.serverTimestamp()
        });
        return { success: true, suggestion: parsed };
    }
    catch (err) {
        console.error('Gemini Pricing Error:', err);
        throw new https_1.HttpsError('internal', 'Failed to suggest AI price.');
    }
});
/**
 * Suggest AI Tags
 */
exports.suggestAiTags = (0, https_1.onCall)({ secrets: [exports.geminiApiKey] }, async (request) => {
    const db = (0, firestore_1.getFirestore)();
    const { uid } = await (0, authHelpers_1.assertStaff)(request);
    const { itemId, title, category, condition, provenanceNotes } = request.data;
    const systemPrompt = `
    Suggest merchandising tags from the approved list only: just-arrived, rare-find, limited-edition.
    - just-arrived: recently created.
    - rare-find: genuinely uncommon.
    - limited-edition: confirmed limited run.
    Minimum 3 suggestions or explain why in note.
    
    OUTPUT FORMAT (JSON):
    {
      "suggestedTags": ["tag1", "tag2"]
    }
  `;
    const userPrompt = `Suggest tags for: ${title} (${category}, ${condition}). Provenance: ${provenanceNotes || 'None'}`;
    const schema = {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            suggestedTags: { type: generative_ai_1.SchemaType.ARRAY, items: { type: generative_ai_1.SchemaType.STRING } }
        },
        required: ["suggestedTags"]
    };
    try {
        const { model, liteModel } = getModels(schema);
        let result;
        try {
            result = await liteModel.generateContent([systemPrompt, userPrompt]);
        }
        catch (error) {
            const err = error;
            if (err?.message?.includes('429') || err?.status === 429 || err?.message?.includes('503') || err?.status === 503) {
                console.warn('Gemini Flash Lite unavailable (Quota/503), falling back to Pro model...');
                result = await model.generateContent([systemPrompt, userPrompt]);
            }
            else {
                throw err;
            }
        }
        const jsonStr = result.response.text().replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(jsonStr);
        const aiRef = db.collection('items').doc(itemId).collection('internal').doc('ai');
        await aiRef.set({
            aiTagSuggestions: parsed.suggestedTags || [],
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
            generatedBy: uid
        }, { merge: true });
        return { success: true, tags: parsed.suggestedTags || [] };
    }
    catch (err) {
        console.error('Gemini Tag Error:', err);
        throw new https_1.HttpsError('internal', 'Failed to suggest AI tags.');
    }
});
function batchDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function generateDescriptionForItem(uid, itemId, data) {
    const db = (0, firestore_1.getFirestore)();
    const schema = {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            title: { type: generative_ai_1.SchemaType.STRING, description: "Concise product title (max 80 chars)" },
            category: { type: generative_ai_1.SchemaType.STRING, description: "Specific product category" },
            draft: { type: generative_ai_1.SchemaType.STRING, description: "150–250 word editorial description" },
            suggestedTags: { type: generative_ai_1.SchemaType.ARRAY, items: { type: generative_ai_1.SchemaType.STRING } },
            provenanceFlag: { type: generative_ai_1.SchemaType.BOOLEAN },
            culturalNote: { type: generative_ai_1.SchemaType.STRING }
        },
        required: ["title", "category", "draft", "suggestedTags", "provenanceFlag", "culturalNote"]
    };
    const { model, flashModel, liteModel } = getModels(schema);
    const systemPrompt = `You are an expert product copywriter for The Pawn Shop — a premium, dapper, and distinctly Akwesasne retail platform on Cornwall Island. Brand voice: quiet confidence, editorial precision, occasionally witty.
Your output is a DRAFT for staff review. HARD RULES: Never generate Kanien'kéha language. Never invent condition grades. Never use scarcity language unless data supports it. Canadian English. Cannabis: boutique wellness framing only.`;
    const userPrompt = `Analyse the item image (if provided) and the metadata below. Write in the brand voice of The Pawn Shop.
ITEM DATA: Title: ${data.title} | Category: ${data.category} | View: ${data.viewTag} | Condition: ${data.condition} | Provenance: ${data.provenanceNotes || 'None'} | Serial: ${data.serialNumber || 'N/A'} | Staff Notes: ${data.staffNotes || 'None'}`;
    const promptParts = [systemPrompt, userPrompt];
    if (data.images && data.images.length > 0) {
        try {
            const imgRes = await fetch(data.images[0]);
            if (imgRes.ok) {
                const buffer = Buffer.from(await imgRes.arrayBuffer());
                promptParts.push({ inlineData: { data: buffer.toString('base64'), mimeType: imgRes.headers.get('content-type') || 'image/jpeg' } });
            }
        }
        catch {
            // proceed without image
        }
    }
    let result;
    try {
        result = await model.generateContent(promptParts);
    }
    catch (error) {
        const err = error;
        if (err?.message?.includes('429') || err?.status === 429 || err?.message?.includes('503') || err?.status === 503) {
            console.warn('[batch] Gemini Pro unavailable, falling back to Flash...');
            try {
                result = await flashModel.generateContent(promptParts);
            }
            catch (flashError) {
                const fe = flashError;
                if (fe?.message?.includes('429') || fe?.status === 429 || fe?.message?.includes('503') || fe?.status === 503) {
                    console.warn('[batch] Gemini Flash unavailable, falling back to Lite...');
                    result = await liteModel.generateContent(promptParts);
                }
                else {
                    throw flashError;
                }
            }
        }
        else {
            throw error;
        }
    }
    const parsed = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
    await db.collection('items').doc(itemId).collection('internal').doc('ai').set({
        aiTitle: parsed.title || null,
        aiCategory: parsed.category || null,
        aiDescription: parsed.draft,
        aiTagSuggestions: parsed.suggestedTags || [],
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
        generatedBy: uid
    }, { merge: true });
    await db.collection('auditLogs').add({
        eventType: 'ai_description_generated',
        uid,
        targetId: itemId,
        details: { model: 'gemini-2.5-pro', batch: true },
        createdAt: firestore_1.FieldValue.serverTimestamp()
    });
}
async function suggestPriceForItem(uid, itemId, data) {
    const db = (0, firestore_1.getFirestore)();
    const schema = {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: {
            low: { type: generative_ai_1.SchemaType.INTEGER },
            high: { type: generative_ai_1.SchemaType.INTEGER },
            source: { type: generative_ai_1.SchemaType.STRING },
            confidenceLevel: { type: generative_ai_1.SchemaType.STRING },
            note: { type: generative_ai_1.SchemaType.STRING }
        },
        required: ["low", "high", "source", "confidenceLevel", "note"]
    };
    const { model, flashModel, liteModel } = getModels(schema);
    const systemPrompt = `You are a pricing analyst for a pawn shop. Provide a price range from eBay sold comps. Guidance only. Prices in CAD cents (integer). Always give a range, never a single price.`;
    const userPrompt = `Price range for: Title: ${data.title} | Category: ${data.category} | Condition: ${data.condition} | Brand: ${data.brand || 'Unknown'} | Staff Notes: ${data.staffNotes || 'None'}${data.aiDescription ? ` | Description: ${data.aiDescription}` : ''}`;
    let result;
    try {
        result = await model.generateContent([systemPrompt, userPrompt]);
    }
    catch (error) {
        const err = error;
        if (err?.message?.includes('429') || err?.status === 429 || err?.message?.includes('503') || err?.status === 503) {
            try {
                result = await flashModel.generateContent([systemPrompt, userPrompt]);
            }
            catch (flashError) {
                const fe = flashError;
                if (fe?.message?.includes('429') || fe?.status === 429 || fe?.message?.includes('503') || fe?.status === 503) {
                    result = await liteModel.generateContent([systemPrompt, userPrompt]);
                }
                else {
                    throw flashError;
                }
            }
        }
        else {
            throw error;
        }
    }
    const parsed = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
    await db.collection('items').doc(itemId).collection('internal').doc('ai').set({
        aiPriceSuggestion: parsed,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
        generatedBy: uid
    }, { merge: true });
    await db.collection('auditLogs').add({
        eventType: 'ai_price_suggested',
        uid,
        targetId: itemId,
        details: { low: parsed.low, high: parsed.high, batch: true },
        createdAt: firestore_1.FieldValue.serverTimestamp()
    });
}
exports.batchProcessItems = (0, https_1.onCall)({ secrets: [exports.geminiApiKey] }, async (request) => {
    const { uid } = await (0, authHelpers_1.assertStaff)(request);
    const { itemIds, operations } = request.data;
    if (!Array.isArray(itemIds) || itemIds.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'itemIds must be a non-empty array.');
    }
    if (itemIds.length > 20) {
        throw new https_1.HttpsError('invalid-argument', 'Maximum 20 items per batch.');
    }
    if (!Array.isArray(operations) || operations.length === 0) {
        throw new https_1.HttpsError('invalid-argument', 'operations must be a non-empty array.');
    }
    const db = (0, firestore_1.getFirestore)();
    const processed = [];
    const failed = {};
    for (let i = 0; i < itemIds.length; i++) {
        const itemId = itemIds[i];
        try {
            const snap = await db.collection('items').doc(itemId).get();
            if (!snap.exists) {
                failed[itemId] = 'Item not found.';
                continue;
            }
            const raw = snap.data();
            for (const op of operations) {
                if (op === 'description') {
                    await generateDescriptionForItem(uid, itemId, {
                        title: String(raw['title'] ?? ''),
                        category: String(raw['category'] ?? ''),
                        viewTag: String(raw['viewTag'] ?? ''),
                        condition: String(raw['condition'] ?? ''),
                        provenanceNotes: raw['provenanceNotes'] ? String(raw['provenanceNotes']) : undefined,
                        serialNumber: raw['serialNumber'] ? String(raw['serialNumber']) : undefined,
                        staffNotes: raw['staffNotes'] ? String(raw['staffNotes']) : undefined,
                        images: Array.isArray(raw['images']) ? raw['images'] : undefined
                    });
                }
                else if (op === 'price') {
                    await suggestPriceForItem(uid, itemId, {
                        title: String(raw['title'] ?? ''),
                        category: String(raw['category'] ?? ''),
                        condition: String(raw['condition'] ?? ''),
                        brand: raw['brand'] ? String(raw['brand']) : undefined,
                        staffNotes: raw['staffNotes'] ? String(raw['staffNotes']) : undefined
                    });
                }
            }
            processed.push(itemId);
        }
        catch (err) {
            failed[itemId] = err instanceof Error ? err.message : 'Unknown error.';
        }
        if (i < itemIds.length - 1) {
            await batchDelay(400);
        }
    }
    return { processed, failed };
});
function levenshtein(a, b) {
    if (a.length === 0)
        return b.length;
    if (b.length === 0)
        return a.length;
    const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++)
        matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++)
        matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
        }
    }
    return matrix[a.length][b.length];
}
/**
 * Extract Intake Data (Image Vision)
 * Called internally by processUploadedImage CF.
 */
async function extractIntakeData(buffer, mimeType, viewTag) {
    const db = (0, firestore_1.getFirestore)();
    console.info(`[extractIntakeData] called viewTag=${viewTag} mimeType=${mimeType} bufferBytes=${buffer.length}`);
    let referenceContext = '';
    if (viewTag === 'cannabis') {
        // PASS 1: Extract strain name
        const initialPrompt = `
      You are an expert AI viewing a cannabis product package.
      Extract only the strain name (e.g. "Blue Dream", "Sour Diesel").
    `;
        const strainSchema = {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                strainName: { type: generative_ai_1.SchemaType.STRING }
            }
        };
        try {
            const initialParts = [
                initialPrompt,
                { inlineData: { data: buffer.toString('base64'), mimeType: mimeType } }
            ];
            const { liteModel: initialLiteModel } = getModels(strainSchema);
            const initialResult = await initialLiteModel.generateContent(initialParts);
            const jsonStr = initialResult.response.text().replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            if (parsed.strainName) {
                console.info(`[extractIntakeData] cannabis pass1 strainName="${parsed.strainName}"`);
                // Query database for all strains to do fuzzy matching
                const snap = await db.collection('cannabisStrains').get();
                let bestMatch = null;
                let bestDistance = Infinity;
                for (const doc of snap.docs) {
                    const data = doc.data();
                    if (typeof data.strainName === 'string') {
                        const dist = levenshtein(parsed.strainName.toLowerCase(), data.strainName.toLowerCase());
                        if (dist < bestDistance) {
                            bestDistance = dist;
                            bestMatch = data;
                        }
                    }
                }
                if (bestMatch && bestDistance <= Math.max(3, parsed.strainName.length * 0.3)) {
                    console.info(`[extractIntakeData] fuzzy match bestMatch="${bestMatch.strainName}" distance=${bestDistance}`);
                    const strainData = bestMatch;
                    referenceContext = `
            REFERENCE CANNABIS DATA FROM DATABASE:
            Strain Name: ${strainData.strainName}
            Terpenes: ${Array.isArray(strainData.terpenes) ? strainData.terpenes.join(', ') : ''}
            Genetic Lineage: ${strainData.geneticLineage}
            Effect Profile: ${Array.isArray(strainData.effectProfile) ? strainData.effectProfile.join(', ') : ''}
            THC Range: ${strainData.thcMin} - ${strainData.thcMax}
            CBD Range: ${strainData.cbdMin} - ${strainData.cbdMax}
            Strain Type: ${strainData.strainType}

            Use this reference data to INTELLIGENTLY MERGE with what you see on the package.
            If the package explicitly contradicts the reference (e.g. shows different THC %), prefer the package.
            Otherwise, use the reference data to fill in missing details like terpenes and genetic lineage.
          `;
                }
                else {
                    console.info(`[extractIntakeData] fuzzy match: no close match found distance=${bestDistance === Infinity ? 'n/a' : bestDistance}`);
                }
            }
        }
        catch (err) {
            console.error('Initial cannabis pass failed, proceeding without reference data:', err);
        }
    }
    let systemPrompt = `
    You are an expert AI receiving an image of an item being brought into a pawn shop or retail store.
    The store section is: ${viewTag}.
    Analyse the image and extract the fields required for the intake form.
    Also, provide a market pricing deep dive estimating the Average Regular Price, Average Sale Price, and Average Refurbished/Open-Box Price in CAD cents (integer).
    ${referenceContext}
  `;
    const suggestedFieldsProps = {
        title: { type: generative_ai_1.SchemaType.STRING },
        category: { type: generative_ai_1.SchemaType.STRING },
        description: { type: generative_ai_1.SchemaType.STRING, description: "1-2 sentences" },
        condition: { type: generative_ai_1.SchemaType.STRING, description: "new | like-new | good | fair | poor" },
        brand: { type: generative_ai_1.SchemaType.STRING },
        format: { type: generative_ai_1.SchemaType.STRING }
    };
    const marketPricingProps = {
        avgRegularPriceCents: { type: generative_ai_1.SchemaType.INTEGER },
        avgSalePriceCents: { type: generative_ai_1.SchemaType.INTEGER },
        avgRefurbPriceCents: { type: generative_ai_1.SchemaType.INTEGER },
        currency: { type: generative_ai_1.SchemaType.STRING, description: "Always CAD" }
    };
    const schemaProps = {
        suggestedFields: { type: generative_ai_1.SchemaType.OBJECT, properties: suggestedFieldsProps, required: ["title", "category", "description", "condition", "brand", "format"] },
        marketPricing: { type: generative_ai_1.SchemaType.OBJECT, properties: marketPricingProps, required: ["avgRegularPriceCents", "avgSalePriceCents", "avgRefurbPriceCents", "currency"] }
    };
    const requiredFields = ["suggestedFields", "marketPricing"];
    if (viewTag === 'cannabis') {
        systemPrompt += `
    CRITICAL CANNABIS INSTRUCTIONS:
    - Extract details from the package, and merge with any provided REFERENCE CANNABIS DATA.
    - If a single value is provided for THC/CBD (e.g. "20%"), set both the min and max fields to that same value.
    - Extract the cannabinoid unit (e.g., "%" or "mg/g").
    `;
        schemaProps.cannabisProfile = {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                thcMin: { type: generative_ai_1.SchemaType.NUMBER },
                thcMax: { type: generative_ai_1.SchemaType.NUMBER },
                cbdMin: { type: generative_ai_1.SchemaType.NUMBER },
                cbdMax: { type: generative_ai_1.SchemaType.NUMBER },
                cannabinoidUnit: { type: generative_ai_1.SchemaType.STRING },
                terpenes: { type: generative_ai_1.SchemaType.ARRAY, items: { type: generative_ai_1.SchemaType.STRING } },
                geneticLineage: { type: generative_ai_1.SchemaType.STRING },
                effectProfile: { type: generative_ai_1.SchemaType.ARRAY, items: { type: generative_ai_1.SchemaType.STRING } },
                brand: { type: generative_ai_1.SchemaType.STRING },
                format: { type: generative_ai_1.SchemaType.STRING },
                weight: { type: generative_ai_1.SchemaType.NUMBER },
                lotNumber: { type: generative_ai_1.SchemaType.STRING },
                packagedDate: { type: generative_ai_1.SchemaType.STRING },
                subCategory: { type: generative_ai_1.SchemaType.STRING },
                servings: { type: generative_ai_1.SchemaType.NUMBER },
                weightPerServing: { type: generative_ai_1.SchemaType.NUMBER },
                strainType: { type: generative_ai_1.SchemaType.STRING }
            }
        };
        requiredFields.push("cannabisProfile");
    }
    else if (viewTag === 'fireworks') {
        systemPrompt += `
    CRITICAL FIREWORKS INSTRUCTIONS:
    - Extract fireworks specific details from the package.
    `;
        schemaProps.fireworksProfile = {
            type: generative_ai_1.SchemaType.OBJECT,
            properties: {
                explosiveWeight: { type: generative_ai_1.SchemaType.STRING },
                classificationClass: { type: generative_ai_1.SchemaType.STRING },
                effectType: { type: generative_ai_1.SchemaType.STRING },
                shots: { type: generative_ai_1.SchemaType.INTEGER },
                duration: { type: generative_ai_1.SchemaType.NUMBER },
                noiseLevel: { type: generative_ai_1.SchemaType.STRING, description: "low | medium | high" }
            }
        };
        requiredFields.push("fireworksProfile");
    }
    const finalSchema = {
        type: generative_ai_1.SchemaType.OBJECT,
        properties: schemaProps,
        required: requiredFields
    };
    const { model, flashModel } = getModels(finalSchema);
    try {
        const promptParts = [
            systemPrompt,
            {
                inlineData: {
                    data: buffer.toString('base64'),
                    mimeType: mimeType
                }
            }
        ];
        let result;
        let modelUsed = 'flash';
        try {
            // Attempt with Flash first for speed
            console.info('[extractIntakeData] attempting Gemini Flash');
            result = await flashModel.generateContent(promptParts);
            console.info(`[extractIntakeData] Flash succeeded rawLength=${result.response.text().length}`);
        }
        catch (error) {
            const err = error;
            if (err?.message?.includes('429') || err?.status === 429 || err?.message?.includes('503') || err?.status === 503) {
                console.warn(`[extractIntakeData] Flash failed (${err?.status ?? err?.message}), falling back to Pro`);
                modelUsed = 'pro';
                try {
                    result = await model.generateContent(promptParts);
                    console.info(`[extractIntakeData] Pro succeeded rawLength=${result.response.text().length}`);
                }
                catch (proError) {
                    console.warn('[extractIntakeData] Pro also failed, gracefully degrading:', proError);
                    return { error: 'Graceful Degradation: AI models unavailable' };
                }
            }
            else {
                throw error;
            }
        }
        try {
            const rawText = result.response.text();
            const jsonStr = rawText.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(jsonStr);
            console.info(`[extractIntakeData] JSON parse succeeded model=${modelUsed} title="${parsed.suggestedFields?.title ?? ''}" category="${parsed.suggestedFields?.category ?? ''}"`);
            return parsed;
        }
        catch {
            const rawText = result.response.text();
            console.error(`[extractIntakeData] JSON parse failed model=${modelUsed} rawText=${rawText.slice(0, 300)}`);
            return { error: 'Failed to parse AI output into JSON.' };
        }
    }
    catch (err) {
        console.error('Gemini Intake Extraction Error:', err);
        return { error: err instanceof Error ? err.message : 'Unknown AI Error' };
    }
}
//# sourceMappingURL=ai.js.map