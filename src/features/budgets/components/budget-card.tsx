'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/features/transactions/hooks/use-categories';
import { cn, formatCurrency, triggerHaptic, daysInMonth } from '@/lib/utils';
import { differenceInDays, startOfMonth } from 'date-fns';
import { Flame, AlertCircle, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import type { Budget, Transaction } from '@/types/models';

import { calculateBudgetStats } from '@/features/budgets/logic';

import { getVisualDNA, extractBaseColor } from '@/lib/visual-dna';

export const BudgetCard = ({ budget, transactions }: { budget: Budget, transactions: Transaction[] }) => {
    const { getCategoryVisuals } = useCategories();
    const router = useRouter();

    // 1. Core Logic (Centralized)
    const stats = useMemo(() => calculateBudgetStats(budget, transactions), [budget, transactions]);
    const { spent, remaining, progress, daysToZero, safeDailyLimit, healthStatus } = stats;

    const now = new Date();
    const daysInMonthValue = daysInMonth(now);
    const daysPassedPercentage = (now.getDate() / daysInMonthValue) * 100;

    // 2. DNA Identity
    const firstCategory = budget.categories[0] || 'Lainnya';
    const categoryVisuals = getCategoryVisuals(firstCategory);
    const dna = getVisualDNA(extractBaseColor(categoryVisuals.color));
    const CategoryIcon = categoryVisuals.icon as React.ElementType;

    // 3. Visual Configuration (Health Overrides)
    const healthStyles = {
        stable: {
            bar: 'bg-white',
            glow: 'shadow-[0_0_15px_rgba(255,255,255,0.3)]',
            text: 'text-white',
            bg: 'bg-white/20',
            label: 'On Track'
        },
        warning: {
            bar: 'bg-yellow-300',
            glow: 'shadow-[0_0_15px_rgba(253,224,71,0.4)]',
            text: 'text-yellow-300',
            bg: 'bg-yellow-400/20',
            label: 'Running Low'
        },
        critical: {
            bar: 'bg-rose-400',
            glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]',
            text: 'text-rose-300',
            bg: 'bg-rose-500/20',
            label: 'Warning'
        },
        over: {
            bar: 'bg-rose-500',
            glow: 'shadow-[0_0_20px_rgba(225,29,72,0.5)]',
            text: 'text-rose-200',
            bg: 'bg-rose-600/30',
            label: 'Exceeded'
        }
    } as const;

    const currentHealth = healthStyles[healthStatus];

    const handleCardClick = () => {
        triggerHaptic('light');
        router.push(`/budgeting/${budget.id}`);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-full"
        >
            <button
                onClick={handleCardClick}
                className="w-full h-full text-left focus:outline-none group"
            >
                <Card 
                    className="h-full overflow-hidden border-none rounded-[32px] shadow-2xl transition-all duration-500 relative"
                    style={{ 
                        background: dna.gradient,
                        boxShadow: `0 20px 40px -12px ${dna.ambient.replace('0.2', '0.4')}` 
                    }}
                >
                    {/* Ambient Glows */}
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
                    
                    <div className="p-7 flex flex-col h-full space-y-6 relative z-10 text-white">
                        {/* Header: Identity & Status */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-[20px] backdrop-blur-xl border border-white/10 shadow-inner transition-all", currentHealth.bg)}>
                                    <CategoryIcon className={cn("h-6 w-6 text-white")} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-semibold text-lg tracking-tight leading-tight group-hover:underline decoration-white/30">{budget.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className={cn("text-xs font-semibold uppercase tracking-[0.2em] text-white/50")}>
                                            {budget.subCategory ? `${budget.categories[0]} / ${budget.subCategory}` : currentHealth.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                                <ChevronRight className="h-5 w-5 text-white/60" />
                            </div>
                        </div>

                        {/* Middle: The Living Bar */}
                        <div className="space-y-3 flex-1">
                            <div className="flex justify-between items-end text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                                <span>Utilization</span>
                                <span className="tabular-nums text-white/80">{Math.min(progress, 100).toFixed(0)}%</span>
                            </div>
                            <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-white/20 z-20"
                                    style={{ left: `${Math.min(daysPassedPercentage, 100)}%` }}
                                />
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(progress, 100)}%` }}
                                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                    className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-1000 z-10", currentHealth.bar, currentHealth.glow)}
                                >
                                    <div className="absolute inset-0 opacity-20 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.3) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.3) 50%,rgba(255,255,255,.3) 75%,transparent 75%,transparent)', backgroundSize: '0.8rem 0.8rem' }} />
                                </motion.div>
                            </div>
                        </div>

                        {/* Footer: Projection & Numbers (Glass Inset) */}
                        <div className="space-y-4 bg-white/5 backdrop-blur-md p-4 rounded-[24px] border border-white/10 shadow-inner">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Residual</p>
                                    <p className={cn("text-xl font-semibold tracking-tighter tabular-nums text-white")}>
                                        {formatCurrency(remaining)}
                                    </p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Burn Runway</p>
                                    <div className="flex items-center justify-end gap-1.5">
                                        <span className={cn("text-xs font-semibold uppercase tracking-tight text-white")}>
                                            {daysToZero === Infinity ? '∞ Days' : `${daysToZero} Days`}
                                        </span>
                                        <Flame className={cn("h-3.5 w-3.5", daysToZero <= 5 ? "text-yellow-300 animate-pulse" : "text-white/20")} />
                                    </div>
                                </div>
                            </div>

                            {/* Safe Limit Inset */}
                            {remaining > 0 && (
                                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-xs font-semibold text-white/40 uppercase tracking-[0.2em]">Safe Daily Quota</span>
                                    <span className="text-sm font-semibold text-white tabular-nums tracking-tighter">
                                        {formatCurrency(safeDailyLimit)}
                                    </span>
                                </div>
                            )}
                        </div>
                                    </div>
                                </Card>
                            </button>
                        </motion.div>
                    );
                    };
