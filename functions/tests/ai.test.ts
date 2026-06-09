import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extractIntakeData } from '../operations/src/ai'

const { mockGenerateContent } = vi.hoisted(() => {
  return { mockGenerateContent: vi.fn() }
})

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return { generateContent: mockGenerateContent }
    }
  },
  SchemaType: {
    OBJECT: 'OBJECT',
    STRING: 'STRING',
    NUMBER: 'NUMBER',
    INTEGER: 'INTEGER',
    BOOLEAN: 'BOOLEAN',
    ARRAY: 'ARRAY',
    ENUM: 'ENUM',
  }
}))

describe('extractIntakeData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should extract pawn data and fallback to flash on 429', async () => {
    // 1st call fails with 429
    mockGenerateContent.mockRejectedValueOnce({ status: 429, message: 'Quota exceeded' })
    
    // 2nd call (flash model) succeeds
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify({
          title: 'Rolex Submariner',
          category: 'Watches',
          condition: 'good',
          aiDescription: 'A classic timepiece.'
        })
      }
    })

    const buffer = Buffer.from('fake-image-data')
    const result = await extractIntakeData(buffer, 'image/jpeg', 'pawn')

    expect(mockGenerateContent).toHaveBeenCalledTimes(2)
    expect(result.title).toBe('Rolex Submariner')
    expect(result.category).toBe('Watches')
    expect(result.aiDescription).toBe('A classic timepiece.')
  })

  it('should run 2-pass extraction for cannabis view', async () => {
    // Pass 1: lite model extracts strain (separate quota from flash)
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify({ strainName: 'Blue Dream' })
      }
    })

    // Pass 2: pro model merges reference data
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () => JSON.stringify({
          title: 'Blue Dream Pre-Roll',
          category: 'cannabis-hybrid',
          cannabisProfile: {
            strainType: 'hybrid'
          }
        })
      }
    })

    const buffer = Buffer.from('fake-image-data')
    const result = await extractIntakeData(buffer, 'image/jpeg', 'cannabis')

    expect(mockGenerateContent).toHaveBeenCalledTimes(2)
    expect(result.title).toBe('Blue Dream Pre-Roll')
    expect(result.cannabisProfile?.strainType).toBe('hybrid')
  })
})
