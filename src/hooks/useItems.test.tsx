import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { useItems } from './useItems'
import * as firestore from 'firebase/firestore'

vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>()
  return {
    ...actual,
    collection: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    onSnapshot: vi.fn(),
  }
})

vi.mock('../lib/firebase', () => ({
  db: {}
}))

describe('useItems', () => {
  it('subscribes to firestore and returns items', async () => {
    const mockUnsubscribe = vi.fn()
    const mockOnSnapshot = firestore.onSnapshot as any

    mockOnSnapshot.mockImplementation((q: any, onNext: any) => {
      onNext({
        docs: [
          {
            id: '1',
            data: () => ({
              title: 'Test Item',
              viewTag: 'pawn',
              status: 'active',
              price: 10000,
            })
          }
        ]
      })
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useItems('pawn'))

    expect(result.current.loading).toBe(false)
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].title).toBe('Test Item')
    expect(mockOnSnapshot).toHaveBeenCalled()
  })

  it('handles errors from firestore', async () => {
    const mockUnsubscribe = vi.fn()
    const mockOnSnapshot = firestore.onSnapshot as any

    mockOnSnapshot.mockImplementation((q: any, onNext: any, onError: any) => {
      onError(new Error('Firestore error'))
      return mockUnsubscribe
    })

    const { result } = renderHook(() => useItems('cannabis'))

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe('Firestore error')
    expect(result.current.items).toHaveLength(0)
  })
})
