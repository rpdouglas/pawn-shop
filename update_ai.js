const fs = require('fs');

const code = fs.readFileSync('functions/operations/src/ai.ts', 'utf8');

const levenshteinCode = `
function getLevenshteinDistance(a: string, b: string): number {
  if (!a || !b) return (a || b || '').length;
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
`;

// Insert levenshtein before extractIntakeData
const newCode1 = code.replace('export async function extractIntakeData(', levenshteinCode + '\nexport async function extractIntakeData(');

// Now let's replace the whole extractIntakeData function body.
const extractMatch = newCode1.match(/export async function extractIntakeData\([\s\S]*?}\n/);

const newExtractCode = `export async function extractIntakeData(buffer: Buffer, mimeType: string, viewTag: string) {
  const db = getFirestore()
  const { model: baseModel, flashModel: baseFlashModel } = getModels()

  let referenceContext = '';

  if (viewTag === 'cannabis') {
    // PASS 1: Extract strain name
    const initialPrompt = \`
      You are an expert AI viewing a cannabis product package.
      Extract only the strain name (e.g. "Blue Dream", "Sour Diesel").
    \`;
    const initialSchema = {
      type: SchemaType.OBJECT,
      properties: { strainName: { type: SchemaType.STRING, nullable: true } }
    };
    try {
      const { liteModel: initialLiteModel } = getModels(initialSchema);
      const initialParts = [
        initialPrompt,
        { inlineData: { data: buffer.toString('base64'), mimeType: mimeType } }
      ];
      const initialResult = await initialLiteModel.generateContent(initialParts);
      const jsonStr = initialResult.response.text().replace(/\`\`\`json|\`\`\`/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      if (parsed.strainName) {
        const snap = await db.collection('cannabisStrains').get();
        if (!snap.empty) {
          const target = parsed.strainName.toLowerCase();
          let bestMatch = null;
          let bestDist = Infinity;
          snap.docs.forEach(doc => {
            const data = doc.data();
            const dist = getLevenshteinDistance(target, (data.strainName || '').toLowerCase());
            if (dist < bestDist) {
              bestDist = dist;
              bestMatch = data;
            }
          });
          if (bestMatch && bestDist <= 3) {
            const strainData = bestMatch;
            referenceContext = \`
            REFERENCE CANNABIS DATA FROM DATABASE:
            Strain Name: \${strainData.strainName}
            Terpenes: \${strainData.terpenes?.join(', ')}
            Genetic Lineage: \${strainData.geneticLineage}
            Effect Profile: \${strainData.effectProfile?.join(', ')}
            THC Range: \${strainData.thcMin} - \${strainData.thcMax}
            CBD Range: \${strainData.cbdMin} - \${strainData.cbdMax}
            Strain Type: \${strainData.strainType}
            
            Use this reference data to INTELLIGENTLY MERGE with what you see on the package. 
            If the package explicitly contradicts the reference (e.g. shows different THC %), prefer the package.
            Otherwise, use the reference data to fill in missing details like terpenes and genetic lineage.
            \`;
          }
        }
      }
    } catch (err) {
      console.error('Initial cannabis pass failed, proceeding without reference data:', err);
    }
  }

  let systemPrompt = \`
    You are an expert AI receiving an image of an item being brought into a pawn shop or retail store.
    The store section is: \${viewTag}.
    Analyse the image and extract the fields required for the intake form.
    Also, provide a market pricing deep dive estimating the Average Regular Price, Average Sale Price, and Average Refurbished/Open-Box Price in CAD cents (integer).
    \${referenceContext}
  \`

  const finalSchema: any = {
    type: SchemaType.OBJECT,
    properties: {
      suggestedFields: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          category: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          condition: { type: SchemaType.STRING },
          brand: { type: SchemaType.STRING },
          format: { type: SchemaType.STRING }
        }
      },
      marketPricing: {
        type: SchemaType.OBJECT,
        properties: {
          avgRegularPriceCents: { type: SchemaType.INTEGER },
          avgSalePriceCents: { type: SchemaType.INTEGER },
          avgRefurbPriceCents: { type: SchemaType.INTEGER },
          currency: { type: SchemaType.STRING }
        }
      }
    }
  };

  if (viewTag === 'cannabis') {
    systemPrompt += \`
    CRITICAL CANNABIS INSTRUCTIONS:
    - Extract details from the package, and merge with any provided REFERENCE CANNABIS DATA.
    - If a single value is provided for THC/CBD (e.g. "20%"), set both the min and max fields to that same value.
    - Extract the cannabinoid unit (e.g., "%" or "mg/g").
    \`;
    finalSchema.properties.cannabisProfile = {
      type: SchemaType.OBJECT,
      properties: {
        thcMin: { type: SchemaType.NUMBER, nullable: true },
        thcMax: { type: SchemaType.NUMBER, nullable: true },
        cbdMin: { type: SchemaType.NUMBER, nullable: true },
        cbdMax: { type: SchemaType.NUMBER, nullable: true },
        cannabinoidUnit: { type: SchemaType.STRING, nullable: true },
        terpenes: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        geneticLineage: { type: SchemaType.STRING, nullable: true },
        effectProfile: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        brand: { type: SchemaType.STRING, nullable: true },
        format: { type: SchemaType.STRING, nullable: true },
        weight: { type: SchemaType.NUMBER, nullable: true },
        lotNumber: { type: SchemaType.STRING, nullable: true },
        packagedDate: { type: SchemaType.STRING, nullable: true },
        subCategory: { type: SchemaType.STRING, nullable: true },
        servings: { type: SchemaType.NUMBER, nullable: true },
        weightPerServing: { type: SchemaType.NUMBER, nullable: true },
        strainType: { type: SchemaType.STRING, nullable: true }
      }
    };
  } else if (viewTag === 'fireworks') {
    systemPrompt += \`
    CRITICAL FIREWORKS INSTRUCTIONS:
    - Extract fireworks specific details from the package.
    \`;
    finalSchema.properties.fireworksProfile = {
      type: SchemaType.OBJECT,
      properties: {
        explosiveWeight: { type: SchemaType.STRING, nullable: true },
        classificationClass: { type: SchemaType.STRING, nullable: true },
        effectType: { type: SchemaType.STRING, nullable: true },
        shots: { type: SchemaType.NUMBER, nullable: true },
        duration: { type: SchemaType.NUMBER, nullable: true },
        noiseLevel: { type: SchemaType.STRING, nullable: true }
      }
    };
  }

  try {
    const { model, flashModel } = getModels(finalSchema);
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
      const jsonStr = result.response.text().replace(/\`\`\`json|\`\`\`/g, '').trim()
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
`;

const finalCode = newCode1.substring(0, extractMatch.index) + newExtractCode;

fs.writeFileSync('functions/operations/src/ai.ts', finalCode, 'utf8');
console.log('Success');
