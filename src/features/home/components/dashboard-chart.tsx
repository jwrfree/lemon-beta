'use client';

import React from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
} from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ChartDataItem {
    date: string;
    income: number;
    expense: number;
}

interface DashboardChartProps {
    data: ChartDataItem[];
}

const chartConfig = {
    income: {
        label: "Pemasukan",
        color: "var(--primary)",
    },
    expense: {
        label: "Pengeluaran",
        color: "var(--destructive)",
    },
} satisfies ChartConfig;

export const DashboardChart = ({ data }: DashboardChartProps) => {
    return (
        <div className="h-[300px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart
                    accessibilityLayer
                    data={data}
                    margin={{
                        left: 0,
                        right: 0,
                        top: 10,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="var(--color-income)"
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--color-income)"
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                        <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop
                                offset="5%"
                                stopColor="var(--color-expense)"
                                stopOpacity={0.8}
                            />
                            <stop
                                offset="95%"
                                stopColor="var(--color-expense)"
                                stopOpacity={0.1}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis 
                        dataKey="label" 
                        stroke="var(--muted-foreground)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        minTickGap={30}
                    />
                    <YAxis 
                        stroke="var(--muted-foreground)" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}jt`}
                    />
                    <ChartTooltip 
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area
                        dataKey="expense"
                        type="monotone"
                        fill="url(#fillExpense)"
                        fillOpacity={0.4}
                        stroke="var(--color-expense)"
                        stackId="a"
                    />
                    <Area
                        dataKey="income"
                        type="monotone"
                        fill="url(#fillIncome)"
                        fillOpacity={0.4}
                        stroke="var(--color-income)"
                        stackId="b"
                    />
                </AreaChart>
            </ChartContainer>
        </div>
    );
};

export default DashboardChart;
