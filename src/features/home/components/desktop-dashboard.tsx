
'use client';

import { useMemo, useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/hooks/use-data';
import { useReminders } from '@/features/reminders/hooks/use-reminders';
import { cn } from '@/lib/utils';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { useBudgets } from '@/features/budgets/hooks/use-budgets';
import { useGoals } from '@/features/goals/hooks/use-goals';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
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
    const { wallets, transactions } = useData();
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
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
    const [isPending, startTransition] = useTransition();

    const handleRefresh = () => {
        startTransition(() => {
            router.refresh();
            setLastRefreshed(new Date());
        });
    };

    // Stats Calculation
    const now = lastRefreshed;
    const currentMonth = startOfMonth(now);
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

    const incomeTrend = calculateTrend(currentStats.income, lastStats.income);
    const expenseTrend = calculateTrend(currentStats.expense, lastStats.expense);
    const netTrend = calculateTrend(currentStats.net, lastStats.net);

    const totalBalance = visibleWallets.reduce((acc, w) => acc + w.balance, 0);
    
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

    const recentTransactions = filteredTransactions.slice(0, 5);

    if (!mounted) return <DashboardSkeleton />;

    return (
        <div className="w-full h-full flex flex-col">
            <PageHeader
                title="Dashboard"
                showBackButton={false}
                extraActions={
                    <TooltipProvider>
                        <div className="flex items-center gap-2">
                            <div className="hidden lg:block">
                                <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                                    <SelectTrigger className="w-52 h-10 rounded-md bg-background shadow-sm" aria-label="Filter dompet">
                                        <SelectValue placeholder="Semua dompet" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-md bg-background shadow-lg">
                                        <SelectItem value="all">Semua dompet</SelectItem>
                                        {wallets.map(wallet => (
                                            <SelectItem key={wallet.id} value={wallet.id}>
                                                {wallet.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-md bg-background shadow-sm text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                                        onClick={() => router.push('/add-smart')}
                                        aria-label="Smart Add AI"
                                    >
                                        <Sparkles className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Smart Add (AI)</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-md bg-background shadow-sm text-muted-foreground"
                                        onClick={handleRefresh}
                                        disabled={isPending}
                                        aria-label="Segarkan data"
                                    >
                                        <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Segarkan data</p>
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 rounded-md bg-background shadow-sm text-muted-foreground"
                                        onClick={() => router.push('/transactions')}
                                        aria-label="Cari transaksi"
                                    >
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Cari transaksi</p>
                                </TooltipContent>
                            </Tooltip>
                            <div className="pl-2 ml-2 border-l border-border/60">
                                <UserProfileDropdown />
                            </div>
                        </div>
                    </TooltipProvider>
                }
            />

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <ErrorBoundary>
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
                </ErrorBoundary>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-6">
                        {filteredTransactions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                                <div className="md:col-span-3">
                                    <ErrorBoundary>
                                        <DashboardCashflow 
                                            transactions={filteredTransactions}
                                            chartRange={chartRange}
                                            setChartRange={setChartRange}
                                        />
                                    </ErrorBoundary>
                                </div>
                                <div className="md:col-span-2">
                                    <ErrorBoundary>
                                        <DashboardExpensePie transactions={filteredTransactions} />
                                    </ErrorBoundary>
                                </div>
                            </div>
                        ) : (
                            <div className="h-[350px] w-full border-2 border-dashed border-muted rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/10 animate-in fade-in duration-500">
                                <div className="p-4 bg-muted/30 rounded-full mb-3">
                                    <BarChart3 className="h-8 w-8 opacity-50" />
                                </div>
                                <p className="text-sm font-medium">Belum cukup data untuk visualisasi</p>
                                <p className="text-xs text-muted-foreground mt-1">Grafik akan muncul setelah kamu mencatat transaksi.</p>
                            </div>
                        )}
                        
                        {recentTransactions.length > 0 ? (
                            <ErrorBoundary>
                                <DashboardRecentTransactions 
                                    transactions={recentTransactions} 
                                    wallets={wallets}
                                />
                            </ErrorBoundary>
                        ) : (
                            <DashboardRecentTransactionsEmpty />
                        )}
                    </div>

                    {/* Sidebar / Widgets Area */}
                    <div className="lg:col-span-4 space-y-6">
                        <ErrorBoundary>
                            <NetWorthCard totalAssets={totalBalance} totalLiabilities={totalDebt} />
                        </ErrorBoundary>
                        <ErrorBoundary>
                            <DashboardSmartInsight 
                                income={currentStats.income} 
                                expense={currentStats.expense} 
                                net={currentStats.net}
                                hasTransactions={filteredTransactions.length > 0}
                            />
                        </ErrorBoundary>
                        <ErrorBoundary>
                            <DashboardWallets wallets={visibleWallets} />
                        </ErrorBoundary>
                        <DashboardQuickActions />
                        <ErrorBoundary>
                            <DashboardBudgetStatus budgets={calculatedBudgets} />
                        </ErrorBoundary>
                        {goals.length > 0 ? (
                            <ErrorBoundary>
                                <DashboardGoals goals={goals} />
                            </ErrorBoundary>
                        ) : (
                            <DashboardGoalsEmpty />
                        )}
                        <ErrorBoundary>
                            <DashboardAlerts 
                                reminderSummary={reminderSummary}
                                debtSummary={debtSummary}
                            />
                        </ErrorBoundary>
                    </div>
                </div>
            </div>
        </div>
    );
};
