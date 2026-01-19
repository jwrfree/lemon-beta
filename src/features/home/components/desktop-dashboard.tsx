'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useData } from '@/hooks/use-data';
import { useUI } from '@/components/ui-provider';
import { useApp } from '@/providers/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/animated-counter';
import { cn, formatCurrency } from '@/lib/utils';
import { format, isSameMonth, parseISO, startOfMonth, subMonths, subDays, eachDayOfInterval } from 'date-fns';
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
    Sparkles
} from 'lucide-react';
import { categoryDetails } from '@/lib/categories';
import { getWalletVisuals } from '@/lib/wallet-visuals';
import { QuickAddWidget } from './quick-add-widget';
import { BalanceVisibilityToggle } from '@/components/balance-visibility-toggle';

import Link from 'next/link';

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
                            trend === 'up' ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                        )}>
                            {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
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
    const { setIsTxModalOpen } = useUI();
    const { userData } = useApp();
    const router = useRouter();

    const [chartRange, setChartRange] = useState<'30' | '90'>('30');

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

    const currentStats = useMemo(() => {
        const monthTx = transactions.filter(t => isSameMonth(parseISO(t.date), currentMonth));
        const income = monthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = monthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return { income, expense, net: income - expense };
    }, [transactions, currentMonth]);

    const lastStats = useMemo(() => {
        const monthTx = transactions.filter(t => isSameMonth(parseISO(t.date), lastMonth));
        const income = monthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = monthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return { income, expense, net: income - expense };
    }, [transactions, lastMonth]);

    const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return { direction: 'up', value: '0%' };
        const diff = current - previous;
        const percent = (diff / previous) * 100;
        return {
            direction: percent >= 0 ? 'up' : 'down',
            value: `${Math.abs(percent).toFixed(1)}%`
        };
    };

    const incomeTrend = calculateTrend(currentStats.income, lastStats.income);
    const expenseTrend = calculateTrend(currentStats.expense, lastStats.expense);

    const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

    // Chart Data
    const chartData = useMemo(() => {
        const days = eachDayOfInterval({
            start: subDays(now, chartRange === '30' ? 29 : 89),
            end: now
        });

        // Optimization: Create a lookup map for O(1) access
        const txMap: Record<string, { income: number; expense: number }> = {};

        transactions.forEach(t => {
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
                date: format(day, 'd MMM', { locale: dateFnsLocaleId }),
                income: data.income,
                expense: data.expense,
            };
        });
    }, [transactions, chartRange, now]);

    const recentTransactions = transactions.slice(0, 5);

    return (
        <div className="w-full">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 max-w-7xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        {timeBasedGreeting}, {userDisplayName}. Ringkasan keuangan dan aktivitas terbaru kamu.
                    </p>
                </div>
                <div className="flex items-center gap-2">
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
            <div className="p-6 space-y-6 max-w-7xl mx-auto">

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="md:col-span-2 border-none shadow-sm bg-primary text-primary-foreground overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Wallet className="h-32 w-32 rotate-12" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[11px] font-bold text-primary-foreground/80 uppercase tracking-[0.2em]">Total Saldo Tersedia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl md:text-5xl font-extrabold tracking-tight">
                            <AnimatedCounter value={totalBalance} />
                        </div>
                        <p className="text-[10px] font-medium text-primary-foreground/60 mt-4 flex items-center gap-2 uppercase tracking-wider">
                            <Sparkles className="h-3 w-3" /> Terakhir diperbarui baru saja
                        </p>
                    </CardContent>
                </Card>

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
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Chart */}
                <Card className="col-span-4 border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-3xl">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Arus Kas</CardTitle>
                                <CardDescription className="text-xs font-medium">Pergerakan harian 30 hari terakhir</CardDescription>
                            </div>
                            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl">
                                <Button 
                                    variant={chartRange === '30' ? 'secondary' : 'ghost'} 
                                    size="sm" 
                                    className="h-7 text-[10px] font-bold uppercase tracking-wider rounded-lg"
                                    onClick={() => setChartRange('30')}
                                >
                                    30 Hari
                                </Button>
                                <Button 
                                    variant={chartRange === '90' ? 'secondary' : 'ghost'} 
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
                            {wallets.length} dompet aktif digunakan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {wallets.slice(0, 4).map(wallet => {
                                const { Icon, textColor } = getWalletVisuals(wallet.name, wallet.icon ?? undefined);
                                return (
                                    <Link 
                                        href="/wallets"
                                        key={wallet.id} 
                                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-primary/5 transition-all group border border-transparent hover:border-primary/10"
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
