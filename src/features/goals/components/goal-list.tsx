'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn, formatCurrency } from '@/lib/utils';
import { Rocket, Car, Home, Gift, Briefcase, GraduationCap, Plane, Computer, LucideIcon, CalendarClock } from 'lucide-react';
import { formatDistanceToNowStrict, parseISO, isPast } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { useUI } from '@/components/ui-provider';
import type { Goal } from '@/types/models';

const goalIcons: { [key: string]: LucideIcon } = {
    Rocket, Car, Home, Gift, Briefcase, GraduationCap, Plane, Computer
};

export const GoalList = ({ goals }: { goals: Goal[] }) => {
    const { openEditGoalModal } = useUI();

    return (
        <div className="space-y-4">
            {goals.map(goal => {
                const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                const Icon = (goal.icon && goalIcons[goal.icon]) || Rocket;
                const targetDate = goal.targetDate ? parseISO(goal.targetDate) : new Date();
                const isOverdue = goal.targetDate ? (isPast(targetDate) && progress < 100) : false;

                let timeLeftText = '';
                if (goal.targetDate && progress < 100) {
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
                            'w-full text-left rounded-[32px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 transition-all active:scale-[0.98]'
                        )}
                        aria-label={`Edit target ${goal.name}`}
                    >
                        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-[32px] overflow-hidden bg-card transition-all duration-500">
                            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2 p-6">
                                <div className="p-3.5 bg-primary/5 rounded-2xl shadow-inner text-primary">
                                    <Icon className="h-6 w-6" strokeWidth={2} />
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <CardTitle className="text-lg font-semibold tracking-tight truncate">{goal.name}</CardTitle>
                                    {timeLeftText && (
                                        <div className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mt-1", isOverdue ? "text-rose-600" : "text-muted-foreground/60")}>
                                            <CalendarClock className="h-3.5 w-3.5" />
                                            <span>{timeLeftText}</span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 p-6 pt-2">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-1">Terkumpul</span>
                                            <span className="text-2xl font-bold tracking-tighter tabular-nums text-primary">{formatCurrency(goal.currentAmount)}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-1 text-right">Target</span>
                                            <span className="text-sm font-semibold tracking-tight text-foreground/60">{formatCurrency(goal.targetAmount)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <div className="relative h-2.5 w-full bg-muted/50 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                                className="absolute inset-y-0 left-0 rounded-full bg-primary shadow-[0_0_15px_rgba(13,148,136,0.3)]"
                                            />
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground/60 text-right uppercase tracking-[0.2em]">{Math.round(progress)}% tercapai</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </button>
                )
            })}
        </div>
    );
}

