
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, cn } from '@/lib/utils';
import { CaretRight, Target, WarningCircle } from '@phosphor-icons/react';
import type { Budget } from '@/types/models';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/empty-state';

interface DashboardBudgetStatusProps {
    budgets: Budget[];
}

export const DashboardBudgetStatus = ({ budgets }: DashboardBudgetStatusProps) => {
    const router = useRouter();
    // Sort by percentage spent (highest first) to show critical budgets
    const sortedBudgets = [...budgets].sort((a, b) => {
        const aPercent = ((a.spent ?? 0) / a.targetAmount);
        const bPercent = ((b.spent ?? 0) / b.targetAmount);
        return bPercent - aPercent;
    }).slice(0, 3);

    return (
        <Card className="rounded-card bg-card/98 shadow-[0_18px_36px_-28px_rgba(15,23,42,0.18)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-sm font-medium">Status Anggaran</CardTitle>
                    <CardDescription className="text-xs">Monitoring penggunaan budget bulanan</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                    <Link href="/budgeting">
                        <CaretRight size={16} weight="regular" className="text-muted-foreground" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {sortedBudgets.length === 0 ? (
                    <EmptyState
                        title="Atur Anggaran"
                        description="Belum ada anggaran dibuat untuk memantau pengeluaran kamu."
                        icon={Target}
                        actionLabel="Buat Anggaran"
                        onAction={() => router.push('/budgeting')}
                        className="pt-0 md:min-h-[200px]"
                    />
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
                                        {isOver && <WarningCircle size={12} weight="regular" className="text-destructive" />}
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


