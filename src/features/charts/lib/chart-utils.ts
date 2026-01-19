import { format, parseISO, isSameMonth, startOfMonth, subMonths, eachDayOfInterval, startOfDay, subDays } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import type { Transaction } from '@/types/models';
import { categoryDetails } from '@/lib/categories';

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
    const categoryColors = {
        // Food & Dining
        'Makanan': 'hsl(var(--yellow-500))',
        'Minuman': 'hsl(var(--yellow-600))',
        
        // Shopping & Retail
        'Belanja': 'hsl(var(--blue-500))',
        'Fashion': 'hsl(var(--purple-500))',
        'Elektronik': 'hsl(var(--cyan-500))',
        'Hobi': 'hsl(var(--pink-500))',
        
        // Transportation
        'Transportasi': 'hsl(var(--indigo-500))',
        'Bensin': 'hsl(var(--indigo-600))',
        
        // Bills & Utilities
        'Tagihan': 'hsl(var(--orange-500))',
        'Listrik': 'hsl(var(--orange-600))',
        'Internet': 'hsl(var(--teal-500))',
        
        // Entertainment
        'Hiburan': 'hsl(var(--pink-600))',
        'Game': 'hsl(var(--purple-600))',
        
        // Health & Wellness
        'Kesehatan': 'hsl(var(--green-500))',
        'Olahraga': 'hsl(var(--green-600))',
        
        // Education & Work
        'Pendidikan': 'hsl(var(--teal-600))',
        'Kantor': 'hsl(var(--gray-500))',
        
        // Finance
        'Investasi': 'hsl(var(--emerald-500))',
        'Asuransi': 'hsl(var(--emerald-600))',
        
        // Default fallback
        'default': 'hsl(var(--primary))'
    };

    const chartData = Object.entries(categoryMap)
        .map(([name, value]) => {
            const details = categoryDetails(name);
            return {
                name,
                value,
                icon: details.icon,
                fill: categoryColors[name as keyof typeof categoryColors] || categoryColors.default,
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
            acc[key] = { income: 0, expense: 0, breakdown: { income: {} as any, expense: {} as any } };
        }
        
        if (t.type === 'income') {
            acc[key].income += t.amount;
            acc[key].breakdown.income[t.category] = (acc[key].breakdown.income[t.category] || 0) + t.amount;
        } else if (t.type === 'expense') {
            acc[key].expense += t.amount;
            acc[key].breakdown.expense[t.category] = (acc[key].breakdown.expense[t.category] || 0) + t.amount;
        }
        return acc;
    }, {} as Record<string, any>);

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
