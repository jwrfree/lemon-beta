import { useMemo } from 'react';
import { isSameMonth, parseISO, subMonths } from 'date-fns';
import type { Transaction } from '@/types/models';

export const useHomeSummary = (transactions: Transaction[]) => {
    return useMemo(() => {
        const now = new Date();
        const lastMonth = subMonths(now, 1);

        const currentMonthTransactions = transactions.filter(t => isSameMonth(parseISO(t.date), now) && t.category !== 'Transfer');
        const lastMonthTransactions = transactions.filter(t => isSameMonth(parseISO(t.date), lastMonth) && t.category !== 'Transfer');

        const monthlyIncome = currentMonthTransactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);

        const monthlyExpense = currentMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);

        const prevMonthlyIncome = lastMonthTransactions
            .filter(t => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);
        
        const prevMonthlyExpense = lastMonthTransactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);
        
        const incomeDiff = monthlyIncome - prevMonthlyIncome;
        const expenseDiff = monthlyExpense - prevMonthlyExpense;

        return {
            monthlyIncome,
            monthlyExpense,
            incomeDiff,
            expenseDiff
        };
    }, [transactions]);
};
