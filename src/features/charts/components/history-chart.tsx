'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { MonthlyMetric } from '../types';

const chartConfig = {
    income: {
        label: "Pemasukan",
        color: "var(--success)",
    },
    expense: {
        label: "Pengeluaran",
        color: "var(--destructive)",
    },
} satisfies ChartConfig;

export function HistoryChart({ data }: { data: MonthlyMetric[] }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || data.length === 0) {
        return <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-card-glass animate-pulse" />;
    }

    return (
        <Card className="p-6 bg-card border-none rounded-lg shadow-card">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-medium tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        Riwayat 6 Bulan
                    </h3>
                    <p className="text-xs text-muted-foreground">Pemasukan vs Pengeluaran</p>
                </div>
            </div>
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
                <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis
                        dataKey="month"
                        fontSize={10}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        fontSize={10}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        axisLine={false}
                        tickLine={false}
                    />
                    <ChartTooltip
                        cursor={{ fill: 'transparent' }}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
            </ChartContainer>
        </Card>
    );
}

