'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import {
    ArrowDownLeft,
    ArrowUpRight,
    Briefcase,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    ReceiptText,
    Scale,
    Tags,
    TrendingDown,
} from 'lucide-react';
import {
    eachDayOfInterval,
    endOfMonth,
    format,
    isSameMonth,
    parseISO,
    startOfDay,
    startOfMonth,
    subDays,
} from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';

import { useApp } from '@/components/app-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { categoryDetails } from '@/lib/categories';
import { cn, formatCurrency } from '@/lib/utils';

type TabValue = 'expense' | 'income' | 'net';
type TimeRange = 'last7d' | 'last30d' | 'this_month';

type SingleHighlight = {
    variant: 'single';
    total: number;
    average: number;
    peak: {
        label: string;
        value: number;
    };
};

type NetHighlight = {
    variant: 'net';
    totalIncome: number;
    totalExpense: number;
    net: number;
    bestDay: {
        label: string;
        value: number;
    } | null;
};

const tabs: { value: TabValue; label: string; icon: React.ElementType }[] = [
    { value: 'expense', label: 'Pengeluaran', icon: ArrowDownLeft },
    { value: 'income', label: 'Pemasukan', icon: ArrowUpRight },
    { value: 'net', label: 'Arus Kas', icon: Scale },
];

const rangeLabels: Record<TimeRange, string> = {
    last7d: '7 hari terakhir',
    last30d: '30 hari terakhir',
    this_month: 'bulan ini',
};

const SectionHeader = ({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description?: string;
}) => (
    <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">{eyebrow}</span>
        <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
);

