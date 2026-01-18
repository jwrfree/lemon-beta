'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/hooks/use-data';
import { useUI } from '@/components/ui-provider';
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
    ArrowRight
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { categoryDetails } from '@/lib/categories';
import { getWalletVisuals } from '@/lib/wallet-visuals';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, onClick }: any) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className={cn("h-4 w-4", color)} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">
                <AnimatedCounter value={value} />
            </div>
            {trend && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    {trend === 'up' ? <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" /> : <TrendingDown className="h-3 w-3 text-rose-500 mr-1" />}
                    <span className={trend === 'up' ? "text-emerald-500" : "text-rose-500"}>{trendValue}</span>
                    <span className="ml-1">dari bulan lalu</span>
                </p>
            )}
        </CardContent>
    </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="text-[10px] uppercase text-muted-foreground mb-1">{label}</div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground">Pemasukan</span>
                        <span className="font-bold text-emerald-500">
                            {formatCurrency(payload[0].value)}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground">Pengeluaran</span>
                        <span className="font-bold text-rose-500">
                            {formatCurrency(payload[1].value)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export const DesktopDashboard = () => {
    const { wallets, transactions } = useData();
    const { setIsTxModalOpen } = useUI();
    const router = useRouter();

    const [chartRange, setChartRange] = useState<'30' | '90'>('30');

    // Stats Calculation
    const now = useMemo(() => new Date(), []);
    const currentMonth = startOfMonth(now);
    const lastMonth = subMonths(currentMonth, 1);

    const getMonthStats = (date: Date) => {
        const monthTx = transactions.filter(t => isSameMonth(parseISO(t.date), date));
        const income = monthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expense = monthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return { income, expense, net: income - expense };
    };

    const currentStats = getMonthStats(currentMonth);
    const lastStats = getMonthStats(lastMonth);

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

        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayTx = transactions.filter(t => t.date.startsWith(dateStr));
            return {
                date: format(day, 'd MMM', { locale: dateFnsLocaleId }),
                income: dayTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
                expense: dayTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
            };
        });
    }, [transactions, chartRange, now]);

    const recentTransactions = transactions.slice(0, 5);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Ringkasan keuangan dan aktivitas terbaru kamu.</p>
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

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Total Saldo" 
                    value={totalBalance} 
                    icon={Wallet} 
                    color="text-primary" 
                    onClick={() => router.push('/wallets')}
                />
                <StatCard 
                    title="Pemasukan Bulan Ini" 
                    value={currentStats.income} 
                    icon={ArrowUpRight} 
                    trend={incomeTrend.direction} 
                    trendValue={incomeTrend.value}
                    color="text-emerald-500"
                    onClick={() => router.push('/charts?tab=income')}
                />
                <StatCard 
                    title="Pengeluaran Bulan Ini" 
                    value={currentStats.expense} 
                    icon={ArrowDownLeft} 
                    trend={expenseTrend.direction} 
                    trendValue={expenseTrend.value}
                    color="text-rose-500"
                    onClick={() => router.push('/charts?tab=expense')}
                />
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-primary-foreground/80">Sisa Anggaran</CardTitle>
                        <Calendar className="h-4 w-4 text-primary-foreground/80" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(currentStats.net)}
                        </div>
                        <p className="text-xs text-primary-foreground/70 mt-1">
                           Arus kas bersih bulan ini
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Main Chart */}
                <Card className="col-span-4">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Arus Kas</CardTitle>
                            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                                <Button 
                                    variant={chartRange === '30' ? 'secondary' : 'ghost'} 
                                    size="sm" 
                                    className="h-7 text-xs"
                                    onClick={() => setChartRange('30')}
                                >
                                    30 Hari
                                </Button>
                                <Button 
                                    variant={chartRange === '90' ? 'secondary' : 'ghost'} 
                                    size="sm" 
                                    className="h-7 text-xs"
                                    onClick={() => setChartRange('90')}
                                >
                                    3 Bulan
                                </Button>
                            </div>
                        </div>
                        <CardDescription>Perbandingan pemasukan dan pengeluaran harian.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                    <XAxis 
                                        dataKey="date" 
                                        stroke="#888888" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        minTickGap={30}
                                    />
                                    <YAxis 
                                        stroke="#888888" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}jt`}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" maxBarSize={40} />
                                    <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} stackId="a" maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Wallets Overview */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Dompet Saya</CardTitle>
                        <CardDescription>
                            {wallets.length} dompet aktif
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {wallets.slice(0, 4).map(wallet => {
                                const { Icon, textColor } = getWalletVisuals(wallet.name, wallet.icon ?? undefined);
                                return (
                                    <div key={wallet.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push('/wallets')}>
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-full bg-primary/10", textColor.replace('text-white', 'text-primary'))}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{wallet.name}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{wallet.type}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">{formatCurrency(wallet.balance)}</p>
                                        </div>
                                    </div>
                                )
                            })}
                            <Button variant="ghost" className="w-full text-xs text-muted-foreground" onClick={() => router.push('/wallets')}>
                                Lihat Semua Dompet <ArrowRight className="ml-1 h-3 w-3" />
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
                                                t.type === 'expense' ? 'text-rose-500' : 'text-emerald-500'
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
    );
};
