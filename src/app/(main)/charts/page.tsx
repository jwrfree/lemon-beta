'use client';

import React, { useMemo, Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Flame, Calendar, Info, Layers, Zap, ArrowUpRight } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { parseISO, startOfMonth, endOfMonth, subMonths, format, differenceInDays, eachDayOfInterval, subDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { MonthData, DailyMetric, MonthlyMetric } from '@/features/charts/types';
import { useUI } from '@/components/ui-provider';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';

// Components
import { FinancialPulse } from '@/features/charts/components/financial-pulse';
import { TrendAnalytics } from '@/features/charts/components/trend-analytics';
import { HealthGauge, MetricCard } from '@/features/charts/components/financial-health';
import { HistoryChart } from '@/features/charts/components/history-chart';
import { CategoryPilla, TopTransactionItem } from '@/features/charts/components/chart-lists';
import { AIInsights } from '@/features/charts/components/ai-insights';
import { CategoryPie } from '@/features/charts/components/category-pie';

function ChartContent() {
    const router = useRouter();
    const { setIsTxModalOpen, setTransactionToEdit } = useUI();
    const { budgets } = useBudgets();
    const [categoryView, setCategoryView] = useState<'expense' | 'income'>('expense');

    // ==========================================
    // DATE LOGIC
    // ==========================================
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const prevMonth = subMonths(now, 1);
    const prevMonthStart = startOfMonth(prevMonth);
    const prevMonthEnd = endOfMonth(prevMonth);
    const last30DaysStart = subDays(now, 29);
    const sixMonthsAgoStart = startOfMonth(subMonths(now, 5));

    // ==========================================
    // DATA FETCHING (Single Source of Truth)
    // ==========================================
    const fetchStart = sixMonthsAgoStart;
    const fetchEnd = now;

    const { transactions: allTransactions, isLoading } = useRangeTransactions(fetchStart, fetchEnd);

    // ==========================================
    // DATA PROCESSING (Client Side)
    // ==========================================

    // 1. Filter Transactions by Period
    const { currentMonthTx, prevMonthTx, last30DaysTx, last6MonthsTx } = useMemo(() => {
        const current = allTransactions.filter(t => {
            const date = parseISO(t.date);
            return date >= currentMonthStart && date <= currentMonthEnd;
        });

        const prev = allTransactions.filter(t => {
            const date = parseISO(t.date);
            return date >= prevMonthStart && date <= prevMonthEnd;
        });

        const last30 = allTransactions.filter(t => {
            const date = parseISO(t.date);
            return date >= last30DaysStart && date <= now;
        });

        return { currentMonthTx: current, prevMonthTx: prev, last30DaysTx: last30, last6MonthsTx: allTransactions };
    }, [allTransactions, currentMonthStart, currentMonthEnd, prevMonthStart, prevMonthEnd, last30DaysStart, now]);

    // 2. Compute Current Month Metrics
    const currentMonthData: MonthData = useMemo(() => {
        let inc = 0, exp = 0;
        const expCats: Record<string, number> = {};
        const incCats: Record<string, number> = {};

        currentMonthTx.forEach(t => {
            if (t.type === 'income') {
                inc += t.amount;
                incCats[t.category] = (incCats[t.category] || 0) + t.amount;
            }
            if (t.type === 'expense') {
                exp += t.amount;
                expCats[t.category] = (expCats[t.category] || 0) + t.amount;
            }
        });

        const sortedExpCats = Object.entries(expCats)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amt]) => ({ name: cat, value: amt }));

        const sortedIncCats = Object.entries(incCats)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amt]) => ({ name: cat, value: amt }));

        return {
            income: inc,
            expense: exp,
            net: inc - exp,
            expenseCategories: sortedExpCats,
            incomeCategories: sortedIncCats
        };
    }, [currentMonthTx]);

    // 3. Compute Previous Month Metrics
    const prevMonthData: MonthData = useMemo(() => {
        let inc = 0, exp = 0;
        prevMonthTx.forEach(t => {
            if (t.type === 'income') inc += t.amount;
            if (t.type === 'expense') exp += t.amount;
        });
        return { income: inc, expense: exp, net: inc - exp, expenseCategories: [], incomeCategories: [] };
    }, [prevMonthTx]);

    // 4. Compute 30-Day Trend
    const trendData: DailyMetric[] = useMemo(() => {
        const dailyData: Record<string, { expense: number, count: number }> = {};

        eachDayOfInterval({ start: last30DaysStart, end: now }).forEach(day => {
            dailyData[format(day, 'yyyy-MM-dd')] = { expense: 0, count: 0 };
        });

        last30DaysTx.forEach(t => {
            if (t.type === 'expense') {
                const dayKey = format(parseISO(t.date), 'yyyy-MM-dd');
                if (dailyData[dayKey]) {
                    dailyData[dayKey].expense += t.amount;
                    dailyData[dayKey].count += 1;
                }
            }
        });

        return Object.entries(dailyData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, val]) => ({ date, expense: val.expense, count: val.count }));
    }, [last30DaysTx, last30DaysStart, now]);

    // 5. Compute 6-Month History
    const historyData: MonthlyMetric[] = useMemo(() => {
        const monthsMap: Record<string, MonthlyMetric> = {};
        for (let i = 0; i < 6; i++) {
            const d = subMonths(now, i);
            const key = format(d, 'MMM');
            monthsMap[key] = { month: key, income: 0, expense: 0, net: 0 };
        }

        last6MonthsTx.forEach(t => {
            const d = parseISO(t.date);
            const key = format(d, 'MMM');
            if (monthsMap[key]) {
                if (t.type === 'income') monthsMap[key].income += t.amount;
                if (t.type === 'expense') monthsMap[key].expense += t.amount;
            }
        });

        return Object.values(monthsMap).reverse();
    }, [last6MonthsTx, now]);

    // 6. Projections & Metrics
    const projectedExpense = useMemo(() => {
        const daysElapsed = differenceInDays(now, currentMonthStart) + 1;
        const daysInMonth = differenceInDays(currentMonthEnd, currentMonthStart) + 1;
        if (daysElapsed <= 0) return 0;
        const rate = currentMonthData.expense / daysElapsed;
        return rate * daysInMonth;
    }, [currentMonthData.expense, currentMonthStart, currentMonthEnd, now]);

    const savingsRate = useMemo(() => {
        if (currentMonthData.income === 0) return 0;
        return ((currentMonthData.income - currentMonthData.expense) / currentMonthData.income) * 100;
    }, [currentMonthData]);

    const burnRate = useMemo(() => {
        const daysInMonth = differenceInDays(currentMonthEnd, currentMonthStart) + 1;
        return currentMonthData.expense / daysInMonth;
    }, [currentMonthData.expense, currentMonthStart, currentMonthEnd]);

    const topTransactions = useMemo(() => {
        return [...currentMonthTx]
            .filter(t => t.type === 'expense')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);
    }, [currentMonthTx]);

    const colorPalette = [
        'bg-rose-500', 'bg-orange-500', 'bg-amber-500',
        'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500',
        'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-blue-500'
    ];

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
                <LoaderCircle className="w-10 h-10 animate-spin text-zinc-900 dark:text-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black pb-40">
            {/* STICKY HEADER */}
            <div className="pt-safe-top px-6 pb-2 sticky top-0 bg-zinc-50/80 dark:bg-black/80 backdrop-blur-xl z-30 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <div className="flex justify-between items-center py-3">
                    <h2 className="text-xl font-bold tracking-tight">Financial Analytics</h2>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-semibold px-2 py-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(now, 'MMM yyyy')}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* SECTIONS */}
            <FinancialPulse
                net={currentMonthData.net}
                income={currentMonthData.income}
                expense={currentMonthData.expense}
                dataPoints={trendData}
                prevMonthNet={prevMonthData.net}
                prevMonthIncome={prevMonthData.income}
                prevMonthExpense={prevMonthData.expense}
                projectedExpense={projectedExpense}
            />

            <div className="px-4 mt-6">
                <AIInsights transactions={currentMonthTx} />
            </div>

            <div className="px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <HealthGauge savingsRate={savingsRate} />
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <MetricCard
                        title="Burn Rate"
                        value={formatCurrency(burnRate)}
                        subtitle="Rata-rata per hari"
                        icon={Flame}
                        trend={{ value: prevMonthData.expense > 0 ? ((burnRate * 30 - prevMonthData.expense) / prevMonthData.expense) * 100 : 0 }}
                    />
                    <MetricCard
                        title="Freq. Transaksi"
                        value={currentMonthTx.length.toString()}
                        subtitle="Kali bulan ini"
                        icon={Zap}
                    />
                    <MetricCard
                        title="Runway"
                        value={burnRate > 0 && currentMonthData.net > 0 ? `${(currentMonthData.net / burnRate).toFixed(0)} Hari` : '∞'}
                        subtitle="Sisa waktu surplus"
                        icon={Layers}
                    />
                    <MetricCard
                        title="Rekor Tertinggi"
                        value={topTransactions.length > 0 ? formatCurrency(topTransactions[0].amount) : '0'}
                        subtitle="Transaksi max"
                        icon={ArrowUpRight}
                    />
                </div>
            </div>

            {/* DESKTOP CHART GRID */}
            <div className="px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <TrendAnalytics data={trendData} />
                </div>
                <div className="lg:col-span-1">
                    <HistoryChart data={historyData} />
                </div>
            </div>

            {/* DESKTOP LISTS GRID */}
            <div className="px-4 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Top Transactions */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold tracking-tight">Pengeluaran Terbesar</h3>
                        <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-3">
                        {topTransactions.length > 0 ? (
                            topTransactions.map((tx, idx) => (
                                <TopTransactionItem
                                    key={tx.id}
                                    transaction={tx}
                                    rank={idx + 1}
                                    onClick={() => {
                                        setTransactionToEdit(tx);
                                        setIsTxModalOpen(true);
                                    }}
                                />
                            ))
                        ) : (
                            <div className="py-8 text-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                                Belum ada pengeluaran.
                            </div>
                        )}
                    </div>
                </div>

                {/* Categories */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold tracking-tight">Breakdown Kategori</h3>

                        {/* Toggle Expense / Income */}
                        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg">
                            <button
                                onClick={() => setCategoryView('expense')}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                    categoryView === 'expense'
                                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                                )}
                            >
                                Pengeluaran
                            </button>
                            <button
                                onClick={() => setCategoryView('income')}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-md transition-all",
                                    categoryView === 'income'
                                        ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                                )}
                            >
                                Pemasukan
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* PIE CHART */}
                        <CategoryPie
                            data={categoryView === 'expense' ? currentMonthData.expenseCategories : currentMonthData.incomeCategories}
                            total={categoryView === 'expense' ? currentMonthData.expense : currentMonthData.income}
                            type={categoryView}
                        />

                        {categoryView === 'expense' ? (
                            currentMonthData.expenseCategories.length > 0 ? (
                                currentMonthData.expenseCategories.map((cat, idx) => {
                                    const budget = budgets.find(b => b.categories.includes(cat.name));
                                    return (
                                        <CategoryPilla
                                            key={cat.name}
                                            category={cat.name}
                                            amount={cat.value}
                                            total={currentMonthData.expense}
                                            budgetAmount={budget?.targetAmount}
                                            color={colorPalette[idx % colorPalette.length]}
                                            onClick={() => router.push(`/transactions?category=${encodeURIComponent(cat.name)}`)}
                                        />
                                    );
                                })
                            ) : (
                                <div className="py-8 text-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                                    Belum ada pengeluaran.
                                </div>
                            )
                        ) : (
                            currentMonthData.incomeCategories.length > 0 ? (
                                currentMonthData.incomeCategories.map((cat, idx) => (
                                    <CategoryPilla
                                        key={cat.name}
                                        category={cat.name}
                                        amount={cat.value}
                                        total={currentMonthData.income}
                                        color="bg-emerald-500"
                                        onClick={() => router.push(`/transactions?category=${encodeURIComponent(cat.name)}`)}
                                    />
                                ))
                            ) : (
                                <div className="py-8 text-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                                    Belum ada pemasukan.
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ChartsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-black" />}>
            <ChartContent />
        </Suspense>
    );
}