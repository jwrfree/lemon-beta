'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/hooks/use-data';
import { useReminders } from '@/features/reminders/hooks/use-reminders';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Plus, 
    Search, 
    RefreshCw
} from 'lucide-react';
import { startOfMonth, subMonths, isSameMonth, parseISO, differenceInCalendarDays } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { FinanceOverview } from './finance-overview';
import { DashboardAlerts } from './dashboard-alerts';
import { DashboardCashflow } from './dashboard-cashflow';
import { DashboardWallets } from './dashboard-wallets';
import { DashboardRecentTransactions } from './dashboard-recent-transactions';

export const DesktopDashboard = () => {
    const { wallets, transactions } = useData();
    const { reminders } = useReminders();
    const { debts } = useDebts();
    const { setIsTxModalOpen } = useUI();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [chartRange, setChartRange] = useState<'30' | '90' | 'month'>('month');
    const [selectedWalletId, setSelectedWalletId] = useState<string>('all');
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    // Stats Calculation
    const now = useMemo(() => new Date(), []);
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
    const nowDate = useMemo(() => new Date(), []);

    const reminderSummary = useMemo(() => {
        const overdue = reminders.filter(r => r.dueDate && r.status !== 'completed' && differenceInCalendarDays(parseISO(r.dueDate), nowDate) < 0);
        const upcoming = reminders
            .filter(r => r.dueDate && r.status !== 'completed')
            .filter(r => {
                const diff = differenceInCalendarDays(parseISO(r.dueDate || ''), nowDate);
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
    }, [reminders, nowDate]);

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

    if (!mounted) return null;

    return (
        <div className="w-full h-full flex flex-col">
            <PageHeader
                title="Dashboard"
                showBackButton={false}
                extraActions={
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
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-md bg-background shadow-sm text-muted-foreground"
                            onClick={() => {
                                router.refresh();
                                setLastRefreshed(new Date());
                            }}
                            aria-label="Segarkan data"
                            title="Segarkan data"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-md bg-background shadow-sm text-muted-foreground"
                            onClick={() => router.push('/transactions')}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => setIsTxModalOpen(true)} className="rounded-md shadow-sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Transaksi Baru
                        </Button>
                    </div>
                }
            />

            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <FinanceOverview 
                    totalBalance={totalBalance}
                    income={currentStats.income}
                    expense={currentStats.expense}
                    net={currentStats.net}
                    incomeTrend={incomeTrend}
                    expenseTrend={expenseTrend}
                    netTrend={netTrend}
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-6">
                        <DashboardCashflow 
                            transactions={filteredTransactions}
                            chartRange={chartRange}
                            setChartRange={setChartRange}
                        />
                        <DashboardRecentTransactions 
                            transactions={recentTransactions} 
                            wallets={wallets}
                        />
                    </div>

                    {/* Sidebar / Widgets Area */}
                    <div className="lg:col-span-4 space-y-6">
                        <DashboardWallets wallets={visibleWallets} />
                        <DashboardAlerts 
                            reminderSummary={reminderSummary}
                            debtSummary={debtSummary}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};