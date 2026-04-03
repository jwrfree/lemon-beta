'use client';

import React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Landmark, ShieldCheck } from '@/lib/icons';
import { formatCurrency, cn } from '@/lib/utils';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface NetWorthData {
 month: string;
 assets: number;
 liabilities: number;
 netWorth: number;
}

const chartConfig = {
 netWorth: { label: 'Kekayaan Bersih', color: 'var(--chart-1)'},
 assets: { label: 'Total Aset', color: 'var(--chart-2)'},
 liabilities: { label: 'Total Liabilitas', color: 'var(--chart-4)'},
} satisfies ChartConfig;

export function NetWorthTrend({ data }: { data: NetWorthData[] }) {
 const currentNetWorth = data.length > 0 ? data[data.length - 1].netWorth : 0;
 const previousNetWorth = data.length > 1 ? data[data.length - 2].netWorth : 0;
 const growth = previousNetWorth !== 0 ? ((currentNetWorth - previousNetWorth) / Math.abs(previousNetWorth)) * 100 : 0;

 return (
 <Card className="p-7 border-none rounded-card-premium bg-teal-900 text-white shadow-none border border-border/40 overflow-hidden relative">
 {/* Ambient Background Ornaments */}
 <div className="absolute top-0 right-0 p-8 opacity-[0.05] -rotate-12 pointer-events-none">
 <Landmark className="h-40 w-40"/>
 </div>
 <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-[80px]"></div>

 <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 relative z-10">
 <div className="space-y-1.5">
 <h3 className="text-display-sm tracking-tight flex items-center gap-2.5">
 <ShieldCheck className="w-5 h-5 text-emerald-400"/>
 Net Worth Flow
 </h3>
 <p className="text-label-md text-white/40">Equity accumulation trend</p>
 </div>
 <div className="flex flex-col items-start md:items-end gap-2">
 <p className="text-display-lg tracking-tighter tabular-nums drop-">
 {formatCurrency(currentNetWorth)}
 </p>
 <Badge
 className={cn(
 "rounded-full px-2.5 py-0.5 border-none text-label-md", 
 growth >= 0 ? "bg-emerald-500/20 text-emerald-300": "bg-rose-500/20 text-rose-300"
 )}
 >
 <TrendingUp className={cn("w-3 h-3 mr-1.5", growth < 0 && "rotate-180")} />
 {growth >= 0 ? '+': ''}{growth.toFixed(1)}%
 </Badge>
 </div>
 </div>

 <div className="h-[280px] w-full mt-4 relative z-10">
 <ChartContainer config={chartConfig} className="h-full w-full">
 <AreaChart
 accessibilityLayer
 data={data}
 margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
 >
 <defs>
 <linearGradient id="netWorthGradient"x1="0"y1="0"x2="0"y2="1">
 <stop offset="5%"stopColor="white"stopOpacity={0.3} />
 <stop offset="95%"stopColor="white"stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3"vertical={false} stroke="white"opacity={0.1} />
 <XAxis
 dataKey="month"
 axisLine={false}
 tickLine={false}
 tickMargin={10}
 tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--gray-50) / 0.4)'}}
 />
 <YAxis hide />
 <ChartTooltip
 cursor={{ stroke: 'hsl(var(--gray-50) / 0.2)', strokeWidth: 2, strokeDasharray: '4 4'}}
 content={<ChartTooltipContent indicator="line"className="bg-popover/90 backdrop-blur-xl border-none shadow-xl rounded-card"formatter={(value) => formatCurrency(Number(value))} />}
 />
 <Area
 dataKey="netWorth"
 type="monotone"
 stroke="white"
 strokeWidth={4}
 fillOpacity={1}
 fill="url(#netWorthGradient)"
 activeDot={{ r: 6, strokeWidth: 0, fill: "white"}}
 />
 </AreaChart>
 </ChartContainer>
 </div>

 <div className="grid grid-cols-2 gap-6 mt-10 pt-8 border-t border-white/10 relative z-10">
 <div className="bg-white/5 backdrop-blur-md p-4 rounded-card-glass border border-white/10">
 <span className="text-label-md text-white/40 mb-1.5 flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"/>
 Assets
 </span>
 <p className="text-display-sm tabular-nums tracking-tighter">
 {formatCurrency(data[data.length - 1]?.assets || 0)}
 </p>
 </div>
 <div className="bg-white/5 backdrop-blur-md p-4 rounded-card-glass border border-white/10 text-right">
 <span className="text-label-md text-white/40 mb-1.5 flex items-center justify-end gap-2">
 Liabilities
 <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0"/>
 </span>
 <p className="text-display-sm tabular-nums tracking-tighter">
 {formatCurrency(data[data.length - 1]?.liabilities || 0)}
 </p>
 </div>
 </div>
 </Card>
 );
}



