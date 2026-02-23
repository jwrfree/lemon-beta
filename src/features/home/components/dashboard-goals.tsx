
'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { Target, Plus } from 'lucide-react';
import type { Goal } from '@/types/models';
import { useUI } from '@/components/ui-provider';

interface DashboardGoalsProps {
    goals: Goal[];
}

export const DashboardGoals = ({ goals }: DashboardGoalsProps) => {
    const { setIsGoalModalOpen, setGoalToEdit } = useUI();

    // Filter active goals (not 100% complete) and sort by closest to completion
    const activeGoals = goals
        .filter(g => (g.currentAmount || 0) < g.targetAmount)
        .sort((a, b) => {
            const aPercent = (a.currentAmount || 0) / a.targetAmount;
            const bPercent = (b.currentAmount || 0) / b.targetAmount;
            return bPercent - aPercent;
        })
        .slice(0, 3);

    return (
        <Card className="border-none shadow-card bg-card rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" /> Target
                    </CardTitle>
                    <CardDescription className="text-xs">Tabungan prioritas</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                    <Link href="/goals">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {activeGoals.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground bg-muted/30 rounded-lg border border-dashed border-muted">
                        <p>Belum ada target aktif.</p>
                        <Button
                            variant="link"
                            size="sm"
                            className="px-0 h-auto text-xs mt-1"
                            onClick={() => {
                                setGoalToEdit(null);
                                setIsGoalModalOpen(true);
                            }}
                        >
                            Buat Target Baru
                        </Button>
                    </div>
                ) : (
                    activeGoals.map(goal => {
                        const percent = Math.min(((goal.currentAmount || 0) / goal.targetAmount) * 100, 100);

                        return (
                            <div key={goal.id} className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="font-medium truncate max-w-[120px]">{goal.name}</span>
                                    <span className="text-muted-foreground tabular-nums">
                                        {formatCurrency(goal.currentAmount || 0)} <span className="text-xs text-muted-foreground/60">/ {formatCurrency(goal.targetAmount)}</span>
                                    </span>
                                </div>
                                <Progress value={percent} className="h-2" />
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
};

