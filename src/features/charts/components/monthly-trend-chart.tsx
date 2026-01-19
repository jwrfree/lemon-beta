'use client';

import React, { useMemo } from 'react';
import { BarChart } from 'lucide-react';
import { useData } from '@/hooks/use-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { getMonthlyTrendData } from '../lib/chart-utils';
import { PlaceholderContent } from './placeholder-content';
import dynamic from 'next/dynamic';

const MonthlyBarChart = dynamic(() => import('./lazy-charts').then(mod => mod.MonthlyBarChart), {
    ssr: false,
    loading: () => <div className="h-60 w-full animate-pulse rounded-lg bg-muted" />
});

export const MonthlyTrendChart = ({ type }: { type: 'expense' | 'income' }) => {
    const { transactions } = useData();

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
        <Card className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm rounded-3xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Tren Tahunan</CardTitle>
                <div className="flex items-center justify-between gap-3">
                    <CardDescription className="text-sm font-medium text-foreground">
                        {`Visualisasi ${sectionLabel} 12 bulan.`}
                    </CardDescription>
                    <Badge variant="outline" className="border-border text-[10px] font-bold uppercase tracking-tighter">
                        {rangeLabel}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="h-64 w-full pt-4">
                    <MonthlyBarChart 
                        data={data}
                        gradientId={gradientId}
                        sectionLabel={sectionLabel}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-background/40 p-4 shadow-inner">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total Setahun</p>
                        <p className="text-lg font-black text-foreground">{formatCurrency(totalYear)}</p>
                    </div>
                    <div className="rounded-2xl bg-background/40 p-4 shadow-inner">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Rata-rata</p>
                        <p className="text-lg font-black text-foreground">{formatCurrency(average)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
