'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useFinancialContext } from '@/hooks/use-financial-context';
import { Skeleton } from '@/components/ui/skeleton';
import { WarningCircle } from '@/lib/icons';
import { EmptyState } from '@/components/empty-state';

export const BudgetStatusCard = () => {
    const { context, isLoading } = useFinancialContext();
    
    if (isLoading) {
        return <Skeleton className="h-32 w-full rounded-card" />;
    }

    if (!context?.budgets || context.budgets.length === 0) {
        return (
            <EmptyState
                title="Belum ada budget"
                description="Buat budget dulu supaya Lemon Coach bisa menampilkan status pemakaianmu."
                icon={WarningCircle}
                variant="filter"
                className="px-0 pt-0 md:min-h-0"
            />
        );
    }

    const sortedBudgets = [...context.budgets].sort((a, b) => b.percent - a.percent).slice(0, 3);

    return (
        <Card variant="ai" className="mt-4">
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-label-sm font-bold uppercase tracking-widest text-muted-foreground/50">Budget Status</span>
                </div>
                
                <div className="space-y-4">
                    {sortedBudgets.map((budget, idx) => {
                        const isOver = budget.percent >= 100;
                        const isWarning = (budget.percent > 80) && !isOver;
                        const dayOfMonth = new Date().getDate();
                        const dailySpend = budget.spent / Math.max(dayOfMonth, 1);
                        const daysLeft = dailySpend > 0 ? Math.floor((budget.limit - budget.spent) / dailySpend) : 99;

                        return (
                            <div key={idx} className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="font-semibold flex items-center gap-1.5 text-foreground/80">
                                        {budget.name}
                                        {isOver && <WarningCircle size={12} weight="regular" className="text-destructive" />}
                                    </span>
                                    <span className={cn(
                                        "text-label font-semibold tracking-widest uppercase",
                                        isOver ? "text-destructive" : "text-muted-foreground/40"
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
                                <div className="flex justify-between text-label-sm font-semibold text-muted-foreground/30 uppercase tracking-widest">
                                    <span>{formatCurrency(budget.spent)} Pakai</span>
                                    <span>Sisa {formatCurrency(Math.max(0, budget.limit - budget.spent))}</span>
                                </div>
                                
                                {!isOver && budget.percent > 30 && (
                                    <p className="text-label-sm font-medium text-muted-foreground/25 italic leading-none">
                                        Estimasi habis dalam {Math.max(1, daysLeft)} hari lagi
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};


