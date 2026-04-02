import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RecentTransactionsList } from './RecentTransactionsList';

const { getRecentTransactions } = vi.hoisted(() => ({
    getRecentTransactions: vi.fn(),
}));

vi.mock('@/providers/auth-provider', () => ({
    useAuth: () => ({
        user: { id: 'user-1' },
    }),
}));

vi.mock('@/lib/services/financial-context-service', () => ({
    financialContextService: {
        getRecentTransactions,
    },
}));

describe('RecentTransactionsList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows a skeleton while loading recent transactions', () => {
        getRecentTransactions.mockReturnValue(new Promise(() => undefined));

        const { container } = render(<RecentTransactionsList />);

        expect(container.querySelector('.animate-pulse')).toBeTruthy();
    });

    it('shows an empty state when there are no recent transactions', async () => {
        getRecentTransactions.mockResolvedValue([]);

        render(<RecentTransactionsList />);

        await waitFor(() => {
            expect(screen.getByText('Belum ada transaksi terbaru yang bisa ditampilkan.')).toBeDefined();
        });
    });

    it('renders a real list of recent transactions', async () => {
        getRecentTransactions.mockResolvedValue([
            {
                transaction_id: 'tx-1',
                id: 'tx-1',
                description: 'Kopi sore',
                category: 'Konsumsi & F&B',
                sub_category: 'Jajanan & Kopi',
                merchant: 'Kapal Api',
                amount: 25000,
                type: 'expense',
                date: '2026-04-03T09:00:00.000Z',
            },
            {
                transaction_id: 'tx-2',
                id: 'tx-2',
                description: 'Gaji bulanan',
                category: 'Gaji & Tetap',
                sub_category: 'Gaji Pokok',
                merchant: null,
                amount: 8000000,
                type: 'income',
                date: '2026-04-02T09:00:00.000Z',
            },
        ]);

        render(<RecentTransactionsList />);

        await waitFor(() => {
            expect(screen.getByText('Kopi sore')).toBeDefined();
            expect(screen.getByText('Gaji bulanan')).toBeDefined();
        });
    });
});
