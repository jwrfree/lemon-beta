'use client';

import { useMemo, useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { useReminders } from '@/features/reminders/hooks/use-reminders';
import { cn } from '@/lib/utils';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { useGoals } from '@/features/goals/hooks/use-goals';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    ArrowClockwise,
    ArrowUpRight,
    ChartPieSlice,
    ListChecks,
    Pulse,
    Sparkle,
    TrendUp
} from '@phosphor-icons/react';
import { startOfMonth, subMonths, isSameMonth, parseISO, differenceInCalendarDays, endOfMonth, subDays, eachDayOfInterval, format, isSameDay } from 'date-fns';

import { DashboardAlerts } from './dashboard-alerts';
import { DashboardRecentTransactions } from './dashboard-recent-transactions';
import { DashboardBudgetStatus } from './dashboard-budget-status';
import { DashboardGoals } from './dashboard-goals';
import { DashboardSkeleton } from './dashboard-skeleton';
import { DashboardRecentTransactionsEmpty } from './dashboard-recent-transactions-empty';
import { EmptyState } from '@/components/empty-state';
import { NetWorthCard } from './net-worth-card';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UserProfileDropdown } from '@/components/user-profile-dropdown';
import { RiskScoreCard } from '@/features/insights/components/risk-score-card';
import { AppPageBody, AppPageHeaderChrome, AppPageShell } from '@/components/app-page-shell';

// Import Analyst Charts Components
import { FinancialPulse } from '@/features/charts/components/financial-pulse';
import { CategoryPie } from '@/features/charts/components/category-pie';
import { CategoryPilla } from '@/features/charts/components/chart-lists';
import { CashflowComposedChart } from '@/features/charts/components/cashflow-composed-chart';
import { ProphetChart } from '@/features/charts/components/prophet-chart';
import type { DailyMetric } from '@/features/charts/types';

interface CashflowPoint {
    date: string;
    income: number;
    expense: number;
    net: number;
    accumulatedNet: number;
}

