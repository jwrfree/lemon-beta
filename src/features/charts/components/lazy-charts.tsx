'use client';

import React from 'react';
import {
    Area,
    AreaChart as RechartsAreaChart,
    Bar,
    BarChart as RechartsBarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Line,
    Pie,
    PieChart,
    ReferenceLine,
    XAxis,
    YAxis,
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';

const compactCurrencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    notation: 'compact',
    maximumFractionDigits: 1,
});

// 1. Category Pie Chart
export const CategoryPieChart = ({ chartData, chartConfig }: { chartData: any[], chartConfig: any }) => (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-56 w-full max-w-[260px]">
        <PieChart>
            <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} hideLabel />}
            />
            <Pie 
                data={chartData} 
                dataKey="value" 
                nameKey="name" 
                innerRadius="60%" 
                strokeWidth={3}
                cornerRadius={4}
            >
                {chartData.map((entry) => (
                    <Cell
                        key={`cell-${entry.name}`}
                        fill={entry.fill}
                        stroke="hsl(var(--background))"
                        strokeWidth={2}
                    />
                ))}
            </Pie>
        </PieChart>
    </ChartContainer>
);

// 2. Expense Trend Chart (Area or Bar)
export const ExpenseTrendChart = ({ 
    chartType, 
    filteredData, 
    gradientId, 
    peakDayKey 
}: { 
    chartType: 'area' | 'bar', 
    filteredData: any[], 
    gradientId: string,
    peakDayKey?: string 
}) => (
    <ChartContainer
        config={{ total: { label: 'Pengeluaran', color: 'hsl(var(--chart-2))' } } as any}
        className="h-full w-full"
    >
        {chartType === 'area' ? (
            <RechartsAreaChart data={filteredData} margin={{ left: 0, right: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="shortLabel" tickLine={false} axisLine={false} tickMargin={10} minTickGap={14} />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={72}
                    tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
                />
                <ChartTooltip
                    cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, opacity: 0.6 }}
                    content={
                        <ChartTooltipContent
                            formatter={(value) => formatCurrency(Number(value))}
                            labelFormatter={(label, payload) => payload?.[0]?.payload.fullLabel ?? label}
                        />
                    }
                />
                <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(var(--chart-2))"
                    fill={`url(#${gradientId})`}
                    strokeWidth={2.5}
                    activeDot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--chart-2))' }}
                />
            </RechartsAreaChart>
        ) : (
            <RechartsBarChart data={filteredData} barCategoryGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="shortLabel" tickLine={false} axisLine={false} tickMargin={10} minTickGap={14} />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={72}
                    tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
                />
                <ChartTooltip
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.35 }}
                    content={
                        <ChartTooltipContent
                            formatter={(value) => formatCurrency(Number(value))}
                            labelFormatter={(label, payload) => payload?.[0]?.payload.fullLabel ?? label}
                        />
                    }
                />
                <Bar dataKey="total" radius={[8, 8, 4, 4]}>
                    {filteredData.map((item) => (
                        <Cell
                            key={item.key}
                            fill="hsl(var(--chart-2))"
                            fillOpacity={peakDayKey === item.key ? 1 : 0.6}
                        />
                    ))}
                </Bar>
            </RechartsBarChart>
        )}
    </ChartContainer>
);

// 3. Monthly Trend Chart
export const MonthlyBarChart = ({ data, gradientId, sectionLabel }: { data: any[], gradientId: string, sectionLabel: string }) => (
    <ChartContainer
        config={{ total: { label: sectionLabel, color: 'hsl(var(--primary))' } } as any}
        className="h-full w-full"
    >
        <RechartsBarChart data={data} barCategoryGap={12}>
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis dataKey="shortLabel" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis
                tickLine={false}
                axisLine={false}
                width={68}
                tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
            />
            <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.35 }}
                content={
                    <ChartTooltipContent
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(label, payload) => payload?.[0]?.payload.fullLabel ?? label}
                    />
                }
            />
            <Bar dataKey="total" fill={`url(#${gradientId})`} radius={[8, 8, 4, 4]} />
        </RechartsBarChart>
    </ChartContainer>
);

// 4. Net Cashflow Composed Chart
export const NetCashflowComposedChart = ({ 
    filteredData, 
    selectedMonthKey, 
    onMonthClick 
}: { 
    filteredData: any[], 
    selectedMonthKey: string | null,
    onMonthClick: (key: string) => void
}) => (
    <ChartContainer
        config={
            {
                income: { label: 'Pemasukan', color: 'hsl(var(--chart-1))' },
                expense: { label: 'Pengeluaran', color: 'hsl(var(--destructive))' },
                net: { label: 'Arus Kas', color: 'hsl(var(--chart-2))' },
            } as any
        }
        className="h-full w-full"
    >
        <ComposedChart
            data={filteredData}
            barCategoryGap={18}
            onClick={(state) => {
                const payload = state?.activePayload?.[0]?.payload as any;
                if (payload?.key) {
                    onMonthClick(payload.key);
                }
            }}
        >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis dataKey="shortLabel" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis
                tickLine={false}
                axisLine={false}
                width={68}
                tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
            />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.25 }}
                content={
                    <ChartTooltipContent
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(label, payload) => payload?.[0]?.payload.fullLabel ?? label}
                    />
                }
            />
            <Bar dataKey="income" radius={[6, 6, 4, 4]} maxBarSize={26}>
                {filteredData.map((item) => (
                    <Cell
                        key={`${item.key}-income`}
                        fill="var(--color-income)"
                        fillOpacity={selectedMonthKey === item.key ? 1 : 0.55}
                    />
                ))}
            </Bar>
            <Bar dataKey="expense" radius={[6, 6, 4, 4]} maxBarSize={26}>
                {filteredData.map((item) => (
                    <Cell
                        key={`${item.key}-expense`}
                        fill="var(--color-expense)"
                        fillOpacity={selectedMonthKey === item.key ? 1 : 0.55}
                    />
                ))}
            </Bar>
            <Line
                type="monotone"
                dataKey="net"
                stroke="var(--color-net)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: 'var(--color-net)' }}
            />
        </ComposedChart>
    </ChartContainer>
);
