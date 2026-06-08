import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, beforeEach, afterEach } from 'vitest'
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

vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytesResumable: vi.fn(),
}))

vi.mock('browser-image-compression', () => ({
  default: vi.fn((file: File) => Promise.resolve(file)),
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('IntakeForm', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('renders the form shell', () => {
    renderWithProviders(<IntakeForm />)
    expect(screen.getByText('New Item')).toBeInTheDocument()
    expect(screen.getByLabelText(/View \(Required first\)/i)).toBeInTheDocument()
  })

  it('renders the AI toggle in the Capture & View section', () => {
    renderWithProviders(<IntakeForm />)
    const toggle = screen.getByRole('switch', { name: /use ai to auto-fill form fields and pricing from photo/i })
    expect(toggle).toBeInTheDocument()
  })

  it('AI toggle is ON by default when no sessionStorage preference exists', () => {
    renderWithProviders(<IntakeForm />)
    const toggle = screen.getByRole('switch', { name: /use ai to auto-fill form fields and pricing from photo/i })
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('✨ Auto-fill with AI')).toBeInTheDocument()
  })

  it('AI toggle reads OFF from sessionStorage when previously set to false', () => {
    sessionStorage.setItem('aiIntakeEnabled', 'false')
    renderWithProviders(<IntakeForm />)
    const toggle = screen.getByRole('switch', { name: /use ai to auto-fill form fields and pricing from photo/i })
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByText('Manual entry')).toBeInTheDocument()
  })

  it('clicking the AI toggle flips the state and persists to sessionStorage', () => {
    renderWithProviders(<IntakeForm />)
    const toggle = screen.getByRole('switch', { name: /use ai to auto-fill form fields and pricing from photo/i })
    
    // Initially ON
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(sessionStorage.getItem('aiIntakeEnabled')).toBeNull() // not yet written

    // Click to disable
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByText('Manual entry')).toBeInTheDocument()
    expect(sessionStorage.getItem('aiIntakeEnabled')).toBe('false')

    // Click to re-enable
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('✨ Auto-fill with AI')).toBeInTheDocument()
    expect(sessionStorage.getItem('aiIntakeEnabled')).toBe('true')
  })

  it('shows correct helper text based on toggle state', () => {
    renderWithProviders(<IntakeForm />)
    const toggle = screen.getByRole('switch', { name: /use ai to auto-fill form fields and pricing from photo/i })

    expect(screen.getByText(/ai will auto-fill title, description & pricing from your photo/i)).toBeInTheDocument()

    fireEvent.click(toggle)
    expect(screen.getByText(/photo will be saved — fill in details manually/i)).toBeInTheDocument()
  })

  it('AI toggle is enabled (not disabled) before any photos are uploaded', () => {
    renderWithProviders(<IntakeForm />)
    const toggle = screen.getByRole('switch', { name: /use ai to auto-fill form fields and pricing from photo/i })
    expect(toggle).not.toBeDisabled()
  })
})
