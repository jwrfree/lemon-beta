
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import {
    ArrowDownLeft,
    ArrowUpRight,
    BarChart,
    Calendar,
    ChartArea as ChartAreaIcon,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    Scale,
    Sparkles,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import {
    eachDayOfInterval,
    format,
    getDaysInMonth,
    getQuarter,
    isSameMonth,
    parseISO,
    startOfDay,
    startOfMonth,
    subDays,
    subMonths,
} from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';

import {
    Area,
    AreaChart as RechartsAreaChart,
    Bar,
    BarChart as RechartsBarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Line,
    Pie,
    PieChart,
    ReferenceLine,
    XAxis,
    YAxis,
} from 'recharts';

import { useApp } from '@/components/app-provider';
import { AnimatedCounter } from '@/components/animated-counter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { categoryDetails } from '@/lib/categories';
import { cn, formatCurrency } from '@/lib/utils';

type TabValue = 'expense' | 'income' | 'net';

const tabs: { value: TabValue; label: string }[] = [
    { value: 'expense', label: 'Pengeluaran' },
    { value: 'income', label: 'Pemasukan' },
    { value: 'net', label: 'Arus Kas' },
];

const romanQuarters = ['I', 'II', 'III', 'IV'] as const;

const PlaceholderContent = ({
    label,
    icon: Icon,
    text,
}: {
    label: string;
    icon: React.ElementType;
    text?: string;
}) => (
    <Card className="border-dashed border-primary/30 bg-muted/50">
        <CardContent className="flex flex-col items-center justify-center gap-5 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold">{label}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                    {text ||
                        `Data untuk analisis ${label.toLowerCase()} akan muncul di sini setelah Anda mencatat transaksi.`}
                </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span>Catat transaksi pertama kamu untuk membuka insight.</span>
            </div>
        </CardContent>
    </Card>
);


const CategoryAnalysis = ({ type }: { type: 'expense' | 'income' }) => {
    const { transactions } = useApp();
    const router = useRouter();

    const handleCategoryClick = (category: string) => {
        router.push(`/transactions?category=${encodeURIComponent(category)}`);
    };

    const { chartData, chartConfig, total } = useMemo(() => {
        const now = new Date();
        const monthlyTransactions = transactions.filter((t) => t.type === type && isSameMonth(parseISO(t.date), now));

        if (monthlyTransactions.length === 0) {
            return { chartData: [], chartConfig: {}, total: 0 };
        }

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
                    fill: `hsl(var(--${details.color.match(/text-([\w-]+)/)?.[1] || 'primary'}))`,
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
                label={`Distribusi ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`}
                icon={type === 'expense' ? TrendingDown : TrendingUp}
                text={`Belum ada data ${type === 'expense' ? 'pengeluaran' : 'pemasukan'} bulan ini untuk dianalisis.`}
            />
        );
    }

    const sectionLabel = type === 'expense' ? 'Pengeluaran' : 'Pemasukan';

    return (
        <Card className="overflow-hidden">
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle>Distribusi per Kategori</CardTitle>
                    <Badge variant="secondary" className="border-transparent bg-primary/10 text-primary">
                        {formatCurrency(total)}
                    </Badge>
                </div>
                <CardDescription>
                    {`Lihat ${sectionLabel.toLowerCase()} kamu berdasarkan 5 kategori terbesar bulan ini.`}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-56 w-full max-w-[260px]">
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} hideLabel />}
                            />
                            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="60%" strokeWidth={3}>
                                {chartData.map((entry) => (
                                    <Cell
                                        key={`cell-${entry.name}`}
                                        fill={entry.fill}
                                        stroke="hsl(var(--background))"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                    <p className="text-xs text-muted-foreground">
                        Ketuk kategori untuk membuka daftar transaksi terkait.
                    </p>
                </div>
                <div className="space-y-3">
                    {chartData.slice(0, 5).map((item) => {
                        const IconComponent = item.icon as React.ElementType | undefined;
                        return (
                            <button
                                key={item.name}
                                type="button"
                                className="group w-full rounded-2xl border border-border/60 bg-background/80 p-3 text-left shadow-sm transition hover:border-primary/40 hover:bg-background"
                                onClick={() => handleCategoryClick(item.name)}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex flex-1 items-center gap-3">
                                        <div
                                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white shadow"
                                            style={{
                                                background: `linear-gradient(135deg, ${item.fill}, hsl(var(--primary)))`,
                                            }}
                                        >
                                            {IconComponent ? <IconComponent className="h-5 w-5" /> : null}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.percentage.toFixed(1)}% dari {sectionLabel.toLowerCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-semibold">{formatCurrency(item.value)}</div>
                                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition group-hover:text-primary" />
                                </div>
                                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${Math.min(100, item.percentage)}%`,
                                            background: item.fill,
                                        }}
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

const compactCurrencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    notation: 'compact',
    maximumFractionDigits: 1,
});

const ExpenseShortTermTrend = () => {
    const { transactions } = useApp();
    const [range, setRange] = useState<'14' | '30'>('14');
    const [chartType, setChartType] = useState<'area' | 'bar'>('area');

    const { baseData, hasActivity } = useMemo(() => {
        const endDate = startOfDay(new Date());
        const startDate = subDays(endDate, 59);
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        const totalsByDay = transactions.reduce((acc, transaction) => {
            if (transaction.type !== 'expense') {
                return acc;
            }

            const txDate = startOfDay(parseISO(transaction.date));
            if (txDate < startDate || txDate > endDate) {
                return acc;
            }

            const key = format(txDate, 'yyyy-MM-dd');
            acc[key] = (acc[key] || 0) + transaction.amount;
            return acc;
        }, {} as Record<string, number>);

        const data = days.map((date) => {
            const key = format(date, 'yyyy-MM-dd');
            return {
                key,
                date,
                shortLabel: format(date, 'd MMM', { locale: dateFnsLocaleId }),
                fullLabel: format(date, "EEEE, d MMMM yyyy", { locale: dateFnsLocaleId }),
                total: totalsByDay[key] ?? 0,
            };
        });

        const hasRecentActivity = data.slice(-30).some((item) => item.total > 0);

        return { baseData: data, hasActivity: hasRecentActivity };
    }, [transactions]);

    const chartLength = range === '14' ? 14 : 30;

    const filteredData = useMemo(() => baseData.slice(-chartLength), [baseData, chartLength]);
    const previousWindow = useMemo(() => baseData.slice(-(chartLength * 2), -chartLength), [baseData, chartLength]);

    const totalSpent = useMemo(() => filteredData.reduce((sum, item) => sum + item.total, 0), [filteredData]);
    const previousTotal = useMemo(
        () => previousWindow.reduce((sum, item) => sum + item.total, 0),
        [previousWindow]
    );

    const delta = totalSpent - previousTotal;
    const percentChange = previousTotal > 0 ? (delta / previousTotal) * 100 : null;
    const average = filteredData.length > 0 ? totalSpent / filteredData.length : 0;
    const peakDay = filteredData.reduce<null | (typeof filteredData)[number]>((best, item) => {
        if (!best || item.total > best.total) {
            return item;
        }
        return best;
    }, null);

    if (!hasActivity) {
        return (
            <PlaceholderContent
                label="Tren Pengeluaran Harian"
                icon={ChartAreaIcon}
                text="Belum ada data pengeluaran dalam 30 hari terakhir. Catat transaksi untuk melihat grafik ini."
            />
        );
    }

    const gradientId = `expense-trend-${chartType}-${range}`;

    const deltaLabel = percentChange === null
        ? 'Tidak ada periode pembanding'
        : `${delta >= 0 ? '+' : ''}${formatCurrency(delta)} (${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%)`;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="space-y-4">
                <div className="flex flex-col gap-1">
                    <CardTitle>Tren Pengeluaran</CardTitle>
                    <CardDescription>
                        Pantau pengeluaran harian selama {chartLength} hari terakhir dan pilih tampilan chart favoritmu.
                    </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center rounded-full bg-muted/60 p-1">
                        {['14', '30'].map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setRange(option as '14' | '30')}
                                className={cn(
                                    'rounded-full px-3 py-1 text-xs font-semibold transition',
                                    range === option
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted'
                                )}
                            >
                                {option}H
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center rounded-full bg-muted/60 p-1">
                        {[
                            { value: 'area' as const, label: 'Area', icon: ChartAreaIcon },
                            { value: 'bar' as const, label: 'Bar', icon: BarChart },
                        ].map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setChartType(option.value)}
                                className={cn(
                                    'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition',
                                    chartType === option.value
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted'
                                )}
                            >
                                <option.icon className="h-3.5 w-3.5" />
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total periode ini</p>
                        <p className="text-lg font-semibold text-foreground">{formatCurrency(totalSpent)}</p>
                        <p className="text-[11px] text-muted-foreground">{deltaLabel}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Rata-rata per hari</p>
                        <p className="text-lg font-semibold text-foreground">{formatCurrency(average)}</p>
                        <p className="text-[11px] text-muted-foreground">{chartLength} hari terakhir</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pengeluaran tertinggi</p>
                        {peakDay ? (
                            <>
                                <p className="text-lg font-semibold text-foreground">{formatCurrency(peakDay.total)}</p>
                                <p className="text-[11px] text-muted-foreground">{peakDay.fullLabel}</p>
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
                        )}
                    </div>
                </div>

                <div className="h-60 w-full">
                    <ChartContainer
                        config={{ total: { label: 'Pengeluaran', color: 'hsl(var(--chart-2))' } } as ChartConfig}
                        className="h-full w-full"
                    >
                        {chartType === 'area' ? (
                            <RechartsAreaChart data={filteredData} margin={{ left: 0, right: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                <XAxis dataKey="shortLabel" tickLine={false} axisLine={false} tickMargin={10} minTickGap={14} />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    width={72}
                                    tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
                                />
                                <ChartTooltip
                                    cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, opacity: 0.6 }}
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value) => formatCurrency(Number(value))}
                                            labelFormatter={(label, payload) => payload?.[0]?.payload.fullLabel ?? label}
                                        />
                                    }
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="hsl(var(--chart-2))"
                                    fill={`url(#${gradientId})`}
                                    strokeWidth={2.5}
                                    activeDot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--chart-2))' }}
                                />
                            </RechartsAreaChart>
                        ) : (
                            <RechartsBarChart data={filteredData} barCategoryGap={8}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                <XAxis dataKey="shortLabel" tickLine={false} axisLine={false} tickMargin={10} minTickGap={14} />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    width={72}
                                    tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
                                />
                                <ChartTooltip
                                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.35 }}
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value) => formatCurrency(Number(value))}
                                            labelFormatter={(label, payload) => payload?.[0]?.payload.fullLabel ?? label}
                                        />
                                    }
                                />
                                <Bar dataKey="total" radius={[8, 8, 4, 4]}>
                                    {filteredData.map((item) => (
                                        <Cell
                                            key={item.key}
                                            fill="hsl(var(--chart-2))"
                                            fillOpacity={peakDay?.key === item.key ? 1 : 0.6}
                                        />
                                    ))}
                                </Bar>
                            </RechartsBarChart>
                        )}
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
};

