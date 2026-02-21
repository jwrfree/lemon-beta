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
        <Card className="p-6 bg-card border-none rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex flex-col justify-between h-full relative overflow-hidden">

            <div className="flex justify-between items-start mb-4 z-10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Kesehatan
                </h3>
            </div>

            <div className="flex flex-col items-center justify-center flex-1 relative z-10">
                <div className="relative w-48 h-28 mb-4">
                    {/* SVG Gauge */}
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 200 110">
                        {/* Definitions for gradients */}
                        <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="hsl(var(--rose-500))" />
                                <stop offset="50%" stopColor="hsl(var(--yellow-500))" />
                                <stop offset="100%" stopColor="hsl(var(--emerald-500))" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Background Track (Muted) */}
                        <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="16"
                            strokeLinecap="round"
                        />

                        {/* Gradient Track */}
                        <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="url(#gaugeGradient)"
                            strokeWidth="16"
                            strokeLinecap="round"
                            strokeOpacity="0.8"
                            filter="url(#glow)"
                        />

                        {/* Needle */}
                        <g className="transition-transform duration-1000 ease-out origin-bottom" style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '100px 100px' }}>
                            {/* Needle Body */}
                            <path d="M 100 100 L 97 100 L 100 35 L 103 100 Z" fill="currentColor" className="text-foreground" />
                            {/* Center Cap */}
                            <circle cx="100" cy="100" r="8" className="fill-foreground" />
                            <circle cx="100" cy="100" r="3" className="fill-card" />
                        </g>

                        {/* Center Tick helper */}
                        <line x1="100" y1="20" x2="100" y2="10" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="2 2" className="opacity-50" />
                    </svg>

                    {/* Value readout overlay - Moved down to avoid needle overlap */}
                </div>

                <div className="mt-6 text-center">
                    <div className={cn("text-4xl font-bold tracking-tighter tabular-nums mb-1", colorClass)}>
                        {savingsRate > 999 || savingsRate < -999 ?
                            (savingsRate / 100).toFixed(1) + 'x' :
                            (Math.abs(savingsRate) >= 10 ? savingsRate.toFixed(0) : savingsRate.toFixed(1)) + '%'
                        }
                    </div>
                    <p className={cn("text-sm font-bold uppercase tracking-widest leading-none mb-1", colorClass)}>{status}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                        {message}
                    </p>
                </div>
            </div>

            {/* Background decoration */}
            <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-full blur-3xl -z-0",
                savingsRate < 0 ? "from-destructive to-warning" : "from-success to-primary"
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
        <Card className="p-5 bg-card border-none rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className="p-2 bg-secondary rounded-xl">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                {trend && (
                    <Badge variant="outline" className={cn(
                        "text-[10px] border-none font-bold",
                        trend.value < 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                    )}>
                        {trend.value > 0 ? '+' : ''}{trend.value.toFixed(0)}%
                    </Badge>
                )}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-2xl font-semibold tracking-tighter tabular-nums mb-1 text-foreground">{value}</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{subtitle}</p>
        </Card>
    );
}

