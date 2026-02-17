'use client';

import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Landmark, ShieldCheck } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface NetWorthData {
    month: string;
    assets: number;
    liabilities: number;
    netWorth: number;
}

export function NetWorthTrend({ data }: { data: NetWorthData[] }) {
    const currentNetWorth = data.length > 0 ? data[data.length - 1].netWorth : 0;
    const previousNetWorth = data.length > 1 ? data[data.length - 2].netWorth : 0;
    const growth = previousNetWorth !== 0 ? ((currentNetWorth - previousNetWorth) / Math.abs(previousNetWorth)) * 100 : 0;

    return (
        <Card className="p-6 border-zinc-200/60 dark:border-zinc-800/60 rounded-[2.5rem] bg-white dark:bg-zinc-900 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12 pointer-events-none">
                <Landmark className="h-40 w-40" />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 relative z-10">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-500" />
                        Kekayaan Bersih (Net Worth)
                    </h3>
                    <p className="text-sm text-muted-foreground">Tren akumulasi aset dikurangi beban</p>
                </div>
                <div className="text-right flex flex-col items-end">
                    <p className="text-3xl font-bold tracking-tighter tabular-nums">
                        {formatCurrency(currentNetWorth)}
                    </p>
                    <Badge
                        variant={growth >= 0 ? "default" : "destructive"}
                        className={cn("mt-1 rounded-lg", growth >= 0 && "bg-emerald-500 hover:bg-emerald-600")}
                    >
                        <TrendingUp className={cn("w-3 h-3 mr-1", growth < 0 && "rotate-180")} />
                        {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                    </Badge>
                </div>
            </div>

            <div className="h-[300px] w-full mt-4">
                <ChartContainer
                    config={{
                        netWorth: { label: 'Kekayaan Bersih', color: 'var(--chart-1)' },
                        assets: { label: 'Total Aset', color: 'var(--chart-2)' },
                        liabilities: { label: 'Total Liabilitas', color: 'var(--chart-4)' },
                    }}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tickMargin={10}
                                style={{ fontSize: '12px', fontWeight: 500 }}
                            />
                            <YAxis
                                hide
                            />
                            <Tooltip
                                content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />}
                            />
                            <Area
                                type="monotone"
                                dataKey="netWorth"
                                stroke="var(--chart-1)"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#netWorthGradient)"
                                animationDuration={1500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Aset</p>
                    <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(data[data.length - 1]?.assets || 0)}
                    </p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Liabilitas</p>
                    <p className="text-lg font-bold tabular-nums text-rose-600 dark:text-rose-400">
                        {formatCurrency(data[data.length - 1]?.liabilities || 0)}
                    </p>
                </div>
            </div>
        </Card>
    );
}
