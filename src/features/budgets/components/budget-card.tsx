'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/features/transactions/hooks/use-categories';
import { cn, formatCurrency, triggerHaptic } from '@/lib/utils';
import { differenceInDays, startOfMonth } from 'date-fns';
import { Flame, AlertCircle, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import type { Budget, Transaction } from '@/types/models';

export const BudgetCard = ({ budget, transactions }: { budget: Budget, transactions: Transaction[] }) => {
    const { getCategoryVisuals } = useCategories();
    const router = useRouter();

    // 1. Core Logic: Spent Calculation
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

    // 2. Advanced Logic: Burn Rate Projection (Pure Math)
    const projection = useMemo(() => {
        const today = new Date();
        const start = startOfMonth(today);
        const daysElapsed = differenceInDays(today, start) + 1;
        
        if (spent === 0 || daysElapsed === 0) return { status: 'stable', daysToZero: Infinity };
        
        const dailyRate = spent / daysElapsed;
        const daysToZero = Math.floor(remaining / dailyRate);
        
        let status: 'stable' | 'warning' | 'critical' = 'stable';
        if (daysToZero <= 3 && remaining > 0) status = 'critical';
        else if (daysToZero <= 7) status = 'warning';
        
        return { status, daysToZero, dailyRate };
    }, [spent, remaining]);

    // 3. Visual Configuration
    const healthStyles = {
        stable: {
            bar: 'bg-primary',
            glow: 'shadow-[0_0_15px_rgba(13,148,136,0.3)]',
            text: 'text-primary',
            bg: 'bg-primary/5',
            label: 'Aman'
        },
        warning: {
            bar: 'bg-yellow-400',
            glow: 'shadow-[0_0_15px_rgba(253,224,71,0.4)]',
            text: 'text-yellow-600 dark:text-yellow-400',
            bg: 'bg-yellow-400/10',
            label: 'Mulai Menipis'
        },
        critical: {
            bar: 'bg-rose-500',
            glow: 'shadow-[0_0_15px_rgba(244,63,94,0.4)]',
            text: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-500/10',
            label: 'Bahaya'
        },
        over: {
            bar: 'bg-rose-600',
            glow: 'shadow-[0_0_20px_rgba(225,29,72,0.5)]',
            text: 'text-rose-700 dark:text-rose-300',
            bg: 'bg-rose-600/20',
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
                <Card className="h-full overflow-hidden border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 premium-shadow">
                    <div className="p-6 flex flex-col h-full space-y-6">
                        {/* Header: Identity & Status */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn("p-3 rounded-2xl border transition-colors", currentHealth.bg, "border-black/5 dark:border-white/5")}>
                                    <CategoryIcon className={cn("h-6 w-6", currentHealth.text)} />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="font-bold text-lg tracking-tight leading-tight group-hover:text-primary transition-colors">{budget.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border-zinc-100 dark:border-zinc-800">
                                            {budget.categories.length} Kategori
                                        </Badge>
                                        <span className={cn("text-[10px] font-bold uppercase tracking-widest", currentHealth.text)}>
                                            {currentHealth.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="h-5 w-5 text-zinc-400" />
                            </div>
                        </div>

                        {/* Middle: The Living Bar */}
                        <div className="space-y-3 flex-1">
                            <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400">
                                <span>Progres Belanja</span>
                                <span>{Math.min(progress, 100).toFixed(0)}%</span>
                            </div>
                            <div className="relative h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(progress, 100)}%` }}
                                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                    className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-1000", currentHealth.bar, currentHealth.glow)}
                                />
                            </div>
                        </div>

                        {/* Footer: Projection & Numbers */}
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Sisa Anggaran</p>
                                <p className={cn("text-xl font-black tracking-tighter tabular-nums", remaining < 0 ? "text-rose-600" : "text-zinc-900 dark:text-zinc-100")}>
                                    {formatCurrency(remaining)}
                                </p>
                            </div>
                            <div className="text-right space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Prediksi</p>
                                <div className="flex items-center justify-end gap-1.5">
                                    {remaining > 0 ? (
                                        <>
                                            <span className={cn("text-xs font-bold", currentHealth.text)}>
                                                {projection.daysToZero === Infinity ? '∞' : `${projection.daysToZero} Hari Lagi`}
                                            </span>
                                            <Flame className={cn("h-3.5 w-3.5", projection.daysToZero <= 5 ? "text-orange-500 animate-pulse" : "text-zinc-300")} />
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                                            <AlertCircle className="h-3.5 w-3.5" />
                                            <span className="text-xs font-bold">Terlampaui</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </button>
        </motion.div>
    );
};
