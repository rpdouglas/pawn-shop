import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import CannabisFields from './CannabisFields'
import { EMPTY_FORM } from './types'

describe('CannabisFields', () => {
  it('does not render if viewTag is not cannabis', () => {
    render(<CannabisFields formState={{ ...EMPTY_FORM, viewTag: 'pawn' }} set={() => vi.fn()} />)
    expect(screen.queryByText('Cannabis Profile')).not.toBeInTheDocument()
  })

  it('renders fields when viewTag is cannabis', () => {
    render(<CannabisFields formState={{ ...EMPTY_FORM, viewTag: 'cannabis' }} set={() => vi.fn()} />)
    expect(screen.getByText('Cannabis Profile')).toBeInTheDocument()
    expect(screen.getByLabelText(/Strain Type/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/THC Min/i)).toBeInTheDocument()
  })

  it('calls set function when typing in an input', async () => {
    const user = userEvent.setup()
    const setMock = vi.fn()
    const setFieldMock = vi.fn().mockImplementation(() => setMock)
    
    render(<CannabisFields formState={{ ...EMPTY_FORM, viewTag: 'cannabis' }} set={setFieldMock} />)
    
    const brandInput = screen.getByLabelText(/Brand\/Producer/i)
    await user.type(brandInput, 'Broken Coast')
    
    expect(setFieldMock).toHaveBeenCalledWith('brand')
    expect(setMock).toHaveBeenCalled()
  })
})
