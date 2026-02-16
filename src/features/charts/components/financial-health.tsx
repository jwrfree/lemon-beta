'use client';

import React from 'react';
import { Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function HealthGauge({ savingsRate }: { savingsRate: number }) {
    // 0 - 100 scale.
    // > 20% = Good (Green)
    // 0 - 20% = Warning (Yellow)
    // < 0% = Danger (Red)

    const normalizedRate = Math.min(Math.max(savingsRate, -50), 50); // Clamp between -50% and 50% for display
    // Map -50..50 to 0..100
    const gaugeValue = normalizedRate + 50;

    let status = "Stabil";
    let colorClass = "text-amber-500";

    if (savingsRate > 20) {
        status = "Sehat";
        colorClass = "text-emerald-500";
    } else if (savingsRate < 0) {
        status = "Boros";
        colorClass = "text-rose-500";
    } else if (savingsRate > 0) {
        status = "Aman";
        colorClass = "text-blue-500";
    }

    return (
        <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold tracking-tight flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-zinc-500" />
                    Kesehatan
                </h3>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 py-2">
                <div className="relative w-32 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-t-full overflow-hidden">
                    {/* Gauge Segments */}
                    <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
                        <div className="w-1/3 h-full bg-rose-400 origin-bottom-right transform skew-x-12" />
                        <div className="w-1/3 h-full bg-amber-400" />
                        <div className="w-1/3 h-full bg-emerald-400" />
                    </div>
                    {/* Needle overlay masking */}
                    <div className="absolute inset-2 bg-white dark:bg-zinc-900 rounded-t-full z-10" />

                    {/* Needle */}
                    <div
                        className="absolute bottom-0 left-1/2 w-1 h-full bg-zinc-900 dark:bg-white origin-bottom z-20 transition-all duration-1000 ease-out"
                        style={{ transform: `rotate(${(gaugeValue / 100) * 180 - 90}deg) translateX(-50%)` }}
                    />
                </div>
                <div className="mt-4 text-center">
                    <p className={cn("text-xl font-bold uppercase tracking-wider", colorClass)}>{status}</p>
                    <p className="text-xs text-muted-foreground font-medium mt-1">
                        Tabungan: {savingsRate.toFixed(1)}%
                    </p>
                </div>
            </div>
        </Card>
    );
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend }: {
    title: string,
    value: string,
    subtitle: string,
    icon: React.ElementType,
    trend?: { value: number }
}) {
    return (
        <Card className="p-5 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                    <Icon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
                </div>
                {trend && (
                    <Badge variant="outline" className={cn(
                        "text-[10px] border-none bg-opacity-20",
                        trend.value < 0 ? "bg-emerald-500 text-emerald-600" : "bg-rose-500 text-rose-600"
                    )}>
                        {trend.value > 0 ? '+' : ''}{trend.value.toFixed(0)}%
                    </Badge>
                )}
            </div>
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">{title}</p>
            <p className="text-2xl font-semibold tabular-nums mb-1">{value}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </Card>
    );
}
