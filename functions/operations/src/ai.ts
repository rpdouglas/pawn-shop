import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { defineSecret } from 'firebase-functions/params'
import { assertStaff } from '@pawn-shop/shared/lib/authHelpers'
import { searchEbayComps } from './ebay'

export const geminiApiKey = defineSecret('GEMINI_API_KEY')

function getModels(schema?: Record<string, unknown>) {
  const genAI = new GoogleGenerativeAI(geminiApiKey.value())
  const config = schema ? { generationConfig: { responseMimeType: "application/json", responseSchema: schema } } : {}
  return {
    model: genAI.getGenerativeModel({ model: 'gemini-3.1-pro', ...config }),
    flashModel: genAI.getGenerativeModel({ model: 'gemini-3.5-flash', ...config }),
    liteModel: genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite', ...config })
  }
}

/**
 * Generate AI Description Draft
 */
export const generateAIDescription = onCall({ secrets: [geminiApiKey] }, async (request) => {
  const db = getFirestore()
  const { uid } = await assertStaff(request)
  const { itemId, title, category, viewTag, condition, provenanceNotes, serialNumber, staffNotes, images } = request.data

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

  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      draft: { type: SchemaType.STRING, description: "150–250 word editorial description" },
      suggestedTags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
      provenanceFlag: { type: SchemaType.BOOLEAN },
      culturalNote: { type: SchemaType.STRING }
    },
    required: ["draft", "suggestedTags", "provenanceFlag", "culturalNote"]
  };

  try {
    const { model, flashModel } = getModels(schema)
    const promptParts: unknown[] = [systemPrompt, userPrompt];
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
      } catch (err) {
        console.warn('Failed to fetch image for AI description context:', err);
      }
    }

    let result
    try {
      result = await model.generateContent(promptParts)
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      if (err?.message?.includes('429') || err?.status === 429 || err?.message?.includes('503') || err?.status === 503) {
        console.warn('Gemini Pro unavailable (Quota/503), falling back to Flash model...')
        result = await flashModel.generateContent(promptParts)
      } else {
        throw err
      }
    }
    const response = result.response
    const text = response.text()
    
    // Clean JSON if needed
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
  const db = getFirestore()
  const { uid } = await assertStaff(request)
  const { itemId, title, category, condition, brandModel, staffNotes } = request.data

  if (!itemId || !title) {
    throw new HttpsError('invalid-argument', 'Missing itemId or title.')
  }

  // Fetch eBay comps
  let ebayContext = 'No recent eBay comps found.'
  try {
    const comps = await searchEbayComps(title)
    if (comps && comps.length > 0) {
      ebayContext = 'RECENT EBAY COMPS:\n' + comps.map(c => `- ${c.title}: ${c.price?.value} ${c.price?.currency}`).join('\n')
    }
  } catch (err) {
    console.warn('eBay comps failed, proceeding without them', err)
  }

  const systemPrompt = `
    You are a pricing analyst for a pawn shop. Analyse eBay sold listings to provide a price range recommendation. This is GUIDANCE ONLY — it is never a final price.
    RULES:
    - Always frame output as a range, never a single price.
    - Always state the basis for your recommendation using the provided comps.
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

    ${ebayContext}

    OUTPUT FORMAT (JSON):
    {
      "low": 0,
      "high": 0,
      "source": "basis for recommendation",
      "confidenceLevel": "high | medium | low",
      "note": "Guidance only."
    }
  `

  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      low: { type: SchemaType.INTEGER },
      high: { type: SchemaType.INTEGER },
      source: { type: SchemaType.STRING },
      confidenceLevel: { type: SchemaType.STRING },
      note: { type: SchemaType.STRING }
    },
    required: ["low", "high", "source", "confidenceLevel", "note"]
  };

  try {
    const { model, flashModel } = getModels(schema)
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
  const db = getFirestore()
  const { uid } = await assertStaff(request)
  const { itemId, title, category, condition, provenanceNotes } = request.data

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
  `

  const userPrompt = `Suggest tags for: ${title} (${category}, ${condition}). Provenance: ${provenanceNotes || 'None'}`

  const schema = {
    type: SchemaType.OBJECT,
    properties: {
      suggestedTags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } }
    },
    required: ["suggestedTags"]
  };

  try {
    const { model, liteModel } = getModels(schema)
    let result
    try {
      result = await liteModel.generateContent([systemPrompt, userPrompt])
    } catch (error: unknown) {
      const err = error as { message?: string; status?: number };
      if (err?.message?.includes('429') || err?.status === 429 || err?.message?.includes('503') || err?.status === 503) {
        console.warn('Gemini Flash Lite unavailable (Quota/503), falling back to Pro model...')
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

function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

/**
 * Extract Intake Data (Image Vision)
 * Called internally by processUploadedImage CF.
 */
export async function extractIntakeData(buffer: Buffer, mimeType: string, viewTag: string) {
  const db = getFirestore()

  let referenceContext = '';

  if (viewTag === 'cannabis') {
    // PASS 1: Extract strain name
    const initialPrompt = `
      You are an expert AI viewing a cannabis product package.
      Extract only the strain name (e.g. "Blue Dream", "Sour Diesel").
    `;
    const strainSchema = {
      type: SchemaType.OBJECT,
      properties: {
        strainName: { type: SchemaType.STRING }
      }
    };
    try {
      const initialParts = [
        initialPrompt,
        { inlineData: { data: buffer.toString('base64'), mimeType: mimeType } }
      ];
      const { flashModel: initialFlashModel } = getModels(strainSchema);
      const initialResult = await initialFlashModel.generateContent(initialParts);
      const jsonStr = initialResult.response.text().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      if (parsed.strainName) {
        // Query database for all strains to do fuzzy matching
        const snap = await db.collection('cannabisStrains').get();
        let bestMatch: Record<string, unknown> | null = null;
        let bestDistance = Infinity;
        for (const doc of snap.docs) {
          const data = doc.data() as Record<string, unknown>;
          if (typeof data.strainName === 'string') {
            const dist = levenshtein(parsed.strainName.toLowerCase(), data.strainName.toLowerCase());
            if (dist < bestDistance) {
              bestDistance = dist;
              bestMatch = data;
            }
          }
        }
        
        if (bestMatch && bestDistance <= Math.max(3, parsed.strainName.length * 0.3)) {
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

  const suggestedFieldsProps = {
    title: { type: SchemaType.STRING },
    category: { type: SchemaType.STRING },
    description: { type: SchemaType.STRING, description: "1-2 sentences" },
    condition: { type: SchemaType.STRING, description: "new | like-new | good | fair | poor" },
    brand: { type: SchemaType.STRING },
    format: { type: SchemaType.STRING }
  };

  const marketPricingProps = {
    avgRegularPriceCents: { type: SchemaType.INTEGER },
    avgSalePriceCents: { type: SchemaType.INTEGER },
    avgRefurbPriceCents: { type: SchemaType.INTEGER },
    currency: { type: SchemaType.STRING, description: "Always CAD" }
  };

  const schemaProps: Record<string, unknown> = {
    suggestedFields: { type: SchemaType.OBJECT, properties: suggestedFieldsProps, required: ["title", "category", "description", "condition", "brand", "format"] },
    marketPricing: { type: SchemaType.OBJECT, properties: marketPricingProps, required: ["avgRegularPriceCents", "avgSalePriceCents", "avgRefurbPriceCents", "currency"] }
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
      type: SchemaType.OBJECT,
      properties: {
        thcMin: { type: SchemaType.NUMBER },
        thcMax: { type: SchemaType.NUMBER },
        cbdMin: { type: SchemaType.NUMBER },
        cbdMax: { type: SchemaType.NUMBER },
        cannabinoidUnit: { type: SchemaType.STRING },
        terpenes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        geneticLineage: { type: SchemaType.STRING },
        effectProfile: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        brand: { type: SchemaType.STRING },
        format: { type: SchemaType.STRING },
        weight: { type: SchemaType.NUMBER },
        lotNumber: { type: SchemaType.STRING },
        packagedDate: { type: SchemaType.STRING },
        subCategory: { type: SchemaType.STRING },
        servings: { type: SchemaType.NUMBER },
        weightPerServing: { type: SchemaType.NUMBER },
        strainType: { type: SchemaType.STRING }
      }
    };
    requiredFields.push("cannabisProfile");
  } else if (viewTag === 'fireworks') {
    systemPrompt += `
    CRITICAL FIREWORKS INSTRUCTIONS:
    - Extract fireworks specific details from the package.
    `;
    
    schemaProps.fireworksProfile = {
      type: SchemaType.OBJECT,
      properties: {
        explosiveWeight: { type: SchemaType.STRING },
        classificationClass: { type: SchemaType.STRING },
        effectType: { type: SchemaType.STRING },
        shots: { type: SchemaType.INTEGER },
        duration: { type: SchemaType.NUMBER },
        noiseLevel: { type: SchemaType.STRING, description: "low | medium | high" }
      }
    };
    requiredFields.push("fireworksProfile");
  }

  const finalSchema = {
    type: SchemaType.OBJECT,
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
