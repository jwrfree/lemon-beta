import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, TrendingUp, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useInsights } from '../hooks/use-insights';
import { Button } from '@/components/ui/button';

export const RiskScoreCard = () => {
    const { risk, isLoading, refreshInsights } = useInsights();

    if (isLoading) {
        return (
            <Card className="p-6 h-[200px] flex items-center justify-center border-none shadow-sm bg-card/50 backdrop-blur-md">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </Card>
        );
    }

    if (!risk) {
        return (
            <Card className="p-6 h-[180px] flex flex-col items-center justify-center border-dashed border-2 border-border bg-card/30 text-center space-y-3">
                <div className="p-3 rounded-full bg-primary/5 text-primary">
                    <Sparkles className="h-6 w-6 opacity-30" />
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-40">Co-Pilot sedang belajar</p>
                    <p className="text-[10px] text-muted-foreground max-w-[200px]">Catat beberapa transaksi lagi untuk melihat momentum keuanganmu.</p>
                </div>
            </Card>
        );
    }

    const levels = {
        Low: {
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            glow: 'shadow-emerald-500/10',
            desc: 'Kesehatan Aman'
        },
        Moderate: {
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            glow: 'shadow-amber-500/10',
            desc: 'Waspada Momentum'
        },
        Critical: {
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
            glow: 'shadow-rose-500/10',
            desc: 'Risiko Tinggi'
        }
    };

    const config = levels[risk.level];

    return (
        <Card className={cn(
            "relative overflow-hidden border-none shadow-xl transition-all duration-500",
            config.bg,
            config.glow
        )}>
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12 translate-x-4 -translate-y-4">
                <Sparkles className="h-40 w-40" />
            </div>

            <div className="p-6 space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl bg-white dark:bg-zinc-900 border", config.border)}>
                            <TrendingUp className={cn("h-5 w-5", config.color)} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Financial Co-Pilot</p>
                            <h3 className="text-lg font-bold tracking-tight">Status Momentum</h3>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={refreshInsights}
                        className="h-8 w-8 hover:bg-white/20 rounded-full"
                    >
                        <RefreshCw className="h-3.5 w-3.5 opacity-40" />
                    </Button>
                </div>

                <div className="flex items-end justify-between gap-4">
                    <div className="space-y-4 flex-1">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className={cn("text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br",
                                    risk.level === 'Low' ? 'from-emerald-400 to-emerald-600' :
                                        risk.level === 'Moderate' ? 'from-amber-400 to-amber-600' :
                                            'from-rose-400 to-rose-600'
                                )}>
                                    {risk.level}
                                </span>
                            </div>
                            <p className="text-sm font-medium opacity-60 leading-relaxed">
                                "{risk.insight}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="p-3 rounded-xl bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/5">
                                <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1">Burn Rate</p>
                                <p className="text-xs font-bold tabular-nums">{formatCurrency(risk.burnRate)}/h</p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/40 dark:bg-black/20 border border-white/40 dark:border-white/5">
                                <p className="text-[9px] font-bold uppercase tracking-widest opacity-40 mb-1">Velocity</p>
                                <p className="text-xs font-bold tabular-nums">{(risk.velocity * 100).toFixed(0)}% dari normal</p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:block shrink-0">
                        {/* Simple Visual Score Indicator */}
                        <div className="h-24 w-2 w-2 relative bg-black/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${risk.score}%` }}
                                className={cn("absolute bottom-0 left-0 w-full rounded-full transition-all duration-1000",
                                    risk.level === 'Low' ? 'bg-emerald-500' :
                                        risk.level === 'Moderate' ? 'bg-amber-500' :
                                            'bg-rose-500'
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest opacity-40 pt-2 border-t border-black/5">
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Real-time Risk Analysis Enabled</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};
