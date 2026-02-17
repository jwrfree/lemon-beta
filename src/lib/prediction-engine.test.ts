import { describe, it, expect } from 'vitest';
import { ProphetEngine } from './prediction-engine';
import { Transaction } from '@/types/models';
import { addDays, format, subDays } from 'date-fns';

// Helper to generate mock transactions
const generateMockTransactions = (count: number, pattern: 'linear' | 'seasonal' | 'flat'): Transaction[] => {
    const transactions: Transaction[] = [];
    const today = new Date();
    const startDate = subDays(today, count);

    for (let i = 0; i < count; i++) {
        const date = addDays(startDate, i);
        let amount = 100000; // Base baseline

        if (pattern === 'linear') {
            amount += i * 1000; // Rising trend
        } else if (pattern === 'seasonal') {
            // Weekly seasonality: spike every 7th day
            if (i % 7 === 0) amount += 500000;
            else amount += Math.random() * 10000; // Random noise
        }

        transactions.push({
            id: `t-${i}`,
            amount: amount,
            type: 'expense', // Keeping it simple: expenses only
            category: 'food',
            walletId: 'w-1',
            description: 'Mock transaction',
            date: format(date, 'yyyy-MM-dd')
        } as Transaction);
    }
    return transactions;
};

describe('ProphetEngine', () => {
    it('should handle empty input gracefully', () => {
        const engine = new ProphetEngine([]);
        const result = engine.generate(new Date(), new Date(), 30);
        expect(result).toEqual([]);
    });

    it('should detect linear trends (Holt Linear)', () => {
        // 14 days of linear growth
        const transactions = generateMockTransactions(14, 'linear');
        const engine = new ProphetEngine(transactions, { period: 7 });

        // 14 days < 2 * 7 (period) -> Should fallback to Holt Linear logic automatically?
        // Wait, logic says: useSeasonality = values.length >= (period * 2)
        // 14 days is exactly 2*7. So it might trigger Seasonality if exact.
        // Let's use 10 days to force Linear.
        const shortHistory = transactions.slice(0, 10);

        const start = subDays(new Date(), 10);
        const end = new Date();

        const engineLinear = new ProphetEngine(shortHistory);
        const result = engineLinear.generate(start, end, 5);

        // Check if forecast continues to grow
        const lastActual = result.find(r => r.actual !== undefined && r.forecast !== undefined); // Last history point
        const firstForecast = result.find(r => r.actual === undefined);

        expect(firstForecast?.forecast).toBeGreaterThan(lastActual?.forecast || 0);
    });

    it('should detect anomalies', () => {
        const transactions = generateMockTransactions(30, 'flat');
        // Inject anomaly
        transactions[15].amount = 10000000; // Huge outlier

        const engine = new ProphetEngine(transactions);
        const start = subDays(new Date(), 30);
        const end = new Date();

        const result = engine.generate(start, end, 10);

        // Find the day matching the anomaly
        const anomalyDate = transactions[15].date;
        const anomalyPoint = result.find(r => r.date === anomalyDate);

        // The engine aggregates signed daily values. 
        // Expense = negative in our aggregation logic inside the Class?
        // Let's check class logic: "income" -> +amount, "expense" -> -amount.
        // So 10,000,000 expense is -10,000,000.
        // The baseline is ~ -100,000.
        // -10m is HUGE difference from -100k. Should trigger anomaly.

        expect(anomalyPoint?.anomaly).toBe(true);
    });
});
