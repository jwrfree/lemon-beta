
import { describe, it, expect } from 'vitest';
import { getCategoryColorHex } from './category-colors';

describe('getCategoryColorHex - Color Utility', () => {
    it('should return yellow hex code when color string contains "yellow"', () => {
        expect(getCategoryColorHex({ color: 'text-yellow-500' })).toBe('#ca8a04');
    });

    it('should return blue hex code when color string contains "blue"', () => {
        expect(getCategoryColorHex({ color: 'bg-blue-600' })).toBe('#2563eb');
    });

    it('should return correct hex for various colors', () => {
        expect(getCategoryColorHex({ color: 'text-purple-500' })).toBe('#9333ea');
        expect(getCategoryColorHex({ color: 'text-cyan-500' })).toBe('#0891b2');
        expect(getCategoryColorHex({ color: 'text-orange-500' })).toBe('#ea580c');
        expect(getCategoryColorHex({ color: 'text-pink-500' })).toBe('#db2777');
        expect(getCategoryColorHex({ color: 'text-green-500' })).toBe('#16a34a');
        expect(getCategoryColorHex({ color: 'text-indigo-500' })).toBe('#4f46e5');
        expect(getCategoryColorHex({ color: 'text-red-500' })).toBe('#dc2626');
        expect(getCategoryColorHex({ color: 'text-teal-500' })).toBe('#0d9488');
        expect(getCategoryColorHex({ color: 'text-emerald-500' })).toBe('#059669');
    });

    it('should return primary color variable for unmatched colors', () => {
        expect(getCategoryColorHex({ color: 'text-unknown-500' })).toBe('hsl(var(--primary))');
    });

    it('should return undefined when input is null or undefined', () => {
        expect(getCategoryColorHex(undefined)).toBeUndefined();
        expect(getCategoryColorHex(null)).toBeUndefined();
    });
});
