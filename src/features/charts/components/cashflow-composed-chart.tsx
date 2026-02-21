'use client';

import React from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
} from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface CashflowData {
    date: string;
    income: number;
    expense: number;
    net: number;
    accumulatedNet: number; // Saldo berjalan
}

interface CashflowComposedChartProps {
    data: CashflowData[];
}

const chartConfig = {
    income: {
        label: "Pemasukan",
        color: "var(--success)",
    },
    expense: {
        label: "Pengeluaran",
        color: "var(--destructive)",
    },
    accumulatedNet: {
        label: "Saldo Berjalan",
        color: "var(--primary)",
    },
} satisfies ChartConfig;

export function CashflowComposedChart({ data }: CashflowComposedChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-[350px] flex items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                Belum ada data transaksi
            </div>
        );
    }

    return (
        <div className="w-full bg-white dark:bg-zinc-900 rounded-[2rem] p-6 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
                        Cashflow & Net Worth Trend
                    </h3>
                    <p className="text-sm text-zinc-500">Korelasi Pemasukan, Pengeluaran, dan Akumulasi Saldo</p>
                </div>
            </div>

            <div className="h-[350px] w-full text-xs">
                <ChartContainer config={chartConfig} className="h-full w-full">
                    <ComposedChart
                        data={data}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.5} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(str) => {
                                const date = parseISO(str);
                                return format(date, 'd MMM');
                            }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="left"
                            tickFormatter={(value) => `${value / 1000}k`}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            tickFormatter={(value) => `${value / 1000}k`}
                            tickLine={false}
                            axisLine={false}
                            dx={10}
                        />
                        <ChartTooltip
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        {/* Bars for Flow */}
                        <Bar yAxisId="left" dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.8} />
                        <Bar yAxisId="left" dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.8} />

                        {/* Line for Stock (Net Worth Trend) */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="accumulatedNet"
                            stroke="var(--color-accumulatedNet)"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-accumulatedNet)" }}
                        />
                    </ComposedChart>
                </ChartContainer>
            </div>
        </div>
    );
}

