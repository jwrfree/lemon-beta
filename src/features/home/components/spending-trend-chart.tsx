'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction } from '@/types/models';
import { formatCurrency } from '@/lib/utils';

interface SpendingTrendChartProps {
    transactions: Transaction[];
    days?: number;
}

export const SpendingTrendChart = ({ transactions, days = 14 }: SpendingTrendChartProps) => {
    const data = useMemo(() => {
        const today = new Date();
        const startDate = subDays(today, days - 1);

        // Generate all dates in range
        const dates = eachDayOfInterval({ start: startDate, end: today });

        return dates.map(date => {
            const dayTransactions = transactions.filter(t =>
                t.type === 'expense' &&
                isSameDay(new Date(t.date), date)
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
                <CardTitle className="text-base font-bold flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-rose-500" />
                    Tren Pengeluaran
                </CardTitle>
                <span className="text-[10px] bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-1 rounded-full font-bold">
                    {days} Hari Terakhir
                </span>
            </CardHeader>
            <CardContent className="px-5 h-[200px]">
                <div className="w-full h-full bg-white dark:bg-card/50 rounded-2xl p-2 border border-border/50 shadow-sm">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                axisLine={false}
                                tickLine={false}
                                interval={2}
                                dy={10}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: "compact" }).format(value)}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    color: '#000'
                                }}
                                formatter={(value: number) => [formatCurrency(value), 'Pengeluaran']}
                                labelStyle={{ color: '#6B7280', fontSize: '10px', marginBottom: '4px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#f43f5e"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorAmount)"
                                activeDot={{ r: 4, strokeWidth: 0, fill: '#f43f5e' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
