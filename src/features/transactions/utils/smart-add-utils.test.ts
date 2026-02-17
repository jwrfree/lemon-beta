
import { describe, it, expect } from 'vitest';
import { resolveSubCategory } from './smart-add-utils';
import { Category } from '@/lib/categories';

// Minimal mock category structure for testing
const MOCK_CATEGORIES: Category[] = [
    {
        id: '1',
        name: 'Transportasi',
        sub_categories: ['Bensin', 'Parkir', 'Toll', 'Grab/Gojek'],
        icon: 'Car',
        color: 'text-blue-500',
        bg_color: 'bg-blue-100'
    },
    {
        id: '2',
        name: 'Makanan',
        sub_categories: ['Restoran & Kafe', 'Bahan Masakan', 'Warung', 'Snack'],
        icon: 'Pizza',
        color: 'text-red-500',
        bg_color: 'bg-red-100'
    }
] as Category[];

describe('resolveSubCategory - Smart Matching Utility', () => {

    it('should return exact match sub-category (case-insensitive)', () => {
        // "Bensin" matches "Bensin"
        expect(resolveSubCategory('Transportasi', 'Bensin', MOCK_CATEGORIES)).toBe('Bensin');
        // "restoran & kafe" matches "Restoran & Kafe"
        expect(resolveSubCategory('Makanan', 'restoran & kafe', MOCK_CATEGORIES)).toBe('Restoran & Kafe');
    });

    it('should return fuzzy match when input contains target sub-category', () => {
        // "isi bensin" contains "Bensin"
        expect(resolveSubCategory('Transportasi', 'isi bensin di pom', MOCK_CATEGORIES)).toBe('Bensin');
        // "bayar toll" contains "Toll"
        expect(resolveSubCategory('Transportasi', 'bayar toll', MOCK_CATEGORIES)).toBe('Toll');
    });

    it('should return fuzzy match when sub-category contains input', () => {
        // "park" is contained in "Parkir"
        expect(resolveSubCategory('Transportasi', 'park', MOCK_CATEGORIES)).toBe('Parkir');
        // "gojek" is contained in "Grab/Gojek"
        expect(resolveSubCategory('Transportasi', 'gojek', MOCK_CATEGORIES)).toBe('Grab/Gojek');
        expect(resolveSubCategory('Transportasi', 'grab', MOCK_CATEGORIES)).toBe('Grab/Gojek');
    });

    it('should prioritize exact match over partial', () => {
        // If we had "Snack" and "Snacks", "Snack" input should match "Snack"
        const AMBIGUOUS_CATS: Category[] = [{
            ...MOCK_CATEGORIES[1],
            sub_categories: ['Snack', 'Healthy Snacks']
        }];
        expect(resolveSubCategory('Makanan', 'Snack', AMBIGUOUS_CATS)).toBe('Snack');
    });

    it('should return empty string if no match found within the main category', () => {
        // "Bensin" is not in "Makanan"
        expect(resolveSubCategory('Makanan', 'Bensin', MOCK_CATEGORIES)).toBe('');
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
