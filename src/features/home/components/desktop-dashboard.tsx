'use client';

import { useMemo, useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
    ListTodo,
    TrendingUp
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
import { RiskScoreCard } from '@/features/insights/components/risk-score-card';

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

    const now = lastRefreshed;
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));
    const last30DaysStart = subDays(now, 29);

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
    const [isAnalystView, setIsAnalystView] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh();
            setLastRefreshed(new Date());
        });
    };

    const filteredTransactions = useMemo(() => {
        if (selectedWalletId === 'all') return transactions;
        return transactions.filter(t => t.walletId === selectedWalletId);
    }, [transactions, selectedWalletId]);

    const currentMonthData = useMemo(() => {
        const txs = filteredTransactions.filter(t => {
            const date = parseISO(t.date);
            return date >= currentMonthStart && date <= currentMonthEnd;
        });

        // Filter out internal transfers from income/expense track
        const nonTransferTxs = txs.filter(t => t.category !== 'Transfer');

        const income = nonTransferTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = nonTransferTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

        const cats: Record<string, number> = {};
        nonTransferTxs.filter(t => t.type === 'expense').forEach(t => {
            cats[t.category] = (cats[t.category] || 0) + t.amount;
        });
        const expenseCategories = Object.entries(cats)
            .sort(([, a], [, b]) => b - a)
            .map(([name, value]) => ({ name, value }));

        return { income, expense, net: income - expense, expenseCategories };
    }, [filteredTransactions, currentMonthStart, currentMonthEnd]);

    const prevMonthData = useMemo(() => {
        const txs = filteredTransactions.filter(t => {
            const date = parseISO(t.date);
            return date >= prevMonthStart && date <= prevMonthEnd;
        });

        const nonTransferTxs = txs.filter(t => t.category !== 'Transfer');

        const income = nonTransferTxs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = nonTransferTxs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return { income, expense, net: income - expense };
    }, [filteredTransactions, prevMonthStart, prevMonthEnd]);

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

    const recentTransactions = useMemo(() => filteredTransactions.slice(0, 10), [filteredTransactions]);

    const heatmapTransactions = useMemo(() => {
        return filteredTransactions
            .filter(t => t.type === 'expense' && isSameMonth(parseISO(t.date), now))
            .map(t => ({ date: t.date, amount: t.amount, type: t.type as 'expense' | 'income' }));
    }, [filteredTransactions, now]);

    if (!mounted || isTxLoading) return <DashboardSkeleton />;

    const colorPalette = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'];

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-background pb-24 text-foreground">
                <div className="max-w-[1920px] mx-auto p-4 lg:p-6 space-y-6">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-medium tracking-tight flex items-center gap-2">
                                <Activity className="w-6 h-6 text-primary" />
                                Financial Command Center
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1 font-medium">Real-time data analysis & portfolio tracking.</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                                <SelectTrigger className="w-[180px] bg-card border-none shadow-card rounded-lg h-9 text-xs font-medium">
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
                                className={cn("h-9 w-9 rounded-lg border-none shadow-card bg-card", isPending && "animate-spin")}
                                onClick={handleRefresh}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>

                            <UserProfileDropdown />
                        </div>
                    </div>

                    {/* MAIN GRID 70:30 RATIO */}
                    <div className="grid grid-cols-12 gap-6 items-start">

                        {/* LEFT COLUMN (70%) - PRIMARY AREA */}
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            {/* HERO ROW: The Pulse (Primary Insight) */}
                            <div className="relative group">
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
                                <div className="absolute top-8 right-12 z-20">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "bg-white/10 border-white/20 text-white hover:bg-white/20 h-8 text-xs uppercase tracking-widest font-medium transition-all",
                                            isAnalystView && "bg-white/30 border-white/40"
                                        )}
                                        onClick={() => setIsAnalystView(!isAnalystView)}
                                    >
                                        <Activity className="w-3 h-3 mr-2" />
                                        {isAnalystView ? 'Standard View' : 'Analyst View'}
                                    </Button>
                                </div>
                            </div>

                            {isAnalystView ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {/* AI PREDICTION ROW */}
                                    <ProphetChart
                                        transactions={transactions}
                                        historyStart={fetchStart}
                                        historyEnd={now}
                                        forecastDays={30}
                                    />

                                    {/* Deep Dive (Cashflow) */}
                                    <CashflowComposedChart data={cashflowData} />

                                    {/* ROW 2: Category Matrix */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Pie Chart */}
                                        <div className="bg-card rounded-lg p-6 shadow-card">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <PieIcon className="w-5 h-5 text-primary" />
                                                    <h3 className="font-medium text-sm">Allocation Radar</h3>
                                                </div>
                                            </div>
                                            <CategoryPie
                                                data={currentMonthData.expenseCategories}
                                                total={currentMonthData.expense}
                                                type="expense"
                                            />
                                        </div>

                                        {/* List Breakdown */}
                                        <div className="bg-card rounded-lg p-6 shadow-card">
                                            <div className="flex items-center gap-2 mb-6">
                                                <ArrowUpRight className="w-5 h-5 text-destructive" />
                                                <h3 className="font-medium text-sm">Top Spenders</h3>
                                            </div>
                                            <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-muted dark:scrollbar-thumb-muted-foreground/20">
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
                                                    <p className="text-muted-foreground text-xs text-center py-8 font-medium">No data available for analysis.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-card rounded-lg p-8 border border-border shadow-card flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]">
                                        <div className="p-4 rounded-full bg-primary/5 text-primary">
                                            <PieIcon className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-medium">Analysis Ready</h4>
                                            <p className="text-xs text-muted-foreground max-w-[200px]">Aktifkan Analyst View untuk melihat prediksi AI dan rincian alokasi.</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setIsAnalystView(true)}>Buka Analitik</Button>
                                    </div>
                                    <div className="bg-card rounded-lg p-8 border border-border shadow-card flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]">
                                        <div className="p-4 rounded-full bg-primary/5 text-primary">
                                            <TrendingUp className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-medium">Predictive Insights</h4>
                                            <p className="text-xs text-muted-foreground max-w-[200px]">Gunakan DeepSeek V3 untuk memproyeksikan pengeluaranmu.</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setIsAnalystView(true)}>Lihat Prediksi</Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN (30%) - SECONDARY AREA */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            <RiskScoreCard />
                            <NetWorthCard totalAssets={totalBalance} totalLiabilities={totalDebt} />

                            {/* Recent Activity (Moved to Sidebar) */}
                            <div className="bg-card rounded-lg p-5 shadow-card">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium flex items-center gap-2">
                                        <ListTodo className="w-4 h-4 text-primary" />
                                        Mutasi Terbaru
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs font-medium uppercase tracking-widest text-muted-foreground hover:text-primary px-2"
                                        onClick={() => router.push('/transactions')}
                                    >
                                        Semua
                                    </Button>
                                </div>
                                {filteredTransactions.length > 0 ? (
                                    <DashboardRecentTransactions
                                        transactions={recentTransactions.slice(0, 5)}
                                        wallets={wallets}
                                    />
                                ) : (
                                    <DashboardRecentTransactionsEmpty />
                                )}
                            </div>

                            <DashboardAlerts reminderSummary={reminderSummary} debtSummary={debtSummary} />
                            <DashboardBudgetStatus budgets={activeBudgets} />
                            {activeGoals.length > 0 && <DashboardGoals goals={activeGoals} />}
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
};
