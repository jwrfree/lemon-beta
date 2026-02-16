'use client';

import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Area, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Bar } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { DailyMetric } from '../types';

export function TrendAnalytics({ data }: { data: DailyMetric[] }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || data.length === 0) {
        return <div className="h-72 bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />;
    }

    return (
        <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold tracking-tight flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Analisis Harian
                    </h3>
                    <p className="text-xs text-muted-foreground">Pola pengeluaran 30 hari terakhir</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="secondary" className="text-[10px] font-bold">30 Hari</Badge>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={data}>
                    <defs>
                        <linearGradient id="expenseTrendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        fontSize={10}
                        tickFormatter={(value) => format(parseISO(value), 'd')}
                        tickMargin={10}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        stroke="#9ca3af"
                        fontSize={10}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#9ca3af"
                        fontSize={10}
                        axisLine={false}
                        tickLine={false}
                        width={20}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px'
                        }}
                        formatter={(value: any, name: string) => [
                            name === 'expense' ? formatCurrency(value) : value,
                            name === 'expense' ? 'Pengeluaran' : 'Frekuensi'
                        ]}
                        labelFormatter={(label) => format(parseISO(label as string), 'dd MMM yyyy')}
                    />
                    {/* Volume Bars (Frequency) */}
                    <Bar yAxisId="right" dataKey="count" name="count" fill="#e4e4e7" barSize={8} radius={[2, 2, 0, 0]} className="dark:fill-zinc-800" />

                    {/* Price Line (Amount) */}
                    <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="expense"
                        name="expense"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="url(#expenseTrendFill)"
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </Card>
    );
}
