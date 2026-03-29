'use client';

import React from 'react';
import { Gauge, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
    let colorClass = "text-warning";
    let message = "Pertahankan!";

    if (savingsRate <= -50) {
        status = "Kritis";
        colorClass = "text-error";
        message = "Perlu perbaikan segera";
    } else if (savingsRate < 0) {
        status = "Boros";
        colorClass = "text-orange-500"; // Specific non-semantic for orange mid-state
        message = "Kurangi pengeluaran";
    } else if (savingsRate >= 0 && savingsRate < 20) {
        status = "Stabil";
        colorClass = "text-warning";
        message = "Cukup aman";
    } else if (savingsRate >= 20 && savingsRate < 50) {
        status = "Sehat";
        colorClass = "text-success";
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
        <Card className="p-7 bg-card border-none rounded-card-glass shadow-none border border-border/40 flex flex-col justify-between h-full relative overflow-hidden group">
            {/* Ambient Background Ornament */}
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 rounded-full blur-2xl -z-0",
                savingsRate < 0 ? "from-rose-500 to-orange-500" : "from-emerald-500 to-teal-500"
            )} />

            <div className="flex justify-between items-start mb-6 z-10">
                <div className="space-y-1">
                    <h3 className="text-label text-muted-foreground/40 flex items-center gap-2">
                        <Gauge className="w-3.5 h-3.5" />
                        Health index
                    </h3>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 relative z-10 pt-2">
                <div className="relative w-full aspect-[2/1] max-w-[220px] mb-2">
                    {/* SVG Gauge */}
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 200 110">
                        {/* ... (rest of path logic remains same but with improved strokes) ... */}
                        <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(var(--rose-500))" /> 
                                <stop offset="50%" stopColor="hsl(var(--yellow-500))" />
                                <stop offset="100%" stopColor="hsl(var(--emerald-500))" />
                            </linearGradient>
                        </defs>

                        <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="12"
                            strokeLinecap="round"
                            className="text-muted/30"
                        />

                        <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="url(#gaugeGradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeOpacity="0.8"
                        />

                        <g className="transition-transform duration-1000 ease-out" style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '100px 100px' }}>
                            <path d="M 100 100 L 98 100 L 100 30 L 102 100 Z" fill="currentColor" className="text-foreground" />
                            <circle cx="100" cy="100" r="6" className="fill-foreground" />
                        </g>
                    </svg>
                </div>

                <div className="text-center mt-2">
                    <div className={cn("text-5xl font-bold tracking-tighter tabular-nums mb-1", colorClass)}>
                        {savingsRate > 999 || savingsRate < -999 ?
                            (savingsRate / 100).toFixed(1) + 'x' :
                            (Math.abs(savingsRate) >= 10 ? Math.round(savingsRate) : savingsRate.toFixed(1)) + '%'
                        }
                    </div>
                    <div className={cn("inline-flex px-3 py-1 rounded-full text-label border border-current opacity-70 mb-2", colorClass)}>
                        {status}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/50 text-center">
                <p className="text-label text-muted-foreground opacity-60">
                    {message}
                </p>
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
        <Card className="group p-5 bg-card border-none rounded-card-glass shadow-none border border-border/40 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            {/* Subtle Gradient Accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full -mr-10 -mt-10" />
            
            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="p-2.5 bg-secondary/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-300 rounded-lg shadow-sm">
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-label",
                        trend.value < 0 ? "bg-success/10 text-success" : "bg-error/10 text-error"
                    )}>
                        {trend.value > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(trend.value).toFixed(0)}%
                    </div>
                )}
            </div>
            
            <div className="relative z-10">
                <p className="text-label text-muted-foreground/50 mb-1.5">{title}</p>
                <p className="text-2xl font-bold tracking-tighter tabular-nums mb-1 text-foreground">
                    {value}
                </p>
                <div className="flex items-center gap-1.5 text-label text-muted-foreground/60">
                    <span className="w-1 h-1 rounded-full bg-border" />
                    {subtitle}
                </div>
            </div>
        </Card>
    );
}


