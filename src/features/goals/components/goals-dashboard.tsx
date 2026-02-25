'use client';

import { useGoals } from '@/features/goals/hooks/use-goals';
import { useUI } from '@/components/ui-provider';
import { Button } from '@/components/ui/button';
import { FAB } from '@/components/ui/fab';
import { Plus, Target, LoaderCircle } from 'lucide-react';
import { GoalList } from './goal-list';
import { EmptyState } from '@/components/empty-state';

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
            <div className="flex flex-col h-full min-h-[400px] animate-in fade-in duration-500">
                <EmptyState
                    icon={Target}
                    title="Belum Ada Target"
                    description="Mulai menabung untuk impianmu hari ini. Tetapkan target dan raih satu per satu."
                    actionLabel="Buat Target Baru"
                    onAction={() => setIsGoalModalOpen(true)}
                    variant="default"
                />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 animate-in slide-in-from-bottom-2 duration-500 fade-in pb-24">
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

