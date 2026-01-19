'use client';

import React, { useMemo, useState } from 'react';
import { BarChart, ChartArea as ChartAreaIcon } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import { getDailyTrendData } from '../lib/chart-utils';
import { PlaceholderContent } from './placeholder-content';
import dynamic from 'next/dynamic';

const ExpenseTrendChart = dynamic(() => import('./lazy-charts').then(mod => mod.ExpenseTrendChart), {
    ssr: false,
    loading: () => <div className="h-60 w-full animate-pulse rounded-lg bg-muted" />
});

export const ExpenseShortTermTrend = () => {
    const { transactions } = useData();
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
        <Card className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-3xl">
            <CardHeader className="space-y-4">
                <div className="flex flex-col gap-1">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tren Pengeluaran</CardTitle>
                    <CardDescription className="text-sm font-medium text-foreground">
                        Analisis harian {chartLength} hari terakhir.
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
                                    'rounded-full px-3 py-1 text-[11px] font-bold uppercase transition',
                                    range === option
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted'
                                )}
                            >
                                {option} Hari
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
                                    'flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase transition',
                                    chartType === option.value
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted'
                                )}
                            >
                                <option.icon className="h-3 w-3" />
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border-none bg-background/40 p-4 shadow-inner">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total</p>
                        <p className="text-lg font-extrabold text-foreground">{formatCurrency(totalSpent)}</p>
                        <p className={cn("text-[11px] font-bold uppercase mt-1", delta > 0 ? "text-destructive" : "text-success")}>
                            {percentChange ? (percentChange > 0 ? '+' : '') + percentChange.toFixed(1) + '%' : '—'}
                        </p>
                    </div>
                    <div className="rounded-2xl border-none bg-background/40 p-4 shadow-inner">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Rata-rata</p>
                        <p className="text-lg font-extrabold text-foreground">{formatCurrency(average)}</p>
                        <p className="text-[11px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">PER HARI</p>
                    </div>
                    <div className="rounded-2xl border-none bg-background/40 p-4 shadow-inner">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Puncak</p>
                        {peakDay ? (
                            <>
                                <p className="text-lg font-extrabold text-foreground">{formatCurrency(peakDay.total)}</p>
                                <p className="text-[11px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">{peakDay.shortLabel}</p>
                            </>
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
