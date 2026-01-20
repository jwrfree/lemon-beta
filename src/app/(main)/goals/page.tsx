
'use client';

import { Button } from '@/components/ui/button';
import { PlusCircle, Rocket } from 'lucide-react';
import { GoalList } from '@/features/goals/components/goal-list';
import { useUI } from '@/components/ui-provider';
import { PageHeader } from '@/components/page-header';
import { useGoals } from '@/features/goals/hooks/use-goals';

export default function GoalsPage() {
    const { goals } = useGoals();
    const { setIsGoalModalOpen } = useUI();

    return (
        <div className="flex flex-col h-full bg-muted">
            <PageHeader
                title="Target Keuangan"
                actionButton={{
                    icon: PlusCircle,
                    label: 'Tambah target baru',
                    onClick: () => setIsGoalModalOpen(true),
                }}
            />
            <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-20">
                {goals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center pt-16">
                        <div className="p-3 bg-primary/10 rounded-full mb-3">
                            <Rocket className="h-8 w-8 text-primary -rotate-45" strokeWidth={1.5} />
                        </div>
                        <h2 className="text-xl font-bold">Wujudkan Impian Finansial Anda</h2>
                        <p className="text-muted-foreground mt-2 mb-6 max-w-sm">Mulai tabung untuk tujuan besarmu, dari dana darurat hingga gadget impian.</p>
                        <Button onClick={() => setIsGoalModalOpen(true)}>
                            <PlusCircle className="mr-2 h-5 w-5" strokeWidth={1.75} />
                            Buat Target Baru
                        </Button>
                    </div>
                ) : (
                    <GoalList goals={goals} />
                )}
            </main>
        </div>
    );
};
