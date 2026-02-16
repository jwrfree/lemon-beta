'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/features/transactions/hooks/use-categories';
import { cn, formatCurrency, daysInMonth } from '@/lib/utils';
import type { Budget, Transaction } from '@/types/models';

export const BudgetCard = ({ budget, transactions }: { budget: Budget, transactions: Transaction[] }) => {
    const { getCategoryVisuals } = useCategories();
    const router = useRouter();

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
    const daysLeft = daysInMonthValue - now.getDate();

    let progressBarColor = 'bg-primary';
    if (progress > 80 && progress <= 100) {
        progressBarColor = 'bg-amber-500';
    } else if (progress > 100) {
        progressBarColor = 'bg-destructive';
    }

    const firstCategory = budget.categories[0] || 'Lainnya';
    const visuals = getCategoryVisuals(firstCategory);
    const CategoryIcon = visuals.icon as React.ElementType;
    const { color, bgColor } = visuals;

    return (
        <motion.button
            type="button"
            onClick={() => router.push(`/budgeting/${budget.id}`)}
            whileHover={{ y: -4 }}
            className={cn(
                'w-full text-left rounded-xl group transition-all focus-visible:outline-none'
            )}
            aria-label={`Buka detail anggaran ${budget.name}`}
        >
            <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-xl overflow-hidden bg-card h-full">
                <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("flex-shrink-0 p-2.5 rounded-xl shadow-sm", bgColor)}>
                                <CategoryIcon className={cn("h-5 w-5", color)} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm tracking-tight leading-tight">{budget.name}</h3>
                                <p className="text-[11px] font-medium text-muted-foreground/70">{budget.categories.length} Kategori</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="bg-muted/50 text-[10px] font-bold uppercase tracking-tighter border-none">
                            {daysLeft} HARI LAGI
                        </Badge>
                    </div>

                    <div className="space-y-3">
                        <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progress, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={cn("h-full rounded-full shadow-sm", progressBarColor)}
                            />
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[11px] font-medium text-muted-foreground/70 mb-0.5">Sisa</p>
                                <p className={cn(
                                    "text-sm font-bold tracking-tight tabular-nums",
                                    remaining < 0 ? "text-destructive" : "text-teal-600 dark:text-teal-500"
                                )}>
                                    {remaining < 0 ? `-${formatCurrency(Math.abs(remaining))}` : formatCurrency(remaining)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] font-medium text-muted-foreground/70 mb-0.5">Target</p>
                                <p className="text-sm font-bold text-foreground/80 tracking-tight">{formatCurrency(budget.targetAmount)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.button>
    );
};
