'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, CartesianGrid } from 'recharts';
import { format, subDays, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Transaction } from '@/types/models';
import { formatCurrency, triggerHaptic } from '@/lib/utils';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface SpendingTrendChartProps {
    transactions: Transaction[];
    days?: number;
}

const chartConfig = {
    amount: {
        label: "Pengeluaran",
        color: "var(--destructive)",
    },
} satisfies ChartConfig;

export const SpendingTrendChart = ({ transactions, days = 14 }: SpendingTrendChartProps) => {
    const data = useMemo(() => {
        const today = new Date();
        const startDate = subDays(today, days - 1);

        // Generate all dates in range
        const dates = eachDayOfInterval({ start: startDate, end: today });

        return dates.map(date => {
            const dayTransactions = transactions.filter(t =>
                t.type === 'expense' &&
                isSameDay(parseISO(t.date), date)
            );

            const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

            return {
                date: format(date, 'd MMM', { locale: id }),
                fullDate: format(date, 'yyyy-MM-dd'),
                amount: total
            };
        });
    }, [transactions, days]);

    // Safety check: if no transactions at all, we still show the empty grid
    if (!transactions) return null;

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-5 pb-2 pt-0 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2 text-foreground">
                    <TrendingUp className="h-4 w-4 text-destructive" />
                    Tren Pengeluaran
                </CardTitle>
                <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-1 rounded-full font-medium">
                    {days} Hari Terakhir
                </span>
            </CardHeader>
            <CardContent className="px-5">
                <ChartContainer 
                    config={chartConfig} 
                    className="h-[200px] w-full"
                    onTouchStart={() => triggerHaptic('light')}
                >
                    <AreaChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                        onMouseMove={(state) => {
                            if (state.isTooltipActive) {
                                // Debounce or throttle could be added if too intense, 
                                // but light haptic on move feels responsive.
                                // triggerHaptic('selection'); // Too frequent?
                                // Only trigger if index changed
                            }
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            interval={2}
                            tickFormatter={(value) => value}
                        />
                        <ChartTooltip
                            cursor={{ stroke: 'var(--color-amount)', strokeWidth: 1, strokeDasharray: '4 4' }}
                            content={<ChartTooltipContent hideLabel indicator="line" formatter={(value) => formatCurrency(Number(value))} />}
                        />
                        <defs>
                            <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop
                                    offset="5%"
                                    stopColor="var(--color-amount)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-amount)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <Area
                            dataKey="amount"
                            type="monotone"
                            fill="url(#fillAmount)"
                            fillOpacity={0.4}
                            stroke="var(--color-amount)"
                            stackId="a"
                            activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-amount)' }}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
};

