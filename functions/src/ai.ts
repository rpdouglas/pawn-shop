import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { defineSecret } from 'firebase-functions/params'
import { assertStaff } from './auth'

const db = getFirestore()

export const geminiApiKey = defineSecret('GEMINI_API_KEY')

function getModels() {
  const genAI = new GoogleGenerativeAI(geminiApiKey.value())
  return {
    model: genAI.getGenerativeModel({ model: 'gemini-3.1-pro' }),
    flashModel: genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  }
}

/**
 * Generate AI Description Draft
 */
export const generateAIDescription = onCall({ secrets: [geminiApiKey] }, async (request) => {
  const { uid } = await assertStaff(request)
  const { itemId, title, category, viewTag, condition, provenanceNotes, serialNumber, staffNotes } = request.data

  if (!itemId || !title) {
    throw new HttpsError('invalid-argument', 'Missing itemId or title.')
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
  `

  const userPrompt = `
    Generate a product description draft for the following item. Write in the brand voice of The Pawn Shop: dapper, precise, editorial. The description should be 150–250 words.

    ITEM DATA:
    - Title: ${title}
    - Category: ${category}
    - View: ${viewTag}
    - Condition: ${condition}
    - Provenance Notes: ${provenanceNotes || 'None'}
    - Serial Number: ${serialNumber || 'N/A'}
    - Staff Notes: ${staffNotes || 'None'}

    OUTPUT FORMAT (JSON):
    {
      "draft": "150–250 word editorial description",
      "suggestedTags": ["tag1", "tag2"], 
      "provenanceFlag": true | false,
      "culturalNote": "Optional note"
    }
  `

  try {
    const { model, flashModel } = getModels()
    let result
    try {
      result = await model.generateContent([systemPrompt, userPrompt])
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      if (err?.message?.includes('429') || err?.status === 429 || err?.message?.includes('503') || err?.status === 503) {
        console.warn('Gemini Pro unavailable (Quota/503), falling back to Flash model...')
        result = await flashModel.generateContent([systemPrompt, userPrompt])
      } else {
        throw err
      }
    }
    const response = result.response
    const text = response.text()
    
    // Clean JSON if needed (Gemini sometimes adds markdown blocks)
    const jsonStr = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(jsonStr)

    const aiRef = db.collection('items').doc(itemId).collection('internal').doc('ai')
    await aiRef.set({
      aiDescription: parsed.draft,
      aiTagSuggestions: parsed.suggestedTags || [],
      updatedAt: FieldValue.serverTimestamp(),
      generatedBy: uid
    }, { merge: true })

    await db.collection('auditLogs').add({
      eventType: 'ai_description_generated',
      uid,
      targetId: itemId,
      details: { model: 'gemini-pro-latest' },
      createdAt: FieldValue.serverTimestamp()
    })

    return { success: true, ...parsed }
  } catch (err: unknown) {
    console.error('Gemini Error:', err)
    throw new HttpsError('internal', 'Failed to generate AI description.')
  }
})

/**
 * Suggest AI Pricing
 */
export const suggestAiPrice = onCall({ secrets: [geminiApiKey] }, async (request) => {
  const { uid } = await assertStaff(request)
  const { itemId, title, category, condition, brandModel, staffNotes } = request.data

  if (!itemId || !title) {
    throw new HttpsError('invalid-argument', 'Missing itemId or title.')
  }

  const systemPrompt = `
    You are a pricing analyst for a pawn shop. Analyse eBay sold listings to provide a price range recommendation. This is GUIDANCE ONLY — it is never a final price.
    RULES:
    - Always frame output as a range, never a single price.
    - Always state the basis for your recommendation.
    - Prices are in CAD cents (integer).
    - Never frame the suggestion as the "correct" or "recommended" price.
  `

  const userPrompt = `
    Suggest a pricing range for the following item:
    - Title: ${title}
    - Category: ${category}
    - Condition: ${condition}
    - Brand/Model: ${brandModel || 'Unknown'}
    - Staff Notes: ${staffNotes || 'None'}

    OUTPUT FORMAT (JSON):
    {
      "low": 0,
      "high": 0,
      "source": "basis for recommendation",
      "confidenceLevel": "high | medium | low",
      "note": "Guidance only."
    }
  `

  try {
    const { model, flashModel } = getModels()
    let result
    try {
      result = await model.generateContent([systemPrompt, userPrompt])
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      if (err?.message?.includes('429') || err?.status === 429) {
        console.warn('Gemini Pro quota exceeded, falling back to Flash model...')
        result = await flashModel.generateContent([systemPrompt, userPrompt])
      } else {
        throw err
      }
    }
    const jsonStr = result.response.text().replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(jsonStr)

    const aiRef = db.collection('items').doc(itemId).collection('internal').doc('ai')
    await aiRef.set({
      aiPriceSuggestion: parsed,
      updatedAt: FieldValue.serverTimestamp(),
      generatedBy: uid
    }, { merge: true })

    await db.collection('auditLogs').add({
      eventType: 'ai_price_suggested',
      uid,
      targetId: itemId,
      details: { low: parsed.low, high: parsed.high },
      createdAt: FieldValue.serverTimestamp()
    })

    return { success: true, suggestion: parsed }
  } catch (err: unknown) {
    console.error('Gemini Pricing Error:', err)
    throw new HttpsError('internal', 'Failed to suggest AI price.')
  }
})

/**
 * Suggest AI Tags
 */
export const suggestAiTags = onCall({ secrets: [geminiApiKey] }, async (request) => {
  const { uid } = await assertStaff(request)
  const { itemId, title, category, condition, provenanceNotes } = request.data

  const systemPrompt = `
    Suggest merchandising tags from the approved list only: just-arrived, rare-find, limited-edition.
    - just-arrived: recently created.
    - rare-find: genuinely uncommon.
    - limited-edition: confirmed limited run.
    Minimum 3 suggestions or explain why in note.
  `

  const userPrompt = `Suggest tags for: ${title} (${category}, ${condition}). Provenance: ${provenanceNotes || 'None'}`

  try {
    const { model, flashModel } = getModels()
    let result
    try {
      result = await flashModel.generateContent([systemPrompt, userPrompt])
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      if (err?.message?.includes('429') || err?.status === 429 || err?.message?.includes('503') || err?.status === 503) {
        console.warn('Gemini Flash unavailable (Quota/503), falling back to Pro model...')
        result = await model.generateContent([systemPrompt, userPrompt])
      } else {
        throw err
      }
    }
    const jsonStr = result.response.text().replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(jsonStr)

    const aiRef = db.collection('items').doc(itemId).collection('internal').doc('ai')
    await aiRef.set({
      aiTagSuggestions: parsed.suggestedTags || [],
      updatedAt: FieldValue.serverTimestamp(),
      generatedBy: uid
    }, { merge: true })

    return { success: true, tags: parsed.suggestedTags || [] }
  } catch (err: unknown) {
    console.error('Gemini Tag Error:', err)
    throw new HttpsError('internal', 'Failed to suggest AI tags.')
  }
})

/**
 * Extract Intake Data (Image Vision)
 * Called internally by processUploadedImage CF.
 */
export async function extractIntakeData(buffer: Buffer, mimeType: string, viewTag: string) {
  const { model, flashModel } = getModels()

  let referenceContext = '';

  if (viewTag === 'cannabis') {
    // PASS 1: Extract strain name
    const initialPrompt = `
      You are an expert AI viewing a cannabis product package.
      Return strictly JSON with NO markdown formatting, extracting only the strain name (e.g. "Blue Dream", "Sour Diesel").
      { "strainName": "string | null" }
    `;
    try {
      const initialParts = [
        initialPrompt,
        { inlineData: { data: buffer.toString('base64'), mimeType: mimeType } }
      ];
      const initialResult = await flashModel.generateContent(initialParts);
      const jsonStr = initialResult.response.text().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      if (parsed.strainName) {
        // Query database
        const snap = await db.collection('cannabisStrains').where('strainName', '==', parsed.strainName).limit(1).get();
        if (!snap.empty) {
          const strainData = snap.docs[0].data();
          referenceContext = `
            REFERENCE CANNABIS DATA FROM DATABASE:
            Strain Name: ${strainData.strainName}
            Terpenes: ${strainData.terpenes?.join(', ')}
            Genetic Lineage: ${strainData.geneticLineage}
            Effect Profile: ${strainData.effectProfile?.join(', ')}
            THC Range: ${strainData.thcMin} - ${strainData.thcMax}
            CBD Range: ${strainData.cbdMin} - ${strainData.cbdMax}
            Strain Type: ${strainData.strainType}
            
            Use this reference data to INTELLIGENTLY MERGE with what you see on the package. 
            If the package explicitly contradicts the reference (e.g. shows different THC %), prefer the package.
            Otherwise, use the reference data to fill in missing details like terpenes and genetic lineage.
          `;
        }
      }
    } catch (err) {
      console.error('Initial cannabis pass failed, proceeding without reference data:', err);
    }
  }

  let systemPrompt = `
    You are an expert AI receiving an image of an item being brought into a pawn shop or retail store.
    The store section is: ${viewTag}.
    Analyse the image and extract the fields required for the intake form.
    Also, provide a market pricing deep dive estimating the Average Regular Price, Average Sale Price, and Average Refurbished/Open-Box Price in CAD cents (integer).
    ${referenceContext}
  `

  if (viewTag === 'cannabis') {
    systemPrompt += `
    CRITICAL CANNABIS INSTRUCTIONS:
    - Extract details from the package, and merge with any provided REFERENCE CANNABIS DATA.
    - If a single value is provided for THC/CBD (e.g. "20%"), set both the min and max fields to that same value.
    - Extract the cannabinoid unit (e.g., "%" or "mg/g").
    
    Return strictly JSON with NO markdown formatting, matching this structure:
    {
      "suggestedFields": {
        "title": "string",
        "category": "string",
        "description": "string (1-2 sentences)",
        "condition": "new | like-new | good | fair | poor",
        "brand": "string",
        "format": "string"
      },
      "cannabisProfile": {
        "thcMin": "number | null",
        "thcMax": "number | null",
        "cbdMin": "number | null",
        "cbdMax": "number | null",
        "cannabinoidUnit": "string | null",
        "terpenes": ["string"],
        "geneticLineage": "string | null",
        "effectProfile": ["string"],
        "brand": "string | null",
        "format": "string | null",
        "weight": "number | null",
        "lotNumber": "string | null",
        "packagedDate": "string | null",
        "subCategory": "string | null",
        "servings": "number | null",
        "weightPerServing": "number | null",
        "strainType": "string | null"
      },
      "marketPricing": {
        "avgRegularPriceCents": 0,
        "avgSalePriceCents": 0,
        "avgRefurbPriceCents": 0,
        "currency": "CAD"
      }
    }
    `
  } else {
    systemPrompt += `
    Return strictly JSON with NO markdown formatting, matching this structure:
    {
      "suggestedFields": {
        "title": "string",
        "category": "string",
        "description": "string (1-2 sentences)",
        "condition": "new | like-new | good | fair | poor",
        "brand": "string",
        "format": "string"
      },
      "marketPricing": {
        "avgRegularPriceCents": 0,
        "avgSalePriceCents": 0,
        "avgRefurbPriceCents": 0,
        "currency": "CAD"
      }
    }
    `
  }

  try {
    const promptParts = [
      systemPrompt,
      {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: mimeType
        }
      }
    ]

    let result
    try {
      // Attempt with Flash first for speed
      result = await flashModel.generateContent(promptParts)
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      if (err?.message?.includes('429') || err?.status === 429 || err?.message?.includes('503') || err?.status === 503) {
        console.warn('Gemini Flash unavailable during intake extraction, falling back to Pro:', err.message)
        try {
          result = await model.generateContent(promptParts)
        } catch (proError: unknown) {
          console.warn('Gemini Pro also failed, gracefully degrading:', proError)
          return { error: 'Graceful Degradation: AI models unavailable' }
        }
      } else {
        throw error
      }
    }

    try {
      const jsonStr = result.response.text().replace(/```json|```/g, '').trim()
      return JSON.parse(jsonStr)
    } catch {
      console.error('Failed to parse Gemini output. Raw text:', result.response.text())
      return { error: 'Failed to parse AI output into JSON.' }
    }
  } catch (err: unknown) {
    console.error('Gemini Intake Extraction Error:', err)
    return { error: err instanceof Error ? err.message : 'Unknown AI Error' }
  }
}

// ---------------------------------------------------------------------------
// Internal helpers — shared by per-item CFs and batchProcessItems
// ---------------------------------------------------------------------------

interface DescriptionItemData {
  title: string
  category: string
  viewTag: string
  condition: string
  provenanceNotes?: string
  serialNumber?: string
  staffNotes?: string
}

async function generateDescriptionForItem(uid: string, itemId: string, data: DescriptionItemData): Promise<void> {
  const { model, flashModel } = getModels()
  const systemPrompt = `
    You are an expert product copywriter for The Pawn Shop — a premium, dapper, and distinctly Akwesasne retail platform on Cornwall Island. The brand voice is: quiet confidence, editorial precision, occasionally witty. Never shout. Curate.
    Your output is a DRAFT for staff review. It will never be shown to customers until a staff member explicitly approves and promotes it.
    HARD RULES:
    - Never generate Kanien'kéha language. Flag cultural context for staff.
    - Never invent condition grades or specifications. Use only the data provided.
    - Never use scarcity language unless the item data explicitly supports it.
    - Use Canadian English spelling.
    - Cannabis items: boutique wellness framing only. No slang.
  `
  const userPrompt = `
    Generate a product description draft for the following item. Write in the brand voice of The Pawn Shop: dapper, precise, editorial. The description should be 150–250 words.

    ITEM DATA:
    - Title: ${data.title}
    - Category: ${data.category}
    - View: ${data.viewTag}
    - Condition: ${data.condition}
    - Provenance Notes: ${data.provenanceNotes || 'None'}
    - Serial Number: ${data.serialNumber || 'N/A'}
    - Staff Notes: ${data.staffNotes || 'None'}

    OUTPUT FORMAT (JSON):
    {
      "draft": "150–250 word editorial description",
      "suggestedTags": ["tag1", "tag2"],
      "provenanceFlag": true | false,
      "culturalNote": "Optional note"
    }
  `

  let result
  try {
    result = await model.generateContent([systemPrompt, userPrompt])
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number }
    if (err?.message?.includes('429') || err?.status === 429 || err?.message?.includes('503') || err?.status === 503) {
      result = await flashModel.generateContent([systemPrompt, userPrompt])
    } else {
      throw error
    }
  }

  const jsonStr = result.response.text().replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(jsonStr)

  const aiRef = db.collection('items').doc(itemId).collection('internal').doc('ai')
  await aiRef.set({
    aiDescription: parsed.draft,
    aiTagSuggestions: parsed.suggestedTags || [],
    updatedAt: FieldValue.serverTimestamp(),
    generatedBy: uid,
  }, { merge: true })

  await db.collection('auditLogs').add({
    eventType: 'ai_description_generated',
    uid,
    targetId: itemId,
    details: { model: 'gemini-pro-latest', batch: true },
    createdAt: FieldValue.serverTimestamp(),
  })
}

interface PriceItemData {
  title: string
  category: string
  condition: string
  brand?: string
  staffNotes?: string
}

async function suggestPriceForItem(uid: string, itemId: string, data: PriceItemData): Promise<void> {
  const { model, flashModel } = getModels()
  const systemPrompt = `
    You are a pricing analyst for a pawn shop. Analyse eBay sold listings to provide a price range recommendation. This is GUIDANCE ONLY — it is never a final price.
    RULES:
    - Always frame output as a range, never a single price.
    - Always state the basis for your recommendation.
    - Prices are in CAD cents (integer).
    - Never frame the suggestion as the "correct" or "recommended" price.
  `
  const userPrompt = `
    Suggest a pricing range for the following item:
    - Title: ${data.title}
    - Category: ${data.category}
    - Condition: ${data.condition}
    - Brand/Model: ${data.brand || 'Unknown'}
    - Staff Notes: ${data.staffNotes || 'None'}

    OUTPUT FORMAT (JSON):
    {
      "low": 0,
      "high": 0,
      "source": "basis for recommendation",
      "confidenceLevel": "high | medium | low",
      "note": "Guidance only."
    }
  `

  let result
  try {
    result = await model.generateContent([systemPrompt, userPrompt])
  } catch (error: unknown) {
    const err = error as { message?: string; status?: number }
    if (err?.message?.includes('429') || err?.status === 429 || err?.message?.includes('503') || err?.status === 503) {
      result = await flashModel.generateContent([systemPrompt, userPrompt])
    } else {
      throw error
    }
  }

  const jsonStr = result.response.text().replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(jsonStr)

  const aiRef = db.collection('items').doc(itemId).collection('internal').doc('ai')
  await aiRef.set({
    aiPriceSuggestion: parsed,
    updatedAt: FieldValue.serverTimestamp(),
    generatedBy: uid,
  }, { merge: true })

  await db.collection('auditLogs').add({
    eventType: 'ai_price_suggested',
    uid,
    targetId: itemId,
    details: { low: parsed.low, high: parsed.high, batch: true },
    createdAt: FieldValue.serverTimestamp(),
  })
}

// ---------------------------------------------------------------------------
// Batch Process Items — staff-triggered bulk AI for selected inventory rows
// ---------------------------------------------------------------------------

interface BatchProcessPayload {
  itemIds: string[]
  operations: ('description' | 'price')[]
}

interface BatchProcessResult {
  processed: string[]
  failed: Record<string, string>
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const batchProcessItems = onCall({ secrets: [geminiApiKey] }, async (request): Promise<BatchProcessResult> => {
  const { uid } = assertStaff(request)
  const { itemIds, operations } = request.data as BatchProcessPayload

  if (!Array.isArray(itemIds) || itemIds.length === 0) {
    throw new HttpsError('invalid-argument', 'itemIds must be a non-empty array.')
  }
  if (itemIds.length > 20) {
    throw new HttpsError('invalid-argument', 'Maximum 20 items per batch.')
  }
  if (!Array.isArray(operations) || operations.length === 0) {
    throw new HttpsError('invalid-argument', 'operations must be a non-empty array.')
  }

  const processed: string[] = []
  const failed: Record<string, string> = {}

  for (let i = 0; i < itemIds.length; i++) {
    const itemId = itemIds[i]
    try {
      const snap = await db.collection('items').doc(itemId).get()
      if (!snap.exists) {
        failed[itemId] = 'Item not found.'
        continue
      }
      const raw = snap.data() as Record<string, unknown>

      for (const op of operations) {
        if (op === 'description') {
          await generateDescriptionForItem(uid, itemId, {
            title: String(raw.title ?? ''),
            category: String(raw.category ?? ''),
            viewTag: String(raw.viewTag ?? ''),
            condition: String(raw.condition ?? ''),
            provenanceNotes: raw.provenanceNotes ? String(raw.provenanceNotes) : undefined,
            serialNumber: raw.serialNumber ? String(raw.serialNumber) : undefined,
            staffNotes: raw.staffNotes ? String(raw.staffNotes) : undefined,
          })
        } else if (op === 'price') {
          await suggestPriceForItem(uid, itemId, {
            title: String(raw.title ?? ''),
            category: String(raw.category ?? ''),
            condition: String(raw.condition ?? ''),
            brand: raw.brand ? String(raw.brand) : undefined,
            staffNotes: raw.staffNotes ? String(raw.staffNotes) : undefined,
          })
        }
      }

      processed.push(itemId)
    } catch (err: unknown) {
      failed[itemId] = err instanceof Error ? err.message : 'Unknown error.'
    }

    // Rate-limit Gemini — 400ms between items
    if (i < itemIds.length - 1) {
      await delay(400)
    }
  }

  return { processed, failed }
})
