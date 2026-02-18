'use client';

import React from 'react';
import { Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function HealthGauge({ savingsRate }: { savingsRate: number }) {
    // 0 - 100 scale logic mapped to -50% to +50% range
    // < -50% = Kritis (Red)
    // -50% - 0% = Boros (Orange)
    // 0% - 20% = Stabil (Yellow)
    // 20% - 50% = Sehat (Emerald)
    // > 50% = Sangat Sehat (Green)

    let status = "Stabil";
    let colorClass = "text-amber-500";
    let message = "Pertahankan!";

    if (savingsRate <= -50) {
        status = "Kritis";
        colorClass = "text-rose-600";
        message = "Perlu perbaikan segera";
    } else if (savingsRate < 0) {
        status = "Boros";
        colorClass = "text-orange-500";
        message = "Kurangi pengeluaran";
    } else if (savingsRate >= 0 && savingsRate < 20) {
        status = "Stabil";
        colorClass = "text-amber-500";
        message = "Cukup aman";
    } else if (savingsRate >= 20 && savingsRate < 50) {
        status = "Sehat";
        colorClass = "text-emerald-500";
        message = "Kondisi finansial baik";
    } else {
        status = "Sangat Sehat";
        colorClass = "text-emerald-600";
        message = "Finansial prima!";
    }

    // Gauge Clamp logic
    const clampedRate = Math.min(Math.max(savingsRate, -50), 50);
    // Map -50..50 to 0..180 degrees
    const rotation = (clampedRate + 50) * 1.8;

    return (
        <Card className="p-6 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm flex flex-col justify-between h-full relative overflow-hidden">

            <div className="flex justify-between items-start mb-4 z-10">
                <h3 className="text-lg font-medium tracking-tight flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-zinc-500" />
                    Kesehatan
                </h3>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 relative z-10">
                <div className="relative w-48 h-24">
                    {/* SVG Gauge */}
                    <svg className="w-full h-full" viewBox="0 0 200 100">
                        {/* Definitions for gradients */}
                        <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ef4444" />   {/* Red */}
                                <stop offset="50%" stopColor="#f59e0b" />  {/* Amber */}
                                <stop offset="100%" stopColor="#10b981" /> {/* Emerald */}
                            </linearGradient>
                        </defs>

                        {/* Background Track (Grey) */}
                        <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="#e4e4e7" /* zinc-200 */
                            strokeWidth="24"
                            strokeLinecap="round"
                            className="dark:stroke-zinc-800"
                        />

                        {/* Semantic Segments (Optional: replacing gradient with distinct zones if requested, but gradient is nicer) */}
                        {/* Let's use a dynamic arc that follows the value or just a static colored track */}
                        {/* Design Decision: Static colored track looks best for 'gauge' context */}
                        <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="url(#gaugeGradient)"
                            strokeWidth="24"
                            strokeLinecap="round"
                            strokeOpacity="0.3"
                        />

                        {/* Active Arc (Progress) - Optional, but let's stick to Needle for speedometer look */}

                        {/* Needle */}
                        <g className="transition-transform duration-1000 ease-out origin-bottom" style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '100px 100px' }}>
                            <path d="M 100 100 L 70 100 L 100 20 L 130 100 Z" fill="currentColor" className="text-zinc-800 dark:text-zinc-100 opacity-0" /> {/* Hidden visual helper */}
                            <circle cx="100" cy="100" r="6" className="fill-zinc-800 dark:fill-zinc-100" />
                            <path d="M 100 100 L 100 15" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-zinc-800 dark:text-zinc-100" />
                        </g>
                    </svg>

                    {/* Value readout overlay */}
                    <div className="absolute -bottom-6 left-0 w-full text-center">
                        <span className={cn("text-3xl font-bold tracking-tighter tabular-nums", colorClass)}>
                            {rotation > 0 && rotation < 180 ? '' : ''}{/* spacer */}
                            {savingsRate > 999 || savingsRate < -999 ?
                                (savingsRate / 100).toFixed(1) + 'x' : // Show multiplier for extreme values
                                savingsRate.toFixed(1) + '%'
                            }
                        </span>
                    </div>
                </div>

                <div className="mt-8 text-center space-y-1">
                    <p className={cn("text-lg font-semibold uppercase tracking-widest", colorClass)}>{status}</p>
                    <p className="text-sm text-muted-foreground font-medium">
                        {message}
                    </p>
                </div>
            </div>

            {/* Background decoration */}
            <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full blur-3xl -z-0",
                savingsRate < 0 ? "from-red-500 to-orange-500" : "from-emerald-500 to-teal-500"
            )} />
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
            <p className="text-2xl font-medium tabular-nums mb-1">{value}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>
        </Card>
    );
}

