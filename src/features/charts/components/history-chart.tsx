'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import type { MonthlyMetric } from '../types';

export function HistoryChart({ data }: { data: MonthlyMetric[] }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || data.length === 0) {
        return <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />;
    }

    return (
        <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        Riwayat 6 Bulan
                    </h3>
                    <p className="text-xs text-muted-foreground">Pemasukan vs Pengeluaran</p>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                    <XAxis
                        dataKey="month"
                        stroke="#9ca3af"
                        fontSize={10}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        fontSize={10}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                            backgroundColor: '#18181b',
                            border: '1px solid #27272a',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px'
                        }}
                        formatter={(value: any) => formatCurrency(value)}
                    />
                    <Bar dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}
