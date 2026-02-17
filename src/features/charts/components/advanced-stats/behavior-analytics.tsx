'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coffee, Pizza, CalendarDays, Zap } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface BehaviorData {
    weekdayAvg: number;
    weekendAvg: number;
    paydayDrainDays: number; // How many days until 50% of income is spent
    topWeekdayCategory: string;
    topWeekendCategory: string;
}

export function BehaviorAnalytics({ data }: { data: BehaviorData }) {
    const chartData = [
        { name: 'Hari Kerja', value: data.weekdayAvg, color: 'var(--chart-2)' },
        { name: 'Akhir Pekan', value: data.weekendAvg, color: 'var(--chart-3)' },
    ];

    const isWeekendHeavy = data.weekendAvg > data.weekdayAvg;

    return (
        <Card className="p-6 border-zinc-200/60 dark:border-zinc-800/60 rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-sm">
            <h3 className="text-xl font-medium tracking-tight mb-6 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-500" />
                Analisis Perilaku
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Weekday vs Weekend Chart */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">Rata-rata Harian</p>
                            <p className="text-sm font-medium">
                                {isWeekendHeavy ? 'Akhir pekan lebih boros' : 'Hari kerja lebih boros'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="h-[180px] w-full">
                        <ChartContainer config={{ value: { label: 'Rata-rata', color: 'var(--chart-2)' } }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false}
                                        style={{ fontSize: '11px', fontWeight: 600 }}
                                    />
                                    <YAxis hide />
                                    <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
                                    <Bar dataKey="value" radius={[10, 10, 4, 4]} barSize={40}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                </div>

                {/* Behavioral Insights */}
                <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">Payday Drain</p>
                            <p className="text-sm font-medium">50% Gaji Habis dalam <span className="text-orange-600">{data.paydayDrainDays} Hari</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-2">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Coffee className="h-3 w-3" />
                                <span className="text-[9px] font-medium uppercase tracking-tighter">Top Weekday</span>
                            </div>
                            <p className="text-xs font-medium truncate">{data.topWeekdayCategory}</p>
                        </div>
                        <div className="p-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-2">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Pizza className="h-3 w-3" />
                                <span className="text-[9px] font-medium uppercase tracking-tighter">Top Weekend</span>
                            </div>
                            <p className="text-xs font-medium truncate">{data.topWeekendCategory}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

