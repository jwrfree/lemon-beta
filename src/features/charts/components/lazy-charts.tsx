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
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { formatCurrency, cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const compactCurrencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    notation: 'compact',
    maximumFractionDigits: 1,
});

interface PieChartData {
    name: string;
    value: number;
    fill: string;
}

interface TrendChartData {
    shortLabel: string;
    total: number;
    isPeak?: boolean;
    [key: string]: string | number | boolean | undefined;
}

// 1. Category Pie Chart
export const CategoryPieChart = ({ chartData, chartConfig }: { chartData: PieChartData[], chartConfig: Record<string, { label: string; color: string }> }) => {
    const isMobile = useIsMobile();
    return (
        <ChartContainer 
            config={chartConfig} 
            className={cn(
                "mx-auto aspect-square w-full max-w-[260px]",
                isMobile ? "h-48" : "h-56"
            )}
        >
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
                            stroke="var(--background)"
                            strokeWidth={2}
                        />
                    ))}
                </Pie>
            </PieChart>
        </ChartContainer>
    );
};

// 2. Expense Trend Chart (Area or Bar)
export const ExpenseTrendChart = ({ 
    chartType, 
    filteredData, 
    gradientId, 
    peakDayKey 
}: { 
    chartType: 'area' | 'bar', 
    filteredData: TrendChartData[], 
    gradientId: string,
    peakDayKey?: string 
}) => {
    const isMobile = useIsMobile();
    return (
        <ChartContainer
            config={{ total: { label: 'Pengeluaran', color: 'var(--chart-2)' } }}
            className="h-full w-full"
        >
            {chartType === 'area' ? (
                <RechartsAreaChart data={filteredData} margin={{ left: -20, right: 10, bottom: 0, top: 10 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis 
                        dataKey="shortLabel" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={10} 
                        minTickGap={isMobile ? 20 : 14} 
                        style={{ fontSize: isMobile ? '10px' : '12px' }}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={isMobile ? 45 : 72}
                        tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
                        style={{ fontSize: isMobile ? '10px' : '12px' }}
                    />
                    <ChartTooltip
                        cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, opacity: 0.6 }}
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
                        stroke="var(--chart-2)"
                        fill={`url(#${gradientId})`}
                        strokeWidth={2.5}
                        activeDot={{ r: 4, strokeWidth: 2, fill: 'var(--chart-2)' }}
                    />
                </RechartsAreaChart>
            ) : (
                <RechartsBarChart data={filteredData} barCategoryGap={isMobile ? 4 : 8} margin={{ left: -20, right: 10, bottom: 0, top: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis 
                        dataKey="shortLabel" 
                        tickLine={false} 
                        axisLine={false} 
                        tickMargin={10} 
                        minTickGap={isMobile ? 20 : 14}
                        style={{ fontSize: isMobile ? '10px' : '12px' }}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={isMobile ? 45 : 72}
                        tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
                        style={{ fontSize: isMobile ? '10px' : '12px' }}
                    />
                    <ChartTooltip
                        cursor={{ fill: 'var(--muted)', opacity: 0.35 }}
                        content={
                            <ChartTooltipContent
                                formatter={(value) => formatCurrency(Number(value))}
                                labelFormatter={(label, payload) => payload?.[0]?.payload.fullLabel ?? label}
                            />
                        }
                    />
                    <Bar dataKey="total" radius={[8, 8, 4, 4]} maxBarSize={isMobile ? 32 : 52}>
                        {filteredData.map((item) => (
                            <Cell
                                key={item.key}
                                fill="var(--chart-2)"
                                fillOpacity={peakDayKey === item.key ? 1 : 0.6}
                            />
                        ))}
                    </Bar>
                </RechartsBarChart>
            )}
        </ChartContainer>
    );
};

interface MonthlyTrendData {
    shortLabel: string;
    fullLabel: string;
    total: number;
}

// 3. Monthly Trend Chart
export const MonthlyBarChart = ({ 
    data, 
    gradientId: propsGradientId, 
    sectionLabel,
    color 
}: { 
    data: MonthlyTrendData[], 
    gradientId: string, 
    sectionLabel: string,
    color?: string 
}) => {
    const id = React.useId();
    const gradientId = propsGradientId || `gradient-${id.replace(/:/g, '')}`;
    const isMobile = useIsMobile();
    
    return (
        <ChartContainer
            config={{ total: { label: sectionLabel, color: color || 'var(--primary)' } } satisfies ChartConfig}
            className="h-full w-full"
        >
            <RechartsBarChart data={data} barCategoryGap={isMobile ? 8 : 12} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-total)" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="var(--color-total)" stopOpacity={0.3} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis 
                    dataKey="shortLabel" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10} 
                    style={{ fontSize: isMobile ? '10px' : '12px' }}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={isMobile ? 45 : 68}
                    tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
                    style={{ fontSize: isMobile ? '10px' : '12px' }}
                />
                <ChartTooltip
                    cursor={{ fill: 'var(--muted)', opacity: 0.35 }}
                    content={
                        <ChartTooltipContent
                            formatter={(value) => formatCurrency(Number(value))}
                            labelFormatter={(label, payload) => payload?.[0]?.payload.fullLabel ?? label}
                        />
                    }
                />
                <Bar 
                    dataKey="total" 
                    fill={`url(#${gradientId})`} 
                    radius={[6, 6, 4, 4]}
                    strokeWidth={0}
                    maxBarSize={isMobile ? 32 : 52}
                />
            </RechartsBarChart>
        </ChartContainer>
    );
};

