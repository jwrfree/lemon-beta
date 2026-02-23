'use client';

import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Area, ComposedChart, XAxis, YAxis, CartesianGrid, Bar } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { DailyMetric } from '../types';

const chartConfig = {
    expense: {
        label: "Pengeluaran",
        color: "var(--primary)",
    },
    count: {
        label: "Frekuensi",
        color: "var(--muted)",
    },
} satisfies ChartConfig;

export function TrendAnalytics({ data }: { data: DailyMetric[] }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || data.length === 0) {
        return <div className="h-72 bg-zinc-100 dark:bg-zinc-900 rounded-card-glass animate-pulse" />;
    }

    return (
        <Card className="p-6 bg-card border-none rounded-lg shadow-card">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-medium tracking-tight flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Analisis Harian
                    </h3>
                    <p className="text-xs text-muted-foreground">Pola pengeluaran 30 hari terakhir</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs font-medium">30 Hari</Badge>
                </div>
            </div>

            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ComposedChart data={data}>
                    <defs>
                        <linearGradient id="expenseTrendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-expense)" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="var(--color-expense)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        fontSize={10}
                        tickFormatter={(value) => format(parseISO(value), 'd')}
                        tickMargin={10}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        fontSize={10}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        fontSize={10}
                        axisLine={false}
                        tickLine={false}
                        width={20}
                    />
                    <ChartTooltip
                        content={<ChartTooltipContent indicator="dot" />}
                        labelFormatter={(label) => format(parseISO(label as string), 'dd MMM yyyy')}
                    />
                    {/* Volume Bars (Frequency) */}
                    <Bar yAxisId="right" dataKey="count" fill="var(--color-count)" barSize={8} radius={[2, 2, 0, 0]} />

                    {/* Price Line (Amount) */}
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="expense"
                        stroke="var(--color-expense)"
                        strokeWidth={3}
                        fill="url(#expenseTrendFill)"
                    />
                </ComposedChart>
            </ChartContainer>
        </Card>
    );
}

