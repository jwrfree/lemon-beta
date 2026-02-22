
import { describe, it, expect } from 'vitest';
import { resolveSubCategory, quickParseTransaction } from './smart-add-utils';
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

// ---------------------------------------------------------------------------
// quickParseTransaction tests
// ---------------------------------------------------------------------------

const MOCK_EXPENSE_CATEGORIES: Category[] = [
    {
        id: 'e1',
        name: 'Konsumsi & F&B',
        sub_categories: ['Makan Harian/Warteg', 'Restoran & Kafe', 'Jajanan & Kopi'],
        icon: 'Utensils',
        color: 'text-yellow-600',
        bg_color: 'bg-yellow-100',
        type: 'expense',
    },
    {
        id: 'e2',
        name: 'Transportasi',
        sub_categories: ['Ojek Online (Gojek/Grab)', 'Bensin'],
        icon: 'Car',
        color: 'text-purple-600',
        bg_color: 'bg-purple-100',
        type: 'expense',
    },
] as Category[];

const MOCK_INCOME_CATEGORIES: Category[] = [
    {
        id: 'i1',
        name: 'Gaji & Tunjangan',
        sub_categories: ['Gaji Bulanan', 'Bonus'],
        icon: 'Briefcase',
        color: 'text-green-600',
        bg_color: 'bg-green-100',
        type: 'income',
    },
] as Category[];

const MOCK_WALLETS = ['BCA', 'GoPay', 'Tunai'];
const mockCats = { expense: MOCK_EXPENSE_CATEGORIES, income: MOCK_INCOME_CATEGORIES };

describe('quickParseTransaction - Regex-based Fast Parser', () => {

    describe('Amount parsing', () => {
        it('parses "rb" suffix (ribu) as ×1000', () => {
            expect(quickParseTransaction('makan 25rb', mockCats, MOCK_WALLETS).amount).toBe(25000);
        });

        it('parses "ribu" suffix as ×1000', () => {
            expect(quickParseTransaction('beli 10ribu', mockCats, MOCK_WALLETS).amount).toBe(10000);
        });

        it('parses "k" suffix as ×1000', () => {
            expect(quickParseTransaction('grab 50k', mockCats, MOCK_WALLETS).amount).toBe(50000);
        });

        it('parses "jt" suffix as ×1000000', () => {
            expect(quickParseTransaction('gaji 5jt', mockCats, MOCK_WALLETS).amount).toBe(5000000);
        });

        it('parses "juta" suffix as ×1000000', () => {
            expect(quickParseTransaction('tabungan 2juta', mockCats, MOCK_WALLETS).amount).toBe(2000000);
        });

        it('parses Indonesian thousand separator (e.g. 50.000)', () => {
            expect(quickParseTransaction('makan 50.000', mockCats, MOCK_WALLETS).amount).toBe(50000);
        });

        it('parses a plain integer with no suffix', () => {
            expect(quickParseTransaction('beli 30000', mockCats, MOCK_WALLETS).amount).toBe(30000);
        });
    });

    describe('Confidence level', () => {
        it('returns "medium" when both amount and category are found', () => {
            const r = quickParseTransaction('makan 25rb', mockCats, MOCK_WALLETS);
            expect(r.amount).toBeGreaterThan(0);
            expect(r.confidence).toBe('medium');
        });

        it('returns "low" when no amount is found', () => {
            const r = quickParseTransaction('makan biasa saja', mockCats, MOCK_WALLETS);
            expect(r.confidence).toBe('low');
        });

        it('returns "low" when no category matches', () => {
            // "ngawur" is not a category keyword
            const r = quickParseTransaction('ngawur 999', mockCats, MOCK_WALLETS);
            expect(r.confidence).toBe('low');
        });
    });

    describe('Category detection', () => {
        it('detects main category name from text', () => {
            const r = quickParseTransaction('transportasi 50rb', mockCats, MOCK_WALLETS);
            expect(r.category).toBe('Transportasi');
        });

        it('detects category from a matching sub-category keyword', () => {
            const r = quickParseTransaction('bensin 50k', mockCats, MOCK_WALLETS);
            expect(r.category).toBe('Transportasi');
            expect(r.subCategory).toBe('Bensin');
        });

        it('defaults to "Lain-lain" when no category matches', () => {
            const r = quickParseTransaction('sesuatu 10rb', mockCats, MOCK_WALLETS);
            expect(r.category).toBe('Lain-lain');
        });
    });

    describe('Transaction type', () => {
        it('returns "income" type when an income category keyword is matched', () => {
            const r = quickParseTransaction('gaji bulanan 5jt', mockCats, MOCK_WALLETS);
            expect(r.type).toBe('income');
        });

        it('returns "expense" type by default', () => {
            const r = quickParseTransaction('makan 25rb', mockCats, MOCK_WALLETS);
            expect(r.type).toBe('expense');
        });
    });

    describe('Need vs Want classification', () => {
        it('classifies "kopi" as want (isNeed = false)', () => {
            expect(quickParseTransaction('kopi 25rb', mockCats, MOCK_WALLETS).isNeed).toBe(false);
        });

        it('classifies "nonton" as want (isNeed = false)', () => {
            expect(quickParseTransaction('nonton film 30rb', mockCats, MOCK_WALLETS).isNeed).toBe(false);
        });

        it('classifies regular makan as need (isNeed = true)', () => {
            expect(quickParseTransaction('makan siang 25rb', mockCats, MOCK_WALLETS).isNeed).toBe(true);
        });
    });

    describe('Wallet detection', () => {
        it('detects a matching wallet name in the text', () => {
            const r = quickParseTransaction('bayar gopay 20rb', mockCats, MOCK_WALLETS);
            expect(r.walletName).toBe('GoPay');
        });

        it('returns undefined when no wallet name is found', () => {
            const r = quickParseTransaction('makan 25rb', mockCats, MOCK_WALLETS);
            expect(r.walletName).toBeUndefined();
        });
    });

    describe('Date detection', () => {
        it('sets date to yesterday when "kemarin" appears in text', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const r = quickParseTransaction('kemarin makan 25rb', mockCats, MOCK_WALLETS);
            expect(new Date(r.date).getDate()).toBe(yesterday.getDate());
        });

        it('sets date to today by default', () => {
            const today = new Date();
            const r = quickParseTransaction('makan 25rb', mockCats, MOCK_WALLETS);
            expect(new Date(r.date).getDate()).toBe(today.getDate());
        });
    });

    describe('Transfer detection', () => {
        it('sets category to "Transfer" when "transfer" keyword is present', () => {
            expect(quickParseTransaction('transfer ke bca 500rb', mockCats, MOCK_WALLETS).category).toBe('Transfer');
        });

        it('sets category to "Transfer" when "kirim" keyword is present', () => {
            expect(quickParseTransaction('kirim uang 100rb', mockCats, MOCK_WALLETS).category).toBe('Transfer');
        });

        it('sets category to "Transfer" when "tf" keyword is present', () => {
            expect(quickParseTransaction('tf 200rb bca', mockCats, MOCK_WALLETS).category).toBe('Transfer');
        });
    });

    describe('Description field', () => {
        it('uses the full raw input text as the description', () => {
            const input = 'makan siang di warteg 15rb';
            expect(quickParseTransaction(input, mockCats, MOCK_WALLETS).description).toBe(input);
        });
    });
});
