'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn, formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Rocket, Car, Home, Gift, Briefcase, GraduationCap, Plane, Computer, LucideIcon, CalendarClock } from 'lucide-react';
import { formatDistanceToNowStrict, parseISO, isPast } from 'date-fns';
import { id as dateFnsLocaleId } from 'date-fns/locale';
import { useUI } from '@/components/ui-provider';
import type { Goal } from '@/types/models';

import { getVisualDNA } from '@/lib/visual-dna';

const goalIcons: { [key: string]: LucideIcon } = {
    Rocket, Car, Home, Gift, Briefcase, GraduationCap, Plane, Computer
};

const getGoalColor = (iconName: string): string => {
    const map: Record<string, string> = {
        Rocket: 'teal',
        Car: 'orange',
        Home: 'indigo',
        Gift: 'pink',
        Briefcase: 'blue',
        GraduationCap: 'purple',
        Plane: 'cyan',
        Computer: 'emerald'
    };
    return map[iconName] || 'teal';
};

export const GoalList = ({ goals }: { goals: Goal[] }) => {
    const { openEditGoalModal } = useUI();

    return (
        <div className="space-y-5">
            {goals.map(goal => {
                const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                const Icon = (goal.icon && goalIcons[goal.icon]) || Rocket;
                const dna = getVisualDNA(getGoalColor(goal.icon || 'Rocket'));
                
                const targetDate = goal.targetDate ? parseISO(goal.targetDate) : new Date();
                const isOverdue = goal.targetDate ? (isPast(targetDate) && progress < 100) : false;

                let timeLeftText = '';
                if (goal.targetDate && progress < 100) {
                    if (isOverdue) {
                        timeLeftText = `Overdue ${formatDistanceToNowStrict(targetDate, { locale: dateFnsLocaleId })}`;
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
                            'w-full text-left rounded-card-premium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10 transition-all active:scale-[0.98]'
                        )}
                        aria-label={`Edit target ${goal.name}`}
                    >
                        <Card 
                            className="border-none shadow-2xl rounded-card-premium overflow-hidden transition-all duration-500 relative"
                            style={{ 
                                background: dna.gradient,
                                boxShadow: `0 20px 40px -12px ${dna.ambient.replace('0.2', '0.4')}` 
                            }}
                        >
                            {/* Ambient Decor */}
                            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl"></div>

                            <CardHeader className="flex-row items-center gap-4 space-y-0 pb-2 p-7 relative z-10 text-white">
                                <div className="p-3.5 bg-white/10 backdrop-blur-xl rounded-card-icon shadow-inner border border-white/10">
                                    <Icon className="h-6 w-6 text-white" strokeWidth={2.5} />
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <CardTitle className="text-lg font-semibold tracking-tight truncate">{goal.name}</CardTitle>
                                    {timeLeftText && (
                                        <div className={cn("flex items-center gap-1.5 label-xs mt-1.5", isOverdue ? "text-rose-300" : "text-white/50")}>
                                            <CalendarClock className="h-3.5 w-3.5" />
                                            <span>{timeLeftText}</span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            
                            <CardContent className="space-y-6 p-7 pt-2 relative z-10 text-white">
                                <div className="space-y-5">
                                    <div className="bg-white/5 backdrop-blur-md rounded-card-glass p-4 border border-white/10 shadow-inner flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="label-xs text-white/40 mb-1.5">Accumulated</span>
                                            <span className="text-2xl font-semibold tracking-tighter tabular-nums text-white">{formatCurrency(goal.currentAmount)}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="label-xs text-white/40 mb-1.5 text-right">Target Goal</span>
                                            <span className="text-sm font-semibold tracking-tight text-white/70">{formatCurrency(goal.targetAmount)}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="relative h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                                className="absolute inset-y-0 left-0 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                                            />
                                        </div>
                                        <p className="label-xs text-white/40 text-right">{Math.round(progress)}% Completion</p>
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