const ExpenseSummaryCard = ({ className }: { className?: string }) => {
    const { transactions } = useApp();

    const summaryData = useMemo(() => {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        const monthlyTransactions = transactions.filter((t) => {
            const tDate = parseISO(t.date);
            return tDate >= start && tDate <= end && t.type === 'expense';
        });

        const totalExpense = monthlyTransactions.reduce((acc, t) => acc + t.amount, 0);

        const categoryMap: { [key: string]: number } = {};
        monthlyTransactions.forEach((t) => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });

        const biggestCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
        const biggestTransaction = [...monthlyTransactions].sort((a, b) => b.amount - a.amount)[0];

        return {
            totalExpense,
            biggestCategory: biggestCategory
                ? { name: biggestCategory[0], amount: biggestCategory[1] }
                : null,
            biggestTransaction: biggestTransaction
                ? { description: biggestTransaction.description, amount: biggestTransaction.amount }
                : null,
        };
    }, [transactions]);

    const { icon: CategoryIcon } = summaryData.biggestCategory
        ? categoryDetails(summaryData.biggestCategory.name)
        : { icon: TrendingDown };

    return (
        <Card className={cn('relative overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-sm', className)}>
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-destructive via-destructive/60 to-transparent" />
            <CardHeader className="space-y-3 pb-0">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-destructive">
                        <ArrowDownLeft className="h-4 w-4" />
                        Pengeluaran Bulan Ini
                    </span>
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight text-destructive">
                    {formatCurrency(summaryData.totalExpense)}
                </CardTitle>
                <CardDescription>Total pengeluaran pada periode berjalan dari seluruh kategori yang tercatat.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-destructive">Kategori Terbesar</p>
                    <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                            {summaryData.biggestCategory ? (
                                <CategoryIcon className="h-5 w-5 text-destructive" />
                            ) : (
                                <TrendingDown className="h-5 w-5 text-destructive" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-semibold leading-tight">{summaryData.biggestCategory?.name || '-'}</p>
                            <p className="text-xs text-muted-foreground">
                                {summaryData.biggestCategory
                                    ? formatCurrency(summaryData.biggestCategory.amount)
                                    : 'Belum ada data'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Transaksi Terbesar</p>
                    <div className="mt-3 space-y-1">
                        <p className="text-sm font-semibold leading-tight">{summaryData.biggestTransaction?.description || '-'}</p>
                        <p className="text-xs text-muted-foreground">
                            {summaryData.biggestTransaction
                                ? formatCurrency(summaryData.biggestTransaction.amount)
                                : 'Belum ada data'}
                        </p>
                    </div>
                    <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <ReceiptText className="h-4 w-4" />
                        Detail transaksi dapat dilihat pada halaman riwayat.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

const IncomeSummaryCard = ({ className }: { className?: string }) => {
    const { transactions } = useApp();

    const summaryData = useMemo(() => {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        const monthlyTransactions = transactions.filter((t) => {
            const tDate = parseISO(t.date);
            return tDate >= start && tDate <= end && t.type === 'income';
        });

        const totalIncome = monthlyTransactions.reduce((acc, t) => acc + t.amount, 0);

        const categoryMap: { [key: string]: number } = {};
        monthlyTransactions.forEach((t) => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });

        const biggestSource = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
        const biggestTransaction = [...monthlyTransactions].sort((a, b) => b.amount - a.amount)[0];

        return {
            totalIncome,
            biggestSource: biggestSource ? { name: biggestSource[0], amount: biggestSource[1] } : null,
            biggestTransaction: biggestTransaction
                ? { description: biggestTransaction.description, amount: biggestTransaction.amount }
                : null,
        };
    }, [transactions]);

    const { icon: CategoryIcon } = summaryData.biggestSource
        ? categoryDetails(summaryData.biggestSource.name)
        : { icon: Briefcase };

    return (
        <Card className={cn('relative overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-sm', className)}>
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400/60 to-transparent" />
            <CardHeader className="space-y-3 pb-0">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                        <ArrowUpRight className="h-4 w-4" />
                        Pemasukan Bulan Ini
                    </span>
                </div>
                <CardTitle className="text-3xl font-bold tracking-tight text-emerald-600">
                    {formatCurrency(summaryData.totalIncome)}
                </CardTitle>
                <CardDescription>Total pemasukan yang telah dicatat sepanjang bulan ini dari berbagai sumber.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-400/40 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Sumber Terbesar</p>
                    <div className="mt-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                            {summaryData.biggestSource ? (
                                <CategoryIcon className="h-5 w-5 text-emerald-600" />
                            ) : (
                                <Briefcase className="h-5 w-5 text-emerald-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-semibold leading-tight">{summaryData.biggestSource?.name || '-'}</p>
                            <p className="text-xs text-muted-foreground">
                                {summaryData.biggestSource
                                    ? formatCurrency(summaryData.biggestSource.amount)
                                    : 'Belum ada data'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Transaksi Terbesar</p>
                    <div className="mt-3 space-y-1">
                        <p className="text-sm font-semibold leading-tight">{summaryData.biggestTransaction?.description || '-'}</p>
                        <p className="text-xs text-muted-foreground">
                            {summaryData.biggestTransaction
                                ? formatCurrency(summaryData.biggestTransaction.amount)
                                : 'Belum ada data'}
                        </p>
                    </div>
                    <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                        <ReceiptText className="h-4 w-4" />
                        Detail transaksi dapat dilihat pada halaman riwayat.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

const NetIncomeSummaryCard = ({ className }: { className?: string }) => {
    const { transactions } = useApp();

    const summaryData = useMemo(() => {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        const monthlyTransactions = transactions.filter((t) => {
            const tDate = parseISO(t.date);
            return tDate >= start && tDate <= end;
        });

        const totalIncome = monthlyTransactions
            .filter((t) => t.type === 'income')
            .reduce((acc, t) => acc + t.amount, 0);
        const totalExpense = monthlyTransactions
            .filter((t) => t.type === 'expense')
            .reduce((acc, t) => acc + t.amount, 0);
        const netIncome = totalIncome - totalExpense;

        return { totalIncome, totalExpense, netIncome };
    }, [transactions]);

    const netPositive = summaryData.netIncome >= 0;
    const badgeClass = netPositive
        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
        : 'border-destructive/60 bg-destructive/10 text-destructive';

    return (
        <Card className={cn('relative overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-sm', className)}>
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/40 to-transparent" />
            <CardHeader className="space-y-3 pb-0">
                <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        <Scale className="h-4 w-4" />
                        Arus Kas Bulan Ini
                    </span>
                    <Badge variant="outline" className={cn('flex items-center gap-1 text-xs font-semibold', badgeClass)}>
                        {netPositive ? 'Surplus' : 'Defisit'}
                    </Badge>
                </div>
                <CardTitle className={cn('text-3xl font-bold tracking-tight', netPositive ? 'text-emerald-600' : 'text-destructive')}>
                    {formatCurrency(summaryData.netIncome)}
                </CardTitle>
                <CardDescription>Selisih antara pemasukan dan pengeluaran di bulan berjalan.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Pemasukan</p>
                    <p className="mt-2 text-lg font-semibold text-emerald-600">{formatCurrency(summaryData.totalIncome)}</p>
                    <p className="text-xs text-muted-foreground">Akumulasi pemasukan dari seluruh sumber.</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total Pengeluaran</p>
                    <p className="mt-2 text-lg font-semibold text-destructive">{formatCurrency(summaryData.totalExpense)}</p>
                    <p className="text-xs text-muted-foreground">Jumlah pengeluaran yang tercatat bulan ini.</p>
                </div>
            </CardContent>
        </Card>
    );
};

const TrendChart = ({ type, className }: { type: 'expense' | 'income' | 'net'; className?: string }) => {
    const { transactions } = useApp();
    const [timeRange, setTimeRange] = useState<TimeRange>('this_month');

    const trendData = useMemo(() => {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        if (timeRange === 'last7d') {
            startDate = startOfDay(subDays(now, 6));
            endDate = startOfDay(now);
        } else if (timeRange === 'last30d') {
            startDate = startOfDay(subDays(now, 29));
            endDate = startOfDay(now);
        } else {
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
        }

        const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });

        const dailyTotals: { [key: string]: { income: number; expense: number } } = {};
        dateInterval.forEach((day) => {
            dailyTotals[format(day, 'yyyy-MM-dd')] = { income: 0, expense: 0 };
        });

        transactions
            .filter((t) => {
                const tDate = parseISO(t.date);
                return tDate >= startDate && tDate <= endDate;
            })
            .forEach((t) => {
                const dateKey = format(parseISO(t.date), 'yyyy-MM-dd');
                if (dailyTotals[dateKey]) {
                    if (t.type === 'income') dailyTotals[dateKey].income += t.amount;
                    if (t.type === 'expense') dailyTotals[dateKey].expense += t.amount;
                }
            });

        return Object.entries(dailyTotals).map(([date, totals]) => ({
            date,
            ...totals,
            formattedDate: format(parseISO(date), 'd MMM', { locale: dateFnsLocaleId }),
        }));
    }, [transactions, timeRange]);

    const highlight = useMemo<SingleHighlight | NetHighlight | null>(() => {
        if (!trendData.length) {
            return null;
        }

        if (type === 'net') {
            let totalIncome = 0;
            let totalExpense = 0;
            let bestDay: NetHighlight['bestDay'] = null;

            trendData.forEach((day) => {
                totalIncome += day.income;
                totalExpense += day.expense;
                const netValue = day.income - day.expense;
                if (!bestDay || netValue > bestDay.value) {
                    bestDay = {
                        label: day.formattedDate,
                        value: netValue,
                    };
                }
            });

            return {
                variant: 'net',
                totalIncome,
                totalExpense,
                net: totalIncome - totalExpense,
                bestDay,
            };
        }

        const dataKey = type === 'expense' ? 'expense' : 'income';
        let total = 0;
        let peak = {
            label: trendData[0].formattedDate,
            value: trendData[0][dataKey as 'income' | 'expense'],
        };

        trendData.forEach((day) => {
            const value = day[dataKey as 'income' | 'expense'];
            total += value;
            if (value > peak.value) {
                peak = {
                    label: day.formattedDate,
                    value,
                };
            }
        });

        const average = total / trendData.length;

        return {
            variant: 'single',
            total,
            average,
            peak,
        };
    }, [trendData, type]);

    const formatTick = (value: number) => {
        const numValue = Number(value);
        if (numValue >= 1_000_000) return `Rp${(numValue / 1_000_000).toFixed(1)}Jt`;
        if (numValue >= 1_000) return `Rp${(numValue / 1_000).toFixed(0)}k`;
        return `Rp${numValue}`;
    };

    const timeRangeButtons: { label: string; value: TimeRange }[] = [
        { label: '7 Hari', value: 'last7d' },
        { label: '30 Hari', value: 'last30d' },
        { label: 'Bulan Ini', value: 'this_month' },
    ];

    if (type !== 'net') {
        const dataKey = type === 'expense' ? 'expense' : 'income';
        const strokeColor = type === 'expense' ? 'hsl(var(--destructive))' : 'hsl(var(--chart-2))';
        const fillId = type === 'expense' ? 'fill-destructive' : 'fill-positive';
        const gradientColor = type === 'expense' ? 'hsl(var(--destructive))' : 'hsl(var(--chart-2))';

        return (
            <Card className={cn('relative overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-sm', className)}>
                <CardHeader className="space-y-4 pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                            <CardTitle>Tren {type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}</CardTitle>
                            <CardDescription>Amati perubahan {type === 'expense' ? 'pengeluaran' : 'pemasukan'} pada {rangeLabels[timeRange]}.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            <span>{rangeLabels[timeRange]}</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {highlight && highlight.variant === 'single' && (
                            <div className="flex items-center gap-6 text-sm">
                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">Total periode</p>
                                    <p className="font-semibold">{formatCurrency(highlight.total)}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">Rata-rata harian</p>
                                    <p className="font-semibold">{formatCurrency(highlight.average)}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1">
                            {timeRangeButtons.map((item) => (
                                <Button
                                    key={item.value}
                                    onClick={() => setTimeRange(item.value)}
                                    variant={timeRange === item.value ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className={cn(
                                        'h-8 rounded-full px-3 text-xs font-medium transition',
                                        timeRange === item.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                                    )}
                                >
                                    {item.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <ChartContainer config={{}} className="h-[22rem] w-full">
                        <AreaChart accessibilityLayer data={trendData}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="formattedDate"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                interval="preserveStartEnd"
                            />
                            <YAxis tickFormatter={formatTick} axisLine={false} tickLine={false} width={60} />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value, payload) => {
                                            if (payload && payload.length > 0 && payload[0].payload) {
                                                return format(parseISO(payload[0].payload.date), 'eeee, d MMM yyyy', {
                                                    locale: dateFnsLocaleId,
                                                });
                                            }
                                            return value;
                                        }}
                                        formatter={(value) => formatCurrency(Number(value))}
                                        indicator="dot"
                                    />
                                }
                            />
                            <defs>
                                <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={gradientColor} stopOpacity={0.8} />
                                    <stop offset="95%" stopColor={gradientColor} stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <Area
                                dataKey={dataKey}
                                type="monotone"
                                stroke={strokeColor}
                                fill={`url(#${fillId})`}
                                strokeWidth={2.5}
                                dot={false}
                                name={type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                            />
                        </AreaChart>
                    </ChartContainer>
                    {highlight && highlight.variant === 'single' && (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total periode</p>
                                <p className="mt-2 text-lg font-semibold">{formatCurrency(highlight.total)}</p>
                                <p className="text-xs text-muted-foreground">Akumulasi {rangeLabels[timeRange]}.</p>
                            </div>
                            <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hari tertinggi</p>
                                <p className="mt-2 text-sm font-semibold">{highlight.peak.label}</p>
                                <p className="text-xs text-muted-foreground">
                                    {formatCurrency(highlight.peak.value)} tercatat pada hari tersebut.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    const chartConfig: ChartConfig = {
        income: {
            label: 'Pemasukan',
            color: 'hsl(var(--chart-2))',
        },
        expense: {
            label: 'Pengeluaran',
            color: 'hsl(var(--chart-1))',
        },
    };

    return (
        <Card className={cn('relative overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-sm', className)}>
            <CardHeader className="space-y-4 pb-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle>Arus Kas Harian</CardTitle>
                        <CardDescription>Lihat keseimbangan pemasukan dan pengeluaran pada {rangeLabels[timeRange]}.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span>{rangeLabels[timeRange]}</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {highlight && highlight.variant === 'net' && (
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                            <div>
                                <p className="text-xs uppercase text-muted-foreground">Total pemasukan</p>
                                <p className="font-semibold text-emerald-600">{formatCurrency(highlight.totalIncome)}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-muted-foreground">Total pengeluaran</p>
                                <p className="font-semibold text-destructive">{formatCurrency(highlight.totalExpense)}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase text-muted-foreground">Saldo bersih</p>
                                <p className={cn('font-semibold', highlight.net >= 0 ? 'text-emerald-600' : 'text-destructive')}>
                                    {formatCurrency(highlight.net)}
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1">
                        {timeRangeButtons.map((item) => (
                            <Button
                                key={item.value}
                                onClick={() => setTimeRange(item.value)}
                                variant={timeRange === item.value ? 'secondary' : 'ghost'}
                                size="sm"
                                className={cn(
                                    'h-8 rounded-full px-3 text-xs font-medium transition',
                                    timeRange === item.value ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                                )}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <ChartContainer config={chartConfig} className="h-[22rem] w-full">
                    <BarChart accessibilityLayer data={trendData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="formattedDate"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            interval="preserveStartEnd"
                        />
                        <YAxis tickFormatter={formatTick} axisLine={false} tickLine={false} width={60} />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value, payload) => {
                                        if (payload && payload.length > 0 && payload[0].payload) {
                                            return format(parseISO(payload[0].payload.date), 'eeee, d MMM yyyy', {
                                                locale: dateFnsLocaleId,
                                            });
                                        }
                                        return value;
                                    }}
                                    formatter={(value, name) => (
                                        <div className="flex flex-col">
                                            <span>{name === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span>
                                            <span className="font-bold">{formatCurrency(Number(value))}</span>
                                        </div>
                                    )}
                                    indicator="dot"
                                />
                            }
                        />
                        <Bar dataKey="income" fill="hsl(var(--chart-2))" radius={6} name="Pemasukan" />
                        <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={6} name="Pengeluaran" />
                    </BarChart>
                </ChartContainer>
                {highlight && highlight.variant === 'net' && (
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Total pemasukan</p>
                            <p className="mt-2 text-lg font-semibold text-emerald-600">{formatCurrency(highlight.totalIncome)}</p>
                            <p className="text-xs text-emerald-700/80">Akumulasi pemasukan sepanjang periode.</p>
                        </div>
                        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-destructive">Total pengeluaran</p>
                            <p className="mt-2 text-lg font-semibold text-destructive">{formatCurrency(highlight.totalExpense)}</p>
                            <p className="text-xs text-destructive/80">Jumlah pengeluaran yang terjadi pada periode ini.</p>
                        </div>
                        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Hari terbaik</p>
                            <p className="mt-2 text-sm font-semibold">{highlight.bestDay?.label || '-'}</p>
                            <p className="text-xs text-muted-foreground">
                                {highlight.bestDay ? formatCurrency(highlight.bestDay.value) : 'Belum ada data bermakna'} tercatat sebagai saldo bersih tertinggi.
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const CategoryAnalysis = ({ type, className }: { type: 'expense' | 'income'; className?: string }) => {
    const { transactions } = useApp();
    const router = useRouter();

    const handleCategoryClick = (category: string) => {
        router.push(`/transactions?category=${encodeURIComponent(category)}`);
    };

    const { chartData, chartConfig, total } = useMemo(() => {
        const now = new Date();
        const monthlyTransactions = transactions.filter((t) => t.type === type && isSameMonth(parseISO(t.date), now));

        const total = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

        const categoryMap: { [key: string]: number } = {};
        monthlyTransactions.forEach((t) => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });

        const chartData = Object.entries(categoryMap)
            .map(([name, value]) => {
                const details = categoryDetails(name);
                return {
                    name,
                    value,
                    icon: details.icon,
                    fill: `hsl(var(${details.color.match(/(--[\w-]+)/)?.[1]}))`,
                    percentage: total > 0 ? (value / total) * 100 : 0,
                };
            })
            .sort((a, b) => b.value - a.value);

        const chartConfig = Object.fromEntries(
            chartData.map((item) => [
                item.name,
                {
                    label: item.name,
                    color: item.fill,
                    icon: item.icon,
                },
            ])
        ) as ChartConfig;

        return { chartData, chartConfig, total };
    }, [transactions, type]);

    if (chartData.length === 0) {
        return (
            <PlaceholderContent
                label={`Analisis ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`}
                icon={type === 'expense' ? ArrowDownLeft : ArrowUpRight}
                text={`Data ${type === 'expense' ? 'pengeluaran' : 'pemasukan'}-mu belum cukup untuk dianalisis. Mulai catat transaksi yuk!`}
            />
        );
    }

    const monthLabel = format(new Date(), 'MMMM yyyy', { locale: dateFnsLocaleId });

    return (
        <div className={cn('grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]', className)}>
            <Card className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/95 shadow-sm">
                <CardHeader>
                    <CardTitle>{type === 'expense' ? 'Distribusi Pengeluaran' : 'Distribusi Pemasukan'}</CardTitle>
                    <CardDescription>
                        Persentase {type === 'expense' ? 'pengeluaran' : 'pemasukan'} per kategori selama {monthLabel}.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center">
                    <ChartContainer config={chartConfig} className="h-[20rem] w-full">
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        formatter={(value, name) => {
                                            const config = chartConfig[name as keyof typeof chartConfig];
                                            if (!config) return null;

                                            const IconComponent = config.icon as React.ComponentType<{
                                                className?: string;
                                                color?: string;
                                            }>;

                                            return (
                                                <div className="flex items-center gap-2">
                                                    {IconComponent && (
                                                        <IconComponent className="h-4 w-4" color={config.color}
                                                        />
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold">{config.label}</span>
                                                        <span className="text-muted-foreground">{formatCurrency(Number(value))}</span>
                                                    </div>
                                                </div>
                                            );
                                        }}
                                        hideLabel
                                    />
                                }
                            />
                            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={70} strokeWidth={5}>
                                {chartData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        Total {type === 'expense' ? 'pengeluaran' : 'pemasukan'}: <span className="font-semibold">{formatCurrency(total)}</span>
                    </div>
                </CardContent>
            </Card>
            <Card className="rounded-2xl border border-border/60 bg-background/95 shadow-sm">
                <CardHeader>
                    <CardTitle>Rincian Kategori</CardTitle>
                    <CardDescription>Pilih kategori untuk melihat daftar transaksi terkait.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {chartData.slice(0, 6).map((item) => (
                        <div
                            key={item.name}
                            className="group cursor-pointer rounded-xl border border-transparent bg-muted/20 p-3 transition hover:border-border/60 hover:bg-muted/30"
                            onClick={() => handleCategoryClick(item.name)}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                        <item.icon className="h-5 w-5" color={item.fill} />
                                    </div>
                                    <div>
                                        <p className="font-medium leading-tight">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">{formatCurrency(item.value)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="border-border/60 text-xs">
                                        {item.percentage.toFixed(1)}%
                                    </Badge>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
                                </div>
                            </div>
                            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-2 rounded-full"
                                    style={{ width: `${Math.min(item.percentage, 100)}%`, backgroundColor: item.fill }}
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

const PlaceholderContent = ({
    label,
    icon: Icon,
    text,
}: {
    label: string;
    icon: React.ElementType;
    text?: string;
}) => (
    <Card className="rounded-2xl border border-dashed border-border/60 bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-inner">
                <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">{label}</h3>
                <p className="text-sm text-muted-foreground">
                    {text ||
                        `Grafik dan data untuk analisis ${label.toLowerCase()} akan segera hadir untuk memberikanmu wawasan yang lebih dalam.`}
                </p>
            </div>
        </CardContent>
    </Card>
);

export default function ChartsPage() {
    const router = useRouter();
    const { transactions } = useApp();
    const [activeTab, setActiveTab] = useState<TabValue>('expense');
    const [direction, setDirection] = useState(0);

    const handleTabChange = (value: string) => {
        const newIndex = tabs.findIndex((tab) => tab.value === value);
        const oldIndex = tabs.findIndex((tab) => tab.value === activeTab);
        setDirection(newIndex > oldIndex ? 1 : -1);
        setActiveTab(value as TabValue);
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            const currentIndex = tabs.findIndex((tab) => tab.value === activeTab);
            if (currentIndex < tabs.length - 1) {
                handleTabChange(tabs[currentIndex + 1].value);
            }
        },
        onSwipedRight: () => {
            const currentIndex = tabs.findIndex((tab) => tab.value === activeTab);
            if (currentIndex > 0) {
                handleTabChange(tabs[currentIndex - 1].value);
            }
        },
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? '100%' : '-100%',
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
        }),
    };

    const monthLabel = useMemo(() => format(new Date(), 'MMMM yyyy', { locale: dateFnsLocaleId }), []);

    const monthlySnapshot = useMemo(() => {
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);

        return transactions.reduce(
            (acc, transaction) => {
                const tDate = parseISO(transaction.date);
                if (tDate >= start && tDate <= end) {
                    if (transaction.type === 'income') {
                        acc.income += transaction.amount;
                    }
                    if (transaction.type === 'expense') {
                        acc.expense += transaction.amount;
                    }
                    acc.count += 1;
                }
                return acc;
            },
            { income: 0, expense: 0, count: 0 }
        );
    }, [transactions]);

    const netValue = monthlySnapshot.income - monthlySnapshot.expense;
    const netPositive = netValue >= 0;

    return (
        <div className="flex min-h-screen flex-col bg-muted/40">
            <header className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full border border-border/60"
                            onClick={() => router.back()}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                                Analisis
                            </p>
                            <h1 className="text-2xl font-bold leading-tight md:text-3xl">Wawasan Keuangan</h1>
                        </div>
                    </div>
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 gap-1 rounded-full border border-border/60 bg-muted/40 p-1 text-muted-foreground">
                            {tabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto" {...handlers}>
                <div className="mx-auto w-full max-w-6xl space-y-3 px-4 pb-4 pt-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            <span>{monthLabel}</span>
                        </div>
                        <Badge
                            variant="outline"
                            className={cn(
                                'flex items-center gap-1 text-xs font-semibold',
                                netPositive
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border-destructive/60 bg-destructive/10 text-destructive'
                            )}
                        >
                            <Scale className="h-3.5 w-3.5" />
                            {netPositive ? 'Surplus' : 'Defisit'} {formatCurrency(netValue)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs font-medium">
                            {monthlySnapshot.count} transaksi dianalisis
                        </Badge>
                    </div>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        Jelajahi ringkasan interaktif untuk memahami pola pemasukan, pengeluaran, dan arus kasmu sehingga
                        keputusan finansial makin percaya diri.
                    </p>
                </div>
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={activeTab}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="mx-auto w-full max-w-6xl px-4 pb-24 pt-2"
                    >
                        <div className="space-y-10">
                            {activeTab === 'expense' && (
                                <>
                                    <section className="space-y-4">
                                        <SectionHeader
                                            eyebrow="Ringkasan"
                                            title="Gambaran Pengeluaran"
                                            description="Pantau total pengeluaran dan insight penting di bulan berjalan."
                                        />
                                        <div className="grid gap-4 lg:grid-cols-3">
                                            <ExpenseSummaryCard className="lg:col-span-1" />
                                            <TrendChart type="expense" className="lg:col-span-2" />
                                        </div>
                                    </section>
                                    <section className="space-y-4">
                                        <SectionHeader
                                            eyebrow="Kategori"
                                            title="Distribusi Pengeluaran"
                                            description="Lihat kategori mana yang paling menyerap anggaranmu agar bisa melakukan penyesuaian tepat."
                                        />
                                        <CategoryAnalysis type="expense" />
                                    </section>
                                </>
                            )}
                            {activeTab === 'income' && (
                                <>
                                    <section className="space-y-4">
                                        <SectionHeader
                                            eyebrow="Ringkasan"
                                            title="Gambaran Pemasukan"
                                            description="Ketahui sumber pemasukan utama dan transaksi bernilai terbesar bulan ini."
                                        />
                                        <div className="grid gap-4 lg:grid-cols-3">
                                            <IncomeSummaryCard className="lg:col-span-1" />
                                            <TrendChart type="income" className="lg:col-span-2" />
                                        </div>
                                    </section>
                                    <section className="space-y-4">
                                        <SectionHeader
                                            eyebrow="Kategori"
                                            title="Distribusi Pemasukan"
                                            description="Pelajari kontribusi tiap sumber pemasukan untuk merencanakan strategi keuangan."
                                        />
                                        <CategoryAnalysis type="income" />
                                    </section>
                                </>
                            )}
                            {activeTab === 'net' && (
                                <section className="space-y-4">
                                    <SectionHeader
                                        eyebrow="Ringkasan"
                                        title="Arus Kas Bulan Ini"
                                        description="Bandingkan pemasukan dan pengeluaran untuk memastikan cashflow tetap sehat."
                                    />
                                    <div className="grid gap-4 lg:grid-cols-3">
                                        <NetIncomeSummaryCard className="lg:col-span-1" />
                                        <TrendChart type="net" className="lg:col-span-2" />
                                    </div>
                                </section>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}
