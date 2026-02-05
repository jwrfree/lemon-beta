import { format, parseISO, isSameMonth, startOfMonth, subMonths, eachDayOfInterval, startOfDay, subDays } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import type { Transaction } from '@/types/models';
import { categoryDetails } from '@/lib/categories';
import { getCategoryIcon } from '@/lib/category-utils';

/**
 * Filter transactions by month and type
 */
export const getMonthlyTransactions = (transactions: Transaction[], type: 'expense' | 'income' | 'all', date: Date = new Date()) => {
    return transactions.filter((t) => {
        const matchesType = type === 'all' ? true : t.type === type;
        return matchesType && isSameMonth(parseISO(t.date), date);
    });
};

/**
 * Group transactions by category for Pie Chart with diverse colors
 */
export const groupTransactionsByCategory = (transactions: Transaction[], type: 'expense' | 'income') => {
    const total = transactions.reduce((sum, t) => sum + t.amount, 0);
    const categoryMap: Record<string, number> = {};

    transactions.forEach((t) => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    // Define diverse color schemes for different categories
    const getCategoryColor = (name: string, colorClass: string) => {
        // Extract color name from class like 'text-yellow-600'
        const match = colorClass.match(/text-([a-z]+)-/);
        if (match && match[1]) {
            return `hsl(var(--${match[1]}-500))`;
        }
        return 'var(--primary)';
    };

    const chartData = Object.entries(categoryMap)
        .map(([name, value]) => {
            const details = categoryDetails(name);
            const fill = getCategoryColor(name, details.color);
            
            return {
                name,
                value,
                icon: getCategoryIcon(details.icon),
                fill,
                categoryColor: details.color,
                categoryBgColor: details.bg_color || details.bgColor,
                percentage: total > 0 ? (value / total) * 100 : 0,
            };
        })
        .sort((a, b) => b.value - a.value);

    return { chartData, total };
};

/**
 * Generate daily trend data
 */
export const getDailyTrendData = (transactions: Transaction[], daysCount: number = 60) => {
    const endDate = startOfDay(new Date());
    const startDate = subDays(endDate, daysCount - 1);
    const interval = eachDayOfInterval({ start: startDate, end: endDate });

    const totalsByDay = transactions.reduce((acc, t) => {
        if (t.type !== 'expense') return acc;
        const date = startOfDay(parseISO(t.date));
        if (date < startDate || date > endDate) return acc;
        
        const key = format(date, 'yyyy-MM-dd');
        acc[key] = (acc[key] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

    return interval.map((date) => {
        const key = format(date, 'yyyy-MM-dd');
        return {
            key,
            date,
            shortLabel: format(date, 'd MMM', { locale: dateFnsLocaleId }),
            fullLabel: format(date, "EEEE, d MMMM yyyy", { locale: dateFnsLocaleId }),
            total: totalsByDay[key] ?? 0,
        };
    });
};

/**
 * Generate monthly trend data for last 12 months
 */
export const getMonthlyTrendData = (transactions: Transaction[], type: 'expense' | 'income', monthsCount: number = 12) => {
    const now = startOfMonth(new Date());
    const monthSequence = Array.from({ length: monthsCount }, (_, index) => {
        const date = subMonths(now, (monthsCount - 1) - index);
        return {
            key: format(date, 'yyyy-MM'),
            date,
            shortLabel: format(date, 'MMM', { locale: dateFnsLocaleId }),
            fullLabel: format(date, 'MMMM yyyy', { locale: dateFnsLocaleId }),
        };
    });

    const totalsByMonth = transactions.reduce((acc, t) => {
        if (t.type !== type) return acc;
        const key = format(parseISO(t.date), 'yyyy-MM');
        acc[key] = (acc[key] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

    return monthSequence.map((m) => ({
        ...m,
        total: totalsByMonth[m.key] ?? 0,
    }));
};

interface CashflowRecord {
    income: number;
    expense: number;
    breakdown: {
        income: Record<string, number>;
        expense: Record<string, number>;
    };
}

/**
 * Calculate net cashflow breakdown per month
 */
export const getNetCashflowData = (transactions: Transaction[], monthsCount: number = 12) => {
    const now = startOfMonth(new Date());
    const monthSequence = Array.from({ length: monthsCount }, (_, index) => {
        const date = subMonths(now, (monthsCount - 1) - index);
        return {
            key: format(date, 'yyyy-MM'),
            date,
            shortLabel: format(date, 'MMM', { locale: dateFnsLocaleId }),
            fullLabel: format(date, 'MMMM yyyy', { locale: dateFnsLocaleId }),
            quarter: Math.floor(date.getMonth() / 3) + 1,
            year: date.getFullYear(),
        };
    });

    const totalsByMonth = transactions.reduce((acc, t) => {
        const key = format(parseISO(t.date), 'yyyy-MM');
        if (!acc[key]) {
            acc[key] = { income: 0, expense: 0, breakdown: { income: {}, expense: {} } };
        }
        
        if (t.type === 'income') {
            acc[key].income += t.amount;
            acc[key].breakdown.income[t.category] = (acc[key].breakdown.income[t.category] || 0) + t.amount;
        } else if (t.type === 'expense') {
            acc[key].expense += t.amount;
            acc[key].breakdown.expense[t.category] = (acc[key].breakdown.expense[t.category] || 0) + t.amount;
        }
        return acc;
    }, {} as Record<string, CashflowRecord>);

    return monthSequence.map((m) => {
        const record = totalsByMonth[m.key];
        const incomeTotal = record?.income ?? 0;
        const expenseTotal = record?.expense ?? 0;

        const incomeBreakdown = record ? Object.entries(record.breakdown.income).map(([category, value]) => ({
            category,
            value: value as number,
            percentage: incomeTotal > 0 ? ((value as number) / incomeTotal) * 100 : 0
        })).sort((a, b) => b.value - a.value) : [];

        const expenseBreakdown = record ? Object.entries(record.breakdown.expense).map(([category, value]) => ({
            category,
            value: value as number,
            percentage: expenseTotal > 0 ? ((value as number) / expenseTotal) * 100 : 0
        })).sort((a, b) => b.value - a.value) : [];

        return {
            ...m,
            income: incomeTotal,
            expense: expenseTotal,
            net: incomeTotal - expenseTotal,
            incomeBreakdown,
            expenseBreakdown,
        };
    });
};
