# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cannabis.spec.ts >> Cannabis Persona (Marie) >> encounters age gate, accepts, browses to cannabis item
- Location: e2e/cannabis.spec.ts:29:3

# Error details

```
Error: Failed to seed items/test-cannabis-123
```

# Test source

```ts
  1  | export async function clearFirestore() {
  2  |   const projectId = 'nats-rack' // Emulator project ID
  3  |   const response = await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${projectId}/databases/(default)/documents`, {
  4  |     method: 'DELETE',
  5  |   })
  6  |   if (!response.ok) {
  7  |     throw new Error('Failed to clear Firestore emulator')
  8  |   }
  9  | }
  10 | 
  11 | export async function seedFirestore(collection: string, docId: string, data: any) {
  12 |   const projectId = 'nats-rack'
  13 |   
  14 |   // Format data for Firestore REST API
  15 |   const formatValue = (val: any): any => {
  16 |     if (val === null) return { nullValue: null }
  17 |     if (typeof val === 'boolean') return { booleanValue: val }
  18 |     if (typeof val === 'number') {
  19 |       return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val }
  20 |     }
  21 |     if (typeof val === 'string') return { stringValue: val }
  22 |     if (Array.isArray(val)) return { arrayValue: { values: val.map(formatValue) } }
  23 |     if (typeof val === 'object') {
  24 |       const fields: Record<string, any> = {}
  25 |       for (const [k, v] of Object.entries(val)) {
  26 |         fields[k] = formatValue(v)
  27 |       }
  28 |       return { mapValue: { fields } }
  29 |     }
  30 |     return { stringValue: String(val) }
  31 |   }
  32 | 
  33 |   const document = formatValue(data).mapValue
  34 | 
  35 |   const response = await fetch(`http://127.0.0.1:8080/v1/projects/${projectId}/databases/(default)/documents/${collection}?documentId=${docId}`, {
  36 |     method: 'POST',
  37 |     headers: { 'Content-Type': 'application/json' },
  38 |     body: JSON.stringify(document),
  39 |   })
  40 |   
  41 |   // If POST fails because doc exists, we could use PATCH, but clearFirestore ensures it's clean.
  42 |   if (!response.ok) {
  43 |     const text = await response.text()
  44 |     console.error('Seed error:', text)
> 45 |     throw new Error(`Failed to seed ${collection}/${docId}`)
     |           ^ Error: Failed to seed items/test-cannabis-123
  46 |   }
  47 | }
  48 | 
```