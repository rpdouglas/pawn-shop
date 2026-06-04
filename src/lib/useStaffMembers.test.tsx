import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { useStaffMembers } from './useStaffMembers'

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(),
  httpsCallable: vi.fn(() => async () => ({
    data: {
      staff: [{ uid: '1', email: 'test@example.com', role: 'admin' }]
    }
  }))
}))

vi.mock('./firebase', () => ({
  functions: {}
}))

describe('useStaffMembers', () => {
  it('fetches and returns staff members', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )

    const { result } = renderHook(() => useStaffMembers(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([
      { uid: '1', email: 'test@example.com', role: 'admin' }
    ])
  })
})
