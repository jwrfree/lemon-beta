
import { describe, it, expect } from 'vitest';
import { resolveSubCategory } from './smart-add-utils';
import { Category } from '@/lib/categories';

// Minimal mock category structure for testing
const MOCK_CATEGORIES: Category[] = [
    {
        id: '1',
        name: 'Transportasi',
        sub_categories: ['Ojek Online (Gojek/Grab)', 'Bensin', 'Parkir & Tol', 'Servis & Cuci Kendaraan'],
        icon: 'Car',
        color: 'text-purple-600',
        bg_color: 'bg-purple-100'
    },
    {
        id: '2',
        name: 'Konsumsi & F&B',
        sub_categories: ['Restoran & Kafe', 'Bahan Masakan (Grocery)', 'Makan Harian/Warteg', 'Jajanan & Kopi'],
        icon: 'Utensils',
        color: 'text-yellow-600',
        bg_color: 'bg-yellow-100'
    }
] as Category[];

describe('resolveSubCategory - Smart Matching Utility', () => {

    it('should return exact match sub-category (case-insensitive)', () => {
        // "Bensin" matches "Bensin"
        expect(resolveSubCategory('Transportasi', 'Bensin', MOCK_CATEGORIES)).toBe('Bensin');
        // "restoran & kafe" matches "Restoran & Kafe"
        expect(resolveSubCategory('Konsumsi & F&B', 'restoran & kafe', MOCK_CATEGORIES)).toBe('Restoran & Kafe');
    });

    it('should return fuzzy match when input contains target sub-category', () => {
        // "isi bensin" contains "Bensin"
        expect(resolveSubCategory('Transportasi', 'isi bensin di pom', MOCK_CATEGORIES)).toBe('Bensin');
        // "bayar parkir tol" contains "Parkir & Tol"
        expect(resolveSubCategory('Transportasi', 'bayar parkir tol', MOCK_CATEGORIES)).toBe('Parkir & Tol');
    });

    it('should return fuzzy match when sub-category contains input', () => {
        // "parkir" is contained in "Parkir & Tol"
        expect(resolveSubCategory('Transportasi', 'parkir', MOCK_CATEGORIES)).toBe('Parkir & Tol');
        // "gojek" is contained in "Ojek Online (Gojek/Grab)"
        expect(resolveSubCategory('Transportasi', 'gojek', MOCK_CATEGORIES)).toBe('Ojek Online (Gojek/Grab)');
        expect(resolveSubCategory('Transportasi', 'grab', MOCK_CATEGORIES)).toBe('Ojek Online (Gojek/Grab)');
    });

    it('should prioritize exact match over partial', () => {
        // If we had "Jajanan" and "Jajanan & Kopi", exact match should win
        const AMBIGUOUS_CATS: Category[] = [{
            ...MOCK_CATEGORIES[1],
            sub_categories: ['Jajanan & Kopi', 'Jajanan']
        }];
        expect(resolveSubCategory('Konsumsi & F&B', 'Jajanan', AMBIGUOUS_CATS)).toBe('Jajanan');
    });

    it('should return empty string if no match found within the main category', () => {
        // "Bensin" is not in "Konsumsi & F&B"
        expect(resolveSubCategory('Konsumsi & F&B', 'Bensin', MOCK_CATEGORIES)).toBe('');
        // Random string
        expect(resolveSubCategory('Transportasi', 'ngawur', MOCK_CATEGORIES)).toBe('');
    });

    it('should handle undefined/null inputs gracefully', () => {
        expect(resolveSubCategory(undefined, 'Bensin', MOCK_CATEGORIES)).toBe('');
        expect(resolveSubCategory('Transportasi', undefined, MOCK_CATEGORIES)).toBe('');
        // @ts-ignore
        expect(resolveSubCategory('Transportasi', null, MOCK_CATEGORIES)).toBe('');
    });

    it('should return empty if category not found', () => {
        expect(resolveSubCategory('Unknown Category', 'Bensin', MOCK_CATEGORIES)).toBe('');
    });
});
