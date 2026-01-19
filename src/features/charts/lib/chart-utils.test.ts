import { describe, it, expect } from 'vitest';
import { getMonthlyTransactions, groupTransactionsByCategory, getDailyTrendData, getMonthlyTrendData, getNetCashflowData } from './chart-utils';
import type { Transaction } from '@/types/models';
import { startOfMonth, format, subMonths, startOfDay, subDays } from 'date-fns';

const mockTransactions: Transaction[] = [
    {
        id: '1',
        userId: 'user1',
        walletId: 'wallet1',
        amount: 100000,
        category: 'Makanan',
        type: 'expense',
        date: new Date().toISOString(),
        description: 'Makan siang',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        userId: 'user1',
        walletId: 'wallet1',
        amount: 5000000,
        category: 'Gaji',
        type: 'income',
        date: new Date().toISOString(),
        description: 'Gaji Januari',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '3',
        userId: 'user1',
        walletId: 'wallet1',
        amount: 50000,
        category: 'Belanja',
        type: 'expense',
        date: subMonths(new Date(), 1).toISOString(),
        description: 'Belanja bulanan lalu',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

describe('chart-utils', () => {
    describe('getMonthlyTransactions', () => {
        it('should filter transactions by current month', () => {
            const result = getMonthlyTransactions(mockTransactions, 'all');
            expect(result).toHaveLength(2);
        });

        it('should filter by type', () => {
            const result = getMonthlyTransactions(mockTransactions, 'income');
            expect(result).toHaveLength(1);
            expect(result[0].category).toBe('Gaji');
        });
    });

    describe('groupTransactionsByCategory', () => {
        it('should group transactions and calculate percentages', () => {
            const monthlyExpenses = mockTransactions.filter(t => t.type === 'expense' && t.category === 'Makanan');
            const { chartData, total } = groupTransactionsByCategory(monthlyExpenses, 'expense');
            
            expect(total).toBe(100000);
            expect(chartData).toHaveLength(1);
            expect(chartData[0].name).toBe('Makanan');
            expect(chartData[0].percentage).toBe(100);
        });
    });

    describe('getDailyTrendData', () => {
        it('should generate data points for the requested interval', () => {
            const result = getDailyTrendData(mockTransactions, 7);
            expect(result).toHaveLength(7);
            
            const todayKey = format(new Date(), 'yyyy-MM-dd');
            const todayData = result.find(d => d.key === todayKey);
            expect(todayData?.total).toBe(100000);
        });
    });

    describe('getMonthlyTrendData', () => {
        it('should generate monthly totals for specified interval', () => {
            const result = getMonthlyTrendData(mockTransactions, 'expense', 3);
            expect(result).toHaveLength(3);
            
            const currentMonthKey = format(new Date(), 'yyyy-MM');
            const currentMonthData = result.find(m => m.key === currentMonthKey);
            expect(currentMonthData?.total).toBe(100000);
        });
    });

    describe('getNetCashflowData', () => {
        it('should calculate net cashflow correctly', () => {
            const result = getNetCashflowData(mockTransactions, 3);
            expect(result).toHaveLength(3);
            
            const currentMonthKey = format(new Date(), 'yyyy-MM');
            const currentMonthData = result.find(m => m.key === currentMonthKey);
            expect(currentMonthData?.income).toBe(5000000);
            expect(currentMonthData?.expense).toBe(100000);
            expect(currentMonthData?.net).toBe(4900000);
        });
    });
});
