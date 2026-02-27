import { describe, it, expect } from 'vitest';
import { rankPersonalizedSuggestions } from './smart-suggestions';
import type { Transaction } from '@/types/models';

const tx = (overrides: Partial<Transaction>): Transaction => ({
    id: overrides.id ?? crypto.randomUUID(),
    type: overrides.type ?? 'expense',
    amount: overrides.amount ?? 10000,
    category: overrides.category ?? 'Makanan',
    walletId: overrides.walletId ?? 'wallet-1',
    description: overrides.description ?? 'Kopi',
    date: overrides.date ?? new Date('2024-01-10T08:00:00.000Z').toISOString(),
    ...overrides,
});

describe('rankPersonalizedSuggestions', () => {
    it('returns ranked suggestions with reason and confidence', () => {
        const now = new Date('2024-01-10T08:30:00.000Z');
        const suggestions = rankPersonalizedSuggestions([
            tx({ description: 'Kopi kantor', date: '2024-01-10T08:00:00.000Z' }),
            tx({ description: 'Makan siang', date: '2024-01-09T12:00:00.000Z', category: 'Makanan' }),
        ], now, 3);

        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions[0].text).toContain('Kopi kantor');
        expect(['low', 'medium', 'high']).toContain(suggestions[0].confidence);
        expect(suggestions[0].reason.length).toBeGreaterThan(0);
    });

    it('deduplicates duplicate text and keeps highest score', () => {
        const now = new Date('2024-01-10T08:30:00.000Z');
        const suggestions = rankPersonalizedSuggestions([
            tx({ description: 'Kopi', amount: 20000, date: '2024-01-10T08:20:00.000Z' }),
            tx({ description: 'Kopi', amount: 20000, date: '2024-01-01T20:20:00.000Z' }),
        ], now, 3);

        expect(suggestions).toHaveLength(1);
        expect(suggestions[0].score).toBeGreaterThan(0);
    });
});