interface CashflowData {
    key: string;
    label: string;
    income: number;
    expense: number;
    net: number;
}

// 4. Net Cashflow Composed Chart
export const NetCashflowComposedChart = ({ 
    filteredData, 
    selectedMonthKey, 
    onMonthClick 
}: { 
    filteredData: CashflowData[], 
    selectedMonthKey: string | null,
    onMonthClick: (key: string) => void
}) => {
    const isMobile = useIsMobile();
    return (
        <ChartContainer
            config={
                {
                    income: { label: 'Pemasukan', color: 'var(--primary)' },
                    expense: { label: 'Pengeluaran', color: 'var(--destructive)' },
                    net: { label: 'Arus Kas', color: 'var(--chart-2)' },
                } satisfies ChartConfig
            }
            className="h-full w-full"
        >
            <ComposedChart
                data={filteredData}
                barCategoryGap={isMobile ? 10 : 18}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                onClick={(state) => {
                    const payload = state?.activePayload?.[0]?.payload as CashflowData;
                    if (payload?.key) {
                        onMonthClick(payload.key);
                    }
                }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis 
                    dataKey="shortLabel" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10} 
                    style={{ fontSize: isMobile ? '10px' : '12px' }}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={isMobile ? 45 : 68}
                    tickFormatter={(value) => compactCurrencyFormatter.format(Number(value))}
                    style={{ fontSize: isMobile ? '10px' : '12px' }}
                />
                <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="3 3" />
                                <ChartTooltip
                                    cursor={{ fill: 'var(--muted)', opacity: 0.25 }}                content={
                        <ChartTooltipContent
                            formatter={(value) => formatCurrency(Number(value))}
                            labelFormatter={(label, payload) => payload?.[0]?.payload.fullLabel ?? label}
                        />
                    }
                />
                <Bar dataKey="income" radius={[6, 6, 4, 4]} maxBarSize={isMobile ? 24 : 36}>
                    {filteredData.map((item) => (
                        <Cell
                            key={`${item.key}-income`}
                            fill="var(--color-income)"
                            fillOpacity={selectedMonthKey === item.key ? 1 : 0.55}
                        />
                    ))}
                </Bar>
                <Bar dataKey="expense" radius={[6, 6, 4, 4]} maxBarSize={isMobile ? 24 : 36}>
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
};
