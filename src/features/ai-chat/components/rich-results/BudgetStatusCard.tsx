'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useFinancialContext } from '@/hooks/use-financial-context';
import { Skeleton } from '@/components/ui/skeleton';
import { WarningCircle } from '@phosphor-icons/react';

export const BudgetStatusCard = () => {
    const { context, isLoading } = useFinancialContext();
    
    if (isLoading) {
        return <Skeleton className="h-32 w-full rounded-2xl" />;
    }

    if (!context?.budgets || context.budgets.length === 0) return null;

    const sortedBudgets = [...context.budgets].sort((a, b) => b.percent - a.percent).slice(0, 3);

    return (
        <Card className="mt-4 bg-background border border-border/40 shadow-soft rounded-2xl overflow-hidden motion-surface">
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Status Anggaran</span>
                </div>
                
                <div className="space-y-4">
                    {sortedBudgets.map((budget, idx) => {
                        const isOver = budget.percent >= 100;
                        const isWarning = (budget.percent > 80) && !isOver;

                        return (
                            <div key={idx} className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="font-semibold flex items-center gap-1.5 text-foreground/80">
                                        {budget.name}
                                        {isOver && <WarningCircle size={12} weight="fill" className="text-destructive" />}
                                    </span>
                                    <span className={cn(
                                        "text-label font-semibold",
                                        isOver ? "text-destructive" : "text-muted-foreground/70"
                                    )}>
                                        {Math.round(budget.percent)}%
                                    </span>
                                </div>
                                <Progress
                                    value={budget.percent}
                                    className="h-1.5 bg-muted/50"
                                    indicatorClassName={cn(
                                        isOver ? "bg-destructive" :
                                            isWarning ? "bg-warning" : "bg-success"
                                    )}
                                />
                                <div className="flex justify-between text-label text-muted-foreground/40 font-semibold uppercase tracking-tighter">
                                    <span>{formatCurrency(budget.spent)} Terpakai</span>
                                    <span>Sisa {formatCurrency(Math.max(0, budget.limit - budget.spent))}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};
