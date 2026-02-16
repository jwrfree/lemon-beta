'use client';

import React from 'react';
import {
    ComposedChart,
    Line,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area
} from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

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
                    <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        Cashflow & Net Worth Trend
                    </h3>
                    <p className="text-sm text-zinc-500">Korelasi Pemasukan, Pengeluaran, dan Akumulasi Saldo</p>
                </div>
            </div>

            <div className="h-[350px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={data}
                        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} opacity={0.5} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(str) => {
                                const date = parseISO(str);
                                return format(date, 'd MMM');
                            }}
                            stroke="#71717a"
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#71717a"
                            tickFormatter={(value) => `${value / 1000}k`}
                            tickLine={false}
                            axisLine={false}
                            dx={-10}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#3b82f6"
                            tickFormatter={(value) => `${value / 1000}k`}
                            tickLine={false}
                            axisLine={false}
                            dx={10}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 text-sm">
                                            <p className="font-semibold mb-2">{format(parseISO(label), 'EEEE, d MMMM yyyy')}</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between gap-8 text-emerald-600">
                                                    <span>Income:</span>
                                                    <span className="font-mono font-bold">
                                                        +{formatCurrency(payload.find(p => p.dataKey === 'income')?.value as number || 0)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between gap-8 text-rose-500">
                                                    <span>Expense:</span>
                                                    <span className="font-mono font-bold">
                                                        -{formatCurrency(payload.find(p => p.dataKey === 'expense')?.value as number || 0)}
                                                    </span>
                                                </div>
                                                <div className="border-t border-zinc-200 dark:border-zinc-800 my-2 pt-2 flex justify-between gap-8 text-blue-500">
                                                    <span>Net Balance:</span>
                                                    <span className="font-mono font-bold">
                                                        {formatCurrency(payload.find(p => p.dataKey === 'accumulatedNet')?.value as number || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />

                        {/* Bars for Flow */}
                        <Bar yAxisId="left" dataKey="income" name="Pemasukan" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.8} />
                        <Bar yAxisId="left" dataKey="expense" name="Pengeluaran" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.8} />

                        {/* Line for Stock (Net Worth Trend) */}
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="accumulatedNet"
                            name="Saldo Berjalan"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
