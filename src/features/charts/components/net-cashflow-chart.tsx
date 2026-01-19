'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Scale } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import { getNetCashflowData } from '../lib/chart-utils';
import { PlaceholderContent } from './placeholder-content';
import dynamic from 'next/dynamic';

const NetCashflowComposedChart = dynamic(() => import('./lazy-charts').then(mod => mod.NetCashflowComposedChart), {
    ssr: false,
    loading: () => <div className="h-72 w-full animate-pulse rounded-lg bg-muted" />
});

const romanQuarters = ['I', 'II', 'III', 'IV'] as const;

export const NetCashflowChart = () => {
    const { transactions } = useData();
    const [selectedQuarter, setSelectedQuarter] = useState<'all' | string>('all');
    const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);

    const { data, quarterOptions, rangeLabel, hasActivity } = useMemo(() => {
        const data = getNetCashflowData(transactions);

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
            ? `${firstMonth.shortLabel} ${firstMonth.date.getFullYear()} - ${lastMonth.shortLabel} ${lastMonth.date.getFullYear()}`
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

    const summaryFootnote = [
        `${positiveMonths} bulan surplus`,
        `${negativeMonths} bulan defisit`,
        zeroMonths > 0 ? `${zeroMonths} bulan seimbang` : null,
    ].filter(Boolean).join(' · ');

    const quarterFilters = [{ value: 'all', label: 'Semua' }, ...quarterOptions];

    const selectedMonthData = selectedMonthKey
        ? filteredData.find((item) => item.key === selectedMonthKey) ?? null
        : null;

    const legendItems = [
        { key: 'income' as const, label: 'Pemasukan' },
        { key: 'expense' as const, label: 'Pengeluaran' },
        { key: 'net' as const, label: 'Arus Kas' },
    ];

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
                                <p className="text-sm font-bold text-foreground">{item.category}</p>
                                <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/60">{item.percentage.toFixed(1)}%</p>
                            </div>
                            <span className="text-sm font-black text-foreground">{formatCurrency(item.value)}</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-muted/50">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${Math.min(100, item.percentage)}%`, backgroundColor: color }}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <Card className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-3xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Arus Kas 12 Bulan</CardTitle>
                <div className="flex items-center justify-between gap-3">
                    <CardDescription className="text-sm font-medium text-foreground">
                        Filter triwulan atau pilih bulan.
                    </CardDescription>
                    <Badge variant="outline" className="border-border text-[10px] font-bold uppercase tracking-tighter">
                        {rangeLabel}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                    {quarterFilters.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setSelectedQuarter(option.value)}
                            className={cn(
                                'rounded-full border border-transparent px-3 py-1.5 text-[10px] font-black uppercase transition',
                                selectedQuarter === option.value
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
                        <span>Ketuk grafik untuk rincian</span>
                        <div className="flex items-center gap-3">
                            {legendItems.map((item) => (
                                <div key={item.key} className="flex items-center gap-1.5">
                                    <span
                                        className="h-2 w-2 rounded-full"
                                        style={{ backgroundColor: `var(--color-${item.key})` }}
                                    />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-72 w-full pt-4">
                        <NetCashflowComposedChart 
                            filteredData={filteredData}
                            selectedMonthKey={selectedMonthKey}
                            onMonthClick={(key) => setSelectedMonthKey(key)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 rounded-2xl bg-background/40 p-4 shadow-inner border-l-4 border-primary">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Net</p>
                        <p className={cn('text-xl font-black', filteredTotals.net >= 0 ? 'text-emerald-600' : 'text-rose-500')}>
                            {formatCurrency(filteredTotals.net)}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground/70 mt-1 uppercase tracking-tighter">{summaryFootnote}</p>
                    </div>
                    <div className="rounded-2xl bg-background/40 p-4 shadow-inner">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Pemasukan</p>
                        <p className="text-base font-black text-foreground">{formatCurrency(filteredTotals.income)}</p>
                    </div>
                    <div className="rounded-2xl bg-background/40 p-4 shadow-inner">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Pengeluaran</p>
                        <p className="text-base font-black text-foreground">{formatCurrency(filteredTotals.expense)}</p>
                    </div>
                </div>

                {selectedMonthData ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 rounded-3xl bg-primary/[0.03] border border-primary/10 p-5"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Fokus Bulan</p>
                                <p className="text-lg font-black text-foreground tracking-tight">{selectedMonthData.fullLabel}</p>
                            </div>
                            <Badge
                                className={cn(
                                    'rounded-full px-3 py-1 text-xs font-black shadow-sm border-none',
                                    selectedMonthData.net >= 0
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-rose-500 text-white'
                                )}
                            >
                                {formatCurrency(selectedMonthData.net)}
                            </Badge>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/70">Pemasukan</p>
                                    <span className="text-sm font-black text-foreground">{formatCurrency(selectedMonthData.income)}</span>
                                </div>
                                {renderBreakdown(selectedMonthData.incomeBreakdown, 'Kosong', 'hsl(var(--chart-1))')}
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-600/70">Pengeluaran</p>
                                    <span className="text-sm font-black text-foreground">{formatCurrency(selectedMonthData.expense)}</span>
                                </div>
                                {renderBreakdown(selectedMonthData.expenseBreakdown, 'Kosong', 'hsl(var(--destructive))')}
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </CardContent>
        </Card>
    );
};