const MonthlyTrendChart = ({ type }: { type: 'expense' | 'income' }) => {
    const { transactions } = useApp();

    const { data, rangeLabel, highestMonth, totalYear, average } = useMemo(() => {
        const now = startOfMonth(new Date());
        const monthSequence = Array.from({ length: 12 }, (_, index) => {
            const monthDate = subMonths(now, 11 - index);
            const key = format(monthDate, 'yyyy-MM');

            return {
                key,
                date: monthDate,
                shortLabel: format(monthDate, 'MMM', { locale: dateFnsLocaleId }),
                fullLabel: format(monthDate, 'MMMM yyyy', { locale: dateFnsLocaleId }),
            };
        });

        const totalsByMonth = transactions.reduce((acc, transaction) => {
            if (transaction.type !== type) {
                return acc;
            }

            const txDate = parseISO(transaction.date);
            const key = format(txDate, 'yyyy-MM');

            acc[key] = (acc[key] || 0) + transaction.amount;
            return acc;
        }, {} as Record<string, number>);

        const data = monthSequence.map((month) => ({
            ...month,
            total: totalsByMonth[month.key] ?? 0,
        }));

        const firstMonth = data[0];
        const lastMonth = data[data.length - 1];
        const rangeLabel = firstMonth && lastMonth
            ? `${format(firstMonth.date, 'MMM yyyy', { locale: dateFnsLocaleId })} - ${format(lastMonth.date, 'MMM yyyy', {
                  locale: dateFnsLocaleId,
              })}`
            : '12 bulan terakhir';

        const totalYear = data.reduce((sum, item) => sum + item.total, 0);
        const average = data.length > 0 ? totalYear / data.length : 0;
        const highestMonth = data.reduce<null | (typeof data)[number]>(
            (max, entry) => (entry.total > (max?.total ?? 0) ? entry : max),
            null
        );

        return { data, rangeLabel, highestMonth, totalYear, average };
    }, [transactions, type]);

    const hasActivity = data.some((item) => item.total > 0);

    if (!hasActivity) {
        return (
            <PlaceholderContent
                label={`Tren ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'} Bulanan`}
                icon={BarChart}
                text={`Grafik bulanan akan muncul setelah kamu memiliki transaksi ${
                    type === 'expense' ? 'pengeluaran' : 'pemasukan'
                } dalam 12 bulan terakhir.`}
            />
        );
    }

    const gradientId = `monthly-trend-${type}`;
    const sectionLabel = type === 'expense' ? 'pengeluaran' : 'pemasukan';

    return (
        <Card className="overflow-hidden">
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle>Tren Bulanan</CardTitle>
                    <Badge variant="secondary" className="border-transparent bg-muted text-muted-foreground">
                        {rangeLabel}
                    </Badge>
                </div>
                <CardDescription>
                    {`Pantau pola ${sectionLabel} kamu sepanjang 12 bulan terakhir.`}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                {highestMonth && highestMonth.total > 0 ? (
                    <div className="rounded-2xl bg-muted/60 p-3 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Bulan tertinggi {sectionLabel}:</span>{' '}
                        <span className="font-medium text-foreground">{highestMonth.fullLabel}</span>
                        {` sebesar `}
                        <span className="font-semibold text-foreground">{formatCurrency(highestMonth.total)}</span>
                        <div className="mt-1 text-xs">
                            Rata-rata bulanan {sectionLabel}: {formatCurrency(average)}
                        </div>
                    </div>
                ) : (
                    <div className="rounded-2xl bg-muted/60 p-3 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Rata-rata bulanan {sectionLabel}:</span>{' '}
                        <span className="font-semibold text-foreground">{formatCurrency(average)}</span>
                    </div>
                )}
                <div className="h-60 w-full">
                    <ChartContainer
                        config={{ total: { label: sectionLabel, color: 'hsl(var(--primary))' } } as ChartConfig}
                        className="h-full w-full"
                    >
                        <RechartsBarChart data={data} barCategoryGap={12}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
                                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                            <XAxis dataKey="shortLabel" tickLine={false} axisLine={false} tickMargin={10} />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                width={68}
                                tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.35 }}
                                content={
                                    <ChartTooltipContent
                                        formatter={(value) => formatCurrency(Number(value))}
                                        labelFormatter={(label, payload) => payload?.[0]?.payload.fullLabel ?? label}
                                    />
                                }
                            />
                            <Bar dataKey="total" fill={`url(#${gradientId})`} radius={[8, 8, 4, 4]} />
                        </RechartsBarChart>
                    </ChartContainer>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Total setahun: {formatCurrency(totalYear)}</span>
                    <span>Rata-rata: {formatCurrency(average)}</span>
                </div>
            </CardContent>
        </Card>
    );
};


