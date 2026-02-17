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

export const BudgetCard = ({ budget, transactions }: { budget: Budget, transactions: Transaction[] }) => {
    const { getCategoryVisuals } = useCategories();
    const router = useRouter();

    // 1. Core Logic
    const spent = useMemo(() => {
        return transactions
            .filter(t =>
                t.type === 'expense' &&
                budget.categories.includes(t.category)
            )
            .reduce((acc, t) => acc + t.amount, 0);
    }, [transactions, budget.categories]);

    const remaining = budget.targetAmount - spent;
    const progress = (spent / budget.targetAmount) * 100;

    const now = new Date();
    const daysInMonthValue = daysInMonth(now);
    const daysLeft = daysInMonthValue - now.getDate() + 1;
    const daysPassedPercentage = (now.getDate() / daysInMonthValue) * 100;

    // 2. Burn Rate & Safe Limit Logic
    const projection = useMemo(() => {
        const today = new Date();
        const start = startOfMonth(today);
        const daysElapsed = differenceInDays(today, start) + 1;

        if (spent === 0 || daysElapsed === 0) return { status: 'stable' as const, daysToZero: Infinity };

        const dailyRate = spent / daysElapsed;
        const daysToZero = Math.floor(remaining / dailyRate);

        let status: 'stable' | 'warning' | 'critical' = 'stable';
        if (daysToZero <= 3 && remaining > 0) status = 'critical';
        else if (daysToZero <= 7) status = 'warning';

        return { status, daysToZero, dailyRate };
    }, [spent, remaining]);

    const safeDailyLimit = remaining > 0 && daysLeft > 0 ? remaining / daysLeft : 0;

    // 3. Visual Configuration (Minimalist Weight)
    const healthStyles = {
        stable: {
            bar: 'bg-primary',
            glow: 'shadow-[0_0_15px_rgba(13,148,136,0.2)]',
            text: 'text-primary',
            bg: 'bg-primary/5',
            label: 'Aman'
        },
        warning: {
            bar: 'bg-yellow-400',
            glow: 'shadow-[0_0_15px_rgba(253,224,71,0.3)]',
            text: 'text-yellow-600 dark:text-yellow-400',
            bg: 'bg-yellow-400/5',
            label: 'Mulai Menipis'
        },
        critical: {
            bar: 'bg-rose-500',
            glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]',
            text: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-500/5',
            label: 'Bahaya'
        },
        over: {
            bar: 'bg-rose-600',
            glow: 'shadow-[0_0_20px_rgba(225,29,72,0.4)]',
            text: 'text-rose-700 dark:text-rose-300',
            bg: 'bg-rose-600/10',
            label: 'Overbudget'
        }
    };

    const currentHealth = remaining < 0 ? healthStyles.over : healthStyles[projection.status];

    const firstCategory = budget.categories[0] || 'Lainnya';
    const visuals = getCategoryVisuals(firstCategory);
    const CategoryIcon = visuals.icon as React.ElementType;

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
                <Card className="h-full overflow-hidden border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm hover:shadow-lg transition-all duration-500 premium-shadow">
                    <div className="p-6 flex flex-col h-full space-y-6">
                        {/* Header: Identity & Status */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-2xl border transition-colors", currentHealth.bg, "border-black/5 dark:border-white/5")}>
                                    <CategoryIcon className={cn("h-6 w-6", currentHealth.text)} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-medium text-lg tracking-tight leading-tight group-hover:text-primary transition-colors">{budget.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[9px] font-normal uppercase tracking-widest px-2 py-0.5 rounded-lg border-zinc-100 dark:border-zinc-800">
                                            {budget.categories.length} Kategori
                                        </Badge>
                                        <span className={cn("text-[10px] font-medium uppercase tracking-widest", currentHealth.text)}>
                                            {currentHealth.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="h-5 w-5 text-zinc-400" />
                            </div>
                        </div>

                        {/* Middle: The Living Bar with Markers */}
                        <div className="space-y-3 flex-1">
                            <div className="flex justify-between items-end text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-400">
                                <span>Progres Belanja</span>
                                <span>{Math.min(progress, 100).toFixed(0)}%</span>
                            </div>
                            <div className="relative h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="absolute top-0 bottom-0 w-0.5 bg-zinc-400/30 z-20"
                                    style={{ left: `${Math.min(daysPassedPercentage, 100)}%` }}
                                />
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(progress, 100)}%` }}
                                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                    className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-1000 z-10", currentHealth.bar, currentHealth.glow)}
                                >
                                    <div className="absolute inset-0 opacity-10 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.2) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.2) 50%,rgba(255,255,255,.2) 75%,transparent 75%,transparent)', backgroundSize: '0.8rem 0.8rem' }} />
                                </motion.div>
                            </div>
                            <div className="flex justify-between text-[8px] font-medium text-zinc-400/60 uppercase tracking-[0.2em] px-1">
                                <span>Start</span>
                                <span style={{ marginLeft: `${Math.max(0, Math.min(daysPassedPercentage - 15, 70))}%` }}>Hari ke-{now.getDate()}</span>
                                <span>End</span>
                            </div>
                        </div>

                        {/* Footer: Projection & Numbers */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-medium uppercase tracking-widest text-zinc-400">Status Saldo</p>
                                    <div className="flex flex-col">
                                        <p className={cn("text-xl font-medium tracking-tighter tabular-nums", remaining < 0 ? "text-rose-600" : "text-zinc-900 dark:text-zinc-100")}>
                                            {formatCurrency(remaining)}
                                        </p>
                                        <p className="text-[10px] font-normal text-zinc-400">
                                            Sisa dari {formatCurrency(budget.targetAmount)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[9px] font-medium uppercase tracking-widest text-zinc-400">Prediksi Habis</p>
                                    <div className="flex items-center justify-end gap-1.5">
                                        {remaining > 0 ? (
                                            <>
                                                <span className={cn("text-xs font-medium", currentHealth.text)}>
                                                    {projection.daysToZero === Infinity ? '∞' : `${projection.daysToZero} Hari Lagi`}
                                                </span>
                                                <Flame className={cn("h-3.5 w-3.5", projection.daysToZero <= 5 ? "text-orange-500 animate-pulse" : "text-zinc-300")} />
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                                                <AlertCircle className="h-3.5 w-3.5" />
                                                <span className="text-xs font-medium">Terlampaui</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Safe Limit Badge */}
                            {remaining > 0 && (
                                <div className={cn("flex items-center justify-between p-3 rounded-2xl border bg-zinc-50/50 dark:bg-black/20", "border-zinc-100 dark:border-zinc-800")}>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[9px] font-medium text-zinc-400 uppercase tracking-widest">Jatah Aman Per Hari</span>
                                    </div>
                                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
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
