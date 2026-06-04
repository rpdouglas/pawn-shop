import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import FireworksFields from './FireworksFields'
import { EMPTY_FORM } from './types'

describe('FireworksFields', () => {
  it('does not render if viewTag is not fireworks', () => {
    render(<FireworksFields formState={{ ...EMPTY_FORM, viewTag: 'pawn' }} set={() => vi.fn()} />)
    expect(screen.queryByText('Fireworks Profile')).not.toBeInTheDocument()
  })

  it('renders fields when viewTag is fireworks', () => {
    render(<FireworksFields formState={{ ...EMPTY_FORM, viewTag: 'fireworks' }} set={() => vi.fn()} />)
    expect(screen.getByText('Fireworks Profile')).toBeInTheDocument()
    expect(screen.getByLabelText(/Explosive Weight/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Noise Level/i)).toBeInTheDocument()
  })

  it('calls set function when typing in an input', async () => {
    const user = userEvent.setup()
    const setMock = vi.fn()
    const setFieldMock = vi.fn().mockImplementation(() => setMock)
    
    render(<FireworksFields formState={{ ...EMPTY_FORM, viewTag: 'fireworks' }} set={setFieldMock} />)
    
    const shotsInput = screen.getByLabelText(/Shots \(Count\)/i)
    await user.type(shotsInput, '25')
    
    expect(setFieldMock).toHaveBeenCalledWith('shots')
    expect(setMock).toHaveBeenCalled()
  })
})
