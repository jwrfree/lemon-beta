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
        <Card className="p-6 border-none rounded-lg bg-card shadow-card">
            <h3 className="text-xl font-medium tracking-tight mb-6 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Analisis Perilaku
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Weekday vs Weekend Chart */}
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Rata-rata Harian</p>
                            <p className="text-sm font-medium">
                                {isWeekendHeavy ? 'Akhir pekan lebih boros' : 'Hari kerja lebih boros'}
                            </p>
                        </div>
                    </div>

                    <div className="h-[180px] w-full">
                        <ChartContainer config={{ value: { label: 'Rata-rata', color: 'hsl(var(--chart-2))' } }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        style={{ fontSize: '11px', fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
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
                    <div className="p-4 rounded-lg bg-secondary border border-border flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-warning" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Payday Drain</p>
                            <p className="text-sm font-medium">50% Gaji Habis dalam <span className="text-warning font-bold">{data.paydayDrainDays} Hari</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg border border-border space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Coffee className="h-3 w-3" />
                                <span className="text-[9px] font-medium uppercase tracking-tighter">Top Weekday</span>
                            </div>
                            <p className="text-xs font-medium truncate">{data.topWeekdayCategory}</p>
                        </div>
                        <div className="p-3 rounded-lg border border-border space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground">
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

