'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Plus, Trophy } from 'lucide-react';
import { useUI } from '@/components/ui-provider';

export const DashboardGoalsEmpty = () => {
    const { setIsGoalModalOpen } = useUI();

    return (
        <Card className="border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12">
                <Trophy className="h-24 w-24" />
            </div>

            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold tracking-tight">Target Keuangan</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground/70">Wujudkan impianmu jadi nyata</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center py-8 text-center relative z-10">
                <div className="relative mb-6">
                    <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/10">
                        <Target className="h-8 w-8 text-orange-500" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white font-bold shadow-sm">
                        !
                    </div>
                </div>

                <h3 className="text-base font-bold tracking-tight mb-2">Apa Impianmu?</h3>
                <p className="text-xs text-muted-foreground max-w-[200px] mb-6 leading-relaxed">
                    Mulai dari dana darurat hingga liburan impian. Kami bantu kamu mencapainya lebih cepat.
                </p>

                <Button 
                    onClick={() => setIsGoalModalOpen(true)} 
                    size="sm" 
                    variant="outline" 
                    className="gap-2 rounded-xl h-9 text-xs font-bold border-orange-500/20 hover:bg-orange-500/5 hover:text-orange-500 transition-colors w-full max-w-[160px]"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Buat Target Baru
                </Button>
            </CardContent>
        </Card>
    );
};