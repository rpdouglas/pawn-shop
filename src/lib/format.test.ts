import { describe, it, expect } from 'vitest'
import { formatPrice } from './format'

describe('formatPrice', () => {
  it('formats cents into CAD string', () => {
    expect(formatPrice(1000)).toBe('$10.00 CAD')
    expect(formatPrice(0)).toBe('$0.00 CAD')
    expect(formatPrice(99)).toBe('$0.99 CAD')
  })
})
