
'use client';

import { useMemo, useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useWallets } from '@/features/wallets/hooks/use-wallets';
import { useRangeTransactions } from '@/features/transactions/hooks/use-range-transactions';
import { useReminders } from '@/features/reminders/hooks/use-reminders';
import { cn } from '@/lib/utils';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { useGoals } from '@/features/goals/hooks/use-goals';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Search,
    RefreshCw,
    BarChart3,
    Sparkles
} from 'lucide-react';
import { startOfMonth, subMonths, isSameMonth, parseISO, differenceInCalendarDays } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { FinanceOverview } from './finance-overview';
import { DashboardAlerts } from './dashboard-alerts';
import { DashboardCashflow } from './dashboard-cashflow';
import { DashboardWallets } from './dashboard-wallets';
import { DashboardRecentTransactions } from './dashboard-recent-transactions';
import { DashboardExpensePie } from './dashboard-expense-pie';
import { DashboardBudgetStatus } from './dashboard-budget-status';
import { DashboardGoals } from './dashboard-goals';
import { DashboardQuickActions } from './dashboard-quick-actions';
import { DashboardSkeleton } from './dashboard-skeleton';
import { DashboardRecentTransactionsEmpty } from './dashboard-recent-transactions-empty';
import { DashboardGoalsEmpty } from './dashboard-goals-empty';
import { ErrorBoundary } from '@/components/error-boundary';
import { NetWorthCard } from './net-worth-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserProfileDropdown } from '@/components/user-profile-dropdown';
import { DashboardSmartInsight } from '@/features/home/components/dashboard-smart-insight';

