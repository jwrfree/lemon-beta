import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInsights } from '../hooks/use-insights';

interface PocketCoPilotProps {
    className?: string;
    showBurnRate?: boolean;
}

export const PocketCoPilot = ({ className, showBurnRate = false }: PocketCoPilotProps) => {
    const { risk, isLoading } = useInsights();

    if (isLoading || !risk) return null;

    const riskConfigs = {
        Low: {
            icon: ShieldCheck,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            label: 'Safe Pattern'
        },
        Moderate: {
            icon: Zap,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            label: 'Velocity Rising'
        },
        Critical: {
            icon: AlertTriangle,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
            label: 'High Risk'
        }
    };

    const config = riskConfigs[risk.level];
    const Icon = config.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                    "p-4 rounded-lg border flex flex-col gap-3 shadow-card",
                    config.bg,
                    config.border,
                    className
                )}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-md bg-card/50 shadow-sm", config.color)}>
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest opacity-60">Pocket Co-Pilot</p>
                            <p className={cn("text-xs font-semibold", config.color)}>{config.label}</p>
                        </div>
                    </div>
                    {showBurnRate && (
                        <div className="text-right">
                            <p className="text-xs font-semibold uppercase tracking-widest opacity-40">Burn Rate</p>
                            <p className="text-xs font-semibold tabular-nums">
                                Rp {new Intl.NumberFormat('id-ID').format(risk.burnRate)}/hari
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 items-start">
                    <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", config.color)} />
                    <p className="text-xs leading-relaxed font-medium opacity-80">
                        {risk.insight}
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