const MonthlySummary = ({ type }: { type: TabValue }) => {
    const { transactions } = useApp();

    const summary = useMemo(() => {
        const now = new Date();
        const monthLabel = format(now, 'MMMM yyyy', { locale: dateFnsLocaleId });
        const daysInMonth = getDaysInMonth(now);
        const daysElapsed = now.getDate();
        const monthProgress = (daysElapsed / daysInMonth) * 100;

        const monthlyTransactions = transactions.filter((t) => isSameMonth(parseISO(t.date), now));
        const incomeTransactions = monthlyTransactions.filter((t) => t.type === 'income');
        const expenseTransactions = monthlyTransactions.filter((t) => t.type === 'expense');

        const income = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
        const expense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
        const net = income - expense;

        const baseSummary = {
            monthLabel,
            monthProgress,
            daysElapsed,
            daysInMonth,
            netDetails: { income, expense, net },
            averagePerDay: 0,
            averagePerTransaction: 0,
            topCategory: null as null | {
                name: string;
                value: number;
                percentage: number;
                icon: React.ElementType;
                color: string;
                bgColor: string;
            },
            topTransaction: null as null | any,
            tipCopy: '',
            badgeLabel: '',
            heroDescription: '',
            heroGradient: '',
            icon: Scale as React.ElementType,
            title: '',
            value: 0,
            isPositive: true,
            type,
        };

        if (type === 'expense' || type === 'income') {
            const relevantTransactions = type === 'expense' ? expenseTransactions : incomeTransactions;
            const value = type === 'expense' ? expense : income;
            const transactionCount = relevantTransactions.length;

            const categoryTotals = relevantTransactions.reduce((acc, transaction) => {
                acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
                return acc;
            }, {} as Record<string, number>);

            let topCategory = null as (typeof baseSummary)['topCategory'];
            const sortedCategories = Object.entries(categoryTotals) as [string, number][];
            if (sortedCategories.length > 0) {
                const [name, categoryValue] = sortedCategories.sort((a, b) => b[1] - a[1])[0];
                const details = categoryDetails(name);
                topCategory = {
                    name,
                    value: categoryValue,
                    percentage: value > 0 ? (categoryValue / value) * 100 : 0,
                    icon: details.icon,
                    color: details.color,
                    bgColor: details.bgColor,
                };
            }

            const topTransaction = transactionCount
                ? [...relevantTransactions].sort((a, b) => b.amount - a.amount)[0]
                : null;

            const averagePerTransaction = transactionCount > 0 ? value / transactionCount : 0;
            const averagePerDay = daysElapsed > 0 ? value / daysElapsed : 0;

            const heroGradient =
                type === 'expense'
                    ? 'bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400'
                    : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500';

            const heroDescription =
                type === 'expense'
                    ? 'Fokus pada kategori terbesar agar anggaran tetap aman.'
                    : 'Kenali sumber pemasukan utama bulan ini.';

            const tipCopy =
                type === 'expense'
                    ? 'Pertimbangkan untuk menyiapkan batas pengeluaran pada kategori terbesar agar tidak melampaui budget.'
                    : 'Salurkan pemasukan tambahan ke tabungan otomatis atau tujuan finansialmu.';

            return {
                ...baseSummary,
                title: type === 'expense' ? 'Total Pengeluaran' : 'Total Pemasukan',
                value,
                icon: type === 'expense' ? ArrowDownLeft : ArrowUpRight,
                heroGradient,
                heroDescription,
                tipCopy,
                topCategory,
                topTransaction,
                averagePerDay,
                averagePerTransaction,
                badgeLabel: transactionCount > 0 ? `${transactionCount} transaksi` : 'Belum ada transaksi',
                isPositive: type === 'income',
            };
        }

        const tipCopy =
            net >= 0
                ? 'Pindahkan surplus ke tabungan otomatis agar uangmu langsung bekerja.'
                : 'Tinjau ulang kategori terbesar dan pertimbangkan penyesuaian budget bulan depan.';

        return {
            ...baseSummary,
            title: 'Arus Kas Bersih',
            value: net,
            icon: Scale,
            heroGradient:
                net >= 0
                    ? 'bg-gradient-to-br from-emerald-500 via-teal-500 to-sky-500'
                    : 'bg-gradient-to-br from-rose-500 via-orange-500 to-amber-400',
            heroDescription: 'Selisih antara pemasukan dan pengeluaran bulan ini.',
            badgeLabel: net >= 0 ? 'Surplus' : 'Defisit',
            tipCopy,
            isPositive: net >= 0,
        };
    }, [transactions, type]);

    const router = useRouter();
    const handleTxClick = (txId: string) => {
        router.push('/transactions');
    };

    if (type !== 'net' && summary.value === 0) {
        return (
            <PlaceholderContent
                label={`Ringkasan ${type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}`}
                icon={type === 'expense' ? TrendingDown : TrendingUp}
                text={`Belum ada data ${type === 'expense' ? 'pengeluaran' : 'pemasukan'} bulan ini.`}
            />
        );
    }

    const Icon = summary.icon as React.ElementType;
    const TopCategoryIcon = summary.topCategory?.icon as React.ElementType | undefined;

    return (
        <section className="space-y-4">
            <Card className={cn('relative overflow-hidden border-none text-white shadow-none', summary.heroGradient)}>
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <Badge className="flex items-center gap-1 border-white/20 bg-white/15 text-white backdrop-blur">
                            <Calendar className="h-3.5 w-3.5" />
                            {summary.monthLabel}
                        </Badge>
                        <Badge
                            className={cn(
                                'border-white/20 bg-white/15 text-white backdrop-blur',
                                summary.type === 'net' && summary.isPositive && 'bg-emerald-500/30 text-white',
                                summary.type === 'net' && !summary.isPositive && 'bg-rose-500/40 text-white'
                            )}
                        >
                            {summary.badgeLabel}
                        </Badge>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="rounded-full bg-white/15 p-3 text-white">
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-medium text-white/80">{summary.title}</CardTitle>
                            <AnimatedCounter
                                value={summary.value}
                                className={cn(
                                    'text-4xl font-bold tracking-tight text-white',
                                    summary.type === 'net' && !summary.isPositive && 'text-rose-50'
                                )}
                            />
                        </div>
                    </div>
                    <p className="text-sm leading-relaxed text-white/80">{summary.heroDescription}</p>
                </CardHeader>
                <CardContent className="space-y-5 pb-6 pt-0">
                    <div>
                        <div className="flex items-center justify-between text-xs text-white/70">
                            <span>Progres bulan</span>
                            <span>
                                {summary.daysElapsed} / {summary.daysInMonth} hari
                            </span>
                        </div>
                        <Progress
                            value={summary.monthProgress}
                            className="mt-2 h-2 bg-white/20"
                            indicatorClassName="bg-white"
                        />
                    </div>
                    {summary.type === 'net' ? (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl bg-white/15 p-3">
                                <p className="text-xs uppercase tracking-wide text-white/70">Pemasukan</p>
                                <p className="text-lg font-semibold text-white">
                                    {formatCurrency(summary.netDetails.income)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-white/15 p-3">
                                <p className="text-xs uppercase tracking-wide text-white/70">Pengeluaran</p>
                                <p className="text-lg font-semibold text-white">
                                    {formatCurrency(summary.netDetails.expense)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl bg-white/15 p-3">
                                <p className="text-xs uppercase tracking-wide text-white/70">Rata-rata / hari</p>
                                <p className="text-lg font-semibold text-white">
                                    {formatCurrency(summary.averagePerDay)}
                                </p>
                            </div>
                            <div className="rounded-xl bg-white/15 p-3">
                                <p className="text-xs uppercase tracking-wide text-white/70">Rata-rata / transaksi</p>
                                <p className="text-lg font-semibold text-white">
                                    {formatCurrency(summary.averagePerTransaction)}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {summary.type !== 'net' && summary.topCategory ? (
                <Card className="rounded-2xl border border-border/60 bg-background/80 shadow-sm">
                    <CardHeader className="flex items-center gap-3 pb-2">
                        <div className={cn('rounded-full p-2', summary.topCategory.bgColor)}>
                            {TopCategoryIcon ? (
                                <TopCategoryIcon className={cn('h-5 w-5', summary.topCategory.color)} />
                            ) : null}
                        </div>
                        <div>
                            <CardTitle className="text-sm font-medium">Kategori Terbesar</CardTitle>
                            <CardDescription>
                                {`Kontribusi terbesar ${type === 'expense' ? 'pengeluaran' : 'pemasukan'} bulan ini.`}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <p className="text-lg font-semibold">{summary.topCategory.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {formatCurrency(summary.topCategory.value)} · {summary.topCategory.percentage.toFixed(1)}%
                        </p>
                    </CardContent>
                </Card>
            ) : null}

            {summary.topTransaction ? (
                <Card
                    className="rounded-2xl border border-border/60 bg-background/80 shadow-sm transition hover:border-primary/40 hover:bg-background"
                    onClick={() => handleTxClick(summary.topTransaction.id)}
                >
                    <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                        <div>
                            <CardTitle className="text-sm font-medium">Transaksi Terbesar</CardTitle>
                            <CardDescription>
                                {summary.topTransaction.date
                                    ? format(parseISO(summary.topTransaction.date), 'd MMM yyyy', {
                                          locale: dateFnsLocaleId,
                                      })
                                    : 'Tanggal tidak tersedia'}
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="border-transparent bg-muted text-muted-foreground">
                            Lihat
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-1">
                        <p className="text-lg font-semibold">
                            {summary.topTransaction.description || 'Tanpa deskripsi'}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{summary.topTransaction.category}</span>
                            <span className="font-semibold text-foreground">
                                {formatCurrency(summary.topTransaction.amount)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            ) : null}

            <Card className="rounded-2xl border-dashed border-primary/30 bg-primary/5">
                <CardContent className="flex items-start gap-3 p-4">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold">Insight Cepat</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">{summary.tipCopy}</p>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
};


const NetCashflowChart = () => {
    const { transactions } = useApp();
    const [selectedQuarter, setSelectedQuarter] = useState<'all' | string>('all');
    const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

    const { data, quarterOptions, rangeLabel, hasActivity } = useMemo(() => {
        const now = startOfMonth(new Date());
        const monthSequence = Array.from({ length: 12 }, (_, index) => {
            const monthDate = subMonths(now, 11 - index);
            const key = format(monthDate, 'yyyy-MM');

            return {
                key,
                date: monthDate,
                shortLabel: format(monthDate, 'MMM', { locale: dateFnsLocaleId }),
                fullLabel: format(monthDate, 'MMMM yyyy', { locale: dateFnsLocaleId }),
                quarter: getQuarter(monthDate),
                year: monthDate.getFullYear(),
            };
        });

        const totalsByMonth = transactions.reduce(
            (acc, transaction) => {
                const txDate = parseISO(transaction.date);
                const key = format(txDate, 'yyyy-MM');

                if (!acc[key]) {
                    acc[key] = {
                        income: 0,
                        expense: 0,
                        breakdown: {
                            income: {} as Record<string, number>,
                            expense: {} as Record<string, number>,
                        },
                    };
                }

                const bucket = acc[key];

                if (transaction.type === 'income') {
                    bucket.income += transaction.amount;
                    bucket.breakdown.income[transaction.category] =
                        (bucket.breakdown.income[transaction.category] || 0) + transaction.amount;
                } else if (transaction.type === 'expense') {
                    bucket.expense += transaction.amount;
                    bucket.breakdown.expense[transaction.category] =
                        (bucket.breakdown.expense[transaction.category] || 0) + transaction.amount;
                }

                return acc;
            },
            {} as Record<
                string,
                {
                    income: number;
                    expense: number;
                    breakdown: {
                        income: Record<string, number>;
                        expense: Record<string, number>;
                    };
                }
            >
        );

        const data = monthSequence.map((month) => {
            const record = totalsByMonth[month.key];
            const incomeTotal = record?.income ?? 0;
            const expenseTotal = record?.expense ?? 0;

            const incomeBreakdown = record
                ? Object.entries(record.breakdown.income)
                      .map(([category, value]) => ({
                          category,
                          value,
                          percentage: incomeTotal > 0 ? (value / incomeTotal) * 100 : 0,
                      }))
                      .sort((a, b) => b.value - a.value)
                : [];

            const expenseBreakdown = record
                ? Object.entries(record.breakdown.expense)
                      .map(([category, value]) => ({
                          category,
                          value,
                          percentage: expenseTotal > 0 ? (value / expenseTotal) * 100 : 0,
                      }))
                      .sort((a, b) => b.value - a.value)
                : [];

            return {
                ...month,
                income: incomeTotal,
                expense: expenseTotal,
                net: incomeTotal - expenseTotal,
                incomeBreakdown,
                expenseBreakdown,
            };
        });

        const quarterMap = new Map<string, { value: string; label: string; order: number }>();
        data.forEach((month) => {
            const value = `${month.year}-Q${month.quarter}`;
            if (!quarterMap.has(value)) {
                quarterMap.set(value, {
                    value,
                    label: `TW ${romanQuarters[month.quarter - 1]} ${month.year}`,
                    order: month.year * 10 + month.quarter,
                });
            }
        });

        const quarterOptions = Array.from(quarterMap.values())
            .sort((a, b) => a.order - b.order)
            .map(({ value, label }) => ({ value, label }));

        const hasActivity = data.some((item) => item.income > 0 || item.expense > 0);

        const firstMonth = data[0];
        const lastMonth = data[data.length - 1];
        const rangeLabel = firstMonth && lastMonth
            ? `${format(firstMonth.date, 'MMM yyyy', { locale: dateFnsLocaleId })} - ${format(lastMonth.date, 'MMM yyyy', {
                  locale: dateFnsLocaleId,
              })}`
            : '12 bulan terakhir';

        return { data, quarterOptions, rangeLabel, hasActivity };
    }, [transactions]);

    const filteredData = useMemo(
        () =>
            selectedQuarter === 'all'
                ? data
                : data.filter((item) => `${item.year}-Q${item.quarter}` === selectedQuarter),
        [data, selectedQuarter]
    );

    useEffect(() => {
        if (selectedQuarter !== 'all' && !quarterOptions.some((option) => option.value === selectedQuarter)) {
            setSelectedQuarter('all');
        }
    }, [quarterOptions, selectedQuarter]);

    useEffect(() => {
        if (filteredData.length === 0) {
            if (selectedMonthKey !== null) {
                setSelectedMonthKey(null);
            }
            return;
        }

        if (selectedMonthKey && filteredData.some((item) => item.key === selectedMonthKey)) {
            return;
        }

        const fallback =
            [...filteredData]
                .reverse()
                .find((item) => item.income > 0 || item.expense > 0) ?? filteredData[filteredData.length - 1];

        if ((fallback?.key ?? null) !== selectedMonthKey) {
            setSelectedMonthKey(fallback?.key ?? null);
        }
    }, [filteredData, selectedMonthKey]);

    if (!hasActivity) {
        return (
            <PlaceholderContent
                label="Arus Kas Tahunan"
                icon={Scale}
                text="Catat pemasukan dan pengeluaranmu untuk melihat arus kas bersih per bulan."
            />
        );
    }

    const hasQuarterActivity = filteredData.some((item) => item.income > 0 || item.expense > 0);
    const filteredTotals = filteredData.reduce(
        (acc, month) => {
            acc.income += month.income;
            acc.expense += month.expense;
            acc.net += month.net;
            return acc;
        },
        { income: 0, expense: 0, net: 0 }
    );

    const positiveMonths = filteredData.filter((item) => item.net > 0).length;
    const negativeMonths = filteredData.filter((item) => item.net < 0).length;
    const zeroMonths = filteredData.filter((item) => item.net === 0).length;

    const highlightMonth = hasQuarterActivity && filteredData.length > 0
        ? filteredData.reduce((best, item) => (Math.abs(item.net) > Math.abs(best.net) ? item : best), filteredData[0])
        : null;

    const averageNet = filteredData.length > 0 ? filteredTotals.net / filteredData.length : 0;

    const activeQuarterLabel = selectedQuarter === 'all'
        ? 'Semua bulan'
        : quarterOptions.find((option) => option.value === selectedQuarter)?.label ?? 'Semua bulan';

    const quarterRangeLabel = selectedQuarter === 'all'
        ? rangeLabel
        : filteredData.length > 0
            ? `${format(filteredData[0].date, 'MMM yyyy', { locale: dateFnsLocaleId })} - ${format(
                  filteredData[filteredData.length - 1].date,
                  'MMM yyyy',
                  { locale: dateFnsLocaleId }
              )}`
            : activeQuarterLabel;

    const summaryFootnote = hasQuarterActivity
        ? [
              `${positiveMonths} bulan surplus`,
              `${negativeMonths} bulan defisit`,
              zeroMonths > 0 ? `${zeroMonths} bulan seimbang` : null,
          ]
              .filter(Boolean)
              .join(' · ')
        : 'Belum ada pergerakan';

    const quarterFilters = [{ value: 'all', label: 'Semua' }, ...quarterOptions];

    const selectedMonthData = selectedMonthKey
        ? filteredData.find((item) => item.key === selectedMonthKey) ?? null
        : null;

    const previousMonthData = selectedMonthKey
        ? (() => {
              const index = data.findIndex((item) => item.key === selectedMonthKey);
              return index > 0 ? data[index - 1] : null;
          })()
        : null;

    const legendItems = [
        { key: 'income' as const, label: 'Pemasukan' },
        { key: 'expense' as const, label: 'Pengeluaran' },
        { key: 'net' as const, label: 'Arus Kas' },
    ];

    const formatDiffValue = (value: number) => {
        if (value === 0) {
            return 'Tetap';
        }
        const formatted = formatCurrency(Math.abs(value));
        return value > 0 ? `+${formatted}` : `-${formatted}`;
    };

    const formatPercentValue = (value: number | null) => {
        if (value === null || !Number.isFinite(value)) {
            return '—';
        }
        if (value === 0) {
            return '0%';
        }
        const absolute = Math.abs(value).toFixed(1);
        return value > 0 ? `+${absolute}%` : `-${absolute}%`;
    };

    const getComparisonColor = (metric: 'income' | 'expense' | 'net', diff: number) => {
        if (diff === 0) {
            return 'text-muted-foreground';
        }
        if (metric === 'expense') {
            return diff > 0 ? 'text-destructive' : 'text-emerald-600';
        }
        return diff >= 0 ? 'text-emerald-600' : 'text-destructive';
    };

    const renderBreakdown = (
        items: { category: string; value: number; percentage: number }[],
        emptyLabel: string,
        color: string
    ) => {
        if (items.length === 0) {
            return <p className="text-xs text-muted-foreground">{emptyLabel}</p>;
        }

        return (
            <ul className="space-y-2">
                {items.map((item) => (
                    <li key={item.category} className="space-y-1">
                        <div className="flex items-center justify-between gap-3 text-xs">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-foreground">{item.category}</p>
                                <p className="text-[11px] text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                            </div>
                            <span className="text-sm font-semibold text-foreground">{formatCurrency(item.value)}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full"
                                style={{ width: `${Math.min(100, item.percentage)}%`, backgroundColor: color }}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    const comparisonMetrics: {
        key: 'income' | 'expense' | 'net';
        label: string;
        current: number;
        previous: number;
    }[] =
        selectedMonthData && previousMonthData
            ? [
                  {
                      key: 'income',
                      label: 'Pemasukan',
                      current: selectedMonthData.income,
                      previous: previousMonthData.income,
                  },
                  {
                      key: 'expense',
                      label: 'Pengeluaran',
                      current: selectedMonthData.expense,
                      previous: previousMonthData.expense,
                  },
                  {
                      key: 'net',
                      label: 'Arus Kas',
                      current: selectedMonthData.net,
                      previous: previousMonthData.net,
                  },
              ]
            : [];

    return (
        <Card className="overflow-hidden">
            <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                    <CardTitle>Arus Kas 12 Bulan</CardTitle>
                    <Badge variant="secondary" className="border-transparent bg-muted text-muted-foreground">
                        {rangeLabel}
                    </Badge>
                </div>
                <CardDescription>
                    Lihat perbandingan pemasukan, pengeluaran, dan arus kas bersih setiap bulan serta filter cepat per
                    triwulan.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="flex flex-wrap gap-2">
                    {quarterFilters.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setSelectedQuarter(option.value)}
                            className={cn(
                                'rounded-full border border-transparent px-3 py-1.5 text-xs font-semibold transition',
                                selectedQuarter === option.value
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <div className="rounded-2xl bg-muted/60 p-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Menampilkan: {activeQuarterLabel}</span>
                    </div>
                    <p className="mt-1 font-medium text-foreground">{quarterRangeLabel}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Rata-rata arus kas: {formatCurrency(averageNet)}
                    </p>
                </div>

                {hasQuarterActivity && highlightMonth ? (
                    <div className="rounded-2xl bg-muted/60 p-3 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                            {highlightMonth.net >= 0 ? 'Surplus tertinggi' : 'Defisit terbesar'}:
                        </span>{' '}
                        <span className="font-medium text-foreground">{highlightMonth.fullLabel}</span>
                        {` sebesar `}
                        <span className="font-semibold text-foreground">{formatCurrency(highlightMonth.net)}</span>
                    </div>
                ) : (
                    <div className="rounded-2xl bg-muted/60 p-3 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                            Belum ada transaksi pada periode ini.
                        </span>
                    </div>
                )}

                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                        <span>Ketuk batang atau garis pada chart untuk melihat rincian bulan.</span>
                        <div className="flex items-center gap-3">
                            {legendItems.map((item) => (
                                <div key={item.key} className="flex items-center gap-1">
                                    <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{ backgroundColor: `var(--color-${item.key})` }}
                                    />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ChartContainer
                            config={
                                {
                                    income: { label: 'Pemasukan', color: 'hsl(var(--chart-1))' },
                                    expense: { label: 'Pengeluaran', color: 'hsl(var(--destructive))' },
                                    net: { label: 'Arus Kas', color: 'hsl(var(--chart-2))' },
                                } as ChartConfig
                            }
                            className="h-full w-full"
                        >
                            <ComposedChart
                                data={filteredData}
                                barCategoryGap={18}
                                onClick={(state) => {
                                    const payload = state?.activePayload?.[0]?.payload as
                                        | (typeof filteredData)[number]
                                        | undefined;
                                    if (payload?.key) {
                                        setSelectedMonthKey(payload.key);
                                    }
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                <XAxis dataKey="shortLabel" tickLine={false} axisLine={false} tickMargin={10} />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    width={68}
                                    tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
                                />
                                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                                <ChartTooltip
                                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.25 }}
                                    content={
                                        <ChartTooltipContent
                                            formatter={(value) => formatCurrency(Number(value))}
                                            labelFormatter={(label, payload) => payload?.[0]?.payload.fullLabel ?? label}
                                        />
                                    }
                                />
                                <Bar dataKey="income" radius={[6, 6, 4, 4]} maxBarSize={26}>
                                    {filteredData.map((item) => (
                                        <Cell
                                            key={`${item.key}-income`}
                                            fill="var(--color-income)"
                                            fillOpacity={selectedMonthKey === item.key ? 1 : 0.55}
                                        />
                                    ))}
                                </Bar>
                                <Bar dataKey="expense" radius={[6, 6, 4, 4]} maxBarSize={26}>
                                    {filteredData.map((item) => (
                                        <Cell
                                            key={`${item.key}-expense`}
                                            fill="var(--color-expense)"
                                            fillOpacity={selectedMonthKey === item.key ? 1 : 0.55}
                                        />
                                    ))}
                                </Bar>
                                <Line
                                    type="monotone"
                                    dataKey="net"
                                    stroke="var(--color-net)"
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 5, strokeWidth: 2, fill: 'var(--color-net)' }}
                                />
                            </ComposedChart>
                        </ChartContainer>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                        className={cn(
                            'col-span-2 rounded-xl border border-border/60 bg-background/80 p-3',
                            filteredTotals.net >= 0
                                ? 'border-emerald-500/40 bg-emerald-500/10'
                                : 'border-destructive/40 bg-destructive/10'
                        )}
                    >
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Total net</p>
                        <p
                            className={cn(
                                'text-lg font-semibold',
                                filteredTotals.net >= 0 ? 'text-emerald-600' : 'text-destructive'
                            )}
                        >
                            {formatCurrency(filteredTotals.net)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{summaryFootnote}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pemasukan</p>
                        <p className="text-base font-semibold text-foreground">{formatCurrency(filteredTotals.income)}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Pengeluaran</p>
                        <p className="text-base font-semibold text-foreground">{formatCurrency(filteredTotals.expense)}</p>
                    </div>
                </div>

                {selectedMonthData ? (
                    <div className="space-y-4 rounded-2xl border border-border/60 bg-background/90 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Detail bulan terpilih</p>
                                <p className="text-base font-semibold text-foreground">{selectedMonthData.fullLabel}</p>
                                <p className="text-xs text-muted-foreground">Ketuk chart di atas untuk mengganti fokus bulan.</p>
                            </div>
                            <div
                                className={cn(
                                    'rounded-full px-3 py-1 text-sm font-semibold',
                                    selectedMonthData.net >= 0
                                        ? 'bg-emerald-500/10 text-emerald-600'
                                        : 'bg-destructive/10 text-destructive'
                                )}
                            >
                                {formatCurrency(selectedMonthData.net)}
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Pemasukan
                                    </p>
                                    <span className="text-sm font-semibold text-foreground">
                                        {formatCurrency(selectedMonthData.income)}
                                    </span>
                                </div>
                                <div className="mt-3 space-y-2">
                                    {renderBreakdown(
                                        selectedMonthData.incomeBreakdown,
                                        'Belum ada pemasukan pada bulan ini.',
                                        'hsl(var(--chart-1))'
                                    )}
                                </div>
                            </div>
                            <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Pengeluaran
                                    </p>
                                    <span className="text-sm font-semibold text-foreground">
                                        {formatCurrency(selectedMonthData.expense)}
                                    </span>
                                </div>
                                <div className="mt-3 space-y-2">
                                    {renderBreakdown(
                                        selectedMonthData.expenseBreakdown,
                                        'Belum ada pengeluaran pada bulan ini.',
                                        'hsl(var(--destructive))'
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-border/60 bg-background/80 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Perbandingan vs {previousMonthData ? previousMonthData.fullLabel : 'periode sebelumnya'}
                            </p>
                            {comparisonMetrics.length > 0 ? (
                                <div className="mt-2 space-y-2">
                                    {comparisonMetrics.map((metric) => {
                                        const diff = metric.current - metric.previous;
                                        const percent = metric.previous !== 0 ? (diff / metric.previous) * 100 : null;
                                        return (
                                            <div key={metric.key} className="flex items-start justify-between gap-3 text-sm">
                                                <span className="text-muted-foreground">{metric.label}</span>
                                                <div className="text-right">
                                                    <p className="font-semibold text-foreground">
                                                        {formatCurrency(metric.current)}
                                                    </p>
                                                    <p className={cn('text-xs', getComparisonColor(metric.key, diff))}>
                                                        {formatDiffValue(diff)} · {formatPercentValue(percent)}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Belum ada data periode sebelumnya untuk dibandingkan.
                                </p>
                            )}
                        </div>
                    </div>
                ) : null}
            </CardContent>
        </Card>
    );
};

export default function ChartsPage() {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [activeTab, setActiveTab] = useState<TabValue>('expense');
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        setIsClient(true);
    }, []);

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
            position: 'absolute',
        }),
        center: {
            x: 0,
            opacity: 1,
            position: 'relative',
        },
        exit: (direction: number) => ({
            x: direction < 0 ? '100%' : '-100%',
            opacity: 0,
            position: 'absolute',
        }),
    } as const;
    
    return (
        <div className="flex flex-col h-full">
            <header className="sticky top-0 z-20 flex h-16 items-center justify-center border-b bg-background/95 px-4 shadow-sm backdrop-blur">
                <Button variant="ghost" size="icon" className="absolute left-4" onClick={() => router.back()}>
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                </Button>
                <h1 className="text-xl font-semibold tracking-tight">Statistik</h1>
            </header>

            <main className="flex-1 overflow-y-auto" {...handlers}>
                <div className="sticky top-16 z-10 border-b bg-background/95 p-4 backdrop-blur">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 rounded-full bg-muted/80 p-1">
                            {tabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="rounded-full text-sm font-semibold capitalize data-[state=active]:shadow-none"
                                >
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
                {!isClient ? (
                    <div className="flex h-full w-full items-center justify-center p-8">
                        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="relative overflow-hidden">
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={activeTab}
                                custom={direction}
                                variants={slideVariants as unknown as Variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className="w-full space-y-6 p-4"
                            >
                                <div className="space-y-3">
                                    <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                        Ringkasan bulan ini
                                    </h2>
                                    <MonthlySummary type={activeTab} />
                                </div>

                                {activeTab === 'net' ? (
                                    <div className="space-y-3">
                                        <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                            Arus kas 12 bulan
                                        </h2>
                                        <NetCashflowChart />
                                    </div>
                                ) : (
                                    <>
                                        {activeTab === 'expense' ? (
                                            <div className="space-y-3">
                                                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                                    Tren pengeluaran harian
                                                </h2>
                                                <ExpenseShortTermTrend />
                                            </div>
                                        ) : null}

                                        <div className="space-y-3">
                                            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                                Tren bulanan
                                            </h2>
                                            <MonthlyTrendChart type={activeTab} />
                                        </div>

                                        <div className="space-y-3">
                                            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                                                Distribusi kategori
                                            </h2>
                                            <CategoryAnalysis type={activeTab} />
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </div>
    );
}

    
