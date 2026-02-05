'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn, formatCurrency } from '@/lib/utils';
import { getNetCashflowData } from '../lib/chart-utils';
import { PlaceholderContent } from './placeholder-content';
import dynamic from 'next/dynamic';

const NetCashflowComposedChart = dynamic(() => import('./lazy-charts').then(mod => mod.NetCashflowComposedChart), {
    ssr: false,
    loading: () => <div className="h-72 w-full animate-pulse rounded-md bg-muted" />,
});

import type { Transaction } from '@/types/models';

const romanQuarters = ['I', 'II', 'III', 'IV'] as const;

export const NetCashflowChart = ({ transactions, isLoading }: { transactions: Transaction[], isLoading?: boolean }) => {
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

    if (isLoading) {
        return <div className="h-96 w-full animate-pulse rounded-3xl bg-muted" />;
    }

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
        { key: 'income' as const, label: 'Pemasukan', colorClass: 'bg-[var(--color-income)]' },
        { key: 'expense' as const, label: 'Pengeluaran', colorClass: 'bg-[var(--color-expense)]' },
        { key: 'net' as const, label: 'Arus Kas', colorClass: 'bg-[var(--color-net)]' },
    ];

    const renderBreakdown = (
        items: { category: string; value: number; percentage: number }[],
        emptyLabel: string,
        indicatorColorClass: string
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
                                <p className="text-[11px] font-medium text-muted-foreground/60">{item.percentage.toFixed(1)}%</p>
                            </div>
                            <span className="text-sm font-medium text-foreground tabular-nums">{formatCurrency(item.value)}</span>
                        </div>
                        <Progress 
                            value={item.percentage} 
                            className="h-1 bg-muted/50" 
                            indicatorClassName={indicatorColorClass}
                        />
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <Card className="overflow-hidden border-none shadow-sm bg-card rounded-3xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-xs font-medium tracking-tight text-muted-foreground">Arus Kas 12 Bulan</CardTitle>
                <div className="flex items-center justify-between gap-3">
                    <CardDescription className="text-sm font-medium text-foreground">
                        Filter triwulan atau pilih bulan.
                    </CardDescription>
                    <Badge variant="outline" className="border-border text-[10px] font-medium">
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
                                'rounded-full border border-transparent px-3 py-1.5 text-[11px] font-medium transition',
                                selectedQuarter === option.value
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-end gap-3 text-[11px] font-medium text-muted-foreground/60 px-1">
                        <div className="flex items-center gap-3">
                            {legendItems.map((item) => (
                                <div key={item.key} className="flex items-center gap-1.5">
                                    <span className={cn("h-2 w-2 rounded-full", item.colorClass)} />
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
                    <div className="col-span-2 rounded-3xl bg-primary/[0.03] border border-primary/10 p-6">
                        <div className="flex flex-col gap-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-primary/70">Total Net</p>
                            <p className={cn('text-3xl font-black tracking-tight', filteredTotals.net >= 0 ? 'text-teal-600' : 'text-destructive')}>
                                {formatCurrency(filteredTotals.net)}
                            </p>
                            <p className="text-[11px] font-bold text-muted-foreground/60 mt-1 uppercase tracking-tight">{summaryFootnote}</p>
                        </div>
                    </div>
                    <div className="rounded-3xl bg-muted/30 p-5 border border-border/50">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Pemasukan</p>
                        <p className="text-xl font-extrabold text-foreground tracking-tight">{formatCurrency(filteredTotals.income)}</p>
                    </div>
                    <div className="rounded-3xl bg-muted/30 p-5 border border-border/50">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Pengeluaran</p>
                        <p className="text-xl font-extrabold text-foreground tracking-tight">{formatCurrency(filteredTotals.expense)}</p>
                    </div>
                </div>

                {selectedMonthData ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6 rounded-3xl bg-primary/[0.03] border border-primary/10 p-4 md:p-6"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-0.5">
                                <p className="text-xs font-bold uppercase tracking-widest text-primary/70">Fokus Bulan</p>
                                <p className="text-xl font-extrabold text-foreground tracking-tight">{selectedMonthData.fullLabel}</p>
                            </div>
                            <Badge
                                className={cn(
                                    'rounded-full px-3 py-1 text-xs font-bold shadow-sm border-none',
                                    selectedMonthData.net >= 0
                                        ? 'bg-teal-600 text-white'
                                        : 'bg-destructive text-white'
                                )}
                            >
                                {formatCurrency(selectedMonthData.net)}
                            </Badge>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-teal-600/70">Pemasukan</p>
                                    <span className="text-sm font-bold text-foreground">{formatCurrency(selectedMonthData.income)}</span>
                                </div>
                                {renderBreakdown(selectedMonthData.incomeBreakdown, 'Kosong', 'bg-teal-600')}
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-destructive/70">Pengeluaran</p>
                                    <span className="text-sm font-bold text-foreground">{formatCurrency(selectedMonthData.expense)}</span>
                                </div>
                                {renderBreakdown(selectedMonthData.expenseBreakdown, 'Kosong', 'bg-destructive')}
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </CardContent>
        </Card>
    );
};
