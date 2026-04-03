'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coffee, Pizza, CalendarDays, Zap } from '@/lib/icons';
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
        { name: 'Hari Kerja', value: data.weekdayAvg, color: 'hsl(var(--teal-500))' },
        { name: 'Akhir Pekan', value: data.weekendAvg, color: 'hsl(var(--orange-500))' },
    ];

    const isWeekendHeavy = data.weekendAvg > data.weekdayAvg;

    return (
        <Card className="p-7 border-none rounded-card-glass bg-card shadow-none border border-border/40 relative overflow-hidden group">
            {/* Ambient Background Ornament */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-700 rounded-full blur-2xl -z-0" />

            <div className="flex justify-between items-center mb-10 z-10 relative">
                <div className="space-y-1">
                    <h3 className="text-label text-muted-foreground/40 flex items-center gap-2">
                        <CalendarDays className="w-3.5 h-3.5" />
                        Behavioral analytics
                    </h3>
                    <p className="text-xl font-bold tracking-tight text-foreground/90">Work-Life Spending Hub</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10 items-end">
                {/* Weekday vs Weekend Chart */}
                <div className="space-y-6">
                    <div className="h-[200px] w-full">
                        <ChartContainer config={{ value: { label: 'Average', color: 'hsl(var(--chart-2))' } }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        style={{ fontSize: '12px', fontWeight: 600, fill: 'hsl(var(--muted-foreground))' }}
                                    />
                                    <YAxis hide />
                                    <Bar dataKey="value" radius={[12, 12, 4, 4]} barSize={50} animationBegin={300} animationDuration={1500}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                </div>

                {/* Behavioral Insights */}
                <div className="space-y-5">
                    <div className="p-5 rounded-card-glass bg-secondary/40 border border-border/50 backdrop-blur-md flex items-center gap-4 group/insight">
                        <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center border border-warning/20 group-hover/insight:bg-warning/20 transition-colors">
                            <Zap className="h-6 w-6 text-warning" />
                        </div>
                        <div className="flex-1">
                            <p className="text-label text-muted-foreground/40 mb-1">Laju pengeluaran gaji</p>
                            <p className="text-sm font-bold tracking-tight text-foreground/80">50% Gaji habis dalam <span className="text-warning">{data.paydayDrainDays} Hari</span></p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-card-glass bg-muted/20 border border-border/10 space-y-2 hover:bg-muted/30 transition-all">
                            <div className="flex items-center gap-2 text-muted-foreground/40">
                                <Coffee className="h-3.5 w-3.5" />
                                <span className="text-label">Favorit kerja</span>
                            </div>
                            <p className="text-xs font-bold truncate text-foreground/80">{data.topWeekdayCategory}</p>
                        </div>
                        <div className="p-4 rounded-card-glass bg-muted/20 border border-border/10 space-y-2 hover:bg-muted/30 transition-all">
                            <div className="flex items-center gap-2 text-muted-foreground/40">
                                <Pizza className="h-3.5 w-3.5" />
                                <span className="text-label">Favorit rumah</span>
                            </div>
                            <p className="text-xs font-bold truncate text-foreground/80">{data.topWeekendCategory}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}



