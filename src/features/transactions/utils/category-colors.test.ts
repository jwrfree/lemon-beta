
import { describe, it, expect } from 'vitest';
import { getCategoryColorHex } from './category-colors';

describe('getCategoryColorHex - Color Utility', () => {
    it('should return yellow hex code when color string contains "yellow"', () => {
        expect(getCategoryColorHex({ color: 'text-yellow-500' })).toBe('hsl(var(--yellow-600))');
    });

    it('should return blue hex code when color string contains "blue"', () => {
        expect(getCategoryColorHex({ color: 'bg-blue-600' })).toBe('hsl(var(--blue-600))');
    });

    it('should return correct hex for various colors', () => {
        expect(getCategoryColorHex({ color: 'text-purple-500' })).toBe('hsl(var(--purple-600))');
        expect(getCategoryColorHex({ color: 'text-cyan-500' })).toBe('hsl(var(--cyan-600))');
        expect(getCategoryColorHex({ color: 'text-orange-500' })).toBe('hsl(var(--orange-600))');
        expect(getCategoryColorHex({ color: 'text-pink-500' })).toBe('hsl(var(--pink-600))');
        expect(getCategoryColorHex({ color: 'text-green-500' })).toBe('hsl(var(--green-600))');
        expect(getCategoryColorHex({ color: 'text-indigo-500' })).toBe('hsl(var(--indigo-600))');
        expect(getCategoryColorHex({ color: 'text-red-500' })).toBe('hsl(var(--red-600))');
        expect(getCategoryColorHex({ color: 'text-teal-500' })).toBe('hsl(var(--teal-600))');
        expect(getCategoryColorHex({ color: 'text-emerald-500' })).toBe('hsl(var(--emerald-600))');
    });

    it('should return primary color variable for unmatched colors', () => {
        expect(getCategoryColorHex({ color: 'text-unknown-500' })).toBe('hsl(var(--primary))');
    });

    it('should return undefined when input is null or undefined', () => {
        expect(getCategoryColorHex(undefined)).toBeUndefined();
        expect(getCategoryColorHex(null)).toBeUndefined();
    });
});
