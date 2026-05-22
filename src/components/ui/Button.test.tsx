import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Button from './Button'

describe('Button component', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    render(<Button>Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-primary')
  })

  it('applies secondary variant when specified', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('btn-secondary')
  })

  it('applies fullWidth style', () => {
    render(<Button fullWidth>Full Width</Button>)
    expect(screen.getByRole('button')).toHaveStyle({ width: '100%' })
  })

  it('supports disabled state', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('has base btn class for Makoonsii 48px hit area check', () => {
    render(<Button>Hit Area Check</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('btn')
  })
})
