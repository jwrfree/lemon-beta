
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, PlusCircle, Rocket } from 'lucide-react';
import { useApp } from '@/components/app-provider';
import { GoalList } from '@/components/goal-list';
import { useUI } from '@/components/ui-provider';

export default function GoalsPage() {
    const router = useRouter();
    const { goals } = useApp();
    const { setIsGoalModalOpen } = useUI();

    return (
        <div className="flex flex-col h-full bg-muted">
            <header className="h-16 flex items-center relative px-4 shrink-0 border-b bg-background sticky top-0 z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4"
                    onClick={() => router.back()}
                    aria-label="Kembali"
                >
                    <ChevronLeft className="h-6 w-6" strokeWidth={1.75} />
                    <span className="sr-only">Kembali</span>
                </Button>
                <h1 className="text-xl font-bold text-center w-full">Target Keuangan</h1>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4"
                    onClick={() => setIsGoalModalOpen(true)}
                    aria-label="Tambah target baru"
                >
                    <PlusCircle className="h-6 w-6" strokeWidth={1.75} />
                    <span className="sr-only">Tambah target baru</span>
                </Button>
            </header>
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
