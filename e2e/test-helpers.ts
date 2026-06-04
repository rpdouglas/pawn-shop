export async function clearFirestore() {
  const projectId = 'nats-rack' // Emulator project ID
  const response = await fetch(`http://127.0.0.1:8080/emulator/v1/projects/${projectId}/databases/(default)/documents`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer owner' }
  })
  if (!response.ok) {
    throw new Error('Failed to clear Firestore emulator')
  }
}

export async function seedFirestore(collection: string, docId: string, data: any) {
  const projectId = 'nats-rack'
  
  // Format data for Firestore REST API
  const formatValue = (val: any): any => {
    if (val === null) return { nullValue: null }
    if (typeof val === 'boolean') return { booleanValue: val }
    if (typeof val === 'number') {
      return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val }
    }
    if (typeof val === 'string') return { stringValue: val }
    if (Array.isArray(val)) return { arrayValue: { values: val.map(formatValue) } }
    if (typeof val === 'object') {
      const fields: Record<string, any> = {}
      for (const [k, v] of Object.entries(val)) {
        fields[k] = formatValue(v)
      }
      return { mapValue: { fields } }
    }
    return { stringValue: String(val) }
  }

  const document = formatValue(data).mapValue

  const response = await fetch(`http://127.0.0.1:8080/v1/projects/${projectId}/databases/(default)/documents/${collection}?documentId=${docId}`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer owner' 
    },
    body: JSON.stringify(document),
  })
  
  // If POST fails because doc exists, we could use PATCH, but clearFirestore ensures it's clean.
  if (!response.ok) {
    const text = await response.text()
    console.error('Seed error:', text)
    throw new Error(`Failed to seed ${collection}/${docId}`)
  }
}
