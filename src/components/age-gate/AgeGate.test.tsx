import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AgeGate from './AgeGate'

// Mock firebase functions and analytics
vi.mock('firebase/functions', () => ({
  httpsCallable: vi.fn(() => vi.fn())
}))

vi.mock('../../lib/firebase-core', () => ({
  functions: {}
}))

vi.mock('../../lib/analytics', () => ({
  Analytics: {
    ageGateEvent: vi.fn()
  }
}))

describe('AgeGate Component', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('renders children if gate is passed in sessionStorage', () => {
    sessionStorage.setItem('age-gate-cannabis', 'passed')
    render(
      <MemoryRouter>
        <AgeGate minAge={19} viewTag="cannabis">
          <div data-testid="protected-content">Secret Content</div>
        </AgeGate>
      </MemoryRouter>
    )
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('shows verification screen if gate is pending', () => {
    render(
      <MemoryRouter>
        <AgeGate minAge={19} viewTag="cannabis">
          <div data-testid="protected-content">Secret Content</div>
        </AgeGate>
      </MemoryRouter>
    )
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Age Verification/i })).toBeInTheDocument()
  })

  it('passes the gate and shows content on confirm click', async () => {
    render(
      <MemoryRouter>
        <AgeGate minAge={19} viewTag="cannabis">
          <div data-testid="protected-content">Secret Content</div>
        </AgeGate>
      </MemoryRouter>
    )
    const confirmBtn = screen.getByRole('button', { name: /I am 19 or older/i })
    fireEvent.click(confirmBtn)
    
    // After click, it should transition to passed state
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
    })
    expect(sessionStorage.getItem('age-gate-cannabis')).toBe('passed')
  })

  it('shows denied screen on under-age click', async () => {
    render(
      <MemoryRouter>
        <AgeGate minAge={19} viewTag="cannabis">
          <div data-testid="protected-content">Secret Content</div>
        </AgeGate>
      </MemoryRouter>
    )
    const denyBtn = screen.getByRole('button', { name: /I am under 19/i })
    fireEvent.click(denyBtn)
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Access Restricted/i })).toBeInTheDocument()
    })
    expect(sessionStorage.getItem('age-gate-cannabis')).not.toBe('passed')
  })
})
