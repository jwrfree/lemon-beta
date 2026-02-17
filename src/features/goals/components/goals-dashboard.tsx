'use client';

import { useGoals } from '@/features/goals/hooks/use-goals';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
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
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                    <Target className="h-12 w-12 text-primary" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-medium tracking-tight">Belum Ada Target</h2>
                <p className="text-muted-foreground mt-2 mb-8 max-w-xs">Mulailah menabung untuk impianmu hari ini.</p>
                <Button onClick={() => setIsGoalModalOpen(true)} size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-5 w-5" />
                    Buat Target Baru
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 animate-in slide-in-from-bottom-2 duration-500 fade-in pb-24">
            {/* Summary Cards could go here */}

            {/* List */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground px-1">Daftar Impian</h2>
                    <Button onClick={() => setIsGoalModalOpen(true)} variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-medium uppercase tracking-widest hover:bg-primary/10 hover:text-primary">
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Tambah
                    </Button>
                </div>
                <GoalList goals={goals} />
            </div>

            {/* Contextual FAB */}
            <div className="fixed bottom-24 right-6 z-40 md:bottom-8 md:right-8 lg:hidden">
                <Button
                    onClick={() => setIsGoalModalOpen(true)}
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-lg shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 hover:scale-110 transition-transform active:scale-95"
                    aria-label="Tambah target"
                >
                    <Plus className="h-7 w-7" />
                </Button>
            </div>
        </div>
    );
};

