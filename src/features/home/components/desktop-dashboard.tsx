
'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/hooks/use-data';
import { useReminders } from '@/features/reminders/hooks/use-reminders';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { useUI } from '@/components/ui-provider';
import { useApp } from '@/providers/app-provider';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    ArrowUpRight, 
    ArrowDownLeft, 
    Wallet, 
    TrendingUp, 
    Plus, 
    Search, 
    RefreshCw
} from 'lucide-react';
import { startOfMonth, subMonths, isSameMonth, parseISO, differenceInCalendarDays } from 'date-fns';

import { DashboardHero } from './dashboard-hero';
import { StatCard } from './dashboard-stat-card';
import { DashboardAlerts } from './dashboard-alerts';
import { DashboardCashflow } from './dashboard-cashflow';
import { DashboardWallets } from './dashboard-wallets';
import { DashboardRecentTransactions } from './dashboard-recent-transactions';

export const DesktopDashboard = () => {
    const { wallets, transactions } = useData();
    const { reminders } = useReminders();
    const { debts } = useDebts();
    const { setIsTxModalOpen } = useUI();
    const { userData } = useApp();
    const router = useRouter();

    const [chartRange, setChartRange] = useState<'30' | '90' | 'month'>('month');
    const [selectedWalletId, setSelectedWalletId] = useState<string>('all');
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

    const timeBasedGreeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Selamat Pagi';
        if (hour < 15) return 'Selamat Siang';
        if (hour < 18) return 'Selamat Sore';
        return 'Selamat Malam';
    }, []);

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

    return (
        <div className="w-full">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
                <div className="flex h-16 items-center justify-between gap-3 px-4 max-w-6xl mx-auto">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
                        <p className="text-xs text-muted-foreground">{timeBasedGreeting}, {userData?.displayName || 'User'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden lg:block">
                            <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                                <SelectTrigger className="w-52" aria-label="Filter dompet">
                                    <SelectValue placeholder="Semua dompet" />
                                </SelectTrigger>
                                <SelectContent>
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
                            onClick={() => {
                                router.refresh();
                                setLastRefreshed(new Date());
                            }}
                            aria-label="Segarkan data"
                            title="Segarkan data"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={() => router.push('/transactions')}>
                            <Search className="mr-2 h-4 w-4" />
                            Cari Transaksi
                        </Button>
                        <Button onClick={() => setIsTxModalOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Transaksi Baru
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-6 max-w-6xl mx-auto">
                <DashboardHero 
                    totalBalance={totalBalance}
                    selectedWalletId={selectedWalletId}
                    visibleWallets={visibleWallets}
                    lastRefreshed={lastRefreshed}
                    incomeTrend={incomeTrend}
                    expenseTrend={expenseTrend}
                    chartRange={chartRange}
                    setChartRange={setChartRange}
                />

                {/* Section heading */}
                <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-[0.25em] px-1">
                    <span>Ringkasan</span>
                    <span className="px-2 py-1 rounded-full bg-muted/60 border border-border">
                        Rentang: {chartRange === '30' ? '30 hari' : chartRange === '90' ? '3 bulan' : 'Bulan ini'}
                    </span>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard 
                        title="Pemasukan" 
                        value={currentStats.income} 
                        icon={ArrowUpRight} 
                        trend={incomeTrend.direction} 
                        trendValue={incomeTrend.value}
                        color="text-success"
                        href="/transactions?type=income"
                    />
                    <StatCard 
                        title="Pengeluaran" 
                        value={currentStats.expense} 
                        icon={ArrowDownLeft} 
                        trend={expenseTrend.direction} 
                        trendValue={expenseTrend.value}
                        color="text-destructive"
                        href="/transactions?type=expense"
                    />
                    <StatCard 
                        title="Net (Bersih)" 
                        value={currentStats.net} 
                        icon={TrendingUp} 
                        trend={currentStats.net >= lastStats.net ? 'up' : 'down'} 
                        trendValue={calculateTrend(currentStats.net, lastStats.net).value}
                        color={currentStats.net >= 0 ? "text-success" : "text-destructive"}
                        href="/charts"
                    />
                    <StatCard 
                        title="Dompet Aktif" 
                        value={visibleWallets.length} 
                        icon={Wallet} 
                        color="text-primary"
                        href="/wallets"
                    />
                </div>

                <DashboardAlerts 
                    reminderSummary={reminderSummary}
                    debtSummary={debtSummary}
                />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <DashboardCashflow 
                        transactions={filteredTransactions}
                        chartRange={chartRange}
                        setChartRange={setChartRange}
                    />
                    <DashboardWallets wallets={visibleWallets} />
                </div>

                <DashboardRecentTransactions 
                    transactions={recentTransactions} 
                    wallets={wallets}
                />
            </div>
        </div>
    );
};
