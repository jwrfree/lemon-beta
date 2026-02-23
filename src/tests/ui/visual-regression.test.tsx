
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NetWorthCard } from '@/features/home/components/net-worth-card';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Mock AnimatedCounter as it might rely on complex animation hooks
vi.mock('@/components/animated-counter', () => ({
  AnimatedCounter: ({ value }: { value: number }) => <div data-testid="animated-counter">{value}</div>
}));

// Mock formatCurrency to ensure consistent snapshots
vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual('@/lib/utils');
  return {
    ...actual as any,
    formatCurrency: (value: number) => `Rp ${value.toLocaleString('id-ID')}`
  };
});

describe('UI Visual Consistency Tests', () => {
  
  describe('Design Tokens Integration', () => {
    it('NetWorthCard uses semantic tokens correctly', () => {
      const { container } = render(
        <NetWorthCard 
          totalAssets={1000000} 
          totalLiabilities={200000} 
        />
      );
      
      // Check for semantic text colors
      const assetValue = screen.getByText('Rp 1.000.000');
      expect(assetValue.className).toContain('text-success'); // Should use success token
      
      const liabilityValue = screen.getByText('Rp 200.000');
      expect(liabilityValue.className).toContain('text-destructive'); // Should use destructive token
      
      // Check for semantic gradient/background logic (low debt ratio = success)
      // The progress bar is harder to select directly without test-id, 
      // but we can check if the success color class is present in the document
      // NetWorthCard logic: ratio 20% -> success
      const ratioText = screen.getByText('20.0%');
      expect(ratioText.className).toContain('text-success');
    });

    it('NetWorthCard uses warning token for medium debt ratio', () => {
      render(
        <NetWorthCard 
          totalAssets={1000000} 
          totalLiabilities={500000} // 50% ratio
        />
      );
      
      const ratioText = screen.getByText('50.0%');
      expect(ratioText.className).toContain('text-warning');
    });
  });

  describe('Component Structure & Classes', () => {
    it('Card component uses sharpened shadow-card and rounded-lg', () => {
      const { container } = render(<Card>Test Content</Card>);
      const card = container.firstChild as HTMLElement;
      
      expect(card.className).toContain('shadow-card');
      expect(card.className).toContain('rounded-lg');
      expect(card.className).not.toContain('rounded-md'); // Ensuring we moved away from xl
    });
  });
});