export const DesktopDashboard = () => {
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    // Dates for fetching
    const now = lastRefreshed;
    const currentMonthStart = startOfMonth(now);
    const threeMonthsAgoStart = startOfMonth(subMonths(currentMonthStart, 2));

    const { wallets } = useWallets();
    const { transactions } = useRangeTransactions(threeMonthsAgoStart, now);
    const { reminders } = useReminders();
    const { debts } = useDebts();
    const { budgets } = useBudgets();
    const { goals } = useGoals();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [chartRange, setChartRange] = useState<'30' | '90' | 'month'>('month');
    const [selectedWalletId, setSelectedWalletId] = useState<string>('all');
    const [isPending, startTransition] = useTransition();

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh();
            setLastRefreshed(new Date());
        });
    };

    // Stats Calculation
    const currentMonth = currentMonthStart;
    const lastMonth = subMonths(currentMonth, 1);

    const visibleWallets = useMemo(() => {
        if (selectedWalletId === 'all') return wallets;
        return wallets.filter(w => w.id === selectedWalletId);
    }, [wallets, selectedWalletId]);

    const filteredTransactions = useMemo(() => {
        if (selectedWalletId === 'all') return transactions;
        return transactions.filter(t => t.walletId === selectedWalletId);
    }, [transactions, selectedWalletId]);

    const currentStats = useMemo(() => {
        const monthTx = filteredTransactions.filter(t => isSameMonth(parseISO(t.date), currentMonth));
        const income = monthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = monthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return { income, expense, net: income - expense };
    }, [filteredTransactions, currentMonth]);

    const lastStats = useMemo(() => {
        const monthTx = filteredTransactions.filter(t => isSameMonth(parseISO(t.date), lastMonth));
        const income = monthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = monthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return { income, expense, net: income - expense };
    }, [filteredTransactions, lastMonth]);

    const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return { direction: 'flat' as const, value: '0%' };
        const diff = current - previous;
        const percent = (diff / previous) * 100;
        if (Math.abs(percent) < 0.1) {
            return { direction: 'flat' as const, value: '0%' };
        }
        return {
            direction: percent >= 0 ? 'up' as const : 'down' as const,
            value: `${Math.abs(percent).toFixed(1)}%`
        };
    };

    const incomeTrend = useMemo(() => calculateTrend(currentStats.income, lastStats.income), [currentStats.income, lastStats.income]);
    const expenseTrend = useMemo(() => calculateTrend(currentStats.expense, lastStats.expense), [currentStats.expense, lastStats.expense]);
    const netTrend = useMemo(() => calculateTrend(currentStats.net, lastStats.net), [currentStats.net, lastStats.net]);

    const totalBalance = useMemo(() => visibleWallets.reduce((acc, w) => acc + w.balance, 0), [visibleWallets]);

    const totalDebt = useMemo(() => {
        return debts
            .filter(d => d.status !== 'settled')
            .reduce((acc, d) => acc + (d.outstandingBalance ?? d.principal ?? 0), 0);
    }, [debts]);

    const calculatedBudgets = useMemo(() => {
        return budgets.map(budget => {
            const budgetSpent = transactions
                .filter(t =>
                    t.type === 'expense' &&
                    budget.categories.includes(t.category) &&
                    isSameMonth(parseISO(t.date), currentMonth)
                )
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                ...budget,
                spent: budgetSpent
            };
        });
    }, [budgets, transactions, currentMonth]);

    const reminderSummary = useMemo(() => {
        const overdue = reminders.filter(r => r.dueDate && r.status !== 'completed' && differenceInCalendarDays(parseISO(r.dueDate), now) < 0);
        const upcoming = reminders
            .filter(r => r.dueDate && r.status !== 'completed')
            .filter(r => {
                const diff = differenceInCalendarDays(parseISO(r.dueDate || ''), now);
                return diff >= 0 && diff <= 7;
            })
            .sort((a, b) => {
                const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                return aDue - bDue;
            });
        return {
            overdueCount: overdue.length,
            upcomingCount: upcoming.length,
            nextReminder: upcoming[0],
        };
    }, [reminders, now]);

    const debtSummary = useMemo(() => {
        const activeDebts = debts.filter(d => d.status !== 'settled');
        const nextDue = activeDebts
            .filter(d => d.dueDate)
            .sort((a, b) => {
                const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                return aDue - bDue;
            })[0];
        const largest = activeDebts.reduce((max, debt) => {
            const outstanding = debt.outstandingBalance ?? debt.principal ?? 0;
            const maxOutstanding = max ? (max.outstandingBalance ?? max.principal ?? 0) : 0;
            if (!max || outstanding > maxOutstanding) return debt;
            return max;
        }, undefined as import('@/types/models').Debt | undefined);

        return { nextDueDebt: nextDue, largestDebt: largest };
    }, [debts]);

    const recentTransactions = useMemo(() => filteredTransactions.slice(0, 5), [filteredTransactions]);

    // Memoize derived stats to prevent unnecessary re-renders of children
    const activeBudgets = useMemo(() => {
        return calculatedBudgets.sort((a, b) => {
            const aPercent = ((a.spent ?? 0) / a.targetAmount);
            const bPercent = ((b.spent ?? 0) / b.targetAmount);
            return bPercent - aPercent;
        }).slice(0, 3);
    }, [calculatedBudgets]);

    const activeGoals = useMemo(() => {
        return goals
            .filter(g => (g.currentAmount || 0) < g.targetAmount)
            .sort((a, b) => {
                const aPercent = (a.currentAmount || 0) / a.targetAmount;
                const bPercent = (b.currentAmount || 0) / b.targetAmount;
                return bPercent - aPercent;
            })
            .slice(0, 3);
    }, [goals]);

    if (!mounted) return <DashboardSkeleton />;

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
                <div className="max-w-[1600px] mx-auto p-4 lg:p-8 space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <PageHeader
                            title="Dashboard"
                            description="Ringkasan aktivitas keuanganmu hari ini."
                            className="p-0"
                        />

                        <div className="flex items-center gap-3">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    placeholder="Cari transaksi..."
                                    className="flex h-10 w-full rounded-lg border-none bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 pl-9 shadow-sm"
                                />
                            </div>

                            <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                                <SelectTrigger className="w-[180px] bg-card border-none shadow-sm h-10 rounded-lg">
                                    <SelectValue placeholder="Pilih Dompet" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Dompet</SelectItem>
                                    {wallets.map(w => (
                                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className={cn(
                                            "h-10 w-10 bg-card border-none shadow-sm hover:bg-primary/5 transition-all rounded-lg",
                                            isPending && "animate-spin"
                                        )}
                                        onClick={handleRefresh}
                                        disabled={isPending}
                                    >
                                        <RefreshCw className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Segarkan Data</TooltipContent>
                            </Tooltip>

                            <UserProfileDropdown />
                        </div>
                    </div>

                    {/* Quick Actions & Hero Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-8">
                            <FinanceOverview
                                totalBalance={totalBalance}
                                income={currentStats.income}
                                expense={currentStats.expense}
                                net={currentStats.net}
                                prevIncome={lastStats.income}
                                prevExpense={lastStats.expense}
                                prevNet={lastStats.net}
                                incomeTrend={incomeTrend}
                                expenseTrend={expenseTrend}
                                netTrend={netTrend}
                            />
                        </div>
                        <div className="lg:col-span-4">
                            <DashboardQuickActions />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Main Charts Section */}
                        <div className="lg:col-span-8 space-y-6">
                            <DashboardCashflow
                                transactions={filteredTransactions}
                                chartRange={chartRange}
                                setChartRange={setChartRange}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DashboardWallets wallets={visibleWallets} />
                                <DashboardExpensePie transactions={filteredTransactions} />
                            </div>

                            {filteredTransactions.length > 0 ? (
                                <DashboardRecentTransactions
                                    transactions={recentTransactions}
                                    wallets={wallets}
                                />
                            ) : (
                                <DashboardRecentTransactionsEmpty />
                            )}
                        </div>

                        {/* Sidebar Sections */}
                        <div className="lg:col-span-4 space-y-6">
                            <ErrorBoundary>
                                <DashboardSmartInsight
                                    income={currentStats.income}
                                    expense={currentStats.expense}
                                    net={currentStats.net}
                                    hasTransactions={filteredTransactions.length > 0}
                                />
                            </ErrorBoundary>
                            <ErrorBoundary>
                                <DashboardAlerts
                                    reminderSummary={reminderSummary}
                                    debtSummary={debtSummary}
                                />
                            </ErrorBoundary>
                            <ErrorBoundary>
                                <NetWorthCard totalAssets={totalBalance} totalLiabilities={totalDebt} />
                            </ErrorBoundary>
                            <ErrorBoundary>
                                <DashboardBudgetStatus budgets={activeBudgets} />
                            </ErrorBoundary>
                            {activeGoals.length > 0 ? (
                                <ErrorBoundary>
                                    <DashboardGoals goals={activeGoals} />
                                </ErrorBoundary>
                            ) : (
                                <DashboardGoalsEmpty />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
};
