'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn, formatCurrency } from '@/lib/utils';
import { Rocket, Car, Home, Gift, Briefcase, GraduationCap, Plane, Computer, LucideIcon, CalendarClock } from 'lucide-react';
import { formatDistanceToNowStrict, parseISO, isPast } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { useUI } from '@/components/ui-provider';

const goalIcons: { [key: string]: LucideIcon } = {
    Rocket, Car, Home, Gift, Briefcase, GraduationCap, Plane, Computer
};

export const GoalList = ({ goals }: { goals: any[] }) => {
    const { openEditGoalModal } = useUI();

    return (
        <div className="space-y-4">
            {goals.map(goal => {
                const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                const Icon = goalIcons[goal.icon] || Rocket;
                const targetDate = parseISO(goal.targetDate);
                const isOverdue = isPast(targetDate) && progress < 100;
                
                let timeLeftText = '';
                if(progress < 100) {
                    if (isOverdue) {
                        timeLeftText = `Terlampaui ${formatDistanceToNowStrict(targetDate, { locale: dateFnsLocaleId })}`;
                    } else {
                        timeLeftText = `${formatDistanceToNowStrict(targetDate, { addSuffix: true, locale: dateFnsLocaleId })}`;
                    }
                }

                return (
                    <button
                        key={goal.id}
                        type="button"
                        onClick={() => openEditGoalModal(goal)}
                        className={cn(
                            'w-full text-left rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/40'
                        )}
                        aria-label={`Edit target ${goal.name}`}
                    >
                        <Card>
                            <CardHeader className="flex-row items-start gap-4 space-y-0 pb-2">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className='flex-1'>
                                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                                    {timeLeftText && (
                                        <div className={cn("flex items-center gap-1.5 text-xs mt-1", isOverdue ? "text-destructive" : "text-muted-foreground")}>
                                            <CalendarClock className="h-3.5 w-3.5" />
                                            <span>{timeLeftText}</span>
                                        </div>
                                    )}
                                </div>
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
                    </button>
                )
            })}
        </div>
    );
}
