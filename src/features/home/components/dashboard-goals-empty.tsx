'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Plus } from 'lucide-react';
import { useUI } from '@/components/ui-provider';

export const DashboardGoalsEmpty = () => {
    const { setIsGoalModalOpen } = useUI();

    return (
        <Card className="border-border rounded-lg bg-card shadow-card overflow-hidden relative">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium tracking-tight">Target Keuangan</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground/70">Wujudkan impianmu jadi nyata</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center justify-center py-8 text-center relative z-10">
                <div className="p-4 bg-primary/10 rounded-lg mb-6">
                    <Target className="h-8 w-8 text-primary" strokeWidth={1.5} />
                </div>

                <h3 className="text-base font-medium tracking-tight mb-2">Mulai Target Pertama</h3>
                <p className="text-xs text-muted-foreground max-w-[220px] mb-6 leading-relaxed">
                    Wujudkan impianmu dengan target finansial yang terukur dan terarah.
                </p>

                <Button 
                    onClick={() => setIsGoalModalOpen(true)} 
                    size="sm" 
                    variant="outline" 
                    className="gap-2 rounded-lg h-9 text-xs font-medium w-full max-w-[160px]"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Buat Target
                </Button>
            </CardContent>
        </Card>
    );
};
