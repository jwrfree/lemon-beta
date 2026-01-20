'use client';

import React from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';

interface DashboardChartProps {
    data: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const displayLabel = payload[0]?.payload?.label || label;
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="text-[10px] uppercase text-muted-foreground mb-1">{displayLabel}</div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground">Pemasukan</span>
                        <span className="font-bold text-green-500">
                            {formatCurrency(payload[0].value)}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-muted-foreground">Pengeluaran</span>
                        <span className="font-bold text-red-500">
                            {formatCurrency(payload[1].value)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export const DashboardChart = ({ data }: DashboardChartProps) => {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} barCategoryGap={2}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        minTickGap={30}
                        tickFormatter={(value) => {
                            try {
                                return format(parseISO(value), 'd MMM', { locale: dateFnsLocaleId });
                            } catch (e) {
                                return value;
                            }
                        }}
                    />
                    <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                        tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}jt`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="income" fill="hsl(var(--green-500))" radius={[4, 4, 0, 0]} stackId="a" maxBarSize={52} className="fill-green-500" />
                    <Bar dataKey="expense" fill="hsl(var(--red-500))" radius={[4, 4, 0, 0]} stackId="a" maxBarSize={52} className="fill-red-500" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DashboardChart;
