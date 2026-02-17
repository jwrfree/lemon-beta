'use client';

import { useMemo, useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { useReminders } from '@/features/reminders/hooks/use-reminders';
import { cn, formatCurrency } from '@/lib/utils';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { useGoals } from '@/features/goals/hooks/use-goals';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    RefreshCw,
    LayoutDashboard,
    PieChart as PieIcon,
    ArrowUpRight,
    CalendarRange,
    Activity,
    ListTodo
} from 'lucide-react';
import { startOfMonth, subMonths, isSameMonth, parseISO, differenceInCalendarDays, endOfMonth, subDays, eachDayOfInterval, format, isSameDay } from 'date-fns';

import { DashboardAlerts } from './dashboard-alerts';
import { DashboardRecentTransactions } from './dashboard-recent-transactions';
import { DashboardBudgetStatus } from './dashboard-budget-status';
import { DashboardGoals } from './dashboard-goals';
import { DashboardSkeleton } from './dashboard-skeleton';
import { DashboardRecentTransactionsEmpty } from './dashboard-recent-transactions-empty';
import { ErrorBoundary } from '@/components/error-boundary';
import { NetWorthCard } from './net-worth-card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UserProfileDropdown } from '@/components/user-profile-dropdown';
// AI Insights Removed

// Import Analyst Charts Components
import { FinancialPulse } from '@/features/charts/components/financial-pulse';
import { TrendAnalytics } from '@/features/charts/components/trend-analytics';
import { CategoryPie } from '@/features/charts/components/category-pie';
import { CategoryPilla } from '@/features/charts/components/chart-lists';
import { CashflowComposedChart } from '@/features/charts/components/cashflow-composed-chart';
import { ExpenseHeatmap } from '@/features/charts/components/expense-heatmap';
import { ProphetChart } from '@/features/charts/components/prophet-chart';
import type { DailyMetric } from '@/features/charts/types';

