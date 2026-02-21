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
            color: 'text-emerald-400',
            bg: 'bg-[#064e3b]',
            accent: 'bg-emerald-500/20',
            glow: 'rgba(16, 185, 129, 0.3)',
            desc: 'Stable Flux'
        },
        Moderate: {
            color: 'text-amber-400',
            bg: 'bg-[#451a03]',
            accent: 'bg-amber-500/20',
            glow: 'rgba(245, 158, 11, 0.3)',
            desc: 'Moderate Drift'
        },
        Critical: {
            color: 'text-rose-400',
            bg: 'bg-[#450a0a]',
            accent: 'bg-rose-500/20',
            glow: 'rgba(244, 63, 94, 0.3)',
            desc: 'High Burn Risk'
        }
    };

    const config = levels[risk.level];

    return (
        <Card 
            className={cn(
                "relative overflow-hidden border-none shadow-2xl transition-all duration-500 rounded-[32px] text-white",
                config.bg
            )}
            style={{ boxShadow: `0 20px 50px -12px ${config.glow}` }}
        >
            <div className="absolute top-0 right-0 p-8 opacity-[0.05] -rotate-12 translate-x-4 -translate-y-4">
                <Sparkles className="h-40 w-40" />
            </div>
            <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/5 blur-3xl"></div>

            <div className="p-7 space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={cn("p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 shadow-inner")}>
                            <TrendingUp className={cn("h-6 w-6 text-white")} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Flux Momentum</p>
                            <h3 className="text-xl font-bold tracking-tighter text-white">Co-Pilot Insight</h3>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={refreshInsights}
                        className="h-10 w-10 hover:bg-white/10 rounded-full border border-white/5 backdrop-blur-sm"
                    >
                        <RefreshCw className="h-4 w-4 text-white/40" />
                    </Button>
                </div>

                <div className="flex items-end justify-between gap-6">
                    <div className="space-y-6 flex-1">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className={cn("text-5xl font-black tracking-tighter tabular-nums drop-shadow-sm", config.color)}>
                                    {risk.level}
                                </span>
                                <div className="h-2 w-2 rounded-full bg-white/20 animate-ping" />
                            </div>
                            <p className="text-sm font-semibold text-white/70 leading-relaxed italic pr-4">
                                "{risk.insight}"
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-[24px] bg-white/5 backdrop-blur-md border border-white/10 shadow-inner">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1.5">Burn Velocity</p>
                                <p className="text-sm font-bold tabular-nums text-white">{formatCurrency(risk.burnRate)}/h</p>
                            </div>
                            <div className="p-4 rounded-[24px] bg-white/5 backdrop-blur-md border border-white/10 shadow-inner">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40 mb-1.5">Momentum</p>
                                <p className="text-sm font-bold tabular-nums text-white">{(risk.velocity * 100).toFixed(0)}% <span className="text-[8px] font-medium opacity-40">RATIO</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden sm:block shrink-0">
                        {/* Vertical Score Bar */}
                        <div className="h-32 w-2 relative bg-white/10 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${risk.score}%` }}
                                className={cn("absolute bottom-0 left-0 w-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(255,255,255,0.3)]",
                                    risk.level === 'Low' ? 'bg-emerald-400' :
                                        risk.level === 'Moderate' ? 'bg-amber-400' :
                                            'bg-rose-400'
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-white/40" />
                        <span>Adaptive Risk Engine Active</span>
                    </div>
                </div>
            </div>
        </Card>
    );
    );
};
