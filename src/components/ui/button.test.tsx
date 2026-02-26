import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button, buttonVariants } from './button';

describe('Button — Design System Audit', () => {
  describe('Variants', () => {
    const variants = ['primary', 'default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'tertiary', 'success', 'error'] as const;

    it.each(variants)('renders variant "%s" without errors', (variant) => {
      render(<Button variant={variant}>Label</Button>);
      expect(screen.getByRole('button', { name: 'Label' })).toBeDefined();
    });

    it('tertiary variant uses muted foreground text (no solid background fill)', () => {
      const cls = buttonVariants({ variant: 'tertiary' });
      expect(cls).toContain('text-muted-foreground');
      // Must not have a solid background color (only hover/active utility prefixed states are allowed)
      expect(cls).not.toMatch(/(?<![:\w])bg-(?!background)[a-z]/);
    });
  });

  describe('States', () => {
    it('disabled state is applied via prop', () => {
      render(<Button disabled>Disabled</Button>);
      const btn = screen.getByRole('button', { name: 'Disabled' });
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });

    it('loading state disables the button and sets aria-busy', () => {
      render(<Button isLoading>Save</Button>);
      const btn = screen.getByRole('button');
      expect((btn as HTMLButtonElement).disabled).toBe(true);
      expect(btn.getAttribute('aria-busy')).toBe('true');
    });

    it('loading state renders sr-only "Loading" text', () => {
      render(<Button isLoading>Save</Button>);
      expect(screen.getByText('Loading')).toBeDefined();
    });

    it('base classes include focus-visible ring for keyboard navigation', () => {
      const cls = buttonVariants({});
      expect(cls).toContain('focus-visible:ring-2');
      expect(cls).toContain('focus-visible:ring-ring');
    });

    it('base classes include disabled styles', () => {
      const cls = buttonVariants({});
      expect(cls).toContain('disabled:pointer-events-none');
      expect(cls).toContain('disabled:opacity-60');
      expect(cls).toContain('disabled:text-muted-foreground');
    });
  });

  describe('Size & Spacing', () => {
    it('default size uses design-token height h-10', () => {
      const cls = buttonVariants({ size: 'default' });
      expect(cls).toContain('h-10');
    });

    it('sm size uses design-token height h-9', () => {
      const cls = buttonVariants({ size: 'sm' });
      expect(cls).toContain('h-9');
    });

    it('lg size uses design-token height h-11 (44px meets min touch target)', () => {
      const cls = buttonVariants({ size: 'lg' });
      expect(cls).toContain('h-11');
    });

    it('icon size meets 44×44px minimum touch target (h-11 w-11)', () => {
      const cls = buttonVariants({ size: 'icon' });
      expect(cls).toContain('h-11');
      expect(cls).toContain('w-11');
    });
  });

  describe('Colors — no hardcoded hex values', () => {
    const variants = ['primary', 'default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'tertiary', 'success', 'error'] as const;

    it.each(variants)('variant "%s" contains no hardcoded hex color', (variant) => {
      const cls = buttonVariants({ variant });
      expect(cls).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    });
  });

  describe('Border Radius & Shadow', () => {
    it('base classes use rounded-md design token for border radius', () => {
      const cls = buttonVariants({});
      expect(cls).toContain('rounded-md');
    });
  });

  describe('Interaction & Motion', () => {
    it('base classes include motion-pressable for consistent animation', () => {
      const cls = buttonVariants({});
      expect(cls).toContain('motion-pressable');
    });

    it('default variant includes active state using token', () => {
      const cls = buttonVariants({ variant: 'default' });
      expect(cls).toContain('active:bg-primary/80');
    });

    it('ghost variant includes active state using state-active token', () => {
      const cls = buttonVariants({ variant: 'ghost' });
      expect(cls).toContain('active:bg-state-active');
    });
  });

  describe('Accessibility', () => {
    it('icon-size button renders with 44px touch target class', () => {
      render(<Button size="icon" aria-label="Add item">+</Button>);
      const btn = screen.getByRole('button', { name: 'Add item' });
      expect(btn.className).toContain('h-11');
      expect(btn.className).toContain('w-11');
    });

    it('button has visible focus indicator classes', () => {
      const cls = buttonVariants({});
      expect(cls).toContain('focus-visible:outline-none');
      expect(cls).toContain('focus-visible:ring-offset-2');
    });
  });
});
