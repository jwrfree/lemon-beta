'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useData } from '@/hooks/use-data';
import { useReminders } from '@/features/reminders/hooks/use-reminders';
import { useDebts } from '@/features/debts/hooks/use-debts';
import { useUI } from '@/components/ui-provider';
import { useApp } from '@/providers/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/animated-counter';
import { cn, formatCurrency } from '@/lib/utils';
import { format, isSameMonth, parseISO, startOfMonth, subMonths, subDays, eachDayOfInterval, differenceInCalendarDays, startOfDay } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { 
    ArrowUpRight, 
    ArrowDownLeft, 
    Wallet, 
    TrendingUp, 
    TrendingDown, 
    Plus, 
    Search, 
    Calendar,
    ArrowRight,
    Sparkles,
    Bell,
    AlertCircle,
    RefreshCw,
    ExternalLink,
    Shield
} from 'lucide-react';
import { categoryDetails } from '@/lib/categories';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { QuickAddWidget } from './quick-add-widget';
import { BalanceVisibilityToggle } from '@/components/balance-visibility-toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import Link from 'next/link';
import { config } from '@/lib/config';

// Dynamically import DashboardChart to reduce initial bundle size
const DashboardChart = dynamic(() => import('./dashboard-chart'), { 
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted animate-pulse rounded-lg" />
});

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, href }: any) => {
    const Content = (
        <Card className="hover:shadow-md transition-all duration-300 h-full border-none bg-card/50 backdrop-blur-sm group rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{title}</CardTitle>
                <div className={cn("p-1.5 rounded-xl bg-muted group-hover:scale-110 transition-transform", color.replace('text-', 'bg-').replace('500', '500/10'))}>
                    <Icon className={cn("h-3.5 w-3.5", color)} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-extrabold tracking-tight">
                    <AnimatedCounter value={value} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className={cn(
                            "flex items-center px-1.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                            trend === 'up' ? "bg-success/15 text-success" :
                            trend === 'down' ? "bg-destructive/15 text-destructive" :
                            "bg-muted text-foreground/70"
                        )}>
                            {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                            {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                            {trendValue}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">vs bulan lalu</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl">
                {Content}
            </Link>
        );
    }

    return Content;
};

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

    const userDisplayName = useMemo(() => {
        if (!userData?.displayName) return '';
        // Get first name only for cleaner UI
        return userData.displayName.split(' ')[0];
    }, [userData]);

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
            if (!max || outstanding > (max.outstandingBalance ?? max.principal ?? 0)) return debt;
            return max;
        }, undefined as any);

        return { nextDueDebt: nextDue, largestDebt: largest };
    }, [debts]);

    // Chart Data
    const chartRangeDays = useMemo(() => {
        if (chartRange === '90') return 89;
        if (chartRange === 'month') return differenceInCalendarDays(now, startOfDay(startOfMonth(now)));
        return 29;
    }, [chartRange, now]);

    const chartData = useMemo(() => {
        const days = eachDayOfInterval({
            start: subDays(now, chartRangeDays),
            end: now
        });

        // Optimization: Create a lookup map for O(1) access
        const txMap: Record<string, { income: number; expense: number }> = {};

        filteredTransactions.forEach(t => {
            const dateKey = t.date.split('T')[0]; // Extract YYYY-MM-DD
            if (!txMap[dateKey]) {
                txMap[dateKey] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                txMap[dateKey].income += t.amount;
            } else {
                txMap[dateKey].expense += t.amount;
            }
        });

        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const data = txMap[dateStr] || { income: 0, expense: 0 };
            return {
                label: format(day, 'd MMM', { locale: dateFnsLocaleId }),
                date: dateStr,
                income: data.income,
                expense: data.expense,
            };
        });
    }, [filteredTransactions, chartRangeDays, now]);

    const recentTransactions = filteredTransactions.slice(0, 5);

    return (
        <div className="w-full">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
                <div className="flex h-16 items-center justify-between gap-3 px-4 max-w-6xl mx-auto">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
                        <p className="text-xs text-muted-foreground">{timeBasedGreeting}</p>
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
            {/* Hero summary */}
            <div className="grid gap-4 lg:grid-cols-3 items-stretch">
                <Card className="col-span-2 border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative rounded-3xl">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Shield className="h-20 w-20 rotate-12" />
                    </div>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-[11px] font-bold text-primary-foreground/80 uppercase tracking-[0.18em]">Saldo Total</CardTitle>
                            <div className="text-3xl font-extrabold tracking-tight">
                                <AnimatedCounter value={totalBalance} />
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 text-xs">
                            <span className="px-2 py-1 rounded-full bg-primary-foreground/15 text-primary-foreground/90 border border-primary-foreground/20">
                                {selectedWalletId === 'all' ? 'Semua dompet' : (visibleWallets[0]?.name || 'Dompet')}
                            </span>
                            <span className="text-primary-foreground/70 flex items-center gap-1">
                                <Sparkles className="h-3.5 w-3.5" /> Diperbarui {format(lastRefreshed, 'HH:mm')}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "flex items-center px-2 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide",
                                incomeTrend.direction === 'flat' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-success/20 text-success'
                            )}>
                                {incomeTrend.direction === 'up' && <TrendingUp className="h-3.5 w-3.5 mr-1" />}
                                {incomeTrend.direction === 'down' && <TrendingDown className="h-3.5 w-3.5 mr-1" />}
                                {incomeTrend.value} vs bulan lalu
                            </div>
                            <div className={cn(
                                "flex items-center px-2 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wide",
                                expenseTrend.direction === 'flat' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-destructive/15 text-destructive'
                            )}>
                                {expenseTrend.direction === 'up' && <TrendingUp className="h-3.5 w-3.5 mr-1" />}
                                {expenseTrend.direction === 'down' && <TrendingDown className="h-3.5 w-3.5 mr-1" />}
                                {expenseTrend.value} pengeluaran
                            </div>
                        </div>
                        <Button variant="secondary" size="sm" className="gap-1" asChild>
                            <Link href="/charts" aria-label="Lihat laporan grafik dan statistik">
                                Lihat Laporan <ExternalLink className="h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-3xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold">Rentang Data</CardTitle>
                        <CardDescription className="text-xs">Atur cakupan statistik & grafik</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Select value={chartRange} onValueChange={(v: any) => setChartRange(v)}>
                            <SelectTrigger aria-label="Pilih rentang data">
                                <SelectValue placeholder="Rentang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="month">Bulan ini</SelectItem>
                                <SelectItem value="30">30 hari</SelectItem>
                                <SelectItem value="90">3 bulan</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="text-xs text-muted-foreground">
                            Rentang ini mempengaruhi kartu ringkasan, grafik, dan daftar transaksi.
                        </div>
                    </CardContent>
                </Card>
            </div>

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

            {/* Reminders & Debts Summary */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm rounded-3xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Bell className="h-4 w-4 text-primary" /> Pengingat
                            </CardTitle>
                            <CardDescription className="text-xs">7 hari ke depan</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/reminders')}>
                            Lihat
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-destructive/10 text-destructive px-3 py-2 text-sm font-semibold">
                                Overdue: {reminderSummary.overdueCount}
                            </div>
                            <div className="rounded-xl bg-primary/10 text-primary px-3 py-2 text-sm font-semibold">
                                Segera: {reminderSummary.upcomingCount}
                            </div>
                        </div>
                        {reminderSummary.nextReminder ? (
                            <div className="rounded-2xl border border-border p-3">
                                <p className="text-sm font-semibold">{reminderSummary.nextReminder.title}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Jatuh tempo {format(parseISO(reminderSummary.nextReminder.dueDate as string), 'd MMM yyyy', { locale: dateFnsLocaleId })}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Tidak ada pengingat dalam rentang ini.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-card/60 backdrop-blur-sm rounded-3xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-destructive" /> Hutang & Piutang
                            </CardTitle>
                            <CardDescription className="text-xs">Prioritas terdekat</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/debts')}>
                            Kelola
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {debtSummary.nextDueDebt ? (
                            <div className="rounded-2xl border border-border p-3">
                                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1">Jatuh Tempo</p>
                                <p className="text-sm font-semibold">{debtSummary.nextDueDebt.title}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {format(parseISO(debtSummary.nextDueDebt.dueDate as string), 'd MMM yyyy', { locale: dateFnsLocaleId })}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Tidak ada jatuh tempo.</p>
                        )}
                        {debtSummary.largestDebt && (
                            <div className="rounded-2xl border border-border p-3">
                                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1">Outstanding Terbesar</p>
                                <p className="text-sm font-semibold">{debtSummary.largestDebt.title}</p>
                                <p className="text-xs text-muted-foreground">{debtSummary.largestDebt.counterparty}</p>
                                <p className="text-sm font-bold mt-1">{formatCurrency(debtSummary.largestDebt.outstandingBalance ?? debtSummary.largestDebt.principal ?? 0)}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Chart */}
                <Card className="col-span-4 border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-3xl">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Arus Kas</CardTitle>
                                <CardDescription className="text-xs font-medium">Pergerakan harian rentang terpilih</CardDescription>
                            </div>
                            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
                                <Button 
                                    variant={chartRange === 'month' ? 'default' : 'ghost'} 
                                    size="sm" 
                                    className="h-7 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                                    onClick={() => setChartRange('month')}
                                >
                                    Bulan Ini
                                </Button>
                                <Button 
                                    variant={chartRange === '30' ? 'default' : 'ghost'} 
                                    size="sm" 
                                    className="h-7 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                                    onClick={() => setChartRange('30')}
                                >
                                    30 Hari
                                </Button>
                                <Button 
                                    variant={chartRange === '90' ? 'default' : 'ghost'} 
                                    size="sm" 
                                    className="h-7 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                                    onClick={() => setChartRange('90')}
                                >
                                    3 Bulan
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <DashboardChart data={chartData} />
                    </CardContent>
                </Card>

                {/* Wallets Overview */}
                <Card className="col-span-3 border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-3xl">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Dompet</CardTitle>
                        <CardDescription className="text-xs font-medium">
                            {visibleWallets.length} dompet aktif digunakan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {visibleWallets.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-primary/30 p-4 text-sm text-muted-foreground flex items-center justify-between">
                                <span>Tidak ada dompet untuk filter ini.</span>
                                <Button size="sm" variant="outline" onClick={() => router.push('/wallets')}>
                                    Kelola Dompet
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {visibleWallets.slice(0, 4).map(wallet => {
                                    const { Icon, textColor } = getWalletVisuals(wallet.name, wallet.icon ?? undefined);
                                    return (
                                        <Link 
                                            href="/wallets"
                                            key={wallet.id} 
                                            className="flex items-center justify-between p-3 rounded-2xl hover:bg-primary/5 transition-all group border border-transparent hover:border-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn("p-2.5 rounded-xl bg-primary/10", textColor.replace('text-white', 'text-primary'))}>
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-foreground">{wallet.name}</p>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{wallet.type || 'Personal'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-extrabold text-sm">{formatCurrency(wallet.balance)}</p>
                                            </div>
                                        </Link>
                                    )
                                })}
                                <Button variant="ghost" className="w-full text-xs font-bold text-primary hover:bg-primary/5 mt-2 rounded-xl" onClick={() => router.push('/wallets')}>
                                    Lihat Semua Dompet <ArrowRight className="ml-2 h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Transaksi Terakhir</CardTitle>
                        <CardDescription>5 transaksi terbaru yang kamu lakukan.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => router.push('/transactions')}>
                        Lihat Semua
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr>
                                    <th className="p-3 pl-4">Transaksi</th>
                                    <th className="p-3">Kategori</th>
                                    <th className="p-3">Tanggal</th>
                                    <th className="p-3">Dompet</th>
                                    <th className="p-3 text-right pr-4">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                                            Belum ada transaksi untuk filter ini.
                                        </td>
                                    </tr>
                                )}
                                {recentTransactions.map((t) => {
                                    const categoryData = categoryDetails(t.category);
                                    const CategoryIcon = categoryData.icon;
                                    const wallet = wallets.find(w => w.id === t.walletId);
                                    
                                    return (
                                        <tr key={t.id} className="border-t hover:bg-muted/30 transition-colors">
                                            <td className="p-3 pl-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("p-2 rounded-full", categoryData.bgColor)}>
                                                        <CategoryIcon className={cn("h-4 w-4", categoryData.color)} />
                                                    </div>
                                                    <span className="font-medium">{t.description}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-muted-foreground">{t.category}</td>
                                            <td className="p-3 text-muted-foreground">
                                                {format(parseISO(t.date), 'd MMM yyyy', { locale: dateFnsLocaleId })}
                                            </td>
                                            <td className="p-3 text-muted-foreground">{wallet?.name}</td>
                                            <td className={cn(
                                                "p-3 pr-4 text-right font-semibold",
                                                t.type === 'expense' ? 'text-red-500' : 'text-green-500'
                                            )}>
                                                {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            </div>
        </div>
    );
};
