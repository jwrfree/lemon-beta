'use client';

import React, { useMemo, Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { LoaderCircle, Flame, Calendar, Info, Layers, Zap, ArrowUpRight, Trophy, PieChart } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { parseISO, startOfMonth, endOfMonth, subMonths, format, differenceInDays, eachDayOfInterval, subDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import type { MonthData, DailyMetric, MonthlyMetric } from '@/features/charts/types';
import { useUI } from '@/components/ui-provider';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { 
    AnalyticsPageSkeleton, 
    FinancialPulseSkeleton, 
    TrendAnalyticsSkeleton, 
    MetricCardSkeleton, 
    CategoryPieSkeleton 
} from '@/features/charts/components/chart-skeleton';
import { NetWorthTrend } from '@/features/charts/components/advanced-stats/net-worth-trend';
import { BehaviorAnalytics } from '@/features/charts/components/advanced-stats/behavior-analytics';
import { SavingPotential } from '@/features/charts/components/advanced-stats/saving-potential';
import { SubscriptionAudit } from '@/features/charts/components/advanced-stats/subscription-audit';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useReminders } from '@/features/reminders/hooks/use-reminders';

// Dynamically import heavy chart components
const FinancialPulse = dynamic(() => import('@/features/charts/components/financial-pulse').then(mod => mod.FinancialPulse), { 
    ssr: false,
    loading: () => <FinancialPulseSkeleton />
});
const TrendAnalytics = dynamic(() => import('@/features/charts/components/trend-analytics').then(mod => mod.TrendAnalytics), { 
    ssr: false,
    loading: () => <TrendAnalyticsSkeleton />
});
const HealthGauge = dynamic(() => import('@/features/charts/components/financial-health').then(mod => mod.HealthGauge), { 
    ssr: false,
    loading: () => <div className="h-[150px] w-full animate-pulse bg-zinc-100 dark:bg-zinc-900 rounded-3xl" />
});
const HistoryChart = dynamic(() => import('@/features/charts/components/history-chart').then(mod => mod.HistoryChart), { 
    ssr: false,
    loading: () => <div className="h-[250px] w-full animate-pulse bg-zinc-100 dark:bg-zinc-900 rounded-3xl" />
});
const CategoryPie = dynamic(() => import('@/features/charts/components/category-pie').then(mod => mod.CategoryPie), { 
    ssr: false,
    loading: () => <CategoryPieSkeleton />
});

// Regular components
import { MetricCard } from '@/features/charts/components/financial-health';
import { CategoryPilla, TopTransactionItem } from '@/features/charts/components/chart-lists';
import { isWeekend } from 'date-fns';

function ChartContent() {
    const router = useRouter();
    const { setIsTxModalOpen, setTransactionToEdit } = useUI();
    const { budgets } = useBudgets();
    const { wallets } = useWallets();
    const { reminders } = useReminders();
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
    // ADVANCED DATA PROCESSING
    // ==========================================

    // 1. Net Worth Simulation
    const netWorthData = useMemo(() => {
        const totalWalletBalance = wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
        // Simplified trend: current balance is the end point, previous months are current - (income - expense)
        const history = [];
        let runningBalance = totalWalletBalance;

        for (let i = 0; i < 6; i++) {
            const date = subMonths(now, i);
            const monthLabel = format(date, 'MMM');
            
            // Calculate this month's net change
            const monthTx = allTransactions.filter(t => {
                const d = parseISO(t.date);
                return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
            });
            
            const income = monthTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
            const expense = monthTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            
            history.push({
                month: monthLabel,
                assets: runningBalance, // Simplified
                liabilities: 0, // Would need actual liability data
                netWorth: runningBalance
            });

            runningBalance -= (income - expense);
        }

        return history.reverse();
    }, [wallets, allTransactions, now]);

    // 2. Behavior Analysis (Weekend vs Weekday)
    const behaviorData = useMemo(() => {
        const last30 = allTransactions.filter(t => parseISO(t.date) >= last30DaysStart);
        const expenses = last30.filter(t => t.type === 'expense');
        
        const weekdays = expenses.filter(t => !isWeekend(parseISO(t.date)));
        const weekends = expenses.filter(t => isWeekend(parseISO(t.date)));
        
        const weekdayTotal = weekdays.reduce((sum, t) => sum + t.amount, 0);
        const weekendTotal = weekends.reduce((sum, t) => sum + t.amount, 0);
        
        // Find top categories
        const getTopCat = (txs: any[]) => {
            const cats: any = {};
            txs.forEach(t => cats[t.category] = (cats[t.category] || 0) + t.amount);
            return Object.entries(cats).sort(([,a],[,b]) => (b as number)-(a as number))[0]?.[0] || 'N/A';
        };

        // Payday Drain simulation: find last big income
        const incomes = last30.filter(t => t.type === 'income').sort((a,b) => b.amount - a.amount);
        const topIncome = incomes[0];
        let drainDays = 15; // Default fallback

        if (topIncome) {
            const payday = parseISO(topIncome.date);
            let cumulativeAfterPayday = 0;
            const threshold = topIncome.amount * 0.5;
            
            const expensesAfterPayday = expenses
                .filter(t => parseISO(t.date) >= payday)
                .sort((a,b) => a.date.localeCompare(b.date));
            
            for (let i = 0; i < expensesAfterPayday.length; i++) {
                cumulativeAfterPayday += expensesAfterPayday[i].amount;
                if (cumulativeAfterPayday >= threshold) {
                    drainDays = differenceInDays(parseISO(expensesAfterPayday[i].date), payday);
                    break;
                }
            }
        }

        return {
            weekdayAvg: weekdayTotal / 22, // Approx weekdays in month
            weekendAvg: weekendTotal / 8,   // Approx weekends in month
            paydayDrainDays: drainDays,
            topWeekdayCategory: getTopCat(weekdays),
            topWeekendCategory: getTopCat(weekends)
        };
    }, [allTransactions, last30DaysStart]);

    // 3. Saving Potential
    const savingData = useMemo(() => {
        const currentMonthExp = allTransactions.filter(t => {
            const d = parseISO(t.date);
            return d >= currentMonthStart && d <= currentMonthEnd && t.type === 'expense';
        });
        
        const currentMonthInc = allTransactions.filter(t => {
            const d = parseISO(t.date);
            return d >= currentMonthStart && d <= currentMonthEnd && t.type === 'income';
        }).reduce((sum, t) => sum + t.amount, 0);

        const fixedCosts = currentMonthExp
            .filter(t => t.category.toLowerCase().includes('tagihan') || t.category.toLowerCase().includes('cicilan') || t.category.toLowerCase().includes('kost'))
            .reduce((sum, t) => sum + t.amount, 0);
            
        const variableSpending = currentMonthExp.reduce((sum, t) => sum + t.amount, 0) - fixedCosts;
        const actualSavings = Math.max(0, currentMonthInc - (fixedCosts + variableSpending));
        
        // Potential = Income - Fixed - (Planned Budgets)
        const plannedVariable = budgets.reduce((sum, b) => sum + b.targetAmount, 0);
        const potentialSavings = Math.max(actualSavings, currentMonthInc - (fixedCosts + plannedVariable));

        return {
            income: currentMonthInc,
            fixedCosts,
            variableSpending,
            actualSavings,
            potentialSavings: potentialSavings || (currentMonthInc * 0.3) // Fallback to 30% if no budgets
        };
    }, [allTransactions, currentMonthStart, currentMonthEnd, budgets]);

    // 4. Subscriptions Audit
    const subscriptionData = useMemo(() => {
        const subs = reminders
            .filter(r => r.repeatRule?.frequency !== 'none' && r.amount)
            .map(r => ({
                id: r.id,
                name: r.title,
                amount: r.amount || 0,
                category: r.category || 'Subscription',
                isDueSoon: r.dueDate ? differenceInDays(parseISO(r.dueDate), now) <= 3 : false
            }));

        const totalMonthly = subs.reduce((sum, s) => sum + s.amount, 0);
        return { items: subs.slice(0, 5), totalMonthly };
    }, [reminders, now]);


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
        return <AnalyticsPageSkeleton />;
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

            {/* ADVANCED STATS GRID */}
            <div className="px-4 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <NetWorthTrend data={netWorthData} />
                <SavingPotential data={savingData} />
            </div>

            <div className="px-4 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <BehaviorAnalytics data={behaviorData} />
                <SubscriptionAudit items={subscriptionData.items} totalMonthly={subscriptionData.totalMonthly} />
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
                            <div className="py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2.5rem] premium-shadow relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
                                    <Layers className="h-32 w-32" />
                                </div>
                                <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-3xl mb-4">
                                    <Info className="w-8 h-8 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-bold tracking-tight mb-1">Belum Ada Pengeluaran</h3>
                                <p className="text-sm text-muted-foreground max-w-[250px]">
                                    Semua transaksi besarmu akan dianalisis secara otomatis di sini.
                                </p>
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
                                <div className="py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2.5rem] premium-shadow relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] rotate-12">
                                            <Trophy className="h-32 w-32" />
                                        </div>
                                        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-3xl mb-4">
                                            <PieChart className="w-8 h-8 text-zinc-400" />
                                        </div>
                                        <h3 className="text-lg font-bold tracking-tight mb-1">Belum Ada Pengeluaran</h3>
                                        <p className="text-sm text-muted-foreground max-w-[250px]">
                                            Mulai catat pengeluaranmu untuk melihat breakdown kategori secara mendalam.
                                        </p>
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
                                <div className="py-16 flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2.5rem] premium-shadow relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] rotate-12">
                                            <Trophy className="h-32 w-32" />
                                        </div>
                                        <div className="p-4 bg-zinc-100 dark:bg-zinc-900 rounded-3xl mb-4">
                                            <PieChart className="w-8 h-8 text-zinc-400" />
                                        </div>
                                        <h3 className="text-lg font-bold tracking-tight mb-1">Belum Ada Pemasukan</h3>
                                        <p className="text-sm text-muted-foreground max-w-[250px]">
                                            Catat setiap pendapatanmu untuk melihat analisis sumber keuangan yang komprehensif.
                                        </p>
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