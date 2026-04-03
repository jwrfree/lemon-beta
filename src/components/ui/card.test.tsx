import { describe, expect, it } from 'vitest';

import { cardVariants } from './card';

describe('Card - surface variants', () => {
  it('default variant uses the standard dashboard surface', () => {
    const cls = cardVariants({ variant: 'default' });
    expect(cls).toContain('rounded-lg');
    expect(cls).toContain('shadow-elevation-2');
  });

  it('elevated variant uses the stronger surface tier', () => {
    const cls = cardVariants({ variant: 'elevated' });
    expect(cls).toContain('rounded-xl');
    expect(cls).toContain('shadow-elevation-3');
  });

  it('flat variant removes elevation while keeping border separation', () => {
    const cls = cardVariants({ variant: 'flat' });
    expect(cls).toContain('rounded-lg');
    expect(cls).toContain('shadow-none');
  });

  it('ai variant preserves the rich-card shell style', () => {
    const cls = cardVariants({ variant: 'ai' });
    expect(cls).toContain('rounded-card');
    expect(cls).toContain('shadow-soft');
    expect(cls).toContain('overflow-hidden');
  });
});
