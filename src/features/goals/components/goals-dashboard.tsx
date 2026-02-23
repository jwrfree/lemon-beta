'use client';

import { useGoals } from '@/features/goals/hooks/use-goals';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { FAB } from '@/components/ui/fab';
import { Plus, Target, LoaderCircle } from 'lucide-react';
import { GoalList } from './goal-list';

export const GoalsDashboard = () => {
    const { goals, isLoading } = useGoals();
    const { setIsGoalModalOpen } = useUI();

    if (isLoading) {
        return (
            <div className="flex flex-col h-full items-center justify-center py-12">
                <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (goals.length === 0) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-center p-8 animate-in fade-in duration-500 min-h-[400px]">
                <div className="max-w-[320px] w-full p-10 bg-card rounded-card-premium shadow-2xl text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] -rotate-12">
                        <Target className="h-40 w-40" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="p-5 bg-primary/10 rounded-card-icon mb-6">
                            <Target className="h-10 w-10 text-primary" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-semibold tracking-tighter mb-3">Belum Ada Target</h2>
                        <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-8">
                            Mulailah menabung untuk impianmu hari ini.
                        </p>
                        <Button onClick={() => setIsGoalModalOpen(true)} className="w-full rounded-full h-12 shadow-lg shadow-primary/20 active:scale-95 transition-all font-semibold text-xs uppercase tracking-widest">
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Target Baru
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-in slide-in-from-bottom-2 duration-500 fade-in pb-24">
            {/* Summary Cards could go here */}

            {/* List */}
            <div>
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="label-xs">Daftar Impian</h2>
                    <Button onClick={() => setIsGoalModalOpen(true)} variant="ghost" size="sm" className="h-8 rounded-full text-label uppercase hover:bg-primary/10 hover:text-primary">
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Tambah
                    </Button>
                </div>
                <GoalList goals={goals} />
            </div>

            {/* Contextual FAB */}
            <FAB onClick={() => setIsGoalModalOpen(true)} label="Tambah target" />
        </div>
    );
};