export const DesktopDashboard = () => {
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
    const router = useRouter();

    // ==========================================
    // DATA FETCHING STRATEGY
    // ==========================================
    const now = lastRefreshed;
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));
    const last30DaysStart = subDays(now, 29);

    // Fetch wider range for trend analysis (Last 3 Months)
    const fetchStart = subMonths(currentMonthStart, 3);

    const { wallets } = useWallets();
    const { transactions, isLoading: isTxLoading } = useRangeTransactions(fetchStart, now);
    const { reminders } = useReminders();
    const { debts } = useDebts();
    const { budgets } = useBudgets();
    const { goals } = useGoals();

    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [selectedWalletId, setSelectedWalletId] = useState<string>('all');
    const [isPending, startTransition] = useTransition();

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh();
            setLastRefreshed(new Date());
        });
    };

    // ==========================================
    // ANALYST MODE CALCULATIONS
    // ==========================================

    const filteredTransactions = useMemo(() => {
        if (selectedWalletId === 'all') return transactions;
        return transactions.filter(t => t.walletId === selectedWalletId);
    }, [transactions, selectedWalletId]);

    // 1. Current Month Stats
    const currentMonthData = useMemo(() => {
        const txs = filteredTransactions.filter(t => {
            const date = parseISO(t.date);
            return date >= currentMonthStart && date <= currentMonthEnd;
        });

        const income = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = txs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        // Category Breakdown
        const cats: Record<string, number> = {};
        txs.filter(t => t.type === 'expense').forEach(t => {
            cats[t.category] = (cats[t.category] || 0) + t.amount;
        });
        const expenseCategories = Object.entries(cats)
            .sort(([, a], [, b]) => b - a)
            .map(([name, value]) => ({ name, value }));

        return { income, expense, net: income - expense, expenseCategories };
    }, [filteredTransactions, currentMonthStart, currentMonthEnd]);

    // 2. Previous Month Stats
    const prevMonthData = useMemo(() => {
        const txs = filteredTransactions.filter(t => {
            const date = parseISO(t.date);
            return date >= prevMonthStart && date <= prevMonthEnd;
        });

        const income = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = txs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return { income, expense, net: income - expense };
    }, [filteredTransactions, prevMonthStart, prevMonthEnd]);

    // 3. Trend Data (Daily) for Sparklines
    const trendData: DailyMetric[] = useMemo(() => {
        const dailyData: Record<string, { expense: number, count: number }> = {};
        eachDayOfInterval({ start: last30DaysStart, end: now }).forEach(day => {
            dailyData[format(day, 'yyyy-MM-dd')] = { expense: 0, count: 0 };
        });

        filteredTransactions.forEach(t => {
            if (t.type === 'expense') {
                const date = parseISO(t.date);
                if (date >= last30DaysStart && date <= now) {
                    const dayKey = format(date, 'yyyy-MM-dd');
                    if (dailyData[dayKey]) dailyData[dayKey].expense += t.amount;
                }
            }
        });

        return Object.entries(dailyData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, val]) => ({ date, expense: val.expense, count: val.count || 0 }));
    }, [filteredTransactions, last30DaysStart, now]);

    // 4. CASHFLOW COMPOSED DATA (Daily Accumulation)
    const cashflowData = useMemo(() => {
        const days = eachDayOfInterval({ start: startOfMonth(subMonths(now, 2)), end: now });
        let runningBalance = 0;

        return days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            let dailyInc = 0;
            let dailyExp = 0;

            filteredTransactions.forEach(t => {
                if (isSameDay(parseISO(t.date), day)) {
                    if (t.type === 'income') dailyInc += t.amount;
                    if (t.type === 'expense') dailyExp += t.amount;
                }
            });

            runningBalance += (dailyInc - dailyExp);

            return {
                date: dateKey,
                income: dailyInc,
                expense: dailyExp,
                net: dailyInc - dailyExp,
                accumulatedNet: runningBalance
            };
        });
    }, [filteredTransactions, now]);

    // 5. Projections
    const projectedExpense = useMemo(() => {
        const daysElapsed = differenceInCalendarDays(now, currentMonthStart) + 1;
        const daysInMonth = differenceInCalendarDays(currentMonthEnd, currentMonthStart) + 1;
        if (daysElapsed <= 0) return 0;
        const rate = currentMonthData.expense / daysElapsed;
        return rate * daysInMonth;
    }, [currentMonthData.expense, currentMonthStart, currentMonthEnd, now]);

    const totalBalance = useMemo(() => {
        if (selectedWalletId === 'all') return wallets.reduce((acc, w) => acc + w.balance, 0);
        return wallets.find(w => w.id === selectedWalletId)?.balance || 0;
    }, [wallets, selectedWalletId]);

    const totalDebt = useMemo(() => debts.filter(d => d.status !== 'settled').reduce((acc, d) => acc + (d.outstandingBalance ?? d.principal ?? 0), 0), [debts]);

    const activeBudgets = useMemo(() => {
        return budgets.map(b => {
            const spent = filteredTransactions
                .filter(t => t.type === 'expense' && b.categories.includes(t.category) && isSameMonth(parseISO(t.date), now))
                .reduce((acc, t) => acc + t.amount, 0);
            return { ...b, spent };
        }).sort((a, b) => ((b.spent || 0) / b.targetAmount) - ((a.spent || 0) / a.targetAmount)).slice(0, 3);
    }, [budgets, filteredTransactions, now]);

    const activeGoals = useMemo(() => goals.filter(g => (g.currentAmount || 0) < g.targetAmount).slice(0, 3), [goals]);

    const reminderSummary = useMemo(() => {
        const upcoming = reminders.filter(r => r.dueDate && r.status !== 'completed' && differenceInCalendarDays(parseISO(r.dueDate), now) >= 0).length;
        return { upcomingCount: upcoming, overdueCount: 0, nextReminder: undefined };
    }, [reminders, now]);

    const debtSummary = useMemo(() => ({ nextDueDebt: undefined, largestDebt: undefined }), []);

    const recentTransactions = useMemo(() => filteredTransactions.slice(0, 10), [filteredTransactions]); // Increased to 10 for main view

    // HEATMAP TRANSACTIONS (Current Month Only for intensity focus)
    const heatmapTransactions = useMemo(() => {
        return filteredTransactions
            .filter(t => t.type === 'expense' && isSameMonth(parseISO(t.date), now))
            .map(t => ({ date: t.date, amount: t.amount, type: t.type as 'expense' | 'income' }));
    }, [filteredTransactions, now]);

    if (!mounted || isTxLoading) return <DashboardSkeleton />;

    const colorPalette = ['bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500', 'bg-blue-500'];

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-20">
                <div className="max-w-[1920px] mx-auto p-4 lg:p-6 space-y-6">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                                <Activity className="w-6 h-6 text-indigo-500" />
                                Financial Command Center
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">Real-time data analysis & portfolio tracking.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                                <SelectTrigger className="w-[180px] bg-white dark:bg-zinc-900 border-none shadow-sm rounded-xl h-9 text-xs">
                                    <SelectValue placeholder="Pilih Dompet" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Global View</SelectItem>
                                    {wallets.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                size="icon"
                                className={cn("h-9 w-9 rounded-xl border-none shadow-sm bg-white dark:bg-zinc-900", isPending && "animate-spin")}
                                onClick={handleRefresh}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>

                            <UserProfileDropdown />
                        </div>
                    </div>

                    {/* HERO ROW: The Pulse */}
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

                    {/* AI PREDICTION ROW */}
                    <ProphetChart
                        transactions={transactions}
                        historyStart={fetchStart}
                        historyEnd={now}
                        forecastDays={30}
                    />

                    {/* ANALYST GRID */}
                    <div className="grid grid-cols-12 gap-6">

                        {/* LEFT COLUMN (Deep Dive Analysis) - Span 9 */}
                        <div className="col-span-12 lg:col-span-9 space-y-6">

                            {/* ROW 1: Cashflow Trend + Heatmap */}
                            <div className="grid grid-cols-12 gap-6">
                                <div className="col-span-12 lg:col-span-8">
                                    <CashflowComposedChart data={cashflowData} />
                                </div>
                                <div className="col-span-12 lg:col-span-4">
                                    <ExpenseHeatmap
                                        transactions={heatmapTransactions}
                                        start={currentMonthStart}
                                        end={currentMonthEnd}
                                    />
                                </div>
                            </div>

                            {/* ROW 2: Category Matrix */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Pie Chart */}
                                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <PieIcon className="w-5 h-5 text-indigo-500" />
                                            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Allocation Radar</h3>
                                        </div>
                                    </div>
                                    <CategoryPie
                                        data={currentMonthData.expenseCategories}
                                        total={currentMonthData.expense}
                                        type="expense"
                                    />
                                </div>

                                {/* List Breakdown */}
                                <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2 mb-6">
                                        <ArrowUpRight className="w-5 h-5 text-rose-500" />
                                        <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Top Spenders</h3>
                                    </div>
                                    <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                                        {currentMonthData.expenseCategories.map((cat, idx) => {
                                            const budget = budgets.find(b => b.categories.includes(cat.name));
                                            return (
                                                <CategoryPilla
                                                    key={cat.name}
                                                    category={cat.name}
                                                    amount={cat.value}
                                                    total={currentMonthData.expense}
                                                    budgetAmount={budget?.targetAmount}
                                                    color={colorPalette[idx % colorPalette.length]}
                                                />
                                            );
                                        })}
                                        {currentMonthData.expenseCategories.length === 0 && (
                                            <p className="text-zinc-400 text-sm text-center py-8">No data available for analysis.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* MOVED: Recent Transactions to Main Column */}
                            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                                    <ListTodo className="w-5 h-5 text-indigo-500" />
                                    Mutasi Rekening (10 Terakhir)
                                </h3>
                                {filteredTransactions.length > 0 ? (
                                    <DashboardRecentTransactions
                                        transactions={recentTransactions} // Shows 10 items now
                                        wallets={wallets}
                                    />
                                ) : (
                                    <DashboardRecentTransactionsEmpty />
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN (Sidebar Metrics) - Span 3 */}
                        <div className="col-span-12 lg:col-span-3 space-y-6">

                            <NetWorthCard totalAssets={totalBalance} totalLiabilities={totalDebt} />

                            <DashboardBudgetStatus budgets={activeBudgets} />

                            {activeGoals.length > 0 && <DashboardGoals goals={activeGoals} />}

                            <DashboardAlerts reminderSummary={reminderSummary} debtSummary={debtSummary} />
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
};
