
'use client';

import { useApp } from '@/components/app-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn, formatCurrency } from '@/lib/utils';
import { Rocket, Car, Home, Gift, Briefcase, GraduationCap, Plane, Computer, LucideIcon } from 'lucide-react';

const goalIcons: { [key: string]: LucideIcon } = {
    Rocket, Car, Home, Gift, Briefcase, GraduationCap, Plane, Computer
};

export const GoalList = ({ goals }: { goals: any[] }) => {
    const { openEditGoalModal } = useApp();

    return (
        <div className="space-y-4">
            {goals.map(goal => {
                const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                const Icon = goalIcons[goal.icon] || Rocket;

                return (
                    <Card key={goal.id} className="cursor-pointer" onClick={() => openEditGoalModal(goal)}>
                        <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <Icon className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-lg">{goal.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                             <div className="flex justify-between items-baseline">
                                <span className="text-2xl font-bold text-primary">{formatCurrency(goal.currentAmount)}</span>
                                <span className="text-sm text-muted-foreground">/ {formatCurrency(goal.targetAmount)}</span>
                            </div>
                            <div className='space-y-1'>
                                <Progress value={progress} indicatorClassName="bg-primary" />
                                <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}% tercapai</p>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    );
}
