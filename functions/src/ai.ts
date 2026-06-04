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
    model: genAI.getGenerativeModel({ model: 'gemini-pro-latest' }),
    flashModel: genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
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
    const { model } = getModels()
    const result = await model.generateContent([systemPrompt, userPrompt])
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
    const { model } = getModels()
    const result = await model.generateContent([systemPrompt, userPrompt])
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
    const { flashModel } = getModels()
    const result = await flashModel.generateContent([systemPrompt, userPrompt])
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
  const systemPrompt = `
    You are an expert AI receiving an image of an item being brought into a pawn shop or retail store.
    The store section is: ${viewTag}.
    Analyse the image and extract the fields required for the intake form.
    Also, provide a market pricing deep dive estimating the Average Regular Price, Average Sale Price, and Average Refurbished/Open-Box Price in CAD cents (integer).
    Return strictly JSON with NO markdown formatting, matching this structure:
    {
      "suggestedFields": {
        "title": "string",
        "category": "string",
        "description": "string (1-2 sentences)",
        "condition": "new | like-new | good | fair | poor",
        "brand": "string (if cannabis or relevant)",
        "format": "string (if cannabis)"
      },
      "marketPricing": {
        "avgRegularPriceCents": 0,
        "avgSalePriceCents": 0,
        "avgRefurbPriceCents": 0,
        "currency": "CAD"
      }
    }
  `

  try {
    const { model, flashModel } = getModels()
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
    } catch (flashErr) {
      console.warn('Gemini Flash failed during intake extraction, falling back to Pro:', flashErr)
      result = await model.generateContent(promptParts)
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