export const DesktopDashboard = () => {
    const [lastRefreshed, setLastRefreshed] = useState<Date>(() => new Date());
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
    const { setIsAIChatOpen } = useUI();

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

    // ─── Chat bridge event listeners ─────────────────────────────────────
    useEffect(() => {
        const handleAnalystViewEvent = (e: Event) => {
            const val = (e as CustomEvent<boolean>).detail;
            setIsAnalystView(val);
        };
        window.addEventListener('lemon:set-analyst-view', handleAnalystViewEvent);
        return () => window.removeEventListener('lemon:set-analyst-view', handleAnalystViewEvent);
    }, []);

    useEffect(() => {
        const handleWalletFilterEvent = (e: Event) => {
            const val = (e as CustomEvent<string>).detail;
            if (val) setSelectedWalletId(val);
        };
        window.addEventListener('lemon:set-wallet-filter', handleWalletFilterEvent);
        return () => window.removeEventListener('lemon:set-wallet-filter', handleWalletFilterEvent);
    }, []);

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
        return days.reduce<CashflowPoint[]>((acc, day) => {
            const previousAccumulatedNet = acc[acc.length - 1]?.accumulatedNet ?? 0;
            const dateKey = format(day, 'yyyy-MM-dd');
            let dailyInc = 0;
            let dailyExp = 0;

            filteredTransactions.forEach(t => {
                if (isSameDay(parseISO(t.date), day)) {
                    if (t.type === 'income') dailyInc += t.amount;
                    if (t.type === 'expense') dailyExp += t.amount;
                }
            });

            acc.push({
                date: dateKey,
                income: dailyInc,
                expense: dailyExp,
                net: dailyInc - dailyExp,
                accumulatedNet: previousAccumulatedNet + dailyInc - dailyExp
            });

            return acc;
        }, []);
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
                .filter(t => {
                    if (t.type !== 'expense') return false;
                    if (!b.categories.includes(t.category)) return false;
                    if (!isSameMonth(parseISO(t.date), now)) return false;
                    // If budget has a sub-category filter, match it
                    if (b.subCategory) return t.subCategory === b.subCategory;
                    return true;
                })
                .reduce((acc, t) => acc + t.amount, 0);
            return { ...b, spent };
        }).sort((a, b) => ((b.spent || 0) / b.targetAmount) - ((a.spent || 0) / a.targetAmount)).slice(0, 3);
    }, [budgets, filteredTransactions, now]);

    const activeGoals = useMemo(() => goals.filter(g => (g.currentAmount || 0) < g.targetAmount).slice(0, 3), [goals]);

    const reminderSummary = useMemo(() => {
        const now2 = now;
        const upcoming = reminders.filter(r => r.dueDate && r.status !== 'completed' && differenceInCalendarDays(parseISO(r.dueDate), now2) >= 0 && differenceInCalendarDays(parseISO(r.dueDate), now2) <= 7).length;
        const overdue = reminders.filter(r => r.dueDate && r.status !== 'completed' && differenceInCalendarDays(parseISO(r.dueDate), now2) < 0).length;
        const nextReminder = reminders
            .filter(r => r.dueDate && r.status !== 'completed' && differenceInCalendarDays(parseISO(r.dueDate), now2) >= 0)
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];
        return { upcomingCount: upcoming, overdueCount: overdue, nextReminder };
    }, [reminders, now]);

    const debtSummary = useMemo(() => {
        const active = debts.filter(d => d.status !== 'settled' && (d.outstandingBalance ?? d.principal ?? 0) > 0);
        const nextDueDebt = active
            .filter(d => d.dueDate)
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];
        const largestDebt = active
            .sort((a, b) => (b.outstandingBalance ?? b.principal ?? 0) - (a.outstandingBalance ?? a.principal ?? 0))[0];
        return { nextDueDebt, largestDebt };
    }, [debts]);

    const recentTransactions = useMemo(() => filteredTransactions.slice(0, 10), [filteredTransactions]);

    if (!mounted || isTxLoading) return <DashboardSkeleton />;
    const colorPalette = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5'];

    return (
        <TooltipProvider>
            <AppPageShell className="text-foreground">
                <AppPageHeaderChrome width="wide">
                    <div className="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-end md:justify-between md:px-6">
                        <div className="space-y-1">
                            <h1 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
                                Beranda
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                                <SelectTrigger className="h-10 w-[190px] rounded-full bg-card/96 text-sm font-medium shadow-[0_10px_22px_-18px_rgba(15,23,42,0.18)]">
                                    <SelectValue placeholder="Pilih Dompet" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                    <SelectItem value="all">Semua Dompet</SelectItem>
                                    {wallets.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                size="icon"
                                className={cn("h-10 w-10 rounded-full bg-card/96 shadow-[0_10px_22px_-18px_rgba(15,23,42,0.18)]", isPending && "animate-spin")}
                                onClick={handleRefresh}
                            >
                                <ArrowClockwise size={16} weight="regular" />
                            </Button>

                            <Button
                                variant="outline"
                                size="icon"
                                className="h-10 w-10 rounded-full bg-primary/10 text-primary shadow-[0_10px_22px_-18px_rgba(13,148,136,0.2)] transition-all hover:bg-primary/20 active:scale-95"
                                onClick={() => setIsAIChatOpen(true)}
                                title="Tanya Lemon AI"
                            >
                                <Sparkle size={16} weight="fill" />
                            </Button>

                            <UserProfileDropdown />
                        </div>
                    </div>
                </AppPageHeaderChrome>

                <AppPageBody width="wide" className="space-y-6 text-foreground">
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
                                            "h-8 rounded-xl bg-white/10 text-label font-medium text-white shadow-[0_10px_22px_-18px_rgba(15,23,42,0.2)] transition-all hover:bg-white/20",
                                            isAnalystView && "bg-white/30"
                                        )}
                                        onClick={() => setIsAnalystView(!isAnalystView)}
                                    >
                                        <Pulse size={12} weight="regular" className="mr-2" />
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
                                        <div className="rounded-2xl bg-card/98 p-6 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.18)]">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <ChartPieSlice size={20} weight="regular" className="text-primary" />
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
                                        <div className="rounded-2xl bg-card/98 p-6 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.18)]">
                                            <div className="flex items-center gap-2 mb-6">
                                                <ArrowUpRight size={20} weight="regular" className="text-destructive" />
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
                                                    <EmptyState 
                                                        title="Data Tidak Cukup"
                                                        description="Belum ada transaksi pengeluaran bulan ini untuk dianalisis."
                                                        icon={ChartPieSlice}
                                                        variant="filter"
                                                        className="md:min-h-0 pt-0 py-12"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex min-h-[200px] flex-col items-center justify-center space-y-4 rounded-2xl bg-card/98 p-6 text-center shadow-[0_18px_36px_-28px_rgba(15,23,42,0.18)]">
                                        <div className="p-4 rounded-full bg-primary/5 text-primary">
                                            <ChartPieSlice size={32} weight="regular" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-medium">Analysis Ready</h4>
                                            <p className="text-xs text-muted-foreground max-w-[200px]">Aktifkan Analyst View untuk melihat prediksi AI dan rincian alokasi.</p>
                                        </div>
                                        <Button variant="outline" className="rounded-xl border-0 bg-background/94 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.16)]" size="sm" onClick={() => setIsAnalystView(true)}>Buka Analitik</Button>
                                    </div>
                                    <div className="flex min-h-[200px] flex-col items-center justify-center space-y-4 rounded-2xl bg-card/98 p-6 text-center shadow-[0_18px_36px_-28px_rgba(15,23,42,0.18)]">
                                        <div className="p-4 rounded-full bg-primary/5 text-primary">
                                            <TrendUp size={32} weight="regular" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-medium">Predictive Insights</h4>
                                            <p className="text-xs text-muted-foreground max-w-[200px]">Gunakan DeepSeek V3 untuk memproyeksikan pengeluaranmu.</p>
                                        </div>
                                        <Button variant="outline" className="rounded-xl border-0 bg-background/94 shadow-[0_10px_20px_-18px_rgba(15,23,42,0.16)]" size="sm" onClick={() => setIsAnalystView(true)}>Lihat Prediksi</Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT COLUMN (30%) - SECONDARY AREA */}
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            <RiskScoreCard />
                            <NetWorthCard totalAssets={totalBalance} totalLiabilities={totalDebt} />

                            {/* Recent Activity (Moved to Sidebar) */}
                            <div className="rounded-2xl bg-card/98 p-5 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.18)]">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium flex items-center gap-2">
                                        <ListChecks size={16} weight="regular" className="text-primary" />
                                        Transaksi Terbaru
                                    </h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-label text-muted-foreground hover:text-primary px-2"
                                        onClick={() => router.push('/transactions')}
                                    >
                                        Lihat semua
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
                </AppPageBody>
            </AppPageShell>
        </TooltipProvider>
    );
};
