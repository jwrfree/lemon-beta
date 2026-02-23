
'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, cn } from '@/lib/utils';
import { ChevronRight, AlertCircle } from 'lucide-react';
import type { Budget } from '@/types/models';

interface DashboardBudgetStatusProps {
    budgets: Budget[];
}

export const DashboardBudgetStatus = ({ budgets }: DashboardBudgetStatusProps) => {
    // Sort by percentage spent (highest first) to show critical budgets
    const sortedBudgets = [...budgets].sort((a, b) => {
        const aPercent = ((a.spent ?? 0) / a.targetAmount);
        const bPercent = ((b.spent ?? 0) / b.targetAmount);
        return bPercent - aPercent;
    }).slice(0, 3);

    return (
        <Card className="border-none shadow-card bg-card rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-sm font-medium">Status Anggaran</CardTitle>
                    <CardDescription className="text-xs">Monitoring penggunaan budget bulanan</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                    <Link href="/budgeting">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {sortedBudgets.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-border">
                        <p>Belum ada anggaran dibuat.</p>
                        <Button variant="link" size="sm" asChild className="px-0 h-auto text-xs mt-1">
                            <Link href="/budgeting">Buat Anggaran</Link>
                        </Button>
                    </div>
                ) : (
                    sortedBudgets.map(budget => {
                        const spent = budget.spent ?? 0;
                        const percent = Math.min((spent / budget.targetAmount) * 100, 100);
                        const isOver = spent > budget.targetAmount;
                        const isWarning = (percent > 80) && !isOver;

                        return (
                            <div key={budget.id} className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="font-medium flex items-center gap-1.5">
                                        {budget.name}
                                        {isOver && <AlertCircle className="h-3 w-3 text-destructive" />}
                                    </span>
                                    <span className={cn(
                                        "text-xs",
                                        isOver ? "text-destructive font-medium" : "text-muted-foreground"
                                    )}>
                                        {formatCurrency(spent)} <span className="text-xs text-muted-foreground/60">/ {formatCurrency(budget.targetAmount)}</span>
                                    </span>
                                </div>
                                <Progress
                                    value={percent}
                                    className="h-2"
                                    indicatorClassName={cn(
                                        isOver ? "bg-destructive" :
                                            isWarning ? "bg-warning" : "bg-success"
                                    )}
                                />
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
};

