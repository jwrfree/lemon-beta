'use client';

import React, { useMemo } from 'react';
import { BarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { getMonthlyTrendData } from '../lib/chart-utils';
import { PlaceholderContent } from './placeholder-content';
import dynamic from 'next/dynamic';

import type { Transaction } from '@/types/models';

const MonthlyBarChart = dynamic(() => import('./lazy-charts').then(mod => mod.MonthlyBarChart), {
    ssr: false,
    loading: () => <div className="h-60 w-full animate-pulse rounded-md bg-muted" />
});

import { useIsMobile } from '@/hooks/use-mobile';

export const MonthlyTrendChart = ({ type, transactions, isLoading }: { type: 'expense' | 'income', transactions: Transaction[], isLoading?: boolean }) => {
    const isMobile = useIsMobile();

    const { data, rangeLabel, highestMonth, totalYear, average } = useMemo(() => {
        const data = getMonthlyTrendData(transactions, type);

        const firstMonth = data[0];
        const lastMonth = data[data.length - 1];
        const rangeLabel = firstMonth && lastMonth
            ? `${firstMonth.shortLabel} ${firstMonth.date.getFullYear()} - ${lastMonth.shortLabel} ${lastMonth.date.getFullYear()}`
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

    if (isLoading) {
        return <div className="h-80 w-full animate-pulse rounded-3xl bg-muted" />;
    }

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
        <Card className="shadow-sm border-none rounded-xl sm:rounded-2xl overflow-hidden bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
                <div className="space-y-0.5 sm:space-y-1">
                    <CardTitle className="text-base sm:text-lg font-bold tracking-tight">Tren Tahunan</CardTitle>
                    <CardDescription className="text-[10px] sm:text-xs">
                        {`Visualisasi ${sectionLabel} 12 bulan.`}
                    </CardDescription>
                </div>
                <Badge variant="outline" className="border-border text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5">
                    {rangeLabel}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
                <div className="h-56 sm:h-64 w-full pt-2 sm:pt-4">
                    <MonthlyBarChart 
                        data={data}
                        gradientId={gradientId}
                        sectionLabel={sectionLabel}
                        color="var(--color-teal-600)"
                    />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="rounded-xl bg-muted/30 p-3 sm:p-4 border-none">
                        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1 leading-none">Total Setahun</p>
                        <p className="text-base sm:text-lg font-black text-foreground tabular-nums leading-none">{formatCurrency(totalYear)}</p>
                    </div>
                    <div className="rounded-xl bg-muted/30 p-3 sm:p-4 border-none">
                        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1 leading-none">Rata-rata</p>
                        <p className="text-base sm:text-lg font-black text-foreground tabular-nums leading-none">{formatCurrency(average)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
