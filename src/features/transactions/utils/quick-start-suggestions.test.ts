import { describe, expect, it } from 'vitest';

import type { Transaction, Wallet } from '@/types/models';

import { buildQuickStartSuggestionGroups } from './quick-start-suggestions';

const wallets: Pick<Wallet, 'id' | 'name'>[] = [
    { id: 'wallet-bca', name: 'BCA' },
    { id: 'wallet-cash', name: 'Tunai' },
];

const makeTransaction = (overrides: Partial<Transaction>): Transaction => ({
    id: overrides.id || crypto.randomUUID(),
    type: overrides.type || 'expense',
    amount: overrides.amount || 25000,
    category: overrides.category || 'Konsumsi & F&B',
    subCategory: overrides.subCategory,
    merchant: overrides.merchant || null,
    walletId: overrides.walletId || 'wallet-bca',
    description: overrides.description || 'Makan siang',
    location: overrides.location,
    date: overrides.date || new Date('2026-04-02T12:00:00.000Z').toISOString(),
    linkedDebtId: overrides.linkedDebtId || null,
    tags: overrides.tags,
    isNeed: overrides.isNeed ?? true,
});

describe('buildQuickStartSuggestionGroups', () => {
    it('prioritizes repeated and recent transactions for repeat suggestions', () => {
        const now = new Date('2026-04-02T12:30:00.000Z');
        const transactions = [
            makeTransaction({ id: '1', description: 'Makan siang', date: '2026-04-02T12:10:00.000Z' }),
            makeTransaction({ id: '2', description: 'Makan siang', date: '2026-04-01T12:15:00.000Z' }),
            makeTransaction({ id: '3', description: 'Makan siang', date: '2026-03-30T12:20:00.000Z' }),
            makeTransaction({ id: '4', description: 'Netflix', category: 'Langganan Digital', amount: 54000, date: '2026-03-10T20:00:00.000Z' }),
        ];

        const groups = buildQuickStartSuggestionGroups({ transactions, wallets, now });

        expect(groups.repeats[0]?.label).toBe('Makan siang');
        expect(groups.repeats[0]?.amount).toBe(25000);
        expect(groups.repeats[0]?.walletName).toBe('BCA');
    });

    it('dedupes identical repeat patterns into a single repeat suggestion', () => {
        const now = new Date('2026-04-02T12:30:00.000Z');
        const transactions = [
            makeTransaction({ id: '1', description: 'Bensin', category: 'Transportasi', amount: 50000 }),
            makeTransaction({ id: '2', description: 'Bensin', category: 'Transportasi', amount: 50000, date: '2026-04-01T12:30:00.000Z' }),
            makeTransaction({ id: '3', description: 'Bensin', category: 'Transportasi', amount: 50000, date: '2026-03-28T12:30:00.000Z' }),
        ];

        const groups = buildQuickStartSuggestionGroups({ transactions, wallets, now });

        expect(groups.repeats).toHaveLength(1);
        expect(groups.repeats[0]?.label).toBe('Bensin');
    });

    it('boosts transactions that match the current time bucket', () => {
        const now = new Date('2026-04-02T12:30:00.000Z');
        const transactions = [
            makeTransaction({ id: '1', description: 'Makan siang', date: '2026-04-02T12:10:00.000Z' }),
            makeTransaction({ id: '2', description: 'Makan siang', date: '2026-04-01T12:15:00.000Z' }),
            makeTransaction({ id: '3', description: 'Kopi malam', amount: 18000, date: '2026-04-02T20:00:00.000Z' }),
            makeTransaction({ id: '4', description: 'Kopi malam', amount: 18000, date: '2026-04-01T20:30:00.000Z' }),
        ];

        const groups = buildQuickStartSuggestionGroups({ transactions, wallets, now });

        expect(groups.repeats[0]?.label).toBe('Makan siang');
    });

    it('provides fallback habits and actions when history is empty', () => {
        const now = new Date('2026-04-02T08:30:00.000Z');
        const groups = buildQuickStartSuggestionGroups({ transactions: [], wallets, now });

        expect(groups.repeats).toHaveLength(0);
        expect(groups.habits.length).toBeGreaterThan(0);
        expect(groups.actions.map((item) => item.action)).toEqual(['scan-receipt', 'manual-assist']);
    });
});
