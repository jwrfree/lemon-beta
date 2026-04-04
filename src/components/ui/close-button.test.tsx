import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { CloseButton } from './close-button'

describe('CloseButton', () => {
  it('renders with the default localized label ("Tutup")', () => {
    render(<CloseButton data-testid="close" />)
    expect(screen.getByTestId('close').getAttribute('aria-label')).toBe('Tutup')
  })

  it('allows overriding the ariaLabel prop', () => {
    render(<CloseButton data-testid="custom" ariaLabel="Close panel" />)
    expect(screen.getByTestId('custom').getAttribute('aria-label')).toBe('Close panel')
  })

  it('accepts a custom icon override', () => {
    render(
      <CloseButton data-testid="icon" icon={<span data-testid="icon-child">X</span>} />
    )
    expect(screen.getByTestId('icon-child')).toBeDefined()
  })
})
