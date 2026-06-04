import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import IntakeForm from './IntakeForm'

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  onSnapshot: vi.fn(),
  updateDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(),
  getDoc: vi.fn(),
}))

vi.mock('../../lib/firebase', () => ({
  db: {},
  functions: {}
}))

vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => vi.fn())
}))

describe('IntakeForm', () => {
  it('renders the form shell', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
    
    render(
      <QueryClientProvider client={queryClient}>
        <IntakeForm />
      </QueryClientProvider>
    )

    expect(screen.getByText('New Item')).toBeInTheDocument()
    expect(screen.getByLabelText(/View \(Required first\)/i)).toBeInTheDocument()
  })
})
