'use client';

import React, { useMemo, useState } from 'react';
import { BarChart, ChartArea as ChartAreaIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, formatCurrency } from '@/lib/utils';
import { getDailyTrendData } from '../lib/chart-utils';
import { PlaceholderContent } from './placeholder-content';
import dynamic from 'next/dynamic';

import type { Transaction } from '@/types/models';

const ExpenseTrendChart = dynamic(() => import('./lazy-charts').then(mod => mod.ExpenseTrendChart), {
    ssr: false,
    loading: () => <div className="h-60 w-full animate-pulse rounded-md bg-muted" />
});

export const ExpenseShortTermTrend = ({ transactions, isLoading }: { transactions: Transaction[], isLoading?: boolean }) => {
    const [range, setRange] = useState<'14' | '30'>('14');
    const [chartType, setChartType] = useState<'area' | 'bar'>('area');

    const baseData = useMemo(() => getDailyTrendData(transactions, 60), [transactions]);
    const hasActivity = useMemo(() => baseData.slice(-30).some((item) => item.total > 0), [baseData]);

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

    if (isLoading) {
        return <div className="h-96 w-full animate-pulse rounded-card-glass bg-muted" />;
    }

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

    return (
        <Card className="overflow-hidden border-none shadow-sm bg-card rounded-md">
            <CardHeader className="space-y-4">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-xs font-medium tracking-tight text-muted-foreground">Tren Pengeluaran</CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Tabs value={range} onValueChange={(v) => setRange(v as '14' | '30')}>
                        <TabsList className="rounded-full bg-muted p-1 h-9">
                            {['14', '30'].map((option) => (
                                <TabsTrigger 
                                    key={option} 
                                    value={option}
                                    className="h-full rounded-full px-3 text-xs font-medium uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm"
                                >
                                    {option} Hari
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                    <Tabs value={chartType} onValueChange={(v) => setChartType(v as 'area' | 'bar')}>
                        <TabsList className="rounded-full bg-muted p-1 h-9">
                            {[
                                { value: 'area' as const, label: 'Area', icon: ChartAreaIcon },
                                { value: 'bar' as const, label: 'Bar', icon: BarChart },
                            ].map((option) => (
                                <TabsTrigger
                                    key={option.value}
                                    value={option.value}
                                    className="h-full flex items-center gap-1 rounded-full px-3 text-xs font-medium uppercase tracking-wider transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm"
                                >
                                    <option.icon className="h-3 w-3" />
                                    {option.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-lg bg-muted/50 p-3 sm:p-4 border-none">
                        <p className="text-xs sm:text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Total</p>
                        <p className="text-base sm:text-lg font-medium text-foreground tabular-nums">{formatCurrency(totalSpent)}</p>
                        <p className={cn("text-xs sm:text-xs font-medium uppercase mt-1", delta > 0 ? "text-destructive" : "text-teal-600")}>
                            {percentChange ? (percentChange > 0 ? '+' : '') + percentChange.toFixed(1) + '%' : '—'}
                        </p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 sm:p-4 border-none">
                        <p className="text-xs sm:text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Rata-rata</p>
                        <p className="text-base sm:text-lg font-medium text-foreground tabular-nums">{formatCurrency(average)}</p>
                        <p className="text-xs sm:text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">PER HARI</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3 sm:p-4 border-none col-span-2 sm:col-span-1">
                        <p className="text-xs sm:text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">Puncak</p>
                        {peakDay ? (
                            <div className="flex items-center justify-between sm:block">
                                <p className="text-base sm:text-lg font-medium text-foreground tabular-nums">{formatCurrency(peakDay.total)}</p>
                                <p className="text-xs sm:text-xs font-medium text-muted-foreground sm:mt-1 uppercase tracking-wider">{peakDay.shortLabel}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">None</p>
                        )}
                    </div>
                </div>

                <div className="h-64 w-full pt-4">
                    <ExpenseTrendChart 
                        chartType={chartType}
                        filteredData={filteredData}
                        gradientId={gradientId}
                        peakDayKey={peakDay?.key}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

