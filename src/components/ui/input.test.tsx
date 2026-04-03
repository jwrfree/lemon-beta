import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './input';

describe('Input', () => {
  it('uses text-base by default to avoid iOS zoom on focus', () => {
    render(<Input aria-label="Email" />);

    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input.className).toContain('text-base');
    expect(input.className).not.toContain('text-sm');
  });

  it('keeps the large size variant at a 16px floor on mobile', () => {
    render(<Input aria-label="Password" size="lg" />);

    const input = screen.getByRole('textbox', { name: 'Password' });
    expect(input.className).toContain('text-base');
    expect(input.className).not.toContain('md:text-base');
  });
});
