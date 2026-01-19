import { describe, it, expect } from 'vitest';
import { cn, formatCurrency } from './utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
    });

    it('should handle conditional classes', () => {
      expect(cn('bg-red-500', false && 'text-white', 'p-4')).toBe('bg-red-500 p-4');
    });

    it('should merge tailwind classes correctly', () => {
      expect(cn('p-4', 'p-8')).toBe('p-8');
    });
  });

  describe('formatCurrency', () => {
    it('should format IDR currency correctly', () => {
      expect(formatCurrency(10000)).toMatch(/Rp\s?10\.000/);
    });

    it('should handle zero', () => {
       expect(formatCurrency(0)).toMatch(/Rp\s?0/);
    });
    
    it('should handle negative numbers', () => {
        expect(formatCurrency(-5000)).toMatch(/-Rp\s?5\.000|Rp\s?-5\.000/);
    });
  });
});
